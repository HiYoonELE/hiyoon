-- =============================================
-- ROUTE BRIDGE SCHEMA UPDATE v3
-- Run this in Supabase SQL Editor
-- Name it: "Schema Update v3 - Quotes & Offers"
-- =============================================

-- Add quote token to transportation_requests
-- This is the unique token used in the customer's offer page URL
alter table transportation_requests
  add column if not exists offer_token text unique,
  add column if not exists offers_close_at timestamptz,
  add column if not exists selected_quote_id uuid,
  add column if not exists customer_confirmed_at timestamptz;

-- Generate offer tokens for existing requests
update transportation_requests
set offer_token = encode(gen_random_bytes(16), 'hex')
where offer_token is null;

-- Add quote token to lead_matches for provider quote submission
alter table lead_matches
  add column if not exists quote_token text unique,
  add column if not exists quote_submitted_at timestamptz,
  add column if not exists quote_vehicle_type text,
  add column if not exists quote_available_start date,
  add column if not exists quote_notes text,
  add column if not exists quote_is_private boolean default false;

-- Generate quote tokens for existing lead matches
update lead_matches
set quote_token = encode(gen_random_bytes(16), 'hex')
where quote_token is null;

-- Function to auto-generate offer token on new requests
create or replace function generate_offer_token()
returns trigger as $$
begin
  if new.offer_token is null then
    new.offer_token := encode(gen_random_bytes(16), 'hex');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_offer_token on transportation_requests;
create trigger set_offer_token
before insert on transportation_requests
for each row execute function generate_offer_token();

-- Function to auto-generate quote token on new lead matches
create or replace function generate_quote_token()
returns trigger as $$
begin
  if new.quote_token is null then
    new.quote_token := encode(gen_random_bytes(16), 'hex');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_quote_token on lead_matches;
create trigger set_quote_token
before insert on lead_matches
for each row execute function generate_quote_token();

-- Allow public to read requests by offer_token (for the customer offer page)
create policy if not exists "Public can view request by offer token"
  on transportation_requests for select
  using (offer_token is not null);

-- Allow public to read lead_matches by quote_token (for provider quote form)
create policy if not exists "Public can view lead match by quote token"
  on lead_matches for select
  using (quote_token is not null);

-- Allow public to update lead_matches to submit a quote
create policy if not exists "Public can submit quote via token"
  on lead_matches for update
  using (quote_token is not null);
