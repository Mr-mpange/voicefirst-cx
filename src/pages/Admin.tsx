import { useEffect, useState } from "react";
import { Phone, CheckCircle, Clock, Star, Shield, Save, UserCog } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [rows, setRows] = useState<
    Array<{ user_id: string; email: string; role: "admin" | "user"; max_keys: number; active_keys: number }>
  >([]);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const [{ data: roles }, { data: limits }, { data: keys }] = await Promise.all([
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("api_key_limits").select("user_id, max_keys"),
      supabase.from("api_keys").select("user_id, revoked_at"),
    ]);
    const limitMap = new Map((limits ?? []).map((l: any) => [l.user_id, l.max_keys]));
    const roleMap = new Map<string, "admin" | "user">();
    (roles ?? []).forEach((r: any) => {
      const cur = roleMap.get(r.user_id);
      if (r.role === "admin" || !cur) roleMap.set(r.user_id, r.role);
    });
    const activeMap = new Map<string, number>();
    (keys ?? []).forEach((k: any) => {
      if (!k.revoked_at) activeMap.set(k.user_id, (activeMap.get(k.user_id) ?? 0) + 1);
    });
    const ids = Array.from(roleMap.keys());
    // profile display name as best-effort "email"
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const nameMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.display_name ?? ""]));
    setRows(
      ids.map((id) => ({
        user_id: id,
        email: nameMap.get(id) || id.slice(0, 8),
        role: roleMap.get(id) ?? "user",
        max_keys: limitMap.get(id) ?? 5,
        active_keys: activeMap.get(id) ?? 0,
      }))
    );
    setLoadingUsers(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const saveLimit = async (user_id: string) => {
    const value = drafts[user_id];
    if (value === undefined || isNaN(value) || value < 0) {
      toast.error("Enter a valid number");
      return;
    }
    const { error } = await supabase
      .from("api_key_limits")
      .upsert({ user_id, max_keys: value }, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else {
      toast.success("Limit updated");
      setDrafts((d) => {
        const c = { ...d };
        delete c[user_id];
        return c;
      });
      loadUsers();
    }
  };

  const toggleRole = async (user_id: string, current: "admin" | "user") => {
    if (current === "admin") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", "admin");
      if (error) toast.error(error.message);
      else toast.success("Admin revoked");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id, role: "admin" });
      if (error) toast.error(error.message);
      else toast.success("Granted admin");
    }
    loadUsers();
  };

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

      {/* User access & API-key limits */}
      <Card className="p-5 border-border/50 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">User access & API key limits</h3>
        </div>
        {loadingUsers ? (
          <p className="text-xs text-muted-foreground">Loading users…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-3 py-2">User</th>
                  <th className="text-left font-medium px-3 py-2">Role</th>
                  <th className="text-left font-medium px-3 py-2">Active keys</th>
                  <th className="text-left font-medium px-3 py-2">Max keys</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.user_id} className="border-t border-border/40">
                    <td className="px-3 py-2 font-mono text-xs">{r.email}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => toggleRole(r.user_id, r.role)}
                        className={`text-xs rounded-full px-2 py-0.5 border ${
                          r.role === "admin"
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                        title="Toggle admin"
                      >
                        <UserCog className="h-3 w-3 inline mr-1" />
                        {r.role}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{r.active_keys}</td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 w-20 text-xs"
                        value={drafts[r.user_id] ?? r.max_keys}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [r.user_id]: parseInt(e.target.value, 10) }))
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => saveLimit(r.user_id)} className="gap-1">
                        <Save className="h-3 w-3" /> Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Admin;
