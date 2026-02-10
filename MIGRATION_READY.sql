-- DROMEAS OS - EMAIL INTELLIGENCE TABLES
-- Copy this entire SQL and paste into Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/jodybdbxfxtotxfsydqt/sql

-- Table 1: Raw email inbox (receives from n8n/Gmail)
CREATE TABLE IF NOT EXISTS email_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT UNIQUE,
  thread_id TEXT,
  sender TEXT NOT NULL,
  recipient TEXT,
  subject TEXT,
  body TEXT,
  snippet TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: AI Email Intelligence (classified emails)
CREATE TABLE IF NOT EXISTS ai_email_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT UNIQUE,
  thread_id TEXT,
  sender TEXT NOT NULL,
  subject TEXT,
  snippet TEXT,
  received_at TIMESTAMPTZ,
  category TEXT,
  priority TEXT,
  urgency TEXT,
  summary TEXT,
  sentiment TEXT,
  confidence_score DECIMAL(3,2),
  extracted_numbers JSONB DEFAULT '[]',
  extracted_dates JSONB DEFAULT '[]',
  suggested_actions JSONB DEFAULT '[]',
  entities JSONB DEFAULT '[]',
  requires_response BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new',
  is_flagged BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  user_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Email Comments
CREATE TABLE IF NOT EXISTS ai_email_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_intel_id UUID REFERENCES ai_email_intel(id) ON DELETE CASCADE,
  comment_type TEXT DEFAULT 'user_note',
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Efe',
  creates_todo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: Todos
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  source_type TEXT,
  source_id UUID,
  assigned_to TEXT DEFAULT 'Efe',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_inbox_unprocessed ON email_inbox(processed, received_at DESC) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_priority ON ai_email_intel(priority);
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_status ON ai_email_intel(status);
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_received ON ai_email_intel(received_at DESC);

-- Grant access
GRANT ALL ON email_inbox TO anon, authenticated;
GRANT ALL ON ai_email_intel TO anon, authenticated;
GRANT ALL ON ai_email_comments TO anon, authenticated;
GRANT ALL ON todos TO anon, authenticated;
