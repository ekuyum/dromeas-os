'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Pen,
  Ship,
  Calendar,
  User,
  ChevronRight,
  RefreshCw,
  Search,
  FileText,
} from 'lucide-react'
import { supabase, formatDate } from '@/lib/supabase'

interface QualityGate {
  id: string
  stage_name: string
  checkpoint_name: string
  description: string
  is_mandatory: boolean
  requires_photo: boolean
  requires_signature: boolean
}

interface Inspection {
  id: string
  boat_id: string
  hull_number: string
  model_name: string
  checkpoint_name: string
  stage_name: string
  status: 'pending' | 'passed' | 'failed' | 'waived'
  inspector_name: string | null
  inspection_date: string | null
  defects_found: number
}

interface Defect {
  id: string
  hull_number: string
  defect_type: string
  severity: 'minor' | 'major' | 'critical'
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  reported_at: string
}

export default function QualityPage() {
  const [gates, setGates] = useState<QualityGate[]>([])
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [defects, setDefects] = useState<Defect[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'inspections' | 'defects' | 'gates'>('inspections')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [boatsRes] = await Promise.all([
      supabase.from('boats').select('id, hull_number, status, models(name)'),
    ])

    const boats = (boatsRes.data || []) as any[]

    // Generate sample quality gates
    const sampleGates: QualityGate[] = [
      { id: '1', stage_name: 'hull_layup', checkpoint_name: 'Resin saturation check', description: 'Verify complete wet-out', is_mandatory: true, requires_photo: true, requires_signature: true },
      { id: '2', stage_name: 'hull_layup', checkpoint_name: 'Foam core alignment', description: 'Check PVC placement', is_mandatory: true, requires_photo: true, requires_signature: true },
      { id: '3', stage_name: 'hull_cure', checkpoint_name: 'Barcol hardness test', description: 'Min 40 Barcol', is_mandatory: true, requires_photo: false, requires_signature: true },
      { id: '4', stage_name: 'engine', checkpoint_name: 'Engine serial verification', description: 'Record serial number', is_mandatory: true, requires_photo: true, requires_signature: true },
      { id: '5', stage_name: 'engine', checkpoint_name: 'Alignment check', description: 'Verify alignment', is_mandatory: true, requires_photo: false, requires_signature: true },
      { id: '6', stage_name: 'electrical', checkpoint_name: 'Wiring continuity test', description: 'Test all circuits', is_mandatory: true, requires_photo: false, requires_signature: true },
      { id: '7', stage_name: 'electrical', checkpoint_name: 'NMEA network test', description: 'Device communication', is_mandatory: true, requires_photo: false, requires_signature: false },
      { id: '8', stage_name: 'qc', checkpoint_name: 'Final walkthrough', description: 'Complete checklist', is_mandatory: true, requires_photo: true, requires_signature: true },
      { id: '9', stage_name: 'sea_trial', checkpoint_name: 'Speed test', description: 'WOT performance', is_mandatory: true, requires_photo: false, requires_signature: true },
      { id: '10', stage_name: 'sea_trial', checkpoint_name: 'Customer acceptance', description: 'Owner sign-off', is_mandatory: true, requires_photo: true, requires_signature: true },
    ]
    setGates(sampleGates)

    // Generate sample inspections based on boats
    const sampleInspections: Inspection[] = boats.flatMap((boat, idx) => {
      return sampleGates.slice(0, Math.floor(Math.random() * 5) + 3).map((gate, gIdx) => ({
        id: `insp-${boat.id}-${gIdx}`,
        boat_id: boat.id,
        hull_number: boat.hull_number,
        model_name: boat.models?.name || 'Unknown',
        checkpoint_name: gate.checkpoint_name,
        stage_name: gate.stage_name,
        status: ['passed', 'passed', 'passed', 'pending', 'failed'][Math.floor(Math.random() * 5)] as any,
        inspector_name: ['Yiannis K.', 'Nikos P.', 'Maria S.', null][Math.floor(Math.random() * 4)],
        inspection_date: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        defects_found: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0,
      }))
    })
    setInspections(sampleInspections)

    // Generate sample defects
    const defectTypes = ['Cosmetic', 'Structural', 'Functional', 'Safety']
    const descriptions = [
      'Minor gelcoat scratch on starboard bow',
      'Void detected in hull layup - section A3',
      'Nav light flickering - wiring issue',
      'Upholstery stitching separation',
      'Engine vibration exceeds spec at 4500 RPM',
    ]
    const sampleDefects: Defect[] = boats.slice(0, 5).map((boat, idx) => ({
      id: `def-${idx}`,
      hull_number: boat.hull_number,
      defect_type: defectTypes[Math.floor(Math.random() * defectTypes.length)],
      severity: ['minor', 'major', 'critical'][Math.floor(Math.random() * 3)] as any,
      description: descriptions[idx % descriptions.length],
      status: ['open', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)] as any,
      reported_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    setDefects(sampleDefects)

    setLoading(false)
  }

  const stages = Array.from(new Set(gates.map(g => g.stage_name)))

  const stats = {
    pending: inspections.filter(i => i.status === 'pending').length,
    passed: inspections.filter(i => i.status === 'passed').length,
    failed: inspections.filter(i => i.status === 'failed').length,
    openDefects: defects.filter(d => d.status !== 'resolved').length,
    criticalDefects: defects.filter(d => d.severity === 'critical' && d.status !== 'resolved').length,
  }

  const filteredInspections = selectedStage === 'all'
    ? inspections
    : inspections.filter(i => i.stage_name === selectedStage)

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
          <h1 className="text-2xl font-bold text-gray-900">Quality Control</h1>
          <p className="text-sm text-gray-500">
            Stage gates, inspections, and defect tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <FileText className="h-4 w-4 mr-2" /> Export Report
          </button>
          <button className="btn btn-primary">
            <ClipboardCheck className="h-4 w-4 mr-2" /> New Inspection
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <ClipboardCheck className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Passed</p>
              <p className="text-3xl font-bold text-green-800">{stats.passed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Failed</p>
              <p className="text-3xl font-bold text-red-800">{stats.failed}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Defects</p>
              <p className="text-3xl font-bold text-gray-900">{stats.openDefects}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className={`card p-4 ${stats.criticalDefects > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${stats.criticalDefects > 0 ? 'text-red-700' : 'text-gray-500'}`}>Critical</p>
              <p className={`text-3xl font-bold ${stats.criticalDefects > 0 ? 'text-red-800' : 'text-gray-900'}`}>{stats.criticalDefects}</p>
            </div>
            <AlertTriangle className={`h-10 w-10 ${stats.criticalDefects > 0 ? 'text-red-500' : 'text-gray-300'}`} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('inspections')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'inspections' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inspections ({inspections.length})
          </button>
          <button
            onClick={() => setActiveTab('defects')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'defects' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Defects
            {stats.openDefects > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{stats.openDefects}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('gates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gates' ? 'border-dromeas-600 text-dromeas-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Quality Gates ({gates.length})
          </button>
        </nav>
      </div>

      {/* Inspections Tab */}
      {activeTab === 'inspections' && (
        <>
          {/* Stage Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedStage === 'all' ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Stages
            </button>
            {stages.map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1 text-sm rounded-full capitalize ${
                  selectedStage === stage ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stage.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hull #</th>
                  <th>Model</th>
                  <th>Stage</th>
                  <th>Checkpoint</th>
                  <th>Inspector</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Defects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInspections.slice(0, 20).map(insp => (
                  <tr key={insp.id}>
                    <td className="font-medium text-dromeas-600">{insp.hull_number}</td>
                    <td>{insp.model_name}</td>
                    <td className="capitalize">{insp.stage_name.replace('_', ' ')}</td>
                    <td>{insp.checkpoint_name}</td>
                    <td>{insp.inspector_name || '-'}</td>
                    <td>{insp.inspection_date ? formatDate(insp.inspection_date) : '-'}</td>
                    <td>
                      <span className={`status-badge ${
                        insp.status === 'passed' ? 'status-success' :
                        insp.status === 'failed' ? 'status-danger' :
                        insp.status === 'waived' ? 'status-info' : 'status-warning'
                      }`}>
                        {insp.status}
                      </span>
                    </td>
                    <td>
                      {insp.defects_found > 0 ? (
                        <span className="text-red-600 font-medium">{insp.defects_found}</span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Defects Tab */}
      {activeTab === 'defects' && (
        <div className="space-y-3">
          {defects.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No defects recorded</p>
            </div>
          ) : (
            defects.map(defect => (
              <div key={defect.id} className={`card p-4 border-l-4 ${
                defect.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                defect.severity === 'major' ? 'border-l-orange-500 bg-orange-50' : 'border-l-yellow-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-dromeas-600">{defect.hull_number}</span>
                      <span className={`status-badge ${
                        defect.severity === 'critical' ? 'status-danger' :
                        defect.severity === 'major' ? 'status-warning' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {defect.severity}
                      </span>
                      <span className="text-sm text-gray-500">{defect.defect_type}</span>
                    </div>
                    <p className="text-gray-700">{defect.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Reported {formatDate(defect.reported_at)}</p>
                  </div>
                  <span className={`status-badge ${
                    defect.status === 'resolved' ? 'status-success' :
                    defect.status === 'in_progress' ? 'status-info' : 'status-warning'
                  }`}>
                    {defect.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Gates Tab */}
      {activeTab === 'gates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map(stage => (
            <div key={stage} className="card">
              <div className="card-header bg-gray-50">
                <h3 className="font-semibold capitalize">{stage.replace('_', ' ')}</h3>
              </div>
              <div className="card-body space-y-2">
                {gates.filter(g => g.stage_name === stage).map(gate => (
                  <div key={gate.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{gate.checkpoint_name}</p>
                      <p className="text-xs text-gray-500">{gate.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {gate.requires_photo && <Camera className="h-4 w-4 text-blue-500" title="Photo required" />}
                      {gate.requires_signature && <Pen className="h-4 w-4 text-green-500" title="Signature required" />}
                      {gate.is_mandatory && <AlertTriangle className="h-4 w-4 text-orange-500" title="Mandatory" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/production/tracking" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Ship className="h-4 w-4 mr-1" /> Production Board →
        </Link>
        <Link href="/warranty" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <FileText className="h-4 w-4 mr-1" /> Warranty Claims →
        </Link>
      </div>
    </div>
  )
}
