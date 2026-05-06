import { Link } from "react-router-dom";
import { ArrowRight, Phone, Globe, Zap, Shield, Code2, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const features = [
  { icon: Phone, title: "Phone + browser calls", desc: "Africa's Talking telephony and in-browser voice — same agent, anywhere." },
  { icon: Zap, title: "Sub-500ms response", desc: "Streaming TTS and barge-in make Alex feel like a real person, not a script." },
  { icon: Globe, title: "Multilingual", desc: "English, Swahili, French, Arabic, and more — auto-detected from the caller." },
  { icon: Shield, title: "Your knowledge base", desc: "Upload PDFs, docs, FAQs. Alex grounds every answer in your data." },
  { icon: Code2, title: "Developer API", desc: "REST API with key + secret pairs. Wire Alex into any product in minutes." },
  { icon: Headphones, title: "Human handoff", desc: "Escalate to a real agent when intent is complex or sentiment dips." },
];

const Home = () => (
  <div className="min-h-screen bg-background">
    <MarketingNav />
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_50%)]" />
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            New: streaming voice + barge-in
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Customer care that <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">sounds human</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            VoiceAI gives you a 24/7 phone agent your customers can actually have a conversation with.
            Real-time voice, your knowledge base, your brand.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">Start free <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/app">Try the agent</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free tier included</p>
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