-- ============================================================
-- Skillsapians - Supabase/Postgres Schema
-- Run this in Supabase SQL Editor to initialize or update the database.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- Table: profiles
-- One row per authenticated GitHub OAuth user.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  company     TEXT,
  website     TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- Table: reports
-- One row per verification session.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  repo_url              TEXT NOT NULL,
  repo_owner            TEXT,
  repo_name             TEXT,
  skill_area            TEXT NOT NULL DEFAULT 'overall',

  authenticity_score    INT,
  flags                 JSONB DEFAULT '[]'::jsonb,
  commit_count          INT,
  time_span_days        FLOAT,
  initial_commit_ratio  FLOAT,
  is_fork               BOOLEAN DEFAULT FALSE,

  verified_skill_score  INT,
  point_score           INT DEFAULT 0,
  badge                 JSONB,
  flagged_for_review    BOOLEAN DEFAULT FALSE,

  status                TEXT NOT NULL DEFAULT 'analyzing'
                        CHECK (status IN ('analyzing', 'questions_ready', 'in_progress', 'complete', 'error', 'pending')),
  error_message         TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

-- -----------------------------------------------------------
-- Table: questions
-- One row per generated question within a report.
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id             UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  question_id           TEXT NOT NULL,

  file_path             TEXT NOT NULL,
  function_name         TEXT,
  skill_focus           TEXT,
  code_snippet          TEXT NOT NULL,
  question_text         TEXT NOT NULL,
  interest_score        FLOAT,
  callers               JSONB DEFAULT '[]'::jsonb,
  callees               JSONB DEFAULT '[]'::jsonb,

  fact_string           TEXT,
  user_answer           TEXT,
  semantic_similarity   FLOAT,
  entity_overlap        FLOAT,
  specificity_score     FLOAT,
  time_score            FLOAT,
  time_taken_seconds    INT DEFAULT 0,
  tab_out_count         INT DEFAULT 0,
  integrity_penalty     FLOAT DEFAULT 0,
  final_question_score  FLOAT,
  ai_generated_flag     BOOLEAN,

  answered_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (report_id, question_id)
);

-- Backfill-friendly additions for existing hackathon databases.
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS point_score INT DEFAULT 0;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS badge JSONB;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS skill_focus TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS time_score FLOAT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS time_taken_seconds INT DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS tab_out_count INT DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS integrity_penalty FLOAT DEFAULT 0;

-- -----------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_report_id ON public.questions(report_id);

-- -----------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public report links are intentionally shareable.
CREATE POLICY "public_read_reports"
  ON public.reports FOR SELECT
  USING (TRUE);

CREATE POLICY "public_read_questions"
  ON public.questions FOR SELECT
  USING (TRUE);

-- API routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS for writes.
