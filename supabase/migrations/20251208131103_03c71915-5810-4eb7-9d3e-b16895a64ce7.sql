-- Add sub_entity_config column to processes table
ALTER TABLE processes ADD COLUMN sub_entity_config JSONB DEFAULT '{"tasks_enabled": true}'::jsonb;