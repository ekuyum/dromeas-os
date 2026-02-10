import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { fetchGmailEmails, refreshGmailToken } from '@/lib/gmail';

// Direct Gmail fetch endpoint for Dromeas OS
// This fetches emails directly from Gmail API without needing n8n

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json().catch(() => ({}));

    // Get Gmail credentials from environment or request
    const clientId = process.env.GMAIL_CLIENT_ID || body.client_id;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET || body.client_secret;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN || body.refresh_token;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({
        error: 'Gmail credentials not configured',
        hint: 'Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in .env.local'
      }, { status: 400 });
    }

    // Refresh the access token
    const tokenData = await refreshGmailToken(clientId, clientSecret, refreshToken);

    // Fetch emails from Gmail
    const maxResults = body.maxResults || 20;
    const query = body.query || 'is:inbox newer_than:7d';
    const emails = await fetchGmailEmails(tokenData.access_token, maxResults, query);

    // Store emails in email_inbox table
    const insertResults = [];
    for (const email of emails) {
      const { data, error } = await (supabase
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
        })
        .select();

      insertResults.push({
        message_id: email.message_id,
        subject: email.subject,
        stored: !error,
        error: error?.message,
      });
    }

    return NextResponse.json({
      success: true,
      fetched: emails.length,
      stored: insertResults.filter(r => r.stored).length,
      results: insertResults,
    });
  } catch (error: any) {
    console.error('Gmail fetch error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch Gmail',
    }, { status: 500 });
  }
}

// GET endpoint to check Gmail configuration status
export async function GET() {
  const hasCredentials = !!(
    process.env.GMAIL_CLIENT_ID &&
    process.env.GMAIL_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN
  );

  return NextResponse.json({
    configured: hasCredentials,
    message: hasCredentials
      ? 'Gmail is configured. POST to this endpoint to fetch emails.'
      : 'Gmail credentials not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN in environment.',
  });
}
