
-- Remove the foreign key constraint on user_id in event_rsvps table
-- This constraint is causing issues with the custom auth system
ALTER TABLE public.event_rsvps DROP CONSTRAINT IF EXISTS event_rsvps_user_id_fkey;

-- Ensure the check constraint exists to validate either user_id or guest_info
ALTER TABLE public.event_rsvps DROP CONSTRAINT IF EXISTS check_user_or_guest;
ALTER TABLE public.event_rsvps ADD CONSTRAINT check_user_or_guest 
CHECK (
  (user_id IS NOT NULL AND guest_info IS NULL) OR 
  (user_id IS NULL AND guest_info IS NOT NULL)
);
