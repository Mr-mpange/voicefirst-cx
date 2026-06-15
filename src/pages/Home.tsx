import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Phone, Globe, Zap, Shield, Code2, Headphones,
  Mic, Brain, MessageSquare, CheckCircle2, Sparkles, PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import PhoneSimulator from "@/components/marketing/PhoneSimulator";
import heroImg from "@/assets/hero-voiceai.jpg";

const features = [
  { icon: Phone, title: "Phone + browser calls", desc: "Africa's Talking telephony and in-browser voice — same agent, anywhere." },
  { icon: Zap, title: "Sub-500ms response", desc: "Streaming TTS and barge-in make Alex feel like a real person, not a script." },
  { icon: Globe, title: "Multilingual", desc: "English, Swahili, French, Arabic, and more — auto-detected from the caller." },
  { icon: Shield, title: "Your knowledge base", desc: "Upload PDFs, docs, FAQs. Alex grounds every answer in your data." },
  { icon: Code2, title: "Developer API", desc: "REST API with key + secret pairs. Wire Alex into any product in minutes." },
  { icon: Headphones, title: "Human handoff", desc: "Escalate to a real agent when intent is complex or sentiment dips." },
];

const steps = [
  { icon: Mic, title: "Customer calls", desc: "A caller dials your number or hits the in-browser widget. Alex picks up instantly — no IVR maze." },
  { icon: Brain, title: "Alex understands", desc: "Real-time speech-to-text in 30+ languages, intent detection, and grounding in your knowledge base." },
  { icon: MessageSquare, title: "Alex responds", desc: "Streaming TTS with barge-in. Customers can interrupt, change topic, ask follow-ups — naturally." },
  { icon: CheckCircle2, title: "You get the summary", desc: "Every call is transcribed, summarized, and pushed to your CRM via webhook or REST API." },
];

const integrations = [
  { name: "Africa's Talking", desc: "Telephony for African markets" },
  { name: "Briq", desc: "SMS & messaging across Africa" },
];

const trustLogos = [
  { name: "Africa's Talking", src: "https://logo.clearbit.com/africastalking.com" },
  { name: "Briq", src: "https://logo.clearbit.com/briq.tz" },
];

const integrationLogos: Record<string, string> = {
  "Africa's Talking": "https://logo.clearbit.com/africastalking.com",
  "Briq": "https://logo.clearbit.com/briq.tz",
};

const Home = () => (
  <div className="min-h-screen bg-background">
    <Helmet>
      <title>VoiceAI — Human-like AI phone agents for customer care</title>
      <meta name="description" content="Deploy realistic 24/7 AI voice agents for customer support that understand 30+ languages and integrate with your knowledge base." />
      <link rel="canonical" href="https://audient-assist-pro.lovable.app/" />
      <meta property="og:title" content="VoiceAI — AI Phone Agents That Sound Human" />
      <meta property="og:description" content="Deploy realistic 24/7 AI voice agents for customer support that understand 30+ languages and integrate with your knowledge base." />
      <meta property="og:url" content="https://audient-assist-pro.lovable.app/" />
      <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"SoftwareApplication","name":"VoiceAI","applicationCategory":"BusinessApplication","operatingSystem":"Web","description":"Human-like AI phone agents for customer care with multilingual support and knowledge-base grounding.","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}})}</script>
    </Helmet>
    <MarketingNav />
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 grid lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-primary" />
              New: streaming voice + barge-in · 30+ languages
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              Customer care that{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-primary/40 bg-clip-text text-transparent">
                sounds human
              </span>
              , answers in seconds.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Stop losing customers to hold music. VoiceAI is a 24/7 phone agent that understands
              accents, remembers context, and resolves issues — at a fraction of the cost of a call
              center. Plug in your knowledge base and go live in under 10 minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">Start free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/app"><PlayCircle className="h-4 w-4" /> Try the agent live</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-start text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> 100 free minutes</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> SOC 2 ready</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full -z-10" />
            <img
              src={heroImg}
              alt="VoiceAI dashboard with live voice waveform"
              width={1536}
              height={1024}
              className="rounded-2xl border border-border/60 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Logos / trust */}
      <section className="border-y border-border/40 bg-card/20">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Trusted by teams using</span>
          {trustLogos.map((l) => (
            <div key={l.name} className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <img
                src={l.src}
                alt={`${l.name} logo`}
                width={28}
                height={28}
                loading="lazy"
                className="h-7 w-7 rounded-md bg-white/90 p-1 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="font-semibold text-sm text-foreground/80">{l.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Built for real conversations</h2>
          <p className="mt-2 text-muted-foreground">Everything you need to deploy a production voice agent.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border/50 bg-card/40 p-6 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works + Phone simulator */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 scroll-mt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">How it works</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">From dial tone to resolved — in 4 steps.</h2>
            <p className="mt-3 text-muted-foreground">Watch a live demo on the right. This is exactly what your customers hear.</p>
            <ol className="mt-8 space-y-5">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <s.icon className="h-4 w-4 text-primary" /> {s.title}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="flex justify-center">
            <PhoneSimulator />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-6xl px-4 py-20 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Integrations</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Plays nicely with your stack</h2>
          <p className="mt-2 text-muted-foreground">Native connectors for telephony, AI providers, payments, and CRMs.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {integrations.map((it) => (
            <div key={it.name} className="rounded-xl border border-border/50 bg-card/40 p-6 flex items-center gap-4 hover:border-primary/40 transition-colors">
              <img
                src={integrationLogos[it.name]}
                alt={`${it.name} logo`}
                width={48}
                height={48}
                loading="lazy"
                className="h-12 w-12 rounded-lg bg-white p-2 object-contain shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="text-left">
                <div className="font-semibold">{it.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{it.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/docs">Browse the API docs <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-transparent p-10 text-center">
          <h2 className="text-3xl font-bold">Ready to deploy your voice agent?</h2>
          <p className="mt-2 text-muted-foreground">Build it once, scale to thousands of calls.</p>
          <Button asChild size="lg" className="mt-6 gap-2">
            <Link to="/auth">Get your API key <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
    <MarketingFooter />
  </div>
);

export default Home;