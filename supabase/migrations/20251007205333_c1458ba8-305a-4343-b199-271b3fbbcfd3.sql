-- Add images column to scholarships table
ALTER TABLE public.scholarships ADD COLUMN images TEXT[] DEFAULT '{}';

-- Add images column to events table
ALTER TABLE public.events ADD COLUMN images TEXT[] DEFAULT '{}';

-- Add images column to volunteers table
ALTER TABLE public.volunteers ADD COLUMN images TEXT[] DEFAULT '{}';

-- Create storage buckets for scholarships, events, and volunteers
INSERT INTO storage.buckets (id, name, public) VALUES ('scholarship-images', 'scholarship-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('volunteer-images', 'volunteer-images', true);

-- Create storage policies for scholarship images
CREATE POLICY "Scholarship images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'scholarship-images');

CREATE POLICY "Authenticated users can upload scholarship images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'scholarship-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own scholarship images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'scholarship-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own scholarship images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'scholarship-images' AND auth.uid() IS NOT NULL);

-- Create storage policies for event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own event images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own event images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'event-images' AND auth.uid() IS NOT NULL);

-- Create storage policies for volunteer images
CREATE POLICY "Volunteer images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'volunteer-images');

CREATE POLICY "Authenticated users can upload volunteer images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'volunteer-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own volunteer images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'volunteer-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own volunteer images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'volunteer-images' AND auth.uid() IS NOT NULL);