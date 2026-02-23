
-- Drop existing restrictive storage policies for organization-images
DROP POLICY IF EXISTS "Authenticated users can upload organization images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update organization images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete organization images" ON storage.objects;

-- Recreate without auth.uid() requirement (app uses custom auth, not Supabase auth)
CREATE POLICY "Anyone can upload organization images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organization-images');

CREATE POLICY "Anyone can update organization images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'organization-images');

CREATE POLICY "Anyone can delete organization images"
ON storage.objects FOR DELETE
USING (bucket_id = 'organization-images');
