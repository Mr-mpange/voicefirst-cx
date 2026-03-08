import {
  LayoutDashboard,
  Phone,
  BookOpen,
  BarChart3,
  Activity,
  Bot,
  History,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Voice Assistant", url: "/", icon: Phone },
  { title: "Conversations", url: "/conversations", icon: History },
  { title: "Admin Analytics", url: "/admin", icon: BarChart3 },
  { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen },
  { title: "System Status", url: "/system-status", icon: Activity },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const initials = user?.email?.slice(0, 2).toUpperCase() || "?";
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              {!collapsed && <span className="font-bold text-foreground">VoiceAI</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={`hover:bg-sidebar-accent ${
                        isActive(item.url) ? "bg-sidebar-accent text-primary font-medium" : ""
                      }`}
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            JD
          </div>
          {!collapsed && (
            <div className="text-xs">
              <p className="font-medium text-foreground">John Doe</p>
              <p className="text-muted-foreground">Agent</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
