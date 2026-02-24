-- Add amount_max column to scholarships for range support
ALTER TABLE public.scholarships
ADD COLUMN amount_max numeric NULL DEFAULT NULL;