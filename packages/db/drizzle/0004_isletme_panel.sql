-- İşletme paneli: kiracı üyeliği, işletme profili, rezervasyon kanalı.
-- 0003_app_account.sql hesap tablosunu kurar. Admin rolü yalnızca seed / sunucu SQL ile atanır.

DO $$ BEGIN
  CREATE TYPE business_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE business SET status = 'pending' WHERE status IN ('pending_approval', 'received', 'review');
UPDATE business SET status = 'rejected' WHERE status IN ('declined');
UPDATE business SET status = 'approved' WHERE status IN ('active', 'published');
UPDATE business SET status = 'draft' WHERE status NOT IN ('draft', 'pending', 'approved', 'rejected');

ALTER TABLE business ALTER COLUMN status DROP DEFAULT;
ALTER TABLE business
  ALTER COLUMN status TYPE business_status USING status::business_status;
ALTER TABLE business ALTER COLUMN status SET DEFAULT 'draft'::business_status;

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

CREATE TABLE IF NOT EXISTS business_member (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_account (id),
  tenant_id uuid NOT NULL REFERENCES business (id),
  member_role text NOT NULL DEFAULT 'owner',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT business_member_role_check CHECK (member_role IN ('owner', 'staff')),
  CONSTRAINT business_member_user_tenant UNIQUE (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS business_member_user_idx ON business_member (user_id);
CREATE INDEX IF NOT EXISTS business_member_tenant_idx ON business_member (tenant_id);

ALTER TABLE service
  ADD COLUMN IF NOT EXISTS price_label text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'app',
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

ALTER TABLE booking DROP CONSTRAINT IF EXISTS booking_channel_check;
ALTER TABLE booking
  ADD CONSTRAINT booking_channel_check CHECK (channel IN ('app', 'whatsapp'));

ALTER TABLE business_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_member FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS isletme_business_member_tenant ON business_member;
CREATE POLICY isletme_business_member_tenant ON business_member
  USING (tenant_id = app_current_tenant_id())
  WITH CHECK (tenant_id = app_current_tenant_id());

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON business_member TO ada_app;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'isletme paneli ada_app yetkileri atlandı: %', SQLERRM;
END $$;
