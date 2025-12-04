export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'url';

export type WorkflowStatus = 'draft' | 'in_progress' | 'approved' | 'rejected' | 'completed';

export type UserRole = 'admin' | 'quality_manager' | 'quality_reviewer' | 'initiator' | 'qa_final_approver';

export interface ProcessField {
  id: string;
  process_id: string;
  field_name: string;
  field_label: string;
  field_type: FieldType;
  is_required: boolean;
  field_options?: string[];
  validation_rules?: Record<string, any>;
  display_order: number;
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  process_id: string;
  step_name: string;
  step_order: number;
  required_role: UserRole;
  can_approve: boolean;
  can_reject: boolean;
  created_at: string;
}

export interface Process {
  id: string;
  name: string;
  description: string;
  ai_suggestion?: string;
  tag?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  fields?: ProcessField[];
  workflow_steps?: WorkflowStep[];
}

export interface ProcessRecord {
  id: string;
  process_id: string;
  record_title: string;
  current_status: WorkflowStatus;
  current_step_id?: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  process?: Process;
  field_values?: RecordFieldValue[];
  current_step?: WorkflowStep;
}

export interface RecordFieldValue {
  id: string;
  record_id: string;
  field_id: string;
  field_value?: string;
  created_at: string;
  updated_at: string;
  field?: ProcessField;
}

export interface WorkflowHistory {
  id: string;
  record_id: string;
  from_step_id?: string;
  to_step_id?: string;
  action: string;
  comments?: string;
  performed_by: string;
  performed_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department?: string;
  created_at: string;
  updated_at: string;
}

// AI Process Generation
export interface ProcessGenerationRequest {
  name: string;
  description: string;
}

export interface GeneratedField {
  field_name: string;
  field_label: string;
  field_type: FieldType;
  is_required: boolean;
  field_options?: string[];
  reason?: string;
}

export interface GeneratedWorkflow {
  step_name: string;
  required_role: UserRole;
  reason?: string;
}

export interface ProcessGenerationResponse {
  suggested_fields: GeneratedField[];
  suggested_workflow: GeneratedWorkflow[];
  ai_explanation: string;
}