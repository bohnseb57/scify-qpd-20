import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Eye, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { GuidedRecordCreation } from "@/components/GuidedRecordCreation";
import { Process, ProcessRecord, ProcessField, RecordFieldValue } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { transformProcessData } from "@/utils/processHelpers";
export default function ProcessDetails() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [records, setRecords] = useState<ProcessRecord[]>([]);
  const [fields, setFields] = useState<ProcessField[]>([]);
  const [recordTitles, setRecordTitles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showGuidedCreation, setShowGuidedCreation] = useState(false);
  useEffect(() => {
    if (id) {
      loadProcessDetails();
    }
  }, [id]);
  const loadProcessDetails = async () => {
    if (!id) return;
    try {
      // Load process details
      const {
        data: processData,
        error: processError
      } = await supabase.from('processes').select('*').eq('id', id).single();
      if (processError) {
        console.error('Error loading process:', processError);
        toast.error('Failed to load process details');
        return;
      }
      setProcess(transformProcessData(processData));

      // Load process fields
      const {
        data: fieldsData,
        error: fieldsError
      } = await supabase.from('process_fields').select('*').eq('process_id', id).order('display_order');
      if (fieldsError) {
        console.error('Error loading fields:', fieldsError);
      } else {
        setFields((fieldsData || []) as ProcessField[]);
      }

      // Load process records
      const {
        data: recordsData,
        error: recordsError
      } = await supabase.from('process_records').select('*').eq('process_id', id).order('created_at', {
        ascending: false
      });
      if (recordsError) {
        console.error('Error loading records:', recordsError);
      } else {
        setRecords(recordsData || []);

        // Load Title field values for records if we have records
        if (recordsData && recordsData.length > 0) {
          const titleField = (fieldsData || []).find(f => f.field_label === 'Title');
          if (titleField) {
            const recordIds = recordsData.map(r => r.id);
            const {
              data: titleValues
            } = await supabase.from('record_field_values').select('record_id, field_value').eq('field_id', titleField.id).in('record_id', recordIds);
            if (titleValues) {
              const titleMap: Record<string, string> = {};
              titleValues.forEach(tv => {
                titleMap[tv.record_id] = tv.field_value || '';
              });
              setRecordTitles(titleMap);
            }
          }
        }
      }
    } catch (error) {
      console.error('Process details load error:', error);
      toast.error('Failed to load process details');
    } finally {
      setIsLoading(false);
    }
  };
  const handleGuidedCreationComplete = () => {
    setShowGuidedCreation(false);
    loadProcessDetails();
  };
  const handleGuidedCreationCancel = () => {
    setShowGuidedCreation(false);
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>;
  }
  if (!process) {
    return <div className="min-h-screen bg-gradient-subtle p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Process Not Found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>;
  }
  if (showGuidedCreation && process) {
    return <GuidedRecordCreation processId={process.id} processName={process.name} onComplete={handleGuidedCreationComplete} onCancel={handleGuidedCreationCancel} />;
  }
  return <div className="bg-gradient-subtle min-h-full">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{process.name}</h1>
              
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowGuidedCreation(true)} className="bg-gradient-primary hover:bg-primary-hover transition-smooth">
                <Plus className="h-4 w-4 mr-2" />
                Create Record
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
            {records.length === 0 ? <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No records yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first record to get started with this process
                </p>
                <Button onClick={() => setShowGuidedCreation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Record
                </Button>
              </div> : <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {records.map(record => <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium font-mono text-sm">{record.record_identifier || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={record.current_status} />
                      </TableCell>
                      <TableCell>{record.record_title}</TableCell>
                      <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>Demo User</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/record/${record.id}`)}>
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>}
          </CardContent>
        </Card>
      </div>
    </div>;
}