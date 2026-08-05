DROP POLICY IF EXISTS "Non-students view student profiles" ON public.student_profiles;
DROP POLICY IF EXISTS "Students manage own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Non-students view work experience" ON public.student_work_experience;
DROP POLICY IF EXISTS "Students manage own work experience" ON public.student_work_experience;
DROP POLICY IF EXISTS "Non-students view education" ON public.student_education;
DROP POLICY IF EXISTS "Students manage own education" ON public.student_education;

CREATE POLICY "student_profiles_all" ON public.student_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "student_work_experience_all" ON public.student_work_experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "student_education_all" ON public.student_education FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_work_experience TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_education TO anon, authenticated;
GRANT ALL ON public.student_profiles TO service_role;
GRANT ALL ON public.student_work_experience TO service_role;
GRANT ALL ON public.student_education TO service_role;