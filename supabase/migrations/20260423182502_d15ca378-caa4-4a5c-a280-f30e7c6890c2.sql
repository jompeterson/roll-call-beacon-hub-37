ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS is_taken boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS selected_recipient_user_id uuid;