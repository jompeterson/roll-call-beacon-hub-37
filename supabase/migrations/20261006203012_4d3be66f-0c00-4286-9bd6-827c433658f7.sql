ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS completed_value numeric,
  ADD COLUMN IF NOT EXISTS handoff_date timestamptz,
  ADD COLUMN IF NOT EXISTS completion_images text[] NOT NULL DEFAULT '{}';

DROP POLICY IF EXISTS "Anyone can upload request closeout images" ON storage.objects;
CREATE POLICY "Anyone can upload request closeout images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'donation-images' AND (storage.foldername(name))[1] = 'request-closeout');