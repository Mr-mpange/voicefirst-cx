import {
  LayoutDashboard,
  Phone,
  PhoneCall,
  BookOpen,
  BarChart3,
  Bot,
  History,
  LogOut,
  KeyRound,
  Sparkles,
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
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const allNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Voice Assistant", url: "/app", icon: Phone, adminOnly: false },
  { title: "Conversations", url: "/conversations", icon: History, adminOnly: false },
  { title: "Phone Integration", url: "/dashboard/phone", icon: PhoneCall, adminOnly: false },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/70 px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-serif text-base text-sidebar-foreground">AudientAssist</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Console</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
              Workspace
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={`rounded-lg transition-colors hover:bg-sidebar-accent ${
                        isActive(item.url)
                          ? "bg-sidebar-accent text-primary font-medium border-l-2 border-primary"
                          : "border-l-2 border-transparent"
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
        {!collapsed && (
          <div className="mx-3 mt-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2 text-[11px] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="uppercase tracking-widest">Pro tip</span>
            </div>
            <p className="mt-1.5 text-xs text-sidebar-foreground/80 leading-snug">
              Upload your FAQ to ground Alex in real answers — no hallucinations.
            </p>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 px-2 py-3 border-t border-sidebar-border/70">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 text-xs min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">{user?.email}</p>
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
