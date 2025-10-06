-- Drop the existing policy that allows anyone to view approved requests
DROP POLICY IF EXISTS "Anyone can view approved requests" ON public.requests;

-- Create new policy: non-admins can only view approved AND not completed requests
CREATE POLICY "Anyone can view approved non-completed requests"
ON public.requests
FOR SELECT
USING (
  is_approved = true 
  AND is_completed = false
);

-- Create new policy: administrators can view all requests (including completed ones)
CREATE POLICY "Administrators can view all requests"
ON public.requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = auth.uid() 
    AND ur.name = 'administrator'
  )
);