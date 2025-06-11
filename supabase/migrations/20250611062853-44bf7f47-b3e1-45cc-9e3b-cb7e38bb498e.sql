
-- Create scholarships table
CREATE TABLE public.scholarships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  amount numeric(10,2) NOT NULL,
  eligibility_criteria text,
  application_deadline timestamp with time zone,
  contact_email text,
  contact_phone text,
  organization_name text NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  approval_decision_made boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Foreign key to users table
  CONSTRAINT scholarships_creator_user_id_fkey 
    FOREIGN KEY (creator_user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Create policies for scholarships
-- Users can view all approved scholarships
CREATE POLICY "Anyone can view approved scholarships" 
  ON public.scholarships 
  FOR SELECT 
  USING (is_approved = true);

-- Users can view their own scholarships regardless of approval status
CREATE POLICY "Users can view their own scholarships" 
  ON public.scholarships 
  FOR SELECT 
  USING (creator_user_id IN (SELECT id FROM users WHERE session_token IS NOT NULL));

-- Users can create their own scholarships
CREATE POLICY "Users can create scholarships" 
  ON public.scholarships 
  FOR INSERT 
  WITH CHECK (creator_user_id IN (SELECT id FROM users WHERE session_token IS NOT NULL));

-- Users can update their own scholarships (but not approval fields)
CREATE POLICY "Users can update their own scholarships" 
  ON public.scholarships 
  FOR UPDATE 
  USING (creator_user_id IN (SELECT id FROM users WHERE session_token IS NOT NULL))
  WITH CHECK (creator_user_id IN (SELECT id FROM users WHERE session_token IS NOT NULL));

-- Create index for performance
CREATE INDEX idx_scholarships_creator_user_id ON public.scholarships(creator_user_id);
CREATE INDEX idx_scholarships_approval_status ON public.scholarships(is_approved, approval_decision_made);
