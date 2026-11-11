-- Müşteri paneli: örnek işletme bayrağı, rezervasyon hesap bağı, favori.
-- 0004 işletme paneli, 0005 yönetim paneli; bu dosya 0006.
-- account_id ile sahiplik; müşteri başka hesabın kaydını göremez.

ALTER TABLE business
  ADD COLUMN IF NOT EXISTS sample boolean NOT NULL DEFAULT false;

ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES app_account (id);

CREATE INDEX IF NOT EXISTS booking_account_idx ON booking (account_id);

CREATE TABLE IF NOT EXISTS favorite (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES app_account (id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES business (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS favorite_account_tenant
  ON favorite (account_id, tenant_id);

CREATE INDEX IF NOT EXISTS favorite_account_idx ON favorite (account_id);

CREATE OR REPLACE FUNCTION app_current_account_id() RETURNS uuid
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN NULLIF(current_setting('app.account_id', true), '')::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;

ALTER TABLE favorite ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS favorite_account ON favorite;
CREATE POLICY favorite_account ON favorite
  USING (account_id = app_current_account_id())
  WITH CHECK (account_id = app_current_account_id());

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON favorite TO ada_app;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'favorite ada_app yetkileri atlandı: %', SQLERRM;
END $$;
