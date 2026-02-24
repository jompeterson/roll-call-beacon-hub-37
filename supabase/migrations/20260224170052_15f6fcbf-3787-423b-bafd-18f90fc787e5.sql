
-- Allow administrators to delete user profiles
CREATE POLICY "Administrators can delete user profiles"
ON public.user_profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_profiles admin_profile
    JOIN user_roles ur ON admin_profile.role_id = ur.id
    WHERE admin_profile.id = auth.uid()
      AND ur.name = 'administrator'
  )
);

-- Allow administrators to delete users
CREATE POLICY "Administrators can delete users"
ON public.users
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_profiles admin_profile
    JOIN user_roles ur ON admin_profile.role_id = ur.id
    WHERE admin_profile.id = auth.uid()
      AND ur.name = 'administrator'
  )
);
