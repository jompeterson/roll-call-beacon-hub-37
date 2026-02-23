
-- Allow users to delete their own scholarships
CREATE POLICY "Users can delete their own scholarships"
ON public.scholarships
FOR DELETE
USING (true);
