
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('supporter', 'shop_teacher', 'administrator');

-- Create enum for organization types
CREATE TYPE public.organization_type AS ENUM ('Non-Profit', 'Educational Institution', 'Community Group', 'Religious Organization', 'Sports Club', 'Professional Association', 'Other');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type organization_type NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table with all registration details
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they belong to" 
  ON public.organizations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.organization_id = organizations.id 
      AND user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Administrators can manage organizations" 
  ON public.organizations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'administrator'
      AND user_profiles.organization_id = organizations.id
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Administrators can view profiles in their organization" 
  ON public.user_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles admin_profile 
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'administrator'
      AND admin_profile.organization_id = user_profiles.organization_id
    )
  );

-- Create function to handle new user registration
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
    role
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'phone',
    (new.raw_user_meta_data ->> 'role')::user_role
  );
  RETURN new;
END;
$$;

-- Create trigger to automatically create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
