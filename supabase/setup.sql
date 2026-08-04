-- Placify AI — complete database setup (app + admin panel).
--
-- Paste this whole file into the Supabase SQL Editor and hit Run.
--
-- Safe to run on a fresh project OR on one that already has some of these
-- objects: every statement is idempotent, so re-running it will not error
-- and will not destroy existing data.
--
-- There is ONE line to edit, at the very bottom, to choose the admin account.

-- ═════════════════════════════════════════════════════════════════════════
-- 1. PROFILES
-- ═════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  college TEXT,
  degree TEXT,
  branch TEXT,
  gpa TEXT,
  graduation_year TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  leetcode_url TEXT,
  hackerrank_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Used by the admin panel; not present in the original schema.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ═════════════════════════════════════════════════════════════════════════
-- 2. RESUMES
-- ═════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own resumes" ON public.resumes;
CREATE POLICY "Users manage own resumes" ON public.resumes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═════════════════════════════════════════════════════════════════════════
-- 3. ANALYSES
-- ═════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.analyses (
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

DROP POLICY IF EXISTS "Users manage own analyses" ON public.analyses;
CREATE POLICY "Users manage own analyses" ON public.analyses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analyses_user_created_idx
  ON public.analyses(user_id, created_at DESC);

-- ═════════════════════════════════════════════════════════════════════════
-- 4. ADMINS
--
-- Deliberately has NO policies and NO grants to anon or authenticated. With
-- row-level security on and no policy, ordinary logged-in users cannot read
-- or write this table at all — only service_role (the server) can. That is
-- what stops a user promoting themselves by editing their own profile row.
-- ═════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.admins TO service_role;
REVOKE ALL ON public.admins FROM anon, authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- 5. APP SETTINGS
--
-- Single row, enforced by a boolean primary key CHECKed to true. Readable by
-- everyone so the public site can honour maintenance_mode and site_name;
-- writable only by service_role, i.e. only via the admin server functions.
-- ═════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.app_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  site_name TEXT NOT NULL DEFAULT 'Placify AI',
  support_email TEXT NOT NULL DEFAULT '',
  allow_signups BOOLEAN NOT NULL DEFAULT true,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  ai_enabled BOOLEAN NOT NULL DEFAULT true,
  ai_model TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.app_settings TO service_role;
GRANT SELECT ON public.app_settings TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT TO anon, authenticated USING (true);

-- ═════════════════════════════════════════════════════════════════════════
-- 6. FUNCTIONS AND TRIGGERS
-- ═════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS profiles_set_updated ON public.profiles;
CREATE TRIGGER profiles_set_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.set_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS app_settings_set_updated ON public.app_settings;
CREATE TRIGGER app_settings_set_updated BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.set_settings_updated_at();

-- Auto-create a profile row whenever someone signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_settings_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- ═════════════════════════════════════════════════════════════════════════
-- 7. STORAGE — private `resumes` bucket plus per-user access policies
-- ═════════════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users read own resumes" ON storage.objects;
CREATE POLICY "Users read own resumes" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users upload own resumes" ON storage.objects;
CREATE POLICY "Users upload own resumes" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own resumes" ON storage.objects;
CREATE POLICY "Users delete own resumes" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═════════════════════════════════════════════════════════════════════════
-- 8. ⬇⬇ EDIT THIS LINE ⬇⬇
--
-- Replace the address with the email you signed up to Placify AI with.
-- That account becomes the admin. The account must already exist — sign up
-- at /auth first, or this matches nothing and silently does nothing.
-- ═════════════════════════════════════════════════════════════════════════
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verification — should return the admin email and the settings row.
SELECT u.email AS admin_email FROM public.admins a JOIN auth.users u ON u.id = a.user_id;
SELECT site_name, allow_signups, maintenance_mode, ai_enabled FROM public.app_settings;
