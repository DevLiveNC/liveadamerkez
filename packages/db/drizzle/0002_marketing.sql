-- Pazarlama: UTM/ref, bekleme listesi alanları, işletme başvurusu, davet kodu.

ALTER TABLE waitlist_entry
  ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE waitlist_entry
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS first_touch jsonb,
  ADD COLUMN IF NOT EXISTS last_touch jsonb,
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by_code text,
  ADD COLUMN IF NOT EXISTS event_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE waitlist_entry
  DROP CONSTRAINT IF EXISTS waitlist_contact_present;
ALTER TABLE waitlist_entry
  ADD CONSTRAINT waitlist_contact_present CHECK (
    (phone IS NOT NULL AND phone <> '') OR (email IS NOT NULL AND email <> '')
  );

DROP INDEX IF EXISTS waitlist_phone_role;
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_phone_unique
  ON waitlist_entry (phone) WHERE phone IS NOT NULL AND phone <> '';
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique
  ON waitlist_entry (email) WHERE email IS NOT NULL AND email <> '';
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_referral_code_unique
  ON waitlist_entry (referral_code) WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_application (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  sector text NOT NULL,
  city text,
  in_turkey boolean NOT NULL DEFAULT false,
  include_in_discovery boolean NOT NULL DEFAULT false,
  contact_name text NOT NULL,
  phone text NOT NULL,
  email text,
  whatsapp text,
  notes text,
  consent_id uuid NOT NULL REFERENCES consent (id),
  first_touch jsonb,
  last_touch jsonb,
  referral_code text,
  referred_by_code text,
  event_id text,
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS business_application_phone_unique
  ON business_application (phone) WHERE phone IS NOT NULL AND phone <> '';
CREATE UNIQUE INDEX IF NOT EXISTS business_application_email_unique
  ON business_application (email) WHERE email IS NOT NULL AND email <> '';

CREATE TABLE IF NOT EXISTS referral (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  owner_kind text NOT NULL,
  owner_id uuid NOT NULL,
  click_count integer NOT NULL DEFAULT 0,
  signup_count integer NOT NULL DEFAULT 0,
  first_booking_at timestamptz,
  hook_status text NOT NULL DEFAULT 'issued',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_owner_idx ON referral (owner_kind, owner_id);

ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS first_touch jsonb,
  ADD COLUMN IF NOT EXISTS last_touch jsonb,
  ADD COLUMN IF NOT EXISTS referred_by_code text,
  ADD COLUMN IF NOT EXISTS event_id text;

ALTER TABLE customer
  ADD COLUMN IF NOT EXISTS first_touch jsonb,
  ADD COLUMN IF NOT EXISTS last_touch jsonb,
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by_code text;

CREATE TABLE IF NOT EXISTS analytics_dispatch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_id text NOT NULL,
  channel text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS analytics_dispatch_event_id
  ON analytics_dispatch (event_id, event_name);
