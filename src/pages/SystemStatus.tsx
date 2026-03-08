import { useState, useEffect } from "react";
import { Zap, Cpu, Users, Globe, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Card } from "@/components/ui/card";
import { sparklineData, type SystemHealth } from "@/lib/mockData";

interface SystemMetric {
  icon: typeof Zap;
  label: string;
  value: string;
  status: SystemHealth;
  sparkline: { value: number }[];
}

const initialMetrics: SystemMetric[] = [
  { icon: Zap, label: "Voice Processing Latency", value: "23ms", status: "healthy", sparkline: sparklineData(23, 10) },
  { icon: Cpu, label: "AI Server Load", value: "67%", status: "healthy", sparkline: sparklineData(67, 15) },
  { icon: Users, label: "Active Users", value: "1,247", status: "healthy", sparkline: sparklineData(1247, 200) },
  { icon: Globe, label: "API Usage", value: "84%", status: "warning", sparkline: sparklineData(84, 8) },
  { icon: Clock, label: "System Uptime", value: "99.97%", status: "healthy", sparkline: sparklineData(9997, 3) },
];

const SystemStatus = () => {
  const [metrics, setMetrics] = useState(initialMetrics);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          sparkline: [...m.sparkline.slice(1), { value: m.sparkline[0].value + Math.floor(Math.random() * 6 - 3) }],
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="System Status">
      {/* Overall status */}
      <Card className="p-4 border-border/50 mb-6 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
        <span className="text-sm font-medium text-foreground">All Systems Operational</span>
        <span className="text-xs text-muted-foreground ml-auto">Last checked: just now</span>
      </Card>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {metrics.map((m, i) => (
          <Card key={i} className="p-4 border-border/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-xl font-bold text-foreground">{m.value}</p>
                </div>
              </div>
              <StatusBadge status={m.status} />
            </div>
            <div className="h-12">
              <div className="flex items-end justify-between h-full gap-0.5">
                {m.sparkline.map((d, j) => (
                  <div
                    key={j}
                    className="flex-1 bg-primary/30 rounded-t transition-all duration-500"
                    style={{
                      height: `${Math.max(10, ((d.value - Math.min(...m.sparkline.map((s) => s.value))) / (Math.max(...m.sparkline.map((s) => s.value)) - Math.min(...m.sparkline.map((s) => s.value)) || 1)) * 100)}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Service list */}
      <Card className="border-border/50">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Service Health</h3>
        </div>
        {[
          { name: "Voice Recognition Engine", status: "healthy" as SystemHealth, uptime: "99.99%" },
          { name: "Natural Language Processor", status: "healthy" as SystemHealth, uptime: "99.98%" },
          { name: "Text-to-Speech Service", status: "healthy" as SystemHealth, uptime: "99.97%" },
          { name: "Call Routing Engine", status: "healthy" as SystemHealth, uptime: "99.95%" },
          { name: "Analytics Pipeline", status: "warning" as SystemHealth, uptime: "99.82%" },
          { name: "Knowledge Base Index", status: "healthy" as SystemHealth, uptime: "99.99%" },
        ].map((service, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-border/30 last:border-0">
            <span className="text-sm text-foreground">{service.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-mono">{service.uptime}</span>
              <StatusBadge status={service.status} />
            </div>
          </div>
        ))}
      </Card>
    </DashboardLayout>
  );
};

export default SystemStatus;
