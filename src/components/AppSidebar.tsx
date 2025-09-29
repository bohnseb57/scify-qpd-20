import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Settings,
  Plus,
  Building2,
  ClipboardList,
  BookOpen,
  GraduationCap,
  Monitor,
  BarChart3,
  ChevronRight,
  LockKeyhole,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types/qpd";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  // --- keep your existing data/state ---
  const [processes, setProcesses] = useState<Process[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  // --- new UI-only state: accordion + hover popover for "Processes" ---
  const [processesOpen, setProcessesOpen] = useState(true);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ top: number; left: number } | null>(null);
  const hoverHideTimer = useRef<number | null>(null);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const { data: processesData, error: processesError } = await supabase
        .from("processes")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (processesError) {
        console.error("Error loading processes:", processesError);
        toast.error("Failed to load processes");
        return;
      }
      setProcesses(processesData || []);

      if (processesData && processesData.length > 0) {
        const counts: Record<string, number> = {};
        for (const process of processesData) {
          const { count, error } = await supabase
            .from("process_records")
            .select("*", { count: "exact", head: true })
            .eq("process_id", process.id);
          if (!error) counts[process.id] = count || 0;
        }
        setRecordCounts(counts);
      }
    } catch (error) {
      console.error("Error loading sidebar data:", error);
      toast.error("Failed to load sidebar data");
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
    // (same as you had)
  };

  // route handlers (unchanged)
  const handleProcessClick = (processId: string) => navigate(`/process/${processId}`);
  const handleCreateProcess = () => navigate("/create-process");
  const handleDashboard = () => navigate("/");

  // ----- collapsed-mode hover popover helpers -----
  const showHover = (anchorEl: HTMLElement) => {
    if (hoverHideTimer.current) {
      window.clearTimeout(hoverHideTimer.current);
      hoverHideTimer.current = null;
    }
    const rect = anchorEl.getBoundingClientRect();
    setHoverPos({ top: rect.top, left: rect.right + 8 });
    setHoverOpen(true);
  };
  const scheduleHideHover = () => {
    hoverHideTimer.current = window.setTimeout(() => setHoverOpen(false), 120);
  };

  if (isLoading) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-64"}>
        <SidebarContent>
          <div className="animate-pulse p-4 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      {/* Header (unchanged look) */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">Project Q</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* --- Disabled parents ABOVE Processes (matches Monitoring prototype) --- */}
        {[
          { Icon: BookOpen, label: "Knowledge" },
          { Icon: GraduationCap, label: "Training" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className={cn(
              "mx-2 mt-2 flex items-center rounded-lg px-3 py-1 text-sm font-medium",
              "text-muted-foreground opacity-60 cursor-not-allowed",
              collapsed && "justify-center"
            )}
            aria-disabled
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="ml-3">{label}</span>
                <LockKeyhole className="ml-auto h-3 w-3 flex-shrink-0" />
              </>
            )}
          </div>
        ))}

        {/* --- Processes (parent) --- */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={collapsed ? undefined : processesOpen}
          className={cn(
            "mx-2 mt-2 group flex items-center rounded-md px-3 py-1 text-sm font-medium cursor-pointer select-none",
            "text-foreground",
            collapsed && "justify-center"
          )}
          onClick={() => {
            if (!collapsed) setProcessesOpen((v) => !v);
          }}
          onKeyDown={(e) => {
            if (!collapsed && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setProcessesOpen((v) => !v);
            }
          }}
          onMouseEnter={(e) => {
            if (collapsed) showHover(e.currentTarget);
          }}
          onMouseLeave={() => {
            if (collapsed) scheduleHideHover();
          }}
        >
          <BarChart3 className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="ml-3">Processes</span>
              <ChevronRight
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  processesOpen && "rotate-90"
                )}
              />
            </>
          )}
        </div>

        {/* --- Children (expanded mode only) --- */}
        {!collapsed && processesOpen && (
          <div className="mt-1 space-y-1">
            {/* Overview / Dashboard */}
            <button
              onClick={handleDashboard}
              className={cn(
                "mx-2 flex w-[calc(100%-1rem)] items-center rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors",
                "pl-10",
                isActive("/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Dashboard
            </button>

            {/* Quality Processes (list from Supabase) */}
            {processes.map((process) => (
              <button
                key={process.id}
                onClick={() => handleProcessClick(process.id)}
                className={cn(
                  "mx-2 flex w-[calc(100%-1rem)] items-center rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors",
                  "pl-10",
                  isActive(`/process/${process.id}`)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span className="flex-1 truncate">{process.name}</span>
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {recordCounts[process.id] ?? 0}
                </span>
              </button>
            ))}

            <SidebarSeparator className="mx-2" />

            {/* Configuration */}
            <button
              onClick={handleCreateProcess}
              className={cn(
                "mx-2 flex w-[calc(100%-1rem)] items-center rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors",
                "pl-10",
                isActive("/create-process")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Process
            </button>

            <button
              onClick={() => navigate("/process-config")}
              className={cn(
                "mx-2 mb-1 flex w-[calc(100%-1rem)] items-center rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors",
                "pl-10",
                isActive("/process-config")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Settings className="mr-2 h-4 w-4" />
              Manage Processes
            </button>
          </div>
        )}

        {/* --- Disabled parents BELOW Processes --- */}
        {[
          { Icon: Monitor, label: "Monitoring" },
          { Icon: Settings, label: "Admin" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className={cn(
              "mx-2 mt-1 flex items-center rounded-lg px-3 py-1 text-sm font-medium",
              "text-muted-foreground opacity-60 cursor-not-allowed",
              collapsed && "justify-center"
            )}
            aria-disabled
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="ml-3">{label}</span>
                <LockKeyhole className="ml-auto h-3 w-3 flex-shrink-0" />
              </>
            )}
          </div>
        ))}

        {/* --- COLLAPSED hover popover for Processes --- */}
        {collapsed && hoverOpen && hoverPos && (
          <div
            onMouseEnter={() => {
              if (hoverHideTimer.current) {
                window.clearTimeout(hoverHideTimer.current);
                hoverHideTimer.current = null;
              }
            }}
            onMouseLeave={scheduleHideHover}
            className="fixed z-50 min-w-56 rounded-md border border-sidebar-border bg-background shadow-md"
            style={{ top: hoverPos.top, left: hoverPos.left }}
          >
            <div className="px-3 py-2 border-b border-sidebar-border text-xs font-medium text-muted-foreground">
              Processes
            </div>

            {/* Overview */}
            <button
              onClick={() => {
                setHoverOpen(false);
                handleDashboard();
              }}
              className={cn(
                "block w-full text-left px-3 py-2 text-sm rounded-md",
                isActive("/")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              Dashboard
            </button>

            {/* Processes */}
            {processes.map((process) => (
              <button
                key={process.id}
                onClick={() => {
                  setHoverOpen(false);
                  handleProcessClick(process.id);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-sm rounded-md",
                  isActive(`/process/${process.id}`)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="truncate">{process.name}</span>
                <span className="ml-3 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                  {recordCounts[process.id] ?? 0}
                </span>
              </button>
            ))}

            <SidebarSeparator className="my-1" />

            {/* Config */}
            <button
              onClick={() => {
                setHoverOpen(false);
                handleCreateProcess();
              }}
              className={cn(
                "block w-full text-left px-3 py-2 text-sm rounded-md",
                isActive("/create-process")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              Create Process
            </button>
            <button
              onClick={() => {
                setHoverOpen(false);
                navigate("/process-config");
              }}
              className={cn(
                "block w-full text-left px-3 py-2 text-sm rounded-md",
                isActive("/process-config")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              Manage Processes
            </button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
