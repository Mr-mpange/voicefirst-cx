import { useState, useEffect, useCallback } from "react";
import { Zap, Cpu, Users, Globe, Clock, RefreshCw, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type SystemHealth } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceResult {
  name: string;
  status: SystemHealth;
  latencyMs: number;
  detail?: string;
}

interface HealthPayload {
  overall: SystemHealth;
  services: ServiceResult[];
  checkedAt: string;
}

const statusIcon = (s: SystemHealth) => {
  if (s === "healthy") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (s === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const overallLabel: Record<SystemHealth, string> = {
  healthy: "All Systems Operational",
  warning: "Some Services Degraded",
  critical: "System Issues Detected",
};

const SystemStatus = () => {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-check");
      if (error) throw error;
      setHealth(data as HealthPayload);
    } catch (e: any) {
      console.error("Health check failed:", e);
      toast.error("Failed to fetch system health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return (
    <DashboardLayout title="System Status">
      {/* Overall status */}
      <Card className="p-4 border-border/50 mb-6 flex items-center gap-3 flex-wrap">
        {health ? (
          <>
            {statusIcon(health.overall)}
            <span className="text-sm font-medium text-foreground">{overallLabel[health.overall]}</span>
            <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
              Last checked: {new Date(health.checkedAt).toLocaleTimeString()}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">{loading ? "Checking services…" : "Unable to fetch health"}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={fetchHealth}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </Card>

      {/* Service list */}
      <Card className="border-border/50">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Service Health</h3>
        </div>
        {loading && !health ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : health ? (
          health.services.map((service, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {statusIcon(service.status)}
                <span className="text-sm text-foreground truncate">{service.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {service.latencyMs > 0 && (
                  <span className="text-xs text-muted-foreground font-mono">{service.latencyMs}ms</span>
                )}
                {service.detail && (
                  <span className="text-xs text-muted-foreground max-w-[200px] truncate hidden md:inline" title={service.detail}>
                    {service.detail}
                  </span>
                )}
                <StatusBadge status={service.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">Unable to load service health</div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default SystemStatus;
