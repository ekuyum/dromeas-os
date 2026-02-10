'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Ship,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  Factory,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface KPI {
  id: string
  name: string
  category: 'revenue' | 'production' | 'inventory' | 'customer' | 'operations'
  current: number
  target: number
  unit: string
  format: 'number' | 'currency' | 'percent' | 'days'
  trend: number // percentage change
  trendDirection: 'up' | 'down' | 'flat'
  isGoodWhenHigh: boolean
  history: { period: string; value: number }[]
}

interface KPIData {
  kpis: KPI[]
  lastUpdated: Date
}

export default function KPIDashboard() {
  const [data, setData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchKPIData()
  }, [])

  const fetchKPIData = async () => {
    setLoading(true)

    // Fetch real data from database
    const [ordersRes, boatsRes, inventoryRes, customersRes, quotesRes] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('boats').select('*'),
      supabase.from('inventory').select('qty_on_hand, qty_reserved, components(min_stock)'),
      supabase.from('customers').select('*'),
      supabase.from('quotes').select('*'),
    ])

    const orders = (ordersRes.data || []) as any[]
    const boats = (boatsRes.data || []) as any[]
    const inventory = (inventoryRes.data || []) as any[]
    const customers = (customersRes.data || []) as any[]
    const quotes = (quotesRes.data || []) as any[]

    // Calculate current metrics
    const activeOrders = orders.filter(o => ['deposit_received', 'in_production', 'deposit_pending'].includes(o.status))
    const inProduction = orders.filter(o => ['deposit_received', 'in_production'].includes(o.status))
    const completedThisMonth = orders.filter(o => o.status === 'delivered' && new Date(o.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total_eur || 0), 0)
    const pipelineValue = activeOrders.reduce((sum, o) => sum + (o.total_eur || 0), 0)
    const lowStockCount = inventory.filter(i => (i.qty_on_hand - i.qty_reserved) < (i.components?.min_stock || 0)).length
    const quoteConversion = quotes.length > 0 ? (orders.length / quotes.length) * 100 : 0
    const avgProductionDays = 85 // Simulated - would calculate from actual production data

    // Generate simulated history (in real app, this would come from historical data)
    const generateHistory = (current: number, variance: number = 0.1) => {
      const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
      return months.map((month, i) => ({
        period: month,
        value: Math.round(current * (0.7 + (i * 0.06) + (Math.random() * variance)))
      }))
    }

    const kpis: KPI[] = [
      // Revenue KPIs
      {
        id: 'revenue-ytd',
        name: 'YTD Revenue',
        category: 'revenue',
        current: totalRevenue,
        target: 2000000,
        unit: '€',
        format: 'currency',
        trend: 12.5,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(totalRevenue / 6, 0.15)
      },
      {
        id: 'pipeline-value',
        name: 'Pipeline Value',
        category: 'revenue',
        current: pipelineValue,
        target: 1500000,
        unit: '€',
        format: 'currency',
        trend: 8.3,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(pipelineValue / 6, 0.2)
      },
      {
        id: 'avg-order-value',
        name: 'Avg Order Value',
        category: 'revenue',
        current: activeOrders.length > 0 ? pipelineValue / activeOrders.length : 0,
        target: 180000,
        unit: '€',
        format: 'currency',
        trend: 5.2,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(180000, 0.08)
      },
      {
        id: 'quote-conversion',
        name: 'Quote Conversion',
        category: 'revenue',
        current: quoteConversion,
        target: 40,
        unit: '%',
        format: 'percent',
        trend: -2.1,
        trendDirection: 'down',
        isGoodWhenHigh: true,
        history: generateHistory(35, 0.15)
      },

      // Production KPIs
      {
        id: 'boats-in-production',
        name: 'Boats in Production',
        category: 'production',
        current: inProduction.length,
        target: 8,
        unit: 'boats',
        format: 'number',
        trend: 0,
        trendDirection: 'flat',
        isGoodWhenHigh: true,
        history: generateHistory(6, 0.2)
      },
      {
        id: 'deliveries-monthly',
        name: 'Monthly Deliveries',
        category: 'production',
        current: completedThisMonth.length,
        target: 2,
        unit: 'boats',
        format: 'number',
        trend: 50,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(1.5, 0.3)
      },
      {
        id: 'avg-production-time',
        name: 'Avg Production Time',
        category: 'production',
        current: avgProductionDays,
        target: 75,
        unit: 'days',
        format: 'days',
        trend: -5,
        trendDirection: 'down',
        isGoodWhenHigh: false,
        history: generateHistory(90, 0.1)
      },
      {
        id: 'on-time-delivery',
        name: 'On-Time Delivery',
        category: 'production',
        current: 87,
        target: 95,
        unit: '%',
        format: 'percent',
        trend: 3.2,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(82, 0.08)
      },

      // Inventory KPIs
      {
        id: 'low-stock-items',
        name: 'Low Stock Items',
        category: 'inventory',
        current: lowStockCount,
        target: 0,
        unit: 'items',
        format: 'number',
        trend: lowStockCount > 0 ? 100 : 0,
        trendDirection: lowStockCount > 0 ? 'up' : 'flat',
        isGoodWhenHigh: false,
        history: generateHistory(3, 0.5)
      },
      {
        id: 'inventory-turnover',
        name: 'Inventory Turnover',
        category: 'inventory',
        current: 4.2,
        target: 6,
        unit: 'x/year',
        format: 'number',
        trend: 8.5,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(3.8, 0.1)
      },
      {
        id: 'supplier-lead-time',
        name: 'Avg Supplier Lead Time',
        category: 'inventory',
        current: 21,
        target: 14,
        unit: 'days',
        format: 'days',
        trend: -10,
        trendDirection: 'down',
        isGoodWhenHigh: false,
        history: generateHistory(25, 0.15)
      },

      // Customer KPIs
      {
        id: 'active-customers',
        name: 'Active Customers',
        category: 'customer',
        current: customers.length,
        target: 50,
        unit: 'customers',
        format: 'number',
        trend: 15,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(customers.length * 0.8, 0.1)
      },
      {
        id: 'repeat-customers',
        name: 'Repeat Customer Rate',
        category: 'customer',
        current: 28,
        target: 35,
        unit: '%',
        format: 'percent',
        trend: 5.5,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(25, 0.12)
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        category: 'customer',
        current: 4.6,
        target: 4.8,
        unit: '/5',
        format: 'number',
        trend: 2.2,
        trendDirection: 'up',
        isGoodWhenHigh: true,
        history: generateHistory(4.4, 0.05)
      },

      // Operations KPIs
      {
        id: 'orders-at-risk',
        name: 'Orders at Risk',
        category: 'operations',
        current: orders.filter(o => {
          if (!o.target_delivery_date) return false
          const daysLeft = Math.ceil((new Date(o.target_delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return daysLeft < 30 && daysLeft > -30 && ['deposit_received', 'in_production'].includes(o.status)
        }).length,
        target: 0,
        unit: 'orders',
        format: 'number',
        trend: 0,
        trendDirection: 'flat',
        isGoodWhenHigh: false,
        history: generateHistory(1, 0.5)
      },
      {
        id: 'cash-collection',
        name: 'Cash Collection Days',
        category: 'operations',
        current: 18,
        target: 14,
        unit: 'days',
        format: 'days',
        trend: -8,
        trendDirection: 'down',
        isGoodWhenHigh: false,
        history: generateHistory(22, 0.15)
      },
    ]

    setData({
      kpis,
      lastUpdated: new Date()
    })
    setLoading(false)
  }

  const formatValue = (kpi: KPI) => {
    switch (kpi.format) {
      case 'currency':
        return formatCurrency(kpi.current)
      case 'percent':
        return `${kpi.current.toFixed(1)}%`
      case 'days':
        return `${kpi.current} days`
      default:
        return kpi.current.toLocaleString()
    }
  }

  const formatTarget = (kpi: KPI) => {
    switch (kpi.format) {
      case 'currency':
        return formatCurrency(kpi.target)
      case 'percent':
        return `${kpi.target}%`
      case 'days':
        return `${kpi.target} days`
      default:
        return kpi.target.toLocaleString()
    }
  }

  const getProgress = (kpi: KPI) => {
    if (kpi.isGoodWhenHigh) {
      return Math.min((kpi.current / kpi.target) * 100, 100)
    } else {
      // For metrics where lower is better, invert the progress
      if (kpi.current <= kpi.target) return 100
      return Math.max(100 - ((kpi.current - kpi.target) / kpi.target) * 100, 0)
    }
  }

  const getHealthStatus = (kpi: KPI): 'success' | 'warning' | 'danger' => {
    const progress = getProgress(kpi)
    if (progress >= 90) return 'success'
    if (progress >= 70) return 'warning'
    return 'danger'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return DollarSign
      case 'production': return Factory
      case 'inventory': return Package
      case 'customer': return Users
      case 'operations': return Clock
      default: return Target
    }
  }

  const categories = [
    { id: 'all', name: 'All KPIs', icon: Target },
    { id: 'revenue', name: 'Revenue', icon: DollarSign },
    { id: 'production', name: 'Production', icon: Factory },
    { id: 'inventory', name: 'Inventory', icon: Package },
    { id: 'customer', name: 'Customer', icon: Users },
    { id: 'operations', name: 'Operations', icon: Clock },
  ]

  const filteredKPIs = data?.kpis.filter(kpi =>
    selectedCategory === 'all' || kpi.category === selectedCategory
  ) || []

  const healthSummary = {
    onTrack: data?.kpis.filter(k => getHealthStatus(k) === 'success').length || 0,
    atRisk: data?.kpis.filter(k => getHealthStatus(k) === 'warning').length || 0,
    offTrack: data?.kpis.filter(k => getHealthStatus(k) === 'danger').length || 0,
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
          <h1 className="text-2xl font-bold text-gray-900">KPI Dashboard</h1>
          <p className="text-sm text-gray-500">
            Track progress against your north star metrics
            {data?.lastUpdated && ` · Updated ${data.lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={fetchKPIData} className="btn btn-outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </button>
          <Link href="/settings" className="btn btn-primary">
            <Target className="h-4 w-4 mr-2" /> Edit Targets
          </Link>
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">On Track</p>
              <p className="text-3xl font-bold text-green-800">{healthSummary.onTrack}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">At Risk</p>
              <p className="text-3xl font-bold text-yellow-800">{healthSummary.atRisk}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Off Track</p>
              <p className="text-3xl font-bold text-red-800">{healthSummary.offTrack}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-dromeas-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <cat.icon className="h-4 w-4 mr-2" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKPIs.map(kpi => {
          const health = getHealthStatus(kpi)
          const progress = getProgress(kpi)
          const CategoryIcon = getCategoryIcon(kpi.category)
          const isPositiveTrend = kpi.isGoodWhenHigh
            ? kpi.trendDirection === 'up'
            : kpi.trendDirection === 'down'

          return (
            <div key={kpi.id} className="card">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${
                      kpi.category === 'revenue' ? 'bg-green-100' :
                      kpi.category === 'production' ? 'bg-blue-100' :
                      kpi.category === 'inventory' ? 'bg-purple-100' :
                      kpi.category === 'customer' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      <CategoryIcon className={`h-5 w-5 ${
                        kpi.category === 'revenue' ? 'text-green-600' :
                        kpi.category === 'production' ? 'text-blue-600' :
                        kpi.category === 'inventory' ? 'text-purple-600' :
                        kpi.category === 'customer' ? 'text-orange-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{kpi.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{kpi.category}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${
                    health === 'success' ? 'status-success' :
                    health === 'warning' ? 'status-warning' : 'status-danger'
                  }`}>
                    {health === 'success' ? 'On Track' :
                     health === 'warning' ? 'At Risk' : 'Off Track'}
                  </span>
                </div>

                {/* Value */}
                <div className="mb-3">
                  <p className="text-3xl font-bold text-gray-900">{formatValue(kpi)}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-500">Target: {formatTarget(kpi)}</span>
                    {kpi.trend !== 0 && (
                      <span className={`ml-3 flex items-center text-sm ${
                        isPositiveTrend ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositiveTrend ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(kpi.trend).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        health === 'success' ? 'bg-green-500' :
                        health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% of target</p>
                </div>

                {/* Mini Trend Chart */}
                <div className="flex items-end h-12 space-x-1">
                  {kpi.history.map((point, i) => {
                    const maxVal = Math.max(...kpi.history.map(p => p.value))
                    const height = (point.value / maxVal) * 100
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-t transition-all ${
                            i === kpi.history.length - 1 ? 'bg-dromeas-500' : 'bg-gray-300'
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-gray-400 mt-1">{point.period}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recommended Actions</h3>
        <div className="space-y-2">
          {data?.kpis.filter(k => getHealthStatus(k) === 'danger').slice(0, 3).map(kpi => (
            <div key={kpi.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{kpi.name} is off track</p>
                  <p className="text-xs text-gray-500">Current: {formatValue(kpi)} | Target: {formatTarget(kpi)}</p>
                </div>
              </div>
              <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
                Get AI advice <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ))}
          {data?.kpis.filter(k => getHealthStatus(k) === 'danger').length === 0 && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <p className="text-sm text-green-700">All critical KPIs are on track. Keep up the momentum!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
