
-- Create a storage bucket for donation images
INSERT INTO storage.buckets (id, name, public)
VALUES ('donation-images', 'donation-images', true);

-- Create RLS policies for the donation images bucket
CREATE POLICY "Anyone can view donation images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'donation-images');

CREATE POLICY "Authenticated users can upload donation images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'donation-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own donation images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'donation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own donation images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'donation-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add an images column to the donations table to store image URLs
ALTER TABLE donations ADD COLUMN images TEXT[] DEFAULT '{}';
