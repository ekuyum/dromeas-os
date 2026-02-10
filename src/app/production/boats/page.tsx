'use client'

import { useEffect, useState } from 'react'
import { Anchor, Eye, MapPin } from 'lucide-react'
import { supabase, formatDate, getStatusColor, formatStatus } from '@/lib/supabase'

interface Boat {
  id: string
  hull_number: string
  hin: string | null
  status: string
  build_start_date: string | null
  build_end_date: string | null
  delivery_date: string | null
  current_location: string | null
  models: { name: string; code: string } | null
  orders: { order_number: string; customers: { company_name: string | null } | null } | null
}

export default function BoatsPage() {
  const [boats, setBoats] = useState<Boat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBoats()
  }, [])

  const fetchBoats = async () => {
    const { data } = await supabase
      .from('boats')
      .select(`
        id, hull_number, hin, status, build_start_date, build_end_date, delivery_date, current_location,
        models (name, code),
        orders (order_number, customers (company_name))
      `)
      .order('created_at', { ascending: false })

    if (data) setBoats(data as Boat[])
    setLoading(false)
  }

  const stats = {
    total: boats.length,
    building: boats.filter(b => b.status === 'building').length,
    completed: boats.filter(b => b.status === 'completed').length,
    delivered: boats.filter(b => b.status === 'delivered').length
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boats</h1>
          <p className="text-sm text-gray-500">Physical hull tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="metric-card"><p className="metric-label">Total Boats</p><p className="metric-value">{stats.total}</p></div>
        <div className="metric-card"><p className="metric-label">Building</p><p className="metric-value text-blue-600">{stats.building}</p></div>
        <div className="metric-card"><p className="metric-label">Completed</p><p className="metric-value text-green-600">{stats.completed}</p></div>
        <div className="metric-card"><p className="metric-label">Delivered</p><p className="metric-value text-gray-600">{stats.delivered}</p></div>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Hull #</th>
              <th>Model</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Build Started</th>
              <th>Location</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {boats.map(boat => (
              <tr key={boat.id}>
                <td>
                  <div className="flex items-center">
                    <Anchor className="h-4 w-4 text-dromeas-500 mr-2" />
                    <span className="font-mono font-medium">{boat.hull_number}</span>
                  </div>
                </td>
                <td>{boat.models?.name}</td>
                <td className="text-dromeas-600 font-medium">{boat.orders?.order_number || '-'}</td>
                <td>{boat.orders?.customers?.company_name || '-'}</td>
                <td>{formatDate(boat.build_start_date)}</td>
                <td>
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {boat.current_location || 'Unknown'}
                  </div>
                </td>
                <td><span className={`status-badge ${getStatusColor(boat.status)}`}>{formatStatus(boat.status)}</span></td>
                <td><button className="p-2 text-gray-400 hover:text-dromeas-600"><Eye className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
