'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Ship,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  Package,
  Factory,
  MessageSquare,
} from 'lucide-react'
import { supabase, formatCurrency, formatRelativeTime } from '@/lib/supabase'

interface DashboardData {
  activeOrders: number
  inProduction: number
  boatsReady: number
  expectedRevenue: number
  ordersAtRisk: number
  lowStockCount: number
  recentAlerts: any[]
  productionOrders: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Fetch all data in parallel
    const [ordersRes, boatsRes, inventoryRes, insightsRes] = await Promise.all([
      supabase.from('orders').select(`
        id, order_number, status, total_eur, target_delivery_date,
        deposit_paid_date, milestone_paid_date, final_paid_date,
        models (name),
        customers (company_name, first_name, last_name)
      `),
      supabase.from('boats').select('id, status, hull_number'),
      supabase.from('inventory').select('qty_on_hand, qty_reserved, components(min_stock)'),
      supabase.from('ai_insights').select('*').eq('is_dismissed', false).order('created_at', { ascending: false }).limit(5)
    ])

    const orders = (ordersRes.data || []) as any[]
    const boats = (boatsRes.data || []) as any[]
    const inventory = (inventoryRes.data || []) as any[]
    const insights = (insightsRes.data || []) as any[]

    // Calculate metrics
    const activeOrders = orders.filter((o: any) => ['deposit_received', 'in_production', 'deposit_pending'].includes(o.status))
    const inProductionOrders = orders.filter((o: any) => ['deposit_received', 'in_production'].includes(o.status))
    const atRiskOrders = inProductionOrders.filter((o: any) => {
      if (!o.target_delivery_date) return false
      const daysLeft = Math.ceil((new Date(o.target_delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysLeft < 30 && daysLeft > -30
    })
    const readyBoats = boats.filter((b: any) => b.status === 'completed')
    const lowStockItems = inventory.filter((i: any) => {
      const minStock = i.components?.min_stock || 0
      return (i.qty_on_hand - i.qty_reserved) < minStock
    })

    // Calculate expected revenue (unpaid amounts)
    const expectedRevenue = inProductionOrders.reduce((sum: number, o: any) => {
      let unpaid = 0
      if (!o.deposit_paid_date) unpaid += o.total_eur * 0.3
      if (!o.milestone_paid_date) unpaid += o.total_eur * 0.4
      if (!o.final_paid_date) unpaid += o.total_eur * 0.3
      return sum + unpaid
    }, 0)

    setData({
      activeOrders: activeOrders.length,
      inProduction: inProductionOrders.length,
      boatsReady: readyBoats.length,
      expectedRevenue,
      ordersAtRisk: atRiskOrders.length,
      lowStockCount: lowStockItems.length,
      recentAlerts: insights,
      productionOrders: inProductionOrders.slice(0, 5).map((o: any) => ({
        order_number: o.order_number,
        model: o.models?.name,
        customer: o.customers?.company_name || `${o.customers?.first_name} ${o.customers?.last_name}`,
        total: o.total_eur,
        target: o.target_delivery_date
      }))
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  const metrics = [
    { name: 'Active Orders', value: data?.activeOrders || 0, change: 'Total pipeline', changeType: 'positive', icon: ShoppingCart },
    { name: 'In Production', value: data?.inProduction || 0, change: `${data?.ordersAtRisk || 0} at risk`, changeType: data?.ordersAtRisk ? 'warning' : 'positive', icon: Factory },
    { name: 'Boats Ready', value: data?.boatsReady || 0, change: 'Ready to ship', changeType: 'positive', icon: Ship },
    { name: 'Expected Revenue', value: formatCurrency(data?.expectedRevenue || 0), change: 'Unpaid invoices', changeType: 'positive', icon: DollarSign },
  ]

  const kpiStatus = [
    { name: 'Orders at Risk', value: data?.ordersAtRisk || 0, target: '0', status: data?.ordersAtRisk ? 'danger' : 'success' },
    { name: 'Parts Below Min Stock', value: data?.lowStockCount || 0, target: '0', status: data?.lowStockCount ? 'warning' : 'success' },
    { name: 'Active Orders', value: data?.activeOrders || 0, target: '-', status: 'info' },
    { name: 'In Production', value: data?.inProduction || 0, target: '-', status: 'info' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Dromeas Operations System</p>
        </div>
        <Link href="/ai" className="btn btn-primary">
          <MessageSquare className="h-4 w-4 mr-2" />
          AI Assistant
        </Link>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label">{metric.name}</p>
                <p className="metric-value">{metric.value}</p>
                <p className={`metric-change ${metric.changeType === 'positive' ? 'positive' : metric.changeType === 'warning' ? 'text-yellow-600' : ''}`}>
                  {metric.change}
                </p>
              </div>
              <div className="p-2 bg-dromeas-100 rounded-lg">
                <metric.icon className="h-5 w-5 text-dromeas-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
          </div>
          <div className="card-body space-y-3">
            {kpiStatus.map((kpi) => (
              <div key={kpi.name} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{kpi.name}</p>
                  <p className="text-xs text-gray-500">Target: {kpi.target}</p>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${
                    kpi.status === 'success' ? 'status-success' :
                    kpi.status === 'warning' ? 'status-warning' :
                    kpi.status === 'danger' ? 'status-danger' : 'status-info'
                  }`}>
                    {kpi.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Orders */}
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Orders in Production</h2>
            <Link href="/production/tracking" className="text-sm text-dromeas-600 hover:text-dromeas-700">
              View board →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Model</th>
                  <th>Customer</th>
                  <th>Value</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.productionOrders.map((order) => (
                  <tr key={order.order_number}>
                    <td className="font-medium text-dromeas-600">{order.order_number}</td>
                    <td>{order.model}</td>
                    <td>{order.customer}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{order.target ? new Date(order.target).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
                {data?.productionOrders.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-500 py-8">No orders in production</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">AI Insights & Alerts</h2>
          <Link href="/ai/insights" className="text-sm text-dromeas-600 hover:text-dromeas-700">
            View all →
          </Link>
        </div>
        <div className="card-body">
          {data?.recentAlerts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No active alerts</p>
          ) : (
            <div className="space-y-3">
              {data?.recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start p-3 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-50' :
                    alert.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}
                >
                  <AlertTriangle className={`h-5 w-5 mr-3 flex-shrink-0 ${
                    alert.severity === 'critical' ? 'text-red-500' :
                    alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{alert.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(alert.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/sales/quotes" className="card p-4 text-center hover:shadow-md transition-shadow">
          <TrendingUp className="h-8 w-8 text-dromeas-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Quotes</p>
        </Link>
        <Link href="/production/tracking" className="card p-4 text-center hover:shadow-md transition-shadow">
          <Factory className="h-8 w-8 text-dromeas-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Production Board</p>
        </Link>
        <Link href="/inventory" className="card p-4 text-center hover:shadow-md transition-shadow">
          <Package className="h-8 w-8 text-dromeas-600 mx-auto mb-2" />
          <p className="text-sm font-medium">Inventory</p>
        </Link>
        <Link href="/ai" className="card p-4 text-center hover:shadow-md transition-shadow">
          <MessageSquare className="h-8 w-8 text-dromeas-600 mx-auto mb-2" />
          <p className="text-sm font-medium">AI Assistant</p>
        </Link>
      </div>
    </div>
  )
}
