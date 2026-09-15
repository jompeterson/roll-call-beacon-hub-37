DROP POLICY IF EXISTS "Authenticated users can upload volunteer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own volunteer images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own volunteer images" ON storage.objects;
CREATE POLICY "Anyone can upload volunteer images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'volunteer-images');
CREATE POLICY "Anyone can update volunteer images" ON storage.objects FOR UPDATE USING (bucket_id = 'volunteer-images');
CREATE POLICY "Anyone can delete volunteer images" ON storage.objects FOR DELETE USING (bucket_id = 'volunteer-images');

DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event images" ON storage.objects;
CREATE POLICY "Anyone can update event images" ON storage.objects FOR UPDATE USING (bucket_id = 'event-images');
CREATE POLICY "Anyone can delete event images" ON storage.objects FOR DELETE USING (bucket_id = 'event-images');

DROP POLICY IF EXISTS "Authenticated users can upload scholarship images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own scholarship images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own scholarship images" ON storage.objects;
CREATE POLICY "Anyone can upload scholarship images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'scholarship-images');
CREATE POLICY "Anyone can update scholarship images" ON storage.objects FOR UPDATE USING (bucket_id = 'scholarship-images');
CREATE POLICY "Anyone can delete scholarship images" ON storage.objects FOR DELETE USING (bucket_id = 'scholarship-images');