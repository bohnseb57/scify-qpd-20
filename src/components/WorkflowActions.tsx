import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, UserPlus, Clock } from "lucide-react";
import { ProcessRecord, WorkflowStep } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkflowActionsProps {
  record: ProcessRecord;
  workflowSteps: WorkflowStep[];
  onRecordUpdate: () => void;
}

export function WorkflowActions({ record, workflowSteps, onRecordUpdate }: WorkflowActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [comments, setComments] = useState("");

  const currentStep = workflowSteps.find(step => step.id === record.current_step_id);
  const nextStep = workflowSteps.find(step => step.step_order === (currentStep?.step_order || 0) + 1);
  const canApprove = currentStep?.can_approve || false;
  const canReject = currentStep?.can_reject || false;

  const handleWorkflowAction = async (action: string) => {
    if (!record.id) return;
    
    setIsSubmitting(true);
    try {
      let newStatus = record.current_status;
      let newStepId = record.current_step_id;

      if (action === 'approve') {
        if (nextStep) {
          newStepId = nextStep.id;
          newStatus = 'in_progress';
        } else {
          newStatus = 'approved';
          newStepId = null;
        }
      } else if (action === 'reject') {
        newStatus = 'rejected';
        newStepId = null;
      }

      // Update record status
      const { error: updateError } = await supabase
        .from('process_records')
        .update({
          current_status: newStatus,
          current_step_id: newStepId,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      if (updateError) {
        console.error('Error updating record:', updateError);
        toast.error('Failed to update record status');
        return;
      }

      // Add workflow history entry
      const { error: historyError } = await supabase
        .from('workflow_history')
        .insert({
          record_id: record.id,
          from_step_id: record.current_step_id,
          to_step_id: newStepId,
          action: action,
          comments: comments.trim() || null,
          performed_by: "00000000-0000-0000-0000-000000000000" // Demo UUID
        });

      if (historyError) {
        console.error('Error creating workflow history:', historyError);
      }

      toast.success(`Record ${action}d successfully`);
      setComments("");
      setActionType(null);
      onRecordUpdate();
    } catch (error) {
      console.error('Error processing workflow action:', error);
      toast.error('Failed to process workflow action');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (record.current_status === 'approved' || record.current_status === 'rejected' || record.current_status === 'completed') {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Workflow Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This record has completed the workflow process.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            No Active Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This process doesn't have workflow steps configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Workflow Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Current Step: <span className="font-medium text-foreground">{currentStep.step_name}</span>
        </div>
        
        {actionType && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <Label htmlFor="comments">
              Comments {actionType === 'reject' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={`Add comments for ${actionType} action...`}
              className="min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleWorkflowAction(actionType)}
                disabled={isSubmitting || (actionType === 'reject' && !comments.trim())}
                className="flex-1"
              >
                {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setActionType(null);
                  setComments("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!actionType && (
          <div className="flex gap-2">
            {canApprove && (
              <Button
                onClick={() => setActionType('approve')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {canReject && (
              <Button
                onClick={() => setActionType('reject')}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}