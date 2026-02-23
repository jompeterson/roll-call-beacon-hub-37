
-- Add profile_image_url column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN profile_image_url text;

-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true);

-- Allow anyone to view profile images
CREATE POLICY "Profile images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Allow users to upload their own profile image (folder = their user id)
CREATE POLICY "Users can upload their own profile image"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');

-- Allow users to update their own profile image
CREATE POLICY "Users can update their own profile image"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images');

-- Allow users to delete their own profile image
CREATE POLICY "Users can delete their own profile image"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');
