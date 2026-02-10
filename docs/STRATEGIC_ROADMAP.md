# Dromeas OS Strategic Roadmap
## AI-First Client Ops OS - The "Autopilot with Captain's Chair" Model

> **Positioning:** "A client portal that runs your operations in the background."
>
> Not "all-in-one modules." Instead: **one brain that uses modules as tools.**

---

## The Core Differentiator

| Competitor | Model |
|------------|-------|
| SuiteDash | White-labeled toolbox (you configure rules → system runs rules) |
| **Dromeas OS** | **White-labeled autopilot with captain's chair** (system observes → proposes → human approves → executes + learns) |

---

## The Holy Trinity (MVP Focus)

### 1. Portal + Inbox (Unified View)
- **Client sees:** One place for messages, files, requests, approvals, invoices
- **Internal team sees:** One unified "Today" queue + SLA indicators + next best actions
- **Priority:** Build the Email Intel system to power this ✅ (done)

### 2. Requests → Projects (Automatic Structuring)
Every client request becomes a **structured object**:
- Intent
- Deadline
- Attachments
- Stakeholders
- Status
- Next step

**AI extracts + routes + suggests a plan automatically**

### 3. Decision Queue (Human Approval Layer) ⭐ THE KEY DIFFERENTIATOR
AI can draft actions, but **cannot execute without policy approval**:

```
Examples:
- "Send invoice" → APPROVE / REJECT
- "Schedule meeting" → APPROVE / REJECT
- "Request missing info" → APPROVE / REJECT
- "Generate contract draft" → APPROVE / REJECT
- "Update project timeline" → APPROVE / REJECT
- "Chase client for asset" → APPROVE / REJECT
```

Every AI action = **Change Proposal** with:
- Diff view (what will change)
- Risk score (low/medium/high)
- Why/why-not reasoning
- Required approvals
- Approve → execute; Reject → teach; Defer → set conditions

---

## Multi-Model AI Pipeline (Claude Opus 4.6 + GPT-5.2 + Gemini 3)

### Pattern A: Draft + Verify
```
Gemini 3 (strong at long context + document understanding)
  → Drafts extraction from messy inputs (emails, PDFs, attachments)

GPT-5.2 (strong at schema validation)
  → Validates against business rules
  → Highlights contradictions
  → Generates "approval diff" in plain English

Claude Opus 4.6 (strong at nuanced reasoning)
  → Final synthesis and decision recommendation
```

### Pattern B: Dual Extraction + Consensus
Run multiple models in parallel to extract:
- Client name, company, project, deliverables, dates, payment terms, risk flags

**Consensus logic:**
- If models **agree** → Auto-fill with high confidence
- If models **conflict** → Send to Decision Queue with "model disagreement" flag

### Pattern C: Tool-Using Agent (Leashed)
Let AI propose actions:
- "Create invoice for milestone 2"
- "Send message asking for missing logo files"
- "Move task X to blocked"

**But only execute after approval (or policy thresholds you define)**

---

## The 10X Feature: Autonomous Ops Analyst

**Daily Brief that produces + executes with approvals:**

```markdown
📊 DROMEAS OPS DAILY BRIEF - Feb 10, 2026

🔴 AT RISK (3 clients)
• Atlantic Marine - Missing deposit payment (7 days overdue)
• Mediterranean Charter - No reply in 5 days on specs
• Aegean Yachts - Asset delivery delayed, blocking production

💰 INVOICES TO SEND TODAY (2)
• D28-042 Milestone 2: €45,000 → [SEND NOW]
• D23-017 Final: €38,000 → [SEND NOW]

⚠️ SCOPE CREEP DETECTED (1)
• D28-045: Customer requesting additional nav equipment not in quote
• Suggested action: Generate change order for €3,200 → [REVIEW]

📋 NEXT 5 ACTIONS
1. Follow up with Schenker on overdue watermaker delivery
2. Send production photos to Atlantic Marine
3. Schedule D28-042 sea trial
4. Request updated specs from Mediterranean Charter
5. Prepare Q1 compliance report

[APPROVE ALL] [APPROVE INDIVIDUALLY] [DEFER TO TOMORROW]
```

This is **"AI running smart solutions in the background with human approval"** realized.

---

## What to Steal from SuiteDash (and Improve)

### ✅ Steal:
- Single database across modules (no Frankenstack)
- White-label obsession (domain, branding, portal as your product)
- Automation templates as a concept

### 🚀 Improve:
- **Templates that self-assemble** - AI suggests the right workflow based on client type + request type + history
- **Policy + approvals as core product** - SuiteDash doesn't lead with governance
- **Premium portal UX** - Feels effortless (Copilot/Assembly vibes)
- **No-login magic links** - For clients where appropriate (Moxo-style)

---

## Competitive Benchmark

| Product | Strength | Weakness |
|---------|----------|----------|
| SuiteDash | Breadth + white-label + one system | Complexity, configuration burden |
| Moxo | Workflow playbooks + magic links + enterprise governance | Less customizable |
| Copilot | Modern white-label portal + messaging/payments | Limited automation |
| Flowlu | All-in-one work management + mobile | UX not premium |
| Assembly | Modern portal-first experience | Narrower scope |
| ManyRequests | Opinionated productized service workflows | Too niche |
| **Dromeas OS** | **AI-first autopilot + governance + premium UX** | Building it |

---

## Implementation Priority (For €2M D-Day)

### Phase 1: NOW (Feb 2026) ✅ In Progress
- [x] Email Intel with multi-LLM classification
- [x] Automated sync (every 5 min)
- [x] Extracted numbers/dates/actions
- [x] Comment system with TODO creation
- [ ] Run Supabase migration
- [ ] Add OpenAI + Gemini API keys

### Phase 2: March 2026
- [ ] Decision Queue UI
- [ ] Approval workflow engine
- [ ] Daily Ops Brief generator
- [ ] Risk scoring system

### Phase 3: April 2026
- [ ] Customer Portal (build tracking)
- [ ] Digital sign-offs on milestones
- [ ] Magic link access

### Phase 4: May 2026
- [ ] Time tracking (labor costs per boat)
- [ ] Knowledge base (SOPs, CE docs)
- [ ] Self-assembling workflow templates

---

## The Bottom Line

> **SuiteDash = "Here's a toolbox, configure it yourself"**
>
> **Dromeas OS = "Here's what needs to happen today, approve and I'll do it"**

The difference is **cognitive load**. Efe doesn't want another system to manage. He wants a system that manages itself and asks permission.

**That's the moat.**
