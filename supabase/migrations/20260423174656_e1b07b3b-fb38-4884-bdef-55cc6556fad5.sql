ALTER TABLE public.donations 
  ADD COLUMN dimensions numeric,
  ADD COLUMN dimension_unit text;

ALTER TABLE public.requests 
  ADD COLUMN dimensions numeric,
  ADD COLUMN dimension_unit text;