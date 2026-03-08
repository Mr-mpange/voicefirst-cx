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
    <Card className={`p-4 border-border/50 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
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
