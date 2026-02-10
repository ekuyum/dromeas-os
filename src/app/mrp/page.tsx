'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  Play,
  FileText,
  ChevronRight,
  Calendar,
  Target,
  Zap,
} from 'lucide-react'
import { supabase, formatCurrency, formatDate } from '@/lib/supabase'

interface MRPRequirement {
  id: string
  component_id: string
  component_code: string
  component_name: string
  qty_on_hand: number
  qty_reserved: number
  qty_available: number
  min_stock: number
  net_requirement: number
  lead_time_days: number
  supplier_name: string
  unit_cost: number
  status: 'OK' | 'LOW' | 'REORDER' | 'CRITICAL'
  demand_from: string[] // Orders driving demand
  suggested_order_date: string
}

interface MRPSuggestion {
  id: string
  component_code: string
  component_name: string
  suggested_qty: number
  suggested_order_date: string
  required_date: string
  reason: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  estimated_cost: number
  supplier_name: string
}

interface MRPRun {
  id: string
  run_date: string
  status: string
  total_suggestions: number
  total_value: number
}

export default function MRPPage() {
  const [requirements, setRequirements] = useState<MRPRequirement[]>([])
  const [suggestions, setSuggestions] = useState<MRPSuggestion[]>([])
  const [lastRun, setLastRun] = useState<MRPRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [inventoryRes, componentsRes, ordersRes] = await Promise.all([
      supabase.from('inventory').select('id, component_id, qty_on_hand, qty_reserved'),
      supabase.from('components').select('id, code, name, min_stock, lead_time_days, unit_cost_eur, suppliers(name)'),
      supabase.from('orders').select('id, order_number, status').in('status', ['deposit_received', 'in_production']),
    ])

    const inventory = (inventoryRes.data || []) as any[]
    const components = (componentsRes.data || []) as any[]
    const orders = (ordersRes.data || []) as any[]

    // Calculate MRP requirements
    const reqs: MRPRequirement[] = components.map(comp => {
      const inv = inventory.find(i => i.component_id === comp.id) || { qty_on_hand: 0, qty_reserved: 0 }
      const available = (inv.qty_on_hand || 0) - (inv.qty_reserved || 0)
      const netReq = Math.max(0, (comp.min_stock || 0) - available)

      let status: 'OK' | 'LOW' | 'REORDER' | 'CRITICAL' = 'OK'
      if (available <= 0) status = 'CRITICAL'
      else if (available < comp.min_stock) status = 'REORDER'
      else if (available < comp.min_stock * 1.5) status = 'LOW'

      // Calculate suggested order date (today + lead time buffer)
      const orderDate = new Date()
      orderDate.setDate(orderDate.getDate() + Math.max(0, comp.lead_time_days - 7))

      return {
        id: comp.id,
        component_id: comp.id,
        component_code: comp.code,
        component_name: comp.name,
        qty_on_hand: inv.qty_on_hand || 0,
        qty_reserved: inv.qty_reserved || 0,
        qty_available: available,
        min_stock: comp.min_stock || 0,
        net_requirement: netReq,
        lead_time_days: comp.lead_time_days || 14,
        supplier_name: comp.suppliers?.name || 'Unknown',
        unit_cost: comp.unit_cost_eur || 0,
        status,
        demand_from: orders.slice(0, 3).map(o => o.order_number),
        suggested_order_date: orderDate.toISOString().split('T')[0],
      }
    })

    // Sort by priority
    reqs.sort((a, b) => {
      const priority = { CRITICAL: 0, REORDER: 1, LOW: 2, OK: 3 }
      return priority[a.status] - priority[b.status]
    })

    setRequirements(reqs)

    // Generate suggestions for items that need reorder
    const suggs: MRPSuggestion[] = reqs
      .filter(r => r.status === 'CRITICAL' || r.status === 'REORDER')
      .map(r => ({
        id: r.id,
        component_code: r.component_code,
        component_name: r.component_name,
        suggested_qty: Math.max(r.net_requirement, r.min_stock * 2), // Order at least 2x min stock
        suggested_order_date: r.suggested_order_date,
        required_date: new Date(Date.now() + r.lead_time_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: r.status === 'CRITICAL' ? 'Out of stock' : 'Below minimum',
        priority: r.status === 'CRITICAL' ? 'critical' : 'high',
        estimated_cost: r.unit_cost * Math.max(r.net_requirement, r.min_stock * 2),
        supplier_name: r.supplier_name,
      }))

    setSuggestions(suggs)

    // Simulated last run
    setLastRun({
      id: 'run-1',
      run_date: new Date().toISOString(),
      status: 'completed',
      total_suggestions: suggs.length,
      total_value: suggs.reduce((sum, s) => sum + s.estimated_cost, 0),
    })

    setLoading(false)
  }

  const runMRP = async () => {
    setRunning(true)
    // Simulate MRP calculation
    await new Promise(resolve => setTimeout(resolve, 2000))
    await fetchData()
    setRunning(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAll = () => {
    setSelectedItems(new Set(suggestions.map(s => s.id)))
  }

  const clearSelection = () => {
    setSelectedItems(new Set())
  }

  const createPOsForSelected = () => {
    alert(`Creating POs for ${selectedItems.size} items. This would:\n\n1. Group by supplier\n2. Create purchase orders\n3. Link to MRP suggestions\n4. Update suggestion status`)
  }

  const stats = {
    critical: requirements.filter(r => r.status === 'CRITICAL').length,
    reorder: requirements.filter(r => r.status === 'REORDER').length,
    low: requirements.filter(r => r.status === 'LOW').length,
    ok: requirements.filter(r => r.status === 'OK').length,
    totalValue: suggestions.reduce((sum, s) => sum + s.estimated_cost, 0),
  }

  const filteredRequirements = filterStatus === 'all'
    ? requirements
    : requirements.filter(r => r.status === filterStatus)

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
          <h1 className="text-2xl font-bold text-gray-900">MRP Engine</h1>
          <p className="text-sm text-gray-500">
            Material Requirements Planning • Auto-reorder suggestions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last run: {lastRun ? formatDate(lastRun.run_date) : 'Never'}
          </span>
          <button
            onClick={runMRP}
            disabled={running}
            className="btn btn-primary"
          >
            {running ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run MRP
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Critical</p>
              <p className="text-3xl font-bold text-red-800">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <p className="text-xs text-red-600 mt-1">Out of stock</p>
        </div>
        <div className="card p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Reorder Now</p>
              <p className="text-3xl font-bold text-orange-800">{stats.reorder}</p>
            </div>
            <Truck className="h-10 w-10 text-orange-400" />
          </div>
          <p className="text-xs text-orange-600 mt-1">Below minimum</p>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-800">{stats.low}</p>
            </div>
            <Package className="h-10 w-10 text-yellow-400" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">Watch closely</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">OK</p>
              <p className="text-3xl font-bold text-green-800">{stats.ok}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <p className="text-xs text-green-600 mt-1">Sufficient stock</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Est. PO Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-1">{suggestions.length} suggestions</p>
        </div>
      </div>

      {/* Suggestions Panel */}
      {suggestions.length > 0 && (
        <div className="card border-2 border-orange-200 bg-orange-50">
          <div className="card-header flex items-center justify-between bg-orange-100">
            <h3 className="font-semibold text-orange-800 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              MRP Suggestions ({suggestions.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button onClick={selectAll} className="text-sm text-orange-700 hover:text-orange-900">
                Select All
              </button>
              <span className="text-orange-300">|</span>
              <button onClick={clearSelection} className="text-sm text-orange-700 hover:text-orange-900">
                Clear
              </button>
              <button
                onClick={createPOsForSelected}
                disabled={selectedItems.size === 0}
                className="btn btn-sm bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-1" />
                Create POs ({selectedItems.size})
              </button>
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-100 sticky top-0">
                <tr>
                  <th className="py-2 px-3 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === suggestions.length}
                      onChange={() => selectedItems.size === suggestions.length ? clearSelection() : selectAll()}
                      className="rounded"
                    />
                  </th>
                  <th className="py-2 px-3 text-left">Component</th>
                  <th className="py-2 px-3 text-right">Qty</th>
                  <th className="py-2 px-3 text-left">Supplier</th>
                  <th className="py-2 px-3 text-left">Order By</th>
                  <th className="py-2 px-3 text-right">Est. Cost</th>
                  <th className="py-2 px-3 text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-200">
                {suggestions.map(s => (
                  <tr key={s.id} className="hover:bg-orange-100/50">
                    <td className="py-2 px-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(s.id)}
                        onChange={() => toggleSelect(s.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900">{s.component_name}</div>
                      <div className="text-xs text-gray-500">{s.component_code}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">{s.suggested_qty}</td>
                    <td className="py-2 px-3 text-gray-600">{s.supplier_name}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(s.suggested_order_date)}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">{formatCurrency(s.estimated_cost)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`status-badge ${
                        s.priority === 'critical' ? 'status-danger' :
                        s.priority === 'high' ? 'status-warning' : 'status-info'
                      }`}>
                        {s.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">Filter:</span>
        {['all', 'CRITICAL', 'REORDER', 'LOW', 'OK'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 text-sm rounded-full ${
              filterStatus === status
                ? 'bg-dromeas-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Requirements Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="font-semibold">Net Requirements ({filteredRequirements.length})</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Component</th>
              <th className="text-right">On Hand</th>
              <th className="text-right">Reserved</th>
              <th className="text-right">Available</th>
              <th className="text-right">Min Stock</th>
              <th className="text-right">Net Req</th>
              <th className="text-right">Lead Time</th>
              <th>Supplier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRequirements.slice(0, 30).map(req => (
              <tr key={req.id}>
                <td>
                  <span className={`status-badge ${
                    req.status === 'CRITICAL' ? 'status-danger' :
                    req.status === 'REORDER' ? 'status-warning' :
                    req.status === 'LOW' ? 'bg-yellow-100 text-yellow-700' : 'status-success'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <div className="font-medium text-gray-900">{req.component_name}</div>
                  <div className="text-xs text-gray-500">{req.component_code}</div>
                </td>
                <td className="text-right">{req.qty_on_hand}</td>
                <td className="text-right text-gray-500">{req.qty_reserved}</td>
                <td className={`text-right font-medium ${
                  req.qty_available <= 0 ? 'text-red-600' :
                  req.qty_available < req.min_stock ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {req.qty_available}
                </td>
                <td className="text-right text-gray-500">{req.min_stock}</td>
                <td className={`text-right font-medium ${req.net_requirement > 0 ? 'text-red-600' : ''}`}>
                  {req.net_requirement > 0 ? req.net_requirement : '-'}
                </td>
                <td className={`text-right ${req.lead_time_days > 30 ? 'text-red-600 font-medium' : ''}`}>
                  {req.lead_time_days}d
                </td>
                <td className="text-gray-600">{req.supplier_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Links */}
      <div className="flex space-x-4">
        <Link href="/products/bom" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Package className="h-4 w-4 mr-1" /> View BOMs →
        </Link>
        <Link href="/purchasing" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <FileText className="h-4 w-4 mr-1" /> Purchase Orders →
        </Link>
        <Link href="/inventory" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Package className="h-4 w-4 mr-1" /> Inventory →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" /> Ask AI about supply →
        </Link>
      </div>
    </div>
  )
}
