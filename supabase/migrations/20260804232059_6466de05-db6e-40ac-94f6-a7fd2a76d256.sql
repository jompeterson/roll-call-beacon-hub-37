ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS is_ended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ended_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS accomplishments text;