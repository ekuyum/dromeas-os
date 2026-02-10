import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for API routes)
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

// Helper to format currency
export const formatCurrency = (value: number | null, currency = 'EUR') => {
  if (value === null) return '-'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Helper to format date
export const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Helper to format relative time
export const formatRelativeTime = (date: string) => {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins} mins ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(date)
}

// Status color mapping
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'status-neutral',
    sent: 'status-info',
    negotiating: 'status-warning',
    won: 'status-success',
    lost: 'status-danger',
    expired: 'status-neutral',
    deposit_pending: 'status-warning',
    deposit_received: 'status-info',
    in_production: 'status-info',
    ready: 'status-success',
    delivered: 'status-success',
    warranty: 'status-info',
    closed: 'status-neutral',
    pending: 'status-warning',
    paid: 'status-success',
    overdue: 'status-danger',
    cancelled: 'status-neutral',
    building: 'status-info',
    completed: 'status-success',
    in_service: 'status-success',
    sold: 'status-neutral',
    not_started: 'status-neutral',
    in_progress: 'status-info',
    blocked: 'status-danger',
  }
  return colors[status] || 'status-neutral'
}

// Format status for display
export const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
