import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, X, ArrowRight } from "lucide-react";
import { Process } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { transformProcessData } from "@/utils/processHelpers";

interface LinkedProcessSelectorProps {
  currentProcessId: string;
  selectedProcess: Process | null;
  onProcessSelect: (process: Process | null) => void;
}

export function LinkedProcessSelector({ 
  currentProcessId, 
  selectedProcess, 
  onProcessSelect 
}: LinkedProcessSelectorProps) {
  const [availableProcesses, setAvailableProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAvailableProcesses();
  }, [currentProcessId]);

  const loadAvailableProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .eq('is_active', true)
        .neq('id', currentProcessId)
        .order('name');

      if (error) throw error;
      
      const transformed = (data || []).map(p => transformProcessData(p));
      setAvailableProcesses(transformed);
    } catch (error) {
      console.error('Error loading processes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    if (value === "none") {
      onProcessSelect(null);
    } else {
      const process = availableProcesses.find(p => p.id === value);
      onProcessSelect(process || null);
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Create Related Process (Optional)
        </CardTitle>
        <CardDescription>
          Select a process to create after saving this record
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedProcess ? (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Continue to: {selectedProcess.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    After saving, you'll create a linked {selectedProcess.name} record
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onProcessSelect(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Select 
            onValueChange={handleSelectChange}
            disabled={isLoading || availableProcesses.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoading 
                  ? "Loading processes..." 
                  : availableProcesses.length === 0 
                    ? "No other processes available" 
                    : "Select a process to create next..."
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No linked process</SelectItem>
              {availableProcesses.map((process) => (
                <SelectItem key={process.id} value={process.id}>
                  <div className="flex items-center gap-2">
                    <span>{process.name}</span>
                    {process.tag && (
                      <Badge variant="outline" className="text-xs">
                        {process.tag}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
}
