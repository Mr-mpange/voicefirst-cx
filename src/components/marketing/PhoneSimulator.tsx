import { useEffect, useState } from "react";
import { Phone, PhoneOff, Mic, Volume2 } from "lucide-react";

const NAVY_DEEP = "#0f1b3d";
const NAVY_MID = "#1e3a5f";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

type Line = { from: "ai" | "user"; text: string; lang: "EN" | "SW" };

const script: Line[] = [
  { from: "ai", text: "Habari, hii ni Alex kutoka AudientAssist. Nikusaidie vipi leo?", lang: "SW" },
  { from: "user", text: "Nataka kujua salio la akaunti yangu, tafadhali.", lang: "SW" },
  { from: "ai", text: "Of course — switching to English. Your current balance is KSh 12,480 as of this morning.", lang: "EN" },
  { from: "user", text: "Can you send the statement to my email?", lang: "EN" },
  { from: "ai", text: "Tayari. The statement is on its way to john@globalconnect.co.ke.", lang: "EN" },
];

const PhoneSimulator = () => {
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (script.length + 2)), 2400);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const visible = script.slice(0, Math.min(step, script.length));
  const typing = step > 0 && step < script.length;

  return (
    <div
      className="relative mx-auto w-[300px] h-[600px] rounded-[3rem] p-2 shadow-2xl"
      style={{
        backgroundColor: "#000",
        boxShadow: `0 40px 90px -20px ${NAVY_DEEP}, 0 0 0 1px ${NAVY_ACCENT}33`,
      }}
    >
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-28 rounded-full z-10"
        style={{ backgroundColor: "#000" }}
      />
      <div
        className="h-full w-full rounded-[2.4rem] overflow-hidden flex flex-col font-sans"
        style={{ backgroundColor: NAVY_DEEP, color: PAPER }}
      >
        {/* Status bar */}
        <div
          className="px-6 pt-12 pb-5 text-center border-b"
          style={{ borderColor: `${NAVY_ACCENT}33`, backgroundColor: NAVY_MID }}
        >
          <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-widest" style={{ color: `${PAPER}99` }}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            In call · Inbound
          </div>
          <div className="mt-1 font-serif text-lg">Alex</div>
          <div className="text-[11px]" style={{ color: `${PAPER}80` }}>
            +254 7XX XXX 421
          </div>
          <div
            className="mt-2 inline-block font-mono text-xs px-2 py-0.5 rounded-md"
            style={{ backgroundColor: `${NAVY_ACCENT}33`, color: PAPER }}
          >
            {mm}:{ss}
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-hidden p-3 space-y-2 text-sm">
          {visible.map((m, i) => (
            <div key={i} className={`flex ${m.from === "ai" ? "justify-start" : "justify-end"}`}>
              <div
                className="max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed animate-in fade-in slide-in-from-bottom-1"
                style={{
                  backgroundColor: m.from === "ai" ? `${NAVY_ACCENT}33` : NAVY_MID,
                  color: PAPER,
                  borderBottomLeftRadius: m.from === "ai" ? "0.25rem" : undefined,
                  borderBottomRightRadius: m.from === "user" ? "0.25rem" : undefined,
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="text-[9px] px-1 py-px rounded font-semibold tracking-wider"
                    style={{ backgroundColor: `${NAVY_DEEP}99`, color: NAVY_ACCENT }}
                  >
                    {m.lang}
                  </span>
                </div>
                {m.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-1 px-3 pt-1">
              <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ backgroundColor: NAVY_ACCENT }} />
              <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.15s]" style={{ backgroundColor: NAVY_ACCENT }} />
              <span className="h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.3s]" style={{ backgroundColor: NAVY_ACCENT }} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          className="p-4 flex items-center justify-around border-t"
          style={{ borderColor: `${NAVY_ACCENT}33`, backgroundColor: NAVY_MID }}
        >
          <button
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: NAVY_DEEP, color: PAPER }}
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            className="h-14 w-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "#dc2626", color: "white" }}
          >
            <PhoneOff className="h-5 w-5" />
          </button>
          <button
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: NAVY_DEEP, color: PAPER }}
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneSimulator;