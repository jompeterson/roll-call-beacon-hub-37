
-- Create a table for comments that can be attached to different types of content
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  creator_user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('event', 'scholarship', 'donation', 'request')),
  content_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure proper access control
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to view all comments
CREATE POLICY "Authenticated users can view comments" 
  ON public.comments 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to create comments
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows users to update their own comments
CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  TO authenticated
  USING (creator_user_id = auth.uid());

-- Create policy that allows users to delete their own comments
CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  TO authenticated
  USING (creator_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_comments_content_type_id ON public.comments(content_type, content_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_creator ON public.comments(creator_user_id);

-- Enable realtime for comments
ALTER TABLE public.comments REPLICA IDENTITY FULL;
