import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Settings,
  Plus,
  Building2,
  BookOpen,
  GraduationCap,
  Users,
  BarChart3,
  ChevronRight,
  ClipboardList,
  LockKeyhole,
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
import { toast } from "sonner";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const [processes, setProcesses] = useState<Process[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processesOpen, setProcessesOpen] = useState(true); // accordion state

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
    // unchanged logic
  };

  const handleProcessClick = (processId: string) => navigate(`/process/${processId}`);
  const handleCreateProcess = () => navigate("/create-process");
  const handleDashboard = () => navigate("/");

  if (isLoading) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-64"}>
        <SidebarContent>
          <div className="animate-pulse p-4 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      {/* Header (unchanged) */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground">Project Q</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Disabled parents ABOVE “Processes” */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Knowledge (disabled) */}
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled className="cursor-not-allowed opacity-60">
                  <BookOpen className="h-4 w-4" />
                  {!collapsed && (
                    <span className="flex-1">Knowledge</span>
                  )}
                  {!collapsed && <LockKeyhole className="h-3 w-3" />}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Training (disabled) */}
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled className="cursor-not-allowed opacity-60">
                  <GraduationCap className="h-4 w-4" />
                  {!collapsed && <span className="flex-1">Training</span>}
                  {!collapsed && <LockKeyhole className="h-3 w-3" />}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Processes (parent/accordion) */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => !collapsed && setProcessesOpen((v) => !v)}
                  className="select-none"
                  tooltip="Processes"
                >
                  <BarChart3 className="h-4 w-4" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">Processes</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${processesOpen ? "rotate-90" : ""}`}
                      />
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* CONTENT NESTED UNDER “PROCESSES” (shows only when expanded and Processes is open) */}
        {(!collapsed && processesOpen) && (
          <>
            {/* Overview */}
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleDashboard} isActive={isActive("/")}>
                      <ClipboardList className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Quality Processes */}
            <SidebarGroup>
              <SidebarGroupLabel>Quality Processes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {processes.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground">
                      No processes created yet
                    </div>
                  ) : (
                    processes.map((process) => (
                      <SidebarMenuItem key={process.id}>
                        <SidebarMenuButton
                          onClick={() => handleProcessClick(process.id)}
                          isActive={isActive(`/process/${process.id}`)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="flex-1 truncate">{process.name}</span>
                          <SidebarMenuBadge>
                            {recordCounts[process.id] ?? 0}
                          </SidebarMenuBadge>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Configuration */}
            <SidebarGroup>
              <SidebarGroupLabel>Configuration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleCreateProcess}
                      isActive={isActive("/create-process")}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Process</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/process-config")}
                      isActive={isActive("/process-config")}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Manage Processes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        {/* Disabled items BELOW “Processes” */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Monitoring (disabled) */}
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled className="cursor-not-allowed opacity-60">
                  <Users className="h-4 w-4" />
                  {!collapsed && <span className="flex-1">Monitoring</span>}
                  {!collapsed && <LockKeyhole className="h-3 w-3" />}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Admin (disabled) */}
              <SidebarMenuItem>
                <SidebarMenuButton aria-disabled className="cursor-not-allowed opacity-60">
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span className="flex-1">Admin</span>}
                  {!collapsed && <LockKeyhole className="h-3 w-3" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
