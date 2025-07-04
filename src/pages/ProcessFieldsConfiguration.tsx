import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Process, ProcessField, FieldType } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProcessFieldsConfiguration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [fields, setFields] = useState<ProcessField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddField, setShowAddField] = useState(false);
  const [editingField, setEditingField] = useState<ProcessField | null>(null);
  const [fieldForm, setFieldForm] = useState({
    field_name: "",
    field_label: "",
    field_type: "text" as FieldType,
    is_required: false,
    display_order: 0
  });

  useEffect(() => {
    if (id) {
      loadProcessAndFields();
    }
  }, [id]);

  const loadProcessAndFields = async () => {
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

      // Load fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('process_fields')
        .select('*')
        .eq('process_id', id)
        .order('display_order');

      if (fieldsError) {
        console.error('Error loading fields:', fieldsError);
        toast.error('Failed to load fields');
      } else {
        setFields((fieldsData || []) as ProcessField[]);
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveField = async () => {
    if (!fieldForm.field_name.trim() || !fieldForm.field_label.trim()) {
      toast.error('Field name and label are required');
      return;
    }

    try {
      if (editingField) {
        // Update existing field
        const { error } = await supabase
          .from('process_fields')
          .update({
            field_name: fieldForm.field_name.trim(),
            field_label: fieldForm.field_label.trim(),
            field_type: fieldForm.field_type,
            is_required: fieldForm.is_required,
            display_order: fieldForm.display_order
          })
          .eq('id', editingField.id);

        if (error) {
          console.error('Error updating field:', error);
          toast.error('Failed to update field');
          return;
        }

        toast.success('Field updated successfully!');
      } else {
        // Create new field
        const { error } = await supabase
          .from('process_fields')
          .insert({
            process_id: id,
            field_name: fieldForm.field_name.trim(),
            field_label: fieldForm.field_label.trim(),
            field_type: fieldForm.field_type,
            is_required: fieldForm.is_required,
            display_order: fieldForm.display_order || fields.length
          });

        if (error) {
          console.error('Error creating field:', error);
          toast.error('Failed to create field');
          return;
        }

        toast.success('Field created successfully!');
      }

      setShowAddField(false);
      setEditingField(null);
      setFieldForm({
        field_name: "",
        field_label: "",
        field_type: "text",
        is_required: false,
        display_order: 0
      });
      loadProcessAndFields();
    } catch (error) {
      console.error('Field save error:', error);
      toast.error('Failed to save field');
    }
  };

  const handleEditField = (field: ProcessField) => {
    setEditingField(field);
    setFieldForm({
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      is_required: field.is_required,
      display_order: field.display_order
    });
    setShowAddField(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field? This will also delete all associated field values.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('process_fields')
        .delete()
        .eq('id', fieldId);

      if (error) {
        console.error('Error deleting field:', error);
        toast.error('Failed to delete field');
        return;
      }

      toast.success('Field deleted successfully!');
      loadProcessAndFields();
    } catch (error) {
      console.error('Field delete error:', error);
      toast.error('Failed to delete field');
    }
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
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Manage Form Fields</h1>
                <p className="text-muted-foreground">{process.name}</p>
              </div>
            </div>
            <Dialog open={showAddField} onOpenChange={setShowAddField}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingField(null);
                    setFieldForm({
                      field_name: "",
                      field_label: "",
                      field_type: "text",
                      is_required: false,
                      display_order: fields.length
                    });
                  }}
                  className="bg-gradient-primary hover:bg-primary-hover transition-smooth"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingField ? 'Edit Field' : 'Add New Field'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the field properties for the form
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="field_name">Field Name *</Label>
                    <Input
                      id="field_name"
                      value={fieldForm.field_name}
                      onChange={(e) => setFieldForm(prev => ({ ...prev, field_name: e.target.value }))}
                      placeholder="e.g., first_name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field_label">Field Label *</Label>
                    <Input
                      id="field_label"
                      value={fieldForm.field_label}
                      onChange={(e) => setFieldForm(prev => ({ ...prev, field_label: e.target.value }))}
                      placeholder="e.g., First Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field_type">Field Type</Label>
                    <Select
                      value={fieldForm.field_type}
                      onValueChange={(value: any) => setFieldForm(prev => ({ ...prev, field_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={fieldForm.display_order}
                      onChange={(e) => setFieldForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_required"
                      checked={fieldForm.is_required}
                      onCheckedChange={(checked) => setFieldForm(prev => ({ ...prev, is_required: checked }))}
                    />
                    <Label htmlFor="is_required">Required field</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveField} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {editingField ? 'Update Field' : 'Add Field'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddField(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>
              Manage the fields that appear in the form for this process
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-12">
                <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No fields configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first form field to get started
                </p>
                <Button onClick={() => setShowAddField(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Field
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Field Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.display_order}</TableCell>
                      <TableCell className="font-mono text-sm">{field.field_name}</TableCell>
                      <TableCell>{field.field_label}</TableCell>
                      <TableCell className="capitalize">{field.field_type}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          field.is_required 
                            ? 'bg-destructive/20 text-destructive' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {field.is_required ? 'Required' : 'Optional'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditField(field)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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