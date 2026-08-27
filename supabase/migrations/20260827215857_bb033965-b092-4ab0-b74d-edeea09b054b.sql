ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS helping_organization_text text;

UPDATE public.volunteers v
SET helping_organization_text = o.name
FROM public.organizations o
WHERE v.helping_organization_id = o.id
  AND (v.helping_organization_text IS NULL OR v.helping_organization_text = '');