-- Disable RLS for prototype testing on processes table
ALTER TABLE processes DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on process_fields table for field creation
ALTER TABLE process_fields DISABLE ROW LEVEL SECURITY;