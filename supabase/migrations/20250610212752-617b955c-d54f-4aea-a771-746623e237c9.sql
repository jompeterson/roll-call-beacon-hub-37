
-- Add display_name column to user_roles table
ALTER TABLE public.user_roles ADD COLUMN display_name TEXT;

-- Update the existing roles with display names and better descriptions
UPDATE public.user_roles 
SET 
  display_name = 'Supporter',
  description = 'Community members who provide support and assistance to others'
WHERE name = 'supporter';

UPDATE public.user_roles 
SET 
  display_name = 'Shop Teacher',
  description = 'Educators with specialized knowledge in shop and technical skills'
WHERE name = 'shop_teacher';

UPDATE public.user_roles 
SET 
  display_name = 'Administrator',
  description = 'Full access to manage organization settings and users'
WHERE name = 'administrator';

-- Make display_name NOT NULL after setting values
ALTER TABLE public.user_roles ALTER COLUMN display_name SET NOT NULL;
