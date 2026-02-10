'use client'

import { useState } from 'react'
import {
  FolderArchive, Ship, FileText, CheckCircle2, AlertCircle,
  Clock, Upload, Download, Eye, Plus, Search, Filter,
  ChevronRight, FileCheck, Calculator, Zap, Shield, Anchor,
  FileWarning, Lock, Unlock, ExternalLink
} from 'lucide-react'

interface TechnicalFileDocument {
  id: string
  name: string
  category: string
  isoRef?: string
  status: 'draft' | 'review' | 'approved' | 'expired'
  version: string
  uploadedAt: string
  approvedBy?: string
  expiresAt?: string
  required: boolean
  fileUrl?: string
}

interface TechnicalFile {
  id: string
  boatModel: string
  hin?: string
  designCategory: 'A' | 'B' | 'C' | 'D'
  status: 'incomplete' | 'under_review' | 'approved' | 'locked'
  completeness: number
  documents: TechnicalFileDocument[]
  createdAt: string
  approvedAt?: string
  notifiedBody?: string
}

// RCD 2013/53/EU Required Documents
const REQUIRED_DOCUMENTS = [
  { category: 'General', name: 'Technical File Cover Sheet', isoRef: 'RCD Annex VII', required: true },
  { category: 'General', name: 'Declaration of Conformity (DoC)', isoRef: 'RCD Annex IV', required: true },
  { category: 'General', name: 'Risk Assessment', isoRef: 'RCD Annex I', required: true },
  { category: 'General', name: 'Owner\'s Manual', isoRef: 'ISO 10240', required: true },
  { category: 'Design', name: 'General Arrangement Drawing', isoRef: '-', required: true },
  { category: 'Design', name: 'Lines Plan', isoRef: '-', required: true },
  { category: 'Design', name: 'Structural Drawings', isoRef: 'ISO 12215', required: true },
  { category: 'Stability', name: 'Stability Calculation', isoRef: 'ISO 12217', required: true },
  { category: 'Stability', name: 'Stability Test Report', isoRef: 'ISO 12217', required: true },
  { category: 'Stability', name: 'Buoyancy Assessment', isoRef: 'ISO 12217', required: true },
  { category: 'Structure', name: 'Scantlings Calculation', isoRef: 'ISO 12215-5', required: true },
  { category: 'Structure', name: 'Material Certificates', isoRef: '-', required: true },
  { category: 'Electrical', name: 'Electrical System Diagram', isoRef: 'ISO 13297', required: true },
  { category: 'Electrical', name: 'Electrical Test Report', isoRef: 'ISO 13297', required: true },
  { category: 'Fuel', name: 'Fuel System Diagram', isoRef: 'ISO 10088', required: true },
  { category: 'Fuel', name: 'Fuel System Test Report', isoRef: 'ISO 10088', required: true },
  { category: 'Fire', name: 'Fire Protection Assessment', isoRef: 'ISO 9094', required: true },
  { category: 'Exhaust', name: 'Exhaust Emissions Cert (Engine)', isoRef: 'RCD Annex I.B', required: true },
  { category: 'Noise', name: 'Noise Emission Data', isoRef: 'ISO 14509', required: true },
  { category: 'Navigation', name: 'Navigation Lights Certificate', isoRef: 'ISO 16180', required: true },
]

export default function TechnicalFilesPage() {
  const [selectedFile, setSelectedFile] = useState<TechnicalFile | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Sample data - would come from Supabase
  const technicalFiles: TechnicalFile[] = [
    {
      id: 'tf-001',
      boatModel: 'D28 CC',
      designCategory: 'C',
      status: 'approved',
      completeness: 100,
      documents: REQUIRED_DOCUMENTS.map((doc, i) => ({
        id: `doc-${i}`,
        name: doc.name,
        category: doc.category,
        isoRef: doc.isoRef,
        status: 'approved',
        version: '1.0',
        uploadedAt: '2025-06-15',
        approvedBy: 'Notified Body #0123',
        required: doc.required,
      })),
      createdAt: '2025-01-10',
      approvedAt: '2025-06-20',
      notifiedBody: 'IMCI (0518)',
    },
    {
      id: 'tf-002',
      boatModel: 'D28 WA',
      designCategory: 'C',
      status: 'approved',
      completeness: 100,
      documents: REQUIRED_DOCUMENTS.map((doc, i) => ({
        id: `doc-${i}`,
        name: doc.name,
        category: doc.category,
        isoRef: doc.isoRef,
        status: 'approved',
        version: '1.0',
        uploadedAt: '2025-06-15',
        approvedBy: 'Notified Body #0123',
        required: doc.required,
      })),
      createdAt: '2025-01-12',
      approvedAt: '2025-06-20',
      notifiedBody: 'IMCI (0518)',
    },
    {
      id: 'tf-003',
      boatModel: 'D33 WA',
      designCategory: 'B',
      status: 'under_review',
      completeness: 85,
      documents: REQUIRED_DOCUMENTS.map((doc, i) => ({
        id: `doc-${i}`,
        name: doc.name,
        category: doc.category,
        isoRef: doc.isoRef,
        status: i < 17 ? 'approved' : 'review',
        version: '1.0',
        uploadedAt: '2025-11-01',
        required: doc.required,
      })),
      createdAt: '2025-08-01',
      notifiedBody: 'IMCI (0518)',
    },
    {
      id: 'tf-004',
      boatModel: 'D38 CC',
      designCategory: 'B',
      status: 'incomplete',
      completeness: 45,
      documents: REQUIRED_DOCUMENTS.map((doc, i) => ({
        id: `doc-${i}`,
        name: doc.name,
        category: doc.category,
        isoRef: doc.isoRef,
        status: i < 9 ? 'approved' : 'draft',
        version: '0.1',
        uploadedAt: i < 9 ? '2025-10-15' : '',
        required: doc.required,
      })),
      createdAt: '2025-09-01',
    },
  ]

  const filteredFiles = technicalFiles.filter(tf => {
    const matchesSearch = tf.boatModel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || tf.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: technicalFiles.length,
    approved: technicalFiles.filter(tf => tf.status === 'approved').length,
    underReview: technicalFiles.filter(tf => tf.status === 'under_review').length,
    incomplete: technicalFiles.filter(tf => tf.status === 'incomplete').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'locked':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</span>
      case 'under_review':
      case 'review':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center"><Clock className="h-3 w-3 mr-1" /> Under Review</span>
      case 'incomplete':
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center"><AlertCircle className="h-3 w-3 mr-1" /> Incomplete</span>
      case 'expired':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center"><FileWarning className="h-3 w-3 mr-1" /> Expired</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Stability': return <Anchor className="h-4 w-4" />
      case 'Electrical': return <Zap className="h-4 w-4" />
      case 'Structure': return <Shield className="h-4 w-4" />
      case 'Design': return <FileText className="h-4 w-4" />
      default: return <FileCheck className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FolderArchive className="h-7 w-7 mr-3 text-dromeas-600" />
            Technical Files
          </h1>
          <p className="text-sm text-gray-500">
            RCD 2013/53/EU Technical Documentation per Model
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" /> New Technical File
        </button>
      </div>

      {/* Alert for incomplete files */}
      {stats.incomplete > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Compliance Warning</p>
            <p className="text-sm text-red-700">
              {stats.incomplete} model(s) have incomplete Technical Files. Boats cannot be legally sold in EU until files are complete and approved.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Models</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Ship className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Approved</p>
              <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
            </div>
            <Lock className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Under Review</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.underReview}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Incomplete</p>
              <p className="text-2xl font-bold text-red-800">{stats.incomplete}</p>
            </div>
            <Unlock className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-dromeas-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-dromeas-500"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="under_review">Under Review</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File List */}
        <div className="lg:col-span-1 space-y-3">
          {filteredFiles.map(tf => (
            <div
              key={tf.id}
              onClick={() => setSelectedFile(tf)}
              className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedFile?.id === tf.id ? 'ring-2 ring-dromeas-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{tf.boatModel}</h3>
                  <p className="text-xs text-gray-500">Category {tf.designCategory}</p>
                </div>
                {getStatusBadge(tf.status)}
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Completeness</span>
                  <span>{tf.completeness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      tf.completeness === 100 ? 'bg-green-500' :
                      tf.completeness >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${tf.completeness}%` }}
                  />
                </div>
              </div>

              {tf.notifiedBody && (
                <p className="text-xs text-gray-500 mt-2">
                  NB: {tf.notifiedBody}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Document Detail */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="card">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selectedFile.boatModel} Technical File</h2>
                    <p className="text-sm text-gray-500">
                      Design Category {selectedFile.designCategory} • {selectedFile.documents.length} documents required
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn btn-outline">
                      <Download className="h-4 w-4 mr-2" /> Export ZIP
                    </button>
                    {selectedFile.status !== 'approved' && (
                      <button className="btn btn-primary">
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Categories */}
              <div className="p-4">
                {['General', 'Design', 'Stability', 'Structure', 'Electrical', 'Fuel', 'Fire', 'Exhaust', 'Noise', 'Navigation'].map(category => {
                  const categoryDocs = selectedFile.documents.filter(d => d.category === category)
                  if (categoryDocs.length === 0) return null

                  const approvedCount = categoryDocs.filter(d => d.status === 'approved').length

                  return (
                    <div key={category} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-700 flex items-center">
                          {getCategoryIcon(category)}
                          <span className="ml-2">{category}</span>
                        </h3>
                        <span className="text-xs text-gray-500">
                          {approvedCount}/{categoryDocs.length} approved
                        </span>
                      </div>
                      <div className="space-y-2">
                        {categoryDocs.map(doc => (
                          <div
                            key={doc.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              doc.status === 'approved' ? 'bg-green-50 border-green-200' :
                              doc.status === 'review' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <FileText className={`h-4 w-4 mr-3 ${
                                doc.status === 'approved' ? 'text-green-600' :
                                doc.status === 'review' ? 'text-yellow-600' : 'text-gray-400'
                              }`} />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                  {doc.isoRef !== '-' && <span className="mr-2">{doc.isoRef}</span>}
                                  {doc.uploadedAt && `v${doc.version} • ${doc.uploadedAt}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(doc.status)}
                              {doc.status === 'approved' && (
                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              {selectedFile.approvedAt && (
                <div className="p-4 border-t bg-green-50">
                  <div className="flex items-center text-green-800">
                    <Lock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Technical File Locked</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Approved by {selectedFile.notifiedBody} on {selectedFile.approvedAt}.
                    Changes require new revision.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center text-gray-400">
              <FolderArchive className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>Select a model to view Technical File details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
