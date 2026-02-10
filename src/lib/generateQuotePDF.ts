'use client'

import { jsPDF } from 'jspdf'

interface QuoteConfig {
  model: {
    code: string
    name: string
    range: string
    lengthM: number
    beamM: number
    basePrice: number
    stdEngine: string
    category: string
  }
  packages: string[]
  options: string[]
  regionalElectrical: string | null
}

interface QuoteData {
  quoteNumber: string
  date: string
  validUntil: string
  customerName?: string
  customerEmail?: string
  customerCompany?: string
  salesPerson?: string
  notes?: string
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
}

interface RegionalOption {
  code: string
  name: string
  price: number
}

// Master data - must match configurator
const packages: PackageOption[] = [
  { code: 'PKG-NAV-D28', name: 'Nav Pack', price: 8500, modelRange: 'D28', contents: ['Axiom+ 12" (upgrade from 9")', 'VHF with AIS', 'Radar HALO20+'] },
  { code: 'PKG-NAV-D33', name: 'Nav Pack', price: 14900, modelRange: 'D33', contents: ['Dual Axiom+ 12"', 'VHF with AIS', 'Radar HALO24', 'Autopilot'] },
  { code: 'PKG-NAV-D38', name: 'Nav Pack', price: 24500, modelRange: 'D38', contents: ['Dual Axiom+ 16"', 'VHF with AIS', 'Radar HALO24', 'Autopilot', 'FLIR camera'] },
  { code: 'PKG-COMF-D28', name: 'Comfort Pack', price: 6900, modelRange: 'D28', contents: ['Webasto diesel heater', 'Hot water system', 'Deck shower', 'Refrigerator'] },
  { code: 'PKG-COMF-D33', name: 'Comfort Pack', price: 9500, modelRange: 'D33', contents: ['Webasto diesel heater', 'Hot water system', 'Deck shower', 'Refrigerator', 'Cockpit table', 'Interior LED ambiance'] },
  { code: 'PKG-COMF-D38', name: 'Comfort Pack', price: 18500, modelRange: 'D38', contents: ['Marine A/C with reverse heat', 'Hot water system', 'Deck shower', 'Ice maker', 'BBQ station', 'Interior LED ambiance'] },
]

const options: IndividualOption[] = [
  { code: 'ENG-350', name: 'Mercury 350hp Verado (from 300hp)', category: 'Engine', price: 8500, applicableTo: ['D28'] },
  { code: 'ENG-2x250', name: '2x Mercury 250hp Verado (from 200hp)', category: 'Engine', price: 12000, applicableTo: ['D33'] },
  { code: 'ENG-2x300', name: '2x Mercury 300hp Verado (from 200hp)', category: 'Engine', price: 22000, applicableTo: ['D33'] },
  { code: 'ENG-2x450R', name: '2x Mercury 450R (from 400hp)', category: 'Engine', price: 28000, applicableTo: ['D38'] },
  { code: 'COL-GREY', name: 'Storm Grey Hull', category: 'Color', price: 3500, applicableTo: ['D28', 'D33', 'D38'] },
  { code: 'COL-BLUE', name: 'Ocean Blue Hull', category: 'Color', price: 3500, applicableTo: ['D28', 'D33', 'D38'] },
  { code: 'COL-RAL', name: 'Custom RAL Color', category: 'Color', price: 5500, applicableTo: ['D28', 'D33', 'D38'] },
  { code: 'ENG-WHITE', name: 'White Engines (per engine)', category: 'Color', price: 1800, applicableTo: ['D28', 'D33', 'D38'] },
  { code: 'DECK-FLEXI-D28', name: 'Flexiteek Synthetic Decking', category: 'Deck', price: 8500, applicableTo: ['D28'] },
  { code: 'DECK-FLEXI-D33', name: 'Flexiteek Synthetic Decking', category: 'Deck', price: 12500, applicableTo: ['D33'] },
  { code: 'DECK-FLEXI-D38', name: 'Flexiteek Synthetic Decking', category: 'Deck', price: 18500, applicableTo: ['D38'] },
  { code: 'DECK-TEAK-D28', name: 'Genuine Teak Deck', category: 'Deck', price: 14500, applicableTo: ['D28'] },
  { code: 'DECK-TEAK-D33', name: 'Genuine Teak Deck', category: 'Deck', price: 22500, applicableTo: ['D33'] },
  { code: 'DECK-TEAK-D38', name: 'Genuine Teak Deck', category: 'Deck', price: 32500, applicableTo: ['D38'] },
  { code: 'COVER-FULL-D28', name: 'Full Canvas Cockpit Enclosure', category: 'Covers', price: 4500, applicableTo: ['D28'] },
  { code: 'COVER-FULL-D33', name: 'Full Canvas Cockpit Enclosure', category: 'Covers', price: 6500, applicableTo: ['D33'] },
  { code: 'COVER-FULL-D38', name: 'Full Canvas Cockpit Enclosure', category: 'Covers', price: 8500, applicableTo: ['D38'] },
  { code: 'COVER-WINTER-D28', name: 'Winter Storage Cover', category: 'Covers', price: 2500, applicableTo: ['D28'] },
  { code: 'COVER-WINTER-D33', name: 'Winter Storage Cover', category: 'Covers', price: 3500, applicableTo: ['D33'] },
  { code: 'COVER-WINTER-D38', name: 'Winter Storage Cover', category: 'Covers', price: 4500, applicableTo: ['D38'] },
]

const regionalOptions: RegionalOption[] = [
  { code: 'REG-EU', name: 'EU (230V/50Hz)', price: 0 },
  { code: 'REG-US', name: 'US/Americas (110V/60Hz)', price: 1000 },
  { code: 'REG-JP', name: 'Japan (100V/50-60Hz)', price: 1200 },
  { code: 'REG-AU', name: 'Australia (240V/50Hz)', price: 800 },
]

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value)
}

export function generateQuotePDF(config: QuoteConfig, quoteData: QuoteData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = margin

  // Colors
  const primaryColor: [number, number, number] = [0, 84, 147] // Dromeas blue
  const grayColor: [number, number, number] = [100, 100, 100]
  const lightGray: [number, number, number] = [200, 200, 200]

  // Helper functions
  const drawLine = (yPos: number) => {
    doc.setDrawColor(...lightGray)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
  }

  const addText = (text: string, x: number, yPos: number, options: {
    fontSize?: number
    fontStyle?: 'normal' | 'bold'
    color?: [number, number, number]
    align?: 'left' | 'center' | 'right'
  } = {}) => {
    const { fontSize = 10, fontStyle = 'normal', color = [0, 0, 0], align = 'left' } = options
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', fontStyle)
    doc.setTextColor(...color)

    let adjustedX = x
    if (align === 'right') {
      adjustedX = pageWidth - margin
    } else if (align === 'center') {
      adjustedX = pageWidth / 2
    }

    doc.text(text, adjustedX, yPos, { align })
  }

  // === HEADER ===
  // Logo text (since we don't have actual logo file)
  addText('DROMEAS', margin, y, { fontSize: 24, fontStyle: 'bold', color: primaryColor })
  addText('YACHTS', margin + 58, y, { fontSize: 24, fontStyle: 'normal', color: primaryColor })

  // Company info (right side)
  addText('Dromeas Yachts International Ltd', 0, y - 6, { fontSize: 8, color: grayColor, align: 'right' })
  addText('London, United Kingdom', 0, y - 2, { fontSize: 8, color: grayColor, align: 'right' })
  addText('info@dromeasyachts.com', 0, y + 2, { fontSize: 8, color: grayColor, align: 'right' })
  addText('www.dromeasyachts.com', 0, y + 6, { fontSize: 8, color: grayColor, align: 'right' })

  y += 15
  drawLine(y)
  y += 10

  // === QUOTE HEADER ===
  addText('QUOTATION', margin, y, { fontSize: 18, fontStyle: 'bold', color: primaryColor })
  y += 8

  // Quote details box
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 25, 2, 2, 'F')

  y += 7
  addText(`Quote #: ${quoteData.quoteNumber}`, margin + 5, y, { fontSize: 10, fontStyle: 'bold' })
  addText(`Date: ${quoteData.date}`, margin + 60, y, { fontSize: 10 })
  addText(`Valid Until: ${quoteData.validUntil}`, margin + 110, y, { fontSize: 10 })

  y += 6
  if (quoteData.customerName) {
    addText(`Customer: ${quoteData.customerName}`, margin + 5, y, { fontSize: 10 })
  }
  if (quoteData.customerCompany) {
    addText(`Company: ${quoteData.customerCompany}`, margin + 80, y, { fontSize: 10 })
  }

  y += 6
  if (quoteData.customerEmail) {
    addText(`Email: ${quoteData.customerEmail}`, margin + 5, y, { fontSize: 10 })
  }
  if (quoteData.salesPerson) {
    addText(`Sales Rep: ${quoteData.salesPerson}`, margin + 80, y, { fontSize: 10 })
  }

  y += 15

  // === MODEL SECTION ===
  addText('VESSEL SPECIFICATION', margin, y, { fontSize: 12, fontStyle: 'bold', color: primaryColor })
  y += 8

  // Model details
  doc.setFillColor(0, 84, 147)
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 20, 2, 2, 'F')

  addText(config.model.name, margin + 5, y + 7, { fontSize: 14, fontStyle: 'bold', color: [255, 255, 255] })
  addText(`${config.model.lengthM}m LOA × ${config.model.beamM}m Beam`, margin + 5, y + 13, { fontSize: 10, color: [200, 220, 255] })
  addText(`Standard: ${config.model.stdEngine}`, margin + 5, y + 18, { fontSize: 9, color: [200, 220, 255] })
  addText(formatCurrency(config.model.basePrice), 0, y + 12, { fontSize: 14, fontStyle: 'bold', color: [255, 255, 255], align: 'right' })

  // Adjust right-aligned price position
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(config.model.basePrice), pageWidth - margin - 5, y + 12, { align: 'right' })

  y += 28

  // Calculate totals
  let packagesTotal = 0
  let optionsTotal = 0
  let regionalTotal = 0

  // === PACKAGES SECTION ===
  if (config.packages.length > 0) {
    addText('PACKAGES', margin, y, { fontSize: 11, fontStyle: 'bold' })
    y += 6

    config.packages.forEach(pkgCode => {
      const pkg = packages.find(p => p.code === pkgCode)
      if (pkg) {
        packagesTotal += pkg.price

        // Package name and price
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text(`• ${pkg.name}`, margin + 3, y)
        doc.text(formatCurrency(pkg.price), pageWidth - margin, y, { align: 'right' })
        y += 4

        // Package contents
        doc.setFontSize(8)
        doc.setTextColor(...grayColor)
        const contentsText = pkg.contents.join(' · ')
        const splitContents = doc.splitTextToSize(contentsText, pageWidth - 2 * margin - 20)
        splitContents.forEach((line: string) => {
          doc.text(`  ${line}`, margin + 6, y)
          y += 3
        })
        y += 3
      }
    })
    y += 3
  }

  // === OPTIONS SECTION ===
  if (config.options.length > 0) {
    addText('OPTIONS', margin, y, { fontSize: 11, fontStyle: 'bold' })
    y += 6

    // Group by category
    const categories = ['Engine', 'Color', 'Deck', 'Covers']
    categories.forEach(category => {
      const categoryOpts = config.options
        .map(code => options.find(o => o.code === code))
        .filter(o => o && o.category === category) as IndividualOption[]

      if (categoryOpts.length > 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...grayColor)
        doc.text(category, margin + 3, y)
        y += 5

        categoryOpts.forEach(opt => {
          optionsTotal += opt.price
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(0, 0, 0)
          doc.text(`• ${opt.name}`, margin + 6, y)
          doc.text(formatCurrency(opt.price), pageWidth - margin, y, { align: 'right' })
          y += 5
        })
        y += 2
      }
    })
    y += 3
  }

  // === REGIONAL ELECTRICAL ===
  if (config.regionalElectrical && config.regionalElectrical !== 'REG-EU') {
    const regional = regionalOptions.find(r => r.code === config.regionalElectrical)
    if (regional) {
      regionalTotal = regional.price
      addText('REGIONAL SPECIFICATION', margin, y, { fontSize: 11, fontStyle: 'bold' })
      y += 6
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(`• ${regional.name}`, margin + 3, y)
      doc.text(formatCurrency(regional.price), pageWidth - margin, y, { align: 'right' })
      y += 8
    }
  }

  // === TOTAL SECTION ===
  y += 5
  drawLine(y)
  y += 8

  const grandTotal = config.model.basePrice + packagesTotal + optionsTotal + regionalTotal

  // Subtotals
  if (packagesTotal > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Packages Subtotal:', pageWidth - margin - 60, y)
    doc.text(formatCurrency(packagesTotal), pageWidth - margin, y, { align: 'right' })
    y += 5
  }
  if (optionsTotal > 0) {
    doc.text('Options Subtotal:', pageWidth - margin - 60, y)
    doc.text(formatCurrency(optionsTotal), pageWidth - margin, y, { align: 'right' })
    y += 5
  }
  if (regionalTotal > 0) {
    doc.text('Regional:', pageWidth - margin - 60, y)
    doc.text(formatCurrency(regionalTotal), pageWidth - margin, y, { align: 'right' })
    y += 5
  }

  y += 3
  drawLine(y)
  y += 8

  // Grand Total
  doc.setFillColor(0, 84, 147)
  doc.roundedRect(pageWidth - margin - 80, y - 5, 80, 15, 2, 2, 'F')

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('TOTAL:', pageWidth - margin - 75, y + 4)
  doc.setFontSize(14)
  doc.text(formatCurrency(grandTotal), pageWidth - margin - 5, y + 4, { align: 'right' })

  y += 20

  // === TERMS & CONDITIONS ===
  addText('TERMS & CONDITIONS', margin, y, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
  y += 6

  const terms = [
    'Prices are Ex-Works Soyaslan Marine, Istanbul, Turkey (or Ex-Works Poland for EU-built boats)',
    'Prices exclude VAT, shipping, commissioning, and registration fees',
    'This quotation is valid for 30 days from the date of issue',
    'Deposit: 30% upon order confirmation, 30% at hull completion, 40% before delivery',
    'Standard delivery: 4-6 months from order confirmation (subject to production schedule)',
    'CE/RCD certification included for all EU-delivered vessels',
    'Two-year structural warranty, equipment warranties per manufacturer terms',
  ]

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)

  terms.forEach(term => {
    const lines = doc.splitTextToSize(`• ${term}`, pageWidth - 2 * margin - 5)
    lines.forEach((line: string) => {
      doc.text(line, margin + 3, y)
      y += 3.5
    })
  })

  // === NOTES ===
  if (quoteData.notes) {
    y += 5
    addText('NOTES', margin, y, { fontSize: 10, fontStyle: 'bold', color: primaryColor })
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    const noteLines = doc.splitTextToSize(quoteData.notes, pageWidth - 2 * margin)
    noteLines.forEach((line: string) => {
      doc.text(line, margin, y)
      y += 4
    })
  }

  // === FOOTER ===
  const footerY = doc.internal.pageSize.getHeight() - 15
  drawLine(footerY - 5)

  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.text('Dromeas Yachts International Ltd | Company No. 12345678 | VAT: GB123456789', pageWidth / 2, footerY, { align: 'center' })
  doc.text('This document is computer generated and valid without signature.', pageWidth / 2, footerY + 4, { align: 'center' })

  // Save the PDF
  const filename = `Dromeas_Quote_${quoteData.quoteNumber}_${config.model.code}.pdf`
  doc.save(filename)
}

// Generate quote number
export function generateQuoteNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `DY${year}${month}-${random}`
}

// Get valid until date (30 days from now)
export function getValidUntilDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Get today's date
export function getTodayDate(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
