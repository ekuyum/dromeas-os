'use client'

import { useEffect, useState } from 'react'
import { Package, AlertTriangle, TrendingDown, TrendingUp, Search, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface InventoryItem {
  id: string
  qty_on_hand: number
  qty_reserved: number
  qty_on_order: number
  components: {
    code: string
    name: string
    category: string
    min_stock: number
    unit: string
  }
  locations: {
    name: string
  }
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('all')

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('inventory')
      .select(`
        id, qty_on_hand, qty_reserved, qty_on_order,
        components (code, name, category, min_stock, unit),
        locations (name)
      `)

    if (data) setInventory(data as InventoryItem[])
    setLoading(false)
  }

  const locations = ['all', ...new Set(inventory.map(i => i.locations?.name).filter(Boolean))]

  const filteredInventory = inventory.filter(item => {
    if (!item.components) return false
    const matchesSearch = item.components.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.components.code?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLocation = selectedLocation === 'all' || item.locations?.name === selectedLocation
    const available = (item.qty_on_hand || 0) - (item.qty_reserved || 0)
    const matchesStock = !showLowStock || available < (item.components.min_stock || 0)
    return matchesSearch && matchesLocation && matchesStock
  })

  const totalItems = inventory.length
  const lowStockItems = inventory.filter(i => {
    const available = (i.qty_on_hand || 0) - (i.qty_reserved || 0)
    return available < (i.components?.min_stock || 0)
  }).length
  const totalOnOrder = inventory.reduce((sum, i) => sum + (i.qty_on_order || 0), 0)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading inventory...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Stock levels across all locations</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={fetchInventory} className="btn btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Total SKUs</p>
              <p className="metric-value">{totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-dromeas-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Low Stock Alerts</p>
              <p className={`metric-value ${lowStockItems > 0 ? 'text-red-600' : ''}`}>{lowStockItems}</p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${lowStockItems > 0 ? 'text-red-400' : 'text-gray-300'}`} />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Items On Order</p>
              <p className="metric-value text-blue-600">{totalOnOrder}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="metric-label">Locations</p>
              <p className="metric-value">{locations.length - 1}</p>
            </div>
            <Package className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-dromeas-500"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dromeas-500"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc === 'all' ? 'All Locations' : loc}</option>
            ))}
          </select>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-3 py-2 text-sm rounded-lg ${showLowStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Low Stock Only
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Component</th>
              <th>Category</th>
              <th>Location</th>
              <th>On Hand</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>On Order</th>
              <th>Min Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInventory.map(item => {
              const available = (item.qty_on_hand || 0) - (item.qty_reserved || 0)
              const isLow = available < (item.components?.min_stock || 0)
              return (
                <tr key={item.id} className={isLow ? 'bg-red-50' : ''}>
                  <td className="font-mono text-sm">{item.components?.code}</td>
                  <td className="font-medium">{item.components?.name}</td>
                  <td><span className="status-badge status-info">{item.components?.category}</span></td>
                  <td className="text-gray-500">{item.locations?.name}</td>
                  <td className="font-medium">{item.qty_on_hand} {item.components?.unit}</td>
                  <td className="text-gray-500">{item.qty_reserved}</td>
                  <td className={`font-medium ${isLow ? 'text-red-600' : 'text-green-600'}`}>{available}</td>
                  <td className="text-blue-600">{item.qty_on_order > 0 ? `+${item.qty_on_order}` : '-'}</td>
                  <td className="text-gray-500">{item.components?.min_stock}</td>
                  <td>
                    {isLow ? (
                      <span className="status-badge status-danger">Low Stock</span>
                    ) : (
                      <span className="status-badge status-success">OK</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
