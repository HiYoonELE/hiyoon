-- =============================================
-- HIYOON SCHEMA UPDATE v4
-- Run this in Supabase SQL Editor
-- Name it: "Schema Update v4 - Provider document resume link"
-- =============================================

-- Add a resume token so providers can come back and finish uploading
-- compliance documents after submitting their application, plus a
-- record of which document types have been received so far.
alter table providers
  add column if not exists application_token text unique,
  add column if not exists submitted_documents text[] default '{}';

-- Backfill tokens for any existing providers
update providers
set application_token = encode(gen_random_bytes(16), 'hex')
where application_token is null;

-- Auto-generate a token on new provider applications
create or replace function generate_application_token()
returns trigger as $$
begin
  if new.application_token is null then
    new.application_token := encode(gen_random_bytes(16), 'hex');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_application_token on providers;
create trigger set_application_token
before insert on providers
for each row execute function generate_application_token();
