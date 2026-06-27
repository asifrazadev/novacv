-- Add view tracking columns to resumes
ALTER TABLE "resumes"
  ADD COLUMN IF NOT EXISTS "view_count"    INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_viewed_at" TIMESTAMPTZ;
