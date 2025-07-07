import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MessageSquare } from "lucide-react";
import { WorkflowHistory as WorkflowHistoryType, WorkflowStep } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowHistoryProps {
  recordId: string;
  workflowSteps: WorkflowStep[];
}

export function WorkflowHistory({ recordId, workflowSteps }: WorkflowHistoryProps) {
  const [history, setHistory] = useState<WorkflowHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflowHistory();
  }, [recordId]);

  const loadWorkflowHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_history')
        .select('*')
        .eq('record_id', recordId)
        .order('performed_at', { ascending: false });

      if (error) {
        console.error('Error loading workflow history:', error);
      } else {
        setHistory(data || []);
      }
    } catch (error) {
      console.error('Error loading workflow history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepName = (stepId: string | null) => {
    if (!stepId) return 'Final Step';
    const step = workflowSteps.find(s => s.id === stepId);
    return step?.step_name || 'Unknown Step';
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approve':
        return 'default';
      case 'reject':
        return 'destructive';
      case 'create':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Workflow History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Workflow History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workflow history</h3>
            <p className="text-muted-foreground">
              No workflow actions have been performed on this record yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 border border-border rounded-lg bg-background/50"
              >
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getActionBadgeVariant(entry.action)}>
                        {entry.action}
                      </Badge>
                      {entry.from_step_id && entry.to_step_id && (
                        <span className="text-sm text-muted-foreground">
                          {getStepName(entry.from_step_id)} → {getStepName(entry.to_step_id)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.performed_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Demo User</span>
                  </div>
                  
                  {entry.comments && (
                    <div className="flex items-start gap-2 text-sm">
                      <MessageSquare className="h-3 w-3 mt-1 text-muted-foreground" />
                      <span className="text-foreground">{entry.comments}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}