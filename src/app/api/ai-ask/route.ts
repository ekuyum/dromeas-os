import { NextRequest, NextResponse } from 'next/server';
import { askAboutEmail } from '@/lib/ai';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, question } = body;

    if (!emailId || !question) {
      return NextResponse.json(
        { error: 'emailId and question are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch the email context
    const { data: email, error: fetchError } = await supabase
      .from('ai_email_intel')
      .select('*')
      .eq('id', emailId)
      .single() as { data: any; error: any };

    if (fetchError || !email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    // Build context string for AI
    const emailContext = `
From: ${email.sender}
Subject: ${email.subject}
Received: ${email.received_at}
Category: ${email.category}
Priority: ${email.priority}
Urgency: ${email.urgency}

AI Summary: ${email.summary}

Snippet: ${email.snippet}

Extracted Numbers: ${JSON.stringify(email.extracted_numbers || [])}
Extracted Dates: ${JSON.stringify(email.extracted_dates || [])}
Entities: ${JSON.stringify(email.entities || [])}
Suggested Actions: ${JSON.stringify(email.suggested_actions || [])}

User Notes: ${email.user_notes || 'None'}
    `.trim();

    // Ask AI
    const answer = await askAboutEmail(emailContext, question);

    // Store the Q&A in comments for reference
    await supabase.from('ai_email_comments').insert({
      email_intel_id: emailId,
      comment_type: 'ai_qa',
      content: `Q: ${question}\n\nA: ${answer}`,
      author: 'AI Assistant',
    });

    return NextResponse.json({
      success: true,
      answer,
      emailId,
      question,
    });
  } catch (error) {
    console.error('AI Ask error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
