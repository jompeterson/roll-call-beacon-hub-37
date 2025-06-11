
-- Add foreign key constraint between comments and user_profiles
ALTER TABLE public.comments 
ADD CONSTRAINT fk_comments_creator_user_id 
FOREIGN KEY (creator_user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
