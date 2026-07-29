import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { compareLeaseVsOwn, formatKR } from "@/hooks/useCalculations";

const C = { cyan: "#25e2f4", magenta: "#eb47b4", grid: "rgba(255,255,255,0.08)", axis: "rgba(255,255,255,0.45)" };
const kompakt = (v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);
const tooltipStyle = { background: "#181920", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#e8eaf0", fontSize: 12 };

function Stat({ label, value, variant = "default", badge }) {
  const color =
    variant === "success" ? "text-[hsl(var(--neon-green))]" :
    variant === "danger" ? "text-destructive" :
    variant === "warning" ? "text-[hsl(var(--warning))]" : "text-primary";
  return (
    <div className="bg-secondary/50 rounded-xl p-5 border border-border/50">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
        {label}
        {badge && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/15 text-[hsl(var(--neon-green))] text-[10px] font-bold uppercase tracking-wider">
            {badge}
          </span>
        )}
      </p>
      <p className={`font-mono text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function LeaseVsOwn({ bilPris, egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning, leasingpris, innskudd, kjørelengde, rate, rateLabel }) {
  const [horisont, setHorisont] = useState(8);

  const r = compareLeaseVsOwn({
    bilPris, egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning, leasingpris, innskudd,
    rate, horisont, kjørelengde,
  });

  const ownCheaper = r.diff > 0; // owning cheaper net over the horizon

  return (
    <section aria-labelledby="leasevown-heading" className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 id="leasevown-heading" className="text-lg font-bold text-foreground tracking-tight">
          Leasing vs. eie over tid
        </h2>
        <div className="inline-flex rounded-lg border border-border/60 overflow-hidden" role="group" aria-label="Sammenligningshorisont">
          {[8, 10].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorisont(h)}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${horisont === h ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              {h} år
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Stat label={`Eie — netto over ${horisont} år`} value={formatKR(r.own.net)} variant={ownCheaper ? "success" : "default"} badge={ownCheaper ? "Best" : undefined} />
          <Stat label={`Leasing — netto over ${horisont} år`} value={formatKR(r.lease.net)} variant={!ownCheaper ? "success" : "default"} badge={!ownCheaper ? "Best" : undefined} />
          <Stat label="Du eier til slutt (restverdi)" value={`${formatKR(r.residual)} vs 0 kr`} variant="warning" />
          <Stat label={ownCheaper ? "Eie er billigere" : "Leasing er billigere"} value={formatKR(Math.abs(r.diff))} variant={ownCheaper ? "success" : "default"} />
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={r.series} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid stroke={C.grid} vertical={false} />
            <XAxis dataKey="år" tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: C.grid }} unit=" år" />
            <YAxis tickFormatter={kompakt} tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [formatKR(v), n]} labelFormatter={(l) => `År ${l}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="eie" name="Eie" stroke={C.cyan} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="leasing" name="Leasing" stroke={C.magenta} strokeWidth={2} strokeDasharray="6 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            Basert på beste lån ({rateLabel}). Ved eie betaler du renter i låneperioden og taper verdi,
            men sitter igjen med en bil verdt <span className="font-mono text-foreground">{formatKR(r.residual)}</span> etter {horisont} år.
            Ved leasing (og ny leasing) eier du <span className="text-foreground font-semibold">ingenting</span> til slutt.
          </p>
          <p>
            <span className="text-foreground font-semibold">Restverdirisiko:</span> ved leasing bærer leasingselskapet
            risikoen for bilens restverdi — men du betaler for den gjennom leien.
          </p>
          {r.kmWarning && (
            <p className="text-[hsl(var(--warning))]">
              ⚠️ Kjørelengden din ({kjørelengde.toLocaleString("nb-NO")} km/år) overstiger typisk leasing km-tak (~15 000 km/år) —
              regn med tilleggskostnad for overkjørte km ved leasing.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
