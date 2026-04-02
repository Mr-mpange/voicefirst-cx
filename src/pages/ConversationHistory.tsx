import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Clock,
  Globe,
  FileText,
  Loader2,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { exportAsText, exportAsPDF } from "@/lib/exportConversation";
import { SUPPORTED_LANGUAGES } from "@/hooks/useSpeechRecognition";

interface Conversation {
  id: string;
  language: string;
  transcript: Array<{ speaker: string; text: string; timestamp: string }>;
  summary: string | null;
  duration_seconds: number;
  status: string;
  created_at: string;
}

function getLangLabel(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label || code;
}

function formatDuration(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

const ConversationHistory = () => {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const {
    data: conversations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Conversation[];
    },
  });

  const handleSummarize = async (id: string) => {
    setSummarizingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("summarize-conversation", {
        body: { conversationId: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Conversation summarized!");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to summarize");
    } finally {
      setSummarizingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <DashboardLayout title="Conversation History">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversation History</h1>
          <p className="text-sm text-muted-foreground">
            Recorded conversations with transcripts and AI summaries
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !conversations?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p>No conversations recorded yet.</p>
              <p className="text-xs mt-1">Start a voice call to create your first conversation.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {conversations.map((conv) => {
              const isExpanded = expandedId === conv.id;
              const msgCount = conv.transcript?.length || 0;

              return (
                <Card
                  key={conv.id}
                  className="bg-card border-border/50 overflow-hidden transition-all duration-200"
                >
                  {/* Compact row — always visible */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(conv.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {new Date(conv.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getLangLabel(conv.language)} · {msgCount} messages · {formatDuration(conv.duration_seconds)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={conv.status === "summarized" ? "default" : "secondary"}
                        className="text-[10px] px-2 py-0.5"
                      >
                        {conv.status}
                      </Badge>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 px-4 border-t border-border/30 animate-fade-in">
                      <div className="space-y-4 mt-3">
                        {/* Meta badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Globe className="h-3 w-3" />
                            {getLangLabel(conv.language)}
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            {formatDuration(conv.duration_seconds)}
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            {msgCount} messages
                          </Badge>
                        </div>

                        {/* Transcript */}
                        {msgCount > 0 ? (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Transcript
                            </h4>
                            <ScrollArea className="max-h-48">
                              <div className="space-y-2">
                                {conv.transcript.map((msg, i) => (
                                  <div key={i} className="flex gap-2">
                                    <span
                                      className={`text-xs font-bold shrink-0 w-16 ${
                                        msg.speaker === "ai"
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {msg.speaker === "ai" ? "AI" : "Customer"}
                                    </span>
                                    <p className="text-sm text-foreground">{msg.text}</p>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No transcript recorded.
                          </p>
                        )}

                        {/* Summary */}
                        {conv.summary ? (
                          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">
                                AI Summary
                              </h4>
                            </div>
                            <p className="text-sm text-foreground">{conv.summary}</p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={summarizingId === conv.id || msgCount === 0}
                            onClick={() => handleSummarize(conv.id)}
                          >
                            {summarizingId === conv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            Generate AI Summary
                          </Button>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-border/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => exportAsText(conv)}
                          >
                            <Download className="h-3 w-3" />
                            Export TXT
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => exportAsPDF(conv)}
                          >
                            <FileText className="h-3 w-3" />
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConversationHistory;
