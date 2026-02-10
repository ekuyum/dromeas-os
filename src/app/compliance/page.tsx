'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Anchor,
  Zap,
  Waves,
  ClipboardCheck,
  ExternalLink,
  Plus,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ComplianceItem {
  id: string
  type: 'technical_file' | 'declaration' | 'certificate' | 'test_record'
  model_id?: string
  boat_id?: string
  model_name?: string
  hull_number?: string
  document_name: string
  status: 'complete' | 'in_progress' | 'missing' | 'expired'
  expiry_date?: string
  last_updated: string
  notified_body?: string
  certificate_number?: string
}

interface ISOStandard {
  id: string
  number: string
  title: string
  category: string
  applicable: boolean
  status: 'compliant' | 'pending' | 'non_compliant' | 'not_applicable'
  notes?: string
}

export default function ComplianceDashboard() {
  const [models, setModels] = useState<any[]>([])
  const [boats, setBoats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string>('all')

  // Compliance data - REAL Dromeas models: D28, D33, D38
  const [complianceItems] = useState<ComplianceItem[]>([
    // D28 Range
    {
      id: '1',
      type: 'technical_file',
      model_id: '1',
      model_name: 'D28 CC',
      document_name: 'D28 Center Console Technical File v1.2',
      status: 'complete',
      last_updated: '2025-08-15',
      notified_body: 'Bureau Veritas',
    },
    {
      id: '2',
      type: 'certificate',
      model_id: '1',
      model_name: 'D28 CC',
      document_name: 'Module B Type Examination Certificate',
      status: 'complete',
      certificate_number: 'BV-2025-D28CC-001',
      expiry_date: '2030-08-15',
      last_updated: '2025-08-15',
      notified_body: 'Bureau Veritas',
    },
    // D33 Range (from Soyaslan MOU - D33 WA 16)
    {
      id: '3',
      type: 'technical_file',
      model_id: '3',
      model_name: 'D33 CC',
      document_name: 'D33 Center Console Technical File v2.0',
      status: 'complete',
      last_updated: '2025-10-01',
      notified_body: 'Bureau Veritas',
    },
    {
      id: '4',
      type: 'certificate',
      model_id: '3',
      model_name: 'D33 CC',
      document_name: 'Module B Type Examination Certificate',
      status: 'complete',
      certificate_number: 'BV-2025-D33CC-001',
      expiry_date: '2030-10-01',
      last_updated: '2025-10-01',
      notified_body: 'Bureau Veritas',
    },
    // D38 Range (from Soyaslan MOU - D38 CC 003, 004, 005)
    {
      id: '5',
      type: 'technical_file',
      model_id: '5',
      model_name: 'D38 CC',
      document_name: 'D38 Center Console Technical File v1.0',
      status: 'in_progress',
      last_updated: '2026-01-20',
      notified_body: 'Bureau Veritas',
    },
    {
      id: '6',
      type: 'certificate',
      model_id: '5',
      model_name: 'D38 CC',
      document_name: 'Module B Type Examination',
      status: 'missing',
      last_updated: '2026-01-01',
    },
    {
      id: '7',
      type: 'test_record',
      model_id: '3',
      model_name: 'D33 CC',
      document_name: 'Stability Test Report ISO 12217',
      status: 'complete',
      last_updated: '2025-09-20',
    },
    {
      id: '8',
      type: 'declaration',
      boat_id: '1',
      hull_number: 'D33-WA-016',
      model_name: 'D33 WA',
      document_name: 'Declaration of Conformity',
      status: 'complete',
      last_updated: '2025-12-01',
    },
  ])

  const isoStandards: ISOStandard[] = [
    { id: '1', number: 'ISO 12217-1', title: 'Stability and buoyancy - Non-sailing boats >6m', category: 'Safety', applicable: true, status: 'compliant' },
    { id: '2', number: 'ISO 12217-2', title: 'Stability and buoyancy - Sailing boats >6m', category: 'Safety', applicable: false, status: 'not_applicable' },
    { id: '3', number: 'ISO 8665', title: 'Marine propulsion engines - Power measurements', category: 'Propulsion', applicable: true, status: 'compliant' },
    { id: '4', number: 'ISO 10240', title: 'Owner\'s manual', category: 'Documentation', applicable: true, status: 'compliant' },
    { id: '5', number: 'ISO 12216', title: 'Windows, portlights, hatches, deadlights', category: 'Structure', applicable: true, status: 'compliant' },
    { id: '6', number: 'ISO 15083', title: 'Bilge pumping systems', category: 'Systems', applicable: true, status: 'compliant' },
    { id: '7', number: 'ISO 10133', title: 'Electrical systems - DC installations', category: 'Electrical', applicable: true, status: 'compliant' },
    { id: '8', number: 'ISO 13297', title: 'Electrical systems - AC installations', category: 'Electrical', applicable: true, status: 'pending', notes: 'Awaiting shore power test' },
    { id: '9', number: 'ISO 11812', title: 'Watertight and quick-draining cockpits', category: 'Structure', applicable: true, status: 'compliant' },
    { id: '10', number: 'ISO 9094', title: 'Fire protection', category: 'Safety', applicable: true, status: 'compliant' },
    { id: '11', number: 'ISO 10087', title: 'Craft identification - Hull identification number', category: 'Identification', applicable: true, status: 'compliant' },
    { id: '12', number: 'ISO 14945', title: 'Builder\'s plate', category: 'Identification', applicable: true, status: 'compliant' },
    { id: '13', number: 'ISO 11592', title: 'Engine power determination', category: 'Propulsion', applicable: true, status: 'compliant' },
    { id: '14', number: 'ISO 8849', title: 'Electrically operated bilge pumps', category: 'Systems', applicable: true, status: 'compliant' },
    { id: '15', number: 'ISO 15584', title: 'Inboard petrol engines - Fuel systems', category: 'Propulsion', applicable: false, status: 'not_applicable', notes: 'Outboard only' },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [modelsRes, boatsRes] = await Promise.all([
      supabase.from('models').select('*'),
      supabase.from('boats').select('*, models(name)'),
    ])
    setModels(modelsRes.data || [])
    setBoats(boatsRes.data || [])
    setLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
      case 'compliant':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'missing':
      case 'non_compliant':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-orange-100 text-orange-800'
      case 'not_applicable':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'missing':
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Calculate compliance stats
  const technicalFiles = complianceItems.filter(i => i.type === 'technical_file')
  const declarations = complianceItems.filter(i => i.type === 'declaration')
  const certificates = complianceItems.filter(i => i.type === 'certificate')
  const testRecords = complianceItems.filter(i => i.type === 'test_record')

  const completeCount = complianceItems.filter(i => i.status === 'complete').length
  const missingCount = complianceItems.filter(i => i.status === 'missing').length
  const inProgressCount = complianceItems.filter(i => i.status === 'in_progress').length

  const applicableStandards = isoStandards.filter(s => s.applicable)
  const compliantStandards = applicableStandards.filter(s => s.status === 'compliant').length
  const compliancePercentage = Math.round((compliantStandards / applicableStandards.length) * 100)

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
            <Shield className="h-7 w-7 mr-3 text-dromeas-600" />
            CE Compliance Center
          </h1>
          <p className="text-sm text-gray-500">
            RCD 2013/53/EU · ISO Standards · Type Approval Documentation
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/compliance/technical-files" className="btn btn-outline">
            <FileText className="h-4 w-4 mr-2" /> Technical Files
          </Link>
          <Link href="/compliance/declarations" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" /> New Declaration
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {missingCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Compliance Action Required</h3>
              <p className="text-sm text-red-700 mt-1">
                {missingCount} document(s) missing. Boats cannot be legally sold in the EU without complete CE documentation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ISO Compliance</p>
              <p className="text-2xl font-bold text-gray-900">{compliancePercentage}%</p>
            </div>
            <div className={`p-3 rounded-lg ${compliancePercentage >= 90 ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <Shield className={`h-6 w-6 ${compliancePercentage >= 90 ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{compliantStandards}/{applicableStandards.length} standards met</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Technical Files</p>
              <p className="text-2xl font-bold text-gray-900">{technicalFiles.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{technicalFiles.filter(t => t.status === 'complete').length} complete</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Declarations</p>
              <p className="text-2xl font-bold text-gray-900">{declarations.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <FileCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">DoC issued per boat</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-100">
              <ClipboardCheck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Module B/C approvals</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Test Records</p>
              <p className="text-2xl font-bold text-gray-900">{testRecords.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-100">
              <Waves className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Stability, electrical, etc.</p>
        </div>
      </div>

      {/* RCD Module Information */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Anchor className="h-5 w-5 mr-2 text-dromeas-600" />
          RCD Conformity Assessment Route
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800">Module A (Internal Control)</h3>
            <p className="text-sm text-green-700 mt-1">Design Category C & D only</p>
            <p className="text-xs text-green-600 mt-2">Self-certification for smaller craft</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800">Module B + C (Type Examination)</h3>
            <p className="text-sm text-blue-700 mt-1">Design Category A & B</p>
            <p className="text-xs text-blue-600 mt-2">Notified body examines design → you conform production</p>
            <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">D28/D33/D38 Route</span>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-800">Module H (Full QA)</h3>
            <p className="text-sm text-purple-700 mt-1">All categories</p>
            <p className="text-xs text-purple-600 mt-2">Notified body approves entire QMS</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Compliance Status */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Model Compliance Status</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {['D28 CC', 'D33 CC', 'D38 CC'].map(model => {
              const modelItems = complianceItems.filter(i => i.model_name === model)
              const complete = modelItems.filter(i => i.status === 'complete').length
              const total = modelItems.length
              const hasModule_B = modelItems.some(i => i.type === 'certificate' && i.status === 'complete')
              const hasTechFile = modelItems.some(i => i.type === 'technical_file' && i.status === 'complete')

              return (
                <div key={model} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Anchor className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{model}</h3>
                        <p className="text-xs text-gray-500">{complete}/{total} documents complete</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasTechFile && hasModule_B ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> CE Ready
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className={`p-2 rounded text-center ${hasTechFile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Tech File
                    </div>
                    <div className={`p-2 rounded text-center ${hasModule_B ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Module B
                    </div>
                    <div className={`p-2 rounded text-center ${modelItems.some(i => i.type === 'test_record') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      Tests
                    </div>
                    <div className="p-2 rounded text-center bg-blue-100 text-blue-800">
                      {modelItems.filter(i => i.type === 'declaration').length} DoCs
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Compliance Documents</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {complianceItems.slice(0, 5).map(item => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  {item.type === 'technical_file' && <FileText className="h-5 w-5 text-blue-500 mr-3" />}
                  {item.type === 'declaration' && <FileCheck className="h-5 w-5 text-purple-500 mr-3" />}
                  {item.type === 'certificate' && <ClipboardCheck className="h-5 w-5 text-amber-500 mr-3" />}
                  {item.type === 'test_record' && <Waves className="h-5 w-5 text-cyan-500 mr-3" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.document_name}</p>
                    <p className="text-xs text-gray-500">
                      {item.model_name} {item.hull_number && `· ${item.hull_number}`}
                      {item.certificate_number && ` · ${item.certificate_number}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Download className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ISO Standards Checklist */}
      <div className="card">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">ISO Standards Compliance (All Models)</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span> Compliant
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> Pending
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 bg-gray-300 rounded-full mr-1"></span> N/A
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isoStandards.map(standard => (
                <tr key={standard.id} className={!standard.applicable ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{standard.number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{standard.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{standard.category}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(standard.status)}`}>
                      {getStatusIcon(standard.status)}
                      <span className="ml-1 capitalize">{standard.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{standard.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/compliance/technical-files" className="card p-4 hover:shadow-lg transition-shadow">
          <FileText className="h-8 w-8 text-blue-500 mb-2" />
          <h3 className="font-medium text-gray-900">Technical Files</h3>
          <p className="text-xs text-gray-500 mt-1">Manage type-specific documentation</p>
        </Link>
        <Link href="/compliance/declarations" className="card p-4 hover:shadow-lg transition-shadow">
          <FileCheck className="h-8 w-8 text-purple-500 mb-2" />
          <h3 className="font-medium text-gray-900">Declarations</h3>
          <p className="text-xs text-gray-500 mt-1">Generate DoC per boat</p>
        </Link>
        <Link href="/compliance/builders-plate" className="card p-4 hover:shadow-lg transition-shadow">
          <Anchor className="h-8 w-8 text-amber-500 mb-2" />
          <h3 className="font-medium text-gray-900">Builder's Plate</h3>
          <p className="text-xs text-gray-500 mt-1">HIN and plate generator</p>
        </Link>
        <Link href="/compliance/test-records" className="card p-4 hover:shadow-lg transition-shadow">
          <Waves className="h-8 w-8 text-cyan-500 mb-2" />
          <h3 className="font-medium text-gray-900">Test Records</h3>
          <p className="text-xs text-gray-500 mt-1">Stability, electrical, sea trials</p>
        </Link>
      </div>
    </div>
  )
}
