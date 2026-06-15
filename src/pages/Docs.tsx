import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const sections = [
  { id: "intro", label: "Introduction" },
  { id: "quickstart", label: "Quickstart" },
  { id: "auth", label: "Authentication" },
  { id: "calls", label: "Voice calls" },
  { id: "knowledge", label: "Knowledge base" },
  { id: "webhooks", label: "Webhooks" },
  { id: "errors", label: "Errors" },
];

const Code = ({ children }: { children: string }) => (
  <pre className="rounded-lg border border-border/50 bg-card/60 p-4 text-xs overflow-x-auto font-mono">
    <code>{children}</code>
  </pre>
);

const Docs = () => {
  const [active, setActive] = useState("intro");
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[200px_1fr] gap-10">
        <aside className="md:sticky md:top-20 self-start">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Docs</p>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                className={`px-2 py-1.5 text-sm rounded-md transition-colors ${
                  active === s.id ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="prose prose-invert max-w-none space-y-12">
          <section id="intro">
            <h1 className="text-3xl font-bold mb-2">VoiceAI Developer Docs</h1>
            <p className="text-muted-foreground">
              The VoiceAI REST API lets you embed a realistic voice agent into any product.
              Base URL: <code className="bg-card px-1.5 py-0.5 rounded text-xs">https://api.voiceai.dev/v1</code>
            </p>
          </section>

          <section id="quickstart">
            <h2 className="text-2xl font-semibold mb-3">Quickstart</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Create an account and visit your <Link to="/dashboard/api-keys" className="text-primary underline">API keys</Link> page.</li>
              <li>Generate a key + secret pair. Copy the secret immediately — it's shown once.</li>
              <li>Make your first call:</li>
            </ol>
            <div className="mt-4">
              <Code>{`curl https://api.voiceai.dev/v1/calls \\
  -H "X-Api-Key: vk_live_..." \\
  -H "X-Api-Secret: sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"to":"+254700000000","language":"sw-KE"}'`}</Code>
            </div>
          </section>

          <section id="auth">
            <h2 className="text-2xl font-semibold mb-3">Authentication</h2>
            <p className="text-sm text-muted-foreground mb-3">
              All API requests require two headers: <code className="bg-card px-1 rounded">X-Api-Key</code> (the public prefix) and{" "}
              <code className="bg-card px-1 rounded">X-Api-Secret</code> (the secret you copied at creation).
              Never expose the secret in client-side code.
            </p>
            <Code>{`X-Api-Key: vk_live_a1b2c3d4
X-Api-Secret: sk_8f3e2c1b9a7d6e5f`}</Code>
          </section>

          <section id="calls">
            <h2 className="text-2xl font-semibold mb-3">Voice calls</h2>
            <p className="text-sm text-muted-foreground mb-3">Trigger an outbound call with the agent:</p>
            <Code>{`POST /v1/calls
{
  "to": "+254700000000",
  "language": "en-US",
  "knowledge_base_id": "kb_123",
  "metadata": { "ticket_id": "T-998" }
}`}</Code>
          </section>

          <section id="knowledge">
            <h2 className="text-2xl font-semibold mb-3">Knowledge base</h2>
            <p className="text-sm text-muted-foreground mb-3">Upload PDFs or text and the agent grounds answers in your data.</p>
            <Code>{`POST /v1/knowledge
Content-Type: multipart/form-data

file=@faq.pdf`}</Code>
          </section>

          <section id="webhooks">
            <h2 className="text-2xl font-semibold mb-3">Webhooks</h2>
            <p className="text-sm text-muted-foreground mb-3">Get notified when calls finish, are escalated, or transcribed.</p>
            <Code>{`{
  "event": "call.completed",
  "call_id": "call_abc",
  "duration_seconds": 142,
  "transcript_url": "https://..."
}`}</Code>
          </section>

          <section id="errors">
            <h2 className="text-2xl font-semibold mb-3">Errors</h2>
            <p className="text-sm text-muted-foreground">Standard HTTP codes. <code className="bg-card px-1 rounded">401</code> invalid auth, <code className="bg-card px-1 rounded">402</code> out of credits, <code className="bg-card px-1 rounded">429</code> rate limited.</p>
          </section>
        </main>
      </div>
      <MarketingFooter />
    </div>
  );
};

export default Docs;