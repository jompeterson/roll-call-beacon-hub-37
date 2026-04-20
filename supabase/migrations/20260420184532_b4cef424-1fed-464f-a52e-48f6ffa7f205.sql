
UPDATE public.user_roles
SET display_name = 'Staff',
    name = 'staff',
    description = 'Staff members of the organization'
WHERE name = 'supporter';

INSERT INTO public.user_roles (name, display_name, description)
VALUES
  ('volunteer', 'Volunteer', 'Volunteers who help with events and initiatives'),
  ('student', 'Student', 'Students participating in programs and opportunities')
ON CONFLICT DO NOTHING;
