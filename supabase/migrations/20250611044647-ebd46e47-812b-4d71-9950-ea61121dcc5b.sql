
-- Create events table
CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    location text,
    max_participants integer,
    creator_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_approved boolean NOT NULL DEFAULT false,
    approval_decision_made boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events table
CREATE POLICY "Users can view all approved events" ON public.events
    FOR SELECT USING (is_approved = true OR creator_user_id = auth.uid());

CREATE POLICY "Users can insert their own events" ON public.events
    FOR INSERT WITH CHECK (creator_user_id = auth.uid());

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (creator_user_id = auth.uid());

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (creator_user_id = auth.uid());

-- Create index for better performance
CREATE INDEX idx_events_creator_user_id ON public.events(creator_user_id);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_approval_status ON public.events(is_approved, approval_decision_made);
