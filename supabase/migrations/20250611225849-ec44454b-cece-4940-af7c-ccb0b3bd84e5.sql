
-- Update the check constraint to include 'user' as a valid related_content_type
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_related_content_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_related_content_type_check 
CHECK (related_content_type IN ('donation', 'request', 'scholarship', 'event', 'comment', 'user'));
