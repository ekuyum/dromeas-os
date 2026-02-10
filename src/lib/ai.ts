import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize clients
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const gemini = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

export type LLMProvider = 'claude' | 'gpt' | 'gemini';

export interface EmailClassification {
  category: 'supplier' | 'customer' | 'legal' | 'financial' | 'operations' | 'personal' | 'marketing' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'today' | 'this_week' | 'no_rush';
  summary: string;
  extractedNumbers: ExtractedNumber[];
  extractedDates: ExtractedDate[];
  suggestedActions: string[];
  entities: ExtractedEntity[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  requiresResponse: boolean;
  confidenceScore: number;
  provider?: LLMProvider;
}

export interface ExtractedNumber {
  value: number;
  currency?: string;
  context: string;
  type: 'payment' | 'debt' | 'invoice' | 'quote' | 'quantity' | 'other';
  confidence: number;
}

export interface ExtractedDate {
  date: string;
  context: string;
  type: 'deadline' | 'payment_due' | 'meeting' | 'delivery' | 'other';
}

export interface ExtractedEntity {
  name: string;
  type: 'company' | 'person' | 'product' | 'boat_model';
  context: string;
}

const EMAIL_CLASSIFICATION_PROMPT = `You are an AI assistant for Dromeas Yachts, a boat manufacturing company in Greece. The CEO (Efe) is managing multiple business entities and needs you to analyze incoming emails.

CONTEXT:
- Dromeas builds boats (D28, D23 models)
- Key suppliers: Schenker Watermakers, various marine suppliers
- Currency: primarily EUR
- CEO is planning relocation to Barcelona by Nov 30, 2026
- Target: €2M cash by D-Day

ANALYZE THIS EMAIL:
From: {sender}
Subject: {subject}

Body:
{body}

RESPOND IN JSON FORMAT ONLY (no markdown, no explanation):
{
  "category": "supplier|customer|legal|financial|operations|personal|marketing|other",
  "priority": "critical|high|medium|low",
  "urgency": "immediate|today|this_week|no_rush",
  "summary": "1-2 sentence executive summary",
  "extractedNumbers": [
    {"value": 25000, "currency": "EUR", "context": "outstanding invoice", "type": "debt|payment|invoice|quote|quantity|other", "confidence": 0.95}
  ],
  "extractedDates": [
    {"date": "2026-02-28", "context": "payment deadline", "type": "deadline|payment_due|meeting|delivery|other"}
  ],
  "suggestedActions": ["Action 1", "Action 2"],
  "entities": [
    {"name": "Company Name", "type": "company|person|product|boat_model", "context": "supplier"}
  ],
  "sentiment": "positive|neutral|negative|urgent",
  "requiresResponse": true,
  "confidenceScore": 0.85
}`;

// Claude (Anthropic) classification
async function classifyWithClaude(subject: string, body: string, sender: string): Promise<EmailClassification> {
  if (!anthropic) throw new Error('Anthropic API not configured');

  const prompt = EMAIL_CLASSIFICATION_PROMPT
    .replace('{sender}', sender)
    .replace('{subject}', subject)
    .replace('{body}', body);

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6-20260115', // Latest Opus 4.6
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Claude response');

  const classification = JSON.parse(jsonMatch[0]) as EmailClassification;
  classification.provider = 'claude';
  return classification;
}

// GPT-4 (OpenAI) classification
async function classifyWithGPT(subject: string, body: string, sender: string): Promise<EmailClassification> {
  if (!openai) throw new Error('OpenAI API not configured');

  const prompt = EMAIL_CLASSIFICATION_PROMPT
    .replace('{sender}', sender)
    .replace('{subject}', subject)
    .replace('{body}', body);

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.2', // Latest GPT-5.2
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '';
  const classification = JSON.parse(responseText) as EmailClassification;
  classification.provider = 'gpt';
  return classification;
}

// Gemini (Google) classification
async function classifyWithGemini(subject: string, body: string, sender: string): Promise<EmailClassification> {
  if (!gemini) throw new Error('Google AI API not configured');

  const prompt = EMAIL_CLASSIFICATION_PROMPT
    .replace('{sender}', sender)
    .replace('{subject}', subject)
    .replace('{body}', body);

  const model = gemini.getGenerativeModel({ model: 'gemini-3-pro' }); // Latest Gemini 3
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found in Gemini response');

  const classification = JSON.parse(jsonMatch[0]) as EmailClassification;
  classification.provider = 'gemini';
  return classification;
}

// Main classification function with provider selection and fallback
export async function classifyEmail(
  subject: string,
  body: string,
  sender: string,
  preferredProvider: LLMProvider = 'claude'
): Promise<EmailClassification> {
  const providers: LLMProvider[] = [preferredProvider];

  // Add fallbacks
  if (preferredProvider !== 'claude' && anthropic) providers.push('claude');
  if (preferredProvider !== 'gpt' && openai) providers.push('gpt');
  if (preferredProvider !== 'gemini' && gemini) providers.push('gemini');

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      switch (provider) {
        case 'claude':
          if (anthropic) return await classifyWithClaude(subject, body, sender);
          break;
        case 'gpt':
          if (openai) return await classifyWithGPT(subject, body, sender);
          break;
        case 'gemini':
          if (gemini) return await classifyWithGemini(subject, body, sender);
          break;
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // If all providers fail, return default classification
  console.error('All AI providers failed:', lastError);
  return {
    category: 'other',
    priority: 'medium',
    urgency: 'this_week',
    summary: 'Unable to classify - please review manually',
    extractedNumbers: [],
    extractedDates: [],
    suggestedActions: ['Review email manually'],
    entities: [],
    sentiment: 'neutral',
    requiresResponse: false,
    confidenceScore: 0,
    provider: undefined,
  };
}

// Multi-LLM consensus classification (uses all available providers)
export async function classifyEmailWithConsensus(
  subject: string,
  body: string,
  sender: string
): Promise<{ consensus: EmailClassification; individual: EmailClassification[] }> {
  const results: EmailClassification[] = [];
  const promises: Promise<EmailClassification>[] = [];

  if (anthropic) promises.push(classifyWithClaude(subject, body, sender).catch(() => null as any));
  if (openai) promises.push(classifyWithGPT(subject, body, sender).catch(() => null as any));
  if (gemini) promises.push(classifyWithGemini(subject, body, sender).catch(() => null as any));

  const allResults = await Promise.all(promises);
  results.push(...allResults.filter(r => r !== null));

  if (results.length === 0) {
    const fallback = await classifyEmail(subject, body, sender);
    return { consensus: fallback, individual: [fallback] };
  }

  // Build consensus from multiple results
  const consensus: EmailClassification = {
    category: getMostCommon(results.map(r => r.category)) as EmailClassification['category'],
    priority: getHighestPriority(results.map(r => r.priority)),
    urgency: getHighestUrgency(results.map(r => r.urgency)),
    summary: results[0].summary, // Use first available summary
    extractedNumbers: mergeExtractedNumbers(results.map(r => r.extractedNumbers)),
    extractedDates: mergeExtractedDates(results.map(r => r.extractedDates)),
    suggestedActions: mergeActions(results.map(r => r.suggestedActions)),
    entities: mergeEntities(results.map(r => r.entities)),
    sentiment: getMostCommon(results.map(r => r.sentiment)) as EmailClassification['sentiment'],
    requiresResponse: results.some(r => r.requiresResponse),
    confidenceScore: average(results.map(r => r.confidenceScore)),
    provider: 'claude', // Mark as consensus
  };

  return { consensus, individual: results };
}

// Helper functions for consensus building
function getMostCommon<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  arr.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  let maxCount = 0;
  let result = arr[0];
  counts.forEach((count, item) => {
    if (count > maxCount) {
      maxCount = count;
      result = item;
    }
  });
  return result;
}

function getHighestPriority(priorities: string[]): EmailClassification['priority'] {
  const order = ['critical', 'high', 'medium', 'low'];
  for (const level of order) {
    if (priorities.includes(level)) return level as EmailClassification['priority'];
  }
  return 'medium';
}

function getHighestUrgency(urgencies: string[]): EmailClassification['urgency'] {
  const order = ['immediate', 'today', 'this_week', 'no_rush'];
  for (const level of order) {
    if (urgencies.includes(level)) return level as EmailClassification['urgency'];
  }
  return 'this_week';
}

function mergeExtractedNumbers(arrays: ExtractedNumber[][]): ExtractedNumber[] {
  const merged = arrays.flat();
  // Dedupe by value + context
  const seen = new Set<string>();
  return merged.filter(n => {
    const key = `${n.value}-${n.context}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeExtractedDates(arrays: ExtractedDate[][]): ExtractedDate[] {
  const merged = arrays.flat();
  const seen = new Set<string>();
  return merged.filter(d => {
    const key = `${d.date}-${d.context}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mergeActions(arrays: string[][]): string[] {
  const all = arrays.flat();
  return [...new Set(all)].slice(0, 5); // Max 5 unique actions
}

function mergeEntities(arrays: ExtractedEntity[][]): ExtractedEntity[] {
  const merged = arrays.flat();
  const seen = new Set<string>();
  return merged.filter(e => {
    const key = `${e.name}-${e.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

// Ask question about email (with multi-provider support)
export async function askAboutEmail(
  emailContext: string,
  question: string,
  provider: LLMProvider = 'claude'
): Promise<string> {
  const prompt = `You are an AI assistant for Dromeas Yachts CEO. Answer questions about this email context.

EMAIL CONTEXT:
${emailContext}

QUESTION: ${question}

Provide a concise, helpful answer. If you're uncertain, say so.`;

  try {
    switch (provider) {
      case 'claude':
        if (anthropic) {
          const message = await anthropic.messages.create({
            model: 'claude-opus-4-6-20260115', // Latest Opus 4.6
            max_tokens: 512,
            messages: [{ role: 'user', content: prompt }],
          });
          return message.content[0].type === 'text' ? message.content[0].text : 'Unable to process';
        }
        break;

      case 'gpt':
        if (openai) {
          const completion = await openai.chat.completions.create({
            model: 'gpt-5.2', // Latest GPT-5.2
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 512,
          });
          return completion.choices[0]?.message?.content || 'Unable to process';
        }
        break;

      case 'gemini':
        if (gemini) {
          const model = gemini.getGenerativeModel({ model: 'gemini-3-pro' }); // Latest Gemini 3
          const result = await model.generateContent(prompt);
          return result.response.text();
        }
        break;
    }

    // Fallback to any available provider
    if (anthropic) return await askAboutEmail(emailContext, question, 'claude');
    if (openai) return await askAboutEmail(emailContext, question, 'gpt');
    if (gemini) return await askAboutEmail(emailContext, question, 'gemini');

    return 'No AI provider configured';
  } catch (error) {
    console.error('AI Question error:', error);
    return 'Error processing your question. Please try again.';
  }
}

// Get available providers
export function getAvailableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (anthropic) providers.push('claude');
  if (openai) providers.push('gpt');
  if (gemini) providers.push('gemini');
  return providers;
}
