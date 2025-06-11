
-- Drop the existing foreign key constraint that references auth.users
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_creator_user_id_fkey;

-- Add a new foreign key constraint that references the public.users table
ALTER TABLE public.events ADD CONSTRAINT events_creator_user_id_fkey 
    FOREIGN KEY (creator_user_id) REFERENCES public.users(id) ON DELETE CASCADE;
