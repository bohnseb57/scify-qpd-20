import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Eye, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { DynamicForm } from "@/components/DynamicForm";
import { Process, ProcessRecord, ProcessField, RecordFieldValue } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProcessDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [records, setRecords] = useState<ProcessRecord[]>([]);
  const [fields, setFields] = useState<ProcessField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRecord, setShowCreateRecord] = useState(false);
  const [newRecordTitle, setNewRecordTitle] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadProcessDetails();
    }
  }, [id]);

  const loadProcessDetails = async () => {
    if (!id) return;
    
    try {
      // Load process details
      const { data: processData, error: processError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', id)
        .single();

      if (processError) {
        console.error('Error loading process:', processError);
        toast.error('Failed to load process details');
        return;
      }

      setProcess(processData);

      // Load process fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('process_fields')
        .select('*')
        .eq('process_id', id)
        .order('display_order');

      if (fieldsError) {
        console.error('Error loading fields:', fieldsError);
      } else {
        setFields((fieldsData || []) as ProcessField[]);
      }

      // Load process records
      const { data: recordsData, error: recordsError } = await supabase
        .from('process_records')
        .select('*')
        .eq('process_id', id)
        .order('created_at', { ascending: false });

      if (recordsError) {
        console.error('Error loading records:', recordsError);
      } else {
        setRecords(recordsData || []);
      }
    } catch (error) {
      console.error('Process details load error:', error);
      toast.error('Failed to load process details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!newRecordTitle.trim() || !id) {
      toast.error('Please enter a record title');
      return;
    }

    try {
      // Create the record
      const { data: record, error: recordError } = await supabase
        .from('process_records')
        .insert({
          process_id: id,
          record_title: newRecordTitle,
          created_by: "00000000-0000-0000-0000-000000000000", // Demo UUID
          current_status: 'draft'
        })
        .select()
        .single();

      if (recordError) {
        console.error('Error creating record:', recordError);
        toast.error('Failed to create record');
        return;
      }

      // Save field values
      const valuesToInsert = Object.entries(formValues)
        .filter(([_, value]) => value.trim() !== '')
        .map(([fieldId, value]) => ({
          record_id: record.id,
          field_id: fieldId,
          field_value: value
        }));

      if (valuesToInsert.length > 0) {
        const { error: valuesError } = await supabase
          .from('record_field_values')
          .insert(valuesToInsert);

        if (valuesError) {
          console.error('Error saving field values:', valuesError);
          toast.error('Record created but failed to save some field values');
        }
      }

      toast.success('Record created successfully!');
      setShowCreateRecord(false);
      setNewRecordTitle("");
      setFormValues({});
      loadProcessDetails();
    } catch (error) {
      console.error('Record creation error:', error);
      toast.error('Failed to create record');
    }
  };

  const handleFormChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Process Not Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">{process.name}</h1>
              <p className="text-muted-foreground">{process.description}</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreateRecord} onOpenChange={setShowCreateRecord}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setShowCreateRecord(true)}
                    className="bg-gradient-primary hover:bg-primary-hover transition-smooth"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New {process.name} Record</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to create a new process record
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="record-title">Record Title *</Label>
                      <Input
                        id="record-title"
                        placeholder="Enter a descriptive title for this record"
                        value={newRecordTitle}
                        onChange={(e) => setNewRecordTitle(e.target.value)}
                      />
                    </div>

                    {fields.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-4">Process Fields</h3>
                        <DynamicForm
                          fields={fields}
                          values={formValues}
                          onChange={handleFormChange}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleCreateRecord} className="flex-1">
                        Create Record
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateRecord(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Process
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Process Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
              <p className="text-xs text-muted-foreground">
                Records created for this process
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Records</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.filter(r => r.current_status === 'in_progress' || r.current_status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Records in progress
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Form Fields</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fields.length}</div>
              <p className="text-xs text-muted-foreground">
                Configured form fields
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Process Records</CardTitle>
            <CardDescription>
              All records created for this process
            </CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No records yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first record to get started with this process
                </p>
                <Button onClick={() => setShowCreateRecord(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Record
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{record.record_title}</TableCell>
                      <TableCell>
                        <StatusBadge status={record.current_status} />
                      </TableCell>
                      <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>Demo User</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/record/${record.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}