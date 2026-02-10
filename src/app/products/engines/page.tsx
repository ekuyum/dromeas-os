'use client'

import { useEffect, useState } from 'react'
import { Cog, Fuel, Gauge, DollarSign, Building2, Package } from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface Engine {
  id: string
  code: string
  brand: string
  model: string
  horsepower: number
  fuel_type: string
  base_cost_eur: number
  lead_time_days: number
  is_active: boolean
  suppliers: { name: string; code: string } | null
}

export default function EnginesPage() {
  const [engines, setEngines] = useState<Engine[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ brand: 'All', fuelType: 'All' })

  useEffect(() => {
    fetchEngines()
  }, [])

  const fetchEngines = async () => {
    const { data } = await supabase
      .from('engines')
      .select(`
        *,
        suppliers (name, code)
      `)
      .order('brand')
      .order('horsepower', { ascending: false }) as { data: Engine[] | null }

    if (data) setEngines(data)
    setLoading(false)
  }

  const brands = ['All', ...new Set(engines.map(e => e.brand))]
  const fuelTypes = ['All', ...new Set(engines.map(e => e.fuel_type))]

  const filteredEngines = engines.filter(e => {
    if (filter.brand !== 'All' && e.brand !== filter.brand) return false
    if (filter.fuelType !== 'All' && e.fuel_type !== filter.fuelType) return false
    return true
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading engines...</div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engines</h1>
          <p className="text-sm text-gray-500">{engines.length} engine options available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Brand:</span>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setFilter({...filter, brand: b})}
              className={`px-3 py-1.5 text-sm rounded-lg ${filter.brand === b ? 'bg-dromeas-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="w-px bg-gray-300 mx-2" />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Fuel:</span>
          {fuelTypes.map(f => (
            <button
              key={f}
              onClick={() => setFilter({...filter, fuelType: f})}
              className={`px-3 py-1.5 text-sm rounded-lg ${filter.fuelType === f ? 'bg-marine-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Engine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEngines.map(engine => (
          <div key={engine.id} className="card overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Cog className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{engine.brand}</h3>
                    <p className="text-sm text-gray-500">{engine.model}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{engine.code}</p>
                  </div>
                </div>
                <span className={`status-badge ${engine.is_active ? 'status-success' : 'status-neutral'}`}>
                  {engine.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex items-center text-sm">
                  <Gauge className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium">{engine.horsepower} HP</span>
                </div>
                <div className="flex items-center text-sm">
                  <Fuel className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="capitalize">{engine.fuel_type}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="font-medium text-dromeas-600">{formatCurrency(engine.base_cost_eur)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{engine.lead_time_days} days</span>
                </div>
              </div>

              {engine.suppliers && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{engine.suppliers.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredEngines.length === 0 && (
        <div className="card p-8 text-center text-gray-500">
          No engines match your filters
        </div>
      )}
    </div>
  )
}
