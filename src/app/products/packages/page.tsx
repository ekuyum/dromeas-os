'use client'

import { useEffect, useState } from 'react'
import { Package, Layers, DollarSign } from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface OptionPackage {
  id: string
  code: string
  name: string
  description: string | null
  base_price_eur: number
  is_active: boolean
  models: { name: string } | null
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<OptionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState('all')

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('option_packages')
      .select(`
        id, code, name, description, base_price_eur, is_active,
        models (name)
      `)
      .order('name')

    if (data) setPackages(data as OptionPackage[])
    setLoading(false)
  }

  const models = ['all', ...new Set(packages.map(p => p.models?.name).filter(Boolean))]

  const filteredPackages = packages.filter(pkg => {
    if (selectedModel === 'all') return true
    return pkg.models?.name === selectedModel
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading packages...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Option Packages</h1>
          <p className="text-sm text-gray-500">{packages.length} packages available</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {models.map(model => (
          <button
            key={model || 'all'}
            onClick={() => setSelectedModel(model || 'all')}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              selectedModel === model
                ? 'bg-dromeas-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {model === 'all' ? 'All Models' : model}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map(pkg => (
          <div key={pkg.id} className="card overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-marine-100 rounded-lg">
                    <Package className="h-5 w-5 text-marine-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{pkg.code}</p>
                  </div>
                </div>
                <span className={`status-badge ${pkg.is_active ? 'status-success' : 'status-neutral'}`}>
                  {pkg.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {pkg.description && (
                <p className="mt-3 text-sm text-gray-600">{pkg.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between">
                {pkg.models?.name && (
                  <span className="status-badge status-info">{pkg.models.name}</span>
                )}
                <div className="flex items-center text-lg font-bold text-dromeas-600">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(pkg.base_price_eur)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
