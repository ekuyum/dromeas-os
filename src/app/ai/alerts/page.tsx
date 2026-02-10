'use client'

import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, X, Clock, Filter, RefreshCw } from 'lucide-react'
import { supabase, formatRelativeTime } from '@/lib/supabase'

interface Alert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  summary: string
  details: any
  is_dismissed: boolean
  acknowledged_at: string | null
  created_at: string
  expires_at: string | null
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  warning: { icon: AlertCircle, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  info: { icon: Info, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ severity: 'all', acknowledged: 'unacknowledged' })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false }) as { data: Alert[] | null }

    if (data) setAlerts(data)
    setLoading(false)
  }

  const acknowledgeAlert = async (id: string) => {
    await (supabase.from('ai_insights') as any).update({ acknowledged_at: new Date().toISOString() }).eq('id', id)
    fetchAlerts()
  }

  const dismissAlert = async (id: string) => {
    await (supabase.from('ai_insights') as any).update({ is_dismissed: true }).eq('id', id)
    fetchAlerts()
  }

  const acknowledgeAll = async () => {
    const unacked = alerts.filter(a => !a.acknowledged_at)
    for (const alert of unacked) {
      await (supabase.from('ai_insights') as any).update({ acknowledged_at: new Date().toISOString() }).eq('id', alert.id)
    }
    fetchAlerts()
  }

  const filteredAlerts = alerts.filter(a => {
    if (filter.severity !== 'all' && a.severity !== filter.severity) return false
    if (filter.acknowledged === 'unacknowledged' && a.acknowledged_at) return false
    if (filter.acknowledged === 'acknowledged' && !a.acknowledged_at) return false
    return true
  })

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.acknowledged_at).length,
    warning: alerts.filter(a => a.severity === 'warning' && !a.acknowledged_at).length,
    info: alerts.filter(a => a.severity === 'info' && !a.acknowledged_at).length,
    unacknowledged: alerts.filter(a => !a.acknowledged_at).length
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading alerts...</div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500">{stats.unacknowledged} unacknowledged alerts</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={fetchAlerts} className="btn btn-secondary">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </button>
          {stats.unacknowledged > 0 && (
            <button onClick={acknowledgeAll} className="btn btn-primary">
              <CheckCircle className="h-4 w-4 mr-2" /> Acknowledge All
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`card p-4 ${stats.critical > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${stats.critical > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600">Critical</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${stats.critical > 0 ? 'text-red-600' : ''}`}>{stats.critical}</p>
        </div>
        <div className={`card p-4 ${stats.warning > 0 ? 'bg-yellow-50 border-yellow-200' : ''}`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className={`h-5 w-5 ${stats.warning > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600">Warning</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${stats.warning > 0 ? 'text-yellow-600' : ''}`}>{stats.warning}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">Info</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.info}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter({...filter, severity: 'all'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.severity === 'all' ? 'bg-dromeas-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All Severities</button>
        <button onClick={() => setFilter({...filter, severity: 'critical'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Critical</button>
        <button onClick={() => setFilter({...filter, severity: 'warning'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.severity === 'warning' ? 'bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Warning</button>
        <button onClick={() => setFilter({...filter, severity: 'info'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.severity === 'info' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Info</button>
        <div className="w-px bg-gray-300 mx-2" />
        <button onClick={() => setFilter({...filter, acknowledged: 'all'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.acknowledged === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</button>
        <button onClick={() => setFilter({...filter, acknowledged: 'unacknowledged'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.acknowledged === 'unacknowledged' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Unacknowledged</button>
        <button onClick={() => setFilter({...filter, acknowledged: 'acknowledged'})} className={`px-3 py-1.5 text-sm rounded-lg ${filter.acknowledged === 'acknowledged' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Acknowledged</button>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="card p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">No alerts matching your filters</p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const config = SEVERITY_CONFIG[alert.severity]
            const Icon = config.icon

            return (
              <div key={alert.id} className={`card p-4 ${config.bg} ${config.border} border ${alert.acknowledged_at ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-5 w-5 mt-0.5 text-${config.color}-500`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${config.text}`}>{alert.title}</h3>
                        {alert.acknowledged_at && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{alert.summary}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatRelativeTime(alert.created_at)}
                        </span>
                        <span className="capitalize">{alert.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!alert.acknowledged_at && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Acknowledge"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Dismiss"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
