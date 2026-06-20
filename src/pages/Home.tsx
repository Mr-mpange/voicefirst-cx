import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, Phone, Globe, Shield, Code2, BookOpen,
  CheckCircle2, BarChart3, Lock, Zap, PlayCircle, Quote,
} from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

// Navy Trust palette (locked design tokens for the marketing page)
const NAVY_DEEP = "#0f1b3d";
const NAVY_MID = "#1e3a5f";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

const features = [
  {
    icon: Globe,
    title: "Native bilingual fluency",
    desc: "Alex switches between English and Swahili mid-call without losing context, accents, or intent.",
  },
  {
    icon: BookOpen,
    title: "Grounded in your knowledge",
    desc: "Upload PDFs, FAQs, and policies. Every answer cites your documents — never hallucinated.",
  },
  {
    icon: Phone,
    title: "Africa's Talking telephony",
    desc: "Production-ready inbound and outbound voice across Kenya, Tanzania, Uganda, and Rwanda.",
  },
  {
    icon: BarChart3,
    title: "Admin analytics",
    desc: "Real-time call volume, resolution rate, language mix, and average duration in one console.",
  },
  {
    icon: Code2,
    title: "Developer API",
    desc: "Issue scoped API keys with per-tenant rate limits. REST + webhooks. SDKs for Node and Python.",
  },
  {
    icon: Lock,
    title: "Compliance-ready",
    desc: "Row-level security, encrypted transcripts, audit logs, and configurable data retention.",
  },
];

const steps = [
  { n: "01", title: "Connect your number", desc: "Point an Africa's Talking line at AudientAssist or use a managed test number." },
  { n: "02", title: "Train on your documents", desc: "Drop in product PDFs, policies, and FAQs. Alex indexes them in minutes." },
  { n: "03", title: "Go live, monitor everything", desc: "Watch live transcripts, sentiment, and resolution in the admin console." },
];

const Home = () => (
  <div className="min-h-screen font-sans text-[#e8edf3]" style={{ backgroundColor: NAVY_DEEP }}>
    <Helmet>
      <title>AudientAssist — Enterprise voice AI for inbound customer support</title>
      <meta name="description" content="Alex is an enterprise voice assistant that handles inbound calls in English and Swahili, grounded in your knowledge base, with admin analytics and a developer API." />
      <link rel="canonical" href="https://audient-assist-pro.lovable.app/" />
      <meta property="og:title" content="AudientAssist — Enterprise voice AI for inbound support" />
      <meta property="og:description" content="Bilingual (English + Swahili) voice assistant grounded in your knowledge base, with analytics, API, and Africa's Talking telephony." />
      <meta property="og:url" content="https://audient-assist-pro.lovable.app/" />
      <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"SoftwareApplication","name":"AudientAssist","applicationCategory":"BusinessApplication","operatingSystem":"Web","description":"Bilingual voice assistant for inbound customer support with knowledge-base grounding, analytics, and developer API.","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}})}</script>
    </Helmet>
    <MarketingNav />
    <main>
      {/* Hero bento */}
      <section className="px-4 md:px-8 lg:px-12 pt-10 pb-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Hero cell */}
          <div
            className="md:col-span-4 lg:col-span-4 md:row-span-2 rounded-3xl p-8 md:p-12 flex flex-col justify-between border shadow-2xl relative overflow-hidden animate-fade-in"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}4D` }}
          >
            <div className="relative z-10">
              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-medium tracking-widest uppercase mb-6"
                style={{ backgroundColor: `${NAVY_ACCENT}33`, borderColor: `${NAVY_ACCENT}66`, color: PAPER }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Enterprise Voice AI
              </span>
              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] mb-6">
                Meet Alex.{" "}
                <span className="italic" style={{ color: NAVY_ACCENT }}>Intelligent</span>{" "}
                inbound support.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed" style={{ color: `${PAPER}CC` }}>
                An enterprise voice assistant for English and Swahili. Alex answers your inbound calls,
                grounds every response in your documents, and writes the summary before the line is even dead.
              </p>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-4 relative z-10">
              <Link
                to="/auth"
                className="px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
                style={{ backgroundColor: NAVY_ACCENT, boxShadow: `0 12px 30px -10px ${NAVY_DEEP}` }}
              >
                Deploy Alex
              </Link>
              <Link
                to="/app"
                className="px-7 py-3.5 rounded-xl font-semibold border transition-all inline-flex items-center gap-2"
                style={{ borderColor: `${NAVY_ACCENT}80`, color: PAPER }}
              >
                <PlayCircle className="h-4 w-4" /> View live demo
              </Link>
            </div>
            <div
              aria-hidden
              className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full blur-3xl"
              style={{ backgroundColor: `${NAVY_ACCENT}1A` }}
            />
          </div>

          {/* Bilingual cell */}
          <div
            className="md:col-span-2 lg:col-span-2 rounded-3xl p-8 flex flex-col justify-center items-center text-center border"
            style={{ backgroundColor: NAVY_DEEP, borderColor: NAVY_MID }}
          >
            <div className="flex gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                style={{ backgroundColor: NAVY_ACCENT }}
              >EN</div>
              <div
                className="w-12 h-12 rounded-full border flex items-center justify-center font-semibold"
                style={{ borderColor: NAVY_ACCENT, color: PAPER }}
              >SW</div>
            </div>
            <h3 className="font-serif text-2xl mb-2">Native fluency</h3>
            <p className="text-sm" style={{ color: `${PAPER}99` }}>
              Real-time switching between English and Swahili — accents, idioms, and code-mixing handled gracefully.
            </p>
          </div>

          {/* Accuracy / metric cell */}
          <div
            className="md:col-span-2 lg:col-span-2 rounded-3xl p-8 border flex flex-col justify-center"
            style={{ backgroundColor: `${NAVY_MID}66`, borderColor: `${NAVY_ACCENT}33` }}
          >
            <div className="flex justify-between items-end mb-4">
              <div className="font-serif text-5xl">98.4%</div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: NAVY_ACCENT }}>
                Intent accuracy
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: NAVY_DEEP }}>
              <div className="h-full" style={{ width: "98%", backgroundColor: NAVY_ACCENT }} />
            </div>
            <p className="mt-4 text-sm" style={{ color: `${PAPER}99` }}>
              Benchmarked on 12,400 production calls across telecom, fintech, and healthcare workloads.
            </p>
          </div>

          {/* Integration cell */}
          <div
            className="md:col-span-2 lg:col-span-1 rounded-3xl p-6 border flex flex-col justify-between"
            style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}4D` }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${NAVY_ACCENT}33` }}
            >
              <Zap className="w-5 h-5" style={{ color: NAVY_ACCENT }} />
            </div>
            <div>
              <h4 className="font-medium">Instant sync</h4>
              <p className="text-xs mt-0.5" style={{ color: `${PAPER}99` }}>CRM, ERP, & webhook ready.</p>
            </div>
          </div>

          {/* Live status cell */}
          <div
            className="md:col-span-2 lg:col-span-1 rounded-3xl p-6 border flex flex-col justify-between"
            style={{ backgroundColor: NAVY_DEEP, borderColor: NAVY_MID }}
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: NAVY_ACCENT, borderColor: NAVY_DEEP }} />
              <div className="w-8 h-8 rounded-full border-2" style={{ backgroundColor: NAVY_MID, borderColor: NAVY_DEEP }} />
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] bg-slate-500" style={{ borderColor: NAVY_DEEP }}>
                +12
              </div>
            </div>
            <div>
              <h4 className="font-medium">Live now</h4>
              <p className="text-xs text-green-400 mt-0.5">1,402 calls active</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="h-px" style={{ backgroundColor: `${NAVY_ACCENT}26` }} />
      </div>

      {/* Capabilities bento */}
      <section className="px-4 md:px-8 lg:px-12 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
                Capabilities
              </div>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight max-w-2xl">
                A production stack, not a chatbot demo.
              </h2>
            </div>
            <p className="max-w-md text-sm" style={{ color: `${PAPER}99` }}>
              Every surface customers and operators need — voice, knowledge, analytics, governance — in one console.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-7 border transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${NAVY_ACCENT}33` }}
                >
                  <f.icon className="h-5 w-5" style={{ color: NAVY_ACCENT }} />
                </div>
                <h3 className="font-serif text-2xl mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="h-px" style={{ backgroundColor: `${NAVY_ACCENT}26` }} />
      </div>

      {/* How it works */}
      <section className="px-4 md:px-8 lg:px-12 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
            How it works
          </div>
          <h2 className="font-serif text-4xl md:text-5xl mb-10 max-w-2xl">From dial tone to deployed in an afternoon.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl p-8 border"
                style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
              >
                <div className="font-serif text-3xl mb-4" style={{ color: NAVY_ACCENT }}>{s.n}</div>
                <h3 className="font-serif text-2xl mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / closing bento */}
      <section className="px-4 md:px-8 lg:px-12 py-16">
        <div className="mx-auto max-w-7xl">
          <div
            className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8"
            style={{ backgroundColor: PAPER, color: NAVY_DEEP }}
          >
            <div className="flex-1">
              <Quote className="h-8 w-8 mb-4" style={{ color: NAVY_ACCENT }} />
              <p className="font-serif text-2xl md:text-3xl leading-snug max-w-3xl">
                AudientAssist cut our first-response time from four minutes to nine seconds and handled
                40% of our East Africa support volume in the first quarter — in both English and Swahili.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full" style={{ backgroundColor: NAVY_DEEP }} />
                <div>
                  <p className="font-semibold">David Okoro</p>
                  <p className="text-sm opacity-70">CTO, Global Connect</p>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
              <Link
                to="/auth"
                className="px-7 py-3.5 rounded-xl font-semibold text-white inline-flex items-center justify-center gap-2"
                style={{ backgroundColor: NAVY_DEEP }}
              >
                Get your API key <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pricing"
                className="px-7 py-3.5 rounded-xl font-semibold border inline-flex items-center justify-center gap-2"
                style={{ borderColor: `${NAVY_DEEP}33`, color: NAVY_DEEP }}
              >
                See pricing
              </Link>
            </div>
          </div>

          {/* trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs" style={{ color: `${PAPER}80` }}>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Row-level security on every tenant</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> 99.95% uptime over the last 90 days</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> Africa's Talking inbound + outbound</div>
            <div className="flex items-center gap-2"><Code2 className="h-4 w-4" /> REST API · webhooks · SDKs</div>
          </div>
        </div>
      </section>
    </main>
    <MarketingFooter />
  </div>
);

export default Home;