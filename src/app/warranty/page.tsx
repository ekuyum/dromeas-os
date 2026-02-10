'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ship,
  Wrench,
  DollarSign,
  Calendar,
  User,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
} from 'lucide-react'
import { supabase, formatCurrency, formatDate } from '@/lib/supabase'

interface WarrantyClaim {
  id: string
  claim_number: string
  hull_number: string
  model_name: string
  owner_name: string
  owner_contact: string
  claim_date: string
  description: string
  status: 'submitted' | 'under_review' | 'approved' | 'denied' | 'in_repair' | 'completed'
  estimated_cost: number
  actual_cost: number | null
  warranty_type: string
  warranty_end: string
  resolved_date: string | null
}

interface ServiceRecord {
  id: string
  hull_number: string
  model_name: string
  service_date: string
  service_type: string
  description: string
  parts_cost: number
  labor_cost: number
  total_cost: number
  technician: string
  next_service: string | null
}

interface WarrantyPolicy {
  id: string
  name: string
  duration_months: number
  coverage_type: string
  description: string
}

export default function WarrantyPage() {
  const [claims, setClaims] = useState<WarrantyClaim[]>([])
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [policies, setPolicies] = useState<WarrantyPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'claims' | 'service' | 'policies'>('claims')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [boatsRes] = await Promise.all([
      supabase.from('boats').select('id, hull_number, status, models(name)'),
    ])

    const boats = (boatsRes.data || []) as any[]

    // Sample warranty policies
    const samplePolicies: WarrantyPolicy[] = [
      { id: '1', name: 'Hull Structural', duration_months: 60, coverage_type: 'Parts & Labor', description: '5-year hull structural warranty against manufacturing defects' },
      { id: '2', name: 'Hull Gelcoat', duration_months: 24, coverage_type: 'Parts & Labor', description: '2-year gelcoat warranty against blistering and crazing' },
      { id: '3', name: 'Engine (Mercury)', duration_months: 36, coverage_type: 'Parts & Labor', description: '3-year Mercury factory warranty' },
      { id: '4', name: 'Electronics', duration_months: 24, coverage_type: 'Parts Only', description: '2-year electronics warranty' },
      { id: '5', name: 'Upholstery', duration_months: 12, coverage_type: 'Parts Only', description: '1-year upholstery warranty' },
    ]
    setPolicies(samplePolicies)

    // Sample warranty claims
    const claimDescriptions = [
      'Blistering on hull bottom near waterline',
      'Engine overheating - thermostat failure',
      'Garmin chartplotter display flickering',
      'Upholstery stitching separation on helm seat',
      'Windlass motor not responding',
    ]
    const statuses: WarrantyClaim['status'][] = ['submitted', 'under_review', 'approved', 'in_repair', 'completed', 'denied']

    const sampleClaims: WarrantyClaim[] = boats.filter(b => b.status === 'delivered').slice(0, 6).map((boat, idx) => ({
      id: `claim-${idx}`,
      claim_number: `WC-2026-${String(idx + 1).padStart(3, '0')}`,
      hull_number: boat.hull_number,
      model_name: boat.models?.name || 'Unknown',
      owner_name: ['Mediterranean Charters', 'Aegean Adventures', 'Blue Horizon Yachts', 'Costa Mare', 'Hellenic Marine', 'Poseidon Fleet'][idx],
      owner_contact: `owner${idx}@example.com`,
      claim_date: new Date(Date.now() - (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: claimDescriptions[idx % claimDescriptions.length],
      status: statuses[idx % statuses.length],
      estimated_cost: [850, 1200, 450, 320, 680][idx % 5],
      actual_cost: idx % 2 === 0 ? [780, 1350, 420, 290, 720][idx % 5] : null,
      warranty_type: ['Hull Gelcoat', 'Engine', 'Electronics', 'Upholstery', 'Hull Structural'][idx % 5],
      warranty_end: new Date(Date.now() + (12 + idx * 6) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      resolved_date: ['completed', 'denied'].includes(statuses[idx % statuses.length])
        ? new Date(Date.now() - idx * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
    }))
    setClaims(sampleClaims)

    // Sample service records
    const serviceTypes = ['Maintenance', 'Repair', 'Warranty', 'Upgrade', 'Annual Service']
    const serviceDescriptions = [
      'Engine oil change, impeller replacement, anodes inspection',
      'Replaced sterndrive seals - water intrusion detected',
      'Warranty repair: thermostat replacement',
      'Installed upgraded LED lighting package',
      'Full annual service - hull inspection, engine service, systems check',
    ]

    const sampleServices: ServiceRecord[] = boats.slice(0, 8).map((boat, idx) => ({
      id: `svc-${idx}`,
      hull_number: boat.hull_number,
      model_name: boat.models?.name || 'Unknown',
      service_date: new Date(Date.now() - (idx + 1) * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      service_type: serviceTypes[idx % serviceTypes.length],
      description: serviceDescriptions[idx % serviceDescriptions.length],
      parts_cost: [120, 450, 85, 680, 320][idx % 5],
      labor_cost: [180, 320, 120, 240, 450][idx % 5],
      total_cost: [300, 770, 205, 920, 770][idx % 5],
      technician: ['Yiannis K.', 'Nikos P.', 'Maria S.', 'Dimitris A.'][idx % 4],
      next_service: idx % 3 === 0 ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    }))
    setServices(sampleServices)

    setLoading(false)
  }

  const stats = {
    openClaims: claims.filter(c => !['completed', 'denied'].includes(c.status)).length,
    approvedPending: claims.filter(c => ['approved', 'in_repair'].includes(c.status)).length,
    totalCost: claims.filter(c => c.actual_cost).reduce((sum, c) => sum + (c.actual_cost || 0), 0),
    servicesThisMonth: services.filter(s => new Date(s.service_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
    serviceRevenue: services.reduce((sum, s) => sum + s.total_cost, 0),
  }

  const filteredClaims = claims.filter(c =>
    c.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.hull_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredServices = services.filter(s =>
    s.hull_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Warranty & Service</h1>
          <p className="text-sm text-gray-500">
            Manage warranty claims and service history
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims or hulls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-dromeas-500"
            />
          </div>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" /> New Claim
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Open Claims</p>
              <p className="text-3xl font-bold text-orange-800">{stats.openClaims}</p>
            </div>
            <Shield className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="card p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">In Repair</p>
              <p className="text-3xl font-bold text-blue-800">{stats.approvedPending}</p>
            </div>
            <Wrench className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Warranty Cost YTD</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Services (30d)</p>
              <p className="text-3xl font-bold text-green-800">{stats.servicesThisMonth}</p>
            </div>
            <Wrench className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Service Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.serviceRevenue)}</p>
            </div>
            <DollarSign className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('claims')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'claims' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Warranty Claims ({claims.length})
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'service' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Service History ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'policies' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Warranty Policies ({policies.length})
          </button>
        </nav>
      </div>

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {filteredClaims.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No warranty claims found</p>
            </div>
          ) : (
            filteredClaims.map(claim => (
              <div key={claim.id} className={`card p-4 border-l-4 ${
                claim.status === 'submitted' ? 'border-l-yellow-500' :
                claim.status === 'under_review' ? 'border-l-blue-500' :
                claim.status === 'approved' ? 'border-l-green-500' :
                claim.status === 'in_repair' ? 'border-l-purple-500' :
                claim.status === 'completed' ? 'border-l-green-500 bg-green-50/50' :
                'border-l-red-500 bg-red-50/50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-bold text-dromeas-600">{claim.claim_number}</span>
                      <span className="text-gray-500">·</span>
                      <span className="font-medium">{claim.hull_number}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-sm text-gray-600">{claim.model_name}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{claim.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {claim.owner_name}
                      </span>
                      <span className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        {claim.warranty_type}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Filed {formatDate(claim.claim_date)}
                      </span>
                      {claim.actual_cost && (
                        <span className="flex items-center text-green-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(claim.actual_cost)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`status-badge ${
                      claim.status === 'completed' ? 'status-success' :
                      claim.status === 'denied' ? 'status-danger' :
                      claim.status === 'in_repair' ? 'bg-purple-100 text-purple-700' :
                      claim.status === 'approved' ? 'status-success' :
                      claim.status === 'under_review' ? 'status-info' : 'status-warning'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600" title="Contact owner">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-blue-600" title="View details">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Service Tab */}
      {activeTab === 'service' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hull #</th>
                <th>Model</th>
                <th>Type</th>
                <th>Description</th>
                <th>Technician</th>
                <th className="text-right">Cost</th>
                <th>Next Service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredServices.map(svc => (
                <tr key={svc.id}>
                  <td>{formatDate(svc.service_date)}</td>
                  <td className="font-medium text-dromeas-600">{svc.hull_number}</td>
                  <td>{svc.model_name}</td>
                  <td>
                    <span className={`status-badge ${
                      svc.service_type === 'Warranty' ? 'status-warning' :
                      svc.service_type === 'Repair' ? 'status-danger' :
                      svc.service_type === 'Upgrade' ? 'status-info' : 'status-success'
                    }`}>
                      {svc.service_type}
                    </span>
                  </td>
                  <td className="max-w-xs truncate" title={svc.description}>{svc.description}</td>
                  <td>{svc.technician}</td>
                  <td className="text-right font-medium">{formatCurrency(svc.total_cost)}</td>
                  <td>
                    {svc.next_service ? (
                      <span className="flex items-center text-sm text-orange-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(svc.next_service)}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map(policy => (
            <div key={policy.id} className="card">
              <div className="card-header bg-gray-50 flex items-center">
                <Shield className="h-5 w-5 text-dromeas-600 mr-2" />
                <h3 className="font-semibold">{policy.name}</h3>
              </div>
              <div className="card-body">
                <p className="text-sm text-gray-600 mb-4">{policy.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{policy.duration_months} months</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-medium">{policy.coverage_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/quality" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <FileText className="h-4 w-4 mr-1" /> Quality Control →
        </Link>
        <Link href="/production/boats" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Ship className="h-4 w-4 mr-1" /> Boat Registry →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" /> AI Analysis →
        </Link>
      </div>
    </div>
  )
}
