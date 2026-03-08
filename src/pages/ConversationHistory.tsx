import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, Globe, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  language: string;
  transcript: Array<{ speaker: string; text: string; timestamp: string }>;
  summary: string | null;
  duration_seconds: number;
  status: string;
  created_at: string;
}

const ConversationHistory = () => {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  const { data: conversations, isLoading, refetch } = useQuery({
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

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conversation History</h1>
          <p className="text-sm text-muted-foreground">Recorded conversations with transcripts and AI summaries</p>
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
          <div className="grid gap-4">
            {conversations.map((conv) => (
              <Card key={conv.id} className="bg-card border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Conversation
                      <span className="text-xs text-muted-foreground font-normal">
                        {new Date(conv.created_at).toLocaleString()}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Globe className="h-3 w-3" />
                        {conv.language}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {formatDuration(conv.duration_seconds)}
                      </Badge>
                      <Badge
                        variant={conv.status === "summarized" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {conv.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transcript */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Transcript</h4>
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {conv.transcript.map((msg, i) => (
                          <div key={i} className="flex gap-2">
                            <span
                              className={`text-xs font-bold shrink-0 w-16 ${
                                msg.speaker === "ai" ? "text-primary" : "text-muted-foreground"
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

                  {/* Summary */}
                  {conv.summary ? (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-medium text-primary">AI Summary</h4>
                      </div>
                      <p className="text-sm text-foreground">{conv.summary}</p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={summarizingId === conv.id || conv.transcript.length === 0}
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ConversationHistory;
