
-- Add organization_id column to scholarships table to link to organizations
ALTER TABLE public.scholarships 
ADD COLUMN organization_id uuid REFERENCES public.organizations(id);

-- Update the scholarships table to make organization_name nullable since we'll get it from the organization
ALTER TABLE public.scholarships 
ALTER COLUMN organization_name DROP NOT NULL;
