
UPDATE public.users SET email = lower(email) WHERE email <> lower(email);
UPDATE public.user_profiles SET email = lower(email) WHERE email <> lower(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON public.users (lower(email));
