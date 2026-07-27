import { CheckCircle, TrendingUp, Scale } from "lucide-react";

const icons = {
  cash: CheckCircle,
  loan: TrendingUp,
  mixed: Scale,
};

export default function ConclusionBox({ conclusion }) {
  const Icon = icons[conclusion.type] || Scale;

  return (
    <section
      aria-labelledby="conclusion-heading"
      className="mt-10 rounded-2xl bg-primary text-primary-foreground p-8 md:p-12 text-left min-[615px]:text-center"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black/10 mb-6">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3
        id="conclusion-heading"
        className="text-xs font-bold uppercase tracking-[0.25em] text-primary-foreground/70 mb-4"
      >
        Konklusjon
      </h3>
      <p className="text-2xl md:text-3xl font-extrabold mb-5 leading-snug" aria-live="polite">
        {conclusion.title}
      </p>
      <p className="text-primary-foreground/80 max-w-2xl min-[615px]:mx-auto leading-relaxed text-sm md:text-base">
        {conclusion.detail}
      </p>
    </section>
  );
}
