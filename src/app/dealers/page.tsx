'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Ship,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  ExternalLink,
  Users,
  DollarSign,
  Star,
  RefreshCw,
  Eye,
  Send,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Dealer {
  id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  website?: string
  country: string
  region: string
  status: 'active' | 'pending' | 'inactive' | 'prospect'
  tier: 'platinum' | 'gold' | 'silver' | 'bronze'
  boats_sold_ytd: number
  boats_sold_total: number
  active_orders: number
  pending_commission: number
  territories: string[]
  contract_expiry?: string
  onboarded_date?: string
  notes?: string
  performance_score: number
}

export default function DealerPortal() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null)

  // Sample dealers
  const sampleDealers: Dealer[] = [
    {
      id: '1',
      company_name: 'Nautical Dreams GmbH',
      contact_name: 'Klaus Weber',
      email: 'klaus@nauticaldreams.de',
      phone: '+49 40 1234567',
      website: 'nauticaldreams.de',
      country: 'Germany',
      region: 'Northern Europe',
      status: 'active',
      tier: 'gold',
      boats_sold_ytd: 3,
      boats_sold_total: 8,
      active_orders: 2,
      pending_commission: 15000,
      territories: ['Germany', 'Austria', 'Switzerland'],
      contract_expiry: '2027-12-31',
      onboarded_date: '2024-03-15',
      performance_score: 92,
    },
    {
      id: '2',
      company_name: 'Mediterranean Yachts S.r.l.',
      contact_name: 'Marco Rossi',
      email: 'marco@medyachts.it',
      phone: '+39 081 7654321',
      website: 'medyachts.it',
      country: 'Italy',
      region: 'Southern Europe',
      status: 'active',
      tier: 'platinum',
      boats_sold_ytd: 5,
      boats_sold_total: 12,
      active_orders: 3,
      pending_commission: 28000,
      territories: ['Italy', 'Malta'],
      contract_expiry: '2027-06-30',
      onboarded_date: '2023-09-01',
      performance_score: 98,
    },
    {
      id: '3',
      company_name: 'Nordic Marine AB',
      contact_name: 'Erik Lindqvist',
      email: 'erik@nordicmarine.se',
      phone: '+46 8 9876543',
      website: 'nordicmarine.se',
      country: 'Sweden',
      region: 'Northern Europe',
      status: 'pending',
      tier: 'silver',
      boats_sold_ytd: 0,
      boats_sold_total: 0,
      active_orders: 1,
      pending_commission: 0,
      territories: ['Sweden', 'Norway', 'Finland'],
      contract_expiry: '2026-12-31',
      onboarded_date: '2026-01-15',
      performance_score: 0,
      notes: 'New dealer - first order in progress',
    },
    {
      id: '4',
      company_name: 'Adriatic Boats d.o.o.',
      contact_name: 'Luka Kovac',
      email: 'luka@adriaticboats.hr',
      phone: '+385 21 4567890',
      country: 'Croatia',
      region: 'Southern Europe',
      status: 'prospect',
      tier: 'bronze',
      boats_sold_ytd: 0,
      boats_sold_total: 0,
      active_orders: 0,
      pending_commission: 0,
      territories: ['Croatia', 'Slovenia'],
      performance_score: 0,
      notes: 'Interested in becoming dealer. Meeting scheduled for Feb.',
    },
    {
      id: '5',
      company_name: 'Blue Water Marine',
      contact_name: 'Pierre Dubois',
      email: 'pierre@bluewater.fr',
      phone: '+33 4 91234567',
      website: 'bluewater-marine.fr',
      country: 'France',
      region: 'Western Europe',
      status: 'inactive',
      tier: 'silver',
      boats_sold_ytd: 0,
      boats_sold_total: 2,
      active_orders: 0,
      pending_commission: 0,
      territories: ['France'],
      contract_expiry: '2025-06-30',
      onboarded_date: '2023-06-01',
      performance_score: 45,
      notes: 'Contract expired. Renewal pending.',
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setDealers(sampleDealers)
    setLoading(false)
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800'
      case 'gold': return 'bg-amber-100 text-amber-800'
      case 'silver': return 'bg-gray-200 text-gray-800'
      case 'bronze': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'prospect': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredDealers = dealers.filter(dealer => {
    const matchesStatus = selectedStatus === 'all' || dealer.status === selectedStatus
    const matchesSearch =
      dealer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer.country.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Metrics
  const metrics = {
    totalActive: dealers.filter(d => d.status === 'active').length,
    boatsSoldYTD: dealers.reduce((sum, d) => sum + d.boats_sold_ytd, 0),
    pendingCommissions: dealers.reduce((sum, d) => sum + d.pending_commission, 0),
    activeOrders: dealers.reduce((sum, d) => sum + d.active_orders, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-dromeas-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Store className="h-7 w-7 mr-3 text-dromeas-600" />
            Dealer Network
          </h1>
          <p className="text-sm text-gray-500">
            Manage dealer relationships, orders, and commissions
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline">
            <Send className="h-4 w-4 mr-2" /> Broadcast Update
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Dealer
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Dealers</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalActive}</p>
            </div>
            <Store className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Boats Sold YTD</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.boatsSoldYTD}</p>
            </div>
            <Ship className="h-8 w-8 text-dromeas-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeOrders}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Commissions</p>
              <p className="text-2xl font-bold text-gray-900">€{(metrics.pendingCommissions / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search dealers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'active', 'pending', 'prospect', 'inactive'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                selectedStatus === status
                  ? 'bg-dromeas-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Dealers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.map(dealer => (
          <div
            key={dealer.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedDealer(dealer)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{dealer.company_name}</h3>
                  <p className="text-sm text-gray-500">{dealer.contact_name}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(dealer.status)}`}>
                    {dealer.status}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getTierColor(dealer.tier)}`}>
                    {dealer.tier}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {dealer.country}
                {dealer.territories.length > 1 && ` +${dealer.territories.length - 1}`}
              </div>

              {/* Performance */}
              {dealer.status === 'active' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Performance</span>
                    <span>{dealer.performance_score}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        dealer.performance_score >= 80 ? 'bg-green-500' :
                        dealer.performance_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dealer.performance_score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center border-t pt-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">{dealer.boats_sold_ytd}</p>
                  <p className="text-xs text-gray-500">YTD Sales</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{dealer.active_orders}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">€{(dealer.pending_commission / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-500">Commission</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Territory Map Placeholder */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Dealer Coverage Map</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Globe className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Interactive territory map</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Dealer Detail Sidebar */}
      {selectedDealer && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setSelectedDealer(null)}>
          <div
            className="bg-white w-full max-w-lg h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedDealer.company_name}</h2>
                  <p className="text-gray-500">{selectedDealer.contact_name}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedDealer.status)}`}>
                    {selectedDealer.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTierColor(selectedDealer.tier)}`}>
                    {selectedDealer.tier} tier
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <a href={`mailto:${selectedDealer.email}`} className="text-dromeas-600 hover:underline">
                      {selectedDealer.email}
                    </a>
                  </p>
                  {selectedDealer.phone && (
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      {selectedDealer.phone}
                    </p>
                  )}
                  {selectedDealer.website && (
                    <p className="flex items-center">
                      <Globe className="h-4 w-4 mr-3 text-gray-400" />
                      <a href={`https://${selectedDealer.website}`} target="_blank" className="text-dromeas-600 hover:underline">
                        {selectedDealer.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Territories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Territories</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDealer.territories.map(territory => (
                    <span key={territory} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {territory}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedDealer.boats_sold_ytd}</p>
                    <p className="text-xs text-gray-500">Boats Sold YTD</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900">{selectedDealer.boats_sold_total}</p>
                    <p className="text-xs text-gray-500">Total All Time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedDealer.active_orders}</p>
                    <p className="text-xs text-gray-500">Active Orders</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-600">€{selectedDealer.pending_commission.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Pending Commission</p>
                  </div>
                </div>
              </div>

              {/* Contract */}
              {selectedDealer.contract_expiry && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contract</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-500">Onboarded:</span> {selectedDealer.onboarded_date}</p>
                    <p><span className="text-gray-500">Expires:</span> {selectedDealer.contract_expiry}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedDealer.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedDealer.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t space-y-3">
                <Link
                  href={`/sales/orders?dealer=${selectedDealer.id}`}
                  className="btn btn-primary w-full justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" /> View Orders
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-outline justify-center">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </button>
                  <button className="btn btn-outline justify-center">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
