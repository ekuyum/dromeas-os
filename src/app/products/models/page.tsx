'use client'

import { useState } from 'react'
import { Ship, Plus, Edit, Eye, MoreVertical } from 'lucide-react'

// Mock data for demonstration
const mockModels = [
  {
    id: '1',
    code: 'D28_CC',
    name: 'Dromeas 28 Center Console',
    range: 'D28',
    length_m: 8.5,
    beam_m: 2.65,
    base_price_eur: 89000,
    is_active: true,
    orders_count: 12,
  },
  {
    id: '2',
    code: 'D28_SUV',
    name: 'Dromeas 28 SUV',
    range: 'D28',
    length_m: 8.5,
    beam_m: 2.65,
    base_price_eur: 95000,
    is_active: true,
    orders_count: 8,
  },
  {
    id: '3',
    code: 'D33_CC',
    name: 'Dromeas 33 Center Console',
    range: 'D33',
    length_m: 10.0,
    beam_m: 3.20,
    base_price_eur: 145000,
    is_active: true,
    orders_count: 15,
  },
  {
    id: '4',
    code: 'D33_SUV',
    name: 'Dromeas 33 SUV',
    range: 'D33',
    length_m: 10.0,
    beam_m: 3.20,
    base_price_eur: 155000,
    is_active: true,
    orders_count: 10,
  },
  {
    id: '5',
    code: 'D38_CC',
    name: 'Dromeas 38 Center Console',
    range: 'D38',
    length_m: 11.5,
    beam_m: 3.60,
    base_price_eur: 220000,
    is_active: true,
    orders_count: 5,
  },
  {
    id: '6',
    code: 'D38_SUV',
    name: 'Dromeas 38 SUV',
    range: 'D38',
    length_m: 11.5,
    beam_m: 3.60,
    base_price_eur: 235000,
    is_active: true,
    orders_count: 3,
  },
]

export default function ModelsPage() {
  const [selectedRange, setSelectedRange] = useState<string>('all')
  const [showNewModal, setShowNewModal] = useState(false)

  const ranges = ['all', 'D28', 'D33', 'D38']
  const filteredModels = selectedRange === 'all'
    ? mockModels
    : mockModels.filter(m => m.range === selectedRange)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Boat Models</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500">Filter by range:</span>
        <div className="flex space-x-2">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedRange === range
                  ? 'bg-dromeas-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Models' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div key={model.id} className="card overflow-hidden">
            {/* Image placeholder */}
            <div className="h-40 bg-gradient-to-br from-dromeas-100 to-marine-100 flex items-center justify-center">
              <Ship className="h-16 w-16 text-dromeas-400" />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-500">{model.code}</p>
                </div>
                <span className={`status-badge ${model.is_active ? 'status-success' : 'status-neutral'}`}>
                  {model.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Specs */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500">Length</p>
                  <p className="text-sm font-medium">{model.length_m}m</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500">Beam</p>
                  <p className="text-sm font-medium">{model.beam_m}m</p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="text-sm font-medium">{model.orders_count}</p>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Base Price</p>
                  <p className="text-lg font-bold text-dromeas-600">{formatCurrency(model.base_price_eur)}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="metric-card">
          <p className="metric-label">Total Models</p>
          <p className="metric-value">{mockModels.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Active Models</p>
          <p className="metric-value">{mockModels.filter(m => m.is_active).length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Orders</p>
          <p className="metric-value">{mockModels.reduce((sum, m) => sum + m.orders_count, 0)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Avg Base Price</p>
          <p className="metric-value">
            {formatCurrency(mockModels.reduce((sum, m) => sum + m.base_price_eur, 0) / mockModels.length)}
          </p>
        </div>
      </div>
    </div>
  )
}
