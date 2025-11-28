-- Allow process creators to delete their processes
CREATE POLICY "Process creators can delete their processes" 
ON public.processes 
FOR DELETE 
USING (created_by = auth.uid());

-- Since this is a demo project with RLS disabled, also add a permissive policy
CREATE POLICY "Allow delete for demo" 
ON public.processes 
FOR DELETE 
USING (true);