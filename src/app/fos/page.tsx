'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Brain,
  Ship,
  Sparkles,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  CircleDollarSign,
  AlertCircle,
  Play,
  BarChart3,
  Filter,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type Entity = 'Personal' | 'Dromeas' | 'Eyadera' | 'Brújula' | 'Verdiq' | 'Lobo Blu' | 'Identio';
type Priority = 'critical' | 'high' | 'medium' | 'low';
type LeverageType = 'DO' | 'DELEGATE' | 'AUTOMATE' | 'ELIMINATE';
type CashTiming = 'This Week' | 'This Month' | 'This Quarter' | 'Later';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  entity: Entity | null;
  revenue_impact: number | null;
  leverage_type: LeverageType | null;
  cash_timing?: CashTiming;
  blocker_type?: string;
  due_date?: string;
  next_action?: string;
}

// ============================================================================
// ENTITY CONFIG
// ============================================================================
const ENTITIES: { id: Entity; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { id: 'Personal', label: 'Personal', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/50' },
  { id: 'Dromeas', label: 'Dromeas', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50' },
  { id: 'Eyadera', label: 'Eyadera', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50' },
  { id: 'Brújula', label: 'Brújula', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/50' },
  { id: 'Verdiq', label: 'Verdiq', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/50' },
  { id: 'Lobo Blu', label: 'Lobo Blu', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20', borderColor: 'border-indigo-500/50' },
  { id: 'Identio', label: 'Identio', color: 'text-gray-400', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/50' },
];

// ============================================================================
// SAMPLE TASKS (Same as Tasks page - will be shared via context/API)
// ============================================================================
const INITIAL_TASKS: Task[] = [
  // DROMEAS - Primary Revenue Driver
  {
    id: '1',
    title: 'Call Lotus Investment Group',
    description: 'Discuss €200-500K bridge financing and €1M receivable timeline',
    priority: 'critical',
    status: 'todo',
    entity: 'Dromeas',
    revenue_impact: 500000,
    leverage_type: 'DO',
    cash_timing: 'This Month',
    next_action: 'Schedule call for this week',
  },
  {
    id: '2',
    title: 'NAVIX €115K Resolution',
    description: 'Negotiate T-Tops dispute - production blocker',
    priority: 'critical',
    status: 'blocked',
    entity: 'Dromeas',
    revenue_impact: 115000,
    leverage_type: 'DO',
    blocker_type: 'Legal',
    next_action: 'Send settlement proposal email',
  },
  {
    id: '3',
    title: 'Soyaslan MOU Collection',
    description: '€630K across 9 installments - first payment due',
    priority: 'critical',
    status: 'in_progress',
    entity: 'Dromeas',
    revenue_impact: 630174,
    leverage_type: 'DO',
    cash_timing: 'This Month',
    next_action: 'Confirm Jan 20 payment received',
  },
  {
    id: '4',
    title: 'Greek Dealer Outreach',
    description: 'Identify and contact dealers in Athens, Thessaloniki',
    priority: 'high',
    status: 'todo',
    entity: 'Dromeas',
    revenue_impact: 200000,
    leverage_type: 'DELEGATE',
    cash_timing: 'This Quarter',
    next_action: 'Research top 5 Greek marinas',
  },
  // PERSONAL - Relocation Critical
  {
    id: '5',
    title: 'Padrón Appointment',
    description: 'OAC Monumental, C. Sicilia 216',
    priority: 'critical',
    status: 'todo',
    entity: 'Personal',
    revenue_impact: null,
    leverage_type: 'DO',
    due_date: '2026-02-11',
    next_action: 'Bring NIE + rental contract',
  },
  {
    id: '6',
    title: 'DGT Driver License Verification',
    description: 'Start verification process TODAY - sede.dgt.gob.es',
    priority: 'critical',
    status: 'todo',
    entity: 'Personal',
    revenue_impact: null,
    leverage_type: 'DO',
    next_action: 'Submit online form with NIE + Turkish license',
  },
  {
    id: '7',
    title: 'TIE Application',
    description: 'After Padrón - fingerprint appointment needed',
    priority: 'high',
    status: 'todo',
    entity: 'Personal',
    revenue_impact: null,
    leverage_type: 'DO',
    next_action: 'Wait for Padrón certificate',
  },
  {
    id: '8',
    title: 'Beckham Law Application',
    description: 'CRITICAL - €500K+ tax impact - Deadline July 16',
    priority: 'critical',
    status: 'todo',
    entity: 'Personal',
    revenue_impact: 500000,
    leverage_type: 'DO',
    due_date: '2026-07-16',
    next_action: 'Contact gestoría this week',
  },
  // EYADERA - AI Consulting
  {
    id: '9',
    title: 'Eyadera Service Packages',
    description: 'Finalize AI Readiness Audit + Implementation Sprint offers',
    priority: 'high',
    status: 'in_progress',
    entity: 'Eyadera',
    revenue_impact: 75000,
    leverage_type: 'DO',
    cash_timing: 'This Month',
    next_action: 'Create landing page + pricing',
  },
  {
    id: '10',
    title: 'US Client Outreach',
    description: 'Target SMBs for AI consulting at $150-350/hr',
    priority: 'high',
    status: 'todo',
    entity: 'Eyadera',
    revenue_impact: 50000,
    leverage_type: 'DO',
    cash_timing: 'This Month',
    next_action: 'LinkedIn outreach campaign',
  },
  // BRÚJULA
  {
    id: '11',
    title: 'Brújula Invoicing Setup',
    description: 'Spanish entity for EU invoicing',
    priority: 'medium',
    status: 'todo',
    entity: 'Brújula',
    revenue_impact: 10000,
    leverage_type: 'DELEGATE',
    next_action: 'Configure Xero for Brújula',
  },
  // VERDIQ
  {
    id: '12',
    title: 'Verdiq Metrics Review',
    description: 'Check signups since Dec 16 launch',
    priority: 'high',
    status: 'todo',
    entity: 'Verdiq',
    revenue_impact: 50000,
    leverage_type: 'DO',
    next_action: 'Access dashboard, review funnel',
  },
  {
    id: '13',
    title: 'Verdiq Enterprise Pilots',
    description: 'Target 2 enterprise pilots by April',
    priority: 'high',
    status: 'todo',
    entity: 'Verdiq',
    revenue_impact: 100000,
    leverage_type: 'DO',
    cash_timing: 'This Quarter',
    next_action: 'Identify 10 enterprise targets',
  },
  // LOBO BLU
  {
    id: '14',
    title: 'Lobo Blu Launch Sprint',
    description: '2 weekends to complete Shopify + AutoDS setup',
    priority: 'medium',
    status: 'todo',
    entity: 'Lobo Blu',
    revenue_impact: 5000,
    leverage_type: 'DO',
    cash_timing: 'This Month',
    next_action: 'Schedule weekend sprint',
  },
];

// ============================================================================
// WEEKLY RHYTHM
// ============================================================================
const weeklyRhythm = {
  monday: { theme: 'CASH DAY 💰', focus: 'Collections, receivables, money hunting', color: 'from-green-900/50 to-emerald-900/50' },
  tuesday: { theme: 'ADMIN DAY 📋', focus: 'Legal, bureaucracy, paperwork (2h cap)', color: 'from-yellow-900/50 to-orange-900/50' },
  wednesday: { theme: 'BUILD DAY 🔨', focus: 'Production, NAVIX, technical', color: 'from-blue-900/50 to-indigo-900/50' },
  thursday: { theme: 'DEAL DAY 🤝', focus: 'Dealers, negotiations, sales', color: 'from-purple-900/50 to-pink-900/50' },
  friday: { theme: 'REVIEW DAY 📊', focus: 'Inbox zero, scorecard, planning', color: 'from-cyan-900/50 to-teal-900/50' },
  saturday: { theme: 'FAMILY DAY 👨‍👩‍👧', focus: 'Yasemin, Derya, Barcelona', color: 'from-pink-900/50 to-rose-900/50' },
  sunday: { theme: 'WAR ROOM 🎯', focus: '60-min planning, week preview', color: 'from-slate-800/50 to-slate-700/50' },
};

// ============================================================================
// REVENUE TARGETS
// ============================================================================
const revenueTargets = [
  { entity: 'Dromeas', target: 2800000, collected: 0, color: 'bg-blue-500' },
  { entity: 'Eyadera', target: 530000, collected: 0, color: 'bg-green-500' },
  { entity: 'Verdiq', target: 500000, collected: 0, color: 'bg-cyan-500' },
  { entity: 'Brújula', target: 87000, collected: 0, color: 'bg-orange-500' },
  { entity: 'Lobo Blu', target: 38000, collected: 0, color: 'bg-indigo-500' },
];

// ============================================================================
// BLOCKERS
// ============================================================================
const blockers = [
  { id: 'navix', title: 'NAVIX T-Tops', amount: 115000, status: 'BLOCKER', entity: 'Dromeas', impact: 'Production halted' },
  { id: 'turkey', title: 'Dromeas Turkey Konkordato', amount: null, status: 'IN_PROCEEDINGS', entity: 'Dromeas', impact: 'Legal monitoring' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const calculateDaysRemaining = () => {
  const dDay = new Date('2026-11-30');
  const today = new Date();
  const diffTime = dDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getTodayTheme = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return weeklyRhythm[today as keyof typeof weeklyRhythm];
};

const getHighestLeverageAction = (tasks: Task[]): Task | null => {
  const activeTasks = tasks.filter(t => t.status !== 'done');

  // Priority: Blocked critical → Critical with revenue → Critical → High with revenue
  const blockedCritical = activeTasks.find(t => t.status === 'blocked' && t.priority === 'critical');
  if (blockedCritical) return blockedCritical;

  const criticalWithRevenue = activeTasks
    .filter(t => t.priority === 'critical' && t.revenue_impact && t.revenue_impact > 0 && t.leverage_type === 'DO')
    .sort((a, b) => (b.revenue_impact || 0) - (a.revenue_impact || 0))[0];
  if (criticalWithRevenue) return criticalWithRevenue;

  const critical = activeTasks.find(t => t.priority === 'critical' && t.leverage_type === 'DO');
  if (critical) return critical;

  const highWithRevenue = activeTasks
    .filter(t => t.priority === 'high' && t.revenue_impact && t.revenue_impact > 0)
    .sort((a, b) => (b.revenue_impact || 0) - (a.revenue_impact || 0))[0];
  if (highWithRevenue) return highWithRevenue;

  return activeTasks[0] || null;
};

const getMoneyMoves = (tasks: Task[]): Task[] => {
  return tasks
    .filter(t => t.status !== 'done' && t.revenue_impact && t.revenue_impact > 0)
    .sort((a, b) => (b.revenue_impact || 0) - (a.revenue_impact || 0))
    .slice(0, 3);
};

const getEntityConfig = (entity: Entity | null) => {
  return ENTITIES.find(e => e.id === entity) || ENTITIES[0];
};

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
  return `€${amount}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function FOSCommandCenter() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedEntity, setSelectedEntity] = useState<Entity | 'all'>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    revenue: true,
    blockers: true,
    rhythm: false,
  });

  const daysRemaining = calculateDaysRemaining();
  const todayTheme = getTodayTheme();
  const hla = getHighestLeverageAction(tasks);
  const moneyMoves = getMoneyMoves(tasks);

  const filteredTasks = selectedEntity === 'all'
    ? tasks
    : tasks.filter(t => t.entity === selectedEntity);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate entity stats
  const entityStats = ENTITIES.map(entity => ({
    ...entity,
    taskCount: tasks.filter(t => t.entity === entity.id && t.status !== 'done').length,
    revenueImpact: tasks
      .filter(t => t.entity === entity.id && t.status !== 'done' && t.revenue_impact)
      .reduce((sum, t) => sum + (t.revenue_impact || 0), 0),
  }));

  const totalPipelineValue = tasks
    .filter(t => t.status !== 'done' && t.revenue_impact)
    .reduce((sum, t) => sum + (t.revenue_impact || 0), 0);

  const weeklyTarget = 47782; // €2M / 42 weeks
  const cashCollectedThisWeek = 0; // Will be dynamic

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold">FOS 2.0 Command Center</h1>
                <p className="text-sm text-slate-400">€2M Cash Collection Mission</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <Link href="/tasks" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 justify-end">
                View All Tasks <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* D-Day Countdown + Today's Theme Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* D-Day */}
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl p-6 border border-red-500/30">
            <div className="flex items-center gap-2 text-red-300 text-sm font-medium mb-2">
              <Target className="w-4 h-4" />
              D-DAY: NOVEMBER 30, 2026
            </div>
            <div className="text-5xl font-black">{daysRemaining} DAYS</div>
            <div className="text-slate-300 mt-2 text-sm">€2M Cash + Barcelona Apartment + Family Secured</div>
          </div>

          {/* Today's Theme */}
          <div className={`bg-gradient-to-r ${todayTheme.color} rounded-xl p-6 border border-purple-500/30`}>
            <div className="flex items-center gap-2 text-purple-300 text-sm font-medium mb-2">
              <Zap className="w-4 h-4" />
              TODAY&apos;S THEME
            </div>
            <div className="text-3xl font-bold">{todayTheme.theme}</div>
            <div className="text-slate-300 mt-2 text-sm">{todayTheme.focus}</div>
          </div>
        </div>

        {/* Entity Filter Bar */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">ENTITY FOCUS</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedEntity('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedEntity === 'all'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All ({tasks.filter(t => t.status !== 'done').length})
            </button>
            {entityStats.map(entity => (
              <button
                key={entity.id}
                onClick={() => setSelectedEntity(entity.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedEntity === entity.id
                    ? `${entity.bgColor} ${entity.color} border ${entity.borderColor}`
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {entity.label}
                <span className="text-xs opacity-75">
                  {entity.taskCount}
                  {entity.revenueImpact > 0 && ` · ${formatCurrency(entity.revenueImpact)}`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* HLA + Money Moves Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Highest Leverage Action */}
          {hla && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-300 text-sm font-medium mb-3">
                <Sparkles className="w-4 h-4" />
                🎯 HIGHEST LEVERAGE ACTION
              </div>
              <div className="text-xl font-bold mb-2">{hla.title}</div>
              {hla.description && (
                <p className="text-slate-300 text-sm mb-3">{hla.description}</p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                {hla.entity && (
                  <span className={`text-xs px-2 py-1 rounded ${getEntityConfig(hla.entity).bgColor} ${getEntityConfig(hla.entity).color}`}>
                    {hla.entity}
                  </span>
                )}
                {hla.revenue_impact && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                    <CircleDollarSign className="w-3 h-3" />
                    {formatCurrency(hla.revenue_impact)}
                  </span>
                )}
                {hla.status === 'blocked' && (
                  <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300">
                    BLOCKED
                  </span>
                )}
              </div>
              {hla.next_action && (
                <div className="mt-4 pt-4 border-t border-green-500/20">
                  <div className="text-xs text-green-300 mb-1">NEXT ACTION:</div>
                  <div className="text-sm text-white flex items-center gap-2">
                    <Play className="w-3 h-3" />
                    {hla.next_action}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Money Moves */}
          <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-300 text-sm font-medium mb-3">
              <DollarSign className="w-4 h-4" />
              💰 TOP 3 MONEY MOVES
            </div>
            <div className="space-y-3">
              {moneyMoves.map((task, idx) => (
                <div key={task.id} className="flex items-center justify-between bg-slate-900/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-yellow-400">{idx + 1}</span>
                    <div>
                      <div className="font-medium text-sm">{task.title}</div>
                      <div className="text-xs text-slate-400">{task.entity}</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-yellow-300">
                    {formatCurrency(task.revenue_impact || 0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-500/20 flex justify-between items-center">
              <span className="text-xs text-yellow-300">TOTAL PIPELINE</span>
              <span className="text-xl font-bold">{formatCurrency(totalPipelineValue)}</span>
            </div>
          </div>
        </div>

        {/* Cash Scoreboard */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold">CASH SCOREBOARD</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">Weekly Target</div>
              <div className="font-bold text-green-400">{formatCurrency(weeklyTarget)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">This Week</span>
              <span className="font-medium">{formatCurrency(cashCollectedThisWeek)} / {formatCurrency(weeklyTarget)}</span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                style={{ width: `${Math.min((cashCollectedThisWeek / weeklyTarget) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Revenue by Entity */}
          <div
            className="cursor-pointer"
            onClick={() => toggleSection('revenue')}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Revenue by Entity</span>
              {expandedSections.revenue ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>

          {expandedSections.revenue && (
            <div className="space-y-3">
              {revenueTargets.map(rev => (
                <div key={rev.entity}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{rev.entity}</span>
                    <span className="text-slate-400">{formatCurrency(rev.collected)} / {formatCurrency(rev.target)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${rev.color} transition-all`}
                      style={{ width: `${Math.min((rev.collected / rev.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blockers Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('blockers')}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="font-semibold">⚠️ ACTIVE BLOCKERS</h2>
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300">{blockers.length}</span>
            </div>
            {expandedSections.blockers ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>

          {expandedSections.blockers && (
            <div className="p-4 pt-0 space-y-3">
              {blockers.map(blocker => (
                <div key={blocker.id} className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{blocker.title}</div>
                    {blocker.amount && (
                      <span className="text-red-300 font-bold">{formatCurrency(blocker.amount)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">{blocker.entity}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      blocker.status === 'BLOCKER' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {blocker.status}
                    </span>
                    <span className="text-slate-400">{blocker.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Rhythm Reference */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('rhythm')}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">📅 WEEKLY RHYTHM</h2>
            </div>
            {expandedSections.rhythm ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>

          {expandedSections.rhythm && (
            <div className="p-4 pt-0 grid md:grid-cols-7 gap-2">
              {Object.entries(weeklyRhythm).map(([day, info]) => {
                const isToday = day === ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
                return (
                  <div
                    key={day}
                    className={`rounded-lg p-3 text-center ${
                      isToday ? 'bg-purple-500/30 border border-purple-500/50' : 'bg-slate-900/50'
                    }`}
                  >
                    <div className="text-xs text-slate-400 capitalize mb-1">{day}</div>
                    <div className="text-sm font-medium">{info.theme.split(' ')[0]}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/tasks" className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700 transition-all group">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium">All Tasks</div>
                <div className="text-sm text-slate-400">{tasks.filter(t => t.status !== 'done').length} active</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <Link href="/barcelona/relocation" className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700 transition-all group">
            <div className="flex items-center gap-3">
              <Ship className="w-6 h-6 text-purple-400" />
              <div>
                <div className="font-medium">Relocation</div>
                <div className="text-sm text-slate-400">Barcelona Admin</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <Link href="/command-center" className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 border border-slate-700 transition-all group">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <div>
                <div className="font-medium">Full Dashboard</div>
                <div className="text-sm text-slate-400">Legacy View</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-medium">Email Triage</div>
                <div className="text-sm text-slate-400">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm py-6">
          <p>&quot;If it doesn&apos;t tie to cash collected, it&apos;s noise.&quot; — Hormozi</p>
          <p className="mt-1">FOS 2.0 | Operation Kuyumcu | D-Day: {daysRemaining} days</p>
        </div>
      </div>
    </div>
  );
}
