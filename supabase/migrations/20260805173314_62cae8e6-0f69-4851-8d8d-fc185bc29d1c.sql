CREATE TABLE public.student_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  issuer text,
  issued_on date,
  expires_on date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.student_certifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_certifications TO authenticated;
GRANT ALL ON public.student_certifications TO service_role;

ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student certifications are viewable and manageable"
ON public.student_certifications FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_student_certifications_updated_at
BEFORE UPDATE ON public.student_certifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();