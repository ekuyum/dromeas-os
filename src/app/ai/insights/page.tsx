'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { supabase, formatRelativeTime } from '@/lib/supabase'

interface Insight {
  id: string
  insight_type: string
  category: string
  severity: string
  title: string
  summary: string
  details: any
  recommended_actions: any[]
  confidence_score: number | null
  is_dismissed: boolean
  acknowledged_at: string | null
  created_at: string
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    fetchInsights()
  }, [filter])

  const fetchInsights = async () => {
    let query = supabase.from('ai_insights').select('*').order('created_at', { ascending: false })

    if (filter === 'active') {
      query = query.eq('is_dismissed', false)
    } else if (filter === 'acknowledged') {
      query = query.not('acknowledged_at', 'is', null)
    }

    const { data } = await query.limit(50)
    if (data) setInsights(data)
    setLoading(false)
  }

  const acknowledgeInsight = async (id: string) => {
    await (supabase.from('ai_insights') as any).update({ acknowledged_at: new Date().toISOString() }).eq('id', id)
    fetchInsights()
  }

  const dismissInsight = async (id: string) => {
    await (supabase.from('ai_insights') as any).update({ is_dismissed: true }).eq('id', id)
    fetchInsights()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return AlertTriangle
      case 'recommendation': return Lightbulb
      case 'forecast': return TrendingUp
      default: return Clock
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'status-danger'
      case 'warning': return 'status-warning'
      default: return 'status-info'
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading insights...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-sm text-gray-500">Anomalies, recommendations, and forecasts</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {['active', 'acknowledged', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
              filter === f ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {insights.length === 0 ? (
        <div className="card p-12 text-center">
          <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No insights</h3>
          <p className="text-sm text-gray-500">AI insights will appear here as they're generated</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => {
            const Icon = getIcon(insight.insight_type)
            return (
              <div key={insight.id} className={`card border-l-4 ${getSeverityColor(insight.severity)}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        insight.severity === 'critical' ? 'bg-red-100' :
                        insight.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          insight.severity === 'critical' ? 'text-red-600' :
                          insight.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                          <span className={`status-badge ${getSeverityBadge(insight.severity)}`}>{insight.severity}</span>
                          <span className="text-xs text-gray-400 capitalize">{insight.insight_type}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{insight.summary}</p>

                        {insight.recommended_actions && insight.recommended_actions.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 uppercase">Recommended Actions</p>
                            <ul className="mt-1 space-y-1">
                              {(insight.recommended_actions as any[]).map((action, i) => (
                                <li key={i} className="text-sm text-gray-700 flex items-center">
                                  <span className="w-5 h-5 bg-gray-200 rounded-full text-xs flex items-center justify-center mr-2">{i + 1}</span>
                                  {action.action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-400">
                          <span>{formatRelativeTime(insight.created_at)}</span>
                          {insight.confidence_score && (
                            <span>Confidence: {Math.round(insight.confidence_score * 100)}%</span>
                          )}
                          <span className="capitalize">{insight.category}</span>
                        </div>
                      </div>
                    </div>

                    {!insight.is_dismissed && (
                      <div className="flex space-x-1">
                        {!insight.acknowledged_at && (
                          <button
                            onClick={() => acknowledgeInsight(insight.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded"
                            title="Acknowledge"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => dismissInsight(insight.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title="Dismiss"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
