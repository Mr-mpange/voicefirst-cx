import {
  LayoutDashboard,
  Phone,
  BookOpen,
  BarChart3,
  Activity,
  Bot,
  History,
  LogOut,
  KeyRound,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
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

const allNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Voice Assistant", url: "/app", icon: Phone, adminOnly: false },
  { title: "Conversations", url: "/conversations", icon: History, adminOnly: false },
  { title: "API Keys", url: "/dashboard/api-keys", icon: KeyRound, adminOnly: false },
  { title: "Knowledge Base", url: "/knowledge-base", icon: BookOpen, adminOnly: false },
  { title: "Admin", url: "/admin", icon: BarChart3, adminOnly: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const isActive = (path: string) => location.pathname === path;
  const initials = user?.email?.slice(0, 2).toUpperCase() || "?";

  const navItems = allNavItems.filter((item) => {
    if (roleLoading) return !item.adminOnly;
    if (item.adminOnly) return isAdmin;
    if (item.title === "Voice Assistant") return !isAdmin;
    return true;
  });

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
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 text-xs">
              <p className="font-medium text-foreground truncate">{user?.email}</p>
              <button
                onClick={signOut}
                className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mt-0.5"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
