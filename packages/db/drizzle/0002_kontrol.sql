-- Kontrol: ada_app parolasız NOLOGIN; OTP IP penceresi.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ada_app') THEN
    ALTER ROLE ada_app WITH NOLOGIN;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ada_app NOLOGIN atlandı: %', SQLERRM;
END $$;

ALTER TABLE otp_challenge ADD COLUMN IF NOT EXISTS ip_hash text;

CREATE TABLE IF NOT EXISTS otp_ip_window (
  ip_hash text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  send_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz
);

CREATE TABLE IF NOT EXISTS rate_limit_window (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 0
);
