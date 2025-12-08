import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Clock, User, Edit, Save, X, CheckCircle, AlertTriangle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { WorkflowActions } from "@/components/WorkflowActions";
import { WorkflowHistory } from "@/components/WorkflowHistory";
import { TaskManager } from "@/components/TaskManager";
import { LinkedRecordsSection } from "@/components/LinkedRecordsSection";
import { ProcessRecord, Process, ProcessField, RecordFieldValue, WorkflowStep } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { generateMockTasks, generateMockAuditTrail, mockTeamMembers, MockTask, MockAuditEntry } from "@/utils/mockData";
import { transformProcessData, isTasksEnabled } from "@/utils/processHelpers";

export default function RecordDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ProcessRecord | null>(null);
  const [process, setProcess] = useState<Process | null>(null);
  const [fields, setFields] = useState<ProcessField[]>([]);
  const [fieldValues, setFieldValues] = useState<RecordFieldValue[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [mockTasks, setMockTasks] = useState<MockTask[]>([]);
  const [mockAuditTrail, setMockAuditTrail] = useState<MockAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadRecordDetails();
    }
  }, [id]);

  const loadRecordDetails = async () => {
    if (!id) return;
    
    try {
      // Load record details
      const { data: recordData, error: recordError } = await supabase
        .from('process_records')
        .select('*')
        .eq('id', id)
        .single();

      if (recordError) {
        console.error('Error loading record:', recordError);
        toast.error('Failed to load record details');
        return;
      }

      setRecord(recordData);

      // Load process details
      const { data: processData, error: processError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', recordData.process_id)
        .single();

      if (processError) {
        console.error('Error loading process:', processError);
      } else {
        setProcess(transformProcessData(processData));
      }

      // Load process fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('process_fields')
        .select('*')
        .eq('process_id', recordData.process_id)
        .order('display_order');

      if (fieldsError) {
        console.error('Error loading fields:', fieldsError);
      } else {
        setFields((fieldsData || []) as ProcessField[]);
      }

      // Load field values for this record
      const { data: valuesData, error: valuesError } = await supabase
        .from('record_field_values')
        .select('*')
        .eq('record_id', id);

      if (valuesError) {
        console.error('Error loading field values:', valuesError);
      } else {
        setFieldValues(valuesData || []);
      }

      // Load workflow steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('process_id', recordData.process_id)
        .order('step_order');

      if (stepsError) {
        console.error('Error loading workflow steps:', stepsError);
      } else {
        setWorkflowSteps((stepsData || []) as WorkflowStep[]);
      }

      // Generate mock data for tasks and audit trail
      if (recordData) {
        setMockTasks(generateMockTasks(recordData.id));
        setMockAuditTrail(generateMockAuditTrail(recordData.id));
      }
    } catch (error) {
      console.error('Record details load error:', error);
      toast.error('Failed to load record details');
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldValue = (fieldId: string) => {
    const fieldValue = fieldValues.find(fv => fv.field_id === fieldId);
    return fieldValue?.field_value || '';
  };

  const handleEditClick = () => {
    const initialValues: Record<string, string> = {};
    fields.forEach(field => {
      initialValues[field.id] = getFieldValue(field.id);
    });
    setEditValues(initialValues);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleSaveEdit = async () => {
    if (!record) return;

    try {
      // Update or insert field values
      for (const field of fields) {
        const newValue = editValues[field.id] || '';
        const existingValue = fieldValues.find(fv => fv.field_id === field.id);

        if (existingValue) {
          // Update existing value
          const { error } = await supabase
            .from('record_field_values')
            .update({ field_value: newValue })
            .eq('id', existingValue.id);

          if (error) {
            console.error('Error updating field value:', error);
            toast.error('Failed to update field value');
            return;
          }
        } else if (newValue) {
          // Insert new value if it doesn't exist and has a value
          const { error } = await supabase
            .from('record_field_values')
            .insert({
              record_id: record.id,
              field_id: field.id,
              field_value: newValue
            });

          if (error) {
            console.error('Error inserting field value:', error);
            toast.error('Failed to insert field value');
            return;
          }
        }
      }

      // Reload the data
      await loadRecordDetails();
      setIsEditing(false);
      setEditValues({});
      toast.success('Record updated successfully');
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
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

  if (!record || !process) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Record Not Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(`/process/${process.id}`)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{record.record_title}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">{process.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {record.record_identifier || `REC-${String(record.created_at).slice(-8, -4)}`}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={record.current_status} />
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="default" onClick={handleSaveEdit}>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="default" onClick={handleEditClick}>
                  <Edit className="h-4 w-4" />
                  Edit Record
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className={`grid w-full ${isTasksEnabled(process) ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {isTasksEnabled(process) && (
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Tasks ({mockTasks.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Record Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <StatusBadge status={record.current_status} />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(record.created_at).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.created_at).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Created By</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Demo User</div>
                  <p className="text-xs text-muted-foreground">
                    Process initiator
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Workflow Actions */}
            <WorkflowActions 
              record={record} 
              workflowSteps={workflowSteps} 
              onRecordUpdate={loadRecordDetails} 
            />

            {/* Linked Records */}
            <LinkedRecordsSection recordId={record.id} />

            {/* Field Values */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Record Details</CardTitle>
                <CardDescription>
                  Field values entered for this record
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No fields configured</h3>
                    <p className="text-muted-foreground">
                      This process doesn't have any custom fields configured
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field) => {
                      const value = getFieldValue(field.id);
                      return (
                        <div key={field.id} className="border-b border-border pb-4 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium text-foreground">
                              {field.field_label}
                            </h4>
                            {field.is_required && (
                              <span className="text-destructive text-xs">*</span>
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            {isEditing ? (
                              field.field_type === 'textarea' ? (
                                <Textarea
                                  value={editValues[field.id] || ''}
                                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                  placeholder={`Enter ${field.field_label.toLowerCase()}`}
                                  className="mt-1"
                                />
                              ) : (
                                <Input
                                  type={field.field_type === 'number' ? 'number' : 
                                        field.field_type === 'date' ? 'date' :
                                        field.field_type === 'email' ? 'email' :
                                        field.field_type === 'url' ? 'url' : 'text'}
                                  value={editValues[field.id] || ''}
                                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                  placeholder={`Enter ${field.field_label.toLowerCase()}`}
                                  className="mt-1"
                                />
                              )
                            ) : (
                              value ? (
                                <span className="text-foreground">{value}</span>
                              ) : (
                                <span className="italic">No value entered</span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isTasksEnabled(process) && (
            <TabsContent value="tasks" className="space-y-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Task Management
                  </CardTitle>
                  <CardDescription>
                    Tasks assigned for this {process?.name} record
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskManager 
                    tasks={mockTasks.map(task => ({
                      id: task.id,
                      title: task.title,
                      description: task.description,
                      assignedUser: task.assignedUser,
                      dueDate: task.dueDate,
                      priority: task.priority,
                      status: task.status
                    }))}
                    onTasksChange={() => {}}
                    teamMembers={mockTeamMembers}
                    readOnly={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="audit" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete history of changes and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAuditTrail.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        entry.type === 'status_change' ? 'bg-sl-blue-100 text-sl-blue-700' :
                        entry.type === 'field_update' ? 'bg-warning/20 text-warning' :
                        entry.type === 'task_update' ? 'bg-success/20 text-success' :
                        entry.type === 'approval' ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {entry.type === 'status_change' ? <AlertTriangle className="h-4 w-4" /> :
                         entry.type === 'field_update' ? <FileText className="h-4 w-4" /> :
                         entry.type === 'task_update' ? <CheckCircle className="h-4 w-4" /> :
                         entry.type === 'approval' ? <User className="h-4 w-4" /> :
                         <Clock className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{entry.action}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {entry.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{entry.details}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{entry.user}</span>
                          <span>•</span>
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Original Workflow History */}
            <WorkflowHistory recordId={record.id} workflowSteps={workflowSteps} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}