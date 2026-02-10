'use client'

import { useState } from 'react'
import {
  GitBranch, Plus, Search, Filter, AlertTriangle, CheckCircle2,
  Clock, X, ChevronRight, Ship, Package, DollarSign, Users,
  FileText, Calendar, ArrowRight, History, Edit2, Eye
} from 'lucide-react'

interface ECO {
  id: string
  ecoNumber: string
  title: string
  description: string
  reason: 'quality' | 'cost_reduction' | 'supplier_change' | 'customer_request' | 'regulatory' | 'design_improvement'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'implemented' | 'closed'
  affectedModels: string[]
  affectedComponents: string[]
  affectedBoats: string[] // HINs of boats in production that need this change
  costImpact: number // Positive = cost increase, negative = savings
  effectivityType: 'immediate' | 'next_batch' | 'specific_date' | 'specific_serial'
  effectivityDate?: string
  effectivitySerial?: string
  requestedBy: string
  approvedBy?: string
  createdAt: string
  approvedAt?: string
  implementedAt?: string
}

const REASON_LABELS = {
  quality: 'Quality Issue',
  cost_reduction: 'Cost Reduction',
  supplier_change: 'Supplier Change',
  customer_request: 'Customer Request',
  regulatory: 'Regulatory',
  design_improvement: 'Design Improvement',
}

const REASON_COLORS = {
  quality: 'bg-red-100 text-red-800',
  cost_reduction: 'bg-green-100 text-green-800',
  supplier_change: 'bg-blue-100 text-blue-800',
  customer_request: 'bg-purple-100 text-purple-800',
  regulatory: 'bg-orange-100 text-orange-800',
  design_improvement: 'bg-indigo-100 text-indigo-800',
}

export default function ECOPage() {
  const [selectedECO, setSelectedECO] = useState<ECO | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewECOModal, setShowNewECOModal] = useState(false)

  // Sample data
  const ecos: ECO[] = [
    {
      id: 'eco-001',
      ecoNumber: 'ECO-2026-001',
      title: 'Upgrade Transom Reinforcement for 350hp+ Engines',
      description: 'Reinforce transom laminate schedule for engines exceeding 350hp. Add additional layers of biaxial and increase core thickness.',
      reason: 'design_improvement',
      priority: 'high',
      status: 'implemented',
      affectedModels: ['D28 CC', 'D28 WA'],
      affectedComponents: ['HULL-D28-TRANSOM', 'MAT-BIAX-1200', 'CORE-PVC-20'],
      affectedBoats: [],
      costImpact: 450,
      effectivityType: 'specific_serial',
      effectivitySerial: 'GR-DRM00015',
      requestedBy: 'Engineering',
      approvedBy: 'Efe Kuyumcu',
      createdAt: '2025-11-01',
      approvedAt: '2025-11-05',
      implementedAt: '2025-11-15',
    },
    {
      id: 'eco-002',
      ecoNumber: 'ECO-2026-002',
      title: 'Replace Hella Nav Lights with Aqua Signal',
      description: 'Supplier discontinuation - replace Hella navigation lights with equivalent Aqua Signal series 34.',
      reason: 'supplier_change',
      priority: 'medium',
      status: 'approved',
      affectedModels: ['D28 CC', 'D28 WA', 'D28 SUV', 'D33 WA', 'D33 SUV', 'D38 CC'],
      affectedComponents: ['ELEC-NAV-BOW', 'ELEC-NAV-STERN', 'ELEC-NAV-MAST'],
      affectedBoats: ['GR-DRM00018', 'GR-DRM00019'],
      costImpact: -85,
      effectivityType: 'immediate',
      requestedBy: 'Purchasing',
      approvedBy: 'Efe Kuyumcu',
      createdAt: '2026-01-15',
      approvedAt: '2026-01-20',
    },
    {
      id: 'eco-003',
      ecoNumber: 'ECO-2026-003',
      title: 'Add Drain Plug Safety Lanyard',
      description: 'Add captive lanyard to drain plug to prevent loss during winterization.',
      reason: 'quality',
      priority: 'low',
      status: 'pending_review',
      affectedModels: ['D28 CC', 'D28 WA', 'D28 SUV'],
      affectedComponents: ['HW-DRAIN-38'],
      affectedBoats: [],
      costImpact: 12,
      effectivityType: 'next_batch',
      requestedBy: 'Service',
      createdAt: '2026-02-01',
    },
    {
      id: 'eco-004',
      ecoNumber: 'ECO-2026-004',
      title: 'ISO 13297 Electrical Update',
      description: 'Update shore power inlet and circuit protection to meet ISO 13297:2025 revision.',
      reason: 'regulatory',
      priority: 'critical',
      status: 'draft',
      affectedModels: ['D33 WA', 'D33 SUV', 'D38 CC'],
      affectedComponents: ['ELEC-SHORE-30A', 'ELEC-BREAKER-MAIN'],
      affectedBoats: ['GR-DRM00020'],
      costImpact: 380,
      effectivityType: 'specific_date',
      effectivityDate: '2026-03-01',
      requestedBy: 'Compliance',
      createdAt: '2026-02-03',
    },
  ]

  const filteredECOs = ecos.filter(eco =>
    filterStatus === 'all' || eco.status === filterStatus
  )

  const stats = {
    total: ecos.length,
    pending: ecos.filter(e => e.status === 'pending_review').length,
    approved: ecos.filter(e => e.status === 'approved').length,
    implemented: ecos.filter(e => e.status === 'implemented').length,
    costImpact: ecos.filter(e => ['approved', 'implemented'].includes(e.status)).reduce((sum, e) => sum + e.costImpact, 0),
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draft</span>
      case 'pending_review':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending Review</span>
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center"><X className="h-3 w-3 mr-1" /> Rejected</span>
      case 'implemented':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Implemented</span>
      case 'closed':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Closed</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 text-xs rounded bg-red-600 text-white">CRITICAL</span>
      case 'high':
        return <span className="px-2 py-0.5 text-xs rounded bg-orange-500 text-white">HIGH</span>
      case 'medium':
        return <span className="px-2 py-0.5 text-xs rounded bg-yellow-500 text-white">MEDIUM</span>
      case 'low':
        return <span className="px-2 py-0.5 text-xs rounded bg-gray-400 text-white">LOW</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GitBranch className="h-7 w-7 mr-3 text-dromeas-600" />
            Engineering Change Orders
          </h1>
          <p className="text-sm text-gray-500">
            Track design changes, affected boats, and cost impacts
          </p>
        </div>
        <button onClick={() => setShowNewECOModal(true)} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" /> New ECO
        </button>
      </div>

      {/* Critical ECOs Alert */}
      {ecos.some(e => e.priority === 'critical' && !['implemented', 'closed', 'rejected'].includes(e.status)) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Critical ECO Pending</p>
            <p className="text-sm text-red-700">
              {ecos.filter(e => e.priority === 'critical' && !['implemented', 'closed', 'rejected'].includes(e.status)).length} critical engineering change(s) require immediate attention.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total ECOs</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-700">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="card p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">Approved</p>
          <p className="text-2xl font-bold text-blue-800">{stats.approved}</p>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <p className="text-sm text-green-700">Implemented</p>
          <p className="text-2xl font-bold text-green-800">{stats.implemented}</p>
        </div>
        <div className={`card p-4 ${stats.costImpact >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-sm text-gray-700">Net Cost Impact</p>
          <p className={`text-2xl font-bold ${stats.costImpact >= 0 ? 'text-red-800' : 'text-green-800'}`}>
            {stats.costImpact >= 0 ? '+' : ''}€{stats.costImpact.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-400" />
        {['all', 'draft', 'pending_review', 'approved', 'implemented'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterStatus === status ? 'bg-dromeas-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ECO List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredECOs.map(eco => (
            <div
              key={eco.id}
              onClick={() => setSelectedECO(eco)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedECO?.id === eco.id ? 'ring-2 ring-dromeas-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-mono text-gray-500">{eco.ecoNumber}</span>
                {getPriorityBadge(eco.priority)}
              </div>
              <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{eco.title}</h3>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-xs rounded-full ${REASON_COLORS[eco.reason]}`}>
                  {REASON_LABELS[eco.reason]}
                </span>
                {getStatusBadge(eco.status)}
              </div>
              {eco.affectedBoats.length > 0 && (
                <div className="mt-2 flex items-center text-xs text-orange-600">
                  <Ship className="h-3 w-3 mr-1" />
                  {eco.affectedBoats.length} boat(s) in production affected
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ECO Detail */}
        <div className="lg:col-span-2">
          {selectedECO ? (
            <div className="card">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">{selectedECO.ecoNumber}</span>
                      {getPriorityBadge(selectedECO.priority)}
                      {getStatusBadge(selectedECO.status)}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedECO.title}</h2>
                  </div>
                  {selectedECO.status === 'pending_review' && (
                    <div className="flex space-x-2">
                      <button className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50">
                        Reject
                      </button>
                      <button className="btn btn-primary">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-sm text-gray-600">{selectedECO.description}</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${REASON_COLORS[selectedECO.reason]}`}>
                      {REASON_LABELS[selectedECO.reason]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cost Impact</p>
                    <p className={`text-sm font-semibold ${selectedECO.costImpact >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedECO.costImpact >= 0 ? '+' : ''}€{selectedECO.costImpact.toLocaleString()}/boat
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Effectivity</p>
                    <p className="text-sm font-medium">
                      {selectedECO.effectivityType === 'immediate' && 'Immediate'}
                      {selectedECO.effectivityType === 'next_batch' && 'Next Production Batch'}
                      {selectedECO.effectivityType === 'specific_date' && `From ${selectedECO.effectivityDate}`}
                      {selectedECO.effectivityType === 'specific_serial' && `From ${selectedECO.effectivitySerial}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested By</p>
                    <p className="text-sm font-medium">{selectedECO.requestedBy}</p>
                  </div>
                </div>

                {/* Affected Models */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Ship className="h-4 w-4 mr-2" />
                    Affected Models ({selectedECO.affectedModels.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedECO.affectedModels.map(model => (
                      <span key={model} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">{model}</span>
                    ))}
                  </div>
                </div>

                {/* Affected Components */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Affected Components ({selectedECO.affectedComponents.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedECO.affectedComponents.map(comp => (
                      <span key={comp} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-mono">{comp}</span>
                    ))}
                  </div>
                </div>

                {/* Affected Boats in Production */}
                {selectedECO.affectedBoats.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-orange-800 mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Boats in Production Affected ({selectedECO.affectedBoats.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedECO.affectedBoats.map(hin => (
                        <span key={hin} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-mono">{hin}</span>
                      ))}
                    </div>
                    <p className="text-xs text-orange-700 mt-2">
                      These boats require retrofit or production hold until ECO is implemented.
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-24 text-gray-500">Created</div>
                      <div className="font-medium">{selectedECO.createdAt}</div>
                      <div className="ml-auto text-gray-500">{selectedECO.requestedBy}</div>
                    </div>
                    {selectedECO.approvedAt && (
                      <div className="flex items-center text-sm">
                        <div className="w-24 text-gray-500">Approved</div>
                        <div className="font-medium">{selectedECO.approvedAt}</div>
                        <div className="ml-auto text-gray-500">{selectedECO.approvedBy}</div>
                      </div>
                    )}
                    {selectedECO.implementedAt && (
                      <div className="flex items-center text-sm">
                        <div className="w-24 text-gray-500">Implemented</div>
                        <div className="font-medium text-green-600">{selectedECO.implementedAt}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-gray-400">
              <GitBranch className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select an ECO to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
