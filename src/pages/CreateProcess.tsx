import { useNavigate } from "react-router-dom";
import { ProcessWizard } from "@/components/ProcessWizard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function CreateProcess() {
  const navigate = useNavigate();

  const handleComplete = async (processData: {
    name: string;
    description: string;
    fields: any[];
    workflow: any[];
  }) => {
    try {
      // Create the process in the database
      const { data: process, error: processError } = await supabase
        .from('processes')
        .insert({
          name: processData.name,
          description: processData.description,
          created_by: "00000000-0000-0000-0000-000000000000", // Demo UUID
        })
        .select()
        .single();

      if (processError) {
        console.error('Error creating process:', processError);
        toast.error('Failed to create process');
        return;
      }

      // Create process fields
      if (processData.fields.length > 0) {
        const fieldsToInsert = processData.fields.map((field, index) => ({
          process_id: process.id,
          field_name: field.field_name,
          field_label: field.field_label,
          field_type: field.field_type,
          is_required: field.is_required,
          display_order: index,
          field_options: field.field_options ? JSON.stringify(field.field_options) : null,
        }));

        const { error: fieldsError } = await supabase
          .from('process_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          console.error('Error creating fields:', fieldsError);
          toast.error('Process created but failed to save some fields');
        }
      }

      toast.success('Process created successfully!');
      navigate("/");
    } catch (error) {
      console.error('Process creation error:', error);
      toast.error('Failed to create process');
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Create New Process</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new quality process with custom fields and workflow steps.
        </p>
      </div>
      <ProcessWizard onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}