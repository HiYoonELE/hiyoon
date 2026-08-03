-- =============================================
-- ROUTE BRIDGE DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- CATEGORIES
-- =============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  icon text,
  active boolean default true,
  created_at timestamptz default now()
);

insert into categories (name, icon) values
  ('School & Daycare', '🏫'),
  ('Senior Transportation', '🏥'),
  ('NEMT', '♿'),
  ('Group & Charter', '🚐'),
  ('Youth Programs', '⚽'),
  ('Adult Day Programs', '🌿'),
  ('Other', '✏️');

-- =============================================
-- SERVICE AREAS
-- =============================================
create table service_areas (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  state text default 'MA',
  active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- CUSTOMERS
-- =============================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  preferred_contact text default 'email',
  created_at timestamptz default now()
);

-- =============================================
-- TRANSPORTATION REQUESTS
-- =============================================
create table transportation_requests (
  id uuid primary key default uuid_generate_v4(),
  reference_number text unique not null,
  customer_id uuid references customers(id),

  -- Category
  category text not null,

  -- Route
  pickup_address text not null,
  dropoff_address text not null,
  pickup_city text,
  dropoff_city text,

  -- Passengers
  passenger_count int not null default 1,
  passenger_age_grade text,

  -- Schedule
  trip_type text not null, -- recurring, one-time, flexible
  days_needed text,
  pickup_time text,
  return_time text,
  start_date date,
  duration text,

  -- Special requirements
  wheelchair_accessible boolean default false,
  car_seat_needed boolean default false,
  medical_monitoring boolean default false,
  aide_needed boolean default false,
  shared_ride_ok boolean default true,
  private_only boolean default false,
  multilingual_driver boolean default false,
  background_checked boolean default false,
  special_notes text,

  -- Budget & urgency
  budget_range text,
  urgency text,

  -- Admin
  status text default 'new',
  -- new | reviewed | sent_to_providers | provider_interested |
  -- quote_received | customer_contacted | booked | lost | not_serviceable
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-generate reference numbers
create or replace function generate_reference_number()
returns trigger as $$
begin
  new.reference_number := 'RL-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');
  return new;
end;
$$ language plpgsql;

create trigger set_reference_number
before insert on transportation_requests
for each row execute function generate_reference_number();

-- =============================================
-- PROVIDERS
-- =============================================
create table providers (
  id uuid primary key default uuid_generate_v4(),

  -- Company info
  company_name text not null,
  contact_person text not null,
  title text,
  phone text not null,
  email text not null unique,
  website text,
  description text,

  -- Service
  service_areas text[], -- array of city/zip names
  categories_served text[],
  vehicle_types text[],

  -- Capabilities
  wheelchair_accessible boolean default false,
  car_seats_available boolean default false,
  recurring_routes boolean default false,
  one_time_trips boolean default false,
  background_checked boolean default false,
  licensed_insured boolean default false,

  -- Fleet
  vehicle_count int,
  max_passenger_capacity int,
  insurance_notes text,

  -- Admin
  approval_status text default 'pending',
  -- pending | approved | rejected | suspended
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- LEAD MATCHES (admin assigns requests to providers)
-- =============================================
create table lead_matches (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references transportation_requests(id),
  provider_id uuid references providers(id),
  sent_at timestamptz,
  status text default 'pending',
  -- pending | sent | interested | not_interested | need_more_info
  created_at timestamptz default now(),
  unique(request_id, provider_id)
);

-- =============================================
-- QUOTES (providers respond with pricing)
-- =============================================
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references transportation_requests(id),
  provider_id uuid references providers(id),
  lead_match_id uuid references lead_matches(id),

  price_amount numeric(10,2),
  price_period text, -- per_trip | per_week | per_month
  vehicle_type text,
  is_shared boolean default false,
  available_start_date date,
  notes text,
  expires_at timestamptz,

  status text default 'submitted',
  -- submitted | sent_to_customer | accepted | declined
  created_at timestamptz default now()
);

-- =============================================
-- ADMIN NOTES
-- =============================================
create table admin_notes (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null, -- request | provider | quote
  entity_id uuid not null,
  note text not null,
  created_by text default 'admin',
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- Public can insert requests and providers (signups)
-- Only service role can read/update everything
-- =============================================

alter table transportation_requests enable row level security;
alter table customers enable row level security;
alter table providers enable row level security;
alter table lead_matches enable row level security;
alter table quotes enable row level security;
alter table admin_notes enable row level security;
alter table categories enable row level security;
alter table service_areas enable row level security;

-- Public can read categories
create policy "Anyone can read categories"
  on categories for select using (true);

-- Public can read service areas
create policy "Anyone can read service areas"
  on service_areas for select using (true);

-- Public can submit requests (insert only)
create policy "Anyone can submit a request"
  on transportation_requests for insert with check (true);

-- Public can insert customers
create policy "Anyone can create a customer record"
  on customers for insert with check (true);

-- Public can submit provider applications
create policy "Anyone can apply as a provider"
  on providers for insert with check (true);

-- Service role has full access to everything
-- (your admin dashboard uses the service role key)
