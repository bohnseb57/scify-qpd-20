-- Create enum for field types
CREATE TYPE public.field_type AS ENUM (
  'text',
  'textarea', 
  'number',
  'date',
  'select',
  'checkbox',
  'email',
  'url'
);

-- Create enum for workflow status
CREATE TYPE public.workflow_status AS ENUM (
  'draft',
  'in_progress', 
  'approved',
  'rejected',
  'completed'
);

-- Create enum for user roles  
CREATE TYPE public.user_role AS ENUM (
  'admin',
  'quality_manager',
  'quality_reviewer', 
  'initiator',
  'qa_final_approver'
);

-- Create processes table
CREATE TABLE public.processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_suggestion TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create process fields table
CREATE TABLE public.process_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type field_type NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  field_options JSONB, -- For select options
  validation_rules JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow steps table
CREATE TABLE public.workflow_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  required_role user_role NOT NULL,
  can_approve BOOLEAN NOT NULL DEFAULT true,
  can_reject BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create process records table
CREATE TABLE public.process_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID REFERENCES public.processes(id) NOT NULL,
  record_title TEXT NOT NULL,
  current_status workflow_status NOT NULL DEFAULT 'draft',
  current_step_id UUID REFERENCES public.workflow_steps(id),
  created_by UUID NOT NULL,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create record field values table
CREATE TABLE public.record_field_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES public.process_records(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES public.process_fields(id) ON DELETE CASCADE NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(record_id, field_id)
);

-- Create workflow history table
CREATE TABLE public.workflow_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID REFERENCES public.process_records(id) ON DELETE CASCADE NOT NULL,
  from_step_id UUID REFERENCES public.workflow_steps(id),
  to_step_id UUID REFERENCES public.workflow_steps(id),
  action TEXT NOT NULL, -- 'submit', 'approve', 'reject'
  comments TEXT,
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'initiator',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for processes
CREATE POLICY "Users can view all processes" 
ON public.processes FOR SELECT USING (true);

CREATE POLICY "Admins and quality managers can create processes" 
ON public.processes FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'quality_manager')
  )
);

CREATE POLICY "Process creators can update their processes" 
ON public.processes FOR UPDATE 
USING (created_by = auth.uid());

-- Create policies for process fields
CREATE POLICY "Users can view process fields" 
ON public.process_fields FOR SELECT USING (true);

CREATE POLICY "Process owners can manage fields" 
ON public.process_fields FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.processes 
    WHERE id = process_fields.process_id 
    AND created_by = auth.uid()
  )
);

-- Create policies for workflow steps
CREATE POLICY "Users can view workflow steps" 
ON public.workflow_steps FOR SELECT USING (true);

CREATE POLICY "Process owners can manage workflow steps" 
ON public.workflow_steps FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.processes 
    WHERE id = workflow_steps.process_id 
    AND created_by = auth.uid()
  )
);

-- Create policies for process records
CREATE POLICY "Users can view relevant records" 
ON public.process_records FOR SELECT 
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'quality_manager')
  )
);

CREATE POLICY "Users can create records" 
ON public.process_records FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Assigned users can update records" 
ON public.process_records FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'quality_manager')
  )
);

-- Create policies for record field values
CREATE POLICY "Users can view record values for accessible records" 
ON public.record_field_values FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.process_records 
    WHERE id = record_field_values.record_id 
    AND (
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'quality_manager')
      )
    )
  )
);

CREATE POLICY "Users can manage values for accessible records" 
ON public.record_field_values FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.process_records 
    WHERE id = record_field_values.record_id 
    AND (
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'quality_manager')
      )
    )
  )
);

-- Create policies for workflow history
CREATE POLICY "Users can view workflow history for accessible records" 
ON public.workflow_history FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.process_records 
    WHERE id = workflow_history.record_id 
    AND (
      created_by = auth.uid() OR 
      assigned_to = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'quality_manager')
      )
    )
  )
);

CREATE POLICY "Users can add workflow history" 
ON public.workflow_history FOR INSERT 
WITH CHECK (performed_by = auth.uid());

-- Create policies for user profiles
CREATE POLICY "Users can view all profiles" 
ON public.user_profiles FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_processes_updated_at
  BEFORE UPDATE ON public.processes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_process_records_updated_at
  BEFORE UPDATE ON public.process_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_record_field_values_updated_at
  BEFORE UPDATE ON public.record_field_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();