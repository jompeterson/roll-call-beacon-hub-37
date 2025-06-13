
-- Add weight column to donations table
ALTER TABLE public.donations 
ADD COLUMN weight NUMERIC(10,2) DEFAULT 0;

-- Add a comment to document the new column
COMMENT ON COLUMN public.donations.weight IS 'Weight of the donation item in pounds or kilograms';
