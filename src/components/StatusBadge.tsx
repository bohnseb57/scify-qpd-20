import { Badge } from "@/components/ui/badge";
import { WorkflowStatus } from "@/types/qpd";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-status-draft text-primary",
  },
  in_progress: {
    label: "In Progress", 
    className: "bg-status-in-progress text-white",
  },
  approved: {
    label: "Approved",
    className: "bg-status-approved text-white",
  },
  rejected: {
    label: "Rejected",
    className: "bg-status-rejected text-white",
  },
  completed: {
    label: "Completed",
    className: "bg-status-completed text-white",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      className={cn(config.className, className)}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
}