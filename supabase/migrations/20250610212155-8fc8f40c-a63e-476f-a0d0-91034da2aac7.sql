
-- First, drop the policies that depend on the role column
DROP POLICY "Administrators can manage organizations" ON public.organizations;
DROP POLICY "Administrators can view profiles in their organization" ON public.user_profiles;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the existing roles
INSERT INTO public.user_roles (name, description) VALUES 
  ('supporter', 'Community member providing support and assistance'),
  ('shop_teacher', 'Educator with specialized knowledge in shop and technical skills'),
  ('administrator', 'Full access to manage organization settings and users');

-- Add new role_id column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN role_id UUID REFERENCES public.user_roles(id);

-- Update existing user_profiles to use the new role_id
UPDATE public.user_profiles 
SET role_id = (
  SELECT id FROM public.user_roles 
  WHERE name = user_profiles.role::text
);

-- Make role_id NOT NULL after data migration
ALTER TABLE public.user_profiles ALTER COLUMN role_id SET NOT NULL;

-- Now drop the old role column
ALTER TABLE public.user_profiles DROP COLUMN role;

-- Drop the old enum type
DROP TYPE public.user_role;

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read roles
CREATE POLICY "Authenticated users can view roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Recreate policies with role table joins
CREATE POLICY "Administrators can manage organizations" 
  ON public.organizations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() 
      AND ur.name = 'administrator'
      AND up.organization_id = organizations.id
    )
  );

CREATE POLICY "Administrators can view profiles in their organization" 
  ON public.user_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin_profile 
      JOIN public.user_roles ur ON admin_profile.role_id = ur.id
      WHERE admin_profile.id = auth.uid() 
      AND ur.name = 'administrator'
      AND admin_profile.organization_id = user_profiles.organization_id
    )
  );

-- Update the trigger function to use role_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    address, 
    phone, 
    role_id
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'phone',
    (SELECT id FROM public.user_roles WHERE name = new.raw_user_meta_data ->> 'role')
  );
  RETURN new;
END;
$$;
