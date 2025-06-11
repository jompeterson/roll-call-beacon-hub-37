
-- Add is_completed column to the requests table
ALTER TABLE public.requests 
ADD COLUMN is_completed boolean NOT NULL DEFAULT false;
