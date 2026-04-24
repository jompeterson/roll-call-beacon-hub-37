
-- ============ STUDENT PROFILES ============
CREATE TABLE public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  resume_url TEXT,
  resume_filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Helper: is the viewer a non-student (or admin)?
CREATE OR REPLACE FUNCTION public.is_non_student(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = _user_id AND ur.name <> 'student'
  );
$$;

-- Helper: is the user a student?
CREATE OR REPLACE FUNCTION public.is_student(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = _user_id AND ur.name = 'student'
  );
$$;

CREATE POLICY "Students manage own profile" ON public.student_profiles
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Non-students view student profiles" ON public.student_profiles
  FOR SELECT USING (public.is_non_student(auth.uid()));

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ WORK EXPERIENCE ============
CREATE TABLE public.student_work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  currently_working BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own work experience" ON public.student_work_experience
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Non-students view work experience" ON public.student_work_experience
  FOR SELECT USING (public.is_non_student(auth.uid()));

CREATE TRIGGER update_work_experience_updated_at
BEFORE UPDATE ON public.student_work_experience
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_work_experience_user ON public.student_work_experience(user_id);

-- ============ EDUCATION ============
CREATE TABLE public.student_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  currently_studying BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students manage own education" ON public.student_education
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Non-students view education" ON public.student_education
  FOR SELECT USING (public.is_non_student(auth.uid()));

CREATE TRIGGER update_education_updated_at
BEFORE UPDATE ON public.student_education
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_education_user ON public.student_education(user_id);

-- ============ RESUMES BUCKET ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Resumes are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

CREATE POLICY "Students can upload their own resume"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can update their own resume"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Students can delete their own resume"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
