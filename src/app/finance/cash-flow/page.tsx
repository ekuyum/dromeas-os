'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  Calendar,
  RefreshCw,
  Mail,
  Phone,
  Ship,
} from 'lucide-react'
import { supabase, formatCurrency, formatDate } from '@/lib/supabase'

interface CashPosition {
  current_balance: number
  projected_30d: number
  projected_60d: number
  projected_90d: number
}

interface PaymentMilestone {
  id: string
  order_id: string
  order_number: string
  customer_name: string
  milestone: 'deposit' | 'milestone' | 'final'
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
  days_overdue: number
}

interface ARAgingBucket {
  bucket: string
  count: number
  total: number
  percentage: number
}

interface DunningAlert {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  amount: number
  days_overdue: number
  reminder_count: number
  last_reminder: string | null
  suggested_action: string
}

export default function CashFlowPage() {
  const [position, setPosition] = useState<CashPosition | null>(null)
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([])
  const [aging, setAging] = useState<ARAgingBucket[]>([])
  const [dunning, setDunning] = useState<DunningAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'dunning'>('overview')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from('orders').select(`
        id, order_number, status, total_eur, target_delivery_date,
        deposit_paid_date, milestone_paid_date, final_paid_date,
        customers (id, company_name, first_name, last_name, email)
      `),
      supabase.from('customers').select('id, company_name'),
    ])

    const orders = (ordersRes.data || []) as any[]
    const today = new Date()

    // Calculate milestones
    const allMilestones: PaymentMilestone[] = []

    orders.forEach(order => {
      if (!['deposit_received', 'in_production', 'delivered'].includes(order.status)) return

      const customerName = order.customers?.company_name ||
        `${order.customers?.first_name || ''} ${order.customers?.last_name || ''}`.trim()

      // Deposit (30%)
      if (!order.deposit_paid_date && order.status !== 'quote') {
        const dueDate = new Date(order.created_at || today)
        dueDate.setDate(dueDate.getDate() + 7)
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        allMilestones.push({
          id: `${order.id}-deposit`,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: customerName,
          milestone: 'deposit',
          amount: order.total_eur * 0.3,
          due_date: dueDate.toISOString().split('T')[0],
          status: daysOverdue > 0 ? 'overdue' : 'pending',
          days_overdue: Math.max(0, daysOverdue),
        })
      }

      // Milestone payment (40%)
      if (order.deposit_paid_date && !order.milestone_paid_date) {
        const deliveryDate = order.target_delivery_date ? new Date(order.target_delivery_date) : new Date()
        const dueDate = new Date(deliveryDate)
        dueDate.setDate(dueDate.getDate() - 60)
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        allMilestones.push({
          id: `${order.id}-milestone`,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: customerName,
          milestone: 'milestone',
          amount: order.total_eur * 0.4,
          due_date: dueDate.toISOString().split('T')[0],
          status: daysOverdue > 0 ? 'overdue' : 'pending',
          days_overdue: Math.max(0, daysOverdue),
        })
      }

      // Final payment (30%)
      if (order.milestone_paid_date && !order.final_paid_date) {
        const dueDate = order.target_delivery_date ? new Date(order.target_delivery_date) : new Date()
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

        allMilestones.push({
          id: `${order.id}-final`,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: customerName,
          milestone: 'final',
          amount: order.total_eur * 0.3,
          due_date: dueDate.toISOString().split('T')[0],
          status: daysOverdue > 0 ? 'overdue' : 'pending',
          days_overdue: Math.max(0, daysOverdue),
        })
      }
    })

    // Sort by due date
    allMilestones.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    setMilestones(allMilestones)

    // Calculate AR Aging
    const agingBuckets: ARAgingBucket[] = [
      { bucket: 'Current', count: 0, total: 0, percentage: 0 },
      { bucket: '1-30 days', count: 0, total: 0, percentage: 0 },
      { bucket: '31-60 days', count: 0, total: 0, percentage: 0 },
      { bucket: '61-90 days', count: 0, total: 0, percentage: 0 },
      { bucket: '90+ days', count: 0, total: 0, percentage: 0 },
    ]

    allMilestones.forEach(m => {
      if (m.days_overdue === 0) {
        agingBuckets[0].count++
        agingBuckets[0].total += m.amount
      } else if (m.days_overdue <= 30) {
        agingBuckets[1].count++
        agingBuckets[1].total += m.amount
      } else if (m.days_overdue <= 60) {
        agingBuckets[2].count++
        agingBuckets[2].total += m.amount
      } else if (m.days_overdue <= 90) {
        agingBuckets[3].count++
        agingBuckets[3].total += m.amount
      } else {
        agingBuckets[4].count++
        agingBuckets[4].total += m.amount
      }
    })

    const totalAR = agingBuckets.reduce((sum, b) => sum + b.total, 0)
    agingBuckets.forEach(b => {
      b.percentage = totalAR > 0 ? (b.total / totalAR) * 100 : 0
    })
    setAging(agingBuckets)

    // Generate dunning alerts
    const dunningAlerts: DunningAlert[] = allMilestones
      .filter(m => m.days_overdue > 0)
      .map(m => {
        const order = orders.find(o => o.id === m.order_id)
        return {
          id: m.id,
          order_number: m.order_number,
          customer_name: m.customer_name,
          customer_email: order?.customers?.email || 'no-email@example.com',
          amount: m.amount,
          days_overdue: m.days_overdue,
          reminder_count: Math.floor(m.days_overdue / 7), // Assume weekly reminders
          last_reminder: m.days_overdue > 7 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
          suggested_action: m.days_overdue > 30 ? 'Call customer' : m.days_overdue > 14 ? 'Send reminder' : 'Monitor',
        }
      })
      .sort((a, b) => b.days_overdue - a.days_overdue)

    setDunning(dunningAlerts)

    // Calculate cash position
    const pendingTotal = allMilestones.reduce((sum, m) => sum + m.amount, 0)
    const next30 = allMilestones.filter(m => {
      const dueDate = new Date(m.due_date)
      const in30 = new Date()
      in30.setDate(in30.getDate() + 30)
      return dueDate <= in30
    }).reduce((sum, m) => sum + m.amount, 0)

    const next60 = allMilestones.filter(m => {
      const dueDate = new Date(m.due_date)
      const in60 = new Date()
      in60.setDate(in60.getDate() + 60)
      return dueDate <= in60
    }).reduce((sum, m) => sum + m.amount, 0)

    const next90 = allMilestones.filter(m => {
      const dueDate = new Date(m.due_date)
      const in90 = new Date()
      in90.setDate(in90.getDate() + 90)
      return dueDate <= in90
    }).reduce((sum, m) => sum + m.amount, 0)

    setPosition({
      current_balance: 125000, // Simulated current bank balance
      projected_30d: 125000 + next30,
      projected_60d: 125000 + next60,
      projected_90d: 125000 + next90,
    })

    setLoading(false)
  }

  const sendReminder = (alert: DunningAlert) => {
    // Simulate sending reminder
    console.log(`Sending reminder to ${alert.customer_email} for ${formatCurrency(alert.amount)}`)
    window.alert(`Reminder email would be sent to:\n\n${alert.customer_email}\n\nFor: ${alert.order_number}\nAmount: ${formatCurrency(alert.amount)}\nDays Overdue: ${alert.days_overdue}`)
  }

  const stats = {
    totalPending: milestones.reduce((sum, m) => sum + m.amount, 0),
    totalOverdue: milestones.filter(m => m.status === 'overdue').reduce((sum, m) => sum + m.amount, 0),
    overdueCount: milestones.filter(m => m.status === 'overdue').length,
    criticalOverdue: milestones.filter(m => m.days_overdue > 30).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-dromeas-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow Intelligence</h1>
          <p className="text-sm text-gray-500">
            Payment tracking, AR aging, and collection automation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchData} className="btn btn-outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </button>
          <Link href="/finance" className="btn btn-primary">
            <DollarSign className="h-4 w-4 mr-2" /> Finance Dashboard
          </Link>
        </div>
      </div>

      {/* Cash Position Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(position?.current_balance || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Bank account</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-700">30-Day Projection</p>
          <p className="text-3xl font-bold text-green-800">{formatCurrency(position?.projected_30d || 0)}</p>
          <p className="text-xs text-green-600 mt-1">+{formatCurrency((position?.projected_30d || 0) - (position?.current_balance || 0))} expected</p>
        </div>
        <div className="card p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">60-Day Projection</p>
          <p className="text-3xl font-bold text-blue-800">{formatCurrency(position?.projected_60d || 0)}</p>
          <p className="text-xs text-blue-600 mt-1">+{formatCurrency((position?.projected_60d || 0) - (position?.current_balance || 0))} expected</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">90-Day Projection</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(position?.projected_90d || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">+{formatCurrency((position?.projected_90d || 0) - (position?.current_balance || 0))} expected</p>
        </div>
      </div>

      {/* AR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Receivable</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className={`card p-4 ${stats.totalOverdue > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${stats.totalOverdue > 0 ? 'text-red-700' : 'text-gray-500'}`}>Overdue</p>
              <p className={`text-2xl font-bold ${stats.totalOverdue > 0 ? 'text-red-800' : 'text-gray-900'}`}>{formatCurrency(stats.totalOverdue)}</p>
            </div>
            <AlertTriangle className={`h-10 w-10 ${stats.totalOverdue > 0 ? 'text-red-400' : 'text-gray-300'}`} />
          </div>
          <p className={`text-xs mt-1 ${stats.totalOverdue > 0 ? 'text-red-600' : 'text-gray-400'}`}>{stats.overdueCount} invoices</p>
        </div>
        <div className={`card p-4 ${stats.criticalOverdue > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${stats.criticalOverdue > 0 ? 'text-red-700' : 'text-gray-500'}`}>Critical (30+ days)</p>
              <p className={`text-2xl font-bold ${stats.criticalOverdue > 0 ? 'text-red-800' : 'text-gray-900'}`}>{stats.criticalOverdue}</p>
            </div>
            <Clock className={`h-10 w-10 ${stats.criticalOverdue > 0 ? 'text-red-400' : 'text-gray-300'}`} />
          </div>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Collection Rate</p>
              <p className="text-2xl font-bold text-green-800">
                {stats.totalPending > 0 ? ((1 - stats.totalOverdue / stats.totalPending) * 100).toFixed(0) : 100}%
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* AR Aging Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">AR Aging Analysis</h3>
        </div>
        <div className="card-body">
          <div className="flex items-end h-40 space-x-2">
            {aging.map((bucket, idx) => {
              const maxHeight = Math.max(...aging.map(a => a.total))
              const height = maxHeight > 0 ? (bucket.total / maxHeight) * 100 : 0
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-700']

              return (
                <div key={bucket.bucket} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-32">
                    <div
                      className={`w-full max-w-16 ${colors[idx]} rounded-t transition-all`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xs font-medium text-gray-900">{bucket.bucket}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(bucket.total)}</p>
                    <p className="text-xs text-gray-400">{bucket.count} items</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Payment Schedule
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'milestones' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Milestones ({milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('dunning')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'dunning' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Collection Actions
            {dunning.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{dunning.length}</span>
            )}
          </button>
        </nav>
      </div>

      {/* Payment Schedule / Overview */}
      {activeTab === 'overview' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Milestone</th>
                <th className="text-right">Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {milestones.slice(0, 15).map(m => (
                <tr key={m.id}>
                  <td className="font-medium text-dromeas-600">{m.order_number}</td>
                  <td>{m.customer_name}</td>
                  <td>
                    <span className={`capitalize ${
                      m.milestone === 'deposit' ? 'text-blue-600' :
                      m.milestone === 'milestone' ? 'text-purple-600' : 'text-green-600'
                    }`}>
                      {m.milestone} ({m.milestone === 'deposit' ? '30%' : m.milestone === 'milestone' ? '40%' : '30%'})
                    </span>
                  </td>
                  <td className="text-right font-medium">{formatCurrency(m.amount)}</td>
                  <td>{formatDate(m.due_date)}</td>
                  <td>
                    <span className={`status-badge ${
                      m.status === 'paid' ? 'status-success' :
                      m.status === 'overdue' ? 'status-danger' : 'status-warning'
                    }`}>
                      {m.status === 'overdue' ? `${m.days_overdue}d overdue` : m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Milestones */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['deposit', 'milestone', 'final'].map(type => (
            <div key={type} className="card">
              <div className={`card-header ${
                type === 'deposit' ? 'bg-blue-50' :
                type === 'milestone' ? 'bg-purple-50' : 'bg-green-50'
              }`}>
                <h3 className="font-semibold capitalize">
                  {type} Payments ({type === 'deposit' ? '30%' : type === 'milestone' ? '40%' : '30%'})
                </h3>
              </div>
              <div className="card-body space-y-2 max-h-64 overflow-y-auto">
                {milestones.filter(m => m.milestone === type).map(m => (
                  <div key={m.id} className={`p-2 rounded border ${
                    m.status === 'overdue' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{m.order_number}</span>
                      <span className="font-medium text-sm">{formatCurrency(m.amount)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{m.customer_name}</span>
                      <span className={`text-xs ${m.status === 'overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {m.status === 'overdue' ? `${m.days_overdue}d late` : formatDate(m.due_date)}
                      </span>
                    </div>
                  </div>
                ))}
                {milestones.filter(m => m.milestone === type).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No pending {type} payments</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dunning */}
      {activeTab === 'dunning' && (
        <div className="space-y-3">
          {dunning.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No overdue payments requiring action</p>
            </div>
          ) : (
            dunning.map(alert => (
              <div key={alert.id} className={`card p-4 border-l-4 ${
                alert.days_overdue > 30 ? 'border-l-red-500 bg-red-50' :
                alert.days_overdue > 14 ? 'border-l-orange-500 bg-orange-50' : 'border-l-yellow-500 bg-yellow-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-dromeas-600">{alert.order_number}</span>
                      <span className={`status-badge ${
                        alert.days_overdue > 30 ? 'status-danger' :
                        alert.days_overdue > 14 ? 'status-warning' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {alert.days_overdue} days overdue
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium">{alert.customer_name}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatCurrency(alert.amount)}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {alert.customer_email}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {alert.reminder_count} reminders sent
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`text-sm font-medium ${
                      alert.suggested_action === 'Call customer' ? 'text-red-600' :
                      alert.suggested_action === 'Send reminder' ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {alert.suggested_action}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => sendReminder(alert)}
                        className="btn btn-sm btn-outline"
                      >
                        <Mail className="h-4 w-4 mr-1" /> Email
                      </button>
                      <button className="btn btn-sm bg-green-600 text-white hover:bg-green-700">
                        <Phone className="h-4 w-4 mr-1" /> Call
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/sales/invoices" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" /> View Invoices →
        </Link>
        <Link href="/sales/orders" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Ship className="h-4 w-4 mr-1" /> View Orders →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" /> AI Cash Analysis →
        </Link>
      </div>
    </div>
  )
}
