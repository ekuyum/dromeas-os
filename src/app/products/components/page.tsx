'use client'

import { useState } from 'react'
import { Package, Plus, Search, Filter, AlertTriangle, Download, Upload } from 'lucide-react'

// Mock data for components
const mockComponents = [
  { id: '1', code: 'HULL-001', name: 'Hull Resin Premium', category: 'Hull', cost_eur: 85, retail_eur: 120, min_stock: 50, stock: 23, unit: 'kg', supplier: 'Marine Supply Co', is_active: true },
  { id: '2', code: 'HULL-002', name: 'Gelcoat White RAL 9010', category: 'Hull', cost_eur: 45, retail_eur: 65, min_stock: 30, stock: 45, unit: 'kg', supplier: 'Marine Supply Co', is_active: true },
  { id: '3', code: 'DECK-001', name: 'Teak Decking 19mm', category: 'Deck', cost_eur: 180, retail_eur: 280, min_stock: 100, stock: 85, unit: 'm2', supplier: 'Teak Masters', is_active: true },
  { id: '4', code: 'ELEC-001', name: 'Marine Battery 12V 100Ah', category: 'Electrical', cost_eur: 320, retail_eur: 450, min_stock: 10, stock: 12, unit: 'pcs', supplier: 'Power Systems', is_active: true },
  { id: '5', code: 'NAV-001', name: 'Garmin GPSMap 922', category: 'Navigation', cost_eur: 1200, retail_eur: 1650, min_stock: 5, stock: 3, unit: 'pcs', supplier: 'Nav Tech', is_active: true },
  { id: '6', code: 'NAV-002', name: 'Radar Dome 4kW', category: 'Navigation', cost_eur: 2800, retail_eur: 3500, min_stock: 3, stock: 4, unit: 'pcs', supplier: 'Nav Tech', is_active: true },
  { id: '7', code: 'INT-001', name: 'Marine Upholstery Fabric', category: 'Interior', cost_eur: 95, retail_eur: 140, min_stock: 50, stock: 120, unit: 'm2', supplier: 'Fabric World', is_active: true },
  { id: '8', code: 'INT-002', name: 'Stainless Steel Rail 25mm', category: 'Interior', cost_eur: 45, retail_eur: 70, min_stock: 100, stock: 78, unit: 'm', supplier: 'Steel Works', is_active: true },
  { id: '9', code: 'SAFE-001', name: 'Life Jacket Auto-Inflate', category: 'Safety', cost_eur: 180, retail_eur: 250, min_stock: 20, stock: 32, unit: 'pcs', supplier: 'Safety First', is_active: true },
  { id: '10', code: 'SAFE-002', name: 'Fire Extinguisher Marine', category: 'Safety', cost_eur: 65, retail_eur: 95, min_stock: 15, stock: 8, unit: 'pcs', supplier: 'Safety First', is_active: true },
]

const categories = ['All', 'Hull', 'Deck', 'Electrical', 'Navigation', 'Interior', 'Safety']

export default function ComponentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)

  const filteredComponents = mockComponents.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStock = !showLowStock || c.stock < c.min_stock
    return matchesCategory && matchesSearch && matchesStock
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
  }

  const lowStockCount = mockComponents.filter(c => c.stock < c.min_stock).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Components</h1>
          <p className="text-sm text-gray-500">Manage parts and inventory items</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-secondary">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">{lowStockCount} components below minimum stock</p>
              <p className="text-sm text-yellow-600">Review and create purchase orders</p>
            </div>
          </div>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              showLowStock ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            {showLowStock ? 'Show All' : 'Show Low Stock'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-dromeas-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-dromeas-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Components Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Retail</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Min Stock</th>
                <th>Supplier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredComponents.map((component) => {
                const margin = ((component.retail_eur - component.cost_eur) / component.retail_eur * 100).toFixed(1)
                const isLowStock = component.stock < component.min_stock

                return (
                  <tr key={component.id} className={isLowStock ? 'bg-red-50' : ''}>
                    <td className="font-mono text-sm">{component.code}</td>
                    <td className="font-medium">{component.name}</td>
                    <td>
                      <span className="status-badge status-info">{component.category}</span>
                    </td>
                    <td>{formatCurrency(component.cost_eur)}</td>
                    <td>{formatCurrency(component.retail_eur)}</td>
                    <td>
                      <span className={`font-medium ${
                        parseFloat(margin) > 30 ? 'text-green-600' :
                        parseFloat(margin) > 20 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {margin}%
                      </span>
                    </td>
                    <td>
                      <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {component.stock} {component.unit}
                      </span>
                    </td>
                    <td className="text-gray-500">{component.min_stock}</td>
                    <td className="text-gray-500">{component.supplier}</td>
                    <td>
                      {isLowStock ? (
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

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="metric-card">
          <p className="metric-label">Total Components</p>
          <p className="metric-value">{mockComponents.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Categories</p>
          <p className="metric-value">{categories.length - 1}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Low Stock Items</p>
          <p className="metric-value text-red-600">{lowStockCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Inventory Value</p>
          <p className="metric-value">
            {formatCurrency(mockComponents.reduce((sum, c) => sum + (c.stock * c.cost_eur), 0))}
          </p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Avg Margin</p>
          <p className="metric-value">
            {(mockComponents.reduce((sum, c) => sum + ((c.retail_eur - c.cost_eur) / c.retail_eur * 100), 0) / mockComponents.length).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
}
