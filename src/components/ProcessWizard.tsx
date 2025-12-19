import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedField, GeneratedWorkflow, ProcessGenerationRequest } from "@/types/qpd";
import { Sparkles, Edit2, Trash2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";

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
  const [inputMode, setInputMode] = useState<"describe" | "upload">("describe");
  const [processName, setProcessName] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [generatedFields, setGeneratedFields] = useState<GeneratedField[]>([]);
  const [generatedWorkflow, setGeneratedWorkflow] = useState<GeneratedWorkflow[]>([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sopReference, setSopReference] = useState<string | null>(null);

  const generateProcessStructure = async () => {
    if (!processName.trim() || !processDescription.trim()) {
      toast.error("Please enter both process name and description");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call Lovable AI via edge function
      const response = await fetch(
        'https://kdhjhmldzfyhylzzgbsc.supabase.co/functions/v1/generate-process',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: processName,
            description: processDescription
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limits exceeded. Please try again in a moment.");
          return;
        }
        if (response.status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      setGeneratedFields(result.suggested_fields);
      setGeneratedWorkflow(result.suggested_workflow);
      setAiExplanation(result.ai_explanation);
      setStep(2);
      
      toast.success("AI process structure generated successfully!");
    } catch (error) {
      console.error('Error generating process structure:', error);
      toast.error("Failed to generate process structure. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseSOPDocument = async (file: File, base64: string) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(
        'https://kdhjhmldzfyhylzzgbsc.supabase.co/functions/v1/parse-sop',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_base64: base64,
            file_type: file.type,
            file_name: file.name
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limits exceeded. Please try again in a moment.");
          return;
        }
        if (response.status === 402) {
          toast.error("AI credits exhausted. Please add credits to continue.");
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      setProcessName(result.suggested_name);
      setProcessDescription(result.suggested_description);
      setGeneratedFields(result.suggested_fields);
      setGeneratedWorkflow(result.suggested_workflow);
      setAiExplanation(result.ai_explanation);
      setSopReference(result.sop_reference || null);
      setStep(2);
      
      toast.success("SOP document analyzed successfully!");
    } catch (error) {
      console.error('Error parsing SOP document:', error);
      toast.error("Failed to analyze SOP document. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
            Describe your process or upload an existing SOP document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "describe" | "upload")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="describe" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Describe Process
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <FileText className="h-4 w-4" />
                Upload SOP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="describe" className="space-y-6 pt-4">
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
            </TabsContent>

            <TabsContent value="upload" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label>Upload SOP Document</Label>
                <p className="text-sm text-muted-foreground">
                  Upload an existing Standard Operating Procedure document. AI will analyze it and extract the process structure, form fields, and workflow steps.
                </p>
              </div>

              <FileUpload 
                onFileSelect={parseSOPDocument}
                isLoading={isGenerating}
                maxSizeMB={10}
              />

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              </div>
            </TabsContent>
          </Tabs>
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
            {sopReference && (
              <p className="text-xs text-muted-foreground mt-2">
                SOP Reference: {sopReference}
              </p>
            )}
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