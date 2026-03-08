import { Phone, CheckCircle, Clock, Star } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import { Card } from "@/components/ui/card";
import {
  callsPerHourData,
  aiVsHumanData,
  latencyData,
  callCategoriesData,
  sparklineData,
} from "@/lib/mockData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Admin = () => {
  return (
    <DashboardLayout title="Admin Analytics">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Phone} label="Total Calls Today" value="1,247" trend={{ value: "+12% vs yesterday", positive: true }} sparklineData={sparklineData(100, 30)} />
        <MetricCard icon={CheckCircle} label="AI Resolution Rate" value="91.3%" trend={{ value: "+2.1%", positive: true }} sparklineData={sparklineData(90, 5)} />
        <MetricCard icon={Clock} label="Avg Call Duration" value="3:42" trend={{ value: "-18s", positive: true }} sparklineData={sparklineData(220, 40)} />
        <MetricCard icon={Star} label="Customer Satisfaction" value="4.7/5" trend={{ value: "+0.2", positive: true }} sparklineData={sparklineData(47, 3)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls per hour */}
        <Card className="p-5 border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Calls Per Hour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={callsPerHourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,22%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(217,33%,22%)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="calls" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI vs Human */}
        <Card className="p-5 border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">AI vs Human Handled</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiVsHumanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,22%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(217,33%,22%)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="ai" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="human" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Latency */}
        <Card className="p-5 border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Response Latency (ms)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217,33%,22%)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} interval={3} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,55%)" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(217,33%,22%)", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="latency" stroke="hsl(38,92%,50%)" fill="hsl(38,92%,50%,0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-5 border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Call Categories</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={callCategoriesData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {callCategoriesData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(217,33%,22%)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
