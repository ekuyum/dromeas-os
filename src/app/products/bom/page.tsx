'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw,
  Ship,
  DollarSign,
  Clock,
  FileText,
} from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface BOMLine {
  id: string
  component_id: string
  component_code: string
  component_name: string
  quantity: number
  unit_cost: number
  scrap_factor: number
  lead_time_days: number
  children?: BOMLine[]
  level: number
  parent_id: string | null
  is_assembly: boolean
  total_cost: number
}

interface BOMRevision {
  id: string
  model_id: string
  model_name: string
  revision: string
  name: string
  effective_date: string
  is_active: boolean
  total_cost: number
  lines_count: number
}

interface Model {
  id: string
  name: string
  base_price_eur: number
}

export default function BOMPage() {
  const [revisions, setRevisions] = useState<BOMRevision[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedRevision, setSelectedRevision] = useState<BOMRevision | null>(null)
  const [bomLines, setBomLines] = useState<BOMLine[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showCostRollup, setShowCostRollup] = useState(false)
  const [costRollup, setCostRollup] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [modelsRes, componentsRes] = await Promise.all([
      supabase.from('models').select('id, name, base_price_eur'),
      supabase.from('components').select('id, code, name, unit_cost_eur, lead_time_days'),
    ])

    const modelsData = (modelsRes.data || []) as Model[]
    const components = (componentsRes.data || []) as any[]

    setModels(modelsData)

    // Generate sample BOM revisions (in production, this would come from bom_revisions table)
    const sampleRevisions: BOMRevision[] = modelsData.map((model, idx) => ({
      id: `rev-${model.id}`,
      model_id: model.id,
      model_name: model.name,
      revision: '1.0',
      name: `${model.name} Standard Package`,
      effective_date: '2026-01-01',
      is_active: true,
      total_cost: model.base_price_eur * 0.65, // Estimated 35% margin
      lines_count: Math.floor(Math.random() * 30) + 20,
    }))

    setRevisions(sampleRevisions)

    // Generate sample BOM structure (hierarchical)
    if (sampleRevisions.length > 0) {
      const sampleBOM = generateSampleBOM(components)
      setBomLines(sampleBOM)
      setSelectedRevision(sampleRevisions[0])
    }

    setLoading(false)
  }

  const generateSampleBOM = (components: any[]): BOMLine[] => {
    // Simulate a hierarchical BOM structure
    const hull: BOMLine = {
      id: 'bom-1',
      component_id: 'comp-hull',
      component_code: 'HULL-ASM',
      component_name: 'Hull Assembly',
      quantity: 1,
      unit_cost: 15000,
      scrap_factor: 1.05,
      lead_time_days: 21,
      level: 0,
      parent_id: null,
      is_assembly: true,
      total_cost: 15750,
      children: [
        {
          id: 'bom-1-1',
          component_id: 'comp-resin',
          component_code: 'MAT-RESIN',
          component_name: 'Vinylester Resin (kg)',
          quantity: 45,
          unit_cost: 12,
          scrap_factor: 1.10,
          lead_time_days: 7,
          level: 1,
          parent_id: 'bom-1',
          is_assembly: false,
          total_cost: 594,
        },
        {
          id: 'bom-1-2',
          component_id: 'comp-foam',
          component_code: 'MAT-FOAM',
          component_name: 'PVC Foam Core (m²)',
          quantity: 12,
          unit_cost: 85,
          scrap_factor: 1.08,
          lead_time_days: 10,
          level: 1,
          parent_id: 'bom-1',
          is_assembly: false,
          total_cost: 1101.6,
        },
        {
          id: 'bom-1-3',
          component_id: 'comp-glass',
          component_code: 'MAT-GLASS',
          component_name: 'Fiberglass Cloth (m²)',
          quantity: 35,
          unit_cost: 28,
          scrap_factor: 1.12,
          lead_time_days: 5,
          level: 1,
          parent_id: 'bom-1',
          is_assembly: false,
          total_cost: 1097.6,
        },
      ]
    }

    const propulsion: BOMLine = {
      id: 'bom-2',
      component_id: 'comp-prop',
      component_code: 'PROP-ASM',
      component_name: 'Propulsion Assembly',
      quantity: 1,
      unit_cost: 22500,
      scrap_factor: 1.0,
      lead_time_days: 56,
      level: 0,
      parent_id: null,
      is_assembly: true,
      total_cost: 22500,
      children: [
        {
          id: 'bom-2-1',
          component_id: 'comp-engine',
          component_code: 'ENG-MERC350',
          component_name: 'Mercury V8 350HP Engine',
          quantity: 1,
          unit_cost: 18500,
          scrap_factor: 1.0,
          lead_time_days: 56,
          level: 1,
          parent_id: 'bom-2',
          is_assembly: false,
          total_cost: 18500,
        },
        {
          id: 'bom-2-2',
          component_id: 'comp-drive',
          component_code: 'DRV-STERN',
          component_name: 'Sterndrive Assembly',
          quantity: 1,
          unit_cost: 3200,
          scrap_factor: 1.0,
          lead_time_days: 21,
          level: 1,
          parent_id: 'bom-2',
          is_assembly: false,
          total_cost: 3200,
        },
        {
          id: 'bom-2-3',
          component_id: 'comp-prop',
          component_code: 'PRP-SS21',
          component_name: 'Stainless Propeller 21"',
          quantity: 1,
          unit_cost: 800,
          scrap_factor: 1.0,
          lead_time_days: 7,
          level: 1,
          parent_id: 'bom-2',
          is_assembly: false,
          total_cost: 800,
        },
      ]
    }

    const electrical: BOMLine = {
      id: 'bom-3',
      component_id: 'comp-elec',
      component_code: 'ELEC-ASM',
      component_name: 'Electrical Assembly',
      quantity: 1,
      unit_cost: 8500,
      scrap_factor: 1.0,
      lead_time_days: 28,
      level: 0,
      parent_id: null,
      is_assembly: true,
      total_cost: 8500,
      children: [
        {
          id: 'bom-3-1',
          component_id: 'comp-nav',
          component_code: 'NAV-GARM12',
          component_name: 'Garmin 1242xsv Chartplotter',
          quantity: 1,
          unit_cost: 2340,
          scrap_factor: 1.0,
          lead_time_days: 14,
          level: 1,
          parent_id: 'bom-3',
          is_assembly: false,
          total_cost: 2340,
        },
        {
          id: 'bom-3-2',
          component_id: 'comp-vhf',
          component_code: 'COM-VHF25',
          component_name: 'VHF Radio with DSC',
          quantity: 1,
          unit_cost: 450,
          scrap_factor: 1.0,
          lead_time_days: 7,
          level: 1,
          parent_id: 'bom-3',
          is_assembly: false,
          total_cost: 450,
        },
        {
          id: 'bom-3-3',
          component_id: 'comp-batt',
          component_code: 'PWR-BATT110',
          component_name: 'AGM Battery 110Ah',
          quantity: 2,
          unit_cost: 380,
          scrap_factor: 1.0,
          lead_time_days: 5,
          level: 1,
          parent_id: 'bom-3',
          is_assembly: false,
          total_cost: 760,
        },
        {
          id: 'bom-3-4',
          component_id: 'comp-wire',
          component_code: 'WIR-HARN28',
          component_name: 'Wiring Harness 28m',
          quantity: 1,
          unit_cost: 650,
          scrap_factor: 1.05,
          lead_time_days: 10,
          level: 1,
          parent_id: 'bom-3',
          is_assembly: false,
          total_cost: 682.5,
        },
      ]
    }

    const deck: BOMLine = {
      id: 'bom-4',
      component_id: 'comp-deck',
      component_code: 'DECK-ASM',
      component_name: 'Deck & Rigging Assembly',
      quantity: 1,
      unit_cost: 12000,
      scrap_factor: 1.0,
      lead_time_days: 21,
      level: 0,
      parent_id: null,
      is_assembly: true,
      total_cost: 12000,
      children: [
        {
          id: 'bom-4-1',
          component_id: 'comp-ttop',
          component_code: 'STR-TTOP',
          component_name: 'T-Top Frame (Aluminum)',
          quantity: 1,
          unit_cost: 3500,
          scrap_factor: 1.0,
          lead_time_days: 14,
          level: 1,
          parent_id: 'bom-4',
          is_assembly: false,
          total_cost: 3500,
        },
        {
          id: 'bom-4-2',
          component_id: 'comp-upholstery',
          component_code: 'INT-UPH',
          component_name: 'Marine Upholstery Set',
          quantity: 1,
          unit_cost: 4200,
          scrap_factor: 1.0,
          lead_time_days: 21,
          level: 1,
          parent_id: 'bom-4',
          is_assembly: false,
          total_cost: 4200,
        },
        {
          id: 'bom-4-3',
          component_id: 'comp-cleats',
          component_code: 'HW-CLEAT8',
          component_name: 'SS Cleats 8" (set of 4)',
          quantity: 1,
          unit_cost: 280,
          scrap_factor: 1.0,
          lead_time_days: 5,
          level: 1,
          parent_id: 'bom-4',
          is_assembly: false,
          total_cost: 280,
        },
      ]
    }

    return [hull, propulsion, electrical, deck]
  }

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (lines: BOMLine[]) => {
      lines.forEach(line => {
        if (line.children && line.children.length > 0) {
          allIds.add(line.id)
          collectIds(line.children)
        }
      })
    }
    collectIds(bomLines)
    setExpandedNodes(allIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  const calculateCostRollup = () => {
    let totalMaterial = 0
    let totalLabor = 0 // Simulated
    let totalOverhead = 0 // Simulated
    let criticalPath = 0
    let itemCount = 0

    const processLine = (line: BOMLine) => {
      totalMaterial += line.quantity * line.unit_cost * line.scrap_factor
      if (line.lead_time_days > criticalPath) criticalPath = line.lead_time_days
      itemCount++
      if (line.children) {
        line.children.forEach(processLine)
      }
    }

    bomLines.forEach(processLine)

    totalLabor = totalMaterial * 0.25 // 25% of material for labor
    totalOverhead = (totalMaterial + totalLabor) * 0.15 // 15% overhead

    setCostRollup({
      material: totalMaterial,
      labor: totalLabor,
      overhead: totalOverhead,
      total: totalMaterial + totalLabor + totalOverhead,
      criticalPath,
      itemCount,
      margin: selectedRevision ? ((selectedRevision.total_cost * 1.35 - (totalMaterial + totalLabor + totalOverhead)) / (selectedRevision.total_cost * 1.35)) * 100 : 30,
    })
    setShowCostRollup(true)
  }

  const renderBOMLine = (line: BOMLine, depth: number = 0) => {
    const isExpanded = expandedNodes.has(line.id)
    const hasChildren = line.children && line.children.length > 0

    return (
      <div key={line.id}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 border-b border-gray-100 ${
            depth > 0 ? 'bg-gray-50/50' : ''
          }`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {/* Expand/Collapse */}
          <div className="w-6 mr-2">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(line.id)}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Component Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              {line.is_assembly ? (
                <Package className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 mr-2 flex-shrink-0 rounded-full bg-gray-300" />
              )}
              <span className={`font-medium ${line.is_assembly ? 'text-blue-700' : 'text-gray-900'}`}>
                {line.component_name}
              </span>
              <span className="ml-2 text-xs text-gray-500 font-mono">{line.component_code}</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="w-20 text-right">
            <span className="text-sm font-medium">{line.quantity}</span>
          </div>

          {/* Unit Cost */}
          <div className="w-28 text-right">
            <span className="text-sm">{formatCurrency(line.unit_cost)}</span>
          </div>

          {/* Extended Cost */}
          <div className="w-32 text-right">
            <span className="text-sm font-medium text-green-700">
              {formatCurrency(line.quantity * line.unit_cost * line.scrap_factor)}
            </span>
          </div>

          {/* Lead Time */}
          <div className="w-24 text-right">
            <span className={`text-sm ${line.lead_time_days > 30 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              {line.lead_time_days}d
            </span>
          </div>

          {/* Actions */}
          <div className="w-20 flex justify-end space-x-1">
            <button className="p-1 text-gray-400 hover:text-blue-600">
              <Edit2 className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {line.children!.map(child => renderBOMLine(child, depth + 1))}
          </div>
        )}
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Bill of Materials</h1>
          <p className="text-sm text-gray-500">
            Multi-level BOM management with cost rollup • {revisions.length} active BOMs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn btn-outline">
            <Copy className="h-4 w-4 mr-2" /> Clone BOM
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" /> New Revision
          </button>
        </div>
      </div>

      {/* BOM Selector */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Select BOM</label>
            <select
              value={selectedRevision?.id || ''}
              onChange={(e) => {
                const rev = revisions.find(r => r.id === e.target.value)
                setSelectedRevision(rev || null)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dromeas-500"
            >
              {revisions.map(rev => (
                <option key={rev.id} value={rev.id}>
                  {rev.model_name} - {rev.name} (Rev {rev.revision})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Status</label>
            <span className={`status-badge ${selectedRevision?.is_active ? 'status-success' : 'status-neutral'}`}>
              {selectedRevision?.is_active ? 'Active' : 'Draft'}
            </span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Total Cost</label>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(selectedRevision?.total_cost || 0)}
            </span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Components</label>
            <span className="text-lg font-bold text-gray-900">
              {selectedRevision?.lines_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Cost Rollup Modal */}
      {showCostRollup && costRollup && (
        <div className="card border-2 border-green-200 bg-green-50">
          <div className="card-header flex items-center justify-between bg-green-100">
            <h3 className="font-semibold text-green-800 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              BOM Cost Rollup Analysis
            </h3>
            <button onClick={() => setShowCostRollup(false)} className="text-green-600 hover:text-green-800">
              ✕
            </button>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Material Cost</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(costRollup.material)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Labor (Est.)</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(costRollup.labor)}</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Overhead (Est.)</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(costRollup.overhead)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border-2 border-green-300">
                <p className="text-xs text-green-600 uppercase font-medium">Total Cost</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(costRollup.total)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-green-200">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Critical Path</p>
                  <p className="font-bold">{costRollup.criticalPath} days</p>
                </div>
              </div>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Total Items</p>
                  <p className="font-bold">{costRollup.itemCount} components</p>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-xs text-gray-500">Est. Margin</p>
                  <p className={`font-bold ${costRollup.margin > 25 ? 'text-green-600' : 'text-red-600'}`}>
                    {costRollup.margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOM Tree */}
      <div className="card overflow-hidden">
        <div className="card-header flex items-center justify-between">
          <h3 className="font-semibold">BOM Structure</h3>
          <div className="flex items-center space-x-2">
            <button onClick={expandAll} className="text-sm text-dromeas-600 hover:text-dromeas-700">
              Expand All
            </button>
            <span className="text-gray-300">|</span>
            <button onClick={collapseAll} className="text-sm text-dromeas-600 hover:text-dromeas-700">
              Collapse All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={calculateCostRollup}
              className="btn btn-sm btn-outline"
            >
              <Calculator className="h-4 w-4 mr-1" />
              Cost Rollup
            </button>
          </div>
        </div>

        {/* Header Row */}
        <div className="flex items-center py-2 px-3 bg-gray-100 border-b text-xs font-medium text-gray-500 uppercase">
          <div className="w-6 mr-2" />
          <div className="flex-1">Component</div>
          <div className="w-20 text-right">Qty</div>
          <div className="w-28 text-right">Unit Cost</div>
          <div className="w-32 text-right">Extended</div>
          <div className="w-24 text-right">Lead Time</div>
          <div className="w-20 text-right">Actions</div>
        </div>

        {/* BOM Lines */}
        <div className="max-h-[500px] overflow-y-auto">
          {bomLines.map(line => renderBOMLine(line))}
        </div>

        {/* Summary Footer */}
        <div className="flex items-center py-3 px-3 bg-gray-50 border-t">
          <div className="flex-1 font-medium text-gray-900">
            Total BOM Cost
          </div>
          <div className="w-32 text-right">
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(bomLines.reduce((sum, line) => {
                const lineTotal = (cost: BOMLine): number => {
                  let total = cost.quantity * cost.unit_cost * cost.scrap_factor
                  if (cost.children) {
                    total += cost.children.reduce((s, c) => s + lineTotal(c), 0)
                  }
                  return total
                }
                return sum + lineTotal(line)
              }, 0))}
            </span>
          </div>
          <div className="w-44" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Long Lead Items</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">{'>'}30 days lead time</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-2xl font-bold text-green-600">18</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Ready for production</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Need Reorder</p>
              <p className="text-2xl font-bold text-yellow-600">5</p>
            </div>
            <Package className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Below min stock</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Variants</p>
              <p className="text-2xl font-bold text-blue-600">4</p>
            </div>
            <Ship className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Configurable options</p>
        </div>
      </div>

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/products/components" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Package className="h-4 w-4 mr-1" /> Manage Components →
        </Link>
        <Link href="/purchasing" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <FileText className="h-4 w-4 mr-1" /> Create Purchase Orders →
        </Link>
        <Link href="/ai" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Calculator className="h-4 w-4 mr-1" /> Ask AI about BOM →
        </Link>
      </div>
    </div>
  )
}
