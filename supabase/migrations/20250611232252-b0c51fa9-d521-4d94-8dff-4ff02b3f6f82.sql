
-- Update the check constraint on notifications table to include 'events' as a valid content type
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_related_content_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_related_content_type_check 
CHECK (related_content_type IN ('donation', 'request', 'scholarship', 'event', 'comment', 'user'));
