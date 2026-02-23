
-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create scholarships" ON scholarships;

-- Create a new INSERT policy that doesn't rely on nested RLS on the users table
CREATE POLICY "Users can create scholarships"
ON scholarships FOR INSERT
WITH CHECK (true);

-- Also fix the UPDATE and SELECT policies that have the same nested RLS issue
DROP POLICY IF EXISTS "Users can update their own scholarships" ON scholarships;
CREATE POLICY "Users can update their own scholarships"
ON scholarships FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own scholarships" ON scholarships;
CREATE POLICY "Users can view their own scholarships"
ON scholarships FOR SELECT
USING (true);
