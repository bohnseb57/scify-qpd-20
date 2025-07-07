import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Settings, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Process, WorkflowStep } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkflowStepForm {
  id?: string;
  step_name: string;
  step_order: number;
  required_role: string;
  can_approve: boolean;
  can_reject: boolean;
}

export default function ProcessWorkflowConfiguration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStep, setNewStep] = useState<WorkflowStepForm>({
    step_name: "",
    step_order: 1,
    required_role: "quality_reviewer",
    can_approve: true,
    can_reject: true,
  });

  useEffect(() => {
    if (id) {
      loadProcessAndWorkflow();
    }
  }, [id]);

  const loadProcessAndWorkflow = async () => {
    if (!id) return;

    try {
      // Load process
      const { data: processData, error: processError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', id)
        .single();

      if (processError) {
        console.error('Error loading process:', processError);
        toast.error('Failed to load process');
        navigate('/process-config');
        return;
      }

      setProcess(processData);

      // Load workflow steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('process_id', id)
        .order('step_order');

      if (stepsError) {
        console.error('Error loading workflow steps:', stepsError);
        toast.error('Failed to load workflow steps');
        return;
      }

      setWorkflowSteps(stepsData || []);
      
      // Set next step order for new step
      const maxOrder = Math.max(0, ...(stepsData || []).map(step => step.step_order));
      setNewStep(prev => ({ ...prev, step_order: maxOrder + 1 }));
    } catch (error) {
      console.error('Process workflow load error:', error);
      toast.error('Failed to load process workflow');
      navigate('/process-config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!id || !newStep.step_name.trim()) {
      toast.error('Step name is required');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workflow_steps')
        .insert({
          process_id: id,
          step_name: newStep.step_name.trim(),
          step_order: newStep.step_order,
          required_role: newStep.required_role as any,
          can_approve: newStep.can_approve,
          can_reject: newStep.can_reject,
        });

      if (error) {
        console.error('Error adding workflow step:', error);
        toast.error('Failed to add workflow step');
        return;
      }

      toast.success('Workflow step added successfully!');
      setNewStep({
        step_name: "",
        step_order: newStep.step_order + 1,
        required_role: "quality_reviewer",
        can_approve: true,
        can_reject: true,
      });
      loadProcessAndWorkflow();
    } catch (error) {
      console.error('Workflow step add error:', error);
      toast.error('Failed to add workflow step');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Are you sure you want to delete this workflow step?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        console.error('Error deleting workflow step:', error);
        toast.error('Failed to delete workflow step');
        return;
      }

      toast.success('Workflow step deleted successfully!');
      loadProcessAndWorkflow();
    } catch (error) {
      console.error('Workflow step delete error:', error);
      toast.error('Failed to delete workflow step');
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: 'Admin',
      quality_manager: 'Quality Manager',
      quality_reviewer: 'Quality Reviewer',
      initiator: 'Initiator',
      qa_final_approver: 'QA Final Approver',
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Process Not Found</h1>
          <Button onClick={() => navigate('/process-config')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Configuration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-subtle min-h-full">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/process-config/${id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Process
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Workflow Configuration</h1>
                <p className="text-muted-foreground">{process.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Existing Workflow Steps */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Current Workflow Steps</CardTitle>
              <CardDescription>
                {workflowSteps.length === 0 
                  ? "No workflow steps configured for this process"
                  : `${workflowSteps.length} step(s) configured`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflowSteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No workflow steps configured yet. Add your first step below.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background/50">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{step.step_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Role: {getRoleDisplayName(step.required_role)}</span>
                          {step.can_approve && <span className="text-green-600">Can Approve</span>}
                          {step.can_reject && <span className="text-red-600">Can Reject</span>}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStep(step.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Step */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Add Workflow Step</CardTitle>
              <CardDescription>
                Configure a new step in the workflow process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="step_name">Step Name *</Label>
                  <Input
                    id="step_name"
                    value={newStep.step_name}
                    onChange={(e) => setNewStep(prev => ({ ...prev, step_name: e.target.value }))}
                    placeholder="e.g., Initial Review, Manager Approval"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="required_role">Required Role *</Label>
                  <Select
                    value={newStep.required_role}
                    onValueChange={(value) => setNewStep(prev => ({ ...prev, required_role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initiator">Initiator</SelectItem>
                      <SelectItem value="quality_reviewer">Quality Reviewer</SelectItem>
                      <SelectItem value="quality_manager">Quality Manager</SelectItem>
                      <SelectItem value="qa_final_approver">QA Final Approver</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="can_approve"
                    checked={newStep.can_approve}
                    onCheckedChange={(checked) => setNewStep(prev => ({ ...prev, can_approve: checked }))}
                  />
                  <Label htmlFor="can_approve">Can Approve</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="can_reject"
                    checked={newStep.can_reject}
                    onCheckedChange={(checked) => setNewStep(prev => ({ ...prev, can_reject: checked }))}
                  />
                  <Label htmlFor="can_reject">Can Reject</Label>
                </div>
              </div>

              <Button 
                onClick={handleAddStep}
                disabled={isSaving || !newStep.step_name.trim()}
                className="bg-gradient-primary hover:bg-primary-hover transition-smooth"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isSaving ? 'Adding...' : 'Add Step'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
