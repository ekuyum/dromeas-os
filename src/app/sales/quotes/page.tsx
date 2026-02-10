'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Eye, Send, CheckCircle, XCircle } from 'lucide-react'
import { supabase, formatCurrency, formatDate, getStatusColor, formatStatus } from '@/lib/supabase'

interface Quote {
  id: string
  quote_number: string
  status: string
  total_eur: number
  valid_until: string | null
  created_at: string
  customers: { company_name: string | null; first_name: string | null; last_name: string | null; country: string } | null
  models: { name: string; code: string } | null
  engines: { brand: string; model: string; hp: number } | null
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchQuotes()
  }, [])

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        id, quote_number, status, total_eur, valid_until, created_at,
        customers (company_name, first_name, last_name, country),
        models (name, code),
        engines (brand, model, hp)
      `)
      .order('created_at', { ascending: false })

    if (data) setQuotes(data as Quote[])
    setLoading(false)
  }

  const getCustomerName = (quote: Quote) => {
    if (quote.customers?.company_name) return quote.customers.company_name
    return `${quote.customers?.first_name || ''} ${quote.customers?.last_name || ''}`.trim() || 'Unknown'
  }

  const statuses = ['all', 'draft', 'sent', 'negotiating', 'won', 'lost']
  const filteredQuotes = statusFilter === 'all' ? quotes : quotes.filter(q => q.status === statusFilter)

  const stats = {
    total: quotes.length,
    won: quotes.filter(q => q.status === 'won').length,
    pending: quotes.filter(q => ['sent', 'negotiating'].includes(q.status)).length,
    winRate: quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'won').length / quotes.filter(q => ['won', 'lost'].includes(q.status)).length) * 100) || 0 : 0
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading quotes...</div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500">{stats.pending} pending • {stats.winRate}% win rate</p>
        </div>
        <Link href="/sales/quotes/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />New Quote
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card">
          <p className="metric-label">Total Quotes</p>
          <p className="metric-value">{stats.total}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Won</p>
          <p className="metric-value text-green-600">{stats.won}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Pending</p>
          <p className="metric-value text-blue-600">{stats.pending}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Win Rate</p>
          <p className="metric-value">{stats.winRate}%</p>
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
            {status === 'all' ? 'All Quotes' : formatStatus(status)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Customer</th>
              <th>Configuration</th>
              <th>Value</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredQuotes.map(quote => (
              <tr key={quote.id}>
                <td className="font-medium text-dromeas-600">{quote.quote_number}</td>
                <td>
                  <div>
                    <p className="font-medium">{getCustomerName(quote)}</p>
                    <p className="text-xs text-gray-500">{quote.customers?.country}</p>
                  </div>
                </td>
                <td>
                  <div>
                    <p className="font-medium">{quote.models?.name}</p>
                    <p className="text-xs text-gray-500">{quote.engines?.brand} {quote.engines?.hp}HP</p>
                  </div>
                </td>
                <td className="font-medium">{formatCurrency(quote.total_eur)}</td>
                <td>
                  <span className={quote.valid_until && new Date(quote.valid_until) < new Date() ? 'text-red-600' : ''}>
                    {formatDate(quote.valid_until)}
                  </span>
                </td>
                <td><span className={`status-badge ${getStatusColor(quote.status)}`}>{formatStatus(quote.status)}</span></td>
                <td>
                  <div className="flex space-x-1">
                    <button className="p-1.5 text-gray-400 hover:text-dromeas-600 rounded"><Eye className="h-4 w-4" /></button>
                    {quote.status === 'draft' && <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Send className="h-4 w-4" /></button>}
                    {['sent', 'negotiating'].includes(quote.status) && (
                      <>
                        <button className="p-1.5 text-gray-400 hover:text-green-600 rounded"><CheckCircle className="h-4 w-4" /></button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 rounded"><XCircle className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
