# Dromeas OS v1 Finalization Checklist
## Getting to "First Email Processed" Status

---

## ✅ COMPLETED (Feb 10, 2026)

### Code Infrastructure
- [x] Multi-LLM AI Service (`/src/lib/ai.ts`)
  - Claude Opus 4.6
  - GPT-5.2
  - Gemini 3
  - Consensus mode
  - Fallback chain

- [x] Email Intel Page (`/email-intel`)
  - Stats bar (total, critical, needs response, flagged)
  - Email list with filters
  - Detail panel with AI summary
  - Extracted numbers/dates
  - Comment system with TODO creation
  - AI chat interface

- [x] API Routes
  - `/api/email-sync` - Process and classify emails
  - `/api/ai-ask` - AI Q&A about emails
  - `/api/email-comments` - Add annotations

- [x] Database Schema (SQL ready)
  - `email_inbox`
  - `ai_email_intel`
  - `ai_email_comments`
  - `todos`

- [x] Navigation Updated
  - Email Intel link in sidebar
  - Highlighted as new feature

- [x] Cron Configuration
  - Vercel cron every 5 minutes

- [x] Package Dependencies
  - @anthropic-ai/sdk
  - openai
  - @google/generative-ai

---

## ⏳ PENDING ACTIONS

### 1. Run Supabase Migration (CRITICAL)
```bash
# Go to: https://supabase.com/dashboard/project/jodybdbxfxtotxfsydqt/sql/new
# Paste contents of: /supabase/migrations/002_email_intel_tables.sql
# Click "Run"
```

### 2. Add API Keys to .env.local
```bash
# Current (already set):
ANTHROPIC_API_KEY=sk-ant-api03-...

# Need to add:
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=...
```

### 3. Connect Gmail to n8n (or direct integration)
Options:
- A) Use existing n8n workflow (fix wiring)
- B) Build direct Gmail API integration
- C) Use Supabase Edge Function with Gmail

Recommended: Option A (fastest)
```
n8n Workflow Fix:
1. Connect "Gmail: Get many messages" output to "Code" node
2. Connect "Code" node to "Supabase: Insert"
3. Test with "Execute Workflow"
```

### 4. Test Full Flow
```
1. Trigger email sync
2. Verify email appears in ai_email_intel table
3. Open /email-intel page
4. Confirm classification displays
5. Test comment + TODO creation
6. Test AI chat
```

### 5. Populate Sample Data (Testing)
Uncomment sample data in migration SQL or insert manually:
- 3 test emails with different categories
- Verify extraction accuracy

---

## 📋 V1 FEATURE SCOPE

### Must Have (v1)
- [x] Email classification (category, priority, urgency)
- [x] Number extraction (amounts, currencies)
- [x] Date extraction (deadlines, due dates)
- [x] AI summary generation
- [x] Comment/annotation system
- [x] TODO auto-creation
- [x] AI Q&A chat
- [x] Multi-LLM support

### Nice to Have (v1.1)
- [ ] Decision Queue UI
- [ ] Daily Ops Brief
- [ ] Batch approve actions
- [ ] Email response drafting
- [ ] Risk scoring

### Future (v2)
- [ ] Customer Portal
- [ ] Magic link access
- [ ] Invoice generation
- [ ] Contract drafting
- [ ] Multi-entity "WORLDs"

---

## 🧪 TESTING CHECKLIST

### Unit Tests (Recommended)
- [ ] AI classification returns valid schema
- [ ] Multi-model fallback works
- [ ] Consensus mode merges correctly
- [ ] Database operations succeed

### Integration Tests
- [ ] Email sync endpoint processes emails
- [ ] AI ask endpoint returns answers
- [ ] Comment endpoint creates TODOs
- [ ] Cron job triggers correctly

### Manual Tests
- [ ] Login to app works
- [ ] Email Intel page loads
- [ ] Filters work (all, critical, high, etc.)
- [ ] Email detail panel shows data
- [ ] Comment form submits
- [ ] AI chat responds

---

## 🚀 DEPLOYMENT CHECKLIST

### Vercel Deployment
- [ ] Push code to GitHub
- [ ] Connect Vercel to repo
- [ ] Set environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
  - `GOOGLE_AI_API_KEY`
  - `CRON_SECRET`
- [ ] Deploy
- [ ] Verify cron job registered
- [ ] Test production endpoints

### Domain Setup (Optional)
- [ ] Connect custom domain
- [ ] SSL certificate
- [ ] DNS configuration

---

## 📊 SUCCESS METRICS

### v1 Launch Success Criteria
1. **Email Processing:** At least 10 emails classified automatically
2. **Accuracy:** 80%+ classification accuracy
3. **Performance:** <5 second classification time
4. **Uptime:** 99%+ availability
5. **User Adoption:** Efe using daily

### Week 1 Goals
- Process 100+ emails
- Create 20+ TODOs from emails
- Identify 5+ critical action items
- Draft 3+ email responses

---

## 🔧 TROUBLESHOOTING

### Common Issues

**"Anthropic API not configured"**
→ Check ANTHROPIC_API_KEY in .env.local

**"No emails appearing"**
→ Check n8n workflow, verify Gmail OAuth, check email_inbox table

**"Classification failing"**
→ Check API rate limits, verify JSON parsing, check error logs

**"Database errors"**
→ Run migration, check table schema, verify Supabase connection

---

## NEXT STEPS AFTER V1

1. **Decision Queue (Week 1)**
   - Create `/decision-queue` page
   - Display pending actions
   - Add approve/reject

2. **Daily Brief (Week 2)**
   - Create `/api/daily-brief`
   - Email summary at 7am
   - Dashboard widget

3. **Email Drafting (Week 3)**
   - AI-generated responses
   - Multiple tone options
   - Queue for approval

4. **Invoice Integration (Week 4)**
   - Extract amounts from emails
   - Generate invoice drafts
   - Connect to billing

---

*Checklist Version: 1.0*
*Last Updated: February 10, 2026*
