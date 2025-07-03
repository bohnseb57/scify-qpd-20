-- Temporarily disable RLS on processes table for demo purposes
ALTER TABLE public.processes DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on related tables for demo
ALTER TABLE public.process_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_field_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;