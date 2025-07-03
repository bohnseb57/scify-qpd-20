import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Clock, User, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { ProcessRecord, Process, ProcessField, RecordFieldValue } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function RecordDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ProcessRecord | null>(null);
  const [process, setProcess] = useState<Process | null>(null);
  const [fields, setFields] = useState<ProcessField[]>([]);
  const [fieldValues, setFieldValues] = useState<RecordFieldValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setProcess(processData);
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
                <p className="text-muted-foreground">{process.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <StatusBadge status={record.current_status} />
              <Button variant="outline">
                <Edit className="h-4 w-4" />
                Edit Record
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Record Overview */}
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
                        {value ? (
                          <span className="text-foreground">{value}</span>
                        ) : (
                          <span className="italic">No value entered</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}