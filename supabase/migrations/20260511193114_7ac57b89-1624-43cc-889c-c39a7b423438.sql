
-- Restrict deletion of approved posts to administrators only
-- Donations
DROP POLICY IF EXISTS "Users can delete their own donations" ON public.donations;
CREATE POLICY "Users can delete their own unapproved donations"
ON public.donations FOR DELETE
USING (
  (is_approved = false AND creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()))
  OR public.user_is_admin(auth.uid())
);

-- Requests
DROP POLICY IF EXISTS "Users can delete their own requests" ON public.requests;
CREATE POLICY "Users can delete their own unapproved requests"
ON public.requests FOR DELETE
USING (
  (is_approved = false AND creator_user_id = (SELECT id FROM public.user_profiles WHERE id = auth.uid()))
  OR public.user_is_admin(auth.uid())
);

-- Scholarships
DROP POLICY IF EXISTS "Users can delete their own scholarships" ON public.scholarships;
CREATE POLICY "Users can delete their own unapproved scholarships"
ON public.scholarships FOR DELETE
USING (
  (is_approved = false AND creator_user_id = auth.uid())
  OR public.user_is_admin(auth.uid())
);

-- Events
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;
CREATE POLICY "Users can delete their own unapproved events"
ON public.events FOR DELETE
USING (
  (is_approved = false AND creator_user_id = auth.uid())
  OR public.user_is_admin(auth.uid())
);

-- Volunteers
DROP POLICY IF EXISTS "Users can delete their own volunteers" ON public.volunteers;
CREATE POLICY "Users can delete their own unapproved volunteers"
ON public.volunteers FOR DELETE
USING (
  (is_approved = false AND creator_user_id = auth.uid())
  OR public.user_is_admin(auth.uid())
);
