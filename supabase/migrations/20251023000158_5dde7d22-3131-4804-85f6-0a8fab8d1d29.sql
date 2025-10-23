-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_request_fulfillment_created ON request_fulfillments;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS notify_request_creator_of_fulfillment();

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