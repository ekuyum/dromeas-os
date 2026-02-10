import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { fetchGmailEmails, refreshGmailToken } from '@/lib/gmail';
import { classifyEmail } from '@/lib/ai';

// Combined email pipeline cron job for Dromeas OS
// Step 1: Fetch new emails from Gmail
// Step 2: Process and classify with AI
// Runs every 5 minutes via Vercel cron

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const results = {
    step1_fetch: { success: false, fetched: 0, stored: 0, error: null as string | null },
    step2_process: { success: false, processed: 0, classified: 0, error: null as string | null },
    duration_ms: 0,
  };

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In production, return 401
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    // STEP 1: Fetch emails from Gmail
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      try {
        const tokenData = await refreshGmailToken(clientId, clientSecret, refreshToken);
        const emails = await fetchGmailEmails(tokenData.access_token, 20, 'is:inbox newer_than:1d');

        let storedCount = 0;
        for (const email of emails) {
          const { error } = await (supabase
            .from('email_inbox') as any)
            .upsert({
              message_id: email.message_id,
              thread_id: email.thread_id,
              sender: email.sender,
              recipient: email.recipient,
              subject: email.subject,
              body: email.body,
              snippet: email.snippet,
              received_at: email.received_at,
              processed: false,
              raw_data: email,
            }, {
              onConflict: 'message_id',
              ignoreDuplicates: true,
            });
          if (!error) storedCount++;
        }

        results.step1_fetch = { success: true, fetched: emails.length, stored: storedCount, error: null };
      } catch (error: any) {
        results.step1_fetch.error = error.message;
      }
    } else {
      results.step1_fetch.error = 'Gmail credentials not configured';
    }

    // STEP 2: Process unprocessed emails with AI
    const { data: unprocessedEmails, error: fetchError } = await supabase
      .from('email_inbox')
      .select('*')
      .eq('processed', false)
      .order('received_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      results.step2_process.error = fetchError.message;
    } else if (unprocessedEmails && unprocessedEmails.length > 0) {
      let classifiedCount = 0;

      for (const email of unprocessedEmails) {
        try {
          const classification = await classifyEmail(
            email.subject || '',
            email.body || email.snippet || '',
            email.sender || ''
          );

          // Store in ai_email_intel
          const { error: insertError } = await (supabase
            .from('ai_email_intel') as any)
            .upsert({
              email_id: email.message_id,
              thread_id: email.thread_id,
              sender: email.sender,
              subject: email.subject,
              snippet: email.snippet || email.body?.substring(0, 200),
              received_at: email.received_at,
              category: classification.category,
              priority: classification.priority,
              urgency: classification.urgency,
              summary: classification.summary,
              extracted_numbers: classification.extractedNumbers,
              extracted_dates: classification.extractedDates,
              suggested_actions: classification.suggestedActions,
              entities: classification.entities,
              sentiment: classification.sentiment,
              requires_response: classification.requiresResponse,
              confidence_score: classification.confidenceScore,
              status: 'new',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email_id' });

          if (!insertError) {
            classifiedCount++;
            // Mark as processed
            await (supabase
              .from('email_inbox') as any)
              .update({ processed: true, processed_at: new Date().toISOString() })
              .eq('id', email.id);
          }
        } catch (error) {
          console.error('Error classifying email:', error);
        }
      }

      results.step2_process = {
        success: true,
        processed: unprocessedEmails.length,
        classified: classifiedCount,
        error: null,
      };
    } else {
      results.step2_process = { success: true, processed: 0, classified: 0, error: null };
    }

    results.duration_ms = Date.now() - startTime;

    return NextResponse.json({
      success: results.step1_fetch.success || results.step2_process.success,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error: any) {
    results.duration_ms = Date.now() - startTime;
    return NextResponse.json({
      success: false,
      error: error.message,
      ...results,
    }, { status: 500 });
  }
}
