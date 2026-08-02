
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  readiness_score INT NOT NULL,
  resume_score INT NOT NULL,
  ats_score INT NOT NULL,
  technical_score INT NOT NULL,
  communication_score INT NOT NULL,
  github_score INT NOT NULL,
  linkedin_score INT NOT NULL,
  summary TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  skill_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
  company_fit JSONB NOT NULL DEFAULT '[]'::jsonb,
  radar JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyses TO authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own analyses" ON public.analyses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX analyses_user_created_idx ON public.analyses(user_id, created_at DESC);
