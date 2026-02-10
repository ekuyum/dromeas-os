'use client'

import { useState } from 'react'
import { Building2, Users, Bell, Palette, Database, Shield, Globe, Mail, Save, Check } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    company: {
      name: 'Dromeas Yachts',
      legal_name: 'Dromeas Yachts Ltd.',
      vat_number: 'EL123456789',
      address: 'Marina Bay, Athens',
      country: 'Greece',
      currency: 'EUR',
      timezone: 'Europe/Athens'
    },
    notifications: {
      email_orders: true,
      email_payments: true,
      email_production: false,
      email_inventory: true,
      slack_enabled: false,
      slack_webhook: ''
    },
    kpis: {
      target_orders_month: 5,
      target_revenue_month: 500000,
      target_production_time: 90,
      min_stock_alert_days: 14,
      payment_reminder_days: 7
    }
  })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'kpis', label: 'KPI Targets', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Configure your DOS environment</p>
        </div>
        <button onClick={handleSave} className="btn btn-primary">
          {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left ${
                activeTab === tab.id ? 'bg-dromeas-100 text-dromeas-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">Company Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Company Name</label>
                  <input
                    type="text"
                    value={settings.company.name}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, name: e.target.value}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Legal Name</label>
                  <input
                    type="text"
                    value={settings.company.legal_name}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, legal_name: e.target.value}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">VAT Number</label>
                  <input
                    type="text"
                    value={settings.company.vat_number}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, vat_number: e.target.value}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Country</label>
                  <select
                    value={settings.company.country}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, country: e.target.value}})}
                    className="input"
                  >
                    <option>Greece</option>
                    <option>Cyprus</option>
                    <option>Turkey</option>
                    <option>Italy</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Address</label>
                  <input
                    type="text"
                    value={settings.company.address}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, address: e.target.value}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Default Currency</label>
                  <select
                    value={settings.company.currency}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, currency: e.target.value}})}
                    className="input"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <select
                    value={settings.company.timezone}
                    onChange={(e) => setSettings({...settings, company: {...settings.company, timezone: e.target.value}})}
                    className="input"
                  >
                    <option value="Europe/Athens">Europe/Athens</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">Notification Preferences</h2>
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                {[
                  { key: 'email_orders', label: 'New orders and quotes' },
                  { key: 'email_payments', label: 'Payment received' },
                  { key: 'email_production', label: 'Production milestones' },
                  { key: 'email_inventory', label: 'Low stock alerts' },
                ].map(item => (
                  <label key={item.key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={(settings.notifications as any)[item.key]}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, [item.key]: e.target.checked}
                      })}
                      className="h-4 w-4 text-dromeas-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Slack Integration</h3>
                  <label className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      checked={settings.notifications.slack_enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, slack_enabled: e.target.checked}
                      })}
                      className="h-4 w-4 text-dromeas-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Slack notifications</span>
                  </label>
                  {settings.notifications.slack_enabled && (
                    <div>
                      <label className="label">Webhook URL</label>
                      <input
                        type="text"
                        value={settings.notifications.slack_webhook}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {...settings.notifications, slack_webhook: e.target.value}
                        })}
                        className="input"
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">KPI Targets</h2>
              <p className="text-sm text-gray-500">Set targets to track performance against goals</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Target Orders / Month</label>
                  <input
                    type="number"
                    value={settings.kpis.target_orders_month}
                    onChange={(e) => setSettings({...settings, kpis: {...settings.kpis, target_orders_month: parseInt(e.target.value)}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Target Revenue / Month (€)</label>
                  <input
                    type="number"
                    value={settings.kpis.target_revenue_month}
                    onChange={(e) => setSettings({...settings, kpis: {...settings.kpis, target_revenue_month: parseInt(e.target.value)}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Target Production Time (days)</label>
                  <input
                    type="number"
                    value={settings.kpis.target_production_time}
                    onChange={(e) => setSettings({...settings, kpis: {...settings.kpis, target_production_time: parseInt(e.target.value)}})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Min Stock Alert (days)</label>
                  <input
                    type="number"
                    value={settings.kpis.min_stock_alert_days}
                    onChange={(e) => setSettings({...settings, kpis: {...settings.kpis, min_stock_alert_days: parseInt(e.target.value)}})}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when stock falls below X days of supply</p>
                </div>
                <div>
                  <label className="label">Payment Reminder (days before)</label>
                  <input
                    type="number"
                    value={settings.kpis.payment_reminder_days}
                    onChange={(e) => setSettings({...settings, kpis: {...settings.kpis, payment_reminder_days: parseInt(e.target.value)}})}
                    className="input"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">User Management</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-dromeas-600 rounded-full flex items-center justify-center text-white font-medium">EK</div>
                    <div>
                      <p className="font-medium">Efe Kuyumcu</p>
                      <p className="text-sm text-gray-500">efe@dromeasyachts.com</p>
                    </div>
                  </div>
                  <span className="status-badge status-success">Admin</span>
                </div>
                <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-dromeas-500 hover:text-dromeas-600">
                  + Invite User
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold border-b pb-2">Integrations</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-sm text-gray-500">Database & Authentication</p>
                    </div>
                  </div>
                  <span className="status-badge status-success">Connected</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div>
                      <p className="font-medium">Claude AI</p>
                      <p className="text-sm text-gray-500">Intelligent assistant</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary text-sm">Connect</button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Email (SMTP)</p>
                      <p className="text-sm text-gray-500">Send invoices & notifications</p>
                    </div>
                  </div>
                  <button className="btn btn-secondary text-sm">Configure</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
