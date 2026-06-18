ALTER TABLE public.processes
  ADD COLUMN IF NOT EXISTS parent_process_id uuid REFERENCES public.processes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_processes_parent_process_id
  ON public.processes(parent_process_id);