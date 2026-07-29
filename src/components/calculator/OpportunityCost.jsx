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

const bandVariant = { 3: 'danger', 5: 'default', 7: 'success' };

export default function OpportunityCost({ data, løpetid }) {
  const { lostPerYear, lostTotal, lostTotalLinear, lostTotalCompound, bufferAfterPurchase, monthlyPercent, returnBands, equityAlternatives } = data;

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
        <StatCard label="Buffer hvis du betaler kontant" value={formatKR(bufferAfterPurchase)} variant={bufferVariant} />
        <StatCard label="Lånekostnad i % av inntekt" value={`${monthlyPercent.toFixed(1)}%`} variant={percentVariant} />
      </div>

      <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest mt-8 mb-4">
        Risiko: tapt avkastning ved ulik utvikling (over {løpetid} år)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {returnBands?.map((b) => (
          <StatCard
            key={b.pct}
            label={`${b.label} · ${b.pct}%`}
            value={formatKR(b.lostTotal)}
            variant={bandVariant[b.pct] ?? 'default'}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mt-3">
        Avkastning er usikker. Ved lav avkastning taper du lite på å binde opp egenkapitalen
        (kontant lønner seg), ved høy avkastning taper du mer (lån lønner seg).
      </p>

      <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-widest mt-8 mb-4">
        Hva egenkapitalen kunne gitt i stedet (rentes-rente, over {løpetid} år)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {equityAlternatives?.map((a) => (
          <StatCard
            key={a.key}
            label={a.label}
            value={formatKR(a.gain)}
            variant={a.key === 'fond' ? 'success' : a.key === 'bolig' ? 'warning' : 'default'}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mt-3">
        Tallene over viser hva egenkapitalen alene kunne vokst til (brutto). I selve valget lån vs. kontant
        er det den frigjorte kapitalen som teller: med rentes-rente og etter skatt blir tapt gevinst
        {" "}<span className="font-mono text-foreground">{formatKR(lostTotalCompound)}</span> — høyere enn en enkel
        lineær beregning ({formatKR(lostTotalLinear)}) fordi avkastningen reinvesteres.
        Nedbetaling av boliglån er en «risikofri» sammenligning lik boliglånsrenten.
      </p>
    </section>
  );
}
