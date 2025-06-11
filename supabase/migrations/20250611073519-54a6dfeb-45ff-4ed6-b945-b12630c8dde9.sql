
-- Add a guest_info column to store guest RSVP information
ALTER TABLE public.event_rsvps ADD COLUMN guest_info JSONB;

-- Allow user_id to be nullable for guest RSVPs
ALTER TABLE public.event_rsvps ALTER COLUMN user_id DROP NOT NULL;

-- Add a check constraint to ensure either user_id or guest_info is provided
ALTER TABLE public.event_rsvps ADD CONSTRAINT check_user_or_guest 
CHECK (
  (user_id IS NOT NULL AND guest_info IS NULL) OR 
  (user_id IS NULL AND guest_info IS NOT NULL)
);
