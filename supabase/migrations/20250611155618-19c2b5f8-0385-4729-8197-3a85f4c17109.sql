
-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  amount_needed NUMERIC NOT NULL,
  amount_raised NUMERIC DEFAULT 0,
  target_date TIMESTAMP WITH TIME ZONE,
  contact_email TEXT,
  contact_phone TEXT,
  organization_id UUID REFERENCES public.organizations(id),
  organization_name TEXT,
  donation_link TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approval_decision_made BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requests table
CREATE TABLE public.requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_id UUID NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  description TEXT,
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
  request_type TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  organization_id UUID REFERENCES public.organizations(id),
  organization_name TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approval_decision_made BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for donations
CREATE POLICY "Anyone can view approved donations" 
  ON public.donations 
  FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can view their own donations" 
  ON public.donations 
  FOR SELECT 
  USING (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create donations" 
  ON public.donations 
  FOR INSERT 
  WITH CHECK (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own donations" 
  ON public.donations 
  FOR UPDATE 
  USING (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own donations" 
  ON public.donations 
  FOR DELETE 
  USING (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

-- Enable Row Level Security for requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for requests
CREATE POLICY "Anyone can view approved requests" 
  ON public.requests 
  FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can view their own requests" 
  ON public.requests 
  FOR SELECT 
  USING (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create requests" 
  ON public.requests 
  FOR INSERT 
  WITH CHECK (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own requests" 
  ON public.requests 
  FOR UPDATE 
  USING (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own requests" 
  ON public.requests 
  FOR DELETE 
  USING (creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()));
