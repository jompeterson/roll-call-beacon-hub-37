-- Enable pg_net for HTTP calls from the database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function that posts a new notification to the email-sending edge function
CREATE OR REPLACE FUNCTION public.send_notification_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://lkfiueromkmdtgubqlxj.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('notification_id', NEW.id::text)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block notification inserts if email dispatch fails
  RAISE WARNING 'send_notification_email_trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_send_email ON public.notifications;
CREATE TRIGGER notifications_send_email
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.send_notification_email_trigger();