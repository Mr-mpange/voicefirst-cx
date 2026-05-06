import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For trying things out",
    features: ["100 voice minutes / mo", "1 API key", "Browser calls", "Community support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    desc: "For growing teams",
    features: ["2,000 voice minutes / mo", "Unlimited API keys", "Phone + browser", "Knowledge base", "Email support"],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$199",
    period: "/ month",
    desc: "For high-volume support",
    features: ["10,000 voice minutes", "Custom voices", "Multi-tenant", "Human handoff", "Priority support"],
    cta: "Contact sales",
    highlight: false,
  },
];

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <MarketingNav />
    <main className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-bold">Simple, transparent pricing</h1>
        <p className="mt-3 text-muted-foreground">Pay for the minutes you use. Cancel any time.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-2xl border p-7 flex flex-col ${
              t.highlight
                ? "border-primary bg-gradient-to-b from-primary/10 to-card/40 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
                : "border-border/50 bg-card/40"
            }`}
          >
            {t.highlight && (
              <span className="self-start mb-3 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Most popular
              </span>
            )}
            <h3 className="font-bold text-xl">{t.name}</h3>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{t.price}</span>
              <span className="text-muted-foreground text-sm">{t.period}</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-7" variant={t.highlight ? "default" : "outline"}>
              <Link to="/auth">{t.cta}</Link>
            </Button>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-10">
        Custom volume pricing available for enterprise. <Link to="/docs" className="underline">See docs</Link>.
      </p>
    </main>
    <MarketingFooter />
  </div>
);

export default Pricing;