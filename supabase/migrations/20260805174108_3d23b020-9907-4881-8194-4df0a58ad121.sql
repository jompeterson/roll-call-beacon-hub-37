CREATE TABLE public.b2s_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  year integer NOT NULL,
  session text NOT NULL,
  description text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.b2s_classes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2s_classes TO authenticated;
GRANT ALL ON public.b2s_classes TO service_role;

ALTER TABLE public.b2s_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "B2S classes are viewable and manageable"
ON public.b2s_classes FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_b2s_classes_updated_at
BEFORE UPDATE ON public.b2s_classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.b2s_class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.b2s_classes(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_user_id)
);

GRANT SELECT ON public.b2s_class_students TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.b2s_class_students TO authenticated;
GRANT ALL ON public.b2s_class_students TO service_role;

ALTER TABLE public.b2s_class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "B2S class students are viewable and manageable"
ON public.b2s_class_students FOR ALL USING (true) WITH CHECK (true);