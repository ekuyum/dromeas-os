'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Ship,
  ArrowLeft,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  Package,
  Wrench,
  Clock,
  BarChart3,
  PieChart,
} from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface BoatCost {
  id: string
  hull_number: string
  model_name: string
  order_number?: string
  status: 'in_production' | 'completed' | 'delivered'
  budget: {
    materials: number
    labor: number
    overhead: number
    engines: number
    electronics: number
    other: number
    total: number
  }
  actual: {
    materials: number
    labor: number
    overhead: number
    engines: number
    electronics: number
    other: number
    total: number
  }
  variance: number
  variance_pct: number
  sale_price: number
  gross_margin: number
  gross_margin_pct: number
  start_date: string
  completion_date?: string
  notes?: string
}

export default function CostTracking() {
  const [boats, setBoats] = useState<BoatCost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBoat, setSelectedBoat] = useState<BoatCost | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Sample cost data
  const sampleBoats: BoatCost[] = [
    {
      id: '1',
      hull_number: 'GR-DRM00001A626',
      model_name: 'DR29',
      order_number: 'ORD-2025-001',
      status: 'delivered',
      budget: {
        materials: 45000,
        labor: 25000,
        overhead: 8000,
        engines: 35000,
        electronics: 12000,
        other: 5000,
        total: 130000,
      },
      actual: {
        materials: 47500,
        labor: 26200,
        overhead: 8000,
        engines: 35000,
        electronics: 11800,
        other: 4800,
        total: 133300,
      },
      variance: -3300,
      variance_pct: -2.5,
      sale_price: 195000,
      gross_margin: 61700,
      gross_margin_pct: 31.6,
      start_date: '2025-09-01',
      completion_date: '2025-12-15',
      notes: 'Material costs higher due to supply chain issues',
    },
    {
      id: '2',
      hull_number: 'GR-DRM00002B626',
      model_name: 'DR29',
      order_number: 'ORD-2025-002',
      status: 'delivered',
      budget: {
        materials: 45000,
        labor: 25000,
        overhead: 8000,
        engines: 42000,
        electronics: 15000,
        other: 5000,
        total: 140000,
      },
      actual: {
        materials: 44200,
        labor: 24500,
        overhead: 8000,
        engines: 42000,
        electronics: 14500,
        other: 5200,
        total: 138400,
      },
      variance: 1600,
      variance_pct: 1.1,
      sale_price: 210000,
      gross_margin: 71600,
      gross_margin_pct: 34.1,
      start_date: '2025-10-01',
      completion_date: '2026-01-20',
    },
    {
      id: '3',
      hull_number: 'GR-DRM00003C626',
      model_name: 'DR29',
      order_number: 'ORD-2026-001',
      status: 'in_production',
      budget: {
        materials: 45000,
        labor: 25000,
        overhead: 8000,
        engines: 35000,
        electronics: 12000,
        other: 5000,
        total: 130000,
      },
      actual: {
        materials: 32000,
        labor: 18000,
        overhead: 5500,
        engines: 35000,
        electronics: 0,
        other: 2500,
        total: 93000,
      },
      variance: 0,
      variance_pct: 0,
      sale_price: 195000,
      gross_margin: 0,
      gross_margin_pct: 0,
      start_date: '2026-01-15',
      notes: '70% complete - on track',
    },
    {
      id: '4',
      hull_number: 'GR-DRM00004D626',
      model_name: 'DR29',
      order_number: 'ORD-2026-002',
      status: 'in_production',
      budget: {
        materials: 45000,
        labor: 25000,
        overhead: 8000,
        engines: 48000,
        electronics: 18000,
        other: 6000,
        total: 150000,
      },
      actual: {
        materials: 15000,
        labor: 8000,
        overhead: 2500,
        engines: 0,
        electronics: 0,
        other: 1500,
        total: 27000,
      },
      variance: 0,
      variance_pct: 0,
      sale_price: 225000,
      gross_margin: 0,
      gross_margin_pct: 0,
      start_date: '2026-02-01',
      notes: '20% complete - early stage',
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setBoats(sampleBoats)
    setLoading(false)
  }

  // Aggregate metrics
  const completedBoats = boats.filter(b => ['completed', 'delivered'].includes(b.status))
  const inProductionBoats = boats.filter(b => b.status === 'in_production')

  const metrics = {
    avgGrossMargin: completedBoats.length > 0
      ? completedBoats.reduce((sum, b) => sum + b.gross_margin_pct, 0) / completedBoats.length
      : 0,
    totalBudget: boats.reduce((sum, b) => sum + b.budget.total, 0),
    totalActual: completedBoats.reduce((sum, b) => sum + b.actual.total, 0),
    totalVariance: completedBoats.reduce((sum, b) => sum + b.variance, 0),
    inProgressValue: inProductionBoats.reduce((sum, b) => sum + b.actual.total, 0),
    inProgressBudget: inProductionBoats.reduce((sum, b) => sum + b.budget.total, 0),
  }

  const filteredBoats = boats.filter(b =>
    filterStatus === 'all' || b.status === filterStatus
  )

  const costCategories = ['materials', 'labor', 'overhead', 'engines', 'electronics', 'other']

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
        <div className="flex items-center">
          <Link href="/finance" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calculator className="h-7 w-7 mr-3 text-dromeas-600" />
              Cost Tracking
            </h1>
            <p className="text-sm text-gray-500">
              Actual vs. budget cost analysis per boat
            </p>
          </div>
        </div>
        <button className="btn btn-outline">
          <Download className="h-4 w-4 mr-2" /> Export Report
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Gross Margin</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgGrossMargin.toFixed(1)}%</p>
            </div>
            <div className={`p-3 rounded-lg ${metrics.avgGrossMargin >= 30 ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <TrendingUp className={`h-6 w-6 ${metrics.avgGrossMargin >= 30 ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Target: 30%+</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Variance</p>
              <p className={`text-2xl font-bold ${metrics.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.totalVariance >= 0 ? '+' : ''}{formatCurrency(metrics.totalVariance)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${metrics.totalVariance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {metrics.totalVariance >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Completed boats</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Production</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.inProgressValue)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">of {formatCurrency(metrics.inProgressBudget)} budget</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Boats Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{boats.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-100">
              <Ship className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{completedBoats.length} completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          {['all', 'in_production', 'completed', 'delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-dromeas-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Cost Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boat</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sale Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross Margin</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBoats.map(boat => (
                <tr
                  key={boat.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedBoat(boat)}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{boat.hull_number}</p>
                      <p className="text-xs text-gray-500">{boat.model_name} · {boat.order_number}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatCurrency(boat.budget.total)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatCurrency(boat.actual.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {boat.status !== 'in_production' ? (
                      <span className={`font-mono text-sm ${boat.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {boat.variance >= 0 ? '+' : ''}{formatCurrency(boat.variance)}
                        <span className="text-xs ml-1">({boat.variance_pct.toFixed(1)}%)</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">In progress</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatCurrency(boat.sale_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {boat.status !== 'in_production' ? (
                      <div>
                        <p className={`font-medium ${boat.gross_margin_pct >= 30 ? 'text-green-600' : 'text-amber-600'}`}>
                          {boat.gross_margin_pct.toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">{formatCurrency(boat.gross_margin)}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">TBD</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      boat.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      boat.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {boat.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Breakdown Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Average Cost Breakdown</h3>
          <div className="space-y-3">
            {costCategories.map(category => {
              const avgBudget = boats.reduce((sum, b) => sum + (b.budget as any)[category], 0) / boats.length
              const avgActual = completedBoats.length > 0
                ? completedBoats.reduce((sum, b) => sum + (b.actual as any)[category], 0) / completedBoats.length
                : 0
              const maxVal = Math.max(avgBudget, avgActual)

              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{category}</span>
                    <span className="text-gray-500">
                      Budget: {formatCurrency(avgBudget)} | Actual: {formatCurrency(avgActual)}
                    </span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-gray-300"
                      style={{ width: `${(avgBudget / maxVal) * 50}%` }}
                    ></div>
                    <div
                      className={`h-full ${avgActual <= avgBudget ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${(avgActual / maxVal) * 50}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Margin Trend</h3>
          <div className="h-64 flex items-end justify-around">
            {completedBoats.map(boat => (
              <div key={boat.id} className="text-center">
                <div
                  className={`w-16 rounded-t ${boat.gross_margin_pct >= 30 ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ height: `${boat.gross_margin_pct * 2}px` }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">{boat.hull_number.slice(-5)}</p>
                <p className="text-xs font-medium">{boat.gross_margin_pct.toFixed(0)}%</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between text-sm">
            <span className="text-gray-500">Target margin: 30%</span>
            <span className="font-medium">Avg: {metrics.avgGrossMargin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedBoat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedBoat(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedBoat.hull_number}</h2>
                  <p className="text-gray-500">{selectedBoat.model_name} · {selectedBoat.order_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedBoat.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  selectedBoat.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedBoat.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* Cost Comparison Table */}
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left text-sm font-medium text-gray-500">Category</th>
                    <th className="py-2 text-right text-sm font-medium text-gray-500">Budget</th>
                    <th className="py-2 text-right text-sm font-medium text-gray-500">Actual</th>
                    <th className="py-2 text-right text-sm font-medium text-gray-500">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  {costCategories.map(category => {
                    const budget = (selectedBoat.budget as any)[category]
                    const actual = (selectedBoat.actual as any)[category]
                    const variance = budget - actual

                    return (
                      <tr key={category} className="border-b">
                        <td className="py-3 capitalize">{category}</td>
                        <td className="py-3 text-right font-mono">{formatCurrency(budget)}</td>
                        <td className="py-3 text-right font-mono">{formatCurrency(actual)}</td>
                        <td className={`py-3 text-right font-mono ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="font-bold">
                    <td className="py-3">Total</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(selectedBoat.budget.total)}</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(selectedBoat.actual.total)}</td>
                    <td className={`py-3 text-right font-mono ${selectedBoat.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedBoat.variance >= 0 ? '+' : ''}{formatCurrency(selectedBoat.variance)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Sale Price</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedBoat.sale_price)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Cost</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedBoat.actual.total)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Gross Margin</p>
                  <p className={`text-xl font-bold ${selectedBoat.gross_margin_pct >= 30 ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedBoat.gross_margin_pct.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedBoat.notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Notes:</strong> {selectedBoat.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setSelectedBoat(null)} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
