
-- Reassign the one organization currently using 'Other'
UPDATE public.organizations
SET type = 'Industry Partner'::public.organization_type
WHERE type = 'Other'::public.organization_type;

-- Recreate the enum without the removed values
ALTER TYPE public.organization_type RENAME TO organization_type_old;

CREATE TYPE public.organization_type AS ENUM (
  'Non-Profit',
  'School',
  'Industry Partner',
  'Professional Association'
);

ALTER TABLE public.organizations
  ALTER COLUMN type TYPE public.organization_type
  USING type::text::public.organization_type;

DROP TYPE public.organization_type_old;
