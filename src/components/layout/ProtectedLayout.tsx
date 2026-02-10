'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import { Ship } from 'lucide-react'

const publicRoutes = ['/login', '/forgot-password']

// DEV MODE: Set to true to bypass auth during development
const DEV_BYPASS_AUTH = true

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // DEV: Bypass auth check
  if (DEV_BYPASS_AUTH && !isPublicRoute) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Show loading spinner
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Ship className="h-12 w-12 text-dromeas-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-500">Loading DOS...</p>
        </div>
      </div>
    )
  }

  // Public routes (login, etc.) - no sidebar/header
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Protected routes - show full layout
  if (user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    )
  }

  // Not authenticated and not on public route - show nothing (redirect handled by AuthContext)
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Ship className="h-12 w-12 text-dromeas-600 mx-auto animate-pulse" />
        <p className="mt-4 text-gray-500">Redirecting...</p>
      </div>
    </div>
  )
}
