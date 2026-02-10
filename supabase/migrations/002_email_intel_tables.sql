-- Email Intelligence System Tables
-- Run this in Supabase SQL Editor

-- 1. Raw email inbox (receives emails from n8n/Gmail)
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

-- Index for processing queue
CREATE INDEX IF NOT EXISTS idx_email_inbox_unprocessed
ON email_inbox(processed, received_at DESC)
WHERE processed = FALSE;

-- 2. AI Email Intelligence (classified emails)
CREATE TABLE IF NOT EXISTS ai_email_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id TEXT UNIQUE,
  thread_id TEXT,
  sender TEXT NOT NULL,
  subject TEXT,
  snippet TEXT,
  received_at TIMESTAMPTZ,

  -- AI Classification
  category TEXT CHECK (category IN ('supplier', 'customer', 'legal', 'financial', 'operations', 'personal', 'marketing', 'other')),
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  urgency TEXT CHECK (urgency IN ('immediate', 'today', 'this_week', 'no_rush')),
  summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  confidence_score DECIMAL(3,2),

  -- Extracted data
  extracted_numbers JSONB DEFAULT '[]'::jsonb,
  extracted_dates JSONB DEFAULT '[]'::jsonb,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  entities JSONB DEFAULT '[]'::jsonb,

  -- Status tracking
  requires_response BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'actioned', 'archived')),
  is_flagged BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,

  -- User additions
  user_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_priority ON ai_email_intel(priority);
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_category ON ai_email_intel(category);
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_status ON ai_email_intel(status);
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_received ON ai_email_intel(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_flagged ON ai_email_intel(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_ai_email_intel_requires_response ON ai_email_intel(requires_response) WHERE requires_response = TRUE;

-- 3. Email Comments / Annotations
CREATE TABLE IF NOT EXISTS ai_email_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_intel_id UUID REFERENCES ai_email_intel(id) ON DELETE CASCADE,
  comment_type TEXT DEFAULT 'user_note' CHECK (comment_type IN ('user_note', 'ai_qa', 'action_taken', 'follow_up')),
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Efe',
  creates_todo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_email_comments_email ON ai_email_comments(email_intel_id);

-- 4. Todos table (if not exists)
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMPTZ,
  source_type TEXT,
  source_id UUID,
  assigned_to TEXT DEFAULT 'Efe',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);

-- 5. Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to ai_email_intel
DROP TRIGGER IF EXISTS update_ai_email_intel_updated_at ON ai_email_intel;
CREATE TRIGGER update_ai_email_intel_updated_at
    BEFORE UPDATE ON ai_email_intel
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to todos
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security (optional, for production)
-- ALTER TABLE email_inbox ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_email_intel ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_email_comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 7. Grant access (for Supabase anon/authenticated)
-- These are permissive for development
GRANT ALL ON email_inbox TO anon, authenticated;
GRANT ALL ON ai_email_intel TO anon, authenticated;
GRANT ALL ON ai_email_comments TO anon, authenticated;
GRANT ALL ON todos TO anon, authenticated;

-- 8. Sample data for testing (uncomment to use)
/*
INSERT INTO ai_email_intel (
  email_id, sender, subject, snippet, received_at,
  category, priority, urgency, summary, sentiment, confidence_score,
  extracted_numbers, extracted_dates, suggested_actions, entities,
  requires_response
) VALUES
(
  'test-001',
  'supplier@schenker.com',
  'URGENT: Outstanding Invoice #INV-2024-892',
  'Dear Dromeas Team, This is a reminder that invoice #INV-2024-892 for €25,000 is now 15 days overdue...',
  NOW() - INTERVAL '2 hours',
  'supplier',
  'critical',
  'immediate',
  'Schenker Watermakers is following up on an overdue invoice of €25,000. Payment was due 15 days ago. Threatens potential service interruption.',
  'urgent',
  0.95,
  '[{"value": 25000, "currency": "EUR", "context": "outstanding invoice", "type": "debt", "confidence": 0.98}]'::jsonb,
  '[{"date": "2026-01-25", "context": "original due date", "type": "payment_due"}]'::jsonb,
  '["Review invoice INV-2024-892", "Verify payment status", "Contact accounting for immediate payment", "Respond to supplier within 24 hours"]'::jsonb,
  '[{"name": "Schenker Watermakers", "type": "company", "context": "supplier"}]'::jsonb,
  TRUE
),
(
  'test-002',
  'george.papadopoulos@marinelegal.gr',
  'Re: D28 Export Documentation - Action Required',
  'Efe, The customs paperwork for the D28 shipment to Italy needs your signature by February 15th...',
  NOW() - INTERVAL '5 hours',
  'legal',
  'high',
  'this_week',
  'Legal counsel requesting signature on D28 export customs documentation. Deadline is February 15th for Italy shipment.',
  'neutral',
  0.88,
  '[]'::jsonb,
  '[{"date": "2026-02-15", "context": "signature deadline", "type": "deadline"}]'::jsonb,
  '["Review export documentation", "Schedule time to sign papers", "Confirm shipping details"]'::jsonb,
  '[{"name": "George Papadopoulos", "type": "person", "context": "legal counsel"}, {"name": "D28", "type": "boat_model", "context": "export shipment"}]'::jsonb,
  TRUE
),
(
  'test-003',
  'procurement@atlanticmarine.com',
  'Quote Request: 3x D23 Sport for Caribbean Fleet',
  'Good morning, Atlantic Marine Charters is interested in purchasing 3 units of the D23 Sport model for our Caribbean operation...',
  NOW() - INTERVAL '1 day',
  'customer',
  'high',
  'today',
  'Atlantic Marine Charters requesting quote for 3 D23 Sport boats for Caribbean fleet expansion. High-value potential sale.',
  'positive',
  0.92,
  '[{"value": 3, "context": "quantity requested", "type": "quantity", "confidence": 1.0}]'::jsonb,
  '[]'::jsonb,
  '["Prepare D23 Sport pricing package", "Check production capacity for 3 units", "Respond with quote within 48 hours", "Flag as high-value opportunity"]'::jsonb,
  '[{"name": "Atlantic Marine Charters", "type": "company", "context": "potential customer"}, {"name": "D23 Sport", "type": "boat_model", "context": "product inquiry"}]'::jsonb,
  TRUE
);
*/

COMMENT ON TABLE ai_email_intel IS 'AI-classified email intelligence for Dromeas OS CEO dashboard';
COMMENT ON TABLE email_inbox IS 'Raw email inbox receiving data from Gmail/n8n integration';
COMMENT ON TABLE ai_email_comments IS 'User comments and AI Q&A on classified emails';
COMMENT ON TABLE todos IS 'Action items and tasks, including those generated from email comments';
