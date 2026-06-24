import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  icon?: LucideIcon;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Shared bento-style page header used across every authenticated route.
 * Keeps typography (Instrument Serif headline + italic accent + Work Sans body)
 * and the navy gradient surface consistent with the Dashboard hero.
 */
const PageHero = ({ eyebrow, title, accent, description, icon: Icon, meta, actions }: PageHeroProps) => {
  return (
    <Card className="relative overflow-hidden border-border/60 mb-6 p-6 md:p-8 bg-gradient-to-br from-primary/10 via-card/70 to-card/40">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.25),transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
            {Icon && <Icon className="h-3 w-3" />}
            {eyebrow}
          </div>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl leading-[1.05] text-foreground">
            {title} <span className="italic text-primary">{accent}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
            {description}
          </p>
          {meta && <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </Card>
  );
};

export default PageHero;