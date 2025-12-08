import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Settings, Edit, Tag, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Process } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { transformProcessData } from "@/utils/processHelpers";

const PREDEFINED_TAGS = [
  "Quality Events",
  "Change Management",
  "Compliance",
  "Safety",
  "Document Control",
  "Risk Management",
];

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
    ai_suggestion: "",
    tag: "",
    record_id_prefix: "",
    tasks_enabled: true
  });
  const [tagOpen, setTagOpen] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);

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

      setProcess(transformProcessData(data));
      const subEntityConfig = data.sub_entity_config as { tasks_enabled?: boolean } | null;
      setFormData({
        name: data.name || "",
        description: data.description || "",
        is_active: data.is_active || true,
        ai_suggestion: data.ai_suggestion || "",
        tag: data.tag || "",
        record_id_prefix: data.record_id_prefix || "",
        tasks_enabled: subEntityConfig?.tasks_enabled ?? true
      });
      // If data has a custom tag not in predefined list, add it
      if (data.tag && !PREDEFINED_TAGS.includes(data.tag)) {
        setCustomTags([data.tag]);
      }
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
          ai_suggestion: formData.ai_suggestion.trim() || null,
          tag: formData.tag.trim() || null,
          record_id_prefix: formData.record_id_prefix.trim().toUpperCase() || null,
          sub_entity_config: { tasks_enabled: formData.tasks_enabled }
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
                variant="outline"
                onClick={() => navigate(`/process-config/${id}/workflow`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Workflow
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

              <div className="space-y-2">
                <Label htmlFor="record_id_prefix">Record ID Prefix</Label>
                <Input
                  id="record_id_prefix"
                  value={formData.record_id_prefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, record_id_prefix: e.target.value.toUpperCase() }))}
                  placeholder="e.g., CA, NCR, DEV"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Records will be identified as {formData.record_id_prefix || 'REC'}-XXXX
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tag">Tag</Label>
                <Popover open={tagOpen} onOpenChange={setTagOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tagOpen}
                      className="w-full justify-between"
                    >
                      {formData.tag || "Select or enter a tag..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search or create tag..." 
                        onValueChange={(value) => {
                          // Allow custom input
                          if (value && !PREDEFINED_TAGS.includes(value) && !customTags.includes(value)) {
                            setFormData(prev => ({ ...prev, tag: value }));
                          }
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <button
                            className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded"
                            onClick={() => {
                              const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                              if (input?.value) {
                                const newTag = input.value.trim();
                                if (newTag && !customTags.includes(newTag)) {
                                  setCustomTags(prev => [...prev, newTag]);
                                }
                                setFormData(prev => ({ ...prev, tag: newTag }));
                                setTagOpen(false);
                              }
                            }}
                          >
                            Create new tag
                          </button>
                        </CommandEmpty>
                        <CommandGroup heading="Predefined Tags">
                          {PREDEFINED_TAGS.map((tag) => (
                            <CommandItem
                              key={tag}
                              value={tag}
                              onSelect={(currentValue) => {
                                setFormData(prev => ({ ...prev, tag: currentValue === formData.tag ? "" : currentValue }));
                                setTagOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.tag === tag ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                              {tag}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        {customTags.length > 0 && (
                          <CommandGroup heading="Custom Tags">
                            {customTags.map((tag) => (
                              <CommandItem
                                key={tag}
                                value={tag}
                                onSelect={(currentValue) => {
                                  setFormData(prev => ({ ...prev, tag: currentValue === formData.tag ? "" : currentValue }));
                                  setTagOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.tag === tag ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Tags help organize processes in the navigation sidebar
                </p>
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
              <CardTitle>Sub-Entities</CardTitle>
              <CardDescription>
                Configure which sub-entities are available for records in this process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="tasks_enabled" className="text-base font-medium">Task Management</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to create and assign tasks when creating records
                  </p>
                </div>
                <Switch
                  id="tasks_enabled"
                  checked={formData.tasks_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, tasks_enabled: checked }))}
                />
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