'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  AlertTriangle,
  DollarSign,
  Calendar,
  MessageSquare,
  Flag,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  Send,
  Sparkles,
  RefreshCw,
  Filter,
  Search,
  Building2,
  User,
  Ship,
  FileText,
  Plus,
} from 'lucide-react';
import { supabase, formatCurrency, formatRelativeTime } from '@/lib/supabase';

interface ExtractedNumber {
  value: number;
  currency?: string;
  context: string;
  type: string;
  confidence: number;
}

interface ExtractedDate {
  date: string;
  context: string;
  type: string;
}

interface EmailIntel {
  id: string;
  email_id: string;
  sender: string;
  subject: string;
  snippet: string;
  received_at: string;
  category: string;
  priority: string;
  urgency: string;
  summary: string;
  extracted_numbers: ExtractedNumber[];
  extracted_dates: ExtractedDate[];
  suggested_actions: string[];
  entities: any[];
  sentiment: string;
  requires_response: boolean;
  confidence_score: number;
  status: string;
  user_notes: string | null;
  flagged: boolean;
}

interface EmailComment {
  id: string;
  email_intel_id: string;
  comment: string;
  created_at: string;
  creates_todo: boolean;
  todo_text: string | null;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const categoryIcons: Record<string, React.ReactNode> = {
  supplier: <Building2 className="w-4 h-4" />,
  customer: <User className="w-4 h-4" />,
  financial: <DollarSign className="w-4 h-4" />,
  legal: <FileText className="w-4 h-4" />,
  operations: <Ship className="w-4 h-4" />,
};

export default function EmailIntelPage() {
  const [emails, setEmails] = useState<EmailIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailIntel | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  const [createTodo, setCreateTodo] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [askingAi, setAskingAi] = useState(false);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('ai_email_intel')
      .select('*')
      .order('received_at', { ascending: false });

    if (filter !== 'all') {
      if (filter === 'flagged') {
        query = query.eq('flagged', true);
      } else if (filter === 'needs_response') {
        query = query.eq('requires_response', true);
      } else if (['critical', 'high'].includes(filter)) {
        query = query.eq('priority', filter);
      } else {
        query = query.eq('category', filter);
      }
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching emails:', error);
    } else {
      setEmails(data || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/email-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      console.log('Sync result:', result);
      await fetchEmails();
    } catch (error) {
      console.error('Sync error:', error);
    }
    setSyncing(false);
  };

  const toggleFlag = async (email: EmailIntel) => {
    const { error } = await supabase
      .from('ai_email_intel')
      .update({ flagged: !email.flagged })
      .eq('id', email.id);

    if (!error) {
      setEmails(emails.map(e => e.id === email.id ? { ...e, flagged: !e.flagged } : e));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, flagged: !selectedEmail.flagged });
      }
    }
  };

  const updateStatus = async (email: EmailIntel, status: string) => {
    const { error } = await supabase
      .from('ai_email_intel')
      .update({ status })
      .eq('id', email.id);

    if (!error) {
      setEmails(emails.map(e => e.id === email.id ? { ...e, status } : e));
      if (selectedEmail?.id === email.id) {
        setSelectedEmail({ ...selectedEmail, status });
      }
    }
  };

  const addComment = async () => {
    if (!selectedEmail || !newComment.trim()) return;

    // Save comment
    const { error } = await supabase.from('ai_email_comments').insert({
      email_intel_id: selectedEmail.id,
      comment: newComment,
      creates_todo: createTodo,
      todo_text: createTodo ? newComment : null,
    });

    if (!error) {
      // If creates_todo, also add to tasks
      if (createTodo) {
        await supabase.from('tasks').insert({
          title: `[Email] ${newComment}`,
          description: `From email: ${selectedEmail.subject}\nSender: ${selectedEmail.sender}`,
          priority: selectedEmail.priority === 'critical' ? 'high' : 'medium',
          status: 'pending',
          source_type: 'email',
          source_id: selectedEmail.id,
        });
      }

      // Update user_notes on the email
      await supabase
        .from('ai_email_intel')
        .update({
          user_notes: selectedEmail.user_notes
            ? `${selectedEmail.user_notes}\n---\n${newComment}`
            : newComment
        })
        .eq('id', selectedEmail.id);

      setNewComment('');
      setCreateTodo(false);
      fetchEmails();
    }
  };

  const askAI = async () => {
    if (!selectedEmail || !aiQuestion.trim()) return;

    setAskingAi(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: `Email from ${selectedEmail.sender}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.snippet}\n\nAI Summary: ${selectedEmail.summary}`,
          question: aiQuestion,
        }),
      });

      const result = await response.json();
      setAiResponse(result.answer || 'Unable to get response');
    } catch (error) {
      setAiResponse('Error asking AI. Please try again.');
    }

    setAskingAi(false);
  };

  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(query) ||
      email.sender?.toLowerCase().includes(query) ||
      email.summary?.toLowerCase().includes(query)
    );
  });

  // Calculate stats
  const stats = {
    total: emails.length,
    critical: emails.filter(e => e.priority === 'critical').length,
    needsResponse: emails.filter(e => e.requires_response && e.status !== 'responded').length,
    flagged: emails.filter(e => e.flagged).length,
    totalAmount: emails.reduce((sum, e) => {
      const numbers = e.extracted_numbers || [];
      return sum + numbers.reduce((s, n) => s + (n.value || 0), 0);
    }, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Email Intelligence
            </h1>
            <p className="text-sm text-gray-500">AI-powered email analysis and action tracking</p>
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Emails</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-xs text-gray-500">Critical</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">{stats.needsResponse}</div>
            <div className="text-xs text-gray-500">Needs Response</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
            <div className="text-xs text-gray-500">Flagged</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</div>
            <div className="text-xs text-gray-500">Extracted Amounts</div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Email List */}
        <div className="w-1/2 border-r bg-white overflow-y-auto">
          {/* Filters */}
          <div className="sticky top-0 bg-white border-b px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm border-0 focus:ring-0 outline-none"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'critical', 'high', 'flagged', 'needs_response', 'supplier', 'customer', 'financial'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs rounded-full ${
                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Email Items */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading emails...</div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Mail className="w-12 h-12 mb-2 opacity-50" />
              <p>No emails found</p>
              <button
                onClick={triggerSync}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                Sync now to fetch emails
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${priorityColors[email.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">{email.sender}</span>
                        {email.flagged && <Flag className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        {email.requires_response && <MessageSquare className="w-3 h-3 text-blue-500" />}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{email.subject}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{email.summary}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          email.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          email.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {email.priority}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
                          {email.category}
                        </span>
                        {(email.extracted_numbers?.length || 0) > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">
                            <DollarSign className="w-3 h-3 inline" />
                            {email.extracted_numbers.length}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatRelativeTime(email.received_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="w-1/2 bg-white overflow-y-auto">
          {selectedEmail ? (
            <div className="p-6">
              {/* Email Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFlag(selectedEmail)}
                      className={`p-2 rounded-lg ${selectedEmail.flagged ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'}`}
                    >
                      <Flag className={`w-5 h-5 ${selectedEmail.flagged ? 'fill-yellow-500' : ''}`} />
                    </button>
                    <select
                      value={selectedEmail.status}
                      onChange={(e) => updateStatus(selectedEmail, e.target.value)}
                      className="text-sm border rounded-lg px-3 py-2"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="responded">Responded</option>
                      <option value="action_taken">Action Taken</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  From: <span className="text-gray-700">{selectedEmail.sender}</span>
                  <span className="mx-2">|</span>
                  {formatRelativeTime(selectedEmail.received_at)}
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                  <Sparkles className="w-4 h-4" />
                  AI Summary
                  <span className="text-xs bg-purple-200 px-2 py-0.5 rounded ml-2">
                    {Math.round((selectedEmail.confidence_score || 0) * 100)}% confident
                  </span>
                </div>
                <p className="text-gray-700">{selectedEmail.summary}</p>
              </div>

              {/* Extracted Numbers */}
              {selectedEmail.extracted_numbers?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Extracted Numbers
                  </h3>
                  <div className="space-y-2">
                    {selectedEmail.extracted_numbers.map((num, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                        <div>
                          <div className="font-bold text-green-700">
                            {num.currency || 'EUR'} {num.value?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{num.context}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {num.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.round((num.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Dates */}
              {selectedEmail.extracted_dates?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Key Dates
                  </h3>
                  <div className="space-y-2">
                    {selectedEmail.extracted_dates.map((date, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <div>
                          <div className="font-medium text-blue-700">
                            {new Date(date.date).toLocaleDateString('en-GB', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">{date.context}</div>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {date.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {selectedEmail.suggested_actions?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    Suggested Actions
                  </h3>
                  <div className="space-y-2">
                    {selectedEmail.suggested_actions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-sm text-gray-700">{action}</span>
                        <button className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Create Task
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Notes */}
              {selectedEmail.user_notes && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Notes</h3>
                  <div className="bg-yellow-50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                    {selectedEmail.user_notes}
                  </div>
                </div>
              )}

              {/* Add Comment */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Add Comment</h3>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your notes... (e.g., 'Should be €28K not €25K - verify with PO')"
                  className="w-full border rounded-lg p-3 text-sm resize-none h-24"
                />
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={createTodo}
                      onChange={(e) => setCreateTodo(e.target.checked)}
                      className="rounded"
                    />
                    Create TODO from this comment
                  </label>
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save Comment
                  </button>
                </div>
              </div>

              {/* AI Chat */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Ask AI About This Email
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askAI()}
                    placeholder="What's the payment history? Is this urgent? What should I do?"
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={askAI}
                    disabled={askingAi || !aiQuestion.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                  >
                    {askingAi ? '...' : 'Ask'}
                  </button>
                </div>
                {aiResponse && (
                  <div className="mt-3 bg-purple-50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                      <Sparkles className="w-4 h-4" />
                      AI Response
                    </div>
                    <p className="text-gray-700">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mail className="w-16 h-16 mb-4 opacity-30" />
              <p>Select an email to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
