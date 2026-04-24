DROP POLICY IF EXISTS "Administrators can manage notification rules" ON public.notification_rules;

CREATE POLICY "Anyone can manage notification rules"
ON public.notification_rules
FOR ALL
USING (true)
WITH CHECK (true);