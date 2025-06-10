
-- Insert the initial user roles with display names and descriptions
INSERT INTO public.user_roles (name, display_name, description) VALUES
('supporter', 'Supporter', 'Community members who provide support and assistance to others'),
('shop_teacher', 'Shop Teacher', 'Educators with specialized knowledge in shop and technical skills'),
('administrator', 'Administrator', 'Full access to manage organization settings and users')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;
