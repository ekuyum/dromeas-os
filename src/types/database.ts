// Dromeas Operations System Database Types
// Auto-generated from Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Enums
export type QuoteStatus = 'draft' | 'sent' | 'negotiating' | 'won' | 'lost' | 'expired'
export type OrderStatus = 'deposit_pending' | 'deposit_received' | 'in_production' | 'ready' | 'delivered' | 'warranty' | 'closed'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type POStatus = 'draft' | 'sent' | 'confirmed' | 'partial_receipt' | 'complete' | 'invoiced' | 'cancelled'
export type ApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected'
export type BoatStatus = 'building' | 'completed' | 'delivered' | 'in_service' | 'sold'
export type ProductionStageStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'
export type MovementType = 'in' | 'out' | 'adjust' | 'reserve' | 'unreserve' | 'transfer'
export type CostType = 'materials' | 'labor' | 'subcontract' | 'overhead' | 'shipping' | 'other'
export type CustomerType = 'direct' | 'dealer'
export type VATStatus = 'standard' | 'reduced' | 'zero' | 'reverse_charge' | 'exempt'

// Core Tables
export interface Model {
  id: string
  code: string
  name: string
  range: string
  length_m: number
  beam_m: number | null
  draft_m: number | null
  displacement_kg: number | null
  fuel_capacity_l: number | null
  max_persons: number | null
  base_price_eur: number
  std_engine_id: string | null
  description: string | null
  hero_image_url: string | null
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Engine {
  id: string
  code: string
  brand: string
  model: string
  hp: number
  config: string
  cost_eur: number
  retail_eur: number
  supplier_id: string | null
  lead_time_days: number | null
  weight_kg: number | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Component {
  id: string
  code: string
  name: string
  category: string
  subcategory: string | null
  cost_eur: number
  retail_eur: number
  supplier_id: string | null
  lead_time_days: number | null
  min_stock: number
  unit: string
  weight_kg: number | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  code: string
  name: string
  model_range: string | null
  retail_eur: number
  description: string | null
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  code: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  country: string | null
  currency: string
  payment_terms: string | null
  lead_time_days: number
  notes: string | null
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  code: string | null
  company_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string
  customer_type: CustomerType
  vat_number: string | null
  vat_status: VATStatus
  preferred_currency: string
  preferred_language: string
  dealer_id: string | null
  source: string | null
  notes: string | null
  is_active: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  quote_number: string
  customer_id: string
  contact_id: string | null
  model_id: string
  engine_id: string
  region_id: string | null
  base_price_eur: number
  engine_price_eur: number
  packages_price_eur: number
  options_price_eur: number
  regional_addon_eur: number
  discount_eur: number
  discount_percent: number
  subtotal_eur: number
  vat_rate: number
  vat_amount_eur: number
  total_eur: number
  display_currency: string
  exchange_rate: number
  total_display: number | null
  status: QuoteStatus
  approval_status: ApprovalStatus
  approved_by: string | null
  approved_at: string | null
  valid_until: string | null
  sent_at: string | null
  won_at: string | null
  lost_at: string | null
  lost_reason: string | null
  notes: string | null
  internal_notes: string | null
  pdf_url: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  quote_id: string | null
  customer_id: string
  model_id: string
  engine_id: string
  region_id: string | null
  subtotal_eur: number
  discount_eur: number
  vat_rate: number
  vat_amount_eur: number
  total_eur: number
  deposit_percent: number
  deposit_amount_eur: number
  deposit_due_date: string | null
  deposit_paid_date: string | null
  milestone_percent: number
  milestone_amount_eur: number
  milestone_due_date: string | null
  milestone_paid_date: string | null
  final_percent: number
  final_amount_eur: number
  final_due_date: string | null
  final_paid_date: string | null
  order_date: string
  target_delivery_date: string | null
  actual_delivery_date: string | null
  status: OrderStatus
  notes: string | null
  internal_notes: string | null
  contract_url: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Boat {
  id: string
  hull_number: string
  hin: string | null
  order_id: string | null
  model_id: string
  engine_serials: string[] | null
  build_start_date: string | null
  build_end_date: string | null
  delivery_date: string | null
  warranty_start_date: string | null
  warranty_end_date: string | null
  status: BoatStatus
  current_location: string | null
  notes: string | null
  photos: Json
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  component_id: string
  location_id: string
  qty_on_hand: number
  qty_reserved: number
  qty_on_order: number
  last_count_date: string | null
  last_count_qty: number | null
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  code: string
  name: string
  type: string
  address: string | null
  is_active: boolean
  created_at: string
}

// Intelligence Layer Types
export interface KPIDefinition {
  id: string
  code: string
  name: string
  description: string | null
  category: string
  formula_sql: string | null
  unit: string | null
  target_value: number | null
  warning_threshold: number | null
  critical_threshold: number | null
  threshold_direction: 'below' | 'above'
  calculation_frequency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AIInsight {
  id: string
  insight_type: 'anomaly' | 'recommendation' | 'forecast' | 'briefing' | 'alert'
  category: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  summary: string
  details: Json
  affected_entities: Json
  recommended_actions: Json
  confidence_score: number | null
  model_used: string | null
  prompt_tokens: number | null
  completion_tokens: number | null
  acknowledged_by: string | null
  acknowledged_at: string | null
  action_taken: string | null
  feedback: string | null
  expires_at: string | null
  is_dismissed: boolean
  created_at: string
}

export interface DeliveryRiskScore {
  id: string
  order_id: string
  overall_score: number
  material_score: number | null
  payment_score: number | null
  production_score: number | null
  schedule_score: number | null
  factors: Json
  on_time_probability: number | null
  expected_delay_days: number | null
  mitigation_actions: Json
  calculated_at: string
  analysis_run_id: string | null
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      models: { Row: Model; Insert: Partial<Model>; Update: Partial<Model> }
      engines: { Row: Engine; Insert: Partial<Engine>; Update: Partial<Engine> }
      components: { Row: Component; Insert: Partial<Component>; Update: Partial<Component> }
      packages: { Row: Package; Insert: Partial<Package>; Update: Partial<Package> }
      suppliers: { Row: Supplier; Insert: Partial<Supplier>; Update: Partial<Supplier> }
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> }
      quotes: { Row: Quote; Insert: Partial<Quote>; Update: Partial<Quote> }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      boats: { Row: Boat; Insert: Partial<Boat>; Update: Partial<Boat> }
      inventory: { Row: Inventory; Insert: Partial<Inventory>; Update: Partial<Inventory> }
      locations: { Row: Location; Insert: Partial<Location>; Update: Partial<Location> }
      kpi_definitions: { Row: KPIDefinition; Insert: Partial<KPIDefinition>; Update: Partial<KPIDefinition> }
      ai_insights: { Row: AIInsight; Insert: Partial<AIInsight>; Update: Partial<AIInsight> }
      delivery_risk_scores: { Row: DeliveryRiskScore; Insert: Partial<DeliveryRiskScore>; Update: Partial<DeliveryRiskScore> }
    }
  }
}
