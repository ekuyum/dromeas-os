'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Target,
  Compass,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Ship,
  Users,
  Calendar,
  Zap,
  ArrowRight,
  ChevronRight,
  Percent,
  HelpCircle,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/supabase'

// ========================================
// STRATEGIC DATA - ETCHED IN STONE
// From DROMEAS_OPERATIONAL_BLUEPRINT_V3.md
// ========================================

const COMPANY_VISION = {
  tagline: "AI-First Marine Company",
  northStar: "€100M Revenue in 5 Years",
  mission: "Build the world's smartest boat company. One founder, AI-powered operations, European craftsmanship, global reach.",
  values: [
    "Transparency over games",
    "Quality over quantity",
    "Cash flow over vanity metrics",
    "Execution over planning",
  ],
}

const YEAR_TARGETS = [
  { year: 1, boats: 25, avgPrice: 200000, revenue: 5000000, ebitda: -10, status: 'current' },
  { year: 2, boats: 80, avgPrice: 240000, revenue: 19200000, ebitda: 22, status: 'future' },
  { year: 3, boats: 120, avgPrice: 280000, revenue: 33600000, ebitda: 20, status: 'future' },
  { year: 4, boats: 180, avgPrice: 320000, revenue: 57600000, ebitda: 18, status: 'future' },
  { year: 5, boats: 280, avgPrice: 360000, revenue: 100800000, ebitda: 18, status: 'future' },
]

const NINETY_DAY_METRICS = [
  { metric: 'Yard contract signed', target: '✓', stretch: '-', status: 'pending', priority: 'critical' },
  { metric: 'Molds recovered/timeline clear', target: '✓', stretch: '-', status: 'pending', priority: 'critical' },
  { metric: 'Deposits collected', target: '10', stretch: '15', status: 'pending', current: 0, priority: 'high' },
  { metric: 'Dealer agreements', target: '5', stretch: '8', status: 'pending', current: 0, priority: 'high' },
  { metric: 'Bridge funding', target: '€500K', stretch: '€1M', status: 'pending', current: 0, priority: 'high' },
  { metric: 'COO hired', target: 'Identified', stretch: 'Started', status: 'pending', priority: 'medium' },
  { metric: 'First prototype complete', target: '✓', stretch: '-', status: 'pending', priority: 'medium' },
  { metric: 'CE certification', target: 'In progress', stretch: 'Complete', status: 'pending', priority: 'medium' },
]

const KEY_DECISIONS = [
  {
    id: 1,
    question: 'Poland vs. Hungary Production?',
    recommendation: 'Poland (Model Art) as primary',
    deadline: 'Week 2',
    status: 'pending',
  },
  {
    id: 2,
    question: 'Positioning Strategy?',
    recommendation: '"Premium performance at accessible price" (Saxdor model)',
    deadline: 'Week 1',
    status: 'pending',
  },
  {
    id: 3,
    question: 'Equity Dilution for COO?',
    recommendation: '2-5% equity acceptable for right candidate',
    deadline: 'Month 2',
    status: 'pending',
  },
  {
    id: 4,
    question: 'Bridge Financing Approach?',
    recommendation: 'Angel investors, marine finance, equipment loan, or pre-sales',
    deadline: 'Week 3',
    status: 'pending',
  },
  {
    id: 5,
    question: '44ft Turkey Production?',
    recommendation: 'Keep separate from Poland volume production',
    deadline: 'Week 2',
    status: 'pending',
  },
]

const FOUNDER_QUESTIONS = [
  { question: 'Exact cash reserves today? Monthly burn rate?', category: 'Cash', answered: false },
  { question: 'S&D: Exact debt owed? Legal status of mold ownership?', category: 'Legal', answered: false },
  { question: 'Complete list of deposits owed to dealers/customers with amounts?', category: 'Liabilities', answered: false },
  { question: 'Japan: Contract status? Customer aware of delay?', category: 'Sales', answered: false },
  { question: 'Turkey 44ft facility - owned/rented? Production-ready today?', category: 'Production', answered: false },
  { question: 'If Model Art says no, what\'s Plan B?', category: 'Production', answered: false },
  { question: 'Maximum dilution acceptable for funding/COO?', category: 'Finance', answered: false },
  { question: 'Hard deadline for first customer delivery?', category: 'Timeline', answered: false },
]

const DAILY_STANDUP = [
  "What's the #1 thing blocking production restart?",
  "What's the #1 thing blocking the next deposit?",
  "What decision am I avoiding?",
  "Who do I need to call today?",
  "What can I delegate (that I'm doing myself)?",
]

const QUOTES = [
  { text: "Year 1 is about survival and proving the model. Year 2-5 is about scaling. Don't try to do both at once.", source: "Cross-AI Consensus" },
  { text: "The next 90 days will determine everything.", source: "Synthesis Document" },
  { text: "Saxdor Year 1 was similar. They hit €110M by Year 5.", source: "Industry Benchmark" },
]

export default function CommandCenterPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [daysSinceRestart] = useState(Math.floor((Date.now() - new Date('2026-02-04').getTime()) / (1000 * 60 * 60 * 24)))

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const successProbability = 55 // Updated from 35% based on AI recommendations

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
          <p className="text-sm text-gray-500">
            Day {daysSinceRestart} of Restart • Strategic North Stars • 90-Day Execution
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-dromeas-600">
            {successProbability}%
          </div>
          <p className="text-xs text-gray-500">Success Probability</p>
        </div>
      </div>

      {/* Vision Banner */}
      <div className="card bg-gradient-to-r from-dromeas-600 to-dromeas-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dromeas-200 text-sm font-medium mb-1">{COMPANY_VISION.tagline}</p>
            <h2 className="text-3xl font-bold">{COMPANY_VISION.northStar}</h2>
            <p className="text-dromeas-100 mt-2 max-w-2xl">{COMPANY_VISION.mission}</p>
          </div>
          <div className="hidden md:flex flex-col items-end space-y-1">
            {COMPANY_VISION.values.map((value, i) => (
              <span key={i} className="text-xs text-dromeas-200 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" /> {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Year 1 Focus */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-yellow-50 border-yellow-200 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">YEAR 1 TARGET</p>
              <p className="text-3xl font-bold text-yellow-900">25 boats</p>
            </div>
            <Ship className="h-10 w-10 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">Revised from 50 (realistic)</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">REVENUE TARGET</p>
              <p className="text-3xl font-bold text-green-900">€5M</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">@€200K avg order</p>
        </div>
        <div className="card p-4 bg-orange-50 border-orange-200 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">EBITDA YEAR 1</p>
              <p className="text-3xl font-bold text-orange-900">-10%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-500" />
          </div>
          <p className="text-xs text-orange-600 mt-1">Startup loss expected</p>
        </div>
        <div className="card p-4 bg-blue-50 border-blue-200 border-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">TEAM</p>
              <p className="text-3xl font-bold text-blue-900">COO + 2</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">Founder + COO + contractors</p>
        </div>
      </div>

      {/* 90-Day Metrics */}
      <div className="card">
        <div className="card-header flex items-center justify-between bg-red-50">
          <h3 className="font-semibold text-red-800 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            90-Day Success Metrics (The Next 90 Days Will Determine Everything)
          </h3>
          <span className="text-sm text-red-600 font-medium">
            {NINETY_DAY_METRICS.filter(m => m.status === 'complete').length}/{NINETY_DAY_METRICS.length} Complete
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left">Metric</th>
                <th className="py-2 px-4 text-center">Target</th>
                <th className="py-2 px-4 text-center">Stretch</th>
                <th className="py-2 px-4 text-center">Current</th>
                <th className="py-2 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {NINETY_DAY_METRICS.map((metric, idx) => (
                <tr key={idx} className={metric.priority === 'critical' ? 'bg-red-50' : ''}>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${metric.priority === 'critical' ? 'text-red-700' : 'text-gray-900'}`}>
                      {metric.metric}
                    </span>
                    {metric.priority === 'critical' && (
                      <span className="ml-2 text-xs bg-red-200 text-red-800 px-1 rounded">CRITICAL</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center font-medium">{metric.target}</td>
                  <td className="py-3 px-4 text-center text-gray-500">{metric.stretch}</td>
                  <td className="py-3 px-4 text-center">
                    {metric.current !== undefined ? metric.current : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {metric.status === 'complete' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Year Trajectory */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">5-Year Revenue Trajectory</h3>
        </div>
        <div className="card-body">
          <div className="flex items-end h-48 space-x-4 px-4">
            {YEAR_TARGETS.map((year, idx) => {
              const maxRevenue = Math.max(...YEAR_TARGETS.map(y => y.revenue))
              const height = (year.revenue / maxRevenue) * 100
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-1">{formatCurrency(year.revenue)}</div>
                  <div className="w-full flex flex-col items-center justify-end h-32">
                    <div
                      className={`w-full rounded-t transition-all ${
                        year.status === 'current' ? 'bg-dromeas-500' : 'bg-gray-300'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className={`text-sm font-bold ${year.status === 'current' ? 'text-dromeas-600' : 'text-gray-600'}`}>
                      Year {year.year}
                    </p>
                    <p className="text-xs text-gray-500">{year.boats} boats</p>
                    <p className={`text-xs ${year.ebitda < 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {year.ebitda}% EBITDA
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Two Column: Decisions + Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Decisions */}
        <div className="card">
          <div className="card-header bg-purple-50">
            <h3 className="font-semibold text-purple-800 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Key Decisions Pending
            </h3>
          </div>
          <div className="card-body space-y-3">
            {KEY_DECISIONS.map(decision => (
              <div key={decision.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{decision.question}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="text-purple-600">Rec:</span> {decision.recommendation}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      decision.status === 'decided' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {decision.deadline}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Questions */}
        <div className="card">
          <div className="card-header bg-orange-50">
            <h3 className="font-semibold text-orange-800 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Founder Questions to Answer
            </h3>
          </div>
          <div className="card-body space-y-2">
            {FOUNDER_QUESTIONS.map((q, idx) => (
              <div key={idx} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={q.answered}
                  readOnly
                  className="mt-1 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{q.question}</p>
                  <span className="text-xs text-gray-400">{q.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Standup */}
      <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="card-header bg-blue-100">
          <h3 className="font-semibold text-blue-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Standup Questions (Every Morning)
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {DAILY_STANDUP.map((question, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600 mb-2">{idx + 1}</p>
                <p className="text-sm text-gray-700">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wisdom */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUOTES.map((quote, idx) => (
          <div key={idx} className="card p-4 bg-gray-50 border-l-4 border-l-dromeas-400">
            <p className="text-sm text-gray-700 italic">"{quote.text}"</p>
            <p className="text-xs text-gray-500 mt-2">— {quote.source}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="flex space-x-4">
        <Link href="/dashboard/kpis" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Target className="h-4 w-4 mr-1" /> KPI Dashboard →
        </Link>
        <Link href="/tasks" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" /> Action Items →
        </Link>
        <Link href="/finance/cash-flow" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" /> Cash Flow →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Compass className="h-4 w-4 mr-1" /> Ask AI Boardroom →
        </Link>
      </div>
    </div>
  )
}
