
-- Update the app_settings table to use the new Pacific Crest logo
UPDATE public.app_settings 
SET value = '/lovable-uploads/0b6eb6b7-ae1e-426b-a13c-35e69ac3be44.png'
WHERE key = 'logo_url';
