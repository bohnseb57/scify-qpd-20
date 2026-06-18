import { Process, SubEntityConfig } from "@/types/qpd";
import { Json } from "@/integrations/supabase/types";

type RawProcessRow = {
  id: string;
  name: string;
  description: string;
  ai_suggestion: string | null;
  tag: string | null;
  record_id_prefix: string | null;
  sub_entity_config: Json | null;
  parent_process_id?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
};

/**
 * Transforms raw Supabase process data to our Process type,
 * handling the JSON -> SubEntityConfig conversion
 */
export function transformProcessData(data: RawProcessRow): Process {
  return {
    ...data,
    ai_suggestion: data.ai_suggestion ?? undefined,
    tag: data.tag ?? undefined,
    record_id_prefix: data.record_id_prefix ?? undefined,
    sub_entity_config: data.sub_entity_config as SubEntityConfig | null | undefined,
    parent_process_id: data.parent_process_id ?? null,
  };
}

/**
 * Transforms an array of raw Supabase process data to Process[]
 */
export function transformProcessArray(data: RawProcessRow[]): Process[] {
  return data.map(transformProcessData);
}

/**
 * Gets the tasks_enabled setting from a process's sub_entity_config
 * Returns true by default if not set
 */
export function isTasksEnabled(process: Process | null): boolean {
  if (!process?.sub_entity_config) return true; // Default to enabled
  return process.sub_entity_config.tasks_enabled !== false;
}
