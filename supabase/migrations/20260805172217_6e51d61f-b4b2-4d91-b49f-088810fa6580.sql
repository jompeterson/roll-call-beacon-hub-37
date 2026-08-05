CREATE TABLE public.student_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  completed_on date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.student_courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_courses TO authenticated;
GRANT ALL ON public.student_courses TO service_role;

ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student courses are viewable and manageable"
ON public.student_courses FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_student_courses_user_id ON public.student_courses(user_id);

CREATE TRIGGER update_student_courses_updated_at
BEFORE UPDATE ON public.student_courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();