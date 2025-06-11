
-- Add a column to track when an approval decision has been made
ALTER TABLE public.user_profiles 
ADD COLUMN approval_decision_made boolean NOT NULL DEFAULT false;
