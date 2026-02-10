'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Ship,
  Package,
  FileText,
  ClipboardList,
  Factory,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  MessageSquare,
  Anchor,
  Users,
  TrendingUp,
  CheckSquare,
  PiggyBank,
  Shield,
  Building2,
  Sliders,
  FolderArchive,
  LogOut,
  Brain,
  Compass,
  UtensilsCrossed,
  Mail,
  Sparkles,
} from 'lucide-react'

const navigation = [
  // COMMAND (Top priority - Founder view)
  { name: '🚀 FOS 2.0', href: '/fos', icon: Brain, highlight: true },
  { name: '📨 Email Intel', href: '/email-intel', icon: Sparkles, highlight: true },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: '📧 Email Triage', href: '/email', icon: Mail },
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Legacy Command', href: '/command-center', icon: TrendingUp },
  {
    name: 'MY LIFE',
    items: [
      { name: 'Corporate Structure', href: '/command/entities', icon: Building2 },
      { name: 'Assets & Liabilities', href: '/command/assets', icon: PiggyBank },
      { name: '🇪🇸 Relocation Tracker', href: '/barcelona/relocation', icon: Compass },
      { name: '🎯 50-50-50 Challenge', href: '/barcelona/challenge', icon: UtensilsCrossed },
    ]
  },
  {
    name: 'SALES & FINANCE',
    items: [
      { name: 'Orders', href: '/sales/orders', icon: ShoppingCart },
      { name: 'Quotes', href: '/sales/quotes', icon: FileText },
      { name: 'Customers', href: '/sales/customers', icon: Users },
      { name: 'Cash Flow', href: '/finance/cash-flow', icon: DollarSign },
    ]
  },
  {
    name: 'PRODUCTION',
    items: [
      { name: 'Production Board', href: '/production/tracking', icon: Factory },
      { name: 'Boats', href: '/production/boats', icon: Anchor },
      { name: 'Inventory', href: '/inventory', icon: ClipboardList },
    ]
  },
  {
    name: 'PRODUCTS',
    items: [
      { name: 'Models', href: '/products/models', icon: Ship },
      { name: 'Configurator', href: '/products/configurator', icon: Sliders },
      { name: 'Components', href: '/products/components', icon: Package },
    ]
  },
  {
    name: 'COMPLIANCE',
    items: [
      { name: 'CE Dashboard', href: '/compliance', icon: Shield },
      { name: 'Technical Files', href: '/compliance/technical-files', icon: FolderArchive },
    ]
  },
  {
    name: 'AI',
    items: [
      { name: 'AI Chat', href: '/ai', icon: MessageSquare },
      { name: 'Insights', href: '/ai/insights', icon: TrendingUp },
    ]
  },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Ship className="h-8 w-8 text-dromeas-400" />
        <span className="ml-3 text-lg font-bold">FOS</span>
        <span className="ml-1 text-xs text-green-400">2.0</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((section) => (
          <div key={section.name}>
            {section.href ? (
              // Single item
              <Link
                href={section.href}
                className={`flex items-center px-6 py-2.5 text-sm ${
                  pathname === section.href
                    ? 'bg-gray-800 text-white border-l-2 border-dromeas-400'
                    : (section as { highlight?: boolean }).highlight
                    ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900 hover:text-white border-l-2 border-purple-500'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {section.icon && <section.icon className={`h-5 w-5 mr-3 ${(section as { highlight?: boolean }).highlight ? 'text-purple-400' : ''}`} />}
                {section.name}
              </Link>
            ) : (
              // Section with items
              <div className="mt-4">
                <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.name}
                </div>
                {section.items?.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-6 py-2 text-sm ${
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'bg-gray-800 text-white border-l-2 border-dromeas-400'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-dromeas-600 flex items-center justify-center text-sm font-medium">
              {user?.email?.substring(0, 2).toUpperCase() || 'EK'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
