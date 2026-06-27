-- Add TOTP (authenticator app) 2FA columns to users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "totp_secret"  TEXT,
  ADD COLUMN IF NOT EXISTS "totp_enabled" BOOLEAN NOT NULL DEFAULT FALSE;
