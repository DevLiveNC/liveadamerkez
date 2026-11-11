-- Müşteri paneli: örnek işletme bayrağı, rezervasyon hesap bağı, favori.
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
