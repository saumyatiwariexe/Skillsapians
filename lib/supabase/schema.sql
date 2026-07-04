-- ============================================================
-- Skillsapians — Supabase/Postgres Schema
-- Run this in Supabase SQL Editor to initialize the database.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- Table: reports
-- One row per verification session (one repo analysis)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_url              TEXT        NOT NULL,
  repo_owner            TEXT,
  repo_name             TEXT,
  skill_area            TEXT        NOT NULL DEFAULT 'fullstack',

  -- Module A — Git Forensics
  authenticity_score    INT,
  flags                 JSONB       DEFAULT '[]',
  commit_count          INT,
  time_span_days        FLOAT,
  initial_commit_ratio  FLOAT,
  is_fork               BOOLEAN     DEFAULT FALSE,

  -- Aggregated final score (filled after all questions answered)
  verified_skill_score  INT,
  flagged_for_review    BOOLEAN     DEFAULT FALSE,

  -- Status tracking
  status                TEXT        NOT NULL DEFAULT 'analyzing'
                        CHECK (status IN ('analyzing', 'questions_ready', 'in_progress', 'complete', 'error')),
  error_message         TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

-- -----------------------------------------------------------
-- Table: questions
-- One row per generated question within a report
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id             UUID        NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  question_id           TEXT        NOT NULL,   -- e.g. "q_01", "q_02" ...

  -- Module B — what we extracted
  file_path             TEXT        NOT NULL,
  function_name         TEXT,
  code_snippet          TEXT        NOT NULL,
  question_text         TEXT        NOT NULL,
  interest_score        FLOAT,
  callers               TEXT[]      DEFAULT '{}',
  callees               TEXT[]      DEFAULT '{}',

  -- The fact string embedded on the code side (for transparency in UI)
  fact_string           TEXT,

  -- Module C — user answer + scores
  user_answer           TEXT,
  semantic_similarity   FLOAT,
  entity_overlap        FLOAT,
  specificity_score     FLOAT,
  final_question_score  FLOAT,
  ai_generated_flag     BOOLEAN,

  answered_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (report_id, question_id)
);

-- -----------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_questions_report_id ON questions(report_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at  ON reports(created_at DESC);

-- -----------------------------------------------------------
-- Row Level Security (for Supabase — allow anonymous reads on reports)
-- -----------------------------------------------------------
ALTER TABLE reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Public can read any complete report (for share link)
CREATE POLICY "public_read_reports"
  ON reports FOR SELECT
  USING (status = 'complete');

-- Public can read questions for any report
CREATE POLICY "public_read_questions"
  ON questions FOR SELECT
  USING (TRUE);

-- Service role has full access (used by server-side API routes)
-- The SUPABASE_SERVICE_ROLE_KEY bypasses RLS — no explicit policy needed.
