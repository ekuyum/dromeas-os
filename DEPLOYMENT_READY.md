# DROMEAS OS - Ready for Deployment

## ✅ Configuration Complete

### Database (Supabase)
- **Tables Created**: email_inbox, ai_email_intel, ai_email_comments, todos
- **URL**: https://jodybdbxfxtotxfsydqt.supabase.co

### AI Services (All 3 Configured)
- ✅ Claude (Anthropic) - Primary
- ✅ GPT (OpenAI) - Secondary
- ✅ Gemini (Google) - Tertiary

### Gmail Integration
- ✅ OAuth Client ID configured
- ✅ OAuth Client Secret configured
- ✅ Refresh Token configured
- **Email**: efe.kuyumcu@dromeasyachts.com

### Cron Job
- **Endpoint**: `/api/cron/email-pipeline`
- **Schedule**: Every 5 minutes
- **Actions**:
  1. Fetch new emails from Gmail
  2. Classify with AI
  3. Store in Supabase

---

## 🚀 Deploy to Vercel

### Step 1: Push to GitHub (if not already)
```bash
cd /path/to/dos-app
git init
git add .
git commit -m "Initial Dromeas OS deployment"
git remote add origin https://github.com/YOUR_USERNAME/dromeas-os.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Set environment variables (copy from .env.local):

```
NEXT_PUBLIC_SUPABASE_URL=https://jodybdbxfxtotxfsydqt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
GOOGLE_AI_API_KEY=AIzaSy...
GMAIL_CLIENT_ID=420317460520-...apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-...
GMAIL_REFRESH_TOKEN=1//yuqm...
CRON_SECRET=dromeas-email-sync-2026
```

4. Click Deploy

### Step 3: Verify
- Visit your Vercel URL
- Check `/api/cron/email-pipeline` endpoint
- Vercel will auto-run cron every 5 minutes

---

## 📊 What Happens Next

1. **Every 5 minutes**: Cron fetches new emails from Gmail
2. **AI Classification**: Each email gets categorized, prioritized, and summarized
3. **Dashboard Shows**:
   - Priority emails
   - Required actions
   - Extracted numbers/dates
   - Suggested responses

---

## 🔧 Manual Triggers

**Fetch emails manually:**
```bash
curl -X POST https://your-app.vercel.app/api/gmail-fetch
```

**Process emails manually:**
```bash
curl -X POST https://your-app.vercel.app/api/email-sync
```

**Full pipeline:**
```bash
curl https://your-app.vercel.app/api/cron/email-pipeline
```
