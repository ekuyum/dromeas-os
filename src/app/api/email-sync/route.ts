import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { classifyEmail, EmailClassification } from '@/lib/ai';

// This endpoint can be called by:
// 1. A cron job (Vercel cron, or external service)
// 2. Manual trigger from the UI
// 3. n8n webhook

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Check for authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow if it's the cron job or has valid auth
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // For now, allow all requests during development
      // In production, uncomment:
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body (emails to process)
    const body = await request.json().catch(() => ({}));

    // If emails are provided directly (from n8n or manual), process them
    if (body.emails && Array.isArray(body.emails)) {
      const results = await processEmails(supabase, body.emails);
      return NextResponse.json({ success: true, processed: results.length, results });
    }

    // Otherwise, fetch unprocessed emails from email_inbox table
    const { data: unprocessedEmails, error: fetchError } = await supabase
      .from('email_inbox')
      .select('*')
      .eq('processed', false)
      .order('received_at', { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }

    if (!unprocessedEmails || unprocessedEmails.length === 0) {
      return NextResponse.json({ success: true, message: 'No unprocessed emails', processed: 0 });
    }

    const results = await processEmails(supabase, unprocessedEmails);

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Email sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processEmails(supabase: any, emails: any[]) {
  const results = [];

  for (const email of emails) {
    try {
      // Classify with AI
      const classification = await classifyEmail(
        email.subject || '',
        email.body || email.snippet || '',
        email.sender || email.from || ''
      );

      // Store classification in ai_email_intel table
      const { data: intelRecord, error: insertError } = await supabase
        .from('ai_email_intel')
        .upsert({
          email_id: email.id || email.message_id,
          thread_id: email.thread_id,
          sender: email.sender || email.from,
          subject: email.subject,
          snippet: email.snippet || email.body?.substring(0, 200),
          received_at: email.received_at || email.date || new Date().toISOString(),
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
        }, {
          onConflict: 'email_id',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error storing classification:', insertError);
      }

      // Mark original email as processed
      if (email.id) {
        await supabase
          .from('email_inbox')
          .update({ processed: true, processed_at: new Date().toISOString() })
          .eq('id', email.id);
      }

      // Create AI insight for critical/high priority items
      if (classification.priority === 'critical' || classification.priority === 'high') {
        await supabase.from('ai_insights').insert({
          type: 'email_alert',
          title: `${classification.priority.toUpperCase()}: ${email.subject}`,
          summary: classification.summary,
          severity: classification.priority === 'critical' ? 'critical' : 'warning',
          source_type: 'email',
          source_id: email.id || email.message_id,
          suggested_actions: classification.suggestedActions,
          metadata: {
            sender: email.sender || email.from,
            category: classification.category,
            extracted_numbers: classification.extractedNumbers,
          },
        });
      }

      results.push({
        email_id: email.id || email.message_id,
        subject: email.subject,
        classification,
      });
    } catch (error) {
      console.error('Error processing email:', error);
      results.push({
        email_id: email.id || email.message_id,
        error: 'Processing failed',
      });
    }
  }

  return results;
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const supabase = createServerClient();

    const { count: totalEmails } = await supabase
      .from('ai_email_intel')
      .select('*', { count: 'exact', head: true });

    const { count: unprocessed } = await supabase
      .from('email_inbox')
      .select('*', { count: 'exact', head: true })
      .eq('processed', false);

    const { data: lastSync } = await supabase
      .from('ai_email_intel')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      totalClassified: totalEmails || 0,
      pendingProcessing: unprocessed || 0,
      lastSyncAt: lastSync?.updated_at || null,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
