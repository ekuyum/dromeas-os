'use client'

import { useState } from 'react'
import {
  Bell,
  Search,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'

// Mock alerts for demonstration
const mockAlerts = [
  {
    id: '1',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Navigation Display (NAV-001) below minimum stock',
    time: '5 mins ago',
  },
  {
    id: '2',
    type: 'info',
    title: 'Cost Change Detected',
    message: 'Mercury V8 300HP cost increased by 8%',
    time: '1 hour ago',
  },
  {
    id: '3',
    type: 'success',
    title: 'Delivery Complete',
    message: 'D33-007 delivered to customer',
    time: '2 hours ago',
  },
]

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders, quotes, boats..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-dromeas-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Quick AI Chat Button */}
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="flex items-center px-3 py-1.5 rounded-lg bg-dromeas-600 text-white text-sm hover:bg-dromeas-700 transition-colors"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask AI
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start">
                      {alert.type === 'warning' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                      )}
                      {alert.type === 'info' && (
                        <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      )}
                      {alert.type === 'success' && (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-500 truncate">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200">
                <a href="/ai/alerts" className="text-sm text-dromeas-600 hover:text-dromeas-700">
                  View all alerts →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Sidebar (simplified preview) */}
      {showAIChat && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-dromeas-600 mr-2" />
              <h2 className="font-semibold">DOS AI Assistant</h2>
            </div>
            <button
              onClick={() => setShowAIChat(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                Hello! I'm your DOS AI assistant. I can help you with:
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Check inventory levels</li>
                <li>• Review order status</li>
                <li>• Analyze costs and margins</li>
                <li>• Get delivery risk assessments</li>
                <li>• Production priorities</li>
              </ul>
            </div>
            <div className="text-center text-gray-400 text-sm">
              AI chat will be fully functional in Phase D
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex">
              <input
                type="text"
                placeholder="Ask anything about your operations..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg text-sm focus:outline-none focus:ring-2 focus:ring-dromeas-500"
              />
              <button className="px-4 py-2 bg-dromeas-600 text-white rounded-r-lg hover:bg-dromeas-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
