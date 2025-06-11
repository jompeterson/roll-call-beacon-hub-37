
-- Add new notification type for user registration by updating the check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('comment_reply', 'new_post', 'post_comment', 'user_registration'));

-- Create function to notify administrators of new user registrations
CREATE OR REPLACE FUNCTION public.notify_admins_of_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all administrator users
  INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
  SELECT 
    up.id,
    'user_registration',
    'New User Registration',
    'A new user "' || NEW.first_name || ' ' || NEW.last_name || '" has registered and is pending approval',
    'user',
    NEW.id,
    NEW.id
  FROM user_profiles up
  JOIN user_roles ur ON up.role_id = ur.id
  WHERE ur.name = 'administrator';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registrations
CREATE TRIGGER notify_new_user_registration
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_of_new_user();
