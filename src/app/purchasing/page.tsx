'use client'

import { useEffect, useState } from 'react'
import { Package, Truck, Clock, CheckCircle, AlertTriangle, Plus, Building2, Calendar, DollarSign } from 'lucide-react'
import { supabase, formatCurrency, formatDate } from '@/lib/supabase'

interface PurchaseOrder {
  id: string
  po_number: string
  supplier_name: string
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled'
  total_amount: number
  order_date: string
  expected_date: string | null
  received_date: string | null
  items: { component: string; qty: number; price: number }[]
}

interface LowStockItem {
  id: string
  component_code: string
  component_name: string
  qty_available: number
  min_stock: number
  supplier_name: string
  lead_time: number
}

export default function PurchasingPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [lowStock, setLowStock] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'orders' | 'reorder'>('orders')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch inventory with low stock
    const { data: inventory } = await supabase
      .from('inventory')
      .select(`
        id, qty_on_hand, qty_reserved,
        components (code, name, min_stock, lead_time_days, suppliers(name))
      `) as { data: any[] | null }

    if (inventory) {
      const lowStockItems = inventory
        .filter(i => {
          const available = (i.qty_on_hand || 0) - (i.qty_reserved || 0)
          const minStock = i.components?.min_stock || 0
          return available < minStock
        })
        .map(i => ({
          id: i.id,
          component_code: i.components?.code,
          component_name: i.components?.name,
          qty_available: (i.qty_on_hand || 0) - (i.qty_reserved || 0),
          min_stock: i.components?.min_stock || 0,
          supplier_name: i.components?.suppliers?.name || 'Unknown',
          lead_time: i.components?.lead_time_days || 14
        }))
      setLowStock(lowStockItems)
    }

    // Generate sample POs (in real app, these would come from a purchase_orders table)
    const samplePOs: PurchaseOrder[] = [
      {
        id: '1',
        po_number: 'PO-2026-001',
        supplier_name: 'Mercury Marine',
        status: 'confirmed',
        total_amount: 45000,
        order_date: '2026-01-15',
        expected_date: '2026-02-28',
        received_date: null,
        items: [{ component: 'V8 300HP Engine', qty: 2, price: 22500 }]
      },
      {
        id: '2',
        po_number: 'PO-2026-002',
        supplier_name: 'Garmin Marine',
        status: 'shipped',
        total_amount: 8500,
        order_date: '2026-01-20',
        expected_date: '2026-02-10',
        received_date: null,
        items: [{ component: 'GPSMap 922xs Plus', qty: 5, price: 1700 }]
      },
      {
        id: '3',
        po_number: 'PO-2026-003',
        supplier_name: 'Lewmar',
        status: 'received',
        total_amount: 3200,
        order_date: '2026-01-10',
        expected_date: '2026-01-25',
        received_date: '2026-01-24',
        items: [{ component: 'Windlass V3', qty: 4, price: 800 }]
      }
    ]
    setOrders(samplePOs)
    setLoading(false)
  }

  const stats = {
    pending: orders.filter(o => ['draft', 'sent', 'confirmed'].includes(o.status)).length,
    inTransit: orders.filter(o => o.status === 'shipped').length,
    received: orders.filter(o => o.status === 'received').length,
    lowStockCount: lowStock.length,
    totalPending: orders.filter(o => o.status !== 'received' && o.status !== 'cancelled').reduce((sum, o) => sum + o.total_amount, 0)
  }

  const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
    draft: { color: 'status-neutral', icon: Clock },
    sent: { color: 'status-info', icon: Clock },
    confirmed: { color: 'status-warning', icon: CheckCircle },
    shipped: { color: 'status-info', icon: Truck },
    received: { color: 'status-success', icon: CheckCircle },
    cancelled: { color: 'status-danger', icon: AlertTriangle }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading purchasing data...</div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchasing</h1>
          <p className="text-sm text-gray-500">{stats.pending} pending orders · {stats.lowStockCount} items need reorder</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" /> New Purchase Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-500">Pending Orders</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-500">In Transit</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.inTransit}</p>
        </div>
        <div className={`card p-4 ${stats.lowStockCount > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-500">Need Reorder</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${stats.lowStockCount > 0 ? 'text-red-600' : ''}`}>{stats.lowStockCount}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Pending Value</span>
          </div>
          <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalPending)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'reorder' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Reorder Suggestions
            {stats.lowStockCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{stats.lowStockCount}</span>
            )}
          </button>
        </nav>
      </div>

      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Expected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No purchase orders</td></tr>
              ) : (
                orders.map(order => {
                  const config = STATUS_CONFIG[order.status]
                  const StatusIcon = config.icon

                  return (
                    <tr key={order.id}>
                      <td className="font-medium text-dromeas-600">{order.po_number}</td>
                      <td>
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          {order.supplier_name}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {order.items.map((item, i) => (
                            <div key={i}>{item.qty}x {item.component}</div>
                          ))}
                        </div>
                      </td>
                      <td className="font-medium">{formatCurrency(order.total_amount)}</td>
                      <td>
                        {order.expected_date ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {formatDate(order.expected_date)}
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${config.color} flex items-center w-fit`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reorder' && (
        <div className="space-y-3">
          {lowStock.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">All items are above minimum stock levels</p>
            </div>
          ) : (
            lowStock.map(item => (
              <div key={item.id} className="card p-4 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.component_name}</h3>
                    <p className="text-sm text-gray-500">{item.component_code}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-red-600 font-medium">
                        {item.qty_available} available (min: {item.min_stock})
                      </span>
                      <span className="text-gray-500">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        {item.supplier_name}
                      </span>
                      <span className="text-gray-500">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {item.lead_time} days lead time
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-primary text-sm">
                    <Plus className="h-4 w-4 mr-1" /> Create PO
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
