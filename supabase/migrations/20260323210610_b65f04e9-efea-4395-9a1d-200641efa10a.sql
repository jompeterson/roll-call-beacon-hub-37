
-- Add new enum value
ALTER TYPE public.organization_type ADD VALUE IF NOT EXISTS 'Industry Partner';
ALTER TYPE public.organization_type ADD VALUE IF NOT EXISTS 'School';
