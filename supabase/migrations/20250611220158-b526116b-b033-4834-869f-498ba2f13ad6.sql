
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'new_post', 'post_comment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_content_type TEXT CHECK (related_content_type IN ('donation', 'request', 'scholarship', 'event', 'comment')),
  related_content_id UUID,
  creator_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Create policy that allows users to update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Create policy that allows the system to create notifications for users
CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to generate notifications for new posts
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
    TG_TABLE_NAME::TEXT,
    NEW.id,
    NEW.creator_user_id
  FROM user_profiles up
  WHERE up.is_approved = true 
    AND up.id != NEW.creator_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate notifications for new comments
CREATE OR REPLACE FUNCTION public.notify_users_of_new_comment()
RETURNS TRIGGER AS $$
DECLARE
  content_creator_id UUID;
  content_title TEXT;
  parent_comment_creator_id UUID;
BEGIN
  -- Get the creator of the content being commented on
  IF NEW.content_type = 'donation' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title
    FROM donations WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'request' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title
    FROM requests WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'scholarship' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title
    FROM scholarships WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'event' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title
    FROM events WHERE id = NEW.content_id;
  END IF;

  -- Notify the content creator if they're not the commenter
  IF content_creator_id IS NOT NULL AND content_creator_id != NEW.creator_user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
    VALUES (
      content_creator_id,
      'post_comment',
      'New Comment on Your Post',
      'Someone commented on your ' || NEW.content_type || ' "' || content_title || '"',
      'comment',
      NEW.id,
      NEW.creator_user_id
    );
  END IF;

  -- If this is a reply to another comment, notify the parent comment creator
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT creator_user_id INTO parent_comment_creator_id
    FROM comments WHERE id = NEW.parent_comment_id;
    
    IF parent_comment_creator_id IS NOT NULL AND parent_comment_creator_id != NEW.creator_user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
      VALUES (
        parent_comment_creator_id,
        'comment_reply',
        'Reply to Your Comment',
        'Someone replied to your comment on "' || content_title || '"',
        'comment',
        NEW.id,
        NEW.creator_user_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for new posts (only when approved)
CREATE TRIGGER notify_new_donation
  AFTER UPDATE ON donations
  FOR EACH ROW
  WHEN (OLD.is_approved = false AND NEW.is_approved = true)
  EXECUTE FUNCTION notify_users_of_new_post();

CREATE TRIGGER notify_new_request
  AFTER UPDATE ON requests
  FOR EACH ROW
  WHEN (OLD.is_approved = false AND NEW.is_approved = true)
  EXECUTE FUNCTION notify_users_of_new_post();

CREATE TRIGGER notify_new_scholarship
  AFTER UPDATE ON scholarships
  FOR EACH ROW
  WHEN (OLD.is_approved = false AND NEW.is_approved = true)
  EXECUTE FUNCTION notify_users_of_new_post();

CREATE TRIGGER notify_new_event
  AFTER UPDATE ON events
  FOR EACH ROW
  WHEN (OLD.is_approved = false AND NEW.is_approved = true)
  EXECUTE FUNCTION notify_users_of_new_post();

-- Create trigger for new comments
CREATE TRIGGER notify_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_of_new_comment();
