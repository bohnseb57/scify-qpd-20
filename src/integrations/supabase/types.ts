export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      process_fields: {
        Row: {
          created_at: string
          display_order: number
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: Database["public"]["Enums"]["field_type"]
          id: string
          is_required: boolean
          process_id: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type: Database["public"]["Enums"]["field_type"]
          id?: string
          is_required?: boolean
          process_id: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          display_order?: number
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: Database["public"]["Enums"]["field_type"]
          id?: string
          is_required?: boolean
          process_id?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "process_fields_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_records: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          current_status: Database["public"]["Enums"]["workflow_status"]
          current_step_id: string | null
          id: string
          process_id: string
          record_identifier: string | null
          record_title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          current_status?: Database["public"]["Enums"]["workflow_status"]
          current_step_id?: string | null
          id?: string
          process_id: string
          record_identifier?: string | null
          record_title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          current_status?: Database["public"]["Enums"]["workflow_status"]
          current_step_id?: string | null
          id?: string
          process_id?: string
          record_identifier?: string | null
          record_title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_records_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_records_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          ai_suggestion: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean
          name: string
          record_id_prefix: string | null
          sub_entity_config: Json | null
          tag: string | null
          updated_at: string
        }
        Insert: {
          ai_suggestion?: string | null
          created_at?: string
          created_by: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          record_id_prefix?: string | null
          sub_entity_config?: Json | null
          tag?: string | null
          updated_at?: string
        }
        Update: {
          ai_suggestion?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          record_id_prefix?: string | null
          sub_entity_config?: Json | null
          tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      record_field_values: {
        Row: {
          created_at: string
          field_id: string
          field_value: string | null
          id: string
          record_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_id: string
          field_value?: string | null
          id?: string
          record_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_id?: string
          field_value?: string | null
          id?: string
          record_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "process_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "record_field_values_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "process_records"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_history: {
        Row: {
          action: string
          comments: string | null
          from_step_id: string | null
          id: string
          performed_at: string
          performed_by: string
          record_id: string
          to_step_id: string | null
        }
        Insert: {
          action: string
          comments?: string | null
          from_step_id?: string | null
          id?: string
          performed_at?: string
          performed_by: string
          record_id: string
          to_step_id?: string | null
        }
        Update: {
          action?: string
          comments?: string | null
          from_step_id?: string | null
          id?: string
          performed_at?: string
          performed_by?: string
          record_id?: string
          to_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_history_from_step_id_fkey"
            columns: ["from_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_history_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "process_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_history_to_step_id_fkey"
            columns: ["to_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          can_approve: boolean
          can_reject: boolean
          created_at: string
          id: string
          process_id: string
          required_role: Database["public"]["Enums"]["user_role"]
          step_name: string
          step_order: number
        }
        Insert: {
          can_approve?: boolean
          can_reject?: boolean
          created_at?: string
          id?: string
          process_id: string
          required_role: Database["public"]["Enums"]["user_role"]
          step_name: string
          step_order: number
        }
        Update: {
          can_approve?: boolean
          can_reject?: boolean
          created_at?: string
          id?: string
          process_id?: string
          required_role?: Database["public"]["Enums"]["user_role"]
          step_name?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      field_type:
        | "text"
        | "textarea"
        | "number"
        | "date"
        | "select"
        | "checkbox"
        | "email"
        | "url"
      user_role:
        | "admin"
        | "quality_manager"
        | "quality_reviewer"
        | "initiator"
        | "qa_final_approver"
      workflow_status:
        | "draft"
        | "in_progress"
        | "approved"
        | "rejected"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      field_type: [
        "text",
        "textarea",
        "number",
        "date",
        "select",
        "checkbox",
        "email",
        "url",
      ],
      user_role: [
        "admin",
        "quality_manager",
        "quality_reviewer",
        "initiator",
        "qa_final_approver",
      ],
      workflow_status: [
        "draft",
        "in_progress",
        "approved",
        "rejected",
        "completed",
      ],
    },
  },
} as const
