-- Ada Merkez çekirdek şema
-- Slotlar timestamptz (UTC) saklanır; gösterim Europe/Nicosia.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_kind AS ENUM ('slot', 'table');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE waitlist_role AS ENUM ('customer', 'business');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS category (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS location (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  name text NOT NULL,
  city_name text,
  kind text NOT NULL DEFAULT 'city',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES category (id),
  location_id uuid REFERENCES location (id),
  status text NOT NULL DEFAULT 'draft',
  timezone text NOT NULL DEFAULT 'Europe/Nicosia',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE location
  DROP CONSTRAINT IF EXISTS location_tenant_id_fkey;
ALTER TABLE location
  ADD CONSTRAINT location_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES business (id);

CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES business (id),
  location_id uuid REFERENCES location (id),
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES business (id),
  name text NOT NULL,
  duration_minutes integer NOT NULL,
  staff_id uuid REFERENCES staff (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT service_duration_positive CHECK (duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS resource (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES business (id),
  location_id uuid REFERENCES location (id),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'table',
  seats integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS availability_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES business (id),
  staff_id uuid REFERENCES staff (id),
  resource_id uuid REFERENCES resource (id),
  weekday smallint,
  starts_at_minutes integer NOT NULL,
  ends_at_minutes integer NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Nicosia',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT availability_weekday CHECK (weekday IS NULL OR (weekday >= 0 AND weekday <= 6)),
  CONSTRAINT availability_minutes CHECK (
    starts_at_minutes >= 0 AND ends_at_minutes > starts_at_minutes AND ends_at_minutes <= 1440
  )
);

CREATE TABLE IF NOT EXISTS customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES business (id),
  phone text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS customer_tenant_phone
  ON customer (tenant_id, phone);

CREATE TABLE IF NOT EXISTS consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES business (id),
  subject_type text NOT NULL,
  subject_id uuid,
  purpose text NOT NULL,
  granted boolean NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  text_version text NOT NULL,
  channel text NOT NULL DEFAULT 'web',
  retention_days integer NOT NULL,
  retain_until timestamptz NOT NULL,
  withdrawn_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES business (id),
  location_id uuid REFERENCES location (id),
  kind booking_kind NOT NULL,
  staff_id uuid REFERENCES staff (id),
  service_id uuid REFERENCES service (id),
  resource_id uuid REFERENCES resource (id),
  customer_id uuid REFERENCES customer (id),
  status booking_status NOT NULL DEFAULT 'pending',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  display_timezone text NOT NULL DEFAULT 'Europe/Nicosia',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT booking_time_order CHECK (ends_at > starts_at),
  CONSTRAINT booking_slot_staff CHECK (kind <> 'slot' OR staff_id IS NOT NULL),
  CONSTRAINT booking_table_resource CHECK (kind <> 'table' OR resource_id IS NOT NULL)
);

ALTER TABLE booking DROP CONSTRAINT IF EXISTS booking_staff_overlap_excl;
ALTER TABLE booking
  ADD CONSTRAINT booking_staff_overlap_excl
  EXCLUDE USING gist (
    tenant_id WITH =,
    staff_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (staff_id IS NOT NULL AND status IN ('pending', 'confirmed'));

ALTER TABLE booking DROP CONSTRAINT IF EXISTS booking_resource_overlap_excl;
ALTER TABLE booking
  ADD CONSTRAINT booking_resource_overlap_excl
  EXCLUDE USING gist (
    tenant_id WITH =,
    resource_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
  )
  WHERE (resource_id IS NOT NULL AND status IN ('pending', 'confirmed'));

CREATE INDEX IF NOT EXISTS booking_tenant_starts_idx
  ON booking (tenant_id, starts_at);

CREATE TABLE IF NOT EXISTS waitlist_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role waitlist_role NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  city text,
  consent_id uuid NOT NULL REFERENCES consent (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_phone_role
  ON waitlist_entry (phone, role);

CREATE TABLE IF NOT EXISTS deletion_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text,
  email text,
  status text NOT NULL DEFAULT 'received',
  details text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT deletion_contact CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS otp_challenge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  purpose text NOT NULL DEFAULT 'login',
  code_hash text,
  send_count integer NOT NULL DEFAULT 0,
  attempt_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  last_sent_at timestamptz,
  locked_until timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS otp_phone_purpose_idx
  ON otp_challenge (phone, purpose);

-- Kiracı RLS (uygulama app.tenant_id oturum değişkenini set eder)
CREATE OR REPLACE FUNCTION app_current_tenant_id() RETURNS uuid
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN NULLIF(current_setting('app.tenant_id', true), '')::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS staff_tenant ON staff;
CREATE POLICY staff_tenant ON staff
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

ALTER TABLE service ENABLE ROW LEVEL SECURITY;
ALTER TABLE service FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_tenant ON service;
CREATE POLICY service_tenant ON service
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

ALTER TABLE resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS resource_tenant ON resource;
CREATE POLICY resource_tenant ON resource
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

ALTER TABLE availability_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rule FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS availability_tenant ON availability_rule;
CREATE POLICY availability_tenant ON availability_rule
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

ALTER TABLE booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS booking_tenant ON booking;
CREATE POLICY booking_tenant ON booking
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customer_tenant ON customer;
CREATE POLICY customer_tenant ON customer
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

ALTER TABLE business ENABLE ROW LEVEL SECURITY;
ALTER TABLE business FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS business_self ON business;
CREATE POLICY business_self ON business
  USING (id = app_current_tenant_id())
  WITH CHECK (id = app_current_tenant_id());

-- Uygulama rolü (CI / yerel postgres). Neon'da yetki yoksa atlanır.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ada_app') THEN
    CREATE ROLE ada_app NOLOGIN;
  ELSE
    BEGIN
      ALTER ROLE ada_app WITH NOLOGIN;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'ada_app NOLOGIN yapılamadı: %', SQLERRM;
    END;
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'ada_app rolü oluşturulamadı; API düzeyinde kiracı süzmesi geçerlidir.';
END $$;

DO $$
BEGIN
  GRANT USAGE ON SCHEMA public TO ada_app;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ada_app;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ada_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ada_app;
  GRANT ada_app TO CURRENT_USER;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ada_app yetkileri atlandı: %', SQLERRM;
END $$;

INSERT INTO category (slug, name, kind)
VALUES
  ('kuafor', 'Kuaför', 'hair'),
  ('klinik', 'Klinik', 'clinic'),
  ('restoran', 'Restoran', 'restaurant')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO location (id, tenant_id, name, city_name, kind)
VALUES
  ('a0000000-0000-4000-8000-000000000001', NULL, 'Lefkoşa', 'Lefkoşa', 'city'),
  ('a0000000-0000-4000-8000-000000000002', NULL, 'Girne', 'Girne', 'city'),
  ('a0000000-0000-4000-8000-000000000003', NULL, 'Mağusa', 'Mağusa', 'city')
ON CONFLICT (id) DO NOTHING;
