'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle2, Circle, Clock, AlertTriangle, Plus, Calendar,
  Trash2, ChevronDown, ChevronRight, MessageSquare, History,
  User, Flag, Ship, Package, X, Send, Check, Square, CheckSquare2,
  MoreHorizontal, Edit2, Link2, Target, Zap, Building2, DollarSign
} from 'lucide-react'
import { supabase, formatRelativeTime } from '@/lib/supabase'

// =============================================================================
// ENTITY DEFINITIONS - The 6 Business Entities + Personal + Consolidated
// =============================================================================
type Entity = 'Personal' | 'Dromeas' | 'Eyadera' | 'Brújula' | 'Verdiq' | 'Lobo Blu' | 'Identio'
type LeverageType = 'DO' | 'DELEGATE' | 'AUTOMATE' | 'ELIMINATE'

const ENTITIES: { id: Entity; label: string; color: string; bgColor: string }[] = [
  { id: 'Personal', label: 'Personal', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  { id: 'Dromeas', label: 'Dromeas', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { id: 'Eyadera', label: 'Eyadera', color: 'text-green-700', bgColor: 'bg-green-100' },
  { id: 'Brújula', label: 'Brújula', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  { id: 'Verdiq', label: 'Verdiq', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  { id: 'Lobo Blu', label: 'Lobo Blu', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  { id: 'Identio', label: 'Identio', color: 'text-gray-700', bgColor: 'bg-gray-100' },
]

interface Subtask {
  id: string
  title: string
  completed: boolean
  created_at: string
}

interface Activity {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

interface Comment {
  id: string
  user: string
  text: string
  timestamp: string
}

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date: string | null
  assigned_to: string | null
  related_order_id: string | null
  related_boat_id: string | null
  category: string
  created_at: string
  completed_at: string | null
  orders?: { order_number: string } | null
  boats?: { hull_number: string } | null
  // NEW: Entity and Leverage fields
  entity: Entity | null
  revenue_impact: number | null  // € value
  leverage_type: LeverageType | null
  // Enhanced fields (stored as JSON in description for now, or separate tables later)
  subtasks?: Subtask[]
  activities?: Activity[]
  comments?: Comment[]
}

const CATEGORIES = ['All', 'Sales', 'Production', 'Inventory', 'Finance', 'Customer', 'Admin', 'Compliance', 'Relocation']
const PRIORITIES = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200'
}
const STATUS_CONFIG = {
  todo: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'To Do' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
  blocked: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Blocked' },
  done: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', label: 'Done' }
}

// =============================================================================
// INITIAL TASKS - Unified from Knowledge Base + Relocation Tracker
// =============================================================================
const INITIAL_TASKS: Task[] = [
  // =========================================================================
  // DROMEAS ENTITY - Highest Revenue Impact
  // =========================================================================
  { id: 'dr-1', title: 'RESOLVE NAVIX T-Tops €115K blocker', description: 'Production halted. Call today. Negotiate. Find middle ground or alternative supplier.', status: 'blocked', priority: 'critical', due_date: '2026-02-14', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Production', created_at: '2026-02-10', completed_at: null, entity: 'Dromeas', revenue_impact: 500000, leverage_type: 'DO' },
  { id: 'dr-2', title: 'First Dromeas deposits - Feb push', description: 'Monitor closely - critical for cash flow. Target: 2 deposits by Feb 28.', status: 'todo', priority: 'critical', due_date: '2026-02-28', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Finance', created_at: '2026-02-10', completed_at: null, entity: 'Dromeas', revenue_impact: 200000, leverage_type: 'DO' },
  { id: 'dr-3', title: 'D38 Technical File completion', description: 'CE certification in progress. Bureau Veritas.', status: 'in_progress', priority: 'high', due_date: '2026-03-30', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Compliance', created_at: '2026-02-10', completed_at: null, entity: 'Dromeas', revenue_impact: 150000, leverage_type: 'DO' },
  { id: 'dr-4', title: 'Dealer network Q1 review calls', description: 'Touch base with key dealers: Germany, Greece, Croatia.', status: 'todo', priority: 'high', due_date: '2026-02-21', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Sales', created_at: '2026-02-10', completed_at: null, entity: 'Dromeas', revenue_impact: 100000, leverage_type: 'DO' },

  // =========================================================================
  // PERSONAL ENTITY - Relocation & Family (Merged from Relocation Tracker)
  // =========================================================================
  // Critical This Week
  { id: 'p-1', title: 'Padrón appointment (Empadronamiento)', description: 'OAC Monumental, C. Sicilia 216. Bring passport, NIE, rental contract.', status: 'todo', priority: 'critical', due_date: '2026-02-11', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  { id: 'p-2', title: 'DGT driver license verification', description: 'sede.dgt.gob.es → Cita Previa → Canjes → Turkey. Enter NIE + Turkish license number.', status: 'todo', priority: 'critical', due_date: '2026-02-10', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  { id: 'p-3', title: 'TIE application (after Padrón)', description: 'Apply immediately after Padrón. Need fingerprint appointment.', status: 'todo', priority: 'high', due_date: '2026-02-15', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  { id: 'p-4', title: 'Update phone to Spanish number', description: 'Orange SIMs acquired. Update all accounts.', status: 'todo', priority: 'high', due_date: '2026-02-14', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  // First Month
  { id: 'p-5', title: 'Clave (Digital ID) registration', description: 'CRITICAL for all online gov services in Spain.', status: 'todo', priority: 'high', due_date: '2026-02-28', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  { id: 'p-6', title: 'CATSALUT registration', description: 'Public health registration, get TSI card. catsalut.gencat.cat', status: 'todo', priority: 'medium', due_date: '2026-02-28', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  // Family
  { id: 'p-7', title: 'Derya gymnastics follow-up', description: 'Club Gimnàstic Barcelona - email sent. Follow up if no response by Friday.', status: 'in_progress', priority: 'medium', due_date: '2026-02-14', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Admin', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  { id: 'p-8', title: 'First date night with Yasemin', description: 'Schedule and protect this time.', status: 'todo', priority: 'medium', due_date: '2026-02-15', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Admin', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  { id: 'p-9', title: 'Barcelona Marathon', description: '49-day minimal mileage protocol. Target weight: 110kg.', status: 'todo', priority: 'high', due_date: '2026-03-16', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Admin', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },
  // Pet Admin
  { id: 'p-10', title: 'Lobo & Zilli municipal census registration', description: 'After Padrón. Municipal pet registration required.', status: 'todo', priority: 'medium', due_date: '2026-02-20', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Relocation', created_at: '2026-02-10', completed_at: null, entity: 'Personal', revenue_impact: null, leverage_type: 'DO' },

  // =========================================================================
  // BRÚJULA ENTITY - Spanish Tax/Legal Structure
  // =========================================================================
  { id: 'br-1', title: 'Beckham Law application - DEADLINE', description: 'CRITICAL - €500K+ tax impact over 6 years. File Modelo 149 before July 16.', status: 'todo', priority: 'critical', due_date: '2026-07-16', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Finance', created_at: '2026-02-10', completed_at: null, entity: 'Brújula', revenue_impact: 500000, leverage_type: 'DO' },
  { id: 'br-2', title: 'Engage Beckham Law specialist firm', description: 'ESAN Asesores, Balcells Group, or Marfour. €500-1500 investment. 300x+ ROI.', status: 'todo', priority: 'critical', due_date: '2026-02-14', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Finance', created_at: '2026-02-10', completed_at: null, entity: 'Brújula', revenue_impact: 500000, leverage_type: 'DO' },
  { id: 'br-3', title: 'ENISA certification preparation', description: 'Business plan for Startup Visa. Eyadera + Verdiq AI innovation portfolio.', status: 'todo', priority: 'high', due_date: '2026-03-15', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Finance', created_at: '2026-02-10', completed_at: null, entity: 'Brújula', revenue_impact: 100000, leverage_type: 'DO' },

  // =========================================================================
  // EYADERA ENTITY - AI Consulting
  // =========================================================================
  { id: 'ey-1', title: 'Call Lotus Investment Group', description: 'Discuss €200-500K bridge/growth capital, €1M receivable collection timeline, AI consulting opportunities.', status: 'todo', priority: 'critical', due_date: '2026-02-10', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Finance', created_at: '2026-02-10', completed_at: null, entity: 'Eyadera', revenue_impact: 200000, leverage_type: 'DO' },
  { id: 'ey-2', title: 'Land first AI consulting retainer', description: 'Target: $12-25K/month retainer. Focus on AI implementation, not strategy decks.', status: 'todo', priority: 'high', due_date: '2026-03-31', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Sales', created_at: '2026-02-10', completed_at: null, entity: 'Eyadera', revenue_impact: 150000, leverage_type: 'DO' },
  { id: 'ey-3', title: 'Define AI Readiness Audit productized service', description: 'Fixed $7,500 (2 weeks). Standardize diagnostic framework.', status: 'todo', priority: 'medium', due_date: '2026-02-28', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Sales', created_at: '2026-02-10', completed_at: null, entity: 'Eyadera', revenue_impact: 75000, leverage_type: 'DO' },

  // =========================================================================
  // VERDIQ ENTITY - SaaS
  // =========================================================================
  { id: 'vd-1', title: 'Verdiq founding user campaign', description: 'Get 50 founding users with FOUNDING code for social proof.', status: 'todo', priority: 'medium', due_date: '2026-03-15', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Sales', created_at: '2026-02-10', completed_at: null, entity: 'Verdiq', revenue_impact: 50000, leverage_type: 'DO' },
  { id: 'vd-2', title: 'Verdiq → Eyadera lead-gen positioning', description: 'Reposition as lead-gen for consulting, not standalone SaaS revenue driver.', status: 'todo', priority: 'medium', due_date: '2026-03-31', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Sales', created_at: '2026-02-10', completed_at: null, entity: 'Verdiq', revenue_impact: 25000, leverage_type: 'DO' },

  // =========================================================================
  // LOBO BLU ENTITY - Shopify
  // =========================================================================
  { id: 'lb-1', title: 'Lobo Blu launch - push to 100%', description: '85% ready. Final push to launch.', status: 'todo', priority: 'medium', due_date: '2026-02-28', assigned_to: 'Efe', related_order_id: null, related_boat_id: null, category: 'Sales', created_at: '2026-02-10', completed_at: null, entity: 'Lobo Blu', revenue_impact: 38000, leverage_type: 'DO' },
]

// Simulated enhanced data (in production, this would come from separate tables)
const getEnhancedTaskData = (taskId: string): { subtasks: Subtask[], activities: Activity[], comments: Comment[] } => {
  // This simulates data that would come from subtasks, activities, comments tables
  const stored = typeof window !== 'undefined' ? localStorage.getItem(`task_${taskId}_enhanced`) : null
  if (stored) return JSON.parse(stored)
  return { subtasks: [], activities: [], comments: [] }
}

const saveEnhancedTaskData = (taskId: string, data: { subtasks: Subtask[], activities: Activity[], comments: Comment[] }) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`task_${taskId}_enhanced`, JSON.stringify(data))
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: 'all', category: 'All', priority: 'all', entity: 'all' as string })
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTodayView, setShowTodayView] = useState(true)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', category: 'Admin', due_date: '', entity: 'Personal' as Entity, revenue_impact: '', leverage_type: 'DO' as LeverageType })
  const [newSubtask, setNewSubtask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [enhancedData, setEnhancedData] = useState<{ subtasks: Subtask[], activities: Activity[], comments: Comment[] }>({ subtasks: [], activities: [], comments: [] })

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (selectedTask) {
      const data = getEnhancedTaskData(selectedTask.id)
      setEnhancedData(data)
    }
  }, [selectedTask?.id])

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select(`
        *,
        orders (order_number),
        boats (hull_number)
      `)
      .order('created_at', { ascending: false }) as { data: Task[] | null }

    // Use initial tasks from knowledge base if DB is empty
    if (data && data.length > 0) {
      setTasks(data)
    } else {
      setTasks(INITIAL_TASKS)
    }
    setLoading(false)
  }

  const addTask = async () => {
    if (!newTask.title.trim()) return

    const { data } = await (supabase.from('tasks') as any).insert({
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      category: newTask.category,
      due_date: newTask.due_date || null,
      status: 'todo',
      entity: newTask.entity,
      revenue_impact: newTask.revenue_impact ? parseInt(newTask.revenue_impact) : null,
      leverage_type: newTask.leverage_type
    }).select().single()

    if (data) {
      // Initialize enhanced data
      saveEnhancedTaskData(data.id, {
        subtasks: [],
        activities: [{
          id: crypto.randomUUID(),
          action: 'created',
          user: 'Efe Kuyumcu',
          timestamp: new Date().toISOString(),
          details: `Created task: ${newTask.title}`
        }],
        comments: []
      })
    }

    setNewTask({ title: '', description: '', priority: 'medium', category: 'Admin', due_date: '', entity: 'Personal', revenue_impact: '', leverage_type: 'DO' })
    setShowAddModal(false)
    fetchTasks()
  }

  const updateTaskStatus = async (id: string, status: string) => {
    const updates: any = { status }
    if (status === 'done') updates.completed_at = new Date().toISOString()
    if (status !== 'done') updates.completed_at = null

    await (supabase.from('tasks') as any).update(updates).eq('id', id)

    // Add activity
    const data = getEnhancedTaskData(id)
    data.activities.unshift({
      id: crypto.randomUUID(),
      action: 'status_changed',
      user: 'Efe Kuyumcu',
      timestamp: new Date().toISOString(),
      details: `Changed status to ${STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}`
    })
    saveEnhancedTaskData(id, data)

    fetchTasks()
    if (selectedTask?.id === id) {
      setEnhancedData(data)
    }
  }

  const deleteTask = async (id: string) => {
    await (supabase.from('tasks') as any).delete().eq('id', id)
    if (selectedTask?.id === id) setSelectedTask(null)
    fetchTasks()
  }

  // Subtask functions
  const addSubtask = () => {
    if (!newSubtask.trim() || !selectedTask) return

    const updated = {
      ...enhancedData,
      subtasks: [...enhancedData.subtasks, {
        id: crypto.randomUUID(),
        title: newSubtask,
        completed: false,
        created_at: new Date().toISOString()
      }],
      activities: [{
        id: crypto.randomUUID(),
        action: 'subtask_added',
        user: 'Efe Kuyumcu',
        timestamp: new Date().toISOString(),
        details: `Added subtask: ${newSubtask}`
      }, ...enhancedData.activities]
    }

    setEnhancedData(updated)
    saveEnhancedTaskData(selectedTask.id, updated)
    setNewSubtask('')
  }

  const toggleSubtask = (subtaskId: string) => {
    if (!selectedTask) return

    const subtask = enhancedData.subtasks.find(s => s.id === subtaskId)
    const updated = {
      ...enhancedData,
      subtasks: enhancedData.subtasks.map(s =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
      activities: [{
        id: crypto.randomUUID(),
        action: subtask?.completed ? 'subtask_uncompleted' : 'subtask_completed',
        user: 'Efe Kuyumcu',
        timestamp: new Date().toISOString(),
        details: `${subtask?.completed ? 'Uncompleted' : 'Completed'}: ${subtask?.title}`
      }, ...enhancedData.activities]
    }

    setEnhancedData(updated)
    saveEnhancedTaskData(selectedTask.id, updated)
  }

  const deleteSubtask = (subtaskId: string) => {
    if (!selectedTask) return

    const subtask = enhancedData.subtasks.find(s => s.id === subtaskId)
    const updated = {
      ...enhancedData,
      subtasks: enhancedData.subtasks.filter(s => s.id !== subtaskId),
      activities: [{
        id: crypto.randomUUID(),
        action: 'subtask_deleted',
        user: 'Efe Kuyumcu',
        timestamp: new Date().toISOString(),
        details: `Deleted subtask: ${subtask?.title}`
      }, ...enhancedData.activities]
    }

    setEnhancedData(updated)
    saveEnhancedTaskData(selectedTask.id, updated)
  }

  // Comment functions
  const addComment = () => {
    if (!newComment.trim() || !selectedTask) return

    const updated = {
      ...enhancedData,
      comments: [...enhancedData.comments, {
        id: crypto.randomUUID(),
        user: 'Efe Kuyumcu',
        text: newComment,
        timestamp: new Date().toISOString()
      }],
      activities: [{
        id: crypto.randomUUID(),
        action: 'comment_added',
        user: 'Efe Kuyumcu',
        timestamp: new Date().toISOString(),
        details: 'Added a comment'
      }, ...enhancedData.activities]
    }

    setEnhancedData(updated)
    saveEnhancedTaskData(selectedTask.id, updated)
    setNewComment('')
  }

  const filteredTasks = tasks.filter(t => {
    if (filter.status !== 'all' && t.status !== filter.status) return false
    if (filter.category !== 'All' && t.category !== filter.category) return false
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false
    if (filter.entity !== 'all' && t.entity !== filter.entity) return false
    return true
  })

  // =============================================================================
  // TODAY VIEW - Highest Leverage Actions
  // =============================================================================
  const getHighestLeverageAction = () => {
    // Priority: blocked critical → critical with revenue → critical without revenue → high with revenue
    const activeTasks = tasks.filter(t => t.status !== 'done')

    // First: Any blocked critical tasks (like NAVIX)
    const blockedCritical = activeTasks.find(t => t.status === 'blocked' && t.priority === 'critical')
    if (blockedCritical) return blockedCritical

    // Second: Critical with highest revenue impact
    const criticalWithRevenue = activeTasks
      .filter(t => t.priority === 'critical' && t.revenue_impact)
      .sort((a, b) => (b.revenue_impact || 0) - (a.revenue_impact || 0))[0]
    if (criticalWithRevenue) return criticalWithRevenue

    // Third: Any critical task
    const critical = activeTasks.find(t => t.priority === 'critical')
    if (critical) return critical

    // Fourth: High priority with revenue
    const highWithRevenue = activeTasks
      .filter(t => t.priority === 'high' && t.revenue_impact)
      .sort((a, b) => (b.revenue_impact || 0) - (a.revenue_impact || 0))[0]
    if (highWithRevenue) return highWithRevenue

    // Fallback: first active task
    return activeTasks[0]
  }

  const getMoneyMoves = () => {
    // Top 3 tasks with revenue impact that aren't done
    return tasks
      .filter(t => t.status !== 'done' && t.revenue_impact && t.revenue_impact > 0)
      .sort((a, b) => (b.revenue_impact || 0) - (a.revenue_impact || 0))
      .slice(0, 3)
  }

  const getOverdueFollowups = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tasks
      .filter(t => t.due_date && new Date(t.due_date) < today && t.status !== 'done')
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 5)
  }

  const highestLeverage = getHighestLeverageAction()
  const moneyMoves = getMoneyMoves()
  const overdueFollowups = getOverdueFollowups()

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length
  }

  const subtaskProgress = enhancedData.subtasks.length > 0
    ? Math.round((enhancedData.subtasks.filter(s => s.completed).length / enhancedData.subtasks.length) * 100)
    : 0

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading tasks...</div></div>

  // Helper to get entity color
  const getEntityStyle = (entity: Entity | null) => {
    const e = ENTITIES.find(ent => ent.id === entity)
    return e ? { color: e.color, bg: e.bgColor } : { color: 'text-gray-700', bg: 'bg-gray-100' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CheckSquare2 className="h-7 w-7 mr-3 text-dromeas-600" />
            Tasks
          </h1>
          <p className="text-sm text-gray-500">{stats.total} tasks · {stats.overdue} overdue · {stats.done} completed</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTodayView(!showTodayView)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showTodayView ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            Today
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ENTITY FILTER BAR - The Core FOS Navigation                        */}
      {/* =================================================================== */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter({...filter, entity: 'all'})}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter.entity === 'all'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Entities
          </button>
          {ENTITIES.map(entity => {
            const entityTaskCount = tasks.filter(t => t.entity === entity.id && t.status !== 'done').length
            return (
              <button
                key={entity.id}
                onClick={() => setFilter({...filter, entity: entity.id})}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                  filter.entity === entity.id
                    ? `${entity.bgColor} ${entity.color} shadow-sm ring-2 ring-offset-1 ring-${entity.color.replace('text-', '')}`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {entity.label}
                {entityTaskCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter.entity === entity.id ? 'bg-white/30' : 'bg-gray-200'}`}>
                    {entityTaskCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TODAY VIEW - Highest Leverage Action + Money Moves                 */}
      {/* =================================================================== */}
      {showTodayView && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Highest Leverage Action */}
          <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-amber-900">🎯 HIGHEST LEVERAGE ACTION</h3>
            </div>
            {highestLeverage ? (
              <div
                onClick={() => setSelectedTask(highestLeverage)}
                className="bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow border border-amber-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{highestLeverage.title}</h4>
                    {highestLeverage.description && (
                      <p className="text-sm text-gray-600 mt-1">{highestLeverage.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {highestLeverage.entity && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getEntityStyle(highestLeverage.entity).bg} ${getEntityStyle(highestLeverage.entity).color}`}>
                          {highestLeverage.entity}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full border ${PRIORITIES[highestLeverage.priority]}`}>
                        {highestLeverage.priority}
                      </span>
                      {highestLeverage.revenue_impact && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          €{highestLeverage.revenue_impact.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Zap className="h-8 w-8 text-amber-400" />
                </div>
              </div>
            ) : (
              <p className="text-amber-700">No pending tasks!</p>
            )}
          </div>

          {/* Money Moves */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-green-900">💰 MONEY MOVES</h3>
            </div>
            <div className="space-y-2">
              {moneyMoves.length > 0 ? moneyMoves.map((task, idx) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow border border-green-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.entity && (
                          <span className={`text-xs ${getEntityStyle(task.entity).color}`}>
                            {task.entity}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      €{task.revenue_impact?.toLocaleString()}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-green-700 text-sm">No revenue-tagged tasks</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overdue Follow-ups Alert */}
      {overdueFollowups.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-red-900">⚠️ OVERDUE ({overdueFollowups.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {overdueFollowups.map(task => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="text-xs px-3 py-1.5 bg-white rounded-lg border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
              >
                {task.title.substring(0, 30)}{task.title.length > 30 ? '...' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const StatusIcon = config.icon
          const count = stats[status === 'in_progress' ? 'inProgress' : status as keyof typeof stats] as number
          return (
            <div
              key={status}
              onClick={() => setFilter({...filter, status})}
              className={`card p-4 cursor-pointer hover:shadow-md transition-shadow ${filter.status === status ? 'ring-2 ring-dromeas-500' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
                <span className="text-sm text-gray-600">{config.label}</span>
              </div>
              <p className={`text-2xl font-bold mt-1 ${config.color}`}>{count}</p>
            </div>
          )
        })}
        <div
          className={`card p-4 cursor-pointer hover:shadow-md ${stats.overdue > 0 ? 'bg-red-50 border-red-200' : ''}`}
          onClick={() => setFilter({...filter, status: 'all'})}
        >
          <div className="flex items-center space-x-2">
            <Calendar className={`h-5 w-5 ${stats.overdue > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
          <p className={`text-2xl font-bold mt-1 ${stats.overdue > 0 ? 'text-red-600' : ''}`}>{stats.overdue}</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter({...filter, status: 'all'})}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter.status === 'all' ? 'bg-dromeas-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          All Status
        </button>
        <div className="w-px bg-gray-300 mx-1" />
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter({...filter, category: c})}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter.category === c ? 'bg-marine-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              <CheckSquare2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No tasks found. Click "Add Task" to create one.</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const StatusIcon = STATUS_CONFIG[task.status].icon
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done'
              const taskEnhanced = getEnhancedTaskData(task.id)
              const hasSubtasks = taskEnhanced.subtasks.length > 0
              const subtasksDone = taskEnhanced.subtasks.filter(s => s.completed).length
              const subtasksTotal = taskEnhanced.subtasks.length

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-md ${
                    task.status === 'done' ? 'opacity-60' : ''
                  } ${isOverdue ? 'border-l-4 border-l-red-500' : ''} ${
                    selectedTask?.id === task.id ? 'ring-2 ring-dromeas-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const nextStatus = task.status === 'done' ? 'todo' :
                            task.status === 'todo' ? 'in_progress' :
                            task.status === 'in_progress' ? 'done' : 'todo'
                          updateTaskStatus(task.id, nextStatus)
                        }}
                        className="mt-0.5 hover:scale-110 transition-transform"
                      >
                        <StatusIcon className={`h-5 w-5 ${STATUS_CONFIG[task.status].color}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Entity Badge - Primary identifier */}
                          {task.entity && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getEntityStyle(task.entity).bg} ${getEntityStyle(task.entity).color}`}>
                              {task.entity}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITIES[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {task.category}
                          </span>
                          {/* Revenue Impact Badge */}
                          {task.revenue_impact && task.revenue_impact > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center">
                              <DollarSign className="h-3 w-3 mr-0.5" />
                              €{task.revenue_impact.toLocaleString()}
                            </span>
                          )}
                          {task.due_date && (
                            <span className={`text-xs flex items-center ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                          {hasSubtasks && (
                            <span className="text-xs flex items-center text-gray-500">
                              <CheckSquare2 className="h-3 w-3 mr-1" />
                              {subtasksDone}/{subtasksTotal}
                            </span>
                          )}
                          {task.orders?.order_number && (
                            <span className="text-xs text-dromeas-600 flex items-center">
                              <Link2 className="h-3 w-3 mr-1" />
                              #{task.orders.order_number}
                            </span>
                          )}
                          {task.boats?.hull_number && (
                            <span className="text-xs text-marine-600 flex items-center">
                              <Ship className="h-3 w-3 mr-1" />
                              {task.boats.hull_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTask(task.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Task Detail Panel */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div className="card p-0 sticky top-6 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              {/* Header */}
              <div className={`p-4 border-b ${STATUS_CONFIG[selectedTask.status].bg}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full border ${PRIORITIES[selectedTask.priority]}`}>
                        {selectedTask.priority}
                      </span>
                      <span className="text-xs text-gray-500">{selectedTask.category}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{selectedTask.title}</h3>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="p-1 hover:bg-gray-200 rounded">
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                {/* Status selector */}
                <div className="flex items-center space-x-2 mt-3">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={status}
                        onClick={() => updateTaskStatus(selectedTask.id, status)}
                        className={`flex items-center px-2 py-1 text-xs rounded-lg transition-colors ${
                          selectedTask.status === status
                            ? `${config.bg} ${config.color} font-medium`
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Description */}
                {selectedTask.description && (
                  <div className="p-4 border-b">
                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                  </div>
                )}

                {/* Subtasks / Checklist */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <CheckSquare2 className="h-4 w-4 mr-2 text-gray-500" />
                      Checklist
                    </h4>
                    {enhancedData.subtasks.length > 0 && (
                      <span className="text-xs text-gray-500">{subtaskProgress}%</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {enhancedData.subtasks.length > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                      <div
                        className="bg-green-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${subtaskProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Subtask list */}
                  <div className="space-y-2 mb-3">
                    {enhancedData.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center group">
                        <button
                          onClick={() => toggleSubtask(subtask.id)}
                          className="mr-2"
                        >
                          {subtask.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                          {subtask.title}
                        </span>
                        <button
                          onClick={() => deleteSubtask(subtask.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add subtask */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                      placeholder="Add item..."
                      className="flex-1 text-sm border-0 border-b border-gray-200 focus:border-dromeas-500 focus:ring-0 px-0 py-1"
                    />
                    <button
                      onClick={addSubtask}
                      disabled={!newSubtask.trim()}
                      className="p-1 text-dromeas-600 hover:text-dromeas-700 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="p-4 border-b">
                  <h4 className="font-medium text-gray-900 flex items-center mb-3">
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                    Comments ({enhancedData.comments.length})
                  </h4>

                  <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
                    {enhancedData.comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{comment.user}</span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))}
                    {enhancedData.comments.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
                    )}
                  </div>

                  {/* Add comment */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment()}
                      placeholder="Add a comment..."
                      className="flex-1 text-sm border rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-dromeas-500"
                    />
                    <button
                      onClick={addComment}
                      disabled={!newComment.trim()}
                      className="p-1.5 bg-dromeas-600 text-white rounded-lg hover:bg-dromeas-700 disabled:opacity-30"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Activity Log */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 flex items-center mb-3">
                    <History className="h-4 w-4 mr-2 text-gray-500" />
                    Activity
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {enhancedData.activities.slice(0, 10).map(activity => (
                      <div key={activity.id} className="flex items-start text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-gray-600">{activity.details}</span>
                          <span className="text-gray-400 ml-2">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {enhancedData.activities.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">No activity yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-gray-400 sticky top-6">
              <CheckSquare2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a task to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Entity Selection - PRIMARY FIELD */}
              <div>
                <label className="label">Entity *</label>
                <div className="flex flex-wrap gap-2">
                  {ENTITIES.map(entity => (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => setNewTask({...newTask, entity: entity.id})}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        newTask.entity === entity.id
                          ? `${entity.bgColor} ${entity.color} ring-2 ring-offset-1`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {entity.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="input"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="input"
                  rows={2}
                  placeholder="Additional details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select value={newTask.category} onChange={(e) => setNewTask({...newTask, category: e.target.value})} className="input">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Revenue Impact (€)</label>
                  <input
                    type="number"
                    value={newTask.revenue_impact}
                    onChange={(e) => setNewTask({...newTask, revenue_impact: e.target.value})}
                    className="input"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              <div>
                <label className="label">Leverage Type</label>
                <div className="flex gap-2">
                  {(['DO', 'DELEGATE', 'AUTOMATE', 'ELIMINATE'] as LeverageType[]).map(lt => (
                    <button
                      key={lt}
                      type="button"
                      onClick={() => setNewTask({...newTask, leverage_type: lt})}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                        newTask.leverage_type === lt
                          ? lt === 'DO' ? 'bg-blue-600 text-white'
                            : lt === 'DELEGATE' ? 'bg-purple-600 text-white'
                            : lt === 'AUTOMATE' ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {lt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={addTask} className="btn btn-primary">Create Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
