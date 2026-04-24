CREATE OR REPLACE FUNCTION public.notify_users_of_new_comment()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  content_creator_id UUID;
  content_title TEXT;
  parent_comment_creator_id UUID;
BEGIN
  IF NEW.content_type = 'donation' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title FROM donations WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'request' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title FROM requests WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'scholarship' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title FROM scholarships WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'event' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title FROM events WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'volunteer' THEN
    SELECT creator_user_id, title INTO content_creator_id, content_title FROM volunteers WHERE id = NEW.content_id;
  END IF;

  -- Notify the commenter themselves (confirmation)
  INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
  VALUES (NEW.creator_user_id, 'post_comment', 'Your Comment Was Posted',
    'Your comment on the ' || NEW.content_type || ' "' || COALESCE(content_title, '') || '" has been posted',
    'comment', NEW.id, NEW.creator_user_id);

  -- Notify the post creator (if not the commenter)
  IF content_creator_id IS NOT NULL AND content_creator_id != NEW.creator_user_id 
     AND public.should_send_notification(content_creator_id, 'post_comment') THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
    VALUES (content_creator_id, 'post_comment', 'New Comment on Your Post',
      'Someone commented on your ' || NEW.content_type || ' "' || content_title || '"',
      'comment', NEW.id, NEW.creator_user_id);
  END IF;

  -- Notify all administrators (excluding the commenter and the post creator to avoid duplicates)
  INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
  SELECT up.id, 'post_comment', 'New Comment on a Post',
    'Someone commented on the ' || NEW.content_type || ' "' || COALESCE(content_title, '') || '"',
    'comment', NEW.id, NEW.creator_user_id
  FROM user_profiles up
  JOIN user_roles ur ON up.role_id = ur.id
  WHERE ur.name = 'administrator'
    AND up.id != NEW.creator_user_id
    AND (content_creator_id IS NULL OR up.id != content_creator_id)
    AND public.should_send_notification(up.id, 'post_comment');

  -- Notify parent comment author (for reply chains)
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT creator_user_id INTO parent_comment_creator_id FROM comments WHERE id = NEW.parent_comment_id;
    IF parent_comment_creator_id IS NOT NULL AND parent_comment_creator_id != NEW.creator_user_id 
       AND public.should_send_notification(parent_comment_creator_id, 'comment_reply') THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
      VALUES (parent_comment_creator_id, 'comment_reply', 'Reply to Your Comment',
        'Someone replied to your comment on "' || content_title || '"',
        'comment', NEW.id, NEW.creator_user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;