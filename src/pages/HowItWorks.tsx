import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  PhoneCall, Brain, MessageSquare, FileText, ArrowRight, Sparkles,
  Headphones, Database, ShieldCheck, Languages, Activity, Zap,
} from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import PhoneSimulator from "@/components/marketing/PhoneSimulator";

const NAVY_DEEP = "#0f1b3d";
const NAVY_MID = "#1e3a5f";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

const pipeline = [
  {
    n: "01",
    icon: PhoneCall,
    title: "Inbound call lands",
    desc: "An Africa's Talking SIP trunk routes the call to AudientAssist within 80 ms. Alex picks up before the second ring.",
  },
  {
    n: "02",
    icon: Languages,
    title: "Language detected per utterance",
    desc: "Streaming ASR identifies English, Swahili, or code-mixed speech in real time — accent-tolerant for East African voices.",
  },
  {
    n: "03",
    icon: Brain,
    title: "Grounded reasoning",
    desc: "The intent is matched against your knowledge base. Alex retrieves the exact passage, cites it internally, and refuses to invent.",
  },
  {
    n: "04",
    icon: MessageSquare,
    title: "Natural reply, sub-second",
    desc: "ElevenLabs streams the spoken response while the next sentence is still being generated — no robotic pauses.",
  },
  {
    n: "05",
    icon: FileText,
    title: "Auto-summary + handoff",
    desc: "The moment the line drops, Alex writes a structured summary, fires your webhook, and (if needed) escalates to a human.",
  },
];

const guarantees = [
  { icon: Activity, label: "p95 latency", value: "740 ms" },
  { icon: ShieldCheck, label: "Uptime (90d)", value: "99.95%" },
  { icon: Languages, label: "Languages", value: "EN + SW" },
  { icon: Zap, label: "Time to deploy", value: "< 1 day" },
];

const HowItWorks = () => (
  <div className="min-h-screen font-sans" style={{ backgroundColor: NAVY_DEEP, color: PAPER }}>
    <Helmet>
      <title>How AudientAssist works — bilingual voice AI pipeline</title>
      <meta
        name="description"
        content="See exactly how Alex answers inbound calls in English and Swahili: telephony, streaming ASR, grounded reasoning, ElevenLabs TTS, and auto-summary."
      />
      <link rel="canonical" href="https://audient-assist-pro.lovable.app/how-it-works" />
    </Helmet>
    <MarketingNav />

    <main className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-12">
      {/* Hero bento with phone simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-16">
        <div
          className="lg:col-span-7 rounded-3xl p-8 md:p-12 border flex flex-col justify-between relative overflow-hidden"
          style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}4D` }}
        >
          <div className="relative z-10">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium tracking-widest uppercase mb-6"
              style={{ backgroundColor: `${NAVY_ACCENT}33`, borderColor: `${NAVY_ACCENT}66`, color: PAPER }}
            >
              <Sparkles className="h-3 w-3" /> How it works
            </span>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-5">
              A live call, <span className="italic" style={{ color: NAVY_ACCENT }}>broken open</span>.
            </h1>
            <p className="max-w-xl text-base leading-relaxed" style={{ color: `${PAPER}CC` }}>
              Watch a real inbound call to Alex. Caller starts in Swahili, switches to English, asks for an
              account statement — the entire round-trip takes under a second per turn.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-10 relative z-10">
            {guarantees.map((g) => (
              <div
                key={g.label}
                className="rounded-xl p-4 border flex items-center gap-3"
                style={{ backgroundColor: NAVY_DEEP, borderColor: `${NAVY_ACCENT}33` }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${NAVY_ACCENT}33` }}
                >
                  <g.icon className="h-4 w-4" style={{ color: NAVY_ACCENT }} />
                </div>
                <div className="min-w-0">
                  <div className="font-serif text-lg leading-tight">{g.value}</div>
                  <div className="text-[10px] uppercase tracking-widest" style={{ color: `${PAPER}80` }}>
                    {g.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            aria-hidden
            className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: `${NAVY_ACCENT}1A` }}
          />
        </div>

        {/* Phone simulator cell */}
        <div
          className="lg:col-span-5 rounded-3xl p-6 md:p-10 border flex items-center justify-center"
          style={{ backgroundColor: NAVY_DEEP, borderColor: NAVY_MID }}
        >
          <PhoneSimulator />
        </div>
      </section>

      {/* Pipeline bento */}
      <section className="mb-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
              The pipeline
            </div>
            <h2 className="font-serif text-4xl md:text-5xl max-w-2xl leading-tight">
              From dial tone to summary — under one second per turn.
            </h2>
          </div>
          <p className="max-w-md text-sm" style={{ color: `${PAPER}99` }}>
            Five stages run in parallel streams, not in serial blocks. Alex starts speaking before
            the LLM has finished reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {pipeline.map((step, idx) => (
            <div
              key={step.n}
              className={`rounded-2xl border p-7 ${
                idx === 0 ? "lg:col-span-2" : idx === 4 ? "lg:col-span-2" : "lg:col-span-2"
              }`}
              style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${NAVY_ACCENT}33` }}
                >
                  <step.icon className="h-5 w-5" style={{ color: NAVY_ACCENT }} />
                </div>
                <span className="font-serif text-2xl" style={{ color: NAVY_ACCENT }}>{step.n}</span>
              </div>
              <h3 className="font-serif text-xl mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture strip */}
      <section className="mb-16">
        <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
          Architecture
        </div>
        <h2 className="font-serif text-3xl md:text-4xl mb-8 max-w-2xl">Built on the boring stack on purpose.</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-2xl p-7 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <Headphones className="h-6 w-6 mb-4" style={{ color: NAVY_ACCENT }} />
            <h3 className="font-serif text-2xl mb-2">Voice layer</h3>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>
              Africa's Talking SIP trunks for inbound + outbound, Web Speech API for browser demos,
              ElevenLabs streaming TTS with a Web Audio fallback.
            </p>
          </div>
          <div
            className="rounded-2xl p-7 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <Database className="h-6 w-6 mb-4" style={{ color: NAVY_ACCENT }} />
            <h3 className="font-serif text-2xl mb-2">Knowledge layer</h3>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>
              Documents are chunked, embedded, and stored with pgvector. Retrieval cites the exact
              passage; Alex refuses to answer if no citation crosses the confidence floor.
            </p>
          </div>
          <div
            className="rounded-2xl p-7 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <ShieldCheck className="h-6 w-6 mb-4" style={{ color: NAVY_ACCENT }} />
            <h3 className="font-serif text-2xl mb-2">Governance layer</h3>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>
              Row-level security per tenant, encrypted transcripts, scoped API keys with per-tenant
              rate limits, audit logs, and configurable retention windows.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: PAPER, color: NAVY_DEEP }}
      >
        <div className="flex-1">
          <h3 className="font-serif text-3xl md:text-4xl mb-2">See Alex on your numbers.</h3>
          <p className="text-sm opacity-70 max-w-xl">
            Spin up a sandbox tenant, point a test number at it, and watch the transcripts roll in.
            No card required for the first 500 minutes.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/auth"
            className="px-7 py-3.5 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: NAVY_DEEP }}
          >
            Deploy Alex <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/docs"
            className="px-7 py-3.5 rounded-xl font-semibold border inline-flex items-center justify-center gap-2"
            style={{ borderColor: `${NAVY_DEEP}33`, color: NAVY_DEEP }}
          >
            Read the API docs
          </Link>
        </div>
      </section>
    </main>
    <MarketingFooter />
  </div>
);

export default HowItWorks;