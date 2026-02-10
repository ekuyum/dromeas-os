'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  Ship,
  Search,
  RefreshCw,
  Download,
  Upload,
  ArrowRight,
  DollarSign,
  Layers,
  FileText,
} from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface ReconciliationItem {
  id: string
  model_code: string
  model_name: string
  part_code: string
  part_name: string
  category: string
  in_standard: boolean
  in_bom: boolean
  qty_standard: number
  qty_bom: number
  unit_cost: number
  status: 'matched' | 'missing_bom' | 'missing_standard' | 'qty_mismatch' | 'orphan'
  notes: string
}

interface ModelSummary {
  model_code: string
  model_name: string
  total_parts: number
  matched: number
  missing_in_bom: number
  missing_in_standard: number
  qty_mismatch: number
  cost_variance: number
}

// Simulated data based on the Excel file structure
const MOCK_STANDARD_EQUIPMENT = [
  { model: 'D28CC', part_code: 'NAV-RAY9', qty: 1, notes: 'Helm station' },
  { model: 'D28CC', part_code: 'ELEC-SHORE230', qty: 1, notes: 'Standard EU' },
  { model: 'D28CC', part_code: 'COL-WHITE', qty: 1, notes: 'Standard color' },
  { model: 'D28CC', part_code: 'UPH-SILVERTEX', qty: 1, notes: 'Standard upholstery' },
  { model: 'D28CC', part_code: 'LED-NAV', qty: 1, notes: 'Navigation lights' },
  { model: 'D28WA', part_code: 'NAV-RAY9', qty: 1, notes: 'Helm station' },
  { model: 'D28WA', part_code: 'ELEC-SHORE230', qty: 1, notes: 'Standard EU' },
  { model: 'D28WA', part_code: 'COL-WHITE', qty: 1, notes: 'Standard color' },
  { model: 'D33WA', part_code: 'NAV-RAY12', qty: 1, notes: 'Larger display' },
  { model: 'D33WA', part_code: 'ELEC-SHORE230', qty: 1, notes: 'Standard EU' },
  { model: 'D33WA', part_code: 'BH-THRUST', qty: 1, notes: 'Bow thruster included' },
  { model: 'D33SUV', part_code: 'NAV-RAY12', qty: 1, notes: 'Larger display' },
  { model: 'D33SUV', part_code: 'ELEC-SHORE230', qty: 1, notes: 'Standard EU' },
  { model: 'D33SUV', part_code: 'BH-THRUST', qty: 1, notes: 'Bow thruster included' },
  { model: 'D33SUV', part_code: 'AC-WEBASTO', qty: 1, notes: 'AC standard on SUV' },
]

const MOCK_BOM_LINES = [
  { model: 'D28CC', part_code: 'NAV-RAY9', qty: 1, cost: 1200 },
  { model: 'D28CC', part_code: 'ELEC-SHORE230', qty: 1, cost: 450 },
  { model: 'D28CC', part_code: 'COL-WHITE', qty: 1, cost: 0 },
  // Missing UPH-SILVERTEX in BOM!
  { model: 'D28CC', part_code: 'LED-NAV', qty: 1, cost: 180 },
  { model: 'D28CC', part_code: 'PUMP-BILGE', qty: 2, cost: 85 }, // In BOM but not standard
  { model: 'D28WA', part_code: 'NAV-RAY9', qty: 1, cost: 1200 },
  { model: 'D28WA', part_code: 'ELEC-SHORE230', qty: 1, cost: 450 },
  { model: 'D28WA', part_code: 'COL-WHITE', qty: 1, cost: 0 },
  { model: 'D33WA', part_code: 'NAV-RAY12', qty: 1, cost: 2200 },
  { model: 'D33WA', part_code: 'ELEC-SHORE230', qty: 1, cost: 450 },
  { model: 'D33WA', part_code: 'BH-THRUST', qty: 1, cost: 2200 },
  { model: 'D33SUV', part_code: 'NAV-RAY12', qty: 1, cost: 2200 },
  { model: 'D33SUV', part_code: 'ELEC-SHORE230', qty: 1, cost: 450 },
  { model: 'D33SUV', part_code: 'BH-THRUST', qty: 1, cost: 2200 },
  { model: 'D33SUV', part_code: 'AC-WEBASTO', qty: 1, cost: 3800 },
  { model: 'D33SUV', part_code: 'GENSET-ONAN', qty: 1, cost: 5500 }, // In BOM but not standard
]

const MOCK_COMPONENTS: Record<string, { name: string; category: string; cost: number }> = {
  'NAV-RAY9': { name: 'Raymarine Axiom 9" Chartplotter', category: 'NAVIGATION', cost: 1200 },
  'NAV-RAY12': { name: 'Raymarine Axiom+ 12" Chartplotter', category: 'NAVIGATION', cost: 2200 },
  'ELEC-SHORE230': { name: 'Shore Power 230V EU System', category: 'ELECTRICAL', cost: 450 },
  'COL-WHITE': { name: 'Gelcoat White', category: 'FINISH', cost: 0 },
  'UPH-SILVERTEX': { name: 'Silvertex Upholstery Package', category: 'INTERIOR', cost: 2800 },
  'LED-NAV': { name: 'LED Navigation Light Set', category: 'ELECTRICAL', cost: 180 },
  'PUMP-BILGE': { name: 'Rule 2000 Bilge Pump', category: 'EQUIPMENT', cost: 85 },
  'BH-THRUST': { name: 'Side-Power Bow Thruster SE60', category: 'EQUIPMENT', cost: 2200 },
  'AC-WEBASTO': { name: 'Webasto Marine Air Conditioner', category: 'HVAC', cost: 3800 },
  'GENSET-ONAN': { name: 'Onan 5kW Generator', category: 'POWER', cost: 5500 },
}

export default function ReconciliationPage() {
  const [items, setItems] = useState<ReconciliationItem[]>([])
  const [summaries, setSummaries] = useState<ModelSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    reconcileData()
  }, [])

  const reconcileData = () => {
    setLoading(true)
    const reconciled: ReconciliationItem[] = []
    const allModels = new Set<string>()

    // Add all standard equipment items
    MOCK_STANDARD_EQUIPMENT.forEach(std => {
      allModels.add(std.model)
      const bomLine = MOCK_BOM_LINES.find(b => b.model === std.model && b.part_code === std.part_code)
      const comp = MOCK_COMPONENTS[std.part_code]

      let status: ReconciliationItem['status'] = 'matched'
      if (!bomLine) {
        status = 'missing_bom'
      } else if (bomLine.qty !== std.qty) {
        status = 'qty_mismatch'
      }

      reconciled.push({
        id: `${std.model}-${std.part_code}`,
        model_code: std.model,
        model_name: std.model.replace('CC', ' Center Console').replace('WA', ' Walk-Around').replace('SUV', ' SUV'),
        part_code: std.part_code,
        part_name: comp?.name || std.part_code,
        category: comp?.category || 'UNKNOWN',
        in_standard: true,
        in_bom: !!bomLine,
        qty_standard: std.qty,
        qty_bom: bomLine?.qty || 0,
        unit_cost: comp?.cost || bomLine?.cost || 0,
        status,
        notes: std.notes,
      })
    })

    // Find BOM items NOT in standard equipment
    MOCK_BOM_LINES.forEach(bom => {
      allModels.add(bom.model)
      const existing = reconciled.find(r => r.model_code === bom.model && r.part_code === bom.part_code)
      if (!existing) {
        const comp = MOCK_COMPONENTS[bom.part_code]
        reconciled.push({
          id: `${bom.model}-${bom.part_code}`,
          model_code: bom.model,
          model_name: bom.model.replace('CC', ' Center Console').replace('WA', ' Walk-Around').replace('SUV', ' SUV'),
          part_code: bom.part_code,
          part_name: comp?.name || bom.part_code,
          category: comp?.category || 'UNKNOWN',
          in_standard: false,
          in_bom: true,
          qty_standard: 0,
          qty_bom: bom.qty,
          unit_cost: bom.cost,
          status: 'missing_standard',
          notes: 'In BOM but not listed as standard equipment',
        })
      }
    })

    setItems(reconciled)

    // Generate summaries per model
    const modelSummaries: ModelSummary[] = Array.from(allModels).map(model => {
      const modelItems = reconciled.filter(r => r.model_code === model)
      return {
        model_code: model,
        model_name: model.replace('CC', ' Center Console').replace('WA', ' Walk-Around').replace('SUV', ' SUV'),
        total_parts: modelItems.length,
        matched: modelItems.filter(i => i.status === 'matched').length,
        missing_in_bom: modelItems.filter(i => i.status === 'missing_bom').length,
        missing_in_standard: modelItems.filter(i => i.status === 'missing_standard').length,
        qty_mismatch: modelItems.filter(i => i.status === 'qty_mismatch').length,
        cost_variance: modelItems.reduce((sum, i) => sum + (i.in_bom ? i.unit_cost * i.qty_bom : 0), 0) -
                       modelItems.reduce((sum, i) => sum + (i.in_standard ? i.unit_cost * i.qty_standard : 0), 0),
      }
    })

    setSummaries(modelSummaries)
    setLoading(false)
  }

  const filteredItems = items.filter(item => {
    if (selectedModel !== 'all' && item.model_code !== selectedModel) return false
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    return true
  })

  const totalIssues = items.filter(i => i.status !== 'matched').length
  const missingInBom = items.filter(i => i.status === 'missing_bom').length
  const missingInStd = items.filter(i => i.status === 'missing_standard').length

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
          <h1 className="text-2xl font-bold text-gray-900">BOM Reconciliation</h1>
          <p className="text-sm text-gray-500">
            Compare Standard Equipment vs Actual BOM • Catch discrepancies before they become problems
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/products/import" className="btn btn-outline">
            <Upload className="h-4 w-4 mr-2" /> Import Data
          </Link>
          <button className="btn btn-outline">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </button>
          <button onClick={reconcileData} className="btn btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" /> Reconcile
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {totalIssues > 0 && (
        <div className="card p-4 bg-red-50 border-red-200 border-l-4 border-l-red-500">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div className="flex-1">
              <p className="font-semibold text-red-800">
                {totalIssues} Reconciliation Issues Found
              </p>
              <p className="text-sm text-red-600">
                {missingInBom > 0 && `${missingInBom} standard items missing from BOM. `}
                {missingInStd > 0 && `${missingInStd} BOM items not listed as standard.`}
              </p>
            </div>
            <Link href="#issues" className="btn btn-sm bg-red-600 text-white hover:bg-red-700">
              View Issues <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Parts</p>
              <p className="text-3xl font-bold text-gray-900">{items.length}</p>
            </div>
            <Package className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Matched</p>
              <p className="text-3xl font-bold text-green-800">{items.filter(i => i.status === 'matched').length}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className={`card p-4 ${missingInBom > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${missingInBom > 0 ? 'text-red-700' : 'text-gray-500'}`}>Missing in BOM</p>
              <p className={`text-3xl font-bold ${missingInBom > 0 ? 'text-red-800' : 'text-gray-900'}`}>{missingInBom}</p>
            </div>
            <XCircle className={`h-10 w-10 ${missingInBom > 0 ? 'text-red-400' : 'text-gray-300'}`} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Standard items not built</p>
        </div>
        <div className={`card p-4 ${missingInStd > 0 ? 'bg-yellow-50 border-yellow-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${missingInStd > 0 ? 'text-yellow-700' : 'text-gray-500'}`}>Undocumented</p>
              <p className={`text-3xl font-bold ${missingInStd > 0 ? 'text-yellow-800' : 'text-gray-900'}`}>{missingInStd}</p>
            </div>
            <AlertTriangle className={`h-10 w-10 ${missingInStd > 0 ? 'text-yellow-400' : 'text-gray-300'}`} />
          </div>
          <p className="text-xs text-gray-500 mt-1">In BOM but not standard</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Models</p>
              <p className="text-3xl font-bold text-gray-900">{summaries.length}</p>
            </div>
            <Ship className="h-10 w-10 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Model Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaries.map(summary => {
          const hasIssues = summary.missing_in_bom > 0 || summary.missing_in_standard > 0
          return (
            <div
              key={summary.model_code}
              onClick={() => setSelectedModel(summary.model_code)}
              className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${
                selectedModel === summary.model_code ? 'ring-2 ring-dromeas-500' : ''
              } ${hasIssues ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900">{summary.model_code}</h3>
                {hasIssues ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total parts:</span>
                  <span className="font-medium">{summary.total_parts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Matched:</span>
                  <span className="font-medium text-green-600">{summary.matched}</span>
                </div>
                {summary.missing_in_bom > 0 && (
                  <div className="flex justify-between">
                    <span className="text-red-600">Missing BOM:</span>
                    <span className="font-medium text-red-600">{summary.missing_in_bom}</span>
                  </div>
                )}
                {summary.missing_in_standard > 0 && (
                  <div className="flex justify-between">
                    <span className="text-yellow-600">Undocumented:</span>
                    <span className="font-medium text-yellow-600">{summary.missing_in_standard}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Models</option>
          {summaries.map(s => (
            <option key={s.model_code} value={s.model_code}>{s.model_code}</option>
          ))}
        </select>
        <div className="flex space-x-2">
          {['all', 'matched', 'missing_bom', 'missing_standard'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 text-sm rounded-full ${
                filterStatus === status
                  ? 'bg-dromeas-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All' :
               status === 'matched' ? '✓ Matched' :
               status === 'missing_bom' ? '✗ Missing BOM' :
               '⚠ Undocumented'}
            </button>
          ))}
        </div>
      </div>

      {/* Reconciliation Table */}
      <div id="issues" className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Model</th>
              <th>Part Code</th>
              <th>Description</th>
              <th>Category</th>
              <th className="text-center">Std Qty</th>
              <th className="text-center">BOM Qty</th>
              <th className="text-right">Unit Cost</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredItems.map(item => (
              <tr key={item.id} className={
                item.status === 'missing_bom' ? 'bg-red-50' :
                item.status === 'missing_standard' ? 'bg-yellow-50' :
                item.status === 'qty_mismatch' ? 'bg-orange-50' : ''
              }>
                <td>
                  {item.status === 'matched' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {item.status === 'missing_bom' && <XCircle className="h-5 w-5 text-red-500" title="Missing from BOM" />}
                  {item.status === 'missing_standard' && <AlertTriangle className="h-5 w-5 text-yellow-500" title="Not in standard equipment" />}
                  {item.status === 'qty_mismatch' && <AlertTriangle className="h-5 w-5 text-orange-500" title="Quantity mismatch" />}
                </td>
                <td className="font-medium">{item.model_code}</td>
                <td className="font-mono text-sm text-dromeas-600">{item.part_code}</td>
                <td>{item.part_name}</td>
                <td><span className="status-badge status-info text-xs">{item.category}</span></td>
                <td className={`text-center ${!item.in_standard ? 'text-gray-400' : ''}`}>
                  {item.in_standard ? item.qty_standard : '-'}
                </td>
                <td className={`text-center ${!item.in_bom ? 'text-red-600 font-bold' : ''}`}>
                  {item.in_bom ? item.qty_bom : <span className="text-red-600">MISSING</span>}
                </td>
                <td className="text-right">{formatCurrency(item.unit_cost)}</td>
                <td className="text-sm text-gray-500 max-w-xs truncate" title={item.notes}>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Panel */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Recommended Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {missingInBom > 0 && (
            <div className="bg-white p-3 rounded-lg">
              <p className="font-medium text-red-700">Fix Missing BOM Items</p>
              <p className="text-sm text-gray-600 mb-2">
                {missingInBom} items promised to customers aren't being built. Either:
              </p>
              <ul className="text-xs text-gray-500 list-disc ml-4">
                <li>Add to BOM if they should be included</li>
                <li>Remove from standard equipment list</li>
              </ul>
            </div>
          )}
          {missingInStd > 0 && (
            <div className="bg-white p-3 rounded-lg">
              <p className="font-medium text-yellow-700">Document Undocumented Items</p>
              <p className="text-sm text-gray-600 mb-2">
                {missingInStd} items in BOM aren't listed as standard. Either:
              </p>
              <ul className="text-xs text-gray-500 list-disc ml-4">
                <li>Add to standard equipment (free upgrade)</li>
                <li>Convert to paid option</li>
                <li>Keep as hidden standard item</li>
              </ul>
            </div>
          )}
          <div className="bg-white p-3 rounded-lg">
            <p className="font-medium text-blue-700">Sync with Excel</p>
            <p className="text-sm text-gray-600 mb-2">
              Import latest from DROMEAS_BOM_ERP_SYSTEM.xlsx
            </p>
            <Link href="/products/import" className="text-sm text-dromeas-600 hover:text-dromeas-700">
              Go to Import Tool →
            </Link>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/products/bom" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Layers className="h-4 w-4 mr-1" /> View BOMs →
        </Link>
        <Link href="/products/components" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Package className="h-4 w-4 mr-1" /> Components →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <FileText className="h-4 w-4 mr-1" /> Ask AI about discrepancies →
        </Link>
      </div>
    </div>
  )
}
