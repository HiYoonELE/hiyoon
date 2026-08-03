export type RequestStatus =
  | 'new'
  | 'reviewed'
  | 'sent_to_providers'
  | 'provider_interested'
  | 'quote_received'
  | 'customer_contacted'
  | 'booked'
  | 'lost'
  | 'not_serviceable'

export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type LeadMatchStatus = 'pending' | 'sent' | 'interested' | 'not_interested' | 'need_more_info' | 'quoted' | 'booked'

export type QuoteStatus = 'submitted' | 'sent_to_customer' | 'accepted' | 'declined'

export type BookingStatus = 'active' | 'completed' | 'cancelled' | 'fell_through'

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  preferred_contact: string
  created_at: string
}

export interface TransportationRequest {
  id: string
  reference_number: string
  customer_id: string
  customer?: Customer

  category: string
  pickup_address: string
  dropoff_address: string
  pickup_city?: string
  pickup_zip?: string
  dropoff_city?: string
  dropoff_zip?: string

  passenger_count: number
  passenger_age_grade?: string

  trip_type: string
  days_needed?: string
  pickup_time?: string
  return_time?: string
  start_date?: string
  duration?: string
  duration_months?: number

  wheelchair_accessible: boolean
  car_seat_needed: boolean
  medical_monitoring: boolean
  aide_needed: boolean
  shared_ride_ok: boolean
  private_only: boolean
  multilingual_driver: boolean
  background_checked: boolean
  special_notes?: string

  budget_range?: string
  urgency?: string
  how_did_you_hear?: string
  is_repeat_customer?: boolean

  // Booking outcome
  booked_price?: number
  booked_price_period?: string
  contract_value_monthly?: number
  contract_value_annual?: number
  winning_provider_id?: string
  booked_at?: string

  status: RequestStatus
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface Provider {
  id: string
  company_name: string
  contact_person: string
  title?: string
  phone: string
  email: string
  website?: string
  description?: string

  service_areas?: string[]
  categories_served?: string[]
  vehicle_types?: string[]

  wheelchair_accessible: boolean
  car_seats_available: boolean
  recurring_routes: boolean
  one_time_trips: boolean
  background_checked: boolean
  licensed_insured: boolean

  vehicle_count?: number
  max_passenger_capacity?: number
  insurance_notes?: string

  approval_status: ProviderStatus
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface LeadMatch {
  id: string
  request_id: string
  provider_id: string
  provider?: Provider
  sent_at?: string
  status: LeadMatchStatus
  response_at?: string
  response_type?: string
  response_notes?: string
  quoted_price?: number
  quoted_price_period?: string
  days_to_respond?: number
  created_at: string
}

export interface Quote {
  id: string
  request_id: string
  provider_id: string
  provider?: Provider
  lead_match_id?: string

  price_amount?: number
  price_period?: string
  vehicle_type?: string
  is_shared: boolean
  available_start_date?: string
  notes?: string
  expires_at?: string

  status: QuoteStatus
  created_at: string
}

export interface AdminNote {
  id: string
  entity_type: string
  entity_id: string
  note: string
  created_by: string
  created_at: string
}

export interface Booking {
  id: string
  request_id: string
  provider_id: string
  lead_match_id?: string
  provider?: Provider
  request?: TransportationRequest

  monthly_price?: number
  price_period: string
  duration_months?: number
  annual_value?: number
  total_contract_value?: number

  pickup_city?: string
  pickup_zip?: string
  dropoff_city?: string
  dropoff_zip?: string
  is_private: boolean
  passenger_count?: number
  category?: string

  service_start_date?: string
  service_end_date?: string
  booked_at: string

  status: BookingStatus
  cancellation_reason?: string
  ended_at?: string
  notes?: string

  created_at: string
  updated_at: string
}

export interface ProviderPerformance {
  provider_id: string
  company_name: string
  email: string
  service_areas?: string[]
  approval_status: string
  total_leads_received: number
  total_leads_responded: number
  leads_interested: number
  leads_quoted: number
  total_bookings: number
  win_rate_pct: number
  avg_response_days: number
  avg_booking_price: number
  total_annual_value: number
  last_lead_sent?: string
  last_booking?: string
}

export interface GeographicIntelligence {
  city: string
  zip?: string
  total_requests: number
  total_booked: number
  booking_rate_pct: number
  private_requests: number
  shared_requests: number
  avg_monthly_spend?: number
  max_monthly_spend?: number
  min_monthly_spend?: number
  total_annual_value?: number
  car_seat_requests: number
  wheelchair_requests: number
}

export interface LeadHistory {
  lead_match_id: string
  sent_at: string
  lead_status: string
  response_type?: string
  response_at?: string
  days_to_respond?: number
  quoted_price?: number
  quoted_price_period?: string
  request_id: string
  reference_number: string
  category: string
  pickup_address: string
  dropoff_address: string
  pickup_city?: string
  dropoff_city?: string
  passenger_count: number
  request_status: string
  booked_price?: number
  provider_id: string
  company_name: string
  provider_email: string
  booking_id?: string
  booked_monthly_price?: number
  booked_annual_value?: number
  booking_status?: string
}

// Form submission types
export interface IntakeFormData {
  category: string
  pickup_address: string
  dropoff_address: string
  pickup_city?: string
  pickup_zip?: string
  dropoff_city?: string
  dropoff_zip?: string
  passenger_count: number
  passenger_age_grade: string
  trip_type: string
  days_needed: string
  pickup_time: string
  return_time: string
  start_date: string
  duration: string
  duration_months?: number
  wheelchair_accessible: boolean
  car_seat_needed: boolean
  medical_monitoring: boolean
  aide_needed: boolean
  shared_ride_ok: boolean
  private_only: boolean
  multilingual_driver: boolean
  background_checked: boolean
  special_notes: string
  budget_range: string
  urgency: string
  how_did_you_hear: string
  name: string
  email: string
  phone: string
  preferred_contact: string
}

export interface ProviderFormData {
  company_name: string
  contact_person: string
  title: string
  phone: string
  email: string
  website: string
  description: string
  service_areas: string
  categories_served: string[]
  vehicle_types: string[]
  wheelchair_accessible: boolean
  car_seats_available: boolean
  recurring_routes: boolean
  one_time_trips: boolean
  background_checked: boolean
  licensed_insured: boolean
  vehicle_count: string
  max_passenger_capacity: string
  insurance_notes: string
}
