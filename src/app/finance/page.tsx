'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PiggyBank, CreditCard, Receipt, BarChart3 } from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface FinanceData {
  totalRevenue: number
  totalPending: number
  totalReceived: number
  expectedNext30: number
  expectedNext60: number
  expectedNext90: number
  ordersByStatus: { status: string; count: number; value: number }[]
  recentPayments: { order_number: string; amount: number; date: string; type: string }[]
  cashFlowProjection: { month: string; inflow: number; outflow: number }[]
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('ytd')

  useEffect(() => {
    fetchFinanceData()
  }, [period])

  const fetchFinanceData = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, status, total_eur, deposit_paid_date, milestone_paid_date, final_paid_date, target_delivery_date, created_at') as { data: any[] | null }

    if (!orders) {
      setLoading(false)
      return
    }

    // Calculate totals
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_eur || 0), 0)

    let totalReceived = 0
    let totalPending = 0

    orders.forEach(o => {
      const deposit = o.total_eur * 0.3
      const milestone = o.total_eur * 0.4
      const final = o.total_eur * 0.3

      if (o.deposit_paid_date) totalReceived += deposit
      else totalPending += deposit

      if (o.milestone_paid_date) totalReceived += milestone
      else if (o.deposit_paid_date) totalPending += milestone

      if (o.final_paid_date) totalReceived += final
      else if (o.milestone_paid_date) totalPending += final
    })

    // Expected payments
    const now = new Date()
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
    const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    let expected30 = 0, expected60 = 0, expected90 = 0
    orders.forEach(o => {
      if (!o.target_delivery_date) return
      const delivery = new Date(o.target_delivery_date)

      // Milestone due ~60 days before delivery
      const milestoneDate = new Date(delivery.getTime() - 60 * 24 * 60 * 60 * 1000)
      if (!o.milestone_paid_date && milestoneDate <= in30) expected30 += o.total_eur * 0.4
      else if (!o.milestone_paid_date && milestoneDate <= in60) expected60 += o.total_eur * 0.4
      else if (!o.milestone_paid_date && milestoneDate <= in90) expected90 += o.total_eur * 0.4

      // Final due at delivery
      if (!o.final_paid_date && delivery <= in30) expected30 += o.total_eur * 0.3
      else if (!o.final_paid_date && delivery <= in60) expected60 += o.total_eur * 0.3
      else if (!o.final_paid_date && delivery <= in90) expected90 += o.total_eur * 0.3
    })

    // Orders by status
    const statusMap: Record<string, { count: number; value: number }> = {}
    orders.forEach(o => {
      if (!statusMap[o.status]) statusMap[o.status] = { count: 0, value: 0 }
      statusMap[o.status].count++
      statusMap[o.status].value += o.total_eur || 0
    })
    const ordersByStatus = Object.entries(statusMap).map(([status, data]) => ({ status, ...data }))

    // Recent payments (simulated from paid dates)
    const recentPayments: any[] = []
    orders.forEach(o => {
      if (o.deposit_paid_date) recentPayments.push({ order_number: o.order_number, amount: o.total_eur * 0.3, date: o.deposit_paid_date, type: 'Deposit' })
      if (o.milestone_paid_date) recentPayments.push({ order_number: o.order_number, amount: o.total_eur * 0.4, date: o.milestone_paid_date, type: 'Milestone' })
      if (o.final_paid_date) recentPayments.push({ order_number: o.order_number, amount: o.total_eur * 0.3, date: o.final_paid_date, type: 'Final' })
    })
    recentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Cash flow projection (simplified)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const cashFlowProjection = months.map((month, i) => ({
      month,
      inflow: Math.round((expected30 + expected60 + expected90) / 6 * (1 + Math.random() * 0.3)),
      outflow: Math.round((expected30 + expected60 + expected90) / 6 * 0.6 * (1 + Math.random() * 0.2))
    }))

    setData({
      totalRevenue,
      totalPending,
      totalReceived,
      expectedNext30: expected30,
      expectedNext60: expected60,
      expectedNext90: expected90,
      ordersByStatus,
      recentPayments: recentPayments.slice(0, 10),
      cashFlowProjection
    })
    setLoading(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading finance data...</div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500">Cash flow, revenue, and financial projections</p>
        </div>
        <div className="flex space-x-2">
          {['ytd', 'q1', 'q2', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg uppercase ${period === p ? 'bg-dromeas-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data?.totalRevenue || 0)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cash Received</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.totalReceived || 0)}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {data?.totalRevenue ? Math.round((data.totalReceived / data.totalRevenue) * 100) : 0}% collected
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <PiggyBank className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(data?.totalPending || 0)}</p>
              <p className="text-xs text-yellow-600 flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting collection
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Expected (30d)</p>
              <p className="text-2xl font-bold text-dromeas-600">{formatCurrency(data?.expectedNext30 || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">
                60d: {formatCurrency(data?.expectedNext60 || 0)}
              </p>
            </div>
            <div className="p-3 bg-dromeas-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-dromeas-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart Placeholder + Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Projection */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Cash Flow Projection</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {data?.cashFlowProjection.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{m.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex h-6 rounded overflow-hidden bg-gray-100">
                      <div
                        className="bg-green-500"
                        style={{ width: `${(m.inflow / (m.inflow + m.outflow)) * 100}%` }}
                      />
                      <div
                        className="bg-red-400"
                        style={{ width: `${(m.outflow / (m.inflow + m.outflow)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-green-600">+{formatCurrency(m.inflow)}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-red-500">-{formatCurrency(m.outflow)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-6 mt-4 text-xs">
              <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-1" /> Inflow</span>
              <span className="flex items-center"><span className="w-3 h-3 bg-red-400 rounded mr-1" /> Outflow</span>
            </div>
          </div>
        </div>

        {/* Revenue by Order Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Revenue by Status</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {data?.ordersByStatus.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{s.status.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-500">{s.count} orders</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(s.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.recentPayments.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-500 py-8">No payments recorded</td></tr>
              ) : (
                data?.recentPayments.map((p, i) => (
                  <tr key={i}>
                    <td className="font-medium text-dromeas-600">{p.order_number}</td>
                    <td>
                      <span className={`status-badge ${
                        p.type === 'Deposit' ? 'status-info' :
                        p.type === 'Milestone' ? 'status-warning' : 'status-success'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="font-medium text-green-600">+{formatCurrency(p.amount)}</td>
                    <td className="text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Clock(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
