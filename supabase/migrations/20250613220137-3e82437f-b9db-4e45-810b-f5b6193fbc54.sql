
-- Drop existing policies and recreate them with better logic
DROP POLICY IF EXISTS "Anyone can view donation images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload donation images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own donation images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own donation images" ON storage.objects;

-- Create improved RLS policies for the donation images bucket
CREATE POLICY "Anyone can view donation images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'donation-images');

CREATE POLICY "Authenticated users can upload donation images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'donation-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own donation images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'donation-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own donation images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'donation-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
