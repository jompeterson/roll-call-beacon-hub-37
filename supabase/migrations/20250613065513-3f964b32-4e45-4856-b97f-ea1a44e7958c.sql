
-- Update the app_settings table to use the new logo URL
UPDATE public.app_settings 
SET value = '/lovable-uploads/cdcc2cab-36fa-460c-b3f6-81b0293c4ed2.png'
WHERE key = 'logo_url';
