-- Keep profile email values aligned with the linked login account and lowercase them.
UPDATE public.user_profiles up
SET email = lower(u.email),
    updated_at = now()
FROM public.users u
WHERE up.id = u.id
  AND up.email IS DISTINCT FROM lower(u.email);

-- Lowercase any remaining profile emails.
UPDATE public.user_profiles
SET email = lower(email),
    updated_at = now()
WHERE email IS DISTINCT FROM lower(email);

-- Prevent future duplicate profile emails with different casing.
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_lower_unique
ON public.user_profiles (lower(email));