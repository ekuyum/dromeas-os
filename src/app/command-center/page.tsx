'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bike,
  Home,
  Plane,
  Heart,
  Dog,
  Baby,
  Briefcase,
  Phone,
  FileText,
  TrendingUp,
  Zap,
  Brain,
  Users,
  Ship,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  mission,
  finances,
  deadlines,
  motorcycleTrigger,
  barcelonaRelocation,
  weeklyRhythm,
  barcelona505050,
  marathon,
  openQuestions,
  risks,
  highestLeverageAction,
  entities,
  family,
  revenueProjections,
} from '@/data/master-knowledge-base';

// Calculate days remaining
const calculateDaysRemaining = () => {
  const dDay = new Date('2026-11-30');
  const today = new Date();
  const diffTime = dDay.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get today's theme
const getTodayTheme = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  return weeklyRhythm[today as keyof typeof weeklyRhythm];
};

export default function CommandCenterPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dday: true,
    today: true,
    critical: true,
    money: false,
    barcelona: false,
    family: false,
    marathon: false,
    risks: false,
  });

  const daysRemaining = calculateDaysRemaining();
  const todayTheme = getTodayTheme();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-400" />
              DOS Command Center
            </h1>
            <p className="text-slate-400 mt-1">Operation Kuyumcu 2026 — Single Dashboard, Zero Context-Switching</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Today&apos;s Date</div>
            <div className="text-lg font-semibold">{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* D-Day Countdown - Always Visible */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl p-6 mb-6 border border-red-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-300 text-sm font-medium mb-1">
              <Target className="w-4 h-4" />
              D-DAY: NOVEMBER 30, 2026
            </div>
            <div className="text-5xl font-black text-white">{daysRemaining} DAYS</div>
            <div className="text-slate-300 mt-2">€2M Cash + Barcelona Apartment + Parents Reserve</div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {mission.targets.slice(0, 4).map((target, idx) => (
              <div key={idx} className="bg-black/30 rounded-lg p-3 min-w-[140px]">
                <div className="text-xs text-slate-400">{target.target}</div>
                <div className="text-lg font-bold">{target.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Theme - Always Visible */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-4 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-sm text-purple-300">Today&apos;s Theme</div>
              <div className="text-xl font-bold">{todayTheme?.theme || 'EXECUTE'}</div>
            </div>
          </div>
          <div className="text-slate-300">{todayTheme?.focus || 'Focus on what matters'}</div>
        </div>
      </div>

      {/* Highest Leverage Action */}
      <div
        className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-4 mb-6 border border-green-500/30 cursor-pointer"
        onClick={() => toggleSection('leverage')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-sm text-green-300">🎯 HIGHEST LEVERAGE ACTION (4-AI Consensus)</div>
              <div className="text-xl font-bold">{highestLeverageAction.action}</div>
            </div>
          </div>
          {expandedSections.leverage ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
        {expandedSections.leverage && (
          <div className="mt-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-green-300 mb-2">Why This Action:</div>
                <ul className="space-y-1">
                  {highestLeverageAction.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm text-green-300 mb-2">Expected Outcomes:</div>
                <div className="space-y-2">
                  <div className="bg-green-900/30 rounded p-2">
                    <div className="text-xs text-green-300">Best Case</div>
                    <div className="text-sm">{highestLeverageAction.expectedOutcomes.best}</div>
                  </div>
                  <div className="bg-yellow-900/30 rounded p-2">
                    <div className="text-xs text-yellow-300">Good Case</div>
                    <div className="text-sm">{highestLeverageAction.expectedOutcomes.good}</div>
                  </div>
                  <div className="bg-blue-900/30 rounded p-2">
                    <div className="text-xs text-blue-300">Baseline</div>
                    <div className="text-sm">{highestLeverageAction.expectedOutcomes.baseline}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Critical Tasks This Week */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('critical')}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className="font-semibold">🔴 CRITICAL THIS WEEK</h2>
            </div>
            {expandedSections.critical ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.critical && (
            <div className="p-4 space-y-3">
              {barcelonaRelocation.criticalThisWeek.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${task.status === 'BOOKED' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <div>
                      <div className="font-medium">{task.task}</div>
                      <div className="text-sm text-slate-400">{task.deadline}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.status === 'BOOKED' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Key Deadlines */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('deadlines')}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">📅 KEY DEADLINES</h2>
            </div>
            {expandedSections.deadlines ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.deadlines && (
            <div className="p-4 space-y-2">
              {deadlines.map((deadline, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      deadline.priority === 'critical' ? 'bg-red-500' :
                      deadline.priority === 'high' ? 'bg-orange-500' :
                      deadline.priority === 'reward' ? 'bg-green-500' :
                      deadline.priority === 'mission' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                    <span>{deadline.event}</span>
                  </div>
                  <span className="text-slate-400">{deadline.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Motorcycle Trigger */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('motorcycle')}
          >
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold">🏍️ MOTORCYCLE TRIGGER (April 30)</h2>
            </div>
            {expandedSections.motorcycle ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.motorcycle && (
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-400 mb-3">ALL MET = BUY IN MAY (€8K)</p>
              {motorcycleTrigger.criteria.map((criterion, idx) => {
                const progress = (criterion.current / criterion.target) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{criterion.metric}</span>
                      <span>€{criterion.current.toLocaleString()} / €{criterion.target.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revenue Pipeline */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('revenue')}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <h2 className="font-semibold">💰 REVENUE PROJECTIONS</h2>
            </div>
            {expandedSections.revenue ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.revenue && (
            <div className="p-4 space-y-2">
              {revenueProjections.byNovember30.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm">{source.source}</span>
                  <span className="font-mono">€{source.target.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>GROSS TOTAL</span>
                  <span className="text-green-400">€{revenueProjections.grossTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>After Beckham Tax (24%)</span>
                  <span>€{revenueProjections.afterBeckhamTax.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Family Section */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('family')}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <h2 className="font-semibold">👨‍👩‍👧 FAMILY</h2>
            </div>
            {expandedSections.family ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.family && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-pink-300 mb-1">Wife</div>
                  <div className="font-medium">{family.wife.name}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-pink-300 mb-1">Daughter ({family.daughter.age} years)</div>
                  <div className="font-medium">{family.daughter.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{family.daughter.school}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-amber-300 mb-1">Dog</div>
                  <div className="font-medium">{family.pets.dog.name}</div>
                  <div className="text-xs text-slate-400">{family.pets.dog.breed}, {family.pets.dog.weight}, Age {family.pets.dog.age}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-purple-300 mb-1">Cat</div>
                  <div className="font-medium">{family.pets.cat.name}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Marathon Training */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('marathon')}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              <h2 className="font-semibold">🏃 MARATHON (March 16)</h2>
            </div>
            {expandedSections.marathon ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.marathon && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Current Weight</div>
                  <div className="text-xl font-bold">{marathon.currentWeight}kg</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400">Target Weight</div>
                  <div className="text-xl font-bold text-green-400">{marathon.targetWeight}kg</div>
                </div>
              </div>
              <div className="text-sm text-slate-300">Protocol: {marathon.protocol}</div>
              <div className="space-y-2">
                {marathon.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded border ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-500'}`} />
                    <span className={task.status === 'completed' ? 'line-through text-slate-500' : ''}>{task.task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 50-50-50 Challenge */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('505050')}
          >
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-cyan-400" />
              <h2 className="font-semibold">🗺️ 50-50-50 BARCELONA CHALLENGE</h2>
            </div>
            {expandedSections['505050'] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections['505050'] && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">{barcelona505050.restaurants.current}</div>
                  <div className="text-xs text-slate-400">/ {barcelona505050.restaurants.target} Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{barcelona505050.culturalActivities.current}</div>
                  <div className="text-xs text-slate-400">/ {barcelona505050.culturalActivities.target} Cultural</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{barcelona505050.dayTrips.current}</div>
                  <div className="text-xs text-slate-400">/ {barcelona505050.dayTrips.target} Day Trips</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Monitor */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700">
          <div
            className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
            onClick={() => toggleSection('risks')}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="font-semibold">⚠️ RISK MONITOR</h2>
            </div>
            {expandedSections.risks ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          {expandedSections.risks && (
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {risks.map((risk, idx) => (
                <div key={idx} className="bg-slate-900/50 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{risk.risk}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      risk.probability >= 40 ? 'bg-red-500/20 text-red-300' :
                      risk.probability >= 25 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {risk.probability}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{risk.mitigation}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Open Questions */}
      <div className="mt-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <div
          className="p-4 border-b border-slate-700 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('questions')}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h2 className="font-semibold">❓ OPEN QUESTIONS (Need Resolution)</h2>
          </div>
          {expandedSections.questions ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
        {expandedSections.questions && (
          <div className="p-4 grid md:grid-cols-2 gap-3">
            {openQuestions.map((q, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-sm mb-1">{q.question}</div>
                <div className="text-xs text-blue-300">Action: {q.action}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* The Creed */}
      <div className="mt-6 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-6 border border-slate-600">
        <h3 className="text-lg font-semibold mb-4 text-center">THE COUNCIL CREED</h3>
        <div className="grid md:grid-cols-5 gap-4 text-center text-sm">
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-purple-400 font-medium">Aurelius</div>
            <div className="text-slate-300 text-xs mt-1">Focus only on what I control</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-red-400 font-medium">Jocko</div>
            <div className="text-slate-300 text-xs mt-1">Discipline equals freedom</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-green-400 font-medium">Hormozi</div>
            <div className="text-slate-300 text-xs mt-1">Hell Yes or No</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-orange-400 font-medium">Goggins</div>
            <div className="text-slate-300 text-xs mt-1">I&apos;m only 40% done</div>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3">
            <div className="text-blue-400 font-medium">Atatürk</div>
            <div className="text-slate-300 text-xs mt-1">Build the runway first</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>&quot;Vision without execution is hallucination.&quot; — Thomas Edison</p>
        <p className="mt-1">DOS v4.0 | Operation Kuyumcu 2026 | The surfboard is booked.</p>
      </div>
    </div>
  );
}
