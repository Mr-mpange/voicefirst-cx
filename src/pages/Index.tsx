import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Mic, PhoneOff, UserPlus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import AIAvatar from "@/components/voice/AIAvatar";
import VoiceWaveform from "@/components/voice/VoiceWaveform";
import StatusBadge from "@/components/dashboard/StatusBadge";
import type { AIState, TranscriptMessage } from "@/lib/mockData";

const simulatedTranscript: Omit<TranscriptMessage, "id">[] = [
  { speaker: "customer", text: "Hi, I need help with my account billing.", timestamp: "" },
  { speaker: "ai", text: "Of course! I'd be happy to help with your billing. Could you tell me your account number?", timestamp: "" },
  { speaker: "customer", text: "Sure, it's AC-2847391.", timestamp: "" },
  { speaker: "ai", text: "Thank you! I can see your account. Your current balance is $47.99 due on March 15th. Would you like more details?", timestamp: "" },
];

const Index = () => {
  const [aiState, setAiState] = useState<AIState>("idle");
  const [callActive, setCallActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [msgIndex, setMsgIndex] = useState(0);

  // Timer
  useEffect(() => {
    if (!callActive) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callActive]);

  // State machine simulation
  useEffect(() => {
    if (!callActive || msgIndex >= simulatedTranscript.length) return;

    const cycle = () => {
      const msg = simulatedTranscript[msgIndex];
      if (!msg) return;

      if (msg.speaker === "customer") {
        setAiState("listening");
        setTimeout(() => {
          const now = new Date();
          const ts = now.toLocaleTimeString();
          setMessages((prev) => [...prev, { ...msg, id: `m${msgIndex}`, timestamp: ts }]);
          setAiState("processing");
          setTimeout(() => {
            setMsgIndex((i) => i + 1);
          }, 1500);
        }, 2500);
      } else {
        setAiState("speaking");
        setTimeout(() => {
          const now = new Date();
          const ts = now.toLocaleTimeString();
          setMessages((prev) => [...prev, { ...msg, id: `m${msgIndex}`, timestamp: ts }]);
          setTimeout(() => {
            setAiState("listening");
            setMsgIndex((i) => i + 1);
          }, 1000);
        }, 2000);
      }
    };

    const timeout = setTimeout(cycle, 1500);
    return () => clearTimeout(timeout);
  }, [callActive, msgIndex]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleMicClick = useCallback(() => {
    if (!callActive) {
      setCallActive(true);
      setAiState("listening");
      setSeconds(0);
      setMessages([]);
      setMsgIndex(0);
    }
  }, [callActive]);

  const handleEndCall = useCallback(() => {
    setCallActive(false);
    setAiState("idle");
    setSeconds(0);
    setMessages([]);
    setMsgIndex(0);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative px-4">
      {/* Nav to dashboard */}
      <Link
        to="/dashboard"
        className="absolute top-4 left-4 text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        ← Agent Dashboard
      </Link>

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
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
            </>
          )}
          <button
            onClick={handleMicClick}
            className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              callActive
                ? "bg-primary shadow-[0_0_30px_hsl(217,91%,60%,0.4)]"
                : "bg-card border-2 border-border hover:border-primary hover:shadow-[0_0_20px_hsl(217,91%,60%,0.2)]"
            }`}
          >
            <Mic className={`h-8 w-8 ${callActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {callActive ? "AI is active — speak naturally" : "Tap the microphone to start"}
        </p>

        {/* Transcript */}
        {messages.length > 0 && (
          <div className="w-full rounded-lg bg-card border border-border/50 p-4 max-h-48 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                <div className="flex items-baseline gap-2">
                  <span className={`text-[10px] font-bold ${msg.speaker === "ai" ? "text-primary" : "text-muted-foreground"}`}>
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
            <Button variant="destructive" onClick={handleEndCall} className="gap-2">
              <PhoneOff className="h-4 w-4" />
              End Call
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
