import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-sans bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center border-b border-border/60 px-5 gap-4 bg-card/30 backdrop-blur-md sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border/70" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AudientAssist</span>
              <h1 className="font-serif text-xl text-foreground">{title}</h1>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border/60 bg-background/60 text-xs text-muted-foreground w-64">
                <Search className="h-3.5 w-3.5" />
                <span>Search calls, transcripts…</span>
                <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground/80">⌘K</kbd>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 h-9 rounded-lg border border-success/30 bg-success/10 text-xs text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Operational
              </div>
              <button className="h-9 w-9 rounded-lg border border-border/60 bg-background/60 grid place-items-center text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
