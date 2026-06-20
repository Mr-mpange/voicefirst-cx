import { useEffect, useMemo, useState } from "react";
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
  const [convos, setConvos] = useState<
    Array<{ id: string; created_at: string; duration_seconds: number | null; status: string | null; language: string | null; summary: string | null }>
  >([]);
  const [loadingConvos, setLoadingConvos] = useState(true);

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

  const loadConversations = async () => {
    setLoadingConvos(true);
    const { data, error } = await supabase
      .from("conversations")
      .select("id, created_at, duration_seconds, status, language, summary")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) toast.error(error.message);
    setConvos(data ?? []);
    setLoadingConvos(false);
  };

  useEffect(() => {
    loadUsers();
    loadConversations();
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const startYesterday = new Date(startToday);
    startYesterday.setDate(startYesterday.getDate() - 1);

    const today = convos.filter((c) => new Date(c.created_at) >= startToday);
    const yesterday = convos.filter(
      (c) => new Date(c.created_at) >= startYesterday && new Date(c.created_at) < startToday,
    );

    const totalToday = today.length;
    const totalYesterday = yesterday.length;
    const deltaPct = totalYesterday > 0
      ? Math.round(((totalToday - totalYesterday) / totalYesterday) * 100)
      : null;

    const completed = today.filter((c) => c.status === "completed" || c.status === "ended").length;
    const resolution = totalToday > 0 ? (completed / totalToday) * 100 : 0;

    const durations = today.map((c) => c.duration_seconds ?? 0).filter((s) => s > 0);
    const avgDur = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const mins = Math.floor(avgDur / 60);
    const secs = Math.floor(avgDur % 60).toString().padStart(2, "0");

    // Calls per hour for today
    const perHour = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, "0")}:00`,
      calls: 0,
    }));
    today.forEach((c) => {
      const h = new Date(c.created_at).getHours();
      perHour[h].calls += 1;
    });

    // Last 7 days breakdown (AI = completed, Other = active/failed)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startToday);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const aiVsHuman = days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const inDay = convos.filter(
        (c) => new Date(c.created_at) >= d && new Date(c.created_at) < next,
      );
      const ai = inDay.filter((c) => c.status === "completed" || c.status === "ended").length;
      const other = inDay.length - ai;
      return {
        day: d.toLocaleDateString(undefined, { weekday: "short" }),
        ai,
        human: other,
      };
    });

    // Avg duration per hour today
    const latency = perHour.map((p, h) => {
      const inHour = today.filter((c) => new Date(c.created_at).getHours() === h);
      const ds = inHour.map((c) => c.duration_seconds ?? 0).filter((s) => s > 0);
      const avg = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 0;
      return { time: p.hour, latency: Math.round(avg) };
    });

    // Language breakdown
    const langCounts = new Map<string, number>();
    convos.forEach((c) => {
      const k = (c.language || "unknown").toString();
      langCounts.set(k, (langCounts.get(k) ?? 0) + 1);
    });
    const palette = [
      "hsl(217,91%,60%)",
      "hsl(142,71%,45%)",
      "hsl(38,92%,50%)",
      "hsl(280,80%,60%)",
      "hsl(0,72%,55%)",
      "hsl(190,80%,50%)",
    ];
    const categories = Array.from(langCounts.entries()).map(([name, value], i) => ({
      name,
      value,
      fill: palette[i % palette.length],
    }));

    // Sparkline for last 30 buckets of calls per hour (across all convos)
    const sparkCalls: number[] = [];
    const sparkDur: number[] = [];
    const sparkRes: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const end = new Date(now);
      end.setHours(now.getHours() - i, 0, 0, 0);
      const start = new Date(end);
      start.setHours(end.getHours() - 1);
      const inBucket = convos.filter(
        (c) => new Date(c.created_at) >= start && new Date(c.created_at) < end,
      );
      sparkCalls.push(inBucket.length);
      const dd = inBucket.map((c) => c.duration_seconds ?? 0).filter((s) => s > 0);
      sparkDur.push(dd.length ? Math.round(dd.reduce((a, b) => a + b, 0) / dd.length) : 0);
      const done = inBucket.filter((c) => c.status === "completed" || c.status === "ended").length;
      sparkRes.push(inBucket.length ? Math.round((done / inBucket.length) * 100) : 0);
    }

    return {
      totalToday,
      deltaPct,
      resolution,
      avgDurationLabel: avgDur > 0 ? `${mins}:${secs}` : "—",
      perHour,
      aiVsHuman,
      latency,
      categories,
      sparkCalls,
      sparkDur,
      sparkRes,
    };
  }, [convos]);

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
        <MetricCard
          icon={Phone}
          label="Total Calls Today"
          value={metrics.totalToday.toLocaleString()}
          trend={
            metrics.deltaPct === null
              ? undefined
              : { value: `${metrics.deltaPct >= 0 ? "+" : ""}${metrics.deltaPct}% vs yesterday`, positive: metrics.deltaPct >= 0 }
          }
          sparklineData={metrics.sparkCalls}
        />
        <MetricCard
          icon={CheckCircle}
          label="AI Resolution Rate"
          value={`${metrics.resolution.toFixed(1)}%`}
          sparklineData={metrics.sparkRes}
        />
        <MetricCard
          icon={Clock}
          label="Avg Call Duration"
          value={metrics.avgDurationLabel}
          sparklineData={metrics.sparkDur}
        />
        <MetricCard
          icon={Star}
          label="Total Users"
          value={rows.length.toLocaleString()}
          sparklineData={[rows.length]}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls per hour */}
        <Card className="p-5 border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-4">Calls Per Hour</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.perHour}>
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
          <h3 className="text-sm font-semibold text-foreground mb-4">Completed vs Other (7 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.aiVsHuman}>
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
          <h3 className="text-sm font-semibold text-foreground mb-4">Avg Call Duration by Hour (s)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.latency}>
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
          <h3 className="text-sm font-semibold text-foreground mb-4">Calls by Language</h3>
          <div className="h-64">
            {metrics.categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No conversation data yet.</p>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metrics.categories} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {metrics.categories.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(217,33%,17%)", border: "1px solid hsl(217,33%,22%)", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            )}
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
