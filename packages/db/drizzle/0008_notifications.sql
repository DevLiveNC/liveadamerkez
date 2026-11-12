-- Müşteri uygulama içi bildirimleri. WhatsApp kanalı ayrı adapter; bu tablo in-app kaydıdır.

CREATE TABLE IF NOT EXISTS app_notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES app_account (id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  booking_id uuid REFERENCES booking (id) ON DELETE SET NULL,
  payload jsonb,
  channel text NOT NULL DEFAULT 'in_app',
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_notification_account_idx
  ON app_notification (account_id, created_at DESC);

ALTER TABLE app_notification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS app_notification_account ON app_notification;
CREATE POLICY app_notification_account ON app_notification
  USING (account_id = app_current_account_id())
  WITH CHECK (account_id = app_current_account_id());

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON app_notification TO ada_app;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'app_notification ada_app yetkileri atlandı: %', SQLERRM;
END $$;
