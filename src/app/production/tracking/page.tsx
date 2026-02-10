'use client'

import { useEffect, useState } from 'react'
import { Factory, AlertTriangle, CheckCircle, Clock, PlayCircle } from 'lucide-react'
import { supabase, formatDate, formatCurrency } from '@/lib/supabase'

interface ProductionOrder {
  id: string
  order_number: string
  target_delivery_date: string | null
  total_eur: number
  models: { name: string } | null
  customers: { company_name: string | null; first_name: string | null; last_name: string | null } | null
  boats: { hull_number: string } | null
  stages: {
    stage_name: string
    stage_sequence: number
    status: string
    actual_start_date: string | null
    actual_end_date: string | null
  }[]
}

const STAGES = [
  { code: 'HULL_LAYUP', name: 'Hull Layup', seq: 1 },
  { code: 'HULL_CURE', name: 'Hull Cure', seq: 2 },
  { code: 'DECK_INSTALL', name: 'Deck', seq: 3 },
  { code: 'ENGINE_INSTALL', name: 'Engine', seq: 4 },
  { code: 'ELECTRICAL', name: 'Electrical', seq: 5 },
  { code: 'INTERIOR', name: 'Interior', seq: 6 },
  { code: 'RIGGING', name: 'Rigging', seq: 7 },
  { code: 'QC', name: 'QC', seq: 8 },
  { code: 'SEA_TRIAL', name: 'Sea Trial', seq: 9 },
  { code: 'READY', name: 'Ready', seq: 10 },
]

export default function ProductionTrackingPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduction()
  }, [])

  const fetchProduction = async () => {
    // Get orders in production
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id, order_number, target_delivery_date, total_eur,
        models (name),
        customers (company_name, first_name, last_name),
        boats (hull_number)
      `)
      .in('status', ['deposit_received', 'in_production'])
      .order('target_delivery_date', { ascending: true })

    if (ordersData) {
      // Get production stages for each order
      const ordersWithStages = await Promise.all((ordersData as any[]).map(async (order: any) => {
        const { data: stagesData } = await supabase
          .from('order_production')
          .select(`
            status, actual_start_date, actual_end_date,
            production_stages (name, sequence)
          `)
          .eq('order_id', order.id)
          .order('production_stages(sequence)', { ascending: true }) as { data: any[] | null }

        return {
          ...order,
          stages: stagesData?.map((s: any) => ({
            stage_name: s.production_stages?.name,
            stage_sequence: s.production_stages?.sequence,
            status: s.status,
            actual_start_date: s.actual_start_date,
            actual_end_date: s.actual_end_date
          })) || []
        }
      }))

      setOrders(ordersWithStages)
    }
    setLoading(false)
  }

  const getCustomerName = (order: any) => {
    if (order.customers?.company_name) return order.customers.company_name
    return `${order.customers?.first_name || ''} ${order.customers?.last_name || ''}`.trim()
  }

  const getCurrentStage = (order: any) => {
    const inProgress = order.stages?.find((s: any) => s.status === 'in_progress')
    return inProgress?.stage_name || 'Not Started'
  }

  const getStageStatus = (order: any, seq: number) => {
    const stage = order.stages?.find((s: any) => s.stage_sequence === seq)
    return stage?.status || 'not_started'
  }

  const getDaysToDelivery = (date: string | null) => {
    if (!date) return null
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading production board...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Board</h1>
          <p className="text-sm text-gray-500">{orders.length} boats in production</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">Order</th>
              {STAGES.map(stage => (
                <th key={stage.seq} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">
                  {stage.name}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => {
              const daysToDelivery = getDaysToDelivery(order.target_delivery_date)
              const isAtRisk = daysToDelivery !== null && daysToDelivery < 30

              return (
                <tr key={order.id} className={isAtRisk ? 'bg-red-50' : ''}>
                  <td className="sticky left-0 bg-inherit px-4 py-3">
                    <div>
                      <p className="font-medium text-dromeas-600">{order.order_number}</p>
                      <p className="text-xs text-gray-500">{order.boats?.hull_number || 'No hull'}</p>
                      <p className="text-xs text-gray-400">{order.models?.name}</p>
                      <p className="text-xs text-gray-400">{getCustomerName(order)}</p>
                    </div>
                  </td>
                  {STAGES.map(stage => {
                    const status = getStageStatus(order, stage.seq)
                    return (
                      <td key={stage.seq} className="px-2 py-3 text-center">
                        {status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />}
                        {status === 'in_progress' && <PlayCircle className="h-5 w-5 text-blue-500 mx-auto animate-pulse" />}
                        {status === 'blocked' && <AlertTriangle className="h-5 w-5 text-red-500 mx-auto" />}
                        {status === 'not_started' && <div className="h-5 w-5 rounded-full border-2 border-gray-200 mx-auto" />}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-right">
                    <div>
                      <p className={`text-sm font-medium ${isAtRisk ? 'text-red-600' : ''}`}>
                        {formatDate(order.target_delivery_date)}
                      </p>
                      {daysToDelivery !== null && (
                        <p className={`text-xs ${daysToDelivery < 0 ? 'text-red-600 font-bold' : daysToDelivery < 30 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {daysToDelivery < 0 ? `${Math.abs(daysToDelivery)}d overdue` : `${daysToDelivery}d left`}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Completed</div>
        <div className="flex items-center"><PlayCircle className="h-4 w-4 text-blue-500 mr-2" />In Progress</div>
        <div className="flex items-center"><AlertTriangle className="h-4 w-4 text-red-500 mr-2" />Blocked</div>
        <div className="flex items-center"><div className="h-4 w-4 rounded-full border-2 border-gray-200 mr-2" />Not Started</div>
      </div>
    </div>
  )
}
