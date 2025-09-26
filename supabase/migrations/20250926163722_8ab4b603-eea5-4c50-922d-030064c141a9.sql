-- Remove the "This is a test" process and all its related data
DELETE FROM record_field_values WHERE record_id IN (
  SELECT id FROM process_records WHERE process_id = '62425d99-e3f9-4b0a-9294-276799af87dd'
);

DELETE FROM workflow_history WHERE record_id IN (
  SELECT id FROM process_records WHERE process_id = '62425d99-e3f9-4b0a-9294-276799af87dd'
);

DELETE FROM process_records WHERE process_id = '62425d99-e3f9-4b0a-9294-276799af87dd';

DELETE FROM process_fields WHERE process_id = '62425d99-e3f9-4b0a-9294-276799af87dd';

DELETE FROM workflow_steps WHERE process_id = '62425d99-e3f9-4b0a-9294-276799af87dd';

DELETE FROM processes WHERE id = '62425d99-e3f9-4b0a-9294-276799af87dd';

-- Update "Capa" process name to "CAPA"
UPDATE processes 
SET name = 'CAPA' 
WHERE id = '59913940-014c-4c93-b90b-bf69b591ab1f';