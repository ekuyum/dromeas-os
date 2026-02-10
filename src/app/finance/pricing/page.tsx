'use client'

import { useState } from 'react'
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Percent,
  Ship, Package, Settings, AlertTriangle, ChevronDown, ChevronRight,
  Target, BarChart3, PieChart, Edit2, Save, X, Eye, EyeOff
} from 'lucide-react'

interface PricingData {
  code: string
  name: string
  range: string
  costPrice: number
  retailPrice: number
  stdEngineRetail: number
  category: 'boat' | 'package' | 'option'
}

interface MarginAnalysis {
  grossMargin: number
  grossMarginPct: number
  netMargin: number
  netMarginPct: number
  breakEvenDiscount: number
}

export default function PricingPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [discountPct, setDiscountPct] = useState(0)
  const [dealerMarginPct, setDealerMarginPct] = useState(15)
  const [showCosts, setShowCosts] = useState(true) // Toggle cost visibility
  const [expandedSections, setExpandedSections] = useState<string[]>(['boats'])

  // 2026 Pricing Data - CONFIDENTIAL
  // Cost prices from BOM/ERP, Retail from Price List
  const pricingData: PricingData[] = [
    // Boats (Cost = hull + systems, Retail = turnkey with engine)
    { code: 'D28CC', name: 'D28 Center Console', range: 'D28', costPrice: 68500, retailPrice: 127959, stdEngineRetail: 42000, category: 'boat' },
    { code: 'D28WA', name: 'D28 Walk-Around', range: 'D28', costPrice: 72500, retailPrice: 132959, stdEngineRetail: 42000, category: 'boat' },
    { code: 'D28SUV', name: 'D28 SUV Pilothouse', range: 'D28', costPrice: 78500, retailPrice: 141959, stdEngineRetail: 42000, category: 'boat' },
    { code: 'D33WA', name: 'D33 Walk-Around', range: 'D33', costPrice: 105000, retailPrice: 196921, stdEngineRetail: 68000, category: 'boat' },
    { code: 'D33SUV', name: 'D33 SUV Pilothouse', range: 'D33', costPrice: 115000, retailPrice: 208921, stdEngineRetail: 68000, category: 'boat' },
    { code: 'D38CC', name: 'D38 Center Console', range: 'D38', costPrice: 195000, retailPrice: 385583, stdEngineRetail: 145000, category: 'boat' },
    // Packages
    { code: 'PKG-NAV-D28', name: 'Nav Pack D28', range: 'D28', costPrice: 4200, retailPrice: 8500, stdEngineRetail: 0, category: 'package' },
    { code: 'PKG-NAV-D33', name: 'Nav Pack D33', range: 'D33', costPrice: 7800, retailPrice: 14900, stdEngineRetail: 0, category: 'package' },
    { code: 'PKG-NAV-D38', name: 'Nav Pack D38', range: 'D38', costPrice: 13500, retailPrice: 24500, stdEngineRetail: 0, category: 'package' },
    { code: 'PKG-COMF-D28', name: 'Comfort Pack D28', range: 'D28', costPrice: 3200, retailPrice: 6900, stdEngineRetail: 0, category: 'package' },
    { code: 'PKG-COMF-D33', name: 'Comfort Pack D33', range: 'D33', costPrice: 4800, retailPrice: 9500, stdEngineRetail: 0, category: 'package' },
    { code: 'PKG-COMF-D38', name: 'Comfort Pack D38', range: 'D38', costPrice: 9500, retailPrice: 18500, stdEngineRetail: 0, category: 'package' },
    // Options
    { code: 'DECK-FLEXI-D28', name: 'Flexiteek D28', range: 'D28', costPrice: 4200, retailPrice: 8500, stdEngineRetail: 0, category: 'option' },
    { code: 'DECK-FLEXI-D33', name: 'Flexiteek D33', range: 'D33', costPrice: 6500, retailPrice: 12500, stdEngineRetail: 0, category: 'option' },
    { code: 'DECK-FLEXI-D38', name: 'Flexiteek D38', range: 'D38', costPrice: 9500, retailPrice: 18500, stdEngineRetail: 0, category: 'option' },
    { code: 'COL-CUSTOM', name: 'Custom Hull Color', range: 'ALL', costPrice: 2800, retailPrice: 5500, stdEngineRetail: 0, category: 'option' },
  ]

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value)

  const formatPercent = (value: number) => `${value.toFixed(1)}%`

  const calculateMargin = (item: PricingData, discount: number = 0): MarginAnalysis => {
    const effectiveRetail = item.retailPrice * (1 - discount / 100)
    const totalCost = item.costPrice + item.stdEngineRetail
    const grossMargin = effectiveRetail - totalCost
    const grossMarginPct = totalCost > 0 ? (grossMargin / effectiveRetail) * 100 : 0

    // Net margin (after overhead ~15%)
    const overhead = effectiveRetail * 0.15
    const netMargin = grossMargin - overhead
    const netMarginPct = (netMargin / effectiveRetail) * 100

    // Break-even discount (what discount would make margin = 0)
    const breakEvenDiscount = totalCost > 0 ? ((item.retailPrice - totalCost) / item.retailPrice) * 100 : 0

    return { grossMargin, grossMarginPct, netMargin, netMarginPct, breakEvenDiscount }
  }

  const boats = pricingData.filter(p => p.category === 'boat')
  const packages = pricingData.filter(p => p.category === 'package')
  const options = pricingData.filter(p => p.category === 'option')

  // Calculate totals
  const avgGrossMargin = boats.reduce((acc, b) => acc + calculateMargin(b).grossMarginPct, 0) / boats.length
  const avgNetMargin = boats.reduce((acc, b) => acc + calculateMargin(b).netMarginPct, 0) / boats.length

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }

  const MarginBar = ({ margin, maxMargin = 50 }: { margin: number, maxMargin?: number }) => {
    const width = Math.min(Math.max(margin, 0), maxMargin) / maxMargin * 100
    const color = margin >= 25 ? 'bg-green-500' : margin >= 15 ? 'bg-yellow-500' : margin >= 0 ? 'bg-orange-500' : 'bg-red-500'
    return (
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="h-7 w-7 mr-3 text-dromeas-600" />
            Pricing & Margins
          </h1>
          <p className="text-sm text-gray-500">
            Cost analysis, retail pricing, and margin optimization — CONFIDENTIAL
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCosts(!showCosts)}
            className={`btn ${showCosts ? 'btn-primary' : 'btn-outline'}`}
          >
            {showCosts ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showCosts ? 'Hide Costs' : 'Show Costs'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Gross Margin</p>
              <p className={`text-2xl font-bold ${avgGrossMargin >= 25 ? 'text-green-600' : 'text-yellow-600'}`}>
                {formatPercent(avgGrossMargin)}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${avgGrossMargin >= 25 ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Target: 30%+</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Net Margin</p>
              <p className={`text-2xl font-bold ${avgNetMargin >= 10 ? 'text-green-600' : 'text-orange-600'}`}>
                {formatPercent(avgNetMargin)}
              </p>
            </div>
            <Target className={`h-8 w-8 ${avgNetMargin >= 10 ? 'text-green-500' : 'text-orange-500'}`} />
          </div>
          <p className="text-xs text-gray-400 mt-1">After 15% overhead</p>
        </div>
        <div className="card p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Test Discount</p>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xl font-bold text-gray-700">{discountPct}%</span>
              </div>
            </div>
            <Percent className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Simulate discount impact</p>
        </div>
        <div className="card p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Dealer Margin</p>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="10"
                  max="25"
                  value={dealerMarginPct}
                  onChange={(e) => setDealerMarginPct(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-xl font-bold text-blue-700">{dealerMarginPct}%</span>
              </div>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Dealer discount from retail</p>
        </div>
      </div>

      {/* Warning if discount is high */}
      {discountPct > 15 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">High Discount Warning</p>
            <p className="text-sm text-yellow-700">
              A {discountPct}% discount significantly impacts margins. Some configurations may become unprofitable.
            </p>
          </div>
        </div>
      )}

      {/* Boats Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('boats')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Ship className="h-5 w-5 mr-3 text-dromeas-600" />
            <h2 className="font-semibold text-gray-900">Boat Models</h2>
            <span className="ml-3 text-sm text-gray-500">{boats.length} models</span>
          </div>
          {expandedSections.includes('boats') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        {expandedSections.includes('boats') && (
          <div className="border-t overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  {showCosts && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hull Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Engine Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                  {discountPct > 0 && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">After {discountPct}%</th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross €</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gross %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Margin</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Max Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {boats.map(boat => {
                  const margin = calculateMargin(boat, discountPct)
                  const dealerPrice = boat.retailPrice * (1 - dealerMarginPct / 100)
                  const isHealthy = margin.grossMarginPct >= 20

                  return (
                    <tr key={boat.code} className={`hover:bg-gray-50 ${!isHealthy ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{boat.name}</div>
                        <div className="text-xs text-gray-500">{boat.code}</div>
                      </td>
                      {showCosts && (
                        <>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(boat.costPrice)}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(boat.stdEngineRetail)}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            {formatCurrency(boat.costPrice + boat.stdEngineRetail)}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">{formatCurrency(boat.retailPrice)}</td>
                      {discountPct > 0 && (
                        <td className="px-4 py-3 text-right text-sm text-orange-600">
                          {formatCurrency(boat.retailPrice * (1 - discountPct / 100))}
                        </td>
                      )}
                      <td className={`px-4 py-3 text-right text-sm font-medium ${margin.grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(margin.grossMargin)}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-bold ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercent(margin.grossMarginPct)}
                      </td>
                      <td className="px-4 py-3">
                        <MarginBar margin={margin.grossMarginPct} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">
                        {formatPercent(margin.breakEvenDiscount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Packages Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('packages')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Package className="h-5 w-5 mr-3 text-marine-600" />
            <h2 className="font-semibold text-gray-900">Packages</h2>
            <span className="ml-3 text-sm text-gray-500">{packages.length} packages</span>
          </div>
          {expandedSections.includes('packages') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        {expandedSections.includes('packages') && (
          <div className="border-t overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range</th>
                  {showCosts && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retail</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin €</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {packages.map(pkg => {
                  const margin = calculateMargin(pkg, discountPct)
                  return (
                    <tr key={pkg.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{pkg.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{pkg.range}</td>
                      {showCosts && (
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(pkg.costPrice)}</td>
                      )}
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(pkg.retailPrice)}</td>
                      <td className="px-4 py-3 text-right text-sm text-green-600">{formatCurrency(margin.grossMargin)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600">{formatPercent(margin.grossMarginPct)}</td>
                      <td className="px-4 py-3 text-center">
                        <MarginBar margin={margin.grossMarginPct} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Options Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('options')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-3 text-gray-600" />
            <h2 className="font-semibold text-gray-900">Individual Options</h2>
            <span className="ml-3 text-sm text-gray-500">{options.length} options</span>
          </div>
          {expandedSections.includes('options') ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>

        {expandedSections.includes('options') && (
          <div className="border-t overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Option</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applies To</th>
                  {showCosts && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retail</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {options.map(opt => {
                  const margin = calculateMargin(opt, discountPct)
                  return (
                    <tr key={opt.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{opt.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{opt.range}</td>
                      {showCosts && (
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(opt.costPrice)}</td>
                      )}
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(opt.retailPrice)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-green-600">{formatPercent(margin.grossMarginPct)}</td>
                      <td className="px-4 py-3 text-center">
                        <MarginBar margin={margin.grossMarginPct} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dealer Price Calculator */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Dealer Price Calculator
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          At {dealerMarginPct}% dealer margin, here are the dealer prices (what dealers pay us):
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {boats.map(boat => {
            const dealerPrice = boat.retailPrice * (1 - dealerMarginPct / 100)
            const ourMargin = calculateMargin({ ...boat, retailPrice: dealerPrice }, 0)
            return (
              <div key={boat.code} className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">{boat.code}</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(dealerPrice)}</p>
                <p className="text-xs text-gray-500">Our margin: {formatPercent(ourMargin.grossMarginPct)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className="card p-6 bg-gradient-to-r from-dromeas-50 to-marine-50">
        <h2 className="font-semibold text-gray-900 mb-4">💡 Key Pricing Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Margin Leaders</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• D38CC has the highest absolute margin ({formatCurrency(calculateMargin(boats.find(b => b.code === 'D38CC')!).grossMargin)})</li>
              <li>• Packages maintain ~50% margins - push them</li>
              <li>• Flexiteek options are high-margin add-ons</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Discount Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Never exceed 15% without approval</li>
              <li>• D28 range has tightest margins - max 12%</li>
              <li>• Dealer margin should not exceed 18%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
