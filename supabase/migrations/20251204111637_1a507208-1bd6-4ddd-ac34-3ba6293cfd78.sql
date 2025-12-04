-- Add tag column to processes table for organizing processes
ALTER TABLE public.processes
ADD COLUMN tag TEXT DEFAULT NULL;