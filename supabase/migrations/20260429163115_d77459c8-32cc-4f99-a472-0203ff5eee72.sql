
UPDATE public.organizations
   SET contact_user_id = '60d9cadb-c554-4088-aa3e-e2f3d7a5630f'
 WHERE contact_user_id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb';

DELETE FROM public.notification_preferences WHERE user_id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb';
DELETE FROM public.notifications WHERE user_id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb' OR creator_user_id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb';
DELETE FROM public.password_reset_tokens WHERE user_id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb';
DELETE FROM public.user_profiles WHERE id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb';
DELETE FROM public.users WHERE id = 'ebd6a34a-a62e-47ad-a2da-b71a98b8d2bb';
