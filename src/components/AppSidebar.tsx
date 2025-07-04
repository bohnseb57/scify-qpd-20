import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Settings, Plus, Building2, Users, ClipboardList } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarSeparator, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types/qpd";
import { toast } from "sonner";
export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state
  } = useSidebar();
  const collapsed = state === "collapsed";
  const [processes, setProcesses] = useState<Process[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadProcesses();
  }, []);
  const loadProcesses = async () => {
    try {
      // Load processes
      const {
        data: processesData,
        error: processesError
      } = await supabase.from('processes').select('*').eq('is_active', true).order('name');
      if (processesError) {
        console.error('Error loading processes:', processesError);
        toast.error('Failed to load processes');
        return;
      }
      setProcesses(processesData || []);

      // Load record counts for each process
      if (processesData && processesData.length > 0) {
        const counts: Record<string, number> = {};
        for (const process of processesData) {
          const {
            count,
            error
          } = await supabase.from('process_records').select('*', {
            count: 'exact',
            head: true
          }).eq('process_id', process.id);
          if (!error) {
            counts[process.id] = count || 0;
          }
        }
        setRecordCounts(counts);
      }
    } catch (error) {
      console.error('Error loading sidebar data:', error);
      toast.error('Failed to load sidebar data');
    } finally {
      setIsLoading(false);
    }
  };
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  const handleProcessClick = (processId: string) => {
    navigate(`/process/${processId}`);
  };
  const handleCreateProcess = () => {
    navigate('/create-process');
  };
  const handleDashboard = () => {
    navigate('/');
  };
  if (isLoading) {
    return <Sidebar className={collapsed ? "w-14" : "w-64"}>
        <SidebarContent>
          <div className="animate-pulse p-4 space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </SidebarContent>
      </Sidebar>;
  }
  return <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="h-6 w-6 text-primary" />
          {!collapsed && <span className="font-semibold text-sidebar-foreground">Scillife QMS</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard Overview */}
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleDashboard} isActive={isActive('/')}>
                  <ClipboardList className="h-4 w-4" />
                  {!collapsed && <span>Dashboard</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Process Types */}
        <SidebarGroup>
          <SidebarGroupLabel>Quality Processes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {processes.length === 0 ? <div className="px-2 py-4 text-sm text-muted-foreground">
                  {!collapsed ? "No processes created yet" : "Empty"}
                </div> : processes.map(process => <SidebarMenuItem key={process.id}>
                    <SidebarMenuButton onClick={() => handleProcessClick(process.id)} isActive={isActive(`/process/${process.id}`)}>
                      <FileText className="h-4 w-4" />
                      {!collapsed && <div className="flex items-center justify-between w-full">
                          <span className="truncate">{process.name}</span>
                          <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            {recordCounts[process.id] || 0}
                          </span>
                        </div>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>)}
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
                <SidebarMenuButton onClick={handleCreateProcess} isActive={isActive('/create-process')}>
                  <Plus className="h-4 w-4" />
                  {!collapsed && <span>Create Process</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/settings')} isActive={isActive('/settings')}>
                  <Settings className="h-4 w-4" />
                  {!collapsed && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
}