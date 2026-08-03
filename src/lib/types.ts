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

export type LeadMatchStatus = 'pending' | 'sent' | 'interested' | 'not_interested' | 'need_more_info'

export type QuoteStatus = 'submitted' | 'sent_to_customer' | 'accepted' | 'declined'

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
  dropoff_city?: string

  passenger_count: number
  passenger_age_grade?: string

  trip_type: string
  days_needed?: string
  pickup_time?: string
  return_time?: string
  start_date?: string
  duration?: string

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

// Form submission types
export interface IntakeFormData {
  category: string
  pickup_address: string
  dropoff_address: string
  passenger_count: number
  passenger_age_grade: string
  trip_type: string
  days_needed: string
  pickup_time: string
  return_time: string
  start_date: string
  duration: string
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
