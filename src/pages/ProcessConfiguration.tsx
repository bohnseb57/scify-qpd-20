import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Settings, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Process } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProcessConfiguration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    ai_suggestion: ""
  });

  useEffect(() => {
    if (id) {
      loadProcess();
    }
  }, [id]);

  const loadProcess = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading process:', error);
        toast.error('Failed to load process');
        navigate('/process-config');
        return;
      }

      setProcess(data);
      setFormData({
        name: data.name || "",
        description: data.description || "",
        is_active: data.is_active || true,
        ai_suggestion: data.ai_suggestion || ""
      });
    } catch (error) {
      console.error('Process load error:', error);
      toast.error('Failed to load process');
      navigate('/process-config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !formData.name.trim()) {
      toast.error('Process name is required');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('processes')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim(),
          is_active: formData.is_active,
          ai_suggestion: formData.ai_suggestion.trim() || null
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating process:', error);
        toast.error('Failed to update process');
        return;
      }

      toast.success('Process updated successfully!');
      navigate('/process-config');
    } catch (error) {
      console.error('Process update error:', error);
      toast.error('Failed to update process');
    } finally {
      setIsSaving(false);
    }
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
                onClick={() => navigate('/process-config')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Configure Process</h1>
                <p className="text-muted-foreground">{process.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/process-config/${id}/fields`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Fields
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-primary hover:bg-primary-hover transition-smooth"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic settings for this process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Process Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter process name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this process"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Process is active</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
              <CardDescription>
                Optional AI-generated suggestions for process improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="ai_suggestion">AI Suggestions</Label>
                <Textarea
                  id="ai_suggestion"
                  value={formData.ai_suggestion}
                  onChange={(e) => setFormData(prev => ({ ...prev, ai_suggestion: e.target.value }))}
                  placeholder="AI-generated suggestions will appear here..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}