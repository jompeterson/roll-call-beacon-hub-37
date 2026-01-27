-- Add missing INSERT policy for event-images bucket
-- The UPDATE/DELETE policies already exist, so we only need the INSERT policy

CREATE POLICY "Users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);