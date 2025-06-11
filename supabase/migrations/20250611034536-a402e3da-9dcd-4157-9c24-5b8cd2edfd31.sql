
-- Add approval columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false,
ADD COLUMN approval_decision_made boolean NOT NULL DEFAULT false;

-- Add index for better performance on status queries
CREATE INDEX idx_organizations_approval_status ON public.organizations(is_approved, approval_decision_made);
