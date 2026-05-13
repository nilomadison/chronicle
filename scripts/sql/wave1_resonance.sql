-- Wave 1 — Quiet Signals of Resonance
-- Adds reader marks, echo notes, and story view tracking.
-- Idempotent: safe to re-run.

BEGIN;

-- ===== Enums =====

DO $$ BEGIN
  CREATE TYPE mark_type AS ENUM ('resonated', 'recognized', 'reflected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE echo_note_status AS ENUM ('pending', 'delivered', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE view_source AS ENUM ('direct', 'archive', 'search', 'related', 'prompt', 'theme');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== reader_marks =====

CREATE TABLE IF NOT EXISTS reader_marks (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id           uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reader_account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  mark_type          mark_type NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reader_marks_story_id_idx
  ON reader_marks(story_id);

CREATE INDEX IF NOT EXISTS reader_marks_reader_id_idx
  ON reader_marks(reader_account_id);

CREATE UNIQUE INDEX IF NOT EXISTS reader_marks_unique
  ON reader_marks(story_id, reader_account_id, mark_type);

-- ===== echo_notes =====

CREATE TABLE IF NOT EXISTS echo_notes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id           uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  reader_account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  note_text          text NOT NULL,
  status             echo_note_status NOT NULL DEFAULT 'pending',
  rejection_reason   varchar(255),
  created_at         timestamptz NOT NULL DEFAULT now(),
  delivered_at       timestamptz,
  read_at            timestamptz
);

CREATE INDEX IF NOT EXISTS echo_notes_story_id_idx
  ON echo_notes(story_id);

CREATE INDEX IF NOT EXISTS echo_notes_status_idx
  ON echo_notes(status);

-- ===== story_views =====

CREATE TABLE IF NOT EXISTS story_views (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id           uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_account_id  uuid REFERENCES accounts(id) ON DELETE SET NULL,
  source             view_source NOT NULL DEFAULT 'direct',
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS story_views_story_id_idx
  ON story_views(story_id);

CREATE INDEX IF NOT EXISTS story_views_created_at_idx
  ON story_views(created_at);

COMMIT;
