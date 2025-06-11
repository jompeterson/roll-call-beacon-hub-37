
-- Drop existing dependencies on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create custom users table with authentication fields
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  session_token TEXT,
  session_expires_at TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires_at TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Migrate existing users from auth.users to our custom users table
INSERT INTO public.users (id, email, password_hash, salt, email_verified, created_at)
SELECT 
  au.id,
  au.email,
  'MIGRATED_USER_' || au.id, -- Placeholder password hash - users will need to reset
  'MIGRATED_SALT_' || au.id, -- Placeholder salt
  au.email_confirmed_at IS NOT NULL,
  au.created_at
FROM auth.users au
WHERE au.id IN (SELECT DISTINCT id FROM public.user_profiles);

-- Drop existing constraint if it exists and recreate it
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Add the new foreign key constraint to reference our custom users table
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own record" 
  ON public.users 
  FOR SELECT 
  USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update their own record" 
  ON public.users 
  FOR UPDATE 
  USING (id = current_setting('app.current_user_id')::uuid);

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, salt);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate salt
CREATE OR REPLACE FUNCTION public.generate_salt()
RETURNS TEXT AS $$
BEGIN
  RETURN gen_salt('bf', 12);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate session token
CREATE OR REPLACE FUNCTION public.generate_session_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_session_token ON public.users(session_token);
CREATE INDEX idx_users_email_verification_token ON public.users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON public.users(password_reset_token);
