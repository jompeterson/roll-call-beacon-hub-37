-- Create request_fulfillments table to track users who want to fulfill requests
CREATE TABLE request_fulfillments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Enable RLS
ALTER TABLE request_fulfillments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view fulfillments for approved requests
CREATE POLICY "Users can view fulfillments for approved requests"
ON request_fulfillments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = request_fulfillments.request_id
    AND requests.is_approved = true
  )
);

-- Policy: Authenticated users can fulfill requests
CREATE POLICY "Authenticated users can fulfill requests"
ON request_fulfillments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM requests
    WHERE requests.id = request_fulfillments.request_id
    AND requests.is_approved = true
  )
);

-- Create function to notify request creator when someone wants to fulfill
CREATE OR REPLACE FUNCTION notify_request_creator_of_fulfillment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_title TEXT;
  creator_id UUID;
BEGIN
  -- Get request details
  SELECT title, creator_user_id INTO request_title, creator_id
  FROM requests WHERE id = NEW.request_id;
  
  -- Create notification for the request creator
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    message, 
    related_content_type, 
    related_content_id, 
    creator_user_id
  )
  VALUES (
    creator_id,
    'new_post',
    'Someone Wants to Fulfill Your Request',
    'Someone is interested in fulfilling your request "' || request_title || '"',
    'request',
    NEW.request_id,
    NEW.user_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for request fulfillment notifications
CREATE TRIGGER on_request_fulfillment_created
  AFTER INSERT ON request_fulfillments
  FOR EACH ROW
  EXECUTE FUNCTION notify_request_creator_of_fulfillment();