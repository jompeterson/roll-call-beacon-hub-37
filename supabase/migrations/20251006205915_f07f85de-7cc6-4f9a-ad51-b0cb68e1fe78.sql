-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can upload donation images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own donation images" ON storage.objects;

-- Create more permissive policy that works with custom auth
-- Allow any authenticated session to upload to donation-images
CREATE POLICY "Allow donation image uploads"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'donation-images'
);