'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Ship,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Flag,
} from 'lucide-react'
import { formatCurrency } from '@/lib/supabase'

// ========================================
// ASSET DATA - FROM BLUEPRINT V3
// ========================================

interface Asset {
  id: string
  type: 'boat' | 'mold' | 'financial'
  name: string
  model: string
  status: string
  location: string
  valueMin: number
  valueMax: number
  action: string
  priority: 'critical' | 'high' | 'medium' | 'low' | 'opportunity'
  notes?: string
}

const ASSETS: Asset[] = [
  {
    id: 'D33-WA-0017',
    type: 'boat',
    name: 'D33 WA',
    model: 'D33 WA',
    status: 'INCOMPLETE - needs finishing',
    location: 'Turkey (Soyaslan)',
    valueMin: 150000,
    valueMax: 180000,
    action: 'Include in Soyaslan barter OR sell as-is',
    priority: 'high',
  },
  {
    id: 'D33-SUV-0018',
    type: 'boat',
    name: 'D33 SUV',
    model: 'D33 SUV',
    status: 'Complete',
    location: 'Greece (Blue Eternal)',
    valueMin: 200000,
    valueMax: 240000,
    action: 'Buy back, resell',
    priority: 'high',
  },
  {
    id: 'D28-WA-0089',
    type: 'boat',
    name: 'D28 WA',
    model: 'D28 WA',
    status: '90% complete',
    location: 'Poland (S&D)',
    valueMin: 120000,
    valueMax: 150000,
    action: 'Finish at S&D, sell immediately',
    priority: 'high',
  },
  {
    id: 'D33-SUV-JP1',
    type: 'boat',
    name: 'D33 SUV (Japan 1)',
    model: 'D33 SUV',
    status: '~80% complete',
    location: 'Poland (S&D)',
    valueMin: 180000,
    valueMax: 200000,
    action: 'Japanese decision: deliver or refund',
    priority: 'medium',
  },
  {
    id: 'D33-SUV-JP2',
    type: 'boat',
    name: 'D33 SUV (Japan 2)',
    model: 'D33 SUV',
    status: '~80% complete',
    location: 'Poland (S&D)',
    valueMin: 180000,
    valueMax: 200000,
    action: 'Japanese decision: deliver or refund',
    priority: 'medium',
  },
  {
    id: 'D28-SUV-JP1',
    type: 'boat',
    name: 'D28 SUV (Japan)',
    model: 'D28 SUV',
    status: '~80% complete',
    location: 'Poland (S&D)',
    valueMin: 130000,
    valueMax: 150000,
    action: 'Japanese decision: deliver or refund',
    priority: 'medium',
  },
  {
    id: 'D38-CC-004',
    type: 'boat',
    name: 'D38 CC',
    model: 'D38 CC',
    status: 'Barter deal',
    location: 'Turkey (Soyaslan)',
    valueMin: 150000,
    valueMax: 180000,
    action: 'Part of 3x D38 barter',
    priority: 'low',
  },
  {
    id: 'D38-CC-005',
    type: 'boat',
    name: 'D38 CC',
    model: 'D38 CC',
    status: 'Barter deal',
    location: 'Turkey (Soyaslan)',
    valueMin: 150000,
    valueMax: 180000,
    action: 'Part of 3x D38 barter',
    priority: 'low',
  },
  {
    id: 'D38-CC-006',
    type: 'boat',
    name: 'D38 CC',
    model: 'D38 CC',
    status: 'Barter deal',
    location: 'Turkey (Soyaslan)',
    valueMin: 150000,
    valueMax: 180000,
    action: 'Part of 3x D38 barter',
    priority: 'low',
  },
  {
    id: 'D44-MOLDS',
    type: 'mold',
    name: '44ft Molds',
    model: 'D44/D48',
    status: 'Owned in Turkey',
    location: 'Turkey',
    valueMin: 100000,
    valueMax: 200000,
    action: 'Design new boat around it, build/sell',
    priority: 'opportunity',
    notes: 'Can become D48 flagship at €400-500K',
  },
  {
    id: 'MOLDS-ALL',
    type: 'mold',
    name: 'D28/D33/D38 Molds',
    model: 'Multiple',
    status: 'Owned, held at S&D',
    location: 'Poland (S&D)',
    valueMin: 300000,
    valueMax: 500000,
    action: 'Pay debt to retrieve',
    priority: 'critical',
    notes: 'Cannot produce without these',
  },
  {
    id: 'VAT-RECOVERY',
    type: 'financial',
    name: 'VAT Refund',
    model: '-',
    status: 'Pending',
    location: 'Poland',
    valueMin: 80000,
    valueMax: 80000,
    action: 'New accountant needed',
    priority: 'high',
  },
]

interface Liability {
  id: string
  type: 'debt' | 'refund' | 'customer'
  party: string
  description: string
  amountMin?: number
  amountMax?: number
  amountTBD: boolean
  status: string
  action: string
  priority: 'critical' | 'high' | 'medium' | 'low'
}

const LIABILITIES: Liability[] = [
  {
    id: 'LIA-SD',
    type: 'debt',
    party: 'Schneider & Dalecki (S&D)',
    description: 'Debt for mold release',
    amountTBD: true,
    status: 'AUDIT NEEDED',
    action: 'Negotiate installments',
    priority: 'critical',
  },
  {
    id: 'LIA-SUPPLIERS',
    type: 'debt',
    party: 'Various Suppliers',
    description: 'Outstanding invoices',
    amountTBD: true,
    status: 'LIST NEEDED',
    action: 'Case by case',
    priority: 'high',
  },
  {
    id: 'LIA-BLUE',
    type: 'refund',
    party: 'Blue Eternal Yachting (Greece)',
    description: 'Dealer settlement',
    amountTBD: true,
    status: 'Parting ways',
    action: 'Buy back D33 SUV 0018',
    priority: 'high',
  },
  {
    id: 'LIA-MALTA',
    type: 'refund',
    party: 'George (Malta)',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Installments possible',
    action: 'Negotiate 3-6 month plan',
    priority: 'medium',
  },
  {
    id: 'LIA-IBIZA',
    type: 'refund',
    party: 'Ibiza Dealer',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Former dealer',
    action: 'Return deposit',
    priority: 'medium',
  },
  {
    id: 'LIA-BAXTER',
    type: 'refund',
    party: 'Baxter (Mallorca)',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Former dealer',
    action: 'Return deposit',
    priority: 'medium',
  },
  {
    id: 'LIA-FINLAND',
    type: 'refund',
    party: 'Finland Dealer',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Former dealer',
    action: 'Return deposit',
    priority: 'medium',
  },
  {
    id: 'LIA-MIAMI',
    type: 'refund',
    party: 'Miami Dealer',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Former dealer',
    action: 'Return deposit',
    priority: 'medium',
  },
  {
    id: 'LIA-NEUS',
    type: 'refund',
    party: 'North East US Dealer',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Former dealer',
    action: 'Return deposit',
    priority: 'medium',
  },
  {
    id: 'LIA-KOREA',
    type: 'refund',
    party: 'Korea Dealer',
    description: 'Deposit return',
    amountTBD: true,
    status: 'Former dealer',
    action: 'Return deposit',
    priority: 'medium',
  },
  {
    id: 'LIA-ARKUN',
    type: 'customer',
    party: 'Arkun Bey',
    description: 'Pricing too low (2022 list)',
    amountTBD: true,
    status: 'Renegotiate or loss',
    action: 'Discuss adjustment',
    priority: 'high',
  },
  {
    id: 'LIA-ADNAN',
    type: 'customer',
    party: 'Adnan Saruhan',
    description: 'TBD',
    amountTBD: true,
    status: 'Active',
    action: 'Review status',
    priority: 'medium',
  },
  {
    id: 'LIA-MARCO',
    type: 'customer',
    party: 'Marco - Maria (Sweden)',
    description: 'Either refund or deliver',
    amountTBD: true,
    status: 'Decision needed',
    action: 'Prefer deliver',
    priority: 'high',
  },
]

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const totalAssetsMin = ASSETS.reduce((sum, a) => sum + a.valueMin, 0)
  const totalAssetsMax = ASSETS.reduce((sum, a) => sum + a.valueMax, 0)
  const boatAssets = ASSETS.filter(a => a.type === 'boat')
  const moldAssets = ASSETS.filter(a => a.type === 'mold')
  const liabilitiesWithAmounts = LIABILITIES.filter(l => !l.amountTBD && l.amountMin)

  const filteredAssets = filterPriority === 'all'
    ? ASSETS
    : ASSETS.filter(a => a.priority === filterPriority)

  const filteredLiabilities = filterPriority === 'all'
    ? LIABILITIES
    : LIABILITIES.filter(l => l.priority === filterPriority)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets & Liabilities</h1>
          <p className="text-sm text-gray-500">
            Track what you own and what you owe • From Blueprint V3
          </p>
        </div>
        <Link href="/command" className="btn btn-outline">
          <ArrowRight className="h-4 w-4 mr-2" /> Command Center
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Total Asset Value</p>
              <p className="text-xl font-bold text-green-800">
                {formatCurrency(totalAssetsMin)} - {formatCurrency(totalAssetsMax)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Boats</p>
              <p className="text-2xl font-bold text-gray-900">{boatAssets.length}</p>
            </div>
            <Ship className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Molds</p>
              <p className="text-2xl font-bold text-gray-900">{moldAssets.length}</p>
            </div>
            <Package className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Liabilities</p>
              <p className="text-2xl font-bold text-red-800">{LIABILITIES.length}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <p className="text-xs text-red-600 mt-1">Most amounts TBD - audit needed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assets' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          >
            Assets ({ASSETS.length})
          </button>
          <button
            onClick={() => setActiveTab('liabilities')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'liabilities' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500'
            }`}
          >
            Liabilities ({LIABILITIES.length})
            <AlertTriangle className="h-4 w-4 ml-1" />
          </button>
        </nav>
      </div>

      {/* Filter */}
      <div className="flex space-x-2">
        {['all', 'critical', 'high', 'medium', 'low', 'opportunity'].map(priority => (
          <button
            key={priority}
            onClick={() => setFilterPriority(priority)}
            className={`px-3 py-1 text-sm rounded-full capitalize ${
              filterPriority === priority
                ? priority === 'critical' ? 'bg-red-600 text-white' :
                  priority === 'high' ? 'bg-orange-600 text-white' :
                  priority === 'opportunity' ? 'bg-purple-600 text-white' :
                  'bg-dromeas-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {priority}
          </button>
        ))}
      </div>

      {/* Assets Table */}
      {activeTab === 'assets' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Asset ID</th>
                <th>Model</th>
                <th>Status</th>
                <th>Location</th>
                <th className="text-right">Value Range</th>
                <th>Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className={
                  asset.priority === 'critical' ? 'bg-red-50' :
                  asset.priority === 'opportunity' ? 'bg-purple-50' : ''
                }>
                  <td>
                    <span className={`status-badge ${
                      asset.priority === 'critical' ? 'status-danger' :
                      asset.priority === 'high' ? 'status-warning' :
                      asset.priority === 'opportunity' ? 'bg-purple-100 text-purple-700' :
                      'status-info'
                    }`}>
                      {asset.priority}
                    </span>
                  </td>
                  <td className="font-medium text-dromeas-600">{asset.id}</td>
                  <td>
                    <div className="flex items-center">
                      {asset.type === 'boat' && <Ship className="h-4 w-4 mr-1 text-blue-500" />}
                      {asset.type === 'mold' && <Package className="h-4 w-4 mr-1 text-purple-500" />}
                      {asset.type === 'financial' && <DollarSign className="h-4 w-4 mr-1 text-green-500" />}
                      {asset.model}
                    </div>
                  </td>
                  <td>
                    <span className={`text-sm ${
                      asset.status.includes('Complete') ? 'text-green-600' :
                      asset.status.includes('INCOMPLETE') ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {asset.location}
                    </div>
                  </td>
                  <td className="text-right font-medium">
                    {formatCurrency(asset.valueMin)} - {formatCurrency(asset.valueMax)}
                  </td>
                  <td className="text-sm text-gray-700 max-w-xs">
                    {asset.action}
                    {asset.notes && (
                      <span className="block text-xs text-purple-600 mt-1">{asset.notes}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Liabilities Table */}
      {activeTab === 'liabilities' && (
        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="card p-4 bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <p className="font-semibold text-yellow-800">Liability Audit Needed</p>
                <p className="text-sm text-yellow-700">
                  Most amounts are TBD. Complete a full liability audit within 7 days.
                </p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Type</th>
                  <th>Party</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLiabilities.map(lia => (
                  <tr key={lia.id} className={
                    lia.priority === 'critical' ? 'bg-red-50' : ''
                  }>
                    <td>
                      <span className={`status-badge ${
                        lia.priority === 'critical' ? 'status-danger' :
                        lia.priority === 'high' ? 'status-warning' : 'status-info'
                      }`}>
                        {lia.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs px-2 py-1 rounded ${
                        lia.type === 'debt' ? 'bg-red-100 text-red-700' :
                        lia.type === 'refund' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {lia.type}
                      </span>
                    </td>
                    <td className="font-medium text-gray-900">{lia.party}</td>
                    <td className="text-sm text-gray-600">{lia.description}</td>
                    <td>
                      <span className={`text-sm ${
                        lia.status.includes('NEEDED') ? 'text-red-600 font-medium' : 'text-gray-600'
                      }`}>
                        {lia.status}
                      </span>
                    </td>
                    <td className="text-sm text-gray-700">{lia.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/finance/cash-flow" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <DollarSign className="h-4 w-4 mr-1" /> Cash Flow →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" /> Ask AI about Assets →
        </Link>
      </div>
    </div>
  )
}
