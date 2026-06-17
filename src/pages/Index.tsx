import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
import { playTTS } from "@/lib/tts";
import type { AIState, TranscriptMessage } from "@/lib/mockData";

// Map language codes to readable names for the AI prompt
function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang?.label ?? code;
}

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
  const isSpeakingRef = useRef(false);
  const chatHistoryRef = useRef<Array<{ role: string; content: string }>>([]);

  // Call the AI edge function
  const getAIReply = useCallback(
    async (type: "greeting" | "reply", userText?: string) => {
      if (type === "reply" && userText) {
        chatHistoryRef.current.push({ role: "user", content: userText });
      }

      try {
        const { data, error } = await supabase.functions.invoke("voice-chat", {
          body: {
            messages: chatHistoryRef.current,
            language: getLanguageName(selectedLanguage),
            type,
          },
        });

        if (error) throw error;

        const reply = data?.reply ?? "I'm sorry, could you repeat that?";
        chatHistoryRef.current.push({ role: "assistant", content: reply });
        return reply;
      } catch (e: any) {
        console.error("AI reply error:", e);
        if (e?.status === 429) {
          toast.error("AI rate limited — please wait a moment");
        } else if (e?.status === 402) {
          toast.error("AI credits exhausted");
        }
        return "I'm sorry, I'm having trouble right now. Could you repeat that?";
      }
    },
    [selectedLanguage]
  );

  // AI speaks a message. While speaking, the mic is OFF so Alex doesn't
  // hear and transcribe its own voice. Mic is restarted after speech ends.
  const aiSpeak = useCallback(async (text: string) => {
    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    setAiState("speaking");
    // Pause mic to prevent self-listening
    try { stopListening(); } catch { /* noop */ }

    const aiTs = new Date().toLocaleTimeString();
    const aiMsg: TranscriptMessage = {
      id: `m${msgCountRef.current++}`,
      speaker: "ai",
      text,
      timestamp: aiTs,
    };
    setMessages((prev) => [...prev, aiMsg]);

    try {
      await playTTS(text, selectedLanguage);
    } catch (e) {
      console.error("TTS playback failed:", e);
    }
    // Small grace period so the tail of the audio doesn't trigger the mic
    await new Promise((r) => setTimeout(r, 250));
    isSpeakingRef.current = false;
    setAiState("listening");
    try { startListening(); } catch { /* noop */ }
  }, [selectedLanguage]);

  const { isListening, isSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition({
      language: selectedLanguage,
      continuous: true,
      onResult: (text, isFinal) => {
        // Mic is muted while Alex speaks, so any result here is the user
        if (isSpeakingRef.current) return;
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

          getAIReply("reply", text).then((responseText) => {
            aiSpeak(responseText);
          });
        } else if (!isFinal) {
          setInterimText(text);
        }
      },
      onError: (error) => {
        toast.error(`Speech recognition error: ${error}`);
      },
    });

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
      setSeconds(0);
      setMessages([]);
      setInterimText("");
      msgCountRef.current = 0;
      chatHistoryRef.current = [];

      // AI greets first in the selected language, THEN starts listening
      const greeting = await getAIReply("greeting");
      await aiSpeak(greeting);
      startListening();
    }
  }, [callActive, isSupported, selectedLanguage, startListening, aiSpeak, getAIReply]);

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
      <Helmet>
        <title>Live AI Agent — Talk to Alex | VoiceAI</title>
        <meta name="description" content="Live VoiceAI agent interface. Pick a language, tap the mic, and have a real-time conversation with Alex, your AI phone agent." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://audient-assist-pro.lovable.app/app" />
        <meta property="og:title" content="Live AI Agent — Talk to Alex | VoiceAI" />
        <meta property="og:description" content="Real-time voice conversation with Alex, the VoiceAI agent." />
        <meta property="og:url" content="https://audient-assist-pro.lovable.app/app" />
      </Helmet>
      <h1 className="sr-only">Live AI Agent — Voice conversation with Alex</h1>
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
          Conversation History
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
            aria-label={callActive ? "End call with Alex" : "Start call with Alex"}
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

        {!callActive && (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Hi, I'm Alex</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pick your language and tap the mic to chat</p>
          </div>
        )}
        {callActive && (
          <p className="text-xs text-muted-foreground">
            Speaking {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || selectedLanguage} — just talk naturally
          </p>
        )}

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
                    {msg.speaker === "ai" ? "Alex" : "You"}
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
