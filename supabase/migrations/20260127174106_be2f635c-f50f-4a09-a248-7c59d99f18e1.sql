-- Drop the existing restrictive INSERT policy for event-images storage
DROP POLICY IF EXISTS "Users can upload event images" ON storage.objects;

-- Create a permissive policy allowing any insert to event-images bucket
CREATE POLICY "Anyone can upload to event-images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'event-images');

-- Drop the existing restrictive INSERT policy for events table
DROP POLICY IF EXISTS "Users can insert their own events" ON public.events;

-- Create a permissive policy allowing any insert to events
CREATE POLICY "Anyone can create events"
ON public.events FOR INSERT
TO anon, authenticated
WITH CHECK (true);