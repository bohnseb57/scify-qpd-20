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
  Workflow
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenuBadge,
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
        <div className="flex-1 items-center gap-2 mx-2">
              <div className="text-sm font-bold">Project Q</div>
              <div className="text-xs text-muted-foreground">Processes Module</div>
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
              "mx-2 flex items-center rounded-lg px-3 py-1 text-sm font-medium",
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
            "mx-2 group flex items-center rounded-md px-3 text-sm font-medium cursor-pointer select-none",
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
          <Workflow className="h-4 w-4 flex-shrink-0" />
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

        {/* --- Children (expanded mode only) with section headers --- */}
        {!collapsed && processesOpen && (
          <div className="space-y-0">
            {/* Overview */}
            <SidebarGroup className="pt-0">
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/")}
                      className="pl-6"
                    >
                      <button
                        onClick={handleDashboard}
                        className="flex items-center gap-1"
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
        
            {/* Quality Processes */}
            <SidebarGroup>
              <SidebarGroupLabel>Quality Processes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {processes.map((process) => (
                    <SidebarMenuItem key={process.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(`/process/${process.id}`)}
                        className="pl-6"
                      >
                        <button
                          onClick={() => handleProcessClick(process.id)}
                          className="flex w-full items-center gap-1"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="flex-1 truncate">{process.name}</span>
                          <SidebarMenuBadge>
                            {recordCounts[process.id] ?? 0}
                          </SidebarMenuBadge>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
        
            {/* Configuration */}
            <SidebarGroup>
              <SidebarGroupLabel>Configuration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/create-process")}
                      className="pl-6"
                    >
                      <button onClick={handleCreateProcess} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        <span>Create Process</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
        
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/process-config")}
                      className="pl-6"
                    >
                      <button onClick={() => navigate("/process-config")} className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        <span>Manage Processes</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        )}


        {/* --- Disabled parents BELOW Processes --- */}
        {[
          { Icon: Monitor, label: "BarChart3" },
          { Icon: Settings, label: "Admin" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className={cn(
              "mx-2 flex items-center rounded-lg px-3 py-1 text-sm font-medium",
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
