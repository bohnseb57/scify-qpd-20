import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, FileText, Lightbulb } from "lucide-react";
import { ProcessField, Process } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { DynamicForm } from "@/components/DynamicForm";

interface GuidedRecordCreationProps {
  processId: string;
  processName: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface StepInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function GuidedRecordCreation({ processId, processName, onComplete, onCancel }: GuidedRecordCreationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [process, setProcess] = useState<Process | null>(null);
  const [fields, setFields] = useState<ProcessField[]>([]);
  const [recordTitle, setRecordTitle] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const steps: StepInfo[] = [
    {
      id: "overview",
      title: "Process Overview",
      description: "Understand what this process will help you accomplish",
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: "basic_info",
      title: "Basic Information",
      description: "Provide a clear title and description for your record",
      icon: <AlertCircle className="h-5 w-5" />
    },
    {
      id: "detailed_form",
      title: "Detailed Information",
      description: "Complete the specific fields required for this process",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      id: "review",
      title: "Review & Submit",
      description: "Review your information before creating the record",
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  useEffect(() => {
    loadProcessDetails();
  }, [processId]);

  const loadProcessDetails = async () => {
    try {
      // Load process details
      const { data: processData, error: processError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) throw processError;
      setProcess(processData);

      // Load process fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('process_fields')
        .select('*')
        .eq('process_id', processId)
        .order('display_order');

      if (fieldsError) throw fieldsError;
      
      // Transform the data to match ProcessField type
      const transformedFields = (fieldsData || []).map(field => ({
        ...field,
        field_options: field.field_options ? 
          (Array.isArray(field.field_options) ? field.field_options : JSON.parse(field.field_options as string)) 
          : undefined
      })) as ProcessField[];
      
      setFields(transformedFields);

    } catch (error) {
      console.error('Error loading process details:', error);
      toast.error('Failed to load process details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const isStepComplete = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return true; // Overview step is always complete
      case 1: return recordTitle.trim().length > 0;
      case 2: {
        // Check if all required fields are filled
        const requiredFields = fields.filter(f => f.is_required);
        return requiredFields.every(field => 
          formValues[field.id] && formValues[field.id].trim().length > 0
        );
      }
      case 3: return true; // Review step
      default: return false;
    }
  };

  const handleCreateRecord = async () => {
    if (!recordTitle.trim()) {
      toast.error('Please enter a record title');
      return;
    }

    setIsCreating(true);
    try {
      // Create the record
      const { data: record, error: recordError } = await supabase
        .from('process_records')
        .insert({
          process_id: processId,
          record_title: recordTitle,
          created_by: "00000000-0000-0000-0000-000000000000", // Demo UUID
          current_status: 'draft'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Save field values
      if (Object.keys(formValues).length > 0) {
        const fieldValues = Object.entries(formValues).map(([fieldId, value]) => ({
          record_id: record.id,
          field_id: fieldId,
          field_value: value
        }));

        const { error: valuesError } = await supabase
          .from('record_field_values')
          .insert(fieldValues);

        if (valuesError) {
          console.error('Error saving field values:', valuesError);
          toast.error('Record created but failed to save some field values');
        }
      }

      toast.success('Record created successfully!');
      onComplete();
      navigate(`/record/${record.id}`);

    } catch (error) {
      console.error('Record creation error:', error);
      toast.error('Failed to create record');
    } finally {
      setIsCreating(false);
    }
  };

  const getFieldGuidance = (field: ProcessField): string => {
    // CAPA-specific guidance
    switch (field.field_name.toLowerCase()) {
      case 'issue_name':
      case 'title':
        return "Provide a clear, concise title that summarizes the issue or opportunity. Example: 'Temperature deviation in storage area B'";
      case 'description':
        return "Describe the issue in detail: What happened? When? Where? Who was involved? What was the impact?";
      case 'root_cause_analysis':
      case 'root_cause':
        return "Use tools like 5-Why analysis or fishbone diagram to identify the underlying cause. Don't just describe symptoms.";
      case 'corrective_action':
        return "What immediate actions will fix the current problem? Be specific about who, what, when, and how.";
      case 'preventive_action':
        return "What systemic changes will prevent this issue from recurring? Consider process, training, or system improvements.";
      case 'severity_level':
      case 'severity':
        return "Consider patient safety, regulatory impact, and business risk when assessing severity.";
      case 'target_completion_date':
        return "Set realistic but urgent timelines. Critical issues should have completion dates within 30 days.";
      default:
        return `Complete this field with accurate information relevant to your ${processName} process.`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading process details...</p>
        </div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Process Not Found</h3>
            <p className="text-muted-foreground mb-4">The requested process could not be loaded.</p>
            <Button onClick={onCancel}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepInfo = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {processName}
              </Badge>
              <Badge variant="outline">Guided Creation</Badge>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create New {processName} Record
            </h1>
            <p className="text-muted-foreground text-lg">
              {currentStepInfo.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-medium text-foreground">
              {currentStepInfo.title}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {currentStepInfo.icon}
              {currentStepInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About {processName}</h3>
                  <p className="text-muted-foreground mb-4">{process.description}</p>
                </div>
                
                <div className="bg-sl-blue-50 border border-sl-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-sl-blue-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    What you'll accomplish:
                  </h4>
                  <ul className="text-sm text-sl-blue-800 space-y-1">
                    <li>• Systematically document and investigate quality issues</li>
                    <li>• Implement corrective actions to fix immediate problems</li>
                    <li>• Establish preventive measures to avoid recurrence</li>
                    <li>• Ensure regulatory compliance and continuous improvement</li>
                  </ul>
                </div>

                <div className="border-l-4 border-warning pl-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>Tip:</strong> This guided process will help you create a comprehensive {processName} record. 
                    Each step includes helpful guidance to ensure you capture all necessary information.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="record-title" className="text-base font-medium">
                    Record Title <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Provide a clear, descriptive title for this {processName} record
                  </p>
                  <Input
                    id="record-title"
                    placeholder="e.g., Temperature deviation in cold storage area B"
                    value={recordTitle}
                    onChange={(e) => setRecordTitle(e.target.value)}
                    className="text-base"
                  />
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h4 className="font-medium text-success mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Good title examples:
                  </h4>
                  <ul className="text-sm text-success/80 space-y-1">
                    <li>• "Batch 2024-0156 failed dissolution test"</li>
                    <li>• "Customer complaint - Product discoloration"</li>
                    <li>• "Equipment calibration overdue - Room 401"</li>
                    <li>• "Training gap identified in cleaning procedures"</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Complete Process Fields</h3>
                  <p className="text-muted-foreground mb-6">
                    Fill in the required information below. Hover over field labels for specific guidance.
                  </p>
                </div>

                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">
                          {field.field_label}
                          {field.is_required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                      </div>
                      
                      <div className="bg-muted/50 border border-muted rounded-lg p-3 mb-2">
                        <p className="text-xs text-muted-foreground">
                          <Lightbulb className="h-3 w-3 inline mr-1" />
                          {getFieldGuidance(field)}
                        </p>
                      </div>

                      <DynamicForm 
                        fields={[field]} 
                        values={formValues} 
                        onChange={handleFormChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
                  <p className="text-muted-foreground mb-6">
                    Please review all information before creating your {processName} record.
                  </p>
                </div>

                <div className="space-y-4">
                  <Card className="border-muted">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Record Title</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{recordTitle}</p>
                    </CardContent>
                  </Card>

                  {fields.map((field) => {
                    const value = formValues[field.id];
                    if (!value) return null;
                    
                    return (
                      <Card key={field.id} className="border-muted">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{field.field_label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{value}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <p className="text-sm text-success">
                    ✓ Your {processName} record is ready to be created. Once submitted, it will enter the workflow 
                    for review and processing.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index < currentStep
                    ? "bg-success"
                    : index === currentStep
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleCreateRecord}
              disabled={!isStepComplete(currentStep) || isCreating}
              className="flex items-center gap-2 bg-gradient-primary hover:bg-primary-hover"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  Create Record
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className="flex items-center gap-2 bg-gradient-primary hover:bg-primary-hover"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}