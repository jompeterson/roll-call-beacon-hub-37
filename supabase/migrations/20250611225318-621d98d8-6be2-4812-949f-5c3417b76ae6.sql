
-- Drop the old trigger that references auth.users (which we're no longer using)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Since we're now using custom authentication, we don't need a trigger
-- The user profile creation is handled directly in the application code
-- in src/lib/auth.ts signUp function

-- However, let's make sure the user_profiles table foreign key is correct
-- It should reference our custom users table, not auth.users
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;
