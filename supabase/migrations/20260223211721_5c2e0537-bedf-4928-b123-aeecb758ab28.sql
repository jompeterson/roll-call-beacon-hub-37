
-- Add image_url column to organizations table
ALTER TABLE public.organizations ADD COLUMN image_url text;

-- Create storage bucket for organization images
INSERT INTO storage.buckets (id, name, public) VALUES ('organization-images', 'organization-images', true);

-- Allow public read access to organization images
CREATE POLICY "Organization images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-images');

-- Allow authenticated users to upload organization images
CREATE POLICY "Authenticated users can upload organization images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organization-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update organization images
CREATE POLICY "Authenticated users can update organization images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'organization-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete organization images
CREATE POLICY "Authenticated users can delete organization images"
ON storage.objects FOR DELETE
USING (bucket_id = 'organization-images' AND auth.uid() IS NOT NULL);
