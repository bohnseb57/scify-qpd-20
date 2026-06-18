import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { Process, ProcessRecord, WorkflowStatus } from "@/types/qpd";

interface ChildProcessRecordsProps {
  parentRecordId: string;
  childProcess: Process;
}

export function ChildProcessRecords({ parentRecordId, childProcess }: ChildProcessRecordsProps) {
  const [records, setRecords] = useState<ProcessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadChildren();
    // realtime: refresh when record_links or process_records change for this parent
    const channel = supabase
      .channel(`children-${parentRecordId}-${childProcess.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "record_links" },
        () => loadChildren()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "process_records" },
        () => loadChildren()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentRecordId, childProcess.id]);

  const loadChildren = async () => {
    setIsLoading(true);
    try {
      const { data: links, error: linksError } = await supabase
        .from("record_links")
        .select("source_record_id")
        .eq("target_record_id", parentRecordId)
        .eq("link_type", "child_of");
      if (linksError) throw linksError;
      const ids = (links || []).map((l) => l.source_record_id).filter(Boolean);
      if (ids.length === 0) {
        setRecords([]);
        return;
      }
      const { data: recs, error: recsError } = await supabase
        .from("process_records")
        .select("*")
        .in("id", ids)
        .eq("process_id", childProcess.id)
        .order("created_at", { ascending: false });
      if (recsError) throw recsError;
      setRecords((recs || []) as ProcessRecord[]);
    } catch (e) {
      console.error("Error loading child records:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = () => {
    navigate(
      `/start-work?processId=${childProcess.id}&processName=${encodeURIComponent(
        childProcess.name
      )}&parentRecordId=${parentRecordId}`
    );
  };

  // Status rollup
  const statusCounts = records.reduce<Record<string, number>>((acc, r) => {
    const k = r.current_status || "draft";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const statusOrder: WorkflowStatus[] = [
    "draft",
    "in_progress",
    "approved",
    "rejected",
    "completed",
  ];

  return (
    <Card className="shadow-elegant">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {childProcess.name}
            <Badge variant="outline" className="ml-2">{records.length}</Badge>
          </CardTitle>
          <CardDescription>
            Child records of this record for the {childProcess.name} process
          </CardDescription>
        </div>
        <Button onClick={handleAddChild} className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Add {childProcess.name}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Status rollup strip */}
        {records.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {statusOrder
              .filter((s) => statusCounts[s])
              .map((s) => (
                <Badge key={s} variant="secondary" className="capitalize">
                  {s.replace("_", " ")}: {statusCounts[s]}
                </Badge>
              ))}
          </div>
        )}

        {isLoading ? (
          <div className="animate-pulse h-16 bg-muted rounded" />
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No {childProcess.name.toLowerCase()} records yet.</p>
            <p className="text-xs mt-1">
              Click "Add {childProcess.name}" to create one linked to this record.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    {r.record_identifier || "—"}
                  </TableCell>
                  <TableCell>{r.record_title}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.current_status} />
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/record/${r.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
