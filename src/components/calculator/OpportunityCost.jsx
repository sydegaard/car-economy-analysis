import { formatKR } from "@/hooks/useCalculations";

function StatCard({ label, value, variant = 'default' }) {
  const colorClass =
    variant === 'danger' ? 'text-destructive' :
    variant === 'warning' ? 'text-[hsl(var(--warning))]' :
    variant === 'success' ? 'text-[hsl(var(--neon-green))]' :
    'text-primary';

  return (
    <div className="bg-secondary/50 rounded-xl p-5 border border-border/50">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className={`font-mono text-xl font-bold ${colorClass}`} aria-live="polite">
        {value}
      </p>
    </div>
  );
}

export default function OpportunityCost({ data, løpetid }) {
  const { lostPerYear, lostTotal, bufferAfterPurchase, monthlyPercent } = data;

  const bufferVariant = bufferAfterPurchase < 50000 ? 'danger' : 'success';
  const percentVariant = monthlyPercent > 15 ? 'danger' : monthlyPercent > 10 ? 'warning' : 'success';

  return (
    <section aria-labelledby="opportunity-heading" className="mt-10">
      <h2 id="opportunity-heading" className="text-lg font-bold text-foreground mb-6 tracking-tight">
        Alternativkostnad ved kontantbetaling
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tapt avkastning per år" value={formatKR(lostPerYear)} />
        <StatCard label={`Tapt avkastning over ${løpetid} år`} value={formatKR(lostTotal)} />
        <StatCard label="Buffer etter kjøp" value={formatKR(bufferAfterPurchase)} variant={bufferVariant} />
        <StatCard label="Månedskostnad i % av inntekt" value={`${monthlyPercent.toFixed(1)}%`} variant={percentVariant} />
      </div>
    </section>
  );
}
