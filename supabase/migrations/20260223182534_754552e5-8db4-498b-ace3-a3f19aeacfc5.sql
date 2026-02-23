ALTER TABLE public.scholarships ALTER COLUMN amount DROP NOT NULL;
ALTER TABLE public.scholarships ALTER COLUMN amount SET DEFAULT 0;