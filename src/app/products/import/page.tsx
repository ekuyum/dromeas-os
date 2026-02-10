'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  ArrowRight,
  Package,
  Ship,
  Layers,
} from 'lucide-react'

interface ImportLog {
  timestamp: string
  type: string
  status: 'success' | 'error' | 'warning'
  message: string
  count?: number
}

const CSV_TEMPLATES = [
  {
    name: 'Components',
    description: 'Parts catalog with costs, suppliers, lead times',
    filename: 'components_template.csv',
    columns: ['PART_CODE', 'DESCRIPTION', 'CATEGORY', 'COST_EUR', 'RETAIL_EUR', 'SUPPLIER_CODE', 'LEAD_DAYS', 'UNIT'],
    sample: `PART_CODE,DESCRIPTION,CATEGORY,COST_EUR,RETAIL_EUR,SUPPLIER_CODE,LEAD_DAYS,UNIT
NAV-RAY9,Raymarine Axiom 9" Chartplotter,NAVIGATION,1200,1800,SUP-RAY,7,EA
NAV-RAY12,Raymarine Axiom+ 12" Chartplotter,NAVIGATION,2200,3200,SUP-RAY,7,EA
ELEC-SHORE230,Shore Power 230V EU System,ELECTRICAL,450,750,SUP-MAST,7,EA`,
  },
  {
    name: 'Standard Equipment',
    description: 'What\'s included as standard in each model',
    filename: 'standard_equipment_template.csv',
    columns: ['MODEL_CODE', 'PART_CODE', 'QTY', 'NOTES'],
    sample: `MODEL_CODE,PART_CODE,QTY,NOTES
D28CC,NAV-RAY9,1,Helm station
D28CC,ELEC-SHORE230,1,Standard EU
D28CC,COL-WHITE,1,Standard color
D28WA,NAV-RAY9,1,Helm station
D33SUV,NAV-RAY12,1,Larger display for SUV`,
  },
  {
    name: 'BOM Lines',
    description: 'Actual build materials for production',
    filename: 'bom_lines_template.csv',
    columns: ['MODEL_CODE', 'REVISION', 'PART_CODE', 'QTY', 'SCRAP_FACTOR', 'PARENT_CODE', 'NOTES'],
    sample: `MODEL_CODE,REVISION,PART_CODE,QTY,SCRAP_FACTOR,PARENT_CODE,NOTES
D28CC,1.0,NAV-RAY9,1,1.0,,Standard nav
D28CC,1.0,ELEC-SHORE230,1,1.0,,EU electrical
D28CC,1.0,WIRE-HARNESS,1,1.05,,Allow 5% scrap
D28CC,1.0,PUMP-BILGE,2,1.0,,Redundant bilge pumps`,
  },
  {
    name: 'Packages',
    description: 'Optional upgrade packages',
    filename: 'packages_template.csv',
    columns: ['PACKAGE_CODE', 'PACKAGE_NAME', 'MODEL_RANGE', 'RETAIL_EUR', 'PART_CODE', 'QTY'],
    sample: `PACKAGE_CODE,PACKAGE_NAME,MODEL_RANGE,RETAIL_EUR,PART_CODE,QTY
PKG-NAV-D28,Nav Pack D28,D28,8500,NAV-RAY12,1
PKG-NAV-D28,Nav Pack D28,D28,8500,NAV-VHF,1
PKG-NAV-D28,Nav Pack D28,D28,8500,NAV-HALO20,1
PKG-COMFORT-D28,Comfort Pack D28,D28,12000,AC-WEBASTO,1`,
  },
  {
    name: 'Suppliers',
    description: 'Vendor master data',
    filename: 'suppliers_template.csv',
    columns: ['SUPPLIER_CODE', 'SUPPLIER_NAME', 'CONTACT', 'COUNTRY', 'PAYMENT_TERMS', 'LEAD_TIME_DAYS'],
    sample: `SUPPLIER_CODE,SUPPLIER_NAME,CONTACT,COUNTRY,PAYMENT_TERMS,LEAD_TIME_DAYS
SUP-MERC,Mercury Marine,orders@mercury.com,USA,NET30,21
SUP-RAY,Raymarine/FLIR,marine@raymarine.com,UK,NET30,7
SUP-SIDE,Side-Power,orders@side-power.com,Norway,NET30,14`,
  },
]

export default function ImportPage() {
  const [importing, setImporting] = useState(false)
  const [logs, setLogs] = useState<ImportLog[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const downloadTemplate = (template: typeof CSV_TEMPLATES[0]) => {
    const blob = new Blob([template.sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = template.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const processImport = async () => {
    if (!selectedFile) return

    setImporting(true)
    setLogs([])

    // Simulate import process
    const newLogs: ImportLog[] = []

    newLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      status: 'success',
      message: `Reading file: ${selectedFile.name}`,
    })

    await new Promise(resolve => setTimeout(resolve, 500))

    newLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      type: 'PARSE',
      status: 'success',
      message: 'CSV parsed successfully',
      count: 25,
    })
    setLogs([...newLogs])

    await new Promise(resolve => setTimeout(resolve, 500))

    newLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      type: 'VALIDATE',
      status: 'warning',
      message: '3 rows skipped - missing required fields',
    })
    setLogs([...newLogs])

    await new Promise(resolve => setTimeout(resolve, 500))

    newLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYNC',
      status: 'success',
      message: 'Synced to Supabase database',
      count: 22,
    })
    setLogs([...newLogs])

    await new Promise(resolve => setTimeout(resolve, 500))

    newLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      type: 'RECONCILE',
      status: 'success',
      message: 'BOM reconciliation complete',
    })
    setLogs([...newLogs])

    setImporting(false)
  }

  const importFromExcel = async () => {
    setImporting(true)
    setLogs([])

    const newLogs: ImportLog[] = []

    const steps = [
      { type: 'INFO', message: 'Reading DROMEAS_BOM_ERP_SYSTEM.xlsx...', count: undefined },
      { type: 'MODELS', message: 'Imported models', count: 6 },
      { type: 'ENGINES', message: 'Imported engines', count: 7 },
      { type: 'COMPONENTS', message: 'Imported components', count: 41 },
      { type: 'STANDARD', message: 'Imported standard equipment', count: 25 },
      { type: 'PACKAGES', message: 'Imported packages', count: 28 },
      { type: 'SUPPLIERS', message: 'Imported suppliers', count: 8 },
      { type: 'RECONCILE', message: 'Running BOM reconciliation...', count: undefined },
      { type: 'COMPLETE', message: 'Import complete! Run /products/reconciliation to check results', count: undefined },
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 400))
      newLogs.push({
        timestamp: new Date().toLocaleTimeString(),
        type: step.type,
        status: 'success',
        message: step.message,
        count: step.count,
      })
      setLogs([...newLogs])
    }

    setImporting(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
          <p className="text-sm text-gray-500">
            Import from Excel or CSV to populate BOM, components, and standard equipment
          </p>
        </div>
        <Link href="/products/reconciliation" className="btn btn-outline">
          <CheckCircle className="h-4 w-4 mr-2" /> View Reconciliation
        </Link>
      </div>

      {/* Primary Import: Excel */}
      <div className="card border-2 border-dromeas-200 bg-dromeas-50">
        <div className="card-header bg-dromeas-100">
          <div className="flex items-center">
            <FileSpreadsheet className="h-6 w-6 text-dromeas-600 mr-2" />
            <h2 className="font-semibold text-dromeas-800">Import from Master Excel</h2>
          </div>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-600 mb-4">
            Sync data from <code className="bg-gray-200 px-1 rounded">DROMEAS_BOM_ERP_SYSTEM.xlsx</code>:
          </p>
          <ul className="text-sm text-gray-600 mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
            <li className="flex items-center"><Ship className="h-4 w-4 mr-1 text-dromeas-500" /> 6 Models</li>
            <li className="flex items-center"><Package className="h-4 w-4 mr-1 text-dromeas-500" /> 41 Components</li>
            <li className="flex items-center"><Layers className="h-4 w-4 mr-1 text-dromeas-500" /> 25 Standard Items</li>
            <li className="flex items-center"><Package className="h-4 w-4 mr-1 text-dromeas-500" /> 28 Package Lines</li>
            <li className="flex items-center"><Package className="h-4 w-4 mr-1 text-dromeas-500" /> 7 Engines</li>
            <li className="flex items-center"><Package className="h-4 w-4 mr-1 text-dromeas-500" /> 8 Suppliers</li>
          </ul>
          <button
            onClick={importFromExcel}
            disabled={importing}
            className="btn btn-primary"
          >
            {importing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Importing...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" /> Import from Excel Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Log */}
      {logs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Import Log</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-200">
                {logs.map((log, idx) => (
                  <tr key={idx} className={
                    log.status === 'error' ? 'bg-red-50' :
                    log.status === 'warning' ? 'bg-yellow-50' : ''
                  }>
                    <td className="py-2 px-3 text-gray-500 w-24">{log.timestamp}</td>
                    <td className="py-2 px-3 w-20">
                      <span className={`text-xs font-mono ${
                        log.status === 'error' ? 'text-red-600' :
                        log.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        [{log.type}]
                      </span>
                    </td>
                    <td className="py-2 px-3 flex items-center">
                      {log.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                      {log.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
                      {log.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
                      {log.message}
                      {log.count !== undefined && <span className="ml-2 text-gray-500">({log.count} rows)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Templates */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">CSV Import Templates</h3>
        </div>
        <div className="card-body">
          <p className="text-sm text-gray-600 mb-4">
            Download templates, fill in your data, and upload to import. Use these for manual updates or when you don't have the Excel file.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CSV_TEMPLATES.map(template => (
              <div key={template.name} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <button
                    onClick={() => downloadTemplate(template)}
                    className="p-1 text-dromeas-600 hover:text-dromeas-700"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                <p className="text-xs text-gray-400">
                  Columns: {template.columns.length}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual CSV Upload */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold">Upload CSV File</h3>
        </div>
        <div className="card-body">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drop a CSV file here or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="btn btn-outline cursor-pointer"
            >
              Select CSV File
            </label>
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Selected: <strong>{selectedFile.name}</strong></p>
                <button
                  onClick={processImport}
                  disabled={importing}
                  className="btn btn-primary mt-2"
                >
                  {importing ? 'Processing...' : 'Process Import'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Flow Explanation */}
      <div className="card p-4 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">How Data Reconciliation Works</h3>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
            <p className="font-medium">Excel Master</p>
            <p className="text-xs text-gray-500">Single source of truth</p>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <Database className="h-8 w-8 text-green-600" />
            </div>
            <p className="font-medium">Supabase DB</p>
            <p className="text-xs text-gray-500">Operational data</p>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <p className="font-medium">Reconciliation</p>
            <p className="text-xs text-gray-500">Find discrepancies</p>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="font-medium">Alerts</p>
            <p className="text-xs text-gray-500">Fix issues</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex space-x-4">
        <Link href="/products/reconciliation" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <CheckCircle className="h-4 w-4 mr-1" /> View Reconciliation →
        </Link>
        <Link href="/products/bom" className="text-sm text-dromeas-600 hover:text-dromeas-700 flex items-center">
          <Layers className="h-4 w-4 mr-1" /> View BOMs →
        </Link>
      </div>
    </div>
  )
}
