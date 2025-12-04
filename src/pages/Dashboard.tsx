import { useState, useEffect } from "react";
import { Plus, Settings, FileText, BarChart3, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ProcessWizard } from "@/components/ProcessWizard";
import { Process, ProcessRecord } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
  console.log("📊 Dashboard component rendering");
  
  const [processes, setProcesses] = useState<Process[]>([]);
  const [recentRecords, setRecentRecords] = useState<ProcessRecord[]>([]);
  const [showProcessWizard, setShowProcessWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load processes
      const { data: processesData, error: processesError } = await supabase
        .from('processes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (processesError) {
        console.error('Error loading processes:', processesError);
        toast.error('Failed to load processes');
      } else {
        setProcesses(processesData || []);
      }

      // Load recent records
      const { data: recordsData, error: recordsError } = await supabase
        .from('process_records')
        .select(`
          *,
          process:processes(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recordsError) {
        console.error('Error loading records:', recordsError);
      } else {
        setRecentRecords((recordsData || []) as ProcessRecord[]);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcess = async (processData: {
    name: string;
    description: string;
    fields: any[];
    workflow: any[];
  }) => {
    try {
      // Create the process
      const { data: process, error: processError } = await supabase
        .from('processes')
        .insert({
          name: processData.name,
          description: processData.description,
          ai_suggestion: "AI suggested these fields based on process best practices",
          created_by: "00000000-0000-0000-0000-000000000000" // Demo UUID - in real app, use auth.uid()
        })
        .select()
        .single();

      if (processError) {
        console.error('Error creating process:', processError);
        toast.error('Failed to create process');
        return;
      }

      // Create fields
      const fieldsToInsert = processData.fields.map((field, index) => ({
        process_id: process.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        is_required: field.is_required,
        field_options: field.field_options ? JSON.stringify(field.field_options) : null,
        display_order: index
      }));

      const { error: fieldsError } = await supabase
        .from('process_fields')
        .insert(fieldsToInsert);

      if (fieldsError) {
        console.error('Error creating fields:', fieldsError);
        toast.error('Failed to create process fields');
        return;
      }

      // Create workflow steps
      const workflowToInsert = processData.workflow.map((step, index) => ({
        process_id: process.id,
        step_name: step.step_name,
        step_order: index + 1,
        required_role: step.required_role
      }));

      const { error: workflowError } = await supabase
        .from('workflow_steps')
        .insert(workflowToInsert);

      if (workflowError) {
        console.error('Error creating workflow:', workflowError);
        toast.error('Failed to create workflow steps');
        return;
      }

      toast.success('Process created successfully!');
      setShowProcessWizard(false);
      loadDashboardData();
    } catch (error) {
      console.error('Process creation error:', error);
      toast.error('Failed to create process');
    }
  };

  if (showProcessWizard) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <ProcessWizard
          onComplete={handleCreateProcess}
          onCancel={() => setShowProcessWizard(false)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-subtle min-h-full">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quality Process Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Overview of your quality processes and recent activity
              </p>
            </div>
            <Button 
              onClick={() => navigate("/start-work")}
              className="bg-gradient-primary hover:bg-primary-hover transition-smooth flex items-center gap-2"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              Start New Work
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{processes.length}</div>
              <p className="text-xs text-muted-foreground">
                Quality management processes
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                Process records created
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentRecords.filter(r => r.current_status === 'in_progress').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Records awaiting action
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Quality team members
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1">
          {/* Available Processes
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Available Processes</CardTitle>
              <CardDescription>
                Configure and manage your quality processes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {processes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No processes created yet</p>
                  <Button variant="outline" onClick={() => setShowProcessWizard(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Process
                  </Button>
                </div>
              ) : (
                processes.map((process) => (
                  <Card 
                    key={process.id} 
                    className="p-4 hover:shadow-card transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm">{process.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {process.description}
                        </p>
                        {process.ai_suggestion && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            AI Enhanced
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/process-config/${process.id}`);
                          }}
                        >
                          Configure
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/start-work?processId=${process.id}&processName=${encodeURIComponent(process.name)}`);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Record
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card> */}

          {/* Recent Records */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest process records and their status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                recentRecords.map((record) => (
                  <Card 
                    key={record.id} 
                    className="p-4 hover:shadow-card transition-all cursor-pointer"
                    onClick={() => navigate(`/record/${record.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{record.record_title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {record.record_identifier || `REC-${String(record.created_at).slice(-8, -4)}`} • {record.process?.name || 'Unknown Process'} • {new Date(record.created_at).toLocaleDateString()}
                        </p>
                        
                        {/* Mock task summary for CAPA records */}
                        {record.process?.name === 'CAPA' && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs bg-sl-blue-50 text-sl-blue-700 border-sl-blue-200">
                              3 Tasks Assigned
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                              1 Completed
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={record.current_status} />
                        {record.process?.name === 'CAPA' && (
                          <div className="flex -space-x-1">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-white font-medium border-2 border-background">
                              S
                            </div>
                            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-xs text-white font-medium border-2 border-background">
                              M
                            </div>
                            <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center text-xs text-white font-medium border-2 border-background">
                              E
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}