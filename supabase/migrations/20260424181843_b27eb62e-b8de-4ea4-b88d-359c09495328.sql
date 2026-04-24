-- Tracking columns for batched email sending
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_last_attempt_at timestamptz;

-- Index to quickly find unsent notifications
CREATE INDEX IF NOT EXISTS idx_notifications_email_pending
  ON public.notifications (created_at)
  WHERE email_sent = false AND email_attempts < 5;

-- Drop the per-row trigger (we now batch via cron)
DROP TRIGGER IF EXISTS notifications_send_email ON public.notifications;
DROP FUNCTION IF EXISTS public.send_notification_email_trigger();

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Unschedule existing job if it exists, then schedule fresh
DO $$
BEGIN
  PERFORM cron.unschedule('send-notification-emails-batch');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'send-notification-emails-batch',
  '30 seconds',
  $$
  SELECT net.http_post(
    url := 'https://lkfiueromkmdtgubqlxj.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('mode', 'batch')
  );
  $$
);