import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Terminal, Key, Phone, BookOpen, Webhook, AlertCircle, BookMarked, Copy, Check } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const NAVY_DEEP = "#0f1b3d";
const NAVY_MID = "#1e3a5f";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

const sections = [
  { id: "intro", label: "Introduction", icon: BookMarked },
  { id: "quickstart", label: "Quickstart", icon: Terminal },
  { id: "auth", label: "Authentication", icon: Key },
  { id: "calls", label: "Voice calls", icon: Phone },
  { id: "knowledge", label: "Knowledge base", icon: BookOpen },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "errors", label: "Errors", icon: AlertCircle },
];

const Code = ({ children, lang = "bash" }: { children: string; lang?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <div
      className="rounded-xl border overflow-hidden my-4 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.6)]"
      style={{ borderColor: `${NAVY_ACCENT}33`, backgroundColor: NAVY_DEEP }}
    >
      <div
        className="px-4 py-2 border-b flex items-center justify-between"
        style={{ borderColor: `${NAVY_ACCENT}33`, backgroundColor: `${NAVY_MID}80` }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#febc2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#28c840" }} />
          </div>
          <span
            className="ml-2 text-[10px] uppercase tracking-widest font-mono"
            style={{ color: NAVY_ACCENT }}
          >
            {lang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] uppercase tracking-wider font-mono transition-colors"
          style={{
            color: copied ? "#28c840" : `${PAPER}AA`,
            backgroundColor: `${NAVY_DEEP}`,
            border: `1px solid ${NAVY_ACCENT}33`,
          }}
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 text-xs overflow-x-auto font-mono leading-relaxed" style={{ color: PAPER }}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

const Docs = () => {
  const [active, setActive] = useState("intro");
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: NAVY_DEEP, color: PAPER }}>
      <Helmet>
        <title>Developer Documentation — AudientAssist API</title>
        <meta name="description" content="REST API docs for AudientAssist: authenticate, place bilingual calls, manage your knowledge base, and consume webhooks." />
        <link rel="canonical" href="https://audient-assist-pro.lovable.app/docs" />
      </Helmet>
      <MarketingNav />

      {/* Header bento */}
      <section className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="md:col-span-2 rounded-3xl p-8 md:p-12 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}4D` }}
          >
            <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
              Developer
            </div>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-5">
              The AudientAssist <span className="italic" style={{ color: NAVY_ACCENT }}>API</span>.
            </h1>
            <p className="max-w-xl text-base leading-relaxed mb-6" style={{ color: `${PAPER}CC` }}>
              Embed Alex into any product: trigger outbound calls, stream live transcripts,
              ground responses in your knowledge base, and subscribe to lifecycle webhooks.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs"
              style={{ backgroundColor: NAVY_DEEP, color: PAPER, border: `1px solid ${NAVY_ACCENT}33` }}
            >
              <span style={{ color: NAVY_ACCENT }}>BASE</span>
              https://api.audientassist.dev/v1
            </div>
          </div>
          <div
            className="rounded-3xl p-7 border flex flex-col justify-between"
            style={{ backgroundColor: NAVY_DEEP, borderColor: NAVY_MID }}
          >
            <div className="text-[11px] uppercase tracking-widest" style={{ color: NAVY_ACCENT }}>
              SDK availability
            </div>
            <div className="space-y-2">
              {["Node.js · npm i @audient/sdk", "Python · pip install audient", "Go · github.com/audient/go", "cURL · always"].map((l) => (
                <div key={l} className="text-sm font-mono" style={{ color: `${PAPER}CC` }}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Docs body */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-8 grid md:grid-cols-[240px_1fr] gap-10">
        <aside className="md:sticky md:top-24 self-start">
          <p
            className="text-[11px] uppercase tracking-widest font-semibold mb-3"
            style={{ color: NAVY_ACCENT }}
          >
            Reference
          </p>
          <nav className="flex flex-col gap-1">
            {sections.map((s) => {
              const isActive = active === s.id;
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  className="px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2.5"
                  style={{
                    backgroundColor: isActive ? `${NAVY_ACCENT}33` : "transparent",
                    color: isActive ? PAPER : `${PAPER}99`,
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-12">
          <section
            id="intro"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Introduction</h2>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}CC` }}>
              The AudientAssist REST API is built around predictable, resource-oriented URLs,
              JSON request bodies, and standard HTTP response codes. Every request must be
              authenticated with an API key + secret pair issued from your dashboard.
            </p>
          </section>

          <section
            id="quickstart"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Quickstart</h2>
            <ol className="space-y-2 text-sm pl-1" style={{ color: `${PAPER}CC` }}>
              <li>
                1. Create an account and visit your{" "}
                <Link to="/dashboard/api-keys" className="underline" style={{ color: NAVY_ACCENT }}>
                  API keys
                </Link>{" "}
                page.
              </li>
              <li>2. Generate a key + secret pair. The secret is shown once — store it safely.</li>
              <li>3. Trigger your first bilingual outbound call:</li>
            </ol>
            <Code lang="cURL">{`curl https://api.audientassist.dev/v1/calls \\
  -H "X-Api-Key: ak_live_..." \\
  -H "X-Api-Secret: sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+254712345678",
    "language": "auto",
    "knowledge_base_id": "kb_acme_support",
    "voice": "alex-warm"
  }'`}</Code>
          </section>

          <section
            id="auth"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Authentication</h2>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}CC` }}>
              All endpoints require two headers. Treat the secret like a password —
              never embed it in client code, mobile bundles, or browser JavaScript.
            </p>
            <Code lang="HTTP">{`X-Api-Key:    ak_live_a1b2c3d4
X-Api-Secret: sk_8f3e2c1b9a7d6e5f`}</Code>
          </section>

          <section
            id="calls"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Voice calls</h2>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}CC` }}>
              Trigger outbound calls, list active sessions, or fetch transcripts after the call ends.
            </p>
            <Code lang="POST /v1/calls">{`{
  "to": "+254712345678",
  "language": "auto",        // "en-US" | "sw-KE" | "auto"
  "knowledge_base_id": "kb_123",
  "voice": "alex-warm",
  "metadata": { "ticket_id": "T-998", "channel": "billing" }
}`}</Code>
            <Code lang="200 OK">{`{
  "id": "call_01HQ...",
  "status": "ringing",
  "language_detected": null,
  "stream_url": "wss://stream.audientassist.dev/call_01HQ..."
}`}</Code>
          </section>

          <section
            id="knowledge"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Knowledge base</h2>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}CC` }}>
              Upload PDFs, Word docs, or plain text. Alex chunks, embeds, and grounds every answer
              in your documents — and refuses to invent answers it cannot cite.
            </p>
            <Code lang="POST /v1/knowledge">{`Content-Type: multipart/form-data

file=@faq.pdf
name=Customer FAQ v3
language=en`}</Code>
          </section>

          <section
            id="webhooks"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Webhooks</h2>
            <p className="text-sm leading-relaxed" style={{ color: `${PAPER}CC` }}>
              Subscribe to lifecycle events: <code style={{ color: NAVY_ACCENT }}>call.started</code>,
              {" "}<code style={{ color: NAVY_ACCENT }}>call.transcribed</code>,
              {" "}<code style={{ color: NAVY_ACCENT }}>call.escalated</code>,
              {" "}<code style={{ color: NAVY_ACCENT }}>call.completed</code>.
            </p>
            <Code lang="POST your-endpoint">{`{
  "event": "call.completed",
  "call_id": "call_01HQ...",
  "duration_seconds": 142,
  "languages_used": ["sw-KE", "en-US"],
  "summary": "Caller requested account balance...",
  "transcript_url": "https://api.audientassist.dev/v1/calls/call_01HQ.../transcript"
}`}</Code>
          </section>

          <section
            id="errors"
            className="rounded-2xl p-8 border"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
          >
            <h2 className="font-serif text-3xl mb-3">Errors</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["401", "Invalid or missing credentials"],
                ["402", "Out of voice minutes"],
                ["404", "Resource not found"],
                ["429", "Rate limit exceeded"],
                ["422", "Validation error"],
                ["500", "Internal server error"],
              ].map(([code, msg]) => (
                <div
                  key={code}
                  className="flex items-baseline gap-3 p-4 rounded-xl"
                  style={{ backgroundColor: NAVY_DEEP, border: `1px solid ${NAVY_ACCENT}33` }}
                >
                  <span className="font-serif text-xl" style={{ color: NAVY_ACCENT }}>{code}</span>
                  <span className="text-sm" style={{ color: `${PAPER}CC` }}>{msg}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <MarketingFooter />
    </div>
  );
};

export default Docs;