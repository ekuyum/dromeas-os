'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FileText,
  Download,
  Send,
  Ship,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Check,
  Package,
  Settings,
  Globe,
} from 'lucide-react'
import { generateQuotePDF, generateQuoteNumber, getTodayDate, getValidUntilDate } from '@/lib/generateQuotePDF'

interface Model {
  code: string
  name: string
  range: string
  lengthM: number
  beamM: number
  basePrice: number
  stdEngine: string
  category: string
}

interface PackageOption {
  code: string
  name: string
  price: number
  modelRange: string
}

interface IndividualOption {
  code: string
  name: string
  category: string
  price: number
}

interface RegionalOption {
  code: string
  name: string
  price: number
}

interface Configuration {
  model: Model | null
  packages: string[]
  options: string[]
  regionalElectrical: string | null
}

// Data (must match configurator)
const models: Model[] = [
  { code: 'D28CC', name: 'D28 Center Console', range: 'D28', lengthM: 8.21, beamM: 2.59, basePrice: 127959, stdEngine: 'Mercury 300hp Verado', category: 'CC' },
  { code: 'D28WA', name: 'D28 Walk-Around', range: 'D28', lengthM: 8.21, beamM: 2.59, basePrice: 132959, stdEngine: 'Mercury 300hp Verado', category: 'WA' },
  { code: 'D28SUV', name: 'D28 SUV Pilothouse', range: 'D28', lengthM: 8.21, beamM: 2.59, basePrice: 141959, stdEngine: 'Mercury 300hp Verado', category: 'SUV' },
  { code: 'D33WA', name: 'D33 Walk-Around', range: 'D33', lengthM: 10.70, beamM: 3.20, basePrice: 196921, stdEngine: '2x Mercury 200hp Verado', category: 'WA' },
  { code: 'D33SUV', name: 'D33 SUV Pilothouse', range: 'D33', lengthM: 10.70, beamM: 3.20, basePrice: 208921, stdEngine: '2x Mercury 200hp Verado', category: 'SUV' },
  { code: 'D38CC', name: 'D38 Center Console', range: 'D38', lengthM: 11.50, beamM: 3.40, basePrice: 385583, stdEngine: '2x Mercury 400hp Verado', category: 'CC' },
]

const packages: PackageOption[] = [
  { code: 'PKG-NAV-D28', name: 'Nav Pack', price: 8500, modelRange: 'D28' },
  { code: 'PKG-NAV-D33', name: 'Nav Pack', price: 14900, modelRange: 'D33' },
  { code: 'PKG-NAV-D38', name: 'Nav Pack', price: 24500, modelRange: 'D38' },
  { code: 'PKG-COMF-D28', name: 'Comfort Pack', price: 6900, modelRange: 'D28' },
  { code: 'PKG-COMF-D33', name: 'Comfort Pack', price: 9500, modelRange: 'D33' },
  { code: 'PKG-COMF-D38', name: 'Comfort Pack', price: 18500, modelRange: 'D38' },
]

const options: IndividualOption[] = [
  { code: 'ENG-350', name: 'Mercury 350hp Verado', category: 'Engine', price: 8500 },
  { code: 'ENG-2x250', name: '2x Mercury 250hp Verado', category: 'Engine', price: 12000 },
  { code: 'ENG-2x300', name: '2x Mercury 300hp Verado', category: 'Engine', price: 22000 },
  { code: 'ENG-2x450R', name: '2x Mercury 450R', category: 'Engine', price: 28000 },
  { code: 'COL-GREY', name: 'Storm Grey Hull', category: 'Color', price: 3500 },
  { code: 'COL-BLUE', name: 'Ocean Blue Hull', category: 'Color', price: 3500 },
  { code: 'COL-RAL', name: 'Custom RAL Color', category: 'Color', price: 5500 },
  { code: 'ENG-WHITE', name: 'White Engines', category: 'Color', price: 1800 },
  { code: 'DECK-FLEXI-D28', name: 'Flexiteek Synthetic', category: 'Deck', price: 8500 },
  { code: 'DECK-FLEXI-D33', name: 'Flexiteek Synthetic', category: 'Deck', price: 12500 },
  { code: 'DECK-FLEXI-D38', name: 'Flexiteek Synthetic', category: 'Deck', price: 18500 },
  { code: 'DECK-TEAK-D28', name: 'Genuine Teak', category: 'Deck', price: 14500 },
  { code: 'DECK-TEAK-D33', name: 'Genuine Teak', category: 'Deck', price: 22500 },
  { code: 'DECK-TEAK-D38', name: 'Genuine Teak', category: 'Deck', price: 32500 },
  { code: 'COVER-FULL-D28', name: 'Full Canvas Enclosure', category: 'Covers', price: 4500 },
  { code: 'COVER-FULL-D33', name: 'Full Canvas Enclosure', category: 'Covers', price: 6500 },
  { code: 'COVER-FULL-D38', name: 'Full Canvas Enclosure', category: 'Covers', price: 8500 },
  { code: 'COVER-WINTER-D28', name: 'Winter Storage Cover', category: 'Covers', price: 2500 },
  { code: 'COVER-WINTER-D33', name: 'Winter Storage Cover', category: 'Covers', price: 3500 },
  { code: 'COVER-WINTER-D38', name: 'Winter Storage Cover', category: 'Covers', price: 4500 },
]

const regionalOptions: RegionalOption[] = [
  { code: 'REG-EU', name: 'EU (230V/50Hz)', price: 0 },
  { code: 'REG-US', name: 'US/Americas (110V/60Hz)', price: 1000 },
  { code: 'REG-JP', name: 'Japan (100V/50-60Hz)', price: 1200 },
  { code: 'REG-AU', name: 'Australia (240V/50Hz)', price: 800 },
]

export default function NewQuotePage() {
  const searchParams = useSearchParams()

  const [config, setConfig] = useState<Configuration>({
    model: null,
    packages: [],
    options: [],
    regionalElectrical: 'REG-EU',
  })

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: '',
  })

  const [notes, setNotes] = useState('')
  const [quoteNumber] = useState(generateQuoteNumber())
  const [pdfGenerated, setPdfGenerated] = useState(false)

  // Parse config from URL if coming from configurator
  useEffect(() => {
    const configParam = searchParams.get('config')
    if (configParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(configParam))
        setConfig(parsed)
      } catch {
        console.error('Failed to parse config from URL')
      }
    }
  }, [searchParams])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value)
  }

  const calculateTotal = () => {
    let total = config.model?.basePrice || 0

    config.packages.forEach(pkgCode => {
      const pkg = packages.find(p => p.code === pkgCode)
      if (pkg) total += pkg.price
    })

    config.options.forEach(optCode => {
      const opt = options.find(o => o.code === optCode)
      if (opt) total += opt.price
    })

    if (config.regionalElectrical) {
      const reg = regionalOptions.find(r => r.code === config.regionalElectrical)
      if (reg) total += reg.price
    }

    return total
  }

  const handleGeneratePDF = () => {
    if (!config.model) {
      alert('Please select a model first')
      return
    }

    generateQuotePDF(config as { model: Model; packages: string[]; options: string[]; regionalElectrical: string | null }, {
      quoteNumber,
      date: getTodayDate(),
      validUntil: getValidUntilDate(),
      customerName: customerInfo.name || undefined,
      customerEmail: customerInfo.email || undefined,
      customerCompany: customerInfo.company || undefined,
      salesPerson: 'Efe Kuyumcu',
      notes: notes || undefined,
    })

    setPdfGenerated(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/sales/quotes" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-dromeas-600" />
              New Quote
            </h1>
            <p className="text-sm text-gray-500">Quote #{quoteNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/products/configurator" className="btn btn-outline">
            <Ship className="h-4 w-4 mr-2" /> Open Configurator
          </Link>
          <button
            onClick={handleGeneratePDF}
            disabled={!config.model}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" /> Generate PDF
          </button>
        </div>
      </div>

      {pdfGenerated && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <p className="font-medium text-green-800">PDF Generated Successfully!</p>
            <p className="text-sm text-green-600">Check your downloads folder for Dromeas_Quote_{quoteNumber}_{config.model?.code}.pdf</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Model Selection */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Ship className="h-5 w-5 mr-2 text-dromeas-600" />
              Select Model
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {models.map(model => (
                <div
                  key={model.code}
                  onClick={() => setConfig(prev => ({ ...prev, model, packages: [], options: [] }))}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    config.model?.code === model.code
                      ? 'border-dromeas-500 bg-dromeas-50'
                      : 'border-gray-200 hover:border-dromeas-300'
                  }`}
                >
                  <p className="font-semibold text-sm">{model.name}</p>
                  <p className="text-xs text-gray-500">{model.lengthM}m</p>
                  <p className="text-sm font-bold text-dromeas-600 mt-1">{formatCurrency(model.basePrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Packages */}
          {config.model && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-dromeas-600" />
                Packages
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {packages.filter(p => p.modelRange === config.model?.range).map(pkg => (
                  <div
                    key={pkg.code}
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        packages: prev.packages.includes(pkg.code)
                          ? prev.packages.filter(p => p !== pkg.code)
                          : [...prev.packages, pkg.code]
                      }))
                    }}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      config.packages.includes(pkg.code)
                        ? 'border-dromeas-500 bg-dromeas-50'
                        : 'border-gray-200 hover:border-dromeas-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{pkg.name}</p>
                      {config.packages.includes(pkg.code) && <Check className="h-4 w-4 text-dromeas-600" />}
                    </div>
                    <p className="text-sm text-dromeas-600 font-semibold">+{formatCurrency(pkg.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          {config.model && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-dromeas-600" />
                Options
              </h2>
              {['Engine', 'Color', 'Deck', 'Covers'].map(category => {
                const categoryOpts = options.filter(o =>
                  o.category === category &&
                  (o.code.includes(config.model!.range) || !o.code.includes('D'))
                )
                if (categoryOpts.length === 0) return null

                return (
                  <div key={category} className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryOpts.map(opt => (
                        <div
                          key={opt.code}
                          onClick={() => {
                            setConfig(prev => ({
                              ...prev,
                              options: prev.options.includes(opt.code)
                                ? prev.options.filter(o => o !== opt.code)
                                : [...prev.options, opt.code]
                            }))
                          }}
                          className={`p-2 border rounded-lg cursor-pointer text-sm ${
                            config.options.includes(opt.code)
                              ? 'border-dromeas-500 bg-dromeas-50'
                              : 'border-gray-200 hover:border-dromeas-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt.name}</span>
                            <span className="font-medium">+{formatCurrency(opt.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Regional */}
          {config.model && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-dromeas-600" />
                Regional Specification
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {regionalOptions.map(reg => (
                  <div
                    key={reg.code}
                    onClick={() => setConfig(prev => ({ ...prev, regionalElectrical: reg.code }))}
                    className={`p-2 border rounded-lg cursor-pointer text-center text-sm ${
                      config.regionalElectrical === reg.code
                        ? 'border-dromeas-500 bg-dromeas-50'
                        : 'border-gray-200 hover:border-dromeas-300'
                    }`}
                  >
                    <p className="font-medium">{reg.name}</p>
                    <p className="text-xs text-gray-500">{reg.price === 0 ? 'Included' : `+${formatCurrency(reg.price)}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-dromeas-600" />
              Customer Information (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" /> Full Name
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dromeas-500"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="h-4 w-4 inline mr-1" /> Company
                </label>
                <input
                  type="text"
                  value={customerInfo.company}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dromeas-500"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dromeas-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" /> Country
                </label>
                <input
                  type="text"
                  value={customerInfo.country}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dromeas-500"
                  placeholder="United Kingdom"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dromeas-500"
                placeholder="Any special requirements or notes..."
              />
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quote Summary</h3>

            {config.model ? (
              <>
                <div className="mb-4 pb-4 border-b">
                  <p className="font-bold text-lg">{config.model.name}</p>
                  <p className="text-sm text-gray-500">{config.model.stdEngine}</p>
                  <p className="text-lg font-semibold text-gray-700 mt-1">{formatCurrency(config.model.basePrice)}</p>
                </div>

                {config.packages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Packages</p>
                    {config.packages.map(code => {
                      const pkg = packages.find(p => p.code === code)
                      return pkg ? (
                        <div key={code} className="flex justify-between text-sm py-1">
                          <span>{pkg.name}</span>
                          <span>+{formatCurrency(pkg.price)}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {config.options.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Options</p>
                    {config.options.map(code => {
                      const opt = options.find(o => o.code === code)
                      return opt ? (
                        <div key={code} className="flex justify-between text-sm py-1">
                          <span>{opt.name}</span>
                          <span>+{formatCurrency(opt.price)}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {config.regionalElectrical && config.regionalElectrical !== 'REG-EU' && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Regional</p>
                    <div className="flex justify-between text-sm py-1">
                      <span>{regionalOptions.find(r => r.code === config.regionalElectrical)?.name}</span>
                      <span>+{formatCurrency(regionalOptions.find(r => r.code === config.regionalElectrical)?.price || 0)}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-dromeas-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ex-Works, Ex-VAT</p>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleGeneratePDF}
                    className="w-full btn btn-primary"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download PDF Quote
                  </button>
                  <button className="w-full btn btn-outline">
                    <Send className="h-4 w-4 mr-2" /> Email to Customer
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Ship className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a model to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
