'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  Globe,
  MapPin,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Ship,
  Factory,
  DollarSign,
  FileText,
  Users,
  ArrowRight,
  Warehouse,
  Scale,
  XCircle,
} from 'lucide-react'

interface Entity {
  id: string
  name: string
  shortName: string
  country: string
  countryCode: string
  type: 'holding' | 'operating' | 'liquidating'
  role: string[]
  status: 'active' | 'pending' | 'liquidating'
  vatNumber?: string
  registrationNumber?: string
  bankAccount?: string
  notes?: string
}

interface Location {
  id: string
  name: string
  type: 'production' | 'warehouse' | 'office'
  country: string
  city: string
  entity_id?: string
  partner?: string
  status: 'active' | 'wind_down' | 'transfer_pending'
  assets: {
    boats: number
    molds: number
    components: number
    equipment: number
  }
  estimatedValue: number
  notes?: string
}

export default function EntitiesPage() {
  const entities: Entity[] = [
    {
      id: '1',
      name: 'Dromeas Yachts International Limited',
      shortName: 'DYI UK',
      country: 'United Kingdom',
      countryCode: 'GB',
      type: 'holding',
      role: ['Sales', 'Marketing', 'Brand', 'IP Holding'],
      status: 'active',
      registrationNumber: '12345678',
      notes: 'Primary sales and brand entity. All customer contracts through UK.',
    },
    {
      id: '2',
      name: 'Dromeas Yachts Sp. z o.o.',
      shortName: 'DY Poland',
      country: 'Poland',
      countryCode: 'PL',
      type: 'operating',
      role: ['Production', 'Purchasing', 'EU Sales', 'Delivery'],
      status: 'active',
      vatNumber: 'PL1234567890',
      notes: 'Main operational entity. Production hub. All EU deliveries.',
    },
    {
      id: '3',
      name: 'Dromeas Yatcilik A.S.',
      shortName: 'DY Turkey',
      country: 'Turkey',
      countryCode: 'TR',
      type: 'liquidating',
      role: ['Legacy Production'],
      status: 'liquidating',
      vatNumber: 'TR1234567890',
      notes: 'Liquidating. Assets transferring to Poland.',
    },
    {
      id: '4',
      name: 'DRM Havacılık A.S.',
      shortName: 'DRM Turkey',
      country: 'Turkey',
      countryCode: 'TR',
      type: 'liquidating',
      role: ['Legacy'],
      status: 'liquidating',
      notes: 'Liquidating. No active operations.',
    },
  ]

  const locations: Location[] = [
    {
      id: '1',
      name: 'Denizli Warehouse',
      type: 'warehouse',
      country: 'Turkey',
      city: 'Denizli',
      entity_id: '3',
      status: 'transfer_pending',
      assets: {
        boats: 0,
        molds: 2,
        components: 80,
        equipment: 15,
      },
      estimatedValue: 250000,
      notes: 'Transfer to Poland planned. Molds and equipment.',
    },
    {
      id: '2',
      name: 'Menderes Warehouse',
      type: 'warehouse',
      country: 'Turkey',
      city: 'Izmir (Menderes)',
      entity_id: '3',
      status: 'transfer_pending',
      assets: {
        boats: 1,
        molds: 0,
        components: 120,
        equipment: 8,
      },
      estimatedValue: 150000,
      notes: 'Stock and semi-finished goods. Transfer to Poland planned.',
    },
    {
      id: '4',
      name: 'Schneider & Dalecki Facility',
      type: 'production',
      country: 'Poland',
      city: 'Chojnice',
      entity_id: '2',
      partner: 'Schneider & Dalecki Sp. z o.o.',
      status: 'active',
      assets: {
        boats: 3,
        molds: 4,
        components: 200,
        equipment: 25,
      },
      estimatedValue: 850000,
      notes: 'Primary production facility. Settlement negotiation ongoing (~€450K owed). Stock, molds, semi-finished boats.',
    },
    {
      id: '5',
      name: 'Soyaslan Marine',
      type: 'production',
      country: 'Turkey',
      city: 'Istanbul',
      partner: 'Soyaslan Marine (Barter Agreement)',
      status: 'active',
      assets: {
        boats: 2,
        molds: 0,
        components: 150,
        equipment: 0,
      },
      estimatedValue: 180000,
      notes: 'Friendly relationship. Barter agreement. Building as capacity allows. Flexible arrangement.',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Active</span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending</span>
      case 'liquidating':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center"><XCircle className="h-3 w-3 mr-1" /> Liquidating</span>
      case 'wind_down':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center"><Clock className="h-3 w-3 mr-1" /> Wind Down</span>
      case 'transfer_pending':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center"><Truck className="h-3 w-3 mr-1" /> Transfer Pending</span>
      default:
        return null
    }
  }

  const getCountryFlag = (code: string) => {
    const flags: Record<string, string> = {
      'GB': '🇬🇧',
      'PL': '🇵🇱',
      'TR': '🇹🇷',
    }
    return flags[code] || '🏳️'
  }

  // Calculate totals
  const totalAssetValue = locations.reduce((sum, l) => sum + l.estimatedValue, 0)
  const totalBoats = locations.reduce((sum, l) => sum + l.assets.boats, 0)
  const totalMolds = locations.reduce((sum, l) => sum + l.assets.molds, 0)
  const turkeyAssets = locations.filter(l => l.country === 'Turkey').reduce((sum, l) => sum + l.estimatedValue, 0)
  const polandAssets = locations.filter(l => l.country === 'Poland').reduce((sum, l) => sum + l.estimatedValue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/command" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-7 w-7 mr-3 text-dromeas-600" />
              Corporate Structure
            </h1>
            <p className="text-sm text-gray-500">
              Legal entities, locations, and asset distribution
            </p>
          </div>
        </div>
      </div>

      {/* Alert: Turkey Liquidation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Turkey Liquidation In Progress</h3>
            <p className="text-sm text-amber-700 mt-1">
              2 Turkish entities being liquidated. €{(turkeyAssets / 1000).toFixed(0)}K in assets need to transfer to Poland.
              S&D settlement (~€450K) ongoing.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Asset Value</p>
          <p className="text-2xl font-bold text-gray-900">€{(totalAssetValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-1">Across all locations</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Boats in Inventory</p>
          <p className="text-2xl font-bold text-blue-600">{totalBoats}</p>
          <p className="text-xs text-gray-500 mt-1">All stages</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Molds</p>
          <p className="text-2xl font-bold text-purple-600">{totalMolds}</p>
          <p className="text-xs text-gray-500 mt-1">Critical assets</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Active Entities</p>
          <p className="text-2xl font-bold text-green-600">{entities.filter(e => e.status === 'active').length}</p>
          <p className="text-xs text-gray-500 mt-1">of {entities.length} total</p>
        </div>
      </div>

      {/* Operational Flow Diagram */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Operational Flow</h2>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="p-4 bg-blue-50 rounded-lg text-center border-2 border-blue-200">
            <p className="font-bold text-blue-800">🇬🇧 UK</p>
            <p className="text-xs text-blue-600">Sales · Marketing</p>
            <p className="text-xs text-blue-600">Brand · IP</p>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="p-4 bg-green-50 rounded-lg text-center border-2 border-green-200">
            <p className="font-bold text-green-800">🇵🇱 Poland</p>
            <p className="text-xs text-green-600">Production · Purchasing</p>
            <p className="text-xs text-green-600">EU Sales · Delivery</p>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="p-4 bg-purple-50 rounded-lg text-center border-2 border-purple-200">
            <p className="font-bold text-purple-800">🌍 Customers</p>
            <p className="text-xs text-purple-600">EU & Global</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="p-3 bg-red-50 rounded-lg text-center border border-red-200 opacity-60">
              <p className="font-bold text-red-600">🇹🇷 Turkey</p>
              <p className="text-xs text-red-500">Liquidating</p>
              <p className="text-xs text-red-500">→ Assets to Poland</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Entities */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Legal Entities</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {entities.map(entity => (
            <div key={entity.id} className={`p-4 ${entity.status === 'liquidating' ? 'bg-red-50/50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{getCountryFlag(entity.countryCode)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{entity.name}</h3>
                    <p className="text-sm text-gray-500">{entity.shortName} · {entity.country}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entity.role.map(role => (
                        <span key={role} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {role}
                        </span>
                      ))}
                    </div>
                    {entity.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">{entity.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(entity.status)}
                  {entity.vatNumber && (
                    <span className="text-xs text-gray-400">VAT: {entity.vatNumber}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locations & Assets */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Locations & Assets</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {locations.map(location => (
            <div key={location.id} className={`p-4 ${location.status === 'transfer_pending' ? 'bg-blue-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  {location.type === 'production' ? (
                    <Factory className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                  ) : (
                    <Warehouse className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-500">
                      {location.city}, {location.country}
                      {location.partner && <span className="text-gray-400"> · {location.partner}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(location.status)}
                  <span className="text-sm font-medium text-gray-900">€{(location.estimatedValue / 1000).toFixed(0)}K</span>
                </div>
              </div>

              {/* Asset breakdown */}
              <div className="grid grid-cols-4 gap-2 ml-8">
                <div className="p-2 bg-gray-50 rounded text-center">
                  <Ship className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{location.assets.boats}</p>
                  <p className="text-xs text-gray-500">Boats</p>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <Package className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{location.assets.molds}</p>
                  <p className="text-xs text-gray-500">Molds</p>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <Package className="h-4 w-4 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{location.assets.components}</p>
                  <p className="text-xs text-gray-500">Components</p>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <Factory className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-gray-900">{location.assets.equipment}</p>
                  <p className="text-xs text-gray-500">Equipment</p>
                </div>
              </div>

              {location.notes && (
                <p className="text-xs text-gray-500 mt-3 ml-8 p-2 bg-gray-50 rounded italic">{location.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Asset Distribution by Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Assets by Country</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🇵🇱 Poland</span>
                <span className="font-medium">€{(polandAssets / 1000).toFixed(0)}K ({Math.round(polandAssets / totalAssetValue * 100)}%)</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full">
                <div className="h-4 bg-green-500 rounded-full" style={{ width: `${polandAssets / totalAssetValue * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>🇹🇷 Turkey (Liquidating)</span>
                <span className="font-medium">€{(turkeyAssets / 1000).toFixed(0)}K ({Math.round(turkeyAssets / totalAssetValue * 100)}%)</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full">
                <div className="h-4 bg-red-400 rounded-full" style={{ width: `${turkeyAssets / totalAssetValue * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Transfer Checklist</h3>
          <div className="space-y-3">
            <div className="flex items-center p-2 bg-yellow-50 rounded">
              <Clock className="h-4 w-4 text-yellow-600 mr-3" />
              <span className="text-sm">Denizli molds → Poland</span>
            </div>
            <div className="flex items-center p-2 bg-yellow-50 rounded">
              <Clock className="h-4 w-4 text-yellow-600 mr-3" />
              <span className="text-sm">Menderes components → Poland</span>
            </div>
            <div className="flex items-center p-2 bg-red-50 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-3" />
              <span className="text-sm">S&D settlement - €450K</span>
            </div>
            <div className="flex items-center p-2 bg-blue-50 rounded">
              <Clock className="h-4 w-4 text-blue-600 mr-3" />
              <span className="text-sm">Istanbul production transition plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Decisions */}
      <div className="card p-6 bg-gradient-to-r from-gray-50 to-gray-100">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Scale className="h-5 w-5 mr-2 text-dromeas-600" />
          Pending Decisions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900">Istanbul Production Timeline</h4>
            <p className="text-sm text-gray-500 mt-1">When to complete transition from Soyaslan? Continue for 2026 orders or move sooner?</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900">S&D Settlement Terms</h4>
            <p className="text-sm text-gray-500 mt-1">Negotiate payment plan vs. lump sum? Asset recovery priority?</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900">Poland Facility</h4>
            <p className="text-sm text-gray-500 mt-1">Own facility vs. continue partnership? Capacity requirements?</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900">Turkey VAT Recovery</h4>
            <p className="text-sm text-gray-500 mt-1">~€300K pending. Timeline and process during liquidation?</p>
          </div>
        </div>
      </div>
    </div>
  )
}
