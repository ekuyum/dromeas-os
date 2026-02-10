'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Anchor,
  ArrowLeft,
  Plus,
  Download,
  Printer,
  RefreshCw,
  Copy,
  QrCode,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BuildersPlate {
  id: string
  hin: string
  model_name: string
  design_category: string
  max_persons: number
  max_load_kg: number
  max_engine_power_kw: number
  loa_m: number
  beam_m: number
  draft_m: number
  year_of_build: number
  generated_date: string
  boat_id?: string
}

export default function BuildersPlateGenerator() {
  const [plates, setPlates] = useState<BuildersPlate[]>([])
  const [boats, setBoats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)
  const [previewPlate, setPreviewPlate] = useState<BuildersPlate | null>(null)

  const [newPlate, setNewPlate] = useState({
    hin: '',
    model_name: 'DR29',
    design_category: 'B',
    max_persons: 8,
    max_load_kg: 800,
    max_engine_power_kw: 441,
    loa_m: 8.99,
    beam_m: 2.99,
    draft_m: 0.65,
  })

  // Sample plates
  const samplePlates: BuildersPlate[] = [
    {
      id: '1',
      hin: 'GR-DRM00001A626',
      model_name: 'DR29',
      design_category: 'B',
      max_persons: 8,
      max_load_kg: 800,
      max_engine_power_kw: 441,
      loa_m: 8.99,
      beam_m: 2.99,
      draft_m: 0.65,
      year_of_build: 2026,
      generated_date: '2026-01-15',
    },
    {
      id: '2',
      hin: 'GR-DRM00002B626',
      model_name: 'DR29',
      design_category: 'B',
      max_persons: 8,
      max_load_kg: 800,
      max_engine_power_kw: 441,
      loa_m: 8.99,
      beam_m: 2.99,
      draft_m: 0.65,
      year_of_build: 2026,
      generated_date: '2026-01-28',
    },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const boatsRes = await supabase.from('boats').select('*, models(name)')
    setBoats(boatsRes.data || [])
    setPlates(samplePlates)
    setLoading(false)
  }

  const generateHIN = () => {
    const countryCode = 'GR'
    const mfgCode = 'DRM'
    const serialNum = String(plates.length + 1).padStart(5, '0')
    const monthCode = String.fromCharCode(65 + (new Date().getMonth()))
    const yearCode = '26'
    return `${countryCode}-${mfgCode}${serialNum}${monthCode}${yearCode}`
  }

  const handleGenerate = () => {
    const plate: BuildersPlate = {
      id: String(plates.length + 1),
      hin: newPlate.hin || generateHIN(),
      model_name: newPlate.model_name,
      design_category: newPlate.design_category,
      max_persons: newPlate.max_persons,
      max_load_kg: newPlate.max_load_kg,
      max_engine_power_kw: newPlate.max_engine_power_kw,
      loa_m: newPlate.loa_m,
      beam_m: newPlate.beam_m,
      draft_m: newPlate.draft_m,
      year_of_build: new Date().getFullYear(),
      generated_date: new Date().toISOString().split('T')[0],
    }
    setPlates([plate, ...plates])
    setPreviewPlate(plate)
    setShowGenerator(false)
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
        <div className="flex items-center">
          <Link href="/compliance" className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Anchor className="h-7 w-7 mr-3 text-amber-600" />
              Builder's Plate Generator
            </h1>
            <p className="text-sm text-gray-500">
              ISO 14945 compliant builder's plates with HIN per ISO 10087
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" /> Generate Plate
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800">Builder's Plate Requirements (ISO 14945)</h3>
            <p className="text-sm text-blue-700 mt-1">
              Every recreational craft must display a permanently affixed plate showing: Manufacturer name, CE mark,
              Design Category, Maximum persons, Maximum load, and Hull Identification Number.
            </p>
          </div>
        </div>
      </div>

      {/* HIN Format Explanation */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Hull Identification Number Format (ISO 10087)</h3>
        <div className="font-mono text-lg bg-gray-100 p-4 rounded-lg text-center">
          <span className="text-blue-600">GR</span>-<span className="text-green-600">DRM</span><span className="text-purple-600">00001</span><span className="text-amber-600">A</span><span className="text-red-600">626</span>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-4 text-xs text-center">
          <div>
            <div className="h-2 bg-blue-600 rounded mb-1"></div>
            <p className="text-gray-600">Country</p>
            <p className="font-semibold">Greece</p>
          </div>
          <div>
            <div className="h-2 bg-green-600 rounded mb-1"></div>
            <p className="text-gray-600">MIC</p>
            <p className="font-semibold">Dromeas</p>
          </div>
          <div>
            <div className="h-2 bg-purple-600 rounded mb-1"></div>
            <p className="text-gray-600">Serial</p>
            <p className="font-semibold">00001</p>
          </div>
          <div>
            <div className="h-2 bg-amber-600 rounded mb-1"></div>
            <p className="text-gray-600">Month</p>
            <p className="font-semibold">January</p>
          </div>
          <div>
            <div className="h-2 bg-red-600 rounded mb-1"></div>
            <p className="text-gray-600">Year</p>
            <p className="font-semibold">2026</p>
          </div>
        </div>
      </div>

      {/* Plates List */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Generated Plates</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {plates.map(plate => (
            <div key={plate.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg mr-4">
                  <Anchor className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-mono font-semibold text-gray-900">{plate.hin}</p>
                  <p className="text-sm text-gray-500">
                    {plate.model_name} · Category {plate.design_category} · Generated {plate.generated_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewPlate(plate)}
                  className="btn btn-outline btn-sm"
                >
                  Preview
                </button>
                <button className="btn btn-outline btn-sm">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full m-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Generate Builder's Plate</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select
                  className="input w-full"
                  value={newPlate.model_name}
                  onChange={(e) => setNewPlate({ ...newPlate, model_name: e.target.value })}
                >
                  <option value="DR29">DR29</option>
                  <option value="D31">D31</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Design Category</label>
                  <select
                    className="input w-full"
                    value={newPlate.design_category}
                    onChange={(e) => setNewPlate({ ...newPlate, design_category: e.target.value })}
                  >
                    <option value="A">A - Ocean</option>
                    <option value="B">B - Offshore</option>
                    <option value="C">C - Inshore</option>
                    <option value="D">D - Sheltered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Persons</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={newPlate.max_persons}
                    onChange={(e) => setNewPlate({ ...newPlate, max_persons: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Load (kg)</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={newPlate.max_load_kg}
                    onChange={(e) => setNewPlate({ ...newPlate, max_load_kg: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Engine (kW)</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={newPlate.max_engine_power_kw}
                    onChange={(e) => setNewPlate({ ...newPlate, max_engine_power_kw: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LOA (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-full"
                    value={newPlate.loa_m}
                    onChange={(e) => setNewPlate({ ...newPlate, loa_m: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Beam (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-full"
                    value={newPlate.beam_m}
                    onChange={(e) => setNewPlate({ ...newPlate, beam_m: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Draft (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input w-full"
                    value={newPlate.draft_m}
                    onChange={(e) => setNewPlate({ ...newPlate, draft_m: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setShowGenerator(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleGenerate} className="btn btn-primary">
                <Anchor className="h-4 w-4 mr-2" /> Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPlate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full m-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Builder's Plate Preview</h2>
              <div className="flex space-x-2">
                <button className="btn btn-outline btn-sm">
                  <Printer className="h-4 w-4 mr-1" /> Print
                </button>
                <button className="btn btn-outline btn-sm">
                  <Download className="h-4 w-4 mr-1" /> SVG
                </button>
              </div>
            </div>

            {/* Plate Visual */}
            <div className="p-8 bg-gray-100">
              <div className="mx-auto" style={{ width: '400px' }}>
                {/* Simulated Plate */}
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 border-4 border-gray-400 rounded-lg p-6 shadow-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b-2 border-gray-400 pb-3 mb-4">
                    <div>
                      <p className="font-bold text-lg">DROMEAS YACHTS</p>
                      <p className="text-xs text-gray-600">Thessaloniki, Greece</p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 border-2 border-gray-600 rounded flex items-center justify-center">
                        <span className="text-xl font-bold">CE</span>
                      </div>
                    </div>
                  </div>

                  {/* Model & HIN */}
                  <div className="mb-4">
                    <p className="text-2xl font-bold">{previewPlate.model_name}</p>
                    <p className="font-mono text-sm bg-white px-2 py-1 rounded inline-block mt-1">
                      {previewPlate.hin}
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Design Category</p>
                      <p className="font-bold text-xl">{previewPlate.design_category}</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Max Persons</p>
                      <p className="font-bold text-xl">{previewPlate.max_persons}</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Max Load</p>
                      <p className="font-bold">{previewPlate.max_load_kg} kg</p>
                    </div>
                    <div className="bg-white/50 p-2 rounded">
                      <p className="text-xs text-gray-500">Max Engine Power</p>
                      <p className="font-bold">{previewPlate.max_engine_power_kw} kW</p>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between text-xs">
                    <span>LOA: {previewPlate.loa_m}m</span>
                    <span>Beam: {previewPlate.beam_m}m</span>
                    <span>Draft: {previewPlate.draft_m}m</span>
                  </div>

                  {/* Year */}
                  <div className="mt-3 text-center">
                    <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm font-bold">
                      {previewPlate.year_of_build}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button onClick={() => setPreviewPlate(null)} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
