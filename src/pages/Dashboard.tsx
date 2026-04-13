import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Bot, Clock, AlertTriangle, MessageSquare, Globe, Loader2, FileText } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import TranscriptFeed from "@/components/voice/TranscriptFeed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { SUPPORTED_LANGUAGES } from "@/hooks/useSpeechRecognition";
import type { TranscriptMessage } from "@/lib/mockData";

interface Conversation {
  id: string;
  language: string;
  transcript: TranscriptMessage[];
  summary: string | null;
  duration_seconds: number;
  status: string;
  created_at: string;
  user_id: string | null;
}

function getLangLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label || code;
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

const Dashboard = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["dashboard-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Conversation[];
    },
    refetchInterval: 15_000,
  });

  const selected = conversations.find((c) => c.id === selectedId) || conversations[0];

  const totalCalls = conversations.length;
  const completedCalls = conversations.filter((c) => c.status === "completed" || c.status === "summarized").length;
  const activeCalls = conversations.filter((c) => c.status === "active").length;
  const summarizedCalls = conversations.filter((c) => c.status === "summarized").length;
  const totalDuration = conversations.reduce((acc, c) => acc + c.duration_seconds, 0);
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

  const langCounts: Record<string, number> = {};
  conversations.forEach((c) => {
    langCounts[c.language] = (langCounts[c.language] || 0) + 1;
  });
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Phone} label="Total Calls" value={totalCalls} />
        <MetricCard
          icon={Bot}
          label="Summarized"
          value={summarizedCalls}
          trend={totalCalls > 0 ? { value: `${Math.round((summarizedCalls / totalCalls) * 100)}% of total`, positive: true } : undefined}
        />
        <MetricCard icon={Clock} label="Avg Duration" value={formatDuration(avgDuration)} />
        <MetricCard
          icon={AlertTriangle}
          label="Active"
          value={activeCalls}
          trend={activeCalls > 0 ? { value: `${activeCalls} in progress`, positive: false } : undefined}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conversation list */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Conversations ({conversations.length})
          </h2>
          <ScrollArea className="h-[500px]">
            <div className="space-y-2 pr-2">
              {conversations.length === 0 ? (
                <Card className="p-6 border-border/50 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </Card>
              ) : (
                conversations.map((conv) => {
                  const msgCount = conv.transcript?.length || 0;
                  const isSelected = selected?.id === conv.id;
                  return (
                    <Card
                      key={conv.id}
                      className={`p-3 cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                        isSelected ? "border-primary bg-primary/5" : "border-border/50"
                      }`}
                      onClick={() => setSelectedId(conv.id)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {new Date(conv.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getLangLabel(conv.language)} · {msgCount} msgs
                          </p>
                        </div>
                        <Badge
                          variant={conv.status === "summarized" ? "default" : conv.status === "completed" ? "secondary" : "outline"}
                          className="text-[10px] px-1.5 py-0.5 shrink-0"
                        >
                          {conv.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(conv.duration_seconds)}
                        </span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Transcript */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transcript</h2>
          <Card className="p-4 border-border/50">
            {selected ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{getLangLabel(selected.language)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{formatDuration(selected.duration_seconds)}</span>
                </div>
                {selected.transcript?.length > 0 ? (
                  <TranscriptFeed messages={selected.transcript} maxHeight="400px" />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No transcript recorded</p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select a conversation</p>
            )}
          </Card>
        </div>

        {/* Details & Analytics */}
        <div className="lg:col-span-4 space-y-3">
          {/* Summary */}
          {selected?.summary && (
            <>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Summary</h2>
              <Card className="p-4 border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase">Summary</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-line">{selected.summary}</p>
              </Card>
            </>
          )}

          {/* Language breakdown */}
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Languages Used</h2>
          <Card className="p-4 border-border/50 space-y-2">
            {topLangs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No data yet</p>
            ) : (
              topLangs.map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{getLangLabel(lang)}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / totalCalls) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))
            )}
          </Card>

          {/* Quick stats */}
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Stats</h2>
          <Card className="p-4 border-border/50 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total duration</span>
              <span className="text-foreground font-medium">{formatDuration(totalDuration)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed</span>
              <span className="text-foreground font-medium">{completedCalls}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">With transcript</span>
              <span className="text-foreground font-medium">
                {conversations.filter((c) => c.transcript?.length > 0).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Summarized</span>
              <span className="text-foreground font-medium">{summarizedCalls}</span>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
