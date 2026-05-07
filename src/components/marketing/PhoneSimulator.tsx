import { useEffect, useState } from "react";
import { Phone, PhoneOff, Mic } from "lucide-react";

const script = [
  { from: "ai", text: "Hi, this is Alex from VoiceAI. How can I help you today?" },
  { from: "user", text: "Hey, I want to know my last invoice." },
  { from: "ai", text: "Sure — pulling that up. Your last invoice was $129 on May 2nd. Want me to email it?" },
  { from: "user", text: "Yes please." },
  { from: "ai", text: "Done. It's on the way to your inbox now." },
];

const PhoneSimulator = () => {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (script.length + 1)), 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="relative mx-auto w-[280px] h-[560px] rounded-[3rem] border-[10px] border-foreground/80 bg-background shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.4)]">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-foreground/80" />
      <div className="h-full w-full rounded-[2.2rem] overflow-hidden bg-gradient-to-b from-card to-background flex flex-col">
        <div className="px-5 pt-10 pb-4 text-center border-b border-border/40">
          <div className="text-xs text-muted-foreground">In call</div>
          <div className="text-base font-semibold">Alex · VoiceAI</div>
          <div className="mt-1 text-xs font-mono text-primary">{mm}:{ss}</div>
        </div>
        <div className="flex-1 overflow-hidden p-3 space-y-2 text-sm">
          {script.slice(0, step).map((m, i) => (
            <div key={i} className={`flex ${m.from === "ai" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-1 ${
                  m.from === "ai"
                    ? "bg-primary/15 text-foreground rounded-bl-sm"
                    : "bg-muted text-foreground rounded-br-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {step <= script.length && step > 0 && step < script.length && (
            <div className="flex gap-1 px-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
            </div>
          )}
        </div>
        <div className="p-4 flex items-center justify-around border-t border-border/40">
          <button className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <Mic className="h-4 w-4" />
          </button>
          <button className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
            <PhoneOff className="h-5 w-5" />
          </button>
          <button className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center">
            <Phone className="h-4 w-4 text-success" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneSimulator;