-- Disable Row Level Security on workflow_steps table to allow workflow creation without authentication
ALTER TABLE workflow_steps DISABLE ROW LEVEL SECURITY;