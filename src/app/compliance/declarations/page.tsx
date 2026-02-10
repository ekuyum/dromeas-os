'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileCheck,
  Plus,
  Download,
  Eye,
  Printer,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Copy,
  Anchor,
  Calendar,
  Building2,
  User,
  MapPin,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Declaration {
  id: string
  hull_number: string
  model_name: string
  doc_number: string
  issue_date: string
  design_category: string
  max_persons: number
  max_load_kg: number
  engine_power_kw: number
  notified_body?: string
  certificate_ref?: string
  customer_name?: string
  status: 'draft' | 'issued' | 'superseded'
}

interface NewDocForm {
  boat_id: string
  hull_number: string
  model_id: string
  design_category: string
  max_persons: number
  max_load_kg: number
  engine_make: string
  engine_model: string
  engine_power_kw: number
  notified_body: string
  certificate_ref: string
}

export default function DeclarationsPage() {
  const [declarations, setDeclarations] = useState<Declaration[]>([])
  const [boats, setBoats] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Declaration | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [newDoc, setNewDoc] = useState<NewDocForm>({
    boat_id: '',
    hull_number: '',
    model_id: '',
    design_category: 'B',
    max_persons: 8,
    max_load_kg: 800,
    engine_make: 'Yamaha',
    engine_model: 'F300',
    engine_power_kw: 221,
    notified_body: 'Bureau Veritas',
    certificate_ref: 'BV-2025-DR29-001',
  })

  // Simulated declarations
  const sampleDeclarations: Declaration[] = [
    {
      id: '1',
      hull_number: 'GR-DRM00001A626',
      model_name: 'DR29',
      doc_number: 'DOC-DR29-001-2026',
      issue_date: '2026-01-15',
      design_category: 'B',
      max_persons: 8,
      max_load_kg: 800,
      engine_power_kw: 221,
      notified_body: 'Bureau Veritas',
      certificate_ref: 'BV-2025-DR29-001',
      customer_name: 'Mediterranean Yachts Ltd',
      status: 'issued',
    },
    {
      id: '2',
      hull_number: 'GR-DRM00002B626',
      model_name: 'DR29',
      doc_number: 'DOC-DR29-002-2026',
      issue_date: '2026-01-28',
      design_category: 'B',
      max_persons: 8,
      max_load_kg: 800,
      engine_power_kw: 221,
      notified_body: 'Bureau Veritas',
      certificate_ref: 'BV-2025-DR29-001',
      customer_name: 'Stavridis Family',
      status: 'issued',
    },
    {
      id: '3',
      hull_number: 'GR-DRM00003C626',
      model_name: 'DR29',
      doc_number: 'DOC-DR29-003-2026',
      issue_date: '',
      design_category: 'B',
      max_persons: 8,
      max_load_kg: 800,
      engine_power_kw: 221,
      status: 'draft',
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [boatsRes, modelsRes] = await Promise.all([
      supabase.from('boats').select('*, models(name, id)'),
      supabase.from('models').select('*'),
    ])
    setBoats(boatsRes.data || [])
    setModels(modelsRes.data || [])
    setDeclarations(sampleDeclarations)
    setLoading(false)
  }

  const generateHIN = (model: string, sequence: number, year: number) => {
    const countryCode = 'GR'
    const mfgCode = 'DRM'
    const serialNum = String(sequence).padStart(5, '0')
    const monthCode = String.fromCharCode(65 + (new Date().getMonth())) // A-L
    const yearCode = String(year).slice(-2)
    return `${countryCode}-${mfgCode}${serialNum}${monthCode}${yearCode}`
  }

  const generateDocNumber = (model: string, sequence: number) => {
    const year = new Date().getFullYear()
    return `DOC-${model}-${String(sequence).padStart(3, '0')}-${year}`
  }

  const handleGenerateDoc = () => {
    // Generate new declaration
    const newDeclaration: Declaration = {
      id: String(declarations.length + 1),
      hull_number: newDoc.hull_number || generateHIN('DR29', declarations.length + 1, 2026),
      model_name: 'DR29',
      doc_number: generateDocNumber('DR29', declarations.length + 1),
      issue_date: new Date().toISOString().split('T')[0],
      design_category: newDoc.design_category,
      max_persons: newDoc.max_persons,
      max_load_kg: newDoc.max_load_kg,
      engine_power_kw: newDoc.engine_power_kw,
      notified_body: newDoc.notified_body,
      certificate_ref: newDoc.certificate_ref,
      status: 'draft',
    }
    setDeclarations([newDeclaration, ...declarations])
    setPreviewDoc(newDeclaration)
    setShowGenerator(false)
  }

  const filteredDeclarations = declarations.filter(d =>
    d.hull_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.doc_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center">
          <Link href="/compliance" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileCheck className="h-7 w-7 mr-3 text-purple-600" />
              Declarations of Conformity
            </h1>
            <p className="text-sm text-gray-500">
              EU Declaration of Conformity per RCD 2013/53/EU
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" /> Generate DoC
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Issued</p>
          <p className="text-2xl font-bold text-gray-900">
            {declarations.filter(d => d.status === 'issued').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">
            {declarations.filter(d => d.status === 'draft').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-bold text-green-600">
            {declarations.filter(d => d.issue_date?.startsWith('2026-02')).length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Boats Without DoC</p>
          <p className="text-2xl font-bold text-red-600">
            {Math.max(0, boats.length - declarations.filter(d => d.status === 'issued').length)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by HIN, document number, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Declarations List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HIN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doc Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDeclarations.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Anchor className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-mono text-sm">{doc.hull_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gray-600">{doc.doc_number}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.model_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.customer_name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doc.issue_date || <span className="text-yellow-600">Pending</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      doc.status === 'issued' ? 'bg-green-100 text-green-800' :
                      doc.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {doc.status === 'issued' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Download PDF">
                        <Download className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Print">
                        <Printer className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Generate Declaration of Conformity</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the details for the new DoC</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boat/HIN</label>
                  <select
                    className="input w-full"
                    value={newDoc.boat_id}
                    onChange={(e) => setNewDoc({ ...newDoc, boat_id: e.target.value })}
                  >
                    <option value="">Select or enter new...</option>
                    {boats.map(boat => (
                      <option key={boat.id} value={boat.id}>
                        {boat.hull_number} - {boat.models?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Design Category</label>
                  <select
                    className="input w-full"
                    value={newDoc.design_category}
                    onChange={(e) => setNewDoc({ ...newDoc, design_category: e.target.value })}
                  >
                    <option value="A">A - Ocean</option>
                    <option value="B">B - Offshore</option>
                    <option value="C">C - Inshore</option>
                    <option value="D">D - Sheltered Waters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Persons</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={newDoc.max_persons}
                    onChange={(e) => setNewDoc({ ...newDoc, max_persons: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Load (kg)</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={newDoc.max_load_kg}
                    onChange={(e) => setNewDoc({ ...newDoc, max_load_kg: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Power (kW)</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={newDoc.engine_power_kw}
                    onChange={(e) => setNewDoc({ ...newDoc, engine_power_kw: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Make</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newDoc.engine_make}
                    onChange={(e) => setNewDoc({ ...newDoc, engine_make: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Engine Model</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newDoc.engine_model}
                    onChange={(e) => setNewDoc({ ...newDoc, engine_model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notified Body</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newDoc.notified_body}
                    onChange={(e) => setNewDoc({ ...newDoc, notified_body: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Reference</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newDoc.certificate_ref}
                    onChange={(e) => setNewDoc({ ...newDoc, certificate_ref: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowGenerator(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateDoc}
                className="btn btn-primary"
              >
                <FileCheck className="h-4 w-4 mr-2" /> Generate DoC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Declaration of Conformity Preview</h2>
              <div className="flex items-center space-x-2">
                <button className="btn btn-outline btn-sm">
                  <Download className="h-4 w-4 mr-1" /> PDF
                </button>
                <button className="btn btn-outline btn-sm">
                  <Printer className="h-4 w-4 mr-1" /> Print
                </button>
              </div>
            </div>

            {/* DoC Document Preview */}
            <div className="p-8 bg-gray-50">
              <div className="bg-white p-8 shadow-lg border max-w-2xl mx-auto" style={{ fontFamily: 'serif' }}>
                {/* Header */}
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                  <h1 className="text-2xl font-bold tracking-wide">EU DECLARATION OF CONFORMITY</h1>
                  <p className="text-sm text-gray-600 mt-1">Pursuant to Directive 2013/53/EU (Recreational Craft Directive)</p>
                </div>

                {/* Document Number */}
                <div className="text-right mb-6">
                  <p className="text-sm"><strong>Document No:</strong> {previewDoc.doc_number}</p>
                  <p className="text-sm"><strong>Date of Issue:</strong> {previewDoc.issue_date || new Date().toISOString().split('T')[0]}</p>
                </div>

                {/* Manufacturer */}
                <div className="mb-6">
                  <h2 className="font-bold text-sm uppercase text-gray-600 mb-2">1. Manufacturer</h2>
                  <div className="pl-4">
                    <p className="font-semibold">Dromeas Yachts IKE</p>
                    <p>Thessaloniki, Greece</p>
                    <p>VAT: EL801234567</p>
                  </div>
                </div>

                {/* Product Identification */}
                <div className="mb-6">
                  <h2 className="font-bold text-sm uppercase text-gray-600 mb-2">2. Product Identification</h2>
                  <div className="pl-4 grid grid-cols-2 gap-2 text-sm">
                    <p><strong>Craft Type:</strong></p><p>{previewDoc.model_name}</p>
                    <p><strong>Hull Identification Number:</strong></p><p className="font-mono">{previewDoc.hull_number}</p>
                    <p><strong>Design Category:</strong></p><p>{previewDoc.design_category}</p>
                    <p><strong>Maximum Number of Persons:</strong></p><p>{previewDoc.max_persons}</p>
                    <p><strong>Maximum Load (kg):</strong></p><p>{previewDoc.max_load_kg}</p>
                    <p><strong>Maximum Engine Power:</strong></p><p>{previewDoc.engine_power_kw} kW</p>
                  </div>
                </div>

                {/* Conformity Assessment */}
                <div className="mb-6">
                  <h2 className="font-bold text-sm uppercase text-gray-600 mb-2">3. Conformity Assessment</h2>
                  <div className="pl-4 text-sm">
                    <p>The product identified above conforms to the relevant Union harmonisation legislation:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Directive 2013/53/EU (Recreational Craft Directive)</li>
                    </ul>
                    <p className="mt-2"><strong>Assessment Module:</strong> Module B + C</p>
                    {previewDoc.notified_body && (
                      <>
                        <p><strong>Notified Body:</strong> {previewDoc.notified_body}</p>
                        <p><strong>Certificate Reference:</strong> {previewDoc.certificate_ref}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Harmonised Standards */}
                <div className="mb-6">
                  <h2 className="font-bold text-sm uppercase text-gray-600 mb-2">4. Harmonised Standards Applied</h2>
                  <div className="pl-4 text-sm">
                    <p>ISO 12217-1, ISO 8665, ISO 10240, ISO 12216, ISO 15083, ISO 10133, ISO 13297, ISO 11812, ISO 9094, ISO 10087, ISO 14945</p>
                  </div>
                </div>

                {/* Signature */}
                <div className="mt-12 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-gray-600">Signed for and on behalf of:</p>
                      <p className="font-semibold mt-2">Dromeas Yachts IKE</p>
                      <div className="mt-8 border-b border-gray-400 w-48"></div>
                      <p className="text-sm mt-1">Efe Kuyumcu, Managing Director</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Place and Date:</p>
                      <p className="mt-2">Thessaloniki, Greece</p>
                      <p>{previewDoc.issue_date || new Date().toISOString().split('T')[0]}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t text-xs text-gray-500 text-center">
                  <p>This declaration is issued under the sole responsibility of the manufacturer.</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                {previewDoc.status === 'draft' ? 'This is a draft. Issue to finalize.' : 'Document has been issued.'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                {previewDoc.status === 'draft' && (
                  <button className="btn btn-primary">
                    <CheckCircle className="h-4 w-4 mr-2" /> Issue Document
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
