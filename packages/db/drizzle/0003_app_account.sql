-- PWA oturum hesapları (müşteri / işletme / yönetici).
-- Yönetici rolü yalnızca sunucu tarafında atanır; kayıt ucu oluşturmaz.

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('customer', 'business', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS app_account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  email text,
  name text,
  role app_role NOT NULL,
  tenant_id uuid REFERENCES business (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS app_account_phone_role ON app_account (phone, role);
CREATE UNIQUE INDEX IF NOT EXISTS app_account_email_role ON app_account (email, role) WHERE email IS NOT NULL;
