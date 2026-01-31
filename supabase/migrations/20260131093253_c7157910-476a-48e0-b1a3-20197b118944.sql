-- Update process_records.process_id to CASCADE on delete
ALTER TABLE process_records 
  DROP CONSTRAINT process_records_process_id_fkey;
ALTER TABLE process_records 
  ADD CONSTRAINT process_records_process_id_fkey 
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE CASCADE;

-- Update process_records.current_step_id to SET NULL on delete
ALTER TABLE process_records 
  DROP CONSTRAINT process_records_current_step_id_fkey;
ALTER TABLE process_records 
  ADD CONSTRAINT process_records_current_step_id_fkey 
  FOREIGN KEY (current_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;

-- Update workflow_history.from_step_id to SET NULL on delete
ALTER TABLE workflow_history 
  DROP CONSTRAINT workflow_history_from_step_id_fkey;
ALTER TABLE workflow_history 
  ADD CONSTRAINT workflow_history_from_step_id_fkey 
  FOREIGN KEY (from_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;

-- Update workflow_history.to_step_id to SET NULL on delete
ALTER TABLE workflow_history 
  DROP CONSTRAINT workflow_history_to_step_id_fkey;
ALTER TABLE workflow_history 
  ADD CONSTRAINT workflow_history_to_step_id_fkey 
  FOREIGN KEY (to_step_id) REFERENCES workflow_steps(id) ON DELETE SET NULL;