import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// POST - Add a comment to an email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailIntelId, content, createTodo, author = 'Efe' } = body;

    if (!emailIntelId || !content) {
      return NextResponse.json(
        { error: 'emailIntelId and content are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Insert the comment
    const { data: comment, error: insertError } = await (supabase
      .from('ai_email_comments') as any)
      .insert({
        email_intel_id: emailIntelId,
        comment_type: 'user_note',
        content,
        author,
        creates_todo: createTodo || false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to save comment' },
        { status: 500 }
      );
    }

    // If createTodo flag is set, create a TODO item
    if (createTodo) {
      // Get email details for context
      const { data: email } = await supabase
        .from('ai_email_intel')
        .select('subject, sender')
        .eq('id', emailIntelId)
        .single();

      // Insert into todos table
      const { error: todoError } = await (supabase
        .from('todos') as any)
        .insert({
          title: `Review: ${content.substring(0, 100)}`,
          description: `From email: "${email?.subject}" (${email?.sender})\n\nNote: ${content}`,
          source_type: 'email_comment',
          source_id: comment.id,
          priority: 'medium',
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        });

      if (todoError) {
        console.error('Error creating todo:', todoError);
        // Don't fail the whole request, just log
      }

      // Also create an AI insight for visibility
      await (supabase.from('ai_insights') as any).insert({
        type: 'todo_created',
        title: `TODO: ${content.substring(0, 50)}...`,
        summary: `Created from email comment on: ${email?.subject}`,
        severity: 'info',
        source_type: 'email_comment',
        source_id: comment.id,
        suggested_actions: [content],
        metadata: {
          email_subject: email?.subject,
          email_sender: email?.sender,
          original_comment: content,
        },
      });

      // Update the email intel to mark it as flagged (has action items)
      await (supabase.from('ai_email_intel') as any)
        .update({ is_flagged: true })
        .eq('id', emailIntelId);
    }

    return NextResponse.json({
      success: true,
      comment,
      todoCreated: createTodo || false,
    });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { error: 'Failed to process comment' },
      { status: 500 }
    );
  }
}

// GET - Fetch comments for an email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const emailIntelId = searchParams.get('emailIntelId');

    if (!emailIntelId) {
      return NextResponse.json(
        { error: 'emailIntelId is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: comments, error } = await supabase
      .from('ai_email_comments')
      .select('*')
      .eq('email_intel_id', emailIntelId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
