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
      className="mt-10 relative overflow-hidden rounded-2xl"
    >
      {/* Gradient background with cyberpunk glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-cyan))] via-[hsl(var(--neon-magenta))]/60 to-[hsl(var(--neon-cyan))]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_100%)]" />

      <div className="relative z-10 p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm mb-5">
          <Icon className="w-7 h-7 text-white" aria-hidden="true" />
        </div>
        <h3
          id="conclusion-heading"
          className="text-xs font-bold uppercase tracking-[0.25em] text-white/70 mb-3"
        >
          Konklusjon
        </h3>
        <p className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight" aria-live="polite">
          {conclusion.title}
        </p>
        <p className="text-white/85 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
          {conclusion.detail}
        </p>
      </div>
    </section>
  );
}
