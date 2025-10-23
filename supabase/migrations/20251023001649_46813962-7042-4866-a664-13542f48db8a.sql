-- Allow users to view profiles of people who have interacted with their posts
CREATE POLICY "Users can view profiles of people who interacted with their content"
ON user_profiles
FOR SELECT
USING (
  -- Allow viewing profiles of users who accepted your donations
  EXISTS (
    SELECT 1 FROM donation_acceptances da
    JOIN donations d ON da.donation_id = d.id
    WHERE da.user_id = user_profiles.id
    AND d.creator_user_id = auth.uid()
  )
  OR
  -- Allow viewing profiles of users who fulfilled your requests
  EXISTS (
    SELECT 1 FROM request_fulfillments rf
    JOIN requests r ON rf.request_id = r.id
    WHERE rf.user_id = user_profiles.id
    AND r.creator_user_id = auth.uid()
  )
  OR
  -- Allow viewing profiles of users who RSVPed to your events
  EXISTS (
    SELECT 1 FROM event_rsvps er
    JOIN events e ON er.event_id = e.id
    WHERE er.user_id = user_profiles.id
    AND e.creator_user_id = auth.uid()
  )
  OR
  -- Allow viewing profiles of users who signed up for your volunteers
  EXISTS (
    SELECT 1 FROM volunteer_signups vs
    JOIN volunteers v ON vs.volunteer_id = v.id
    WHERE vs.user_id = user_profiles.id
    AND v.creator_user_id = auth.uid()
  )
  OR
  -- Allow viewing profiles of users who commented on your content
  EXISTS (
    SELECT 1 FROM comments c
    WHERE c.creator_user_id = user_profiles.id
    AND (
      (c.content_type = 'donation' AND EXISTS (SELECT 1 FROM donations WHERE id = c.content_id AND creator_user_id = auth.uid()))
      OR
      (c.content_type = 'request' AND EXISTS (SELECT 1 FROM requests WHERE id = c.content_id AND creator_user_id = auth.uid()))
      OR
      (c.content_type = 'event' AND EXISTS (SELECT 1 FROM events WHERE id = c.content_id AND creator_user_id = auth.uid()))
      OR
      (c.content_type = 'volunteer' AND EXISTS (SELECT 1 FROM volunteers WHERE id = c.content_id AND creator_user_id = auth.uid()))
    )
  )
);