
-- Add material_type column to donations table
ALTER TABLE public.donations 
ADD COLUMN material_type text;
