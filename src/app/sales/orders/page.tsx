'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Eye, Filter, Download } from 'lucide-react'
import { supabase, formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/supabase'

interface Order {
  id: string
  order_number: string
  status: string
  total_eur: number
  order_date: string
  target_delivery_date: string | null
  deposit_paid_date: string | null
  milestone_paid_date: string | null
  final_paid_date: string | null
  customers: { company_name: string | null; first_name: string | null; last_name: string | null; country: string } | null
  models: { name: string; code: string } | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total_eur, order_date, target_delivery_date,
        deposit_paid_date, milestone_paid_date, final_paid_date,
        customers (company_name, first_name, last_name, country),
        models (name, code)
      `)
      .order('created_at', { ascending: false })

    if (data) setOrders(data as Order[])
    setLoading(false)
  }

  const getCustomerName = (order: Order) => {
    if (order.customers?.company_name) return order.customers.company_name
    return `${order.customers?.first_name || ''} ${order.customers?.last_name || ''}`.trim() || 'Unknown'
  }

  const getPaymentProgress = (order: Order) => {
    let paid = 0
    if (order.deposit_paid_date) paid++
    if (order.milestone_paid_date) paid++
    if (order.final_paid_date) paid++
    return paid
  }

  const statuses = ['all', 'deposit_pending', 'deposit_received', 'in_production', 'ready', 'delivered']
  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)

  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.total_eur || 0), 0)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading orders...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{filteredOrders.length} orders • {formatCurrency(totalValue)} total value</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />Export
          </button>
          <Link href="/sales/quotes" className="btn btn-primary">
            <ShoppingCart className="h-4 w-4 mr-2" />New from Quote
          </Link>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
              statusFilter === status ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All Orders' : formatStatus(status)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Model</th>
              <th>Value</th>
              <th>Order Date</th>
              <th>Delivery</th>
              <th>Payments</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="font-medium text-dromeas-600">{order.order_number}</td>
                <td>
                  <div>
                    <p className="font-medium">{getCustomerName(order)}</p>
                    <p className="text-xs text-gray-500">{order.customers?.country}</p>
                  </div>
                </td>
                <td>{order.models?.name}</td>
                <td className="font-medium">{formatCurrency(order.total_eur)}</td>
                <td>{formatDate(order.order_date)}</td>
                <td>{formatDate(order.target_delivery_date)}</td>
                <td>
                  <div className="flex space-x-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-6 h-2 rounded ${i <= getPaymentProgress(order) ? 'bg-green-500' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{getPaymentProgress(order)}/3 paid</p>
                </td>
                <td><span className={`status-badge ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span></td>
                <td>
                  <Link href={`/sales/orders/${order.id}`} className="p-2 text-gray-400 hover:text-dromeas-600">
                    <Eye className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
