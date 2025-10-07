-- Create volunteers table
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  volunteer_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  creator_user_id UUID NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approval_decision_made BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can delete their own volunteers"
ON public.volunteers
FOR DELETE
USING (creator_user_id = auth.uid());

CREATE POLICY "Users can insert their own volunteers"
ON public.volunteers
FOR INSERT
WITH CHECK (creator_user_id = auth.uid());

CREATE POLICY "Users can update their own volunteers"
ON public.volunteers
FOR UPDATE
USING (creator_user_id = auth.uid());

CREATE POLICY "Users can view all approved volunteers"
ON public.volunteers
FOR SELECT
USING ((is_approved = true) OR (creator_user_id = auth.uid()));

-- Create volunteer_signups table (similar to event_rsvps)
CREATE TABLE public.volunteer_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID NOT NULL,
  user_id UUID,
  guest_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_signups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can delete their own signups"
ON public.volunteer_signups
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signups"
ON public.volunteer_signups
FOR INSERT
WITH CHECK ((auth.uid() = user_id) AND (EXISTS (
  SELECT 1 FROM volunteers
  WHERE volunteers.id = volunteer_signups.volunteer_id AND volunteers.is_approved = true
)));

CREATE POLICY "Users can view all signups for approved volunteers"
ON public.volunteer_signups
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM volunteers
  WHERE volunteers.id = volunteer_signups.volunteer_id AND volunteers.is_approved = true
));