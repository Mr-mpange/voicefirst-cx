import type { CallStatus, AIState, SystemHealth } from "@/lib/mockData";

type BadgeType = CallStatus | AIState | SystemHealth;

interface StatusBadgeProps {
  status: BadgeType;
  className?: string;
}

const config: Record<string, { label: string; dotColor: string; bgColor: string; textColor: string }> = {
  "ai-handling": { label: "AI Handling", dotColor: "bg-primary", bgColor: "bg-primary/10", textColor: "text-primary" },
  escalated: { label: "Escalated", dotColor: "bg-warning", bgColor: "bg-warning/10", textColor: "text-warning" },
  waiting: { label: "Waiting", dotColor: "bg-muted-foreground", bgColor: "bg-muted", textColor: "text-muted-foreground" },
  completed: { label: "Completed", dotColor: "bg-success", bgColor: "bg-success/10", textColor: "text-success" },
  idle: { label: "Ready to help", dotColor: "bg-muted-foreground", bgColor: "bg-muted", textColor: "text-muted-foreground" },
  listening: { label: "Hearing you...", dotColor: "bg-primary", bgColor: "bg-primary/10", textColor: "text-primary" },
  processing: { label: "Thinking...", dotColor: "bg-warning", bgColor: "bg-warning/10", textColor: "text-warning" },
  speaking: { label: "Alex is talking", dotColor: "bg-success", bgColor: "bg-success/10", textColor: "text-success" },
  healthy: { label: "Healthy", dotColor: "bg-success", bgColor: "bg-success/10", textColor: "text-success" },
  warning: { label: "Warning", dotColor: "bg-warning", bgColor: "bg-warning/10", textColor: "text-warning" },
  critical: { label: "Critical", dotColor: "bg-destructive", bgColor: "bg-destructive/10", textColor: "text-destructive" },
};

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const c = config[status] || config.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.bgColor} ${c.textColor} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dotColor} animate-pulse`} />
      {c.label}
    </span>
  );
};

export default StatusBadge;
