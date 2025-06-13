
-- Create app_settings table to store application configuration
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default logo URL setting
INSERT INTO public.app_settings (key, value, description) 
VALUES ('logo_url', '/lovable-uploads/8849daf6-28a0-4f3f-b445-3be062dba04a.png', 'Website logo URL');

-- Add Row Level Security (RLS)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read settings
CREATE POLICY "Anyone can view app settings" 
  ON public.app_settings 
  FOR SELECT 
  USING (true);

-- Create policy to allow administrators to manage settings
CREATE POLICY "Administrators can manage app settings" 
  ON public.app_settings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'administrator'
    )
  );
