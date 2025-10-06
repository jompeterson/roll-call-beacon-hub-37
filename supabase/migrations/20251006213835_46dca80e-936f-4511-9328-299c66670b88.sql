-- Add needs_pickup column to requests table
ALTER TABLE public.requests 
ADD COLUMN needs_pickup boolean NOT NULL DEFAULT false;