
-- Create event_rsvps table to store user RSVPs for events
CREATE TABLE public.event_rsvps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(event_id, user_id) -- Prevent duplicate RSVPs from same user
);

-- Enable RLS on event_rsvps table
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_rsvps table
CREATE POLICY "Users can view all RSVPs for approved events" ON public.event_rsvps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_rsvps.event_id 
            AND events.is_approved = true
        )
    );

CREATE POLICY "Users can insert their own RSVPs" ON public.event_rsvps
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.events 
            WHERE events.id = event_rsvps.event_id 
            AND events.is_approved = true
        )
    );

CREATE POLICY "Users can delete their own RSVPs" ON public.event_rsvps
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON public.event_rsvps(user_id);
