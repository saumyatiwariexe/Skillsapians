-- ============================================================
-- Skillsapians - Supabase/Postgres Schema (AUTHORITATIVE)
-- Run this ONCE in the Supabase SQL Editor. Idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- This file is the single source of truth — supersedes supabase_schema.sql at repo root.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- Table: profiles
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
  status                TEXT NOT NULL DEFAULT 'questions_ready',
  verified_skill_score  INT,
  point_score           INT DEFAULT 0,
  badge                 JSONB,
  flagged_for_review    BOOLEAN DEFAULT FALSE,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------
-- Table: questions
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

-- Backfill any missing columns on an already-created table (safe to re-run).
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

DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public report links are intentionally shareable.
DROP POLICY IF EXISTS "public_read_reports" ON public.reports;
CREATE POLICY "public_read_reports"
  ON public.reports FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "public_read_questions" ON public.questions;
CREATE POLICY "public_read_questions"
  ON public.questions FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "reports_update_own" ON public.reports;
CREATE POLICY "reports_update_own"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------
-- Auto-create a profile row on first sign-up
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- API routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS for writes.
