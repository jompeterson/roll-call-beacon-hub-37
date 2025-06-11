
-- Add contact_user_id column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN contact_user_id uuid REFERENCES public.user_profiles(id);

-- Add index for better performance
CREATE INDEX idx_organizations_contact_user_id ON public.organizations(contact_user_id);
