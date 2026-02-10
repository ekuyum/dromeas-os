'use client'

import { useEffect, useState, useRef } from 'react'
import { Send, Sparkles, TrendingUp, AlertTriangle, Package, Ship, RefreshCw, Bot, User } from 'lucide-react'
import { supabase, formatCurrency } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DailyBriefing {
  orders_active: number
  orders_at_risk: number
  boats_ready: number
  cash_expected_30d: number
  low_stock_items: number
  recent_insights: any[]
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [briefingLoading, setBriefingLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    generateDailyBriefing()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateDailyBriefing = async () => {
    setBriefingLoading(true)

    const [ordersRes, boatsRes, inventoryRes, insightsRes] = await Promise.all([
      supabase.from('orders').select('id, status, total_eur, target_delivery_date, deposit_paid_date, milestone_paid_date, final_paid_date'),
      supabase.from('boats').select('id, status'),
      supabase.from('inventory').select('id, qty_on_hand, qty_reserved, components(min_stock)'),
      supabase.from('ai_insights').select('*').eq('is_dismissed', false).order('created_at', { ascending: false }).limit(5)
    ])

    const orders = (ordersRes.data || []) as any[]
    const boats = (boatsRes.data || []) as any[]
    const inventory = (inventoryRes.data || []) as any[]
    const insights = (insightsRes.data || []) as any[]

    const activeOrders = orders.filter((o: any) => ['deposit_received', 'in_production'].includes(o.status))
    const atRiskOrders = activeOrders.filter((o: any) => {
      if (!o.target_delivery_date) return false
      const daysLeft = Math.ceil((new Date(o.target_delivery_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysLeft < 30
    })
    const readyBoats = boats.filter((b: any) => b.status === 'completed')
    const lowStockItems = inventory.filter((i: any) => {
      const minStock = (i.components as any)?.min_stock || 0
      return (i.qty_on_hand - i.qty_reserved) < minStock
    })

    const cash30d = orders
      .filter((o: any) => !o.final_paid_date)
      .reduce((sum: number, o: any) => {
        if (!o.milestone_paid_date) return sum + (o.total_eur * 0.4)
        if (!o.final_paid_date) return sum + (o.total_eur * 0.3)
        return sum
      }, 0)

    setBriefing({
      orders_active: activeOrders.length,
      orders_at_risk: atRiskOrders.length,
      boats_ready: readyBoats.length,
      cash_expected_30d: cash30d,
      low_stock_items: lowStockItems.length,
      recent_insights: insights
    })
    setBriefingLoading(false)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response. Please try again.'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }

  const quickActions = [
    { label: 'Morning briefing', query: 'Give me my morning briefing. What should I focus on today?' },
    { label: 'Priority tasks', query: 'What are my top 3 priorities right now? Be specific and actionable.' },
    { label: 'Risk check', query: 'What are the biggest risks in my business right now?' },
    { label: 'Cash flow', query: 'What\'s my cash flow situation? When is money coming in?' },
  ]

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Daily Briefing Panel */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold flex items-center">
              <Sparkles className="h-4 w-4 text-dromeas-500 mr-2" />
              Daily Briefing
            </h2>
            <button onClick={generateDailyBriefing} className="p-1 text-gray-400 hover:text-gray-600">
              <RefreshCw className={`h-4 w-4 ${briefingLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="card-body space-y-4">
            {briefingLoading ? (
              <div className="text-center text-gray-500 py-8">Generating briefing...</div>
            ) : briefing && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <Ship className="h-5 w-5 text-blue-500 mb-1" />
                    <p className="text-2xl font-bold text-blue-700">{briefing.orders_active}</p>
                    <p className="text-xs text-blue-600">Active Orders</p>
                  </div>
                  <div className={`rounded-lg p-3 ${briefing.orders_at_risk > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <AlertTriangle className={`h-5 w-5 mb-1 ${briefing.orders_at_risk > 0 ? 'text-red-500' : 'text-green-500'}`} />
                    <p className={`text-2xl font-bold ${briefing.orders_at_risk > 0 ? 'text-red-700' : 'text-green-700'}`}>{briefing.orders_at_risk}</p>
                    <p className={`text-xs ${briefing.orders_at_risk > 0 ? 'text-red-600' : 'text-green-600'}`}>At Risk</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <Package className="h-5 w-5 text-green-500 mb-1" />
                    <p className="text-2xl font-bold text-green-700">{briefing.boats_ready}</p>
                    <p className="text-xs text-green-600">Ready to Ship</p>
                  </div>
                  <div className={`rounded-lg p-3 ${briefing.low_stock_items > 0 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                    <TrendingUp className={`h-5 w-5 mb-1 ${briefing.low_stock_items > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <p className={`text-2xl font-bold ${briefing.low_stock_items > 0 ? 'text-yellow-700' : 'text-gray-600'}`}>{briefing.low_stock_items}</p>
                    <p className={`text-xs ${briefing.low_stock_items > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>Low Stock</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Expected (30d)</span>
                    <span className="font-bold text-green-600">{formatCurrency(briefing.cash_expected_30d)}</span>
                  </div>
                </div>

                {briefing.recent_insights.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Insights</p>
                    <div className="space-y-2">
                      {briefing.recent_insights.slice(0, 3).map((insight: any, i: number) => (
                        <div key={i} className={`text-xs p-2 rounded ${
                          insight.severity === 'critical' ? 'bg-red-50 text-red-700' :
                          insight.severity === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          <p className="font-medium">{insight.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 card flex flex-col">
        <div className="card-header border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold flex items-center">
                <Bot className="h-5 w-5 text-dromeas-500 mr-2" />
                DOS AI Assistant
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Claude Powered</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Your AI-powered virtual COO</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-16 w-16 text-dromeas-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">I'm your AI-powered operations brain</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                I know your orders, customers, inventory, and production status. Ask me anything about your business.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(action.query)}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-dromeas-100 hover:text-dromeas-700 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-dromeas-600' : 'bg-gray-200'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className={`rounded-lg px-4 py-3 ${
                  msg.role === 'user' ? 'bg-dromeas-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-dromeas-200' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about orders, cash flow, production, priorities..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dromeas-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-dromeas-600 text-white rounded-lg hover:bg-dromeas-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by Claude AI · Knows your real-time business data
          </p>
        </div>
      </div>
    </div>
  )
}
