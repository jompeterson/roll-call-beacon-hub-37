ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_ended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ended_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS accomplishments text,
  ADD COLUMN IF NOT EXISTS completion_images text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS funds_raised numeric;