import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings, Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Process } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProcessConfigurationList() {
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading processes:', error);
        toast.error('Failed to load processes');
        return;
      }

      setProcesses(data || []);
    } catch (error) {
      console.error('Process load error:', error);
      toast.error('Failed to load processes');
    } finally {
      setIsLoading(false);
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

  return (
    <div className="bg-gradient-subtle min-h-full">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Process Configuration</h1>
              <p className="text-muted-foreground">Manage and configure your quality processes</p>
            </div>
            <Button 
              onClick={() => navigate('/create-process')}
              className="bg-gradient-primary hover:bg-primary-hover transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Process
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>All Processes</CardTitle>
            <CardDescription>
              Configure settings, fields, and workflows for your quality processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processes.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No processes configured</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first process to get started
                </p>
                <Button onClick={() => navigate('/create-process')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Process
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.name}</TableCell>
                      <TableCell className="max-w-md truncate">{process.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          process.is_active 
                            ? 'bg-success/20 text-success' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {process.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(process.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/process/${process.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/process-config/${process.id}`)}
                          >
                            <Settings className="h-4 w-4" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/process-config/${process.id}/fields`)}
                          >
                            <Edit className="h-4 w-4" />
                            Fields
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/process-config/${process.id}/workflow`)}
                          >
                            <Settings className="h-4 w-4" />
                            Workflow
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