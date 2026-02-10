'use client'

import { useEffect, useState } from 'react'
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Send, Download, Filter } from 'lucide-react'
import { supabase, formatCurrency, formatDate } from '@/lib/supabase'

interface Invoice {
  id: string
  order_id: string
  order_number: string
  customer_name: string
  type: 'deposit' | 'milestone' | 'final'
  amount: number
  due_date: string | null
  paid_date: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue'
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'all', type: 'all' })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    // Generate invoices from orders
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, order_number, total_eur, created_at, target_delivery_date,
        deposit_paid_date, milestone_paid_date, final_paid_date,
        customers (company_name, first_name, last_name)
      `)
      .order('created_at', { ascending: false }) as { data: any[] | null }

    if (!orders) {
      setLoading(false)
      return
    }

    const generatedInvoices: Invoice[] = []
    const now = new Date()

    orders.forEach(order => {
      const customerName = order.customers?.company_name ||
        `${order.customers?.first_name || ''} ${order.customers?.last_name || ''}`.trim()

      // Deposit invoice
      const depositDue = new Date(order.created_at)
      depositDue.setDate(depositDue.getDate() + 7)
      generatedInvoices.push({
        id: `${order.id}-deposit`,
        order_id: order.id,
        order_number: order.order_number,
        customer_name: customerName,
        type: 'deposit',
        amount: order.total_eur * 0.3,
        due_date: depositDue.toISOString(),
        paid_date: order.deposit_paid_date,
        status: order.deposit_paid_date ? 'paid' : (depositDue < now ? 'overdue' : 'sent')
      })

      // Milestone invoice (if deposit paid)
      if (order.deposit_paid_date) {
        const milestoneDue = order.target_delivery_date
          ? new Date(new Date(order.target_delivery_date).getTime() - 60 * 24 * 60 * 60 * 1000)
          : new Date(order.created_at)
        milestoneDue.setDate(milestoneDue.getDate() + 60)

        generatedInvoices.push({
          id: `${order.id}-milestone`,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: customerName,
          type: 'milestone',
          amount: order.total_eur * 0.4,
          due_date: milestoneDue.toISOString(),
          paid_date: order.milestone_paid_date,
          status: order.milestone_paid_date ? 'paid' : (milestoneDue < now ? 'overdue' : 'sent')
        })
      }

      // Final invoice (if milestone paid)
      if (order.milestone_paid_date) {
        const finalDue = order.target_delivery_date
          ? new Date(order.target_delivery_date)
          : new Date()

        generatedInvoices.push({
          id: `${order.id}-final`,
          order_id: order.id,
          order_number: order.order_number,
          customer_name: customerName,
          type: 'final',
          amount: order.total_eur * 0.3,
          due_date: finalDue.toISOString(),
          paid_date: order.final_paid_date,
          status: order.final_paid_date ? 'paid' : (finalDue < now ? 'overdue' : 'sent')
        })
      }
    })

    setInvoices(generatedInvoices)
    setLoading(false)
  }

  const filteredInvoices = invoices.filter(inv => {
    if (filter.status !== 'all' && inv.status !== filter.status) return false
    if (filter.type !== 'all' && inv.type !== filter.type) return false
    return true
  })

  const stats = {
    total: invoices.reduce((sum, i) => sum + i.amount, 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pending: invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
    overdueCount: invoices.filter(i => i.status === 'overdue').length
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading invoices...</div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">{invoices.length} invoices · {stats.overdueCount} overdue</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Invoiced</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.total)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
        </div>
        <div className={`card p-4 ${stats.overdue > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <p className="text-sm text-gray-500">Overdue</p>
          <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-red-600' : ''}`}>{formatCurrency(stats.overdue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter({...filter, status: 'all'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.status === 'all' ? 'bg-dromeas-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All Status</button>
        <button onClick={() => setFilter({...filter, status: 'sent'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.status === 'sent' ? 'bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Pending</button>
        <button onClick={() => setFilter({...filter, status: 'overdue'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.status === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Overdue</button>
        <button onClick={() => setFilter({...filter, status: 'paid'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.status === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Paid</button>
        <div className="w-px bg-gray-300 mx-2" />
        <button onClick={() => setFilter({...filter, type: 'all'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.type === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All Types</button>
        <button onClick={() => setFilter({...filter, type: 'deposit'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.type === 'deposit' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Deposit (30%)</button>
        <button onClick={() => setFilter({...filter, type: 'milestone'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.type === 'milestone' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Milestone (40%)</button>
        <button onClick={() => setFilter({...filter, type: 'final'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.type === 'final' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Final (30%)</button>
      </div>

      {/* Invoice Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInvoices.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-8">No invoices found</td></tr>
            ) : (
              filteredInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>
                    <div>
                      <p className="font-medium text-dromeas-600">{invoice.order_number}</p>
                      <p className="text-xs text-gray-400 capitalize">{invoice.type}</p>
                    </div>
                  </td>
                  <td>{invoice.customer_name}</td>
                  <td>
                    <span className={`status-badge ${
                      invoice.type === 'deposit' ? 'status-info' :
                      invoice.type === 'milestone' ? 'status-warning' : 'status-success'
                    }`}>
                      {invoice.type === 'deposit' ? '30% Deposit' :
                       invoice.type === 'milestone' ? '40% Milestone' : '30% Final'}
                    </span>
                  </td>
                  <td className="font-medium">{formatCurrency(invoice.amount)}</td>
                  <td className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                    {invoice.due_date ? formatDate(invoice.due_date) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      invoice.status === 'paid' ? 'status-success' :
                      invoice.status === 'overdue' ? 'status-danger' :
                      invoice.status === 'sent' ? 'status-warning' : 'status-neutral'
                    }`}>
                      {invoice.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {invoice.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {invoice.status === 'sent' && <Clock className="h-3 w-3 mr-1" />}
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-dromeas-600" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button className="p-1 text-gray-400 hover:text-green-600" title="Mark as Paid">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {invoice.status === 'overdue' && (
                        <button className="p-1 text-gray-400 hover:text-blue-600" title="Send Reminder">
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
