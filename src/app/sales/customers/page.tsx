'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Building, User, Globe } from 'lucide-react'
import { supabase, formatDate } from '@/lib/supabase'

interface Customer {
  id: string
  code: string | null
  company_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  country: string
  customer_type: string
  source: string | null
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setCustomers(data)
    setLoading(false)
  }

  const getName = (c: Customer) => c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim()

  const filteredCustomers = typeFilter === 'all' ? customers : customers.filter(c => c.customer_type === typeFilter)

  const stats = {
    total: customers.length,
    dealers: customers.filter(c => c.customer_type === 'dealer').length,
    direct: customers.filter(c => c.customer_type === 'direct').length,
    countries: [...new Set(customers.map(c => c.country))].length
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{stats.total} customers across {stats.countries} countries</p>
        </div>
        <button className="btn btn-primary"><Plus className="h-4 w-4 mr-2" />Add Customer</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card"><p className="metric-label">Total Customers</p><p className="metric-value">{stats.total}</p></div>
        <div className="metric-card"><p className="metric-label">Dealers</p><p className="metric-value text-blue-600">{stats.dealers}</p></div>
        <div className="metric-card"><p className="metric-label">Direct Buyers</p><p className="metric-value text-green-600">{stats.direct}</p></div>
        <div className="metric-card"><p className="metric-label">Countries</p><p className="metric-value">{stats.countries}</p></div>
      </div>

      <div className="flex space-x-2">
        {['all', 'dealer', 'direct'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-sm rounded-lg ${typeFilter === type ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {type === 'all' ? 'All' : type === 'dealer' ? 'Dealers' : 'Direct'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${customer.customer_type === 'dealer' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  {customer.customer_type === 'dealer' ? <Building className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-green-600" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{getName(customer)}</p>
                  <p className="text-sm text-gray-500">{customer.code}</p>
                </div>
              </div>
              <span className={`status-badge ${customer.customer_type === 'dealer' ? 'status-info' : 'status-success'}`}>
                {customer.customer_type}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center text-gray-500">
                <Globe className="h-4 w-4 mr-2" />
                {customer.city ? `${customer.city}, ` : ''}{customer.country}
              </div>
              {customer.email && <p className="text-gray-600">{customer.email}</p>}
              {customer.phone && <p className="text-gray-600">{customer.phone}</p>}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
              <span>Source: {customer.source || 'Unknown'}</span>
              <span>Added {formatDate(customer.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
