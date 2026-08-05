ALTER TABLE public.b2s_classes ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY year DESC, session ASC) AS new_sort
  FROM public.b2s_classes
)
UPDATE public.b2s_classes c
SET sort_order = o.new_sort
FROM ordered o
WHERE c.id = o.id;