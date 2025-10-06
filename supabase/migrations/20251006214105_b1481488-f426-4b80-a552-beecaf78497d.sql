-- Add can_deliver and delivery_miles columns to donations table
ALTER TABLE public.donations 
ADD COLUMN can_deliver boolean NOT NULL DEFAULT false,
ADD COLUMN delivery_miles numeric NULL;