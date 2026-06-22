import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const NAVY_DEEP = "#0f1b3d";
const NAVY_MID = "#1e3a5f";
const NAVY_ACCENT = "#3b6fa0";
const PAPER = "#e8edf3";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Pilot Alex on a single inbound line.",
    features: [
      "100 voice minutes / month",
      "English only",
      "1 knowledge base (10 docs)",
      "Community support",
      "Browser-based demo line",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$249",
    period: "/ month",
    desc: "For growing support teams in East Africa.",
    features: [
      "5,000 voice minutes / month",
      "Bilingual English + Swahili",
      "Unlimited knowledge base documents",
      "Africa's Talking inbound + outbound",
      "Live transcripts & call summaries",
      "Webhooks + REST API",
      "Email support, 1 business-day SLA",
    ],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "annual",
    desc: "Multi-tenant deployments and regulated workloads.",
    features: [
      "Unlimited minutes & numbers",
      "Custom voice & persona",
      "Multi-tenant + RBAC",
      "Dedicated routing + human handoff",
      "VPC / on-prem telephony bridge",
      "Audit logs & data residency",
      "24/7 priority support + named CSM",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

const addons = [
  { name: "Extra 1,000 minutes", price: "$39" },
  { name: "Additional language pack", price: "$99 / mo" },
  { name: "Premium custom voice", price: "$499 one-time" },
  { name: "Dedicated number (KE / TZ / UG)", price: "$15 / mo" },
];

const faqs = [
  {
    q: "How are minutes measured?",
    a: "We bill the live call duration rounded up to the nearest second. Silent listening and outbound dial attempts are not counted.",
  },
  {
    q: "Can Alex switch languages mid-call?",
    a: "Yes. On Pro and Enterprise, Alex detects the caller's language per utterance and responds in kind — including code-mixed Swahili and English.",
  },
  {
    q: "Where is call data stored?",
    a: "All transcripts, recordings, and summaries are encrypted at rest in the region closest to your tenant. Enterprise customers can pin residency.",
  },
  {
    q: "Do you offer volume discounts?",
    a: "Yes, tiered automatically above 25,000 minutes per month, with bespoke pricing for committed annual deals.",
  },
];

const Pricing = () => (
  <div className="min-h-screen font-sans" style={{ backgroundColor: NAVY_DEEP, color: PAPER }}>
    <Helmet>
      <title>Pricing — AudientAssist enterprise voice AI</title>
      <meta name="description" content="Transparent pricing for AudientAssist: a free starter line, a $249/mo Pro plan with bilingual support, and custom enterprise deployments." />
      <link rel="canonical" href="https://audient-assist-pro.lovable.app/pricing" />
    </Helmet>
    <MarketingNav />
    <main className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-16">
      {/* Header bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div
          className="md:col-span-2 rounded-3xl p-8 md:p-12 border"
          style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}4D` }}
        >
          <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
            Pricing
          </div>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] mb-5">
            Pay for the <span className="italic" style={{ color: NAVY_ACCENT }}>minutes</span>, not the seats.
          </h1>
          <p className="max-w-xl text-base leading-relaxed" style={{ color: `${PAPER}CC` }}>
            One predictable monthly platform fee, transparent overage per minute, no per-agent licensing.
            Cancel anytime — your data and call transcripts remain yours.
          </p>
        </div>
        <div
          className="rounded-3xl p-7 border flex flex-col justify-between"
          style={{ backgroundColor: NAVY_DEEP, borderColor: NAVY_MID }}
        >
          <Sparkles className="h-6 w-6" style={{ color: NAVY_ACCENT }} />
          <div>
            <div className="font-serif text-4xl mb-1">14-day</div>
            <p className="text-sm" style={{ color: `${PAPER}99` }}>
              Free Pro trial. No credit card required. Up to 500 minutes included.
            </p>
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="grid gap-4 md:grid-cols-3 mb-16">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="rounded-3xl border p-8 flex flex-col relative overflow-hidden"
            style={{
              backgroundColor: t.highlight ? NAVY_MID : NAVY_DEEP,
              borderColor: t.highlight ? NAVY_ACCENT : `${NAVY_ACCENT}33`,
              boxShadow: t.highlight ? `0 30px 60px -20px ${NAVY_ACCENT}66` : "none",
            }}
          >
            {t.highlight && (
              <span
                className="self-start mb-4 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: NAVY_ACCENT, color: "white" }}
              >
                Most popular
              </span>
            )}
            <h2 className="font-serif text-3xl">{t.name}</h2>
            <p className="text-sm mt-1" style={{ color: `${PAPER}99` }}>{t.desc}</p>
            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="font-serif text-5xl">{t.price}</span>
              <span className="text-sm" style={{ color: `${PAPER}80` }}>{t.period}</span>
            </div>
            <div className="h-px my-6" style={{ backgroundColor: `${NAVY_ACCENT}33` }} />
            <ul className="space-y-3 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: NAVY_ACCENT }} />
                  <span style={{ color: `${PAPER}E6` }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className="mt-8 px-5 py-3 rounded-xl font-semibold text-center transition-all hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              style={{
                backgroundColor: t.highlight ? NAVY_ACCENT : "transparent",
                color: t.highlight ? "white" : PAPER,
                border: t.highlight ? "none" : `1px solid ${NAVY_ACCENT}80`,
              }}
            >
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      {/* Add-ons */}
      <section className="mb-16">
        <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
          Add-ons
        </div>
        <h2 className="font-serif text-3xl md:text-4xl mb-8">Scale exactly what you need.</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {addons.map((a) => (
            <div
              key={a.name}
              className="rounded-2xl p-6 border flex flex-col justify-between"
              style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
            >
              <p className="text-sm" style={{ color: `${PAPER}CC` }}>{a.name}</p>
              <p className="font-serif text-2xl mt-4" style={{ color: PAPER }}>{a.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <div className="text-[11px] uppercase tracking-widest mb-3" style={{ color: NAVY_ACCENT }}>
          Common questions
        </div>
        <h2 className="font-serif text-3xl md:text-4xl mb-8">Pricing, plainly.</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: NAVY_MID, borderColor: `${NAVY_ACCENT}33` }}
            >
              <h3 className="font-serif text-xl mb-2">{f.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: `${PAPER}99` }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: PAPER, color: NAVY_DEEP }}
      >
        <div>
          <h3 className="font-serif text-3xl md:text-4xl mb-2">Need volume or VPC?</h3>
          <p className="text-sm opacity-70">Custom quotes for 25k+ minutes, regulated industries, and private deployments.</p>
        </div>
        <Link
          to="/docs"
          className="px-7 py-3.5 rounded-xl font-semibold text-white inline-flex items-center gap-2"
          style={{ backgroundColor: NAVY_DEEP }}
        >
          Talk to sales <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
    <MarketingFooter />
  </div>
);

export default Pricing;