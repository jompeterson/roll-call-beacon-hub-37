CREATE OR REPLACE FUNCTION public.notify_admins_of_new_organization()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.approval_decision_made = false THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_content_type, related_content_id, creator_user_id)
    SELECT up.id, 'organization_registration', 'New Organization Pending Approval',
      'A new organization "' || NEW.name || '" (' || NEW.type::text || ') has been submitted and is pending approval',
      'organization', NEW.id, NEW.contact_user_id
    FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE ur.name = 'administrator'
      AND public.should_send_notification(up.id, 'organization_registration');
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS notify_new_organization ON public.organizations;
CREATE TRIGGER notify_new_organization
AFTER INSERT ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_new_organization();