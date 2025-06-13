
-- Create a table for custom widgets
CREATE TABLE public.custom_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  section TEXT NOT NULL CHECK (section IN ('pending_approvals', 'monthly_metrics', 'yearly_metrics')),
  metrics JSONB NOT NULL DEFAULT '[]',
  display_config JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_custom_widgets_section ON public.custom_widgets(section);
CREATE INDEX idx_custom_widgets_position ON public.custom_widgets(position);
CREATE INDEX idx_custom_widgets_active ON public.custom_widgets(is_active);

-- Add Row Level Security (RLS)
ALTER TABLE public.custom_widgets ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all authenticated users to view active widgets
CREATE POLICY "Users can view active widgets" 
  ON public.custom_widgets 
  FOR SELECT 
  USING (is_active = true);

-- Create policy that allows administrators to manage widgets
CREATE POLICY "Administrators can manage widgets" 
  ON public.custom_widgets 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.id = auth.uid() AND ur.name = 'administrator'
    )
  );
