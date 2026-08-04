ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS waiver_agreed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS waiver_agreed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS waiver_signature_name text;