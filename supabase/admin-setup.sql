-- Placify AI — admin panel schema.
--
-- Run this AFTER setup.sql, in the Supabase SQL Editor.
-- At the bottom there is one line you must edit to make yourself an admin.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles.username
-- The admin panel lists a username; the original schema had no such column.
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- admins
--
-- Deliberately has NO policies and NO grants to `anon` or `authenticated`.
-- With row-level security on and no policy, normal logged-in users cannot
-- read or write this table at all — only `service_role` (the server) can.
-- That is what stops a user from promoting themselves to admin by editing
-- their own profile row.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.admins TO service_role;
REVOKE ALL ON public.admins FROM anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- app_settings
--
-- Single row, enforced by the `id` primary key being a boolean CHECKed to
-- true — a second insert collides on the key. Readable by everyone so the
-- public site can honour maintenance_mode and site_name; writable only by
-- service_role, i.e. only through the admin server functions.
-- ─────────────────────────────────────────────────────────────────────────
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

CREATE OR REPLACE FUNCTION public.set_settings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.set_settings_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS app_settings_set_updated ON public.app_settings;
CREATE TRIGGER app_settings_set_updated BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.set_settings_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- ⬇⬇ EDIT THIS LINE ⬇⬇
-- Replace the address with the email you signed up to Placify AI with, then
-- run the file. That account becomes the admin.
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO public.admins (user_id)
SELECT id FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT (user_id) DO NOTHING;

-- Check it worked — this should return your email:
-- SELECT u.email FROM public.admins a JOIN auth.users u ON u.id = a.user_id;
