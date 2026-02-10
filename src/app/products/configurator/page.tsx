'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Ship,
  Package,
  Palette,
  Navigation,
  Thermometer,
  Zap,
  Globe,
  Check,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Calculator,
  FileText,
  Anchor,
  Save,
} from 'lucide-react'

interface Model {
  code: string
  name: string
  range: string
  lengthM: number
  beamM: number
  basePrice: number
  stdEngine: string
  category: 'CC' | 'WA' | 'SUV'
  image?: string
  description: string
}

interface PackageOption {
  code: string
  name: string
  price: number
  contents: string[]
  modelRange: string
}

interface IndividualOption {
  code: string
  name: string
  category: string
  price: number
  applicableTo: string[]
  description?: string
}

interface Configuration {
  model: Model | null
  packages: string[]
  options: string[]
  regionalElectrical: string | null
}

export default function BoatConfigurator() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<Configuration>({
    model: null,
    packages: [],
    options: [],
    regionalElectrical: null,
  })

  // 2026 Model Data (from Price List)
  const models: Model[] = [
    {
      code: 'D28CC',
      name: 'D28 Center Console',
      range: 'D28',
      lengthM: 8.21,
      beamM: 2.59,
      basePrice: 127959,
      stdEngine: 'Mercury 300hp Verado',
      category: 'CC',
      description: 'Pure fishing and day cruising machine. Open layout, maximum deck space.',
    },
    {
      code: 'D28WA',
      name: 'D28 Walk-Around',
      range: 'D28',
      lengthM: 8.21,
      beamM: 2.59,
      basePrice: 132959,
      stdEngine: 'Mercury 300hp Verado',
      category: 'WA',
      description: 'Walkaround convenience with enclosed cabin. V-berth and head compartment.',
    },
    {
      code: 'D28SUV',
      name: 'D28 SUV Pilothouse',
      range: 'D28',
      lengthM: 8.21,
      beamM: 2.59,
      basePrice: 141959,
      stdEngine: 'Mercury 300hp Verado',
      category: 'SUV',
      description: 'All-weather protection with pilothouse and sliding door. Maximum versatility.',
    },
    {
      code: 'D33WA',
      name: 'D33 Walk-Around',
      range: 'D33',
      lengthM: 10.70,
      beamM: 3.20,
      basePrice: 196921,
      stdEngine: '2x Mercury 200hp Verado',
      category: 'WA',
      description: 'Serious offshore capability. Bow thruster and ZipWake trim standard.',
    },
    {
      code: 'D33SUV',
      name: 'D33 SUV Pilothouse',
      range: 'D33',
      lengthM: 10.70,
      beamM: 3.20,
      basePrice: 208921,
      stdEngine: '2x Mercury 200hp Verado',
      category: 'SUV',
      description: 'Family cruiser with aft cabin. Protected helm and social cockpit.',
    },
    {
      code: 'D38CC',
      name: 'D38 Center Console',
      range: 'D38',
      lengthM: 11.50,
      beamM: 3.40,
      basePrice: 385583,
      stdEngine: '2x Mercury 400hp Verado',
      category: 'CC',
      description: 'Flagship performance. Joystick docking, triple displays, full wetbar.',
    },
  ]

  // Packages (from 2026 Price List)
  const packages: PackageOption[] = [
    {
      code: 'PKG-NAV-D28',
      name: 'Nav Pack',
      price: 8500,
      modelRange: 'D28',
      contents: ['Axiom+ 12" (upgrade from 9")', 'VHF with AIS', 'Radar HALO20+'],
    },
    {
      code: 'PKG-NAV-D33',
      name: 'Nav Pack',
      price: 14900,
      modelRange: 'D33',
      contents: ['Dual Axiom+ 12"', 'VHF with AIS', 'Radar HALO24', 'Autopilot'],
    },
    {
      code: 'PKG-NAV-D38',
      name: 'Nav Pack',
      price: 24500,
      modelRange: 'D38',
      contents: ['Dual Axiom+ 16"', 'VHF with AIS', 'Radar HALO24', 'Autopilot', 'FLIR camera'],
    },
    {
      code: 'PKG-COMF-D28',
      name: 'Comfort Pack',
      price: 6900,
      modelRange: 'D28',
      contents: ['Webasto diesel heater', 'Hot water system', 'Deck shower', 'Refrigerator'],
    },
    {
      code: 'PKG-COMF-D33',
      name: 'Comfort Pack',
      price: 9500,
      modelRange: 'D33',
      contents: ['Webasto diesel heater', 'Hot water system', 'Deck shower', 'Refrigerator', 'Cockpit table', 'Interior LED ambiance'],
    },
    {
      code: 'PKG-COMF-D38',
      name: 'Comfort Pack',
      price: 18500,
      modelRange: 'D38',
      contents: ['Marine A/C with reverse heat', 'Hot water system', 'Deck shower', 'Ice maker', 'BBQ station', 'Interior LED ambiance'],
    },
  ]

  // Individual Options (from 2026 Price List)
  const options: IndividualOption[] = [
    // Engine Upgrades
    { code: 'ENG-350', name: 'Mercury 350hp Verado (from 300hp)', category: 'Engine', price: 8500, applicableTo: ['D28'] },
    { code: 'ENG-2x250', name: '2x Mercury 250hp Verado (from 200hp)', category: 'Engine', price: 12000, applicableTo: ['D33'] },
    { code: 'ENG-2x300', name: '2x Mercury 300hp Verado (from 200hp)', category: 'Engine', price: 22000, applicableTo: ['D33'] },
    { code: 'ENG-2x450R', name: '2x Mercury 450R (from 400hp)', category: 'Engine', price: 28000, applicableTo: ['D38'] },
    // Colors
    { code: 'COL-GREY', name: 'Storm Grey Hull', category: 'Color', price: 3500, applicableTo: ['D28', 'D33', 'D38'] },
    { code: 'COL-BLUE', name: 'Ocean Blue Hull', category: 'Color', price: 3500, applicableTo: ['D28', 'D33', 'D38'] },
    { code: 'COL-RAL', name: 'Custom RAL Color', category: 'Color', price: 5500, applicableTo: ['D28', 'D33', 'D38'] },
    { code: 'ENG-WHITE', name: 'White Engines (per engine)', category: 'Color', price: 1800, applicableTo: ['D28', 'D33', 'D38'], description: 'Price per engine' },
    // Deck
    { code: 'DECK-FLEXI-D28', name: 'Flexiteek Synthetic Decking', category: 'Deck', price: 8500, applicableTo: ['D28'] },
    { code: 'DECK-FLEXI-D33', name: 'Flexiteek Synthetic Decking', category: 'Deck', price: 12500, applicableTo: ['D33'] },
    { code: 'DECK-FLEXI-D38', name: 'Flexiteek Synthetic Decking', category: 'Deck', price: 18500, applicableTo: ['D38'] },
    { code: 'DECK-TEAK-D28', name: 'Genuine Teak Deck', category: 'Deck', price: 14500, applicableTo: ['D28'] },
    { code: 'DECK-TEAK-D33', name: 'Genuine Teak Deck', category: 'Deck', price: 22500, applicableTo: ['D33'] },
    { code: 'DECK-TEAK-D38', name: 'Genuine Teak Deck', category: 'Deck', price: 32500, applicableTo: ['D38'] },
    // Covers
    { code: 'COVER-FULL-D28', name: 'Full Canvas Cockpit Enclosure', category: 'Covers', price: 4500, applicableTo: ['D28'] },
    { code: 'COVER-FULL-D33', name: 'Full Canvas Cockpit Enclosure', category: 'Covers', price: 6500, applicableTo: ['D33'] },
    { code: 'COVER-FULL-D38', name: 'Full Canvas Cockpit Enclosure', category: 'Covers', price: 8500, applicableTo: ['D38'] },
    { code: 'COVER-WINTER-D28', name: 'Winter Storage Cover', category: 'Covers', price: 2500, applicableTo: ['D28'] },
    { code: 'COVER-WINTER-D33', name: 'Winter Storage Cover', category: 'Covers', price: 3500, applicableTo: ['D33'] },
    { code: 'COVER-WINTER-D38', name: 'Winter Storage Cover', category: 'Covers', price: 4500, applicableTo: ['D38'] },
  ]

  // Regional Electrical
  const regionalOptions = [
    { code: 'REG-EU', name: 'EU (230V/50Hz)', price: 0, description: 'Standard - included' },
    { code: 'REG-US', name: 'US/Americas (110V/60Hz)', price: 1000, description: 'US-spec outlets, shore power' },
    { code: 'REG-JP', name: 'Japan (100V/50-60Hz)', price: 1200, description: 'Japan-spec outlets' },
    { code: 'REG-AU', name: 'Australia (240V/50Hz)', price: 800, description: 'AU outlets and shore power' },
  ]

  // Calculate total
  const calculateTotal = () => {
    let total = config.model?.basePrice || 0

    // Add packages
    config.packages.forEach(pkgCode => {
      const pkg = packages.find(p => p.code === pkgCode)
      if (pkg) total += pkg.price
    })

    // Add options
    config.options.forEach(optCode => {
      const opt = options.find(o => o.code === optCode)
      if (opt) total += opt.price
    })

    // Add regional
    if (config.regionalElectrical) {
      const reg = regionalOptions.find(r => r.code === config.regionalElectrical)
      if (reg) total += reg.price
    }

    return total
  }

  const getApplicablePackages = () => {
    if (!config.model) return []
    return packages.filter(p => p.modelRange === config.model!.range)
  }

  const getApplicableOptions = () => {
    if (!config.model) return []
    return options.filter(o => o.applicableTo.includes(config.model!.range))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value)
  }

  const togglePackage = (code: string) => {
    setConfig(prev => ({
      ...prev,
      packages: prev.packages.includes(code)
        ? prev.packages.filter(p => p !== code)
        : [...prev.packages, code]
    }))
  }

  const toggleOption = (code: string) => {
    setConfig(prev => ({
      ...prev,
      options: prev.options.includes(code)
        ? prev.options.filter(o => o !== code)
        : [...prev.options, code]
    }))
  }

  const resetConfig = () => {
    setConfig({ model: null, packages: [], options: [], regionalElectrical: null })
    setStep(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Ship className="h-7 w-7 mr-3 text-dromeas-600" />
            Boat Configurator
          </h1>
          <p className="text-sm text-gray-500">
            Build your perfect Dromeas - Tesla-style pricing, no hidden costs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={resetConfig} className="btn btn-outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </button>
          {config.model && (
            <Link href={`/sales/quotes?config=${encodeURIComponent(JSON.stringify(config))}`} className="btn btn-primary">
              <FileText className="h-4 w-4 mr-2" /> Create Quote
            </Link>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[
          { num: 1, label: 'Model' },
          { num: 2, label: 'Packages' },
          { num: 3, label: 'Options' },
          { num: 4, label: 'Summary' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => config.model && setStep(s.num)}
              disabled={!config.model && s.num > 1}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                step === s.num
                  ? 'bg-dromeas-600 text-white'
                  : step > s.num
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step > s.num ? <Check className="h-5 w-5" /> : s.num}
            </button>
            <span className={`ml-2 text-sm font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
              {s.label}
            </span>
            {i < 3 && <ChevronRight className="h-5 w-5 text-gray-300 mx-4" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Model Selection */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Model</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {models.map(model => (
                  <div
                    key={model.code}
                    onClick={() => {
                      setConfig({ model, packages: [], options: [], regionalElectrical: 'REG-EU' })
                      setStep(2)
                    }}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                      config.model?.code === model.code
                        ? 'border-dromeas-500 bg-dromeas-50'
                        : 'border-gray-200 hover:border-dromeas-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-500">{model.lengthM}m × {model.beamM}m</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        model.category === 'CC' ? 'bg-blue-100 text-blue-800' :
                        model.category === 'WA' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {model.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">{model.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="font-medium">Standard:</span> {model.stdEngine}
                    </div>
                    <div className="text-xl font-bold text-dromeas-600">
                      {formatCurrency(model.basePrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Packages */}
          {step === 2 && config.model && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Packages</h2>
              <p className="text-sm text-gray-500 mb-4">Optional packages to enhance your {config.model.name}</p>
              <div className="space-y-4">
                {getApplicablePackages().map(pkg => (
                  <div
                    key={pkg.code}
                    onClick={() => togglePackage(pkg.code)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      config.packages.includes(pkg.code)
                        ? 'border-dromeas-500 bg-dromeas-50'
                        : 'border-gray-200 hover:border-dromeas-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg mr-4 ${
                          pkg.name.includes('Nav') ? 'bg-blue-100' : 'bg-orange-100'
                        }`}>
                          {pkg.name.includes('Nav') ? (
                            <Navigation className={`h-6 w-6 ${pkg.name.includes('Nav') ? 'text-blue-600' : 'text-orange-600'}`} />
                          ) : (
                            <Thermometer className="h-6 w-6 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                          <ul className="mt-2 space-y-1">
                            {pkg.contents.map((item, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-center">
                                <Check className="h-3 w-3 text-green-500 mr-2" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">+{formatCurrency(pkg.price)}</div>
                        {config.packages.includes(pkg.code) && (
                          <span className="text-xs text-green-600 font-medium">Selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="btn btn-outline">Back</button>
                <button onClick={() => setStep(3)} className="btn btn-primary">
                  Continue <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Individual Options */}
          {step === 3 && config.model && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Individual Options</h2>

              {/* Group by category */}
              {['Engine', 'Color', 'Deck', 'Covers'].map(category => {
                const categoryOptions = getApplicableOptions().filter(o => o.category === category)
                if (categoryOptions.length === 0) return null

                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                      {category === 'Engine' && <Zap className="h-4 w-4 mr-2" />}
                      {category === 'Color' && <Palette className="h-4 w-4 mr-2" />}
                      {category === 'Deck' && <Anchor className="h-4 w-4 mr-2" />}
                      {category === 'Covers' && <Package className="h-4 w-4 mr-2" />}
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryOptions.map(opt => (
                        <div
                          key={opt.code}
                          onClick={() => toggleOption(opt.code)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            config.options.includes(opt.code)
                              ? 'border-dromeas-500 bg-dromeas-50'
                              : 'border-gray-200 hover:border-dromeas-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{opt.name}</p>
                              {opt.description && (
                                <p className="text-xs text-gray-500">{opt.description}</p>
                              )}
                            </div>
                            <span className="font-semibold text-gray-700">+{formatCurrency(opt.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Regional Electrical */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Regional Electrical
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {regionalOptions.map(reg => (
                    <div
                      key={reg.code}
                      onClick={() => setConfig(prev => ({ ...prev, regionalElectrical: reg.code }))}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                        config.regionalElectrical === reg.code
                          ? 'border-dromeas-500 bg-dromeas-50'
                          : 'border-gray-200 hover:border-dromeas-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{reg.name}</p>
                      <p className="text-xs text-gray-500">{reg.price === 0 ? 'Included' : `+${formatCurrency(reg.price)}`}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(2)} className="btn btn-outline">Back</button>
                <button onClick={() => setStep(4)} className="btn btn-primary">
                  Review Summary <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && config.model && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{config.model.name}</h3>
                    <p className="text-sm text-gray-500">{config.model.lengthM}m × {config.model.beamM}m · {config.model.stdEngine}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatCurrency(config.model.basePrice)}</p>
                  </div>
                </div>

                {/* Packages */}
                {config.packages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Packages</h4>
                    {config.packages.map(pkgCode => {
                      const pkg = packages.find(p => p.code === pkgCode)
                      return pkg ? (
                        <div key={pkgCode} className="flex justify-between text-sm py-1">
                          <span>{pkg.name}</span>
                          <span className="font-medium">+{formatCurrency(pkg.price)}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {/* Options */}
                {config.options.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
                    {config.options.map(optCode => {
                      const opt = options.find(o => o.code === optCode)
                      return opt ? (
                        <div key={optCode} className="flex justify-between text-sm py-1">
                          <span>{opt.name}</span>
                          <span className="font-medium">+{formatCurrency(opt.price)}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                )}

                {/* Regional */}
                {config.regionalElectrical && config.regionalElectrical !== 'REG-EU' && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Regional</h4>
                    <div className="flex justify-between text-sm py-1">
                      <span>{regionalOptions.find(r => r.code === config.regionalElectrical)?.name}</span>
                      <span className="font-medium">+{formatCurrency(regionalOptions.find(r => r.code === config.regionalElectrical)?.price || 0)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(3)} className="btn btn-outline">Back</button>
                <Link href="/sales/quotes" className="btn btn-primary">
                  <FileText className="h-4 w-4 mr-2" /> Create Quote
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Running Total */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Configuration</h3>

            {config.model ? (
              <>
                <div className="mb-4">
                  <p className="font-medium text-gray-900">{config.model.name}</p>
                  <p className="text-sm text-gray-500">{config.model.stdEngine}</p>
                </div>

                {config.packages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase">Packages</p>
                    {config.packages.map(pkgCode => {
                      const pkg = packages.find(p => p.code === pkgCode)
                      return pkg ? (
                        <p key={pkgCode} className="text-sm text-gray-700">+ {pkg.name}</p>
                      ) : null
                    })}
                  </div>
                )}

                {config.options.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase">Options</p>
                    {config.options.map(optCode => {
                      const opt = options.find(o => o.code === optCode)
                      return opt ? (
                        <p key={optCode} className="text-sm text-gray-700">+ {opt.name}</p>
                      ) : null
                    })}
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-dromeas-600">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ex-Works Greece, Ex-VAT</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Ship className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a model to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
