import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  sparklineData?: { value: number }[];
  className?: string;
}

const MetricCard = ({ icon: Icon, label, value, trend, sparklineData, className = "" }: MetricCardProps) => {
  return (
    <Card className={`relative overflow-hidden p-5 border-border/60 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-colors ${className}`}>
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
      <div className="flex items-start justify-between relative">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">{label}</p>
          <p className="font-serif text-3xl text-foreground leading-none">{value}</p>
          {trend && (
            <p className={`text-xs font-medium pt-1 ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      {sparklineData && (
        <div className="mt-3 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke="hsl(217, 91%, 60%)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
