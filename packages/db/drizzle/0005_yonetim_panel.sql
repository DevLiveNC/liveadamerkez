-- Yönetici paneli: denetim kaydı, admin RLS, işletme durum birliği.
-- 0003_app_account.sql hesap tablosunu kurar. 0004_isletme_panel.sql (varsa) business_status enum'unu kurar.
-- Admin rolü yalnızca seed / sunucu SQL ile atanır (ALLOW_ADMIN_SEED).

UPDATE business SET status = 'pending' WHERE status::text IN ('pending_approval', 'received', 'review');
UPDATE business SET status = 'rejected' WHERE status::text IN ('declined');
UPDATE business SET status = 'approved' WHERE status::text IN ('active', 'published');
UPDATE business SET status = 'draft' WHERE status::text NOT IN ('draft', 'pending', 'approved', 'rejected');

ALTER TABLE business
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS city_name text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS in_turkey boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES app_account (id);

ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'app',
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

ALTER TABLE booking DROP CONSTRAINT IF EXISTS booking_channel_check;
ALTER TABLE booking
  ADD CONSTRAINT booking_channel_check CHECK (channel IN ('app', 'whatsapp'));

ALTER TABLE category
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES app_account (id),
  action text NOT NULL,
  entity_kind text NOT NULL,
  entity_id uuid,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);

DROP POLICY IF EXISTS yonetim_admin_business ON business;
CREATE POLICY yonetim_admin_business ON business
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS yonetim_admin_booking ON booking;
CREATE POLICY yonetim_admin_booking ON booking
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS yonetim_admin_staff ON staff;
CREATE POLICY yonetim_admin_staff ON staff
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS yonetim_admin_service ON service;
CREATE POLICY yonetim_admin_service ON service
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS yonetim_admin_audit ON audit_log;
CREATE POLICY yonetim_admin_audit ON audit_log
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON audit_log TO ada_app;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'yonetim paneli ada_app yetkileri atlandı: %', SQLERRM;
END $$;
