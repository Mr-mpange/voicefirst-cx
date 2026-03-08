import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Mic, PhoneOff, UserPlus, Timer, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AIAvatar from "@/components/voice/AIAvatar";
import VoiceWaveform from "@/components/voice/VoiceWaveform";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useSpeechRecognition, SUPPORTED_LANGUAGES } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AIState, TranscriptMessage } from "@/lib/mockData";

const Index = () => {
  const { user } = useAuth();
  const [aiState, setAiState] = useState<AIState>("idle");
  const [callActive, setCallActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const msgCountRef = useRef(0);

  const { isListening, isSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition({
      language: selectedLanguage,
      continuous: true,
      onResult: (text, isFinal) => {
        if (isFinal) {
          const ts = new Date().toLocaleTimeString();
          const newMsg: TranscriptMessage = {
            id: `m${msgCountRef.current++}`,
            speaker: "customer",
            text,
            timestamp: ts,
          };
          setMessages((prev) => [...prev, newMsg]);
          setInterimText("");
          setAiState("processing");

          // Simulate AI response after processing
          setTimeout(() => {
            setAiState("speaking");
            setTimeout(() => {
              const aiTs = new Date().toLocaleTimeString();
              const aiMsg: TranscriptMessage = {
                id: `m${msgCountRef.current++}`,
                speaker: "ai",
                text: getAIResponse(text),
                timestamp: aiTs,
              };
              setMessages((prev) => [...prev, aiMsg]);
              setAiState("listening");
            }, 1500);
          }, 1000);
        } else {
          setInterimText(text);
          setAiState("listening");
        }
      },
      onError: (error) => {
        toast.error(`Speech recognition error: ${error}`);
      },
    });

  // Simple simulated AI responses
  function getAIResponse(input: string): string {
    const lower = input.toLowerCase();
    if (lower.includes("bill") || lower.includes("invoice") || lower.includes("charge")) {
      return "I can help with your billing inquiry. Let me pull up your account details. Could you provide your account number?";
    }
    if (lower.includes("password") || lower.includes("login") || lower.includes("account")) {
      return "I can assist with your account access. I'll send a verification code to your registered email to reset your password.";
    }
    if (lower.includes("cancel") || lower.includes("stop") || lower.includes("end")) {
      return "I understand you'd like to discuss cancellation. Let me review your account options and any applicable fees.";
    }
    return "Thank you for that information. Could you provide more details so I can better assist you?";
  }

  // Timer
  useEffect(() => {
    if (!callActive) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callActive]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleMicClick = useCallback(async () => {
    if (!callActive) {
      if (!isSupported) {
        toast.error("Speech recognition is not supported in this browser. Please use Chrome.");
        return;
      }

      // Create conversation record
      try {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ language: selectedLanguage, status: "active", user_id: user?.id })
          .select("id")
          .single();
        if (error) throw error;
        setConversationId(data.id);
      } catch {
        toast.error("Failed to create conversation record");
      }

      setCallActive(true);
      setAiState("listening");
      setSeconds(0);
      setMessages([]);
      setInterimText("");
      msgCountRef.current = 0;
      startListening();
    }
  }, [callActive, isSupported, selectedLanguage, startListening]);

  const handleEndCall = useCallback(async () => {
    stopListening();
    setCallActive(false);
    setAiState("idle");
    setInterimText("");

    // Save conversation
    if (conversationId && messages.length > 0) {
      setIsSaving(true);
      try {
        const transcript = messages.map((m) => ({
          speaker: m.speaker,
          text: m.text,
          timestamp: m.timestamp,
        }));
        const { error } = await supabase
          .from("conversations")
          .update({
            transcript,
            duration_seconds: seconds,
            status: "completed",
          })
          .eq("id", conversationId);
        if (error) throw error;

        // Auto-summarize
        const { data, error: sumError } = await supabase.functions.invoke(
          "summarize-conversation",
          { body: { conversationId } }
        );
        if (sumError) console.error("Summary error:", sumError);
        else toast.success("Conversation saved & summarized!");
      } catch (e: any) {
        toast.error("Failed to save conversation");
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }

    setSeconds(0);
    setMessages([]);
    setConversationId(null);
  }, [stopListening, conversationId, messages, seconds]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative px-4">
      {/* Nav */}
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Agent Dashboard
        </Link>
        <Link
          to="/conversations"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          📝 Conversation History
        </Link>
      </div>

      {/* Timer */}
      {callActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className="font-mono text-sm">{formatTime(seconds)}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* AI Avatar */}
        <div className="animate-float">
          <AIAvatar state={aiState} size="lg" />
        </div>

        {/* Status */}
        <StatusBadge status={aiState} />

        {/* Language selector */}
        {!callActive && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Processing dots */}
        {aiState === "processing" && (
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-thinking-1" />
            <div className="h-2 w-2 rounded-full bg-primary animate-thinking-2" />
            <div className="h-2 w-2 rounded-full bg-primary animate-thinking-3" />
          </div>
        )}

        {/* Waveform */}
        <VoiceWaveform active={aiState === "listening" || aiState === "speaking"} variant="large" />

        {/* Mic button */}
        <div className="relative">
          {callActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
              <div
                className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
          <button
            onClick={handleMicClick}
            disabled={callActive}
            className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              callActive
                ? "bg-primary shadow-[0_0_30px_hsl(217,91%,60%,0.4)]"
                : "bg-card border-2 border-border hover:border-primary hover:shadow-[0_0_20px_hsl(217,91%,60%,0.2)]"
            }`}
          >
            <Mic
              className={`h-8 w-8 ${callActive ? "text-primary-foreground" : "text-muted-foreground"}`}
            />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {callActive
            ? `Listening in ${SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || selectedLanguage} — speak naturally`
            : "Select your language and tap the microphone to start"}
        </p>

        {/* Interim text */}
        {interimText && (
          <div className="w-full rounded-lg bg-card/50 border border-border/30 p-3 animate-fade-in">
            <p className="text-sm text-muted-foreground italic">🎙️ {interimText}...</p>
          </div>
        )}

        {/* Transcript */}
        {messages.length > 0 && (
          <div className="w-full rounded-lg bg-card border border-border/50 p-4 max-h-48 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-[10px] font-bold ${
                      msg.speaker === "ai" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {msg.speaker === "ai" ? "AI" : "You"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-foreground">{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {callActive && (
          <div className="flex gap-3 animate-fade-in">
            <Button variant="destructive" onClick={handleEndCall} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneOff className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "End Call"}
            </Button>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Connect to Human
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
