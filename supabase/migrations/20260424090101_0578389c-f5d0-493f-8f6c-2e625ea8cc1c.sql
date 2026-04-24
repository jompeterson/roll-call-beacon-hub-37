-- Add is_private column to all post tables
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- Helper function: is the given user in the same organization as the post creator?
CREATE OR REPLACE FUNCTION public.user_in_creator_org(_viewer_id uuid, _creator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles viewer
    JOIN user_profiles creator ON creator.id = _creator_id
    WHERE viewer.id = _viewer_id
      AND viewer.organization_id IS NOT NULL
      AND viewer.organization_id = creator.organization_id
  );
$$;

-- Helper function: is the given user an administrator?
CREATE OR REPLACE FUNCTION public.user_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles up
    JOIN user_roles ur ON up.role_id = ur.id
    WHERE up.id = _user_id AND ur.name = 'administrator'
  );
$$;

-- ===================== DONATIONS =====================
DROP POLICY IF EXISTS "Anyone can view approved donations" ON public.donations;
CREATE POLICY "Anyone can view approved public donations"
ON public.donations FOR SELECT
USING (is_approved = true AND is_private = false);

CREATE POLICY "Org members can view approved private donations"
ON public.donations FOR SELECT
USING (
  is_approved = true
  AND is_private = true
  AND (
    public.user_in_creator_org(auth.uid(), creator_user_id)
    OR public.user_is_admin(auth.uid())
  )
);

-- ===================== REQUESTS =====================
DROP POLICY IF EXISTS "Anyone can view approved non-completed requests" ON public.requests;
CREATE POLICY "Anyone can view approved public non-completed requests"
ON public.requests FOR SELECT
USING (is_approved = true AND is_completed = false AND is_private = false);

CREATE POLICY "Org members can view approved private requests"
ON public.requests FOR SELECT
USING (
  is_approved = true
  AND is_completed = false
  AND is_private = true
  AND (
    public.user_in_creator_org(auth.uid(), creator_user_id)
    OR public.user_is_admin(auth.uid())
  )
);

-- ===================== SCHOLARSHIPS =====================
DROP POLICY IF EXISTS "Anyone can view approved scholarships" ON public.scholarships;
CREATE POLICY "Anyone can view approved public scholarships"
ON public.scholarships FOR SELECT
USING (is_approved = true AND is_private = false);

CREATE POLICY "Org members can view approved private scholarships"
ON public.scholarships FOR SELECT
USING (
  is_approved = true
  AND is_private = true
  AND (
    public.user_in_creator_org(auth.uid(), creator_user_id)
    OR public.user_is_admin(auth.uid())
  )
);

-- ===================== EVENTS =====================
DROP POLICY IF EXISTS "Users can view all approved events" ON public.events;
CREATE POLICY "Anyone can view approved public events"
ON public.events FOR SELECT
USING ((is_approved = true AND is_private = false) OR creator_user_id = auth.uid());

CREATE POLICY "Org members can view approved private events"
ON public.events FOR SELECT
USING (
  is_approved = true
  AND is_private = true
  AND (
    public.user_in_creator_org(auth.uid(), creator_user_id)
    OR public.user_is_admin(auth.uid())
  )
);

-- ===================== VOLUNTEERS =====================
DROP POLICY IF EXISTS "Users can view all approved volunteers" ON public.volunteers;
CREATE POLICY "Anyone can view approved public volunteers"
ON public.volunteers FOR SELECT
USING ((is_approved = true AND is_private = false) OR creator_user_id = auth.uid());

CREATE POLICY "Org members can view approved private volunteers"
ON public.volunteers FOR SELECT
USING (
  is_approved = true
  AND is_private = true
  AND (
    public.user_in_creator_org(auth.uid(), creator_user_id)
    OR public.user_is_admin(auth.uid())
  )
);