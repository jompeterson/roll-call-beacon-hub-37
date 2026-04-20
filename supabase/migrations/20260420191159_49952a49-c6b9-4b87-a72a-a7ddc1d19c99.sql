-- Shared timestamp updater (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- User-level notification preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, notification_type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT USING (true);
CREATE POLICY "Users can insert their own preferences"
  ON public.notification_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own preferences"
  ON public.notification_preferences FOR DELETE USING (true);

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin-managed notification rules
CREATE TABLE public.notification_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_value TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view notification rules"
  ON public.notification_rules FOR SELECT USING (true);
CREATE POLICY "Administrators can manage notification rules"
  ON public.notification_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = auth.uid() AND ur.name = 'administrator'
  ));

CREATE TRIGGER update_notification_rules_updated_at
  BEFORE UPDATE ON public.notification_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Decide whether to send a notification to a user
CREATE OR REPLACE FUNCTION public.should_send_notification(
  _user_id UUID,
  _notification_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_name TEXT;
  user_org_id UUID;
  user_org_type TEXT;
  mandatory_block BOOLEAN := false;
  mandatory_allow BOOLEAN := false;
  user_pref BOOLEAN;
BEGIN
  SELECT ur.name, up.organization_id, o.type::text
    INTO user_role_name, user_org_id, user_org_type
  FROM user_profiles up
  LEFT JOIN user_roles ur ON up.role_id = ur.id
  LEFT JOIN organizations o ON up.organization_id = o.id
  WHERE up.id = _user_id;

  SELECT EXISTS(
    SELECT 1 FROM notification_rules nr
    WHERE nr.notification_type = _notification_type
      AND nr.is_mandatory = true AND nr.enabled = false
      AND ((nr.target_type='all')
        OR (nr.target_type='role' AND nr.target_value = user_role_name)
        OR (nr.target_type='org_type' AND nr.target_value = user_org_type)
        OR (nr.target_type='organization' AND nr.target_value = user_org_id::text)
        OR (nr.target_type='user' AND nr.target_value = _user_id::text))
  ) INTO mandatory_block;
  IF mandatory_block THEN RETURN false; END IF;

  SELECT EXISTS(
    SELECT 1 FROM notification_rules nr
    WHERE nr.notification_type = _notification_type
      AND nr.is_mandatory = true AND nr.enabled = true
      AND ((nr.target_type='all')
        OR (nr.target_type='role' AND nr.target_value = user_role_name)
        OR (nr.target_type='org_type' AND nr.target_value = user_org_type)
        OR (nr.target_type='organization' AND nr.target_value = user_org_id::text)
        OR (nr.target_type='user' AND nr.target_value = _user_id::text))
  ) INTO mandatory_allow;
  IF mandatory_allow THEN RETURN true; END IF;

  SELECT enabled INTO user_pref
  FROM notification_preferences
  WHERE user_id = _user_id AND notification_type = _notification_type;

  IF user_pref IS NULL THEN
    IF EXISTS(
      SELECT 1 FROM notification_rules nr
      WHERE nr.notification_type = _notification_type
        AND nr.is_mandatory = false AND nr.enabled = false
        AND ((nr.target_type='all')
          OR (nr.target_type='role' AND nr.target_value = user_role_name)
          OR (nr.target_type='org_type' AND nr.target_value = user_org_type)
          OR (nr.target_type='organization' AND nr.target_value = user_org_id::text)
          OR (nr.target_type='user' AND nr.target_value = _user_id::text))
    ) THEN RETURN false; END IF;
    RETURN true;
  END IF;

  RETURN user_pref;
END;
$$;

-- Update existing trigger functions
CREATE OR REPLACE FUNCTION public.notify_users_of_new_post()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE notif_type TEXT;
BEGIN
  notif_type := CASE 
    WHEN TG_TABLE_NAME='donations' THEN 'new_post_donation'
    WHEN TG_TABLE_NAME='requests' THEN 'new_post_request'
    WHEN TG_TABLE_NAME='scholarships' THEN 'new_post_scholarship'
    WHEN TG_TABLE_NAME='events' THEN 'new_post_event'
    WHEN TG_TABLE_NAME='volunteers' THEN 'new_post_volunteer'
  END;

  INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
  SELECT up.id, 'new_post',
    CASE TG_TABLE_NAME
      WHEN 'donations' THEN 'New Donation Posted'
      WHEN 'requests' THEN 'New Request Posted'
      WHEN 'scholarships' THEN 'New Scholarship Posted'
      WHEN 'events' THEN 'New Event Posted'
      WHEN 'volunteers' THEN 'New Volunteer Opportunity Posted'
    END,
    CASE TG_TABLE_NAME
      WHEN 'donations' THEN 'A new donation "' || NEW.title || '" has been posted'
      WHEN 'requests' THEN 'A new request "' || NEW.title || '" has been posted'
      WHEN 'scholarships' THEN 'A new scholarship "' || NEW.title || '" has been posted'
      WHEN 'events' THEN 'A new event "' || NEW.title || '" has been posted'
      WHEN 'volunteers' THEN 'A new volunteer opportunity "' || NEW.title || '" has been posted'
    END,
    CASE TG_TABLE_NAME
      WHEN 'donations' THEN 'donation'
      WHEN 'requests' THEN 'request'
      WHEN 'scholarships' THEN 'scholarship'
      WHEN 'events' THEN 'event'
      WHEN 'volunteers' THEN 'volunteer'
    END,
    NEW.id, NEW.creator_user_id
  FROM user_profiles up
  WHERE up.is_approved = true 
    AND up.id != NEW.creator_user_id
    AND public.should_send_notification(up.id, notif_type);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_users_of_new_comment()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
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
  END IF;

  IF content_creator_id IS NOT NULL AND content_creator_id != NEW.creator_user_id 
     AND public.should_send_notification(content_creator_id, 'post_comment') THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
    VALUES (content_creator_id, 'post_comment', 'New Comment on Your Post',
      'Someone commented on your ' || NEW.content_type || ' "' || content_title || '"',
      'comment', NEW.id, NEW.creator_user_id);
  END IF;

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
$$;

CREATE OR REPLACE FUNCTION public.notify_donation_creator_of_acceptance()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE donation_title TEXT; creator_id UUID;
BEGIN
  SELECT title, creator_user_id INTO donation_title, creator_id FROM donations WHERE id = NEW.donation_id;
  IF creator_id IS NOT NULL AND public.should_send_notification(creator_id, 'donation_acceptance') THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
    VALUES (creator_id, 'new_post', 'Someone Wants Your Donation',
      'Someone is interested in accepting your donation "' || donation_title || '"',
      'donation', NEW.donation_id, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_request_creator_of_fulfillment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE request_title TEXT; creator_id UUID;
BEGIN
  SELECT title, creator_user_id INTO request_title, creator_id FROM requests WHERE id = NEW.request_id;
  IF creator_id IS NOT NULL AND public.should_send_notification(creator_id, 'request_fulfillment') THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
    VALUES (creator_id, 'new_post', 'Someone Wants to Fulfill Your Request',
      'Someone is interested in fulfilling your request "' || request_title || '"',
      'request', NEW.request_id, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins_of_new_user()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
  SELECT up.id, 'user_registration', 'New User Registration',
    'A new user "' || NEW.first_name || ' ' || NEW.last_name || '" has registered and is pending approval',
    'user', NEW.id, NEW.id
  FROM user_profiles up
  JOIN user_roles ur ON up.role_id = ur.id
  WHERE ur.name = 'administrator'
    AND public.should_send_notification(up.id, 'user_registration');
  RETURN NEW;
END;
$$;