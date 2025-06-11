
-- Fix the notification trigger function to use singular content types
CREATE OR REPLACE FUNCTION public.notify_users_of_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all approved users except the creator
  INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
  SELECT 
    up.id,
    'new_post',
    CASE 
      WHEN TG_TABLE_NAME = 'donations' THEN 'New Donation Posted'
      WHEN TG_TABLE_NAME = 'requests' THEN 'New Request Posted'
      WHEN TG_TABLE_NAME = 'scholarships' THEN 'New Scholarship Posted'
      WHEN TG_TABLE_NAME = 'events' THEN 'New Event Posted'
    END,
    CASE 
      WHEN TG_TABLE_NAME = 'donations' THEN 'A new donation "' || NEW.title || '" has been posted'
      WHEN TG_TABLE_NAME = 'requests' THEN 'A new request "' || NEW.title || '" has been posted'
      WHEN TG_TABLE_NAME = 'scholarships' THEN 'A new scholarship "' || NEW.title || '" has been posted'
      WHEN TG_TABLE_NAME = 'events' THEN 'A new event "' || NEW.title || '" has been posted'
    END,
    CASE 
      WHEN TG_TABLE_NAME = 'donations' THEN 'donation'
      WHEN TG_TABLE_NAME = 'requests' THEN 'request'
      WHEN TG_TABLE_NAME = 'scholarships' THEN 'scholarship'
      WHEN TG_TABLE_NAME = 'events' THEN 'event'
    END,
    NEW.id,
    NEW.creator_user_id
  FROM user_profiles up
  WHERE up.is_approved = true 
    AND up.id != NEW.creator_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
