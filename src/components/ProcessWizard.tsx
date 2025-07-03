import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GeneratedField, GeneratedWorkflow, ProcessGenerationRequest } from "@/types/qpd";
import { Sparkles, Edit2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProcessWizardProps {
  onComplete: (processData: {
    name: string;
    description: string;
    fields: GeneratedField[];
    workflow: GeneratedWorkflow[];
  }) => void;
  onCancel: () => void;
}

export function ProcessWizard({ onComplete, onCancel }: ProcessWizardProps) {
  const [step, setStep] = useState(1);
  const [processName, setProcessName] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [generatedFields, setGeneratedFields] = useState<GeneratedField[]>([]);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow[]>([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProcessStructure = async () => {
    if (!processName.trim() || !processDescription.trim()) {
      toast.error("Please enter both process name and description");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation based on description keywords
    setTimeout(() => {
      const mockGeneration = simulateAIGeneration(processName, processDescription);
      setGeneratedFields(mockGeneration.suggested_fields);
      setGeneratedWorkflow(mockGeneration.suggested_workflow);
      setAiExplanation(mockGeneration.ai_explanation);
      setStep(2);
      setIsGenerating(false);
    }, 2000);
  };

  const simulateAIGeneration = (name: string, description: string): {
    suggested_fields: GeneratedField[];
    suggested_workflow: GeneratedWorkflow[];
    ai_explanation: string;
  } => {
    const lowerDesc = description.toLowerCase();
    const fields: GeneratedField[] = [];
    const workflow: GeneratedWorkflow[] = [];

    // Common base fields
    fields.push({
      field_name: "title",
      field_label: "Title",
      field_type: "text",
      is_required: true,
      reason: "Essential for identifying the record"
    });

    fields.push({
      field_name: "description",
      field_label: "Description",
      field_type: "textarea",
      is_required: true,
      reason: "Detailed information about the item"
    });

    // Context-specific fields based on keywords
    if (lowerDesc.includes("capa") || lowerDesc.includes("corrective") || lowerDesc.includes("preventive")) {
      fields.push(
        {
          field_name: "severity",
          field_label: "Severity Level",
          field_type: "select",
          is_required: true,
          field_options: ["Low", "Medium", "High", "Critical"],
          reason: "CAPA processes require severity classification"
        },
        {
          field_name: "root_cause",
          field_label: "Root Cause Analysis",
          field_type: "textarea",
          is_required: false,
          reason: "Essential for effective corrective actions"
        },
        {
          field_name: "corrective_action",
          field_label: "Corrective Action Plan",
          field_type: "textarea",
          is_required: false,
          reason: "Define specific actions to address the issue"
        }
      );
    }

    if (lowerDesc.includes("audit") || lowerDesc.includes("inspection")) {
      fields.push(
        {
          field_name: "audit_area",
          field_label: "Audit Area",
          field_type: "select",
          is_required: true,
          field_options: ["Manufacturing", "Quality Control", "Documentation", "Facilities"],
          reason: "Audits need to specify the area being evaluated"
        },
        {
          field_name: "findings",
          field_label: "Audit Findings",
          field_type: "textarea",
          is_required: false,
          reason: "Document observations and non-conformances"
        }
      );
    }

    if (lowerDesc.includes("deviation") || lowerDesc.includes("non-conformance")) {
      fields.push(
        {
          field_name: "impact_assessment",
          field_label: "Impact Assessment",
          field_type: "textarea",
          is_required: true,
          reason: "Evaluate potential impact on product quality"
        },
        {
          field_name: "immediate_action",
          field_label: "Immediate Action Taken",
          field_type: "textarea",
          is_required: false,
          reason: "Document immediate containment actions"
        }
      );
    }

    // Add target completion date for most processes
    fields.push({
      field_name: "target_completion",
      field_label: "Target Completion Date",
      field_type: "date",
      is_required: false,
      reason: "Help track timeline and accountability"
    });

    // Generate workflow based on process type
    if (lowerDesc.includes("capa") || lowerDesc.includes("deviation")) {
      workflow.push(
        {
          step_name: "Initial Review",
          required_role: "quality_reviewer",
          reason: "Quality team evaluates the submission"
        },
        {
          step_name: "Investigation",
          required_role: "quality_reviewer", 
          reason: "Detailed analysis and root cause investigation"
        },
        {
          step_name: "Final Approval",
          required_role: "qa_final_approver",
          reason: "Senior QA approval for implementation"
        }
      );
    } else if (lowerDesc.includes("audit")) {
      workflow.push(
        {
          step_name: "Planning Review",
          required_role: "quality_manager",
          reason: "Review audit scope and methodology"
        },
        {
          step_name: "Findings Review",
          required_role: "quality_reviewer",
          reason: "Evaluate audit findings and recommendations"
        },
        {
          step_name: "Final Approval",
          required_role: "qa_final_approver",
          reason: "Approve audit completion and follow-up actions"
        }
      );
    } else {
      // Generic workflow
      workflow.push(
        {
          step_name: "Review",
          required_role: "quality_reviewer",
          reason: "Initial quality review"
        },
        {
          step_name: "Approval",
          required_role: "quality_manager",
          reason: "Management approval for completion"
        }
      );
    }

    return {
      suggested_fields: fields,
      suggested_workflow: workflow,
      ai_explanation: `Based on your process description, I've identified this as a ${lowerDesc.includes("capa") ? "CAPA" : lowerDesc.includes("audit") ? "audit" : "quality"} process. I've suggested fields commonly required for this type of process in life sciences organizations, following industry best practices for regulatory compliance.`
    };
  };

  const removeField = (index: number) => {
    setGeneratedFields(prev => prev.filter((_, i) => i !== index));
  };

  const editField = (index: number, updates: Partial<GeneratedField>) => {
    setGeneratedFields(prev => prev.map((field, i) => 
      i === index ? { ...field, ...updates } : field
    ));
  };

  const addField = () => {
    const newField: GeneratedField = {
      field_name: "new_field",
      field_label: "New Field",
      field_type: "text",
      is_required: false,
      reason: "Custom field added by user"
    };
    setGeneratedFields(prev => [...prev, newField]);
  };

  const handleComplete = () => {
    onComplete({
      name: processName,
      description: processDescription,
      fields: generatedFields,
      workflow: generatedWorkflow
    });
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create New Quality Process
          </CardTitle>
          <CardDescription>
            Describe your process and let AI suggest the optimal structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="process-name">Process Name</Label>
            <Input
              id="process-name"
              placeholder="e.g., CAPA Process, Audit Flow, Deviation Management"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="process-description">Process Description</Label>
            <Textarea
              id="process-description"
              placeholder="Describe what this process does, what steps are involved, and what outcomes you expect..."
              rows={4}
              value={processDescription}
              onChange={(e) => setProcessDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="ai" 
              onClick={generateProcessStructure}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Process Structure
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Generated Process Structure
          </CardTitle>
          <CardDescription>
            Review and customize the suggested fields and workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-accent/50 p-4 rounded-lg mb-6">
            <p className="text-sm text-accent-foreground">{aiExplanation}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fields Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Form Fields</h3>
                <Button variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>
              
              <div className="space-y-3">
                {generatedFields.map((field, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{field.field_label}</span>
                          <Badge variant="outline" className="text-xs">
                            {field.field_type}
                          </Badge>
                          {field.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {field.reason && (
                          <p className="text-xs text-muted-foreground">{field.reason}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => {/* Edit functionality */}}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeField(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Workflow Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Approval Workflow</h3>
              <div className="space-y-3">
                {generatedWorkflow.map((step, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.step_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Role: {step.required_role.replace('_', ' ')}
                        </div>
                        {step.reason && (
                          <p className="text-xs text-muted-foreground mt-1">{step.reason}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex gap-3">
            <Button onClick={handleComplete} className="flex-1">
              Create Process
            </Button>
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}