import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link2, ArrowRight, ExternalLink, Clock } from "lucide-react";
import { RecordLink, ProcessRecord, Process } from "@/types/qpd";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { transformProcessData } from "@/utils/processHelpers";

interface LinkedRecordsSectionProps {
  recordId: string;
}

interface EnrichedLink extends RecordLink {
  source_record?: ProcessRecord;
  target_record?: ProcessRecord;
  target_process?: Process;
}

export function LinkedRecordsSection({ recordId }: LinkedRecordsSectionProps) {
  const [triggeredLinks, setTriggeredLinks] = useState<EnrichedLink[]>([]);
  const [triggeredByLinks, setTriggeredByLinks] = useState<EnrichedLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLinkedRecords();
  }, [recordId]);

  const loadLinkedRecords = async () => {
    try {
      // Load records this record triggered (source_record_id = this record)
      const { data: triggeredData, error: triggeredError } = await supabase
        .from('record_links')
        .select('*')
        .eq('source_record_id', recordId);

      if (triggeredError) throw triggeredError;

      // Load records that triggered this record (target_record_id = this record)
      const { data: triggeredByData, error: triggeredByError } = await supabase
        .from('record_links')
        .select('*')
        .eq('target_record_id', recordId);

      if (triggeredByError) throw triggeredByError;

      // Enrich triggered links with target record and process data
      const enrichedTriggered = await Promise.all(
        (triggeredData || []).map(async (link) => {
          const enriched: EnrichedLink = { ...link } as EnrichedLink;
          
          // Get target process
          const { data: processData } = await supabase
            .from('processes')
            .select('*')
            .eq('id', link.target_process_id)
            .single();
          
          if (processData) {
            enriched.target_process = transformProcessData(processData);
          }

          // Get target record if it exists
          if (link.target_record_id) {
            const { data: recordData } = await supabase
              .from('process_records')
              .select('*')
              .eq('id', link.target_record_id)
              .single();
            
            if (recordData) {
              enriched.target_record = recordData as ProcessRecord;
            }
          }

          return enriched;
        })
      );

      // Enrich triggered by links with source record data
      const enrichedTriggeredBy = await Promise.all(
        (triggeredByData || []).map(async (link) => {
          const enriched: EnrichedLink = { ...link } as EnrichedLink;
          
          // Get source record
          const { data: recordData } = await supabase
            .from('process_records')
            .select('*')
            .eq('id', link.source_record_id)
            .single();
          
          if (recordData) {
            enriched.source_record = recordData as ProcessRecord;

            // Get source process
            const { data: processData } = await supabase
              .from('processes')
              .select('*')
              .eq('id', recordData.process_id)
              .single();
            
            if (processData) {
              enriched.target_process = transformProcessData(processData);
            }
          }

          return enriched;
        })
      );

      setTriggeredLinks(enrichedTriggered);
      setTriggeredByLinks(enrichedTriggeredBy);
    } catch (error) {
      console.error('Error loading linked records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalLinks = triggeredLinks.length + triggeredByLinks.length;

  if (isLoading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Linked Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalLinks === 0) {
    return null; // Don't show section if no links
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Linked Records
          <Badge variant="outline" className="ml-2">{totalLinks}</Badge>
        </CardTitle>
        <CardDescription>
          Records connected to this one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Records triggered by this record */}
        {triggeredLinks.map((link) => (
          <div 
            key={link.id} 
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ArrowRight className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    Triggered
                  </Badge>
                  <span className="font-medium">
                    {link.target_process?.name || 'Unknown Process'}
                  </span>
                </div>
                {link.target_record ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {link.target_record.record_identifier || link.target_record.record_title}
                    </span>
                    <StatusBadge status={link.target_record.current_status} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1 text-sm text-warning">
                    <Clock className="h-3 w-3" />
                    Pending creation
                  </div>
                )}
              </div>
            </div>
            {link.target_record && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/record/${link.target_record_id}`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {/* Records that triggered this record */}
        {triggeredByLinks.map((link) => (
          <div 
            key={link.id} 
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Link2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                    Triggered By
                  </Badge>
                  <span className="font-medium">
                    {link.target_process?.name || 'Unknown Process'}
                  </span>
                </div>
                {link.source_record && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {link.source_record.record_identifier || link.source_record.record_title}
                    </span>
                    <StatusBadge status={link.source_record.current_status} />
                  </div>
                )}
              </div>
            </div>
            {link.source_record && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/record/${link.source_record_id}`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
