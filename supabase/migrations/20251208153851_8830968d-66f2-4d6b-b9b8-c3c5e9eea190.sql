-- Create record_links table for inter-process linking
CREATE TABLE public.record_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_record_id UUID NOT NULL REFERENCES public.process_records(id) ON DELETE CASCADE,
  target_record_id UUID REFERENCES public.process_records(id) ON DELETE CASCADE,
  target_process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL DEFAULT 'triggered_by',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Indexes for efficient lookups
CREATE INDEX idx_record_links_source ON public.record_links(source_record_id);
CREATE INDEX idx_record_links_target ON public.record_links(target_record_id);
CREATE INDEX idx_record_links_target_process ON public.record_links(target_process_id);

-- Enable RLS
ALTER TABLE public.record_links ENABLE ROW LEVEL SECURITY;

-- RLS policies (permissive for demo)
CREATE POLICY "Users can view record links"
ON public.record_links FOR SELECT
USING (true);

CREATE POLICY "Users can create record links"
ON public.record_links FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update record links"
ON public.record_links FOR UPDATE
USING (true);

CREATE POLICY "Users can delete record links"
ON public.record_links FOR DELETE
USING (true);