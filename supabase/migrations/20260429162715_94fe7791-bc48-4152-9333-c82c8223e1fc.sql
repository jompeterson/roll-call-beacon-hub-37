DO $$
DECLARE
  v_salt text;
  v_hash text;
BEGIN
  v_salt := public.generate_salt();
  v_hash := public.hash_password('PCBS5901!', v_salt);
  UPDATE public.users
     SET password_hash = v_hash,
         salt = v_salt,
         failed_login_attempts = 0,
         locked_until = NULL,
         session_token = NULL,
         session_expires_at = NULL
   WHERE lower(email) = lower('Kalin@stonecreekbuilding.net');
END $$;