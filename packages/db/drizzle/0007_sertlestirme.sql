-- Yönetici RLS yolu: ada_app + app.is_admin. FORCE yok; giriş getDb() ile tablo sahibinde kalır.
-- 0006 müşteri paneli içindir; eski 0006_sertlestirme journal kaydı varsa düşer.

DELETE FROM schema_migration WHERE id = '0006_sertlestirme.sql';

ALTER TABLE app_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_application ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS yonetim_admin_account ON app_account;
CREATE POLICY yonetim_admin_account ON app_account
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS yonetim_admin_application ON business_application;
CREATE POLICY yonetim_admin_application ON business_application
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DROP POLICY IF EXISTS yonetim_admin_category ON category;
CREATE POLICY yonetim_admin_category ON category
  USING (current_setting('app.is_admin', true) = 'true')
  WITH CHECK (current_setting('app.is_admin', true) = 'true');

DO $$
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON app_account, business_application, category TO ada_app;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'sertleştirme ada_app yetkileri atlandı: %', SQLERRM;
END $$;
