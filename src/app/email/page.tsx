'use client';

import React, { useState } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  ChevronRight,
  ExternalLink,
  Zap,
  Brain,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type Entity = 'Personal' | 'Dromeas' | 'Eyadera' | 'Brújula' | 'Verdiq' | 'Lobo Blu' | 'Identio';
type EmailCategory = 'Money' | 'Sales' | 'Legal' | 'Production' | 'Admin' | 'Personal';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface ProcessedEmail {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  preview: string;
  receivedAt: string;
  entity: Entity;
  category: EmailCategory;
  priority: Priority;
  revenueImpact: number | null;
  actionRequired: boolean;
  summary: string;
  nextAction: string;
  draftReply?: string;
  taskCreated: boolean;
  taskId?: string;
  account: string;
}

// ============================================================================
// ENTITY CONFIG
// ============================================================================
const ENTITIES: { id: Entity; label: string; color: string; bgColor: string }[] = [
  { id: 'Personal', label: 'Personal', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  { id: 'Dromeas', label: 'Dromeas', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  { id: 'Eyadera', label: 'Eyadera', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  { id: 'Brújula', label: 'Brújula', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  { id: 'Verdiq', label: 'Verdiq', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  { id: 'Lobo Blu', label: 'Lobo Blu', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  { id: 'Identio', label: 'Identio', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
];

const CATEGORIES: { id: EmailCategory; color: string }[] = [
  { id: 'Money', color: 'bg-yellow-500/20 text-yellow-300' },
  { id: 'Sales', color: 'bg-green-500/20 text-green-300' },
  { id: 'Legal', color: 'bg-red-500/20 text-red-300' },
  { id: 'Production', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'Admin', color: 'bg-gray-500/20 text-gray-300' },
  { id: 'Personal', color: 'bg-purple-500/20 text-purple-300' },
];

// ============================================================================
// SAMPLE DATA (Will be replaced by Supabase)
// ============================================================================
const SAMPLE_EMAILS: ProcessedEmail[] = [
  {
    id: '1',
    from: 'peter.meyer@dromeasyachts.com',
    fromName: 'Peter Meyer',
    subject: 'Re: Greek dealer inquiry - Athens Marina',
    preview: 'I spoke with Kostas from Aegean Marine. They want to become exclusive dealer for Attica region...',
    receivedAt: '2026-02-10T09:30:00Z',
    entity: 'Dromeas',
    category: 'Sales',
    priority: 'high',
    revenueImpact: 200000,
    actionRequired: true,
    summary: 'Greek dealer wants exclusive agreement for Attica region',
    nextAction: 'Review dealer terms, schedule call with Kostas',
    draftReply: 'Hi Peter,\n\nThanks for the update on Aegean Marine. An exclusive agreement for Attica could be significant - let me review our dealer terms and I\'ll set up a call with Kostas for this week.\n\nCan you send over their company profile and any previous boat sales data?\n\nBest,\nEfe',
    taskCreated: true,
    taskId: 'task-123',
    account: 'efe@dromeasyachts.com',
  },
  {
    id: '2',
    from: 'soyaslan@soyaslan.com.tr',
    fromName: 'Soyaslan Marine',
    subject: 'MOU January Payment Confirmation',
    preview: 'Confirming wire transfer of €70,019.33 for January installment as per MOU...',
    receivedAt: '2026-02-10T08:15:00Z',
    entity: 'Dromeas',
    category: 'Money',
    priority: 'critical',
    revenueImpact: 70019,
    actionRequired: true,
    summary: 'January MOU payment €70,019.33 sent - needs bank confirmation',
    nextAction: 'Check bank account, confirm receipt, send thank you',
    draftReply: 'Thank you for confirming the January payment. I\'ll verify receipt with our bank today and send formal confirmation.\n\nBest regards,\nEfe',
    taskCreated: true,
    taskId: 'task-124',
    account: 'efe@dromeasyachts.com',
  },
  {
    id: '3',
    from: 'legal@navix.com',
    fromName: 'NAVIX Legal',
    subject: 'Re: T-Tops Dispute - Settlement Proposal',
    preview: 'We have reviewed your counter-proposal. While we maintain our position on the original scope...',
    receivedAt: '2026-02-10T07:45:00Z',
    entity: 'Dromeas',
    category: 'Legal',
    priority: 'critical',
    revenueImpact: 115000,
    actionRequired: true,
    summary: 'NAVIX reviewing settlement - needs response',
    nextAction: 'Review their counter-points, draft response with legal',
    draftReply: undefined, // Needs legal review first
    taskCreated: true,
    taskId: 'task-125',
    account: 'legal@dromeasyachts.com',
  },
  {
    id: '4',
    from: 'hello@verdiq.ai',
    fromName: 'Verdiq Support',
    subject: 'New Enterprise Lead - Acme Corp',
    preview: 'New enterprise inquiry from Acme Corp (500+ employees). They want to discuss pilot program...',
    receivedAt: '2026-02-10T06:30:00Z',
    entity: 'Verdiq',
    category: 'Sales',
    priority: 'high',
    revenueImpact: 50000,
    actionRequired: true,
    summary: 'Enterprise lead from Acme Corp - pilot interest',
    nextAction: 'Send enterprise deck, schedule discovery call',
    draftReply: 'Hi,\n\nExciting news about Acme Corp! I\'ll reach out to them directly today to schedule a discovery call.\n\nCan you forward their contact details?\n\nEfe',
    taskCreated: true,
    taskId: 'task-126',
    account: 'efe@dromeasyachts.com',
  },
  {
    id: '5',
    from: 'cita.previa@dgt.es',
    fromName: 'DGT Cita Previa',
    subject: 'Confirmación de solicitud - Canje permiso',
    preview: 'Su solicitud de verificación para canje de permiso de conducir ha sido registrada...',
    receivedAt: '2026-02-10T10:00:00Z',
    entity: 'Personal',
    category: 'Admin',
    priority: 'medium',
    revenueImpact: null,
    actionRequired: false,
    summary: 'DGT verification request submitted - wait for response',
    nextAction: 'Monitor DGT status online, expect 2-4 weeks',
    taskCreated: true,
    taskId: 'task-127',
    account: 'personal@gmail.com',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const getEntityConfig = (entity: Entity) => {
  return ENTITIES.find(e => e.id === entity) || ENTITIES[0];
};

const getCategoryConfig = (category: EmailCategory) => {
  return CATEGORIES.find(c => c.id === category) || CATEGORIES[4];
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
  return `€${amount}`;
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function EmailInboxPage() {
  const [emails, setEmails] = useState<ProcessedEmail[]>(SAMPLE_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<ProcessedEmail | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | 'all'>('all');
  const [showDraftPanel, setShowDraftPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = emails.filter(email => {
    if (selectedEntity !== 'all' && email.entity !== selectedEntity) return false;
    if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !email.fromName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: emails.length,
    actionRequired: emails.filter(e => e.actionRequired).length,
    withRevenue: emails.filter(e => e.revenueImpact && e.revenueImpact > 0).length,
    draftsReady: emails.filter(e => e.draftReply).length,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar - Email List */}
      <div className="w-1/2 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold">Email Triage</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                AI-Powered
              </span>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Entity Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedEntity('all')}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                selectedEntity === 'all'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All ({stats.total})
            </button>
            {ENTITIES.slice(0, 4).map(entity => {
              const count = emails.filter(e => e.entity === entity.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                    selectedEntity === entity.id
                      ? `${entity.bgColor} ${entity.color}`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {entity.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex gap-4 text-xs">
          <span className="text-slate-400">
            <span className="text-red-400 font-bold">{stats.actionRequired}</span> need action
          </span>
          <span className="text-slate-400">
            <span className="text-yellow-400 font-bold">{stats.withRevenue}</span> with €
          </span>
          <span className="text-slate-400">
            <span className="text-green-400 font-bold">{stats.draftsReady}</span> drafts ready
          </span>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emails found</p>
            </div>
          ) : (
            filteredEmails.map(email => (
              <button
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`w-full p-4 border-b border-slate-800 text-left hover:bg-slate-800/50 transition-colors ${
                  selectedEmail?.id === email.id ? 'bg-slate-800' : ''
                } ${email.priority === 'critical' ? 'border-l-2 border-l-red-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{email.fromName}</span>
                    {email.revenueImpact && email.revenueImpact > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                        {formatCurrency(email.revenueImpact)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{formatTime(email.receivedAt)}</span>
                </div>
                <div className="text-sm font-medium mb-1 truncate">{email.subject}</div>
                <div className="text-xs text-slate-400 mb-2 line-clamp-2">{email.summary}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${getEntityConfig(email.entity).bgColor} ${getEntityConfig(email.entity).color}`}>
                    {email.entity}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCategoryConfig(email.category).color}`}>
                    {email.category}
                  </span>
                  {email.actionRequired && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Action
                    </span>
                  )}
                  {email.draftReply && (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Draft
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="w-1/2 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{selectedEmail.subject}</h2>
                  <div className="text-sm text-slate-400">
                    From: <span className="text-white">{selectedEmail.fromName}</span>
                    <span className="text-slate-500 ml-2">&lt;{selectedEmail.from}&gt;</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <Archive className="w-4 h-4 text-slate-400" />
                  </button>
                  <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* AI Classification */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400 font-medium">AI CLASSIFICATION</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${getEntityConfig(selectedEmail.entity).bgColor} ${getEntityConfig(selectedEmail.entity).color}`}>
                    {selectedEmail.entity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getCategoryConfig(selectedEmail.category).color}`}>
                    {selectedEmail.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    selectedEmail.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                    selectedEmail.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {selectedEmail.priority.toUpperCase()}
                  </span>
                  {selectedEmail.revenueImpact && selectedEmail.revenueImpact > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCurrency(selectedEmail.revenueImpact)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-300 mb-2">
                  <span className="text-slate-500">Summary:</span> {selectedEmail.summary}
                </div>
                <div className="text-sm text-green-400 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  <span className="font-medium">Next Action:</span> {selectedEmail.nextAction}
                </div>
                {selectedEmail.taskCreated && (
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Task created automatically
                  </div>
                )}
              </div>
            </div>

            {/* Email Preview */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-slate-800/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-300 whitespace-pre-wrap">
                  {selectedEmail.preview}
                </div>
              </div>

              {/* Draft Reply */}
              {selectedEmail.draftReply && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">AI-Generated Draft</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 transition-colors flex items-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 transition-colors flex items-center gap-1">
                        <Send className="w-3 h-3" />
                        Send
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">
                    {selectedEmail.draftReply}
                  </div>
                </div>
              )}

              {!selectedEmail.draftReply && selectedEmail.actionRequired && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-300 mb-3">This email requires manual review before drafting</p>
                  <button className="text-xs px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-500 transition-colors">
                    Generate Draft
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">Select an email to view</p>
              <p className="text-sm">AI-processed emails appear here with auto-generated summaries and draft replies</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
