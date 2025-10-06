-- Create donation_acceptances table to track who has accepted donations
CREATE TABLE public.donation_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(donation_id, user_id)
);

-- Enable RLS
ALTER TABLE public.donation_acceptances ENABLE ROW LEVEL SECURITY;

-- Users can view all acceptances for approved donations
CREATE POLICY "Users can view acceptances for approved donations"
ON public.donation_acceptances
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM donations
    WHERE donations.id = donation_acceptances.donation_id
    AND donations.is_approved = true
  )
);

-- Authenticated users can accept donations
CREATE POLICY "Authenticated users can accept donations"
ON public.donation_acceptances
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM donations
    WHERE donations.id = donation_acceptances.donation_id
    AND donations.is_approved = true
  )
);

-- Create function to notify donation creator of acceptance
CREATE OR REPLACE FUNCTION public.notify_donation_creator_of_acceptance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  donation_title TEXT;
  creator_id UUID;
BEGIN
  -- Get donation details
  SELECT title, creator_user_id INTO donation_title, creator_id
  FROM donations WHERE id = NEW.donation_id;
  
  -- Create notification for the donation creator
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    message, 
    related_content_type, 
    related_content_id, 
    creator_user_id
  )
  VALUES (
    creator_id,
    'new_post',
    'Someone Wants Your Donation',
    'Someone is interested in accepting your donation "' || donation_title || '"',
    'donation',
    NEW.donation_id,
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for donation acceptances
CREATE TRIGGER notify_on_donation_acceptance
AFTER INSERT ON public.donation_acceptances
FOR EACH ROW
EXECUTE FUNCTION public.notify_donation_creator_of_acceptance();