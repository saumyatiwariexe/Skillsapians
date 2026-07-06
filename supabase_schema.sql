CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT,
    website TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    repo_url TEXT NOT NULL,
    repo_owner TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    skill_area TEXT NOT NULL,
    authenticity_score NUMERIC,
    flags JSONB DEFAULT '[]'::jsonb,
    commit_count INTEGER,
    time_span_days NUMERIC,
    initial_commit_ratio NUMERIC,
    is_fork BOOLEAN,
    status TEXT DEFAULT 'pending',
    verified_skill_score NUMERIC,
    point_score INTEGER DEFAULT 0,
    badge JSONB,
    flagged_for_review BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    file_path TEXT,
    function_name TEXT,
    skill_focus TEXT,
    code_snippet TEXT,
    question_text TEXT,
    interest_score NUMERIC,
    callers JSONB DEFAULT '[]'::jsonb,
    callees JSONB DEFAULT '[]'::jsonb,
    user_answer TEXT,
    fact_string TEXT,
    semantic_similarity NUMERIC,
    entity_overlap NUMERIC,
    specificity_score NUMERIC,
    time_score NUMERIC,
    time_taken_seconds INTEGER DEFAULT 0,
    tab_out_count INTEGER DEFAULT 0,
    integrity_penalty NUMERIC DEFAULT 0,
    final_question_score NUMERIC,
    ai_generated_flag BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (report_id, question_id)
);

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS point_score INTEGER DEFAULT 0;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS badge JSONB;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS skill_focus TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS time_score NUMERIC;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS tab_out_count INTEGER DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS integrity_penalty NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_report_id ON public.questions(report_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow public read access to reports"
ON public.reports
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public read access to questions"
ON public.questions
FOR SELECT
TO public
USING (true);

CREATE POLICY "reports_update_own"
ON public.reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ── Auto-create a profile row on first sign-up ───────────────────────────────
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
