import { CheckCircle, TrendingUp, Scale, Repeat, AlertTriangle } from "lucide-react";

const icons = {
  cash: CheckCircle,
  loan: TrendingUp,
  mixed: Scale,
  lease: Repeat,
};

export default function RecommendationBox({ recommendation }) {
  if (!recommendation) return null;
  const Icon = icons[recommendation.type] || Scale;

  return (
    <section aria-labelledby="recommendation-heading" className="mt-10">
      <div className="bg-card rounded-2xl border border-border/50 border-l-4 border-l-primary p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/15 text-primary shrink-0">
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="recommendation-heading" className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Anbefaling for deg
            </h2>
            <p className="text-xl md:text-2xl font-extrabold text-foreground leading-tight mb-3" aria-live="polite">
              {recommendation.headline}
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {recommendation.rationale}
            </p>

            {recommendation.caveats?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--warning))] mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" /> Men vær oppmerksom på
                </p>
                <ul className="space-y-2">
                  {recommendation.caveats.map((c, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-[hsl(var(--warning))] mt-0.5 shrink-0" aria-hidden="true">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
