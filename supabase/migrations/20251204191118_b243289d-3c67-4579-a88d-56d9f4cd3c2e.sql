-- Add record_id_prefix to processes table
ALTER TABLE public.processes 
ADD COLUMN record_id_prefix TEXT;

-- Add record_identifier to process_records table
ALTER TABLE public.process_records 
ADD COLUMN record_identifier TEXT;