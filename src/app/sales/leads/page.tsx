'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  StarOff,
  MoreVertical,
  TrendingUp,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Building2,
  User,
  Globe,
  Tag,
  RefreshCw,
  Thermometer,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Lead {
  id: string
  company_name?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  country: string
  source: string
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  score: number // 0-100
  interested_model?: string
  budget_range?: string
  timeline?: string
  notes?: string
  assigned_to?: string
  created_at: string
  last_contact?: string
  next_follow_up?: string
  is_hot: boolean
  lost_reason?: string
}

export default function LeadManagement() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Sample leads
  const sampleLeads: Lead[] = [
    {
      id: '1',
      company_name: 'Riviera Charters',
      first_name: 'Marco',
      last_name: 'Rossi',
      email: 'marco@rivieracharters.it',
      phone: '+39 347 1234567',
      country: 'Italy',
      source: 'Boot Düsseldorf 2026',
      stage: 'proposal',
      score: 85,
      interested_model: 'DR29',
      budget_range: '€180K-220K',
      timeline: 'Q2 2026',
      assigned_to: 'Efe',
      created_at: '2026-01-18',
      last_contact: '2026-02-03',
      next_follow_up: '2026-02-10',
      is_hot: true,
      notes: 'Charter fleet expansion. Looking for 3 boats over 2 years.',
    },
    {
      id: '2',
      first_name: 'Hans',
      last_name: 'Mueller',
      email: 'hans.mueller@gmail.com',
      phone: '+49 170 9876543',
      country: 'Germany',
      source: 'Website Inquiry',
      stage: 'qualified',
      score: 72,
      interested_model: 'DR29',
      budget_range: '€200K+',
      timeline: 'Summer 2026',
      assigned_to: 'Efe',
      created_at: '2026-01-25',
      last_contact: '2026-02-01',
      next_follow_up: '2026-02-08',
      is_hot: false,
      notes: 'Private buyer. Has experience with Axopar, looking for alternative.',
    },
    {
      id: '3',
      company_name: 'Blue Med Yachts',
      first_name: 'Dimitris',
      last_name: 'Papadopoulos',
      email: 'dimitris@bluemed.gr',
      phone: '+30 694 5551234',
      country: 'Greece',
      source: 'Referral - Stavridis',
      stage: 'negotiation',
      score: 92,
      interested_model: 'DR29',
      budget_range: '€180K',
      timeline: 'Immediate',
      assigned_to: 'Efe',
      created_at: '2026-01-10',
      last_contact: '2026-02-05',
      next_follow_up: '2026-02-07',
      is_hot: true,
      notes: 'Ready to sign. Discussing payment terms.',
    },
    {
      id: '4',
      first_name: 'Jean-Pierre',
      last_name: 'Dubois',
      email: 'jp.dubois@orange.fr',
      phone: '+33 6 12345678',
      country: 'France',
      source: 'Cannes Yachting Festival',
      stage: 'contacted',
      score: 45,
      interested_model: 'D31',
      budget_range: 'Unknown',
      timeline: '2027',
      assigned_to: 'Efe',
      created_at: '2025-09-15',
      last_contact: '2025-11-20',
      is_hot: false,
      notes: 'Interested in larger model. Waiting for D31 launch.',
    },
    {
      id: '5',
      company_name: 'Adriatic Marine',
      first_name: 'Luka',
      last_name: 'Kovacic',
      email: 'luka@adriaticmarine.hr',
      phone: '+385 91 2345678',
      country: 'Croatia',
      source: 'LinkedIn Outreach',
      stage: 'new',
      score: 35,
      interested_model: 'DR29',
      created_at: '2026-02-04',
      is_hot: false,
      notes: 'Potential dealer interest. Need to qualify.',
    },
    {
      id: '6',
      first_name: 'James',
      last_name: 'Wilson',
      email: 'jwilson@outlook.com',
      country: 'UK',
      source: 'Website Inquiry',
      stage: 'lost',
      score: 0,
      interested_model: 'DR29',
      created_at: '2025-12-01',
      last_contact: '2026-01-15',
      is_hot: false,
      lost_reason: 'Purchased competitor (Axopar 28)',
    },
  ]

  const stages = [
    { id: 'new', name: 'New', color: 'bg-gray-100 text-gray-800' },
    { id: 'contacted', name: 'Contacted', color: 'bg-blue-100 text-blue-800' },
    { id: 'qualified', name: 'Qualified', color: 'bg-purple-100 text-purple-800' },
    { id: 'proposal', name: 'Proposal', color: 'bg-amber-100 text-amber-800' },
    { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-100 text-orange-800' },
    { id: 'won', name: 'Won', color: 'bg-green-100 text-green-800' },
    { id: 'lost', name: 'Lost', color: 'bg-red-100 text-red-800' },
  ]

  const sources = [
    'Website Inquiry',
    'Boot Düsseldorf',
    'Cannes Yachting Festival',
    'Miami Boat Show',
    'LinkedIn',
    'Referral',
    'Cold Outreach',
    'Trade Publication',
    'Other',
  ]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // In real implementation, would fetch from database
    setLeads(sampleLeads)
    setLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot'
    if (score >= 60) return 'Warm'
    if (score >= 40) return 'Cool'
    return 'Cold'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesStage = selectedStage === 'all' || lead.stage === selectedStage
    const matchesSearch =
      lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStage && matchesSearch
  })

  // Pipeline metrics
  const pipelineMetrics = {
    total: leads.filter(l => !['won', 'lost'].includes(l.stage)).length,
    hot: leads.filter(l => l.is_hot && !['won', 'lost'].includes(l.stage)).length,
    followUpsDue: leads.filter(l => {
      if (!l.next_follow_up) return false
      return new Date(l.next_follow_up) <= new Date()
    }).length,
    wonThisMonth: leads.filter(l => l.stage === 'won').length,
    conversionRate: Math.round((leads.filter(l => l.stage === 'won').length / leads.length) * 100),
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-7 w-7 mr-3 text-dromeas-600" />
            Lead Management
          </h1>
          <p className="text-sm text-gray-500">
            Track prospects from first contact to closed deal
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{pipelineMetrics.total}</p>
            </div>
            <Target className="h-8 w-8 text-dromeas-500" />
          </div>
        </div>
        <div className="card p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Hot Leads</p>
              <p className="text-2xl font-bold text-red-800">{pipelineMetrics.hot}</p>
            </div>
            <Thermometer className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Follow-ups Due</p>
              <p className="text-2xl font-bold text-yellow-800">{pipelineMetrics.followUpsDue}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Won This Month</p>
              <p className="text-2xl font-bold text-green-800">{pipelineMetrics.wonThisMonth}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{pipelineMetrics.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedStage('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStage === 'all' ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {stages.filter(s => !['won', 'lost'].includes(s.id)).map(stage => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStage === stage.id ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Action</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeads.map(lead => (
                <tr
                  key={lead.id}
                  className={`hover:bg-gray-50 cursor-pointer ${lead.is_hot ? 'bg-red-50/30' : ''}`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {lead.is_hot && <Star className="h-4 w-4 text-amber-500 mr-2 fill-amber-500" />}
                      <div>
                        <p className="font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </p>
                        {lead.company_name && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <Building2 className="h-3 w-3 mr-1" />
                            {lead.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-gray-600 flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        {lead.email}
                      </p>
                      <p className="text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                        {lead.country}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      <Tag className="h-3 w-3 mr-1" />
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{lead.interested_model || '-'}</p>
                      {lead.budget_range && (
                        <p className="text-xs text-gray-500">{lead.budget_range}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      {lead.score}
                      <span className="ml-1 text-[10px]">({getScoreLabel(lead.score)})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                      stages.find(s => s.id === lead.stage)?.color
                    }`}>
                      {stages.find(s => s.id === lead.stage)?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.next_follow_up ? (
                      <div className="text-sm">
                        <p className={`flex items-center ${
                          new Date(lead.next_follow_up) <= new Date() ? 'text-red-600 font-medium' : 'text-gray-600'
                        }`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          {lead.next_follow_up}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <a
                        href={`mailto:${lead.email}`}
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-4 w-4 text-gray-500" />
                      </a>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1 hover:bg-gray-100 rounded"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="h-4 w-4 text-gray-500" />
                        </a>
                      )}
                      <Link
                        href={`/sales/quotes?lead=${lead.id}`}
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight className="h-4 w-4 text-gray-500" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Sidebar */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setSelectedLead(null)}>
          <div
            className="bg-white w-full max-w-lg h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    {selectedLead.is_hot && <Star className="h-5 w-5 text-amber-500 mr-2 fill-amber-500" />}
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedLead.first_name} {selectedLead.last_name}
                    </h2>
                  </div>
                  {selectedLead.company_name && (
                    <p className="text-gray-500">{selectedLead.company_name}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  stages.find(s => s.id === selectedLead.stage)?.color
                }`}>
                  {stages.find(s => s.id === selectedLead.stage)?.name}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <a href={`mailto:${selectedLead.email}`} className="text-dromeas-600 hover:underline">
                      {selectedLead.email}
                    </a>
                  </p>
                  {selectedLead.phone && (
                    <p className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <a href={`tel:${selectedLead.phone}`} className="text-dromeas-600 hover:underline">
                        {selectedLead.phone}
                      </a>
                    </p>
                  )}
                  <p className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    {selectedLead.country}
                  </p>
                </div>
              </div>

              {/* Lead Score */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Lead Score</h3>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mr-4">
                    <div
                      className={`h-4 rounded-full ${
                        selectedLead.score >= 80 ? 'bg-green-500' :
                        selectedLead.score >= 60 ? 'bg-yellow-500' :
                        selectedLead.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedLead.score}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-lg">{selectedLead.score}</span>
                </div>
              </div>

              {/* Interest */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Interest Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Model</p>
                    <p className="font-medium">{selectedLead.interested_model || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Budget</p>
                    <p className="font-medium">{selectedLead.budget_range || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Timeline</p>
                    <p className="font-medium">{selectedLead.timeline || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Source</p>
                    <p className="font-medium">{selectedLead.source}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedLead.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {/* Lost Reason */}
              {selectedLead.lost_reason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Lost Reason</h3>
                  <p className="text-sm text-red-700">{selectedLead.lost_reason}</p>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Created: {selectedLead.created_at}</span>
                  </div>
                  {selectedLead.last_contact && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <span>Last Contact: {selectedLead.last_contact}</span>
                    </div>
                  )}
                  {selectedLead.next_follow_up && (
                    <div className={`flex items-center ${
                      new Date(selectedLead.next_follow_up) <= new Date() ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <Clock className="h-4 w-4 mr-3" />
                      <span>Next Follow-up: {selectedLead.next_follow_up}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t space-y-3">
                <Link
                  href={`/sales/quotes?lead=${selectedLead.id}`}
                  className="btn btn-primary w-full justify-center"
                >
                  Create Quote <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-outline justify-center">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </button>
                  <button className="btn btn-outline justify-center">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </button>
                </div>
                <button className="btn btn-outline w-full justify-center">
                  Log Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
