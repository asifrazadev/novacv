-- Auth.js + Drizzle ORM schema
-- Replaces Supabase / GoTrue / PostgREST stack

-- ── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id"                 TEXT         PRIMARY KEY,
  "name"               TEXT,
  "email"              TEXT         NOT NULL UNIQUE,
  "email_verified"     TIMESTAMPTZ,
  "image"              TEXT,
  "password_hash"      TEXT,
  "professional_title" TEXT,
  "bio"                TEXT,
  "created_at"         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── OAuth / linked accounts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id"            TEXT         NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type"               TEXT         NOT NULL,
  "provider"           TEXT         NOT NULL,
  "provider_account_id" TEXT        NOT NULL,
  "refresh_token"      TEXT,
  "access_token"       TEXT,
  "expires_at"         INTEGER,
  "token_type"         TEXT,
  "scope"              TEXT,
  "id_token"           TEXT,
  "session_state"      TEXT,
  PRIMARY KEY ("provider", "provider_account_id")
);

-- ── Sessions (for database-strategy fallback; JWT strategy doesn't need this) ─
CREATE TABLE IF NOT EXISTS "sessions" (
  "session_token"  TEXT        PRIMARY KEY,
  "user_id"        TEXT        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires"        TIMESTAMPTZ NOT NULL
);

-- ── Verification / password-reset tokens ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier"  TEXT        NOT NULL,
  "token"       TEXT        NOT NULL,
  "expires"     TIMESTAMPTZ NOT NULL,
  PRIMARY KEY ("identifier", "token")
);

-- ── Resumes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "resumes" (
  "id"         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    TEXT         NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title"      TEXT         NOT NULL,
  "data"       JSONB        NOT NULL DEFAULT '{}',
  "is_public"  BOOLEAN      NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "resumes_user_id_idx" ON "resumes"("user_id");

-- ── Job applications ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "job_applications" (
  "id"         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id"    TEXT         NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "company"    TEXT         NOT NULL,
  "position"   TEXT         NOT NULL,
  "status"     TEXT         NOT NULL DEFAULT 'wishlist',
  "url"        TEXT,
  "salary"     TEXT,
  "location"   TEXT,
  "notes"      TEXT,
  "applied_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "job_applications_user_id_idx" ON "job_applications"("user_id");
