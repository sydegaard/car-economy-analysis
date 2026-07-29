import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { formatKR } from "@/hooks/useCalculations";

// Theme-derived palette. Cyan/magenta/purple are the categorical series colours;
// green/red are reserved status colours (best/worst). Multi-series lines also use
// distinct dash styles (secondary encoding) so identity never rests on colour alone.
const C = {
  cyan: "#25e2f4",
  magenta: "#eb47b4",
  purple: "#9952e0",
  green: "#2fd98a",
  red: "#e5484d",
  grid: "rgba(255,255,255,0.08)",
  axis: "rgba(255,255,255,0.45)",
};

const kompakt = (v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

const tooltipStyle = {
  background: "#181920",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#e8eaf0",
  fontSize: 12,
};

function ChartCard({ title, hint, children }) {
  return (
    <div className="bg-secondary/40 rounded-xl p-4 md:p-5 border border-border/50">
      <h3 className="text-xs font-semibold text-foreground uppercase tracking-widest mb-1">{title}</h3>
      {hint && <p className="text-xs text-muted-foreground mb-3">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function CostCharts({ yearlySeries, wealthSeries, costSplit, scenarios, bestKey, worstKey, monthlyDrift, leasingpris }) {
  const [open, setOpen] = useState(true);

  // Total cost per scenario (bars).
  const compareData = Object.entries(scenarios)
    .filter(([, s]) => s.totalCost != null)
    .map(([key, s]) => ({ key, navn: s.short, total: Math.round(s.totalCost) }));

  // Fixed vs variable split (donut).
  const splitData = [
    { name: "Fast (verditap + renter + gebyr)", value: costSplit.fast, color: C.cyan },
    { name: "Variabel (drift)", value: costSplit.variabel, color: C.purple },
  ];

  // Monthly "car budget" — financing + running cost, for cash / best loan / leasing.
  const bestLoan = bestKey ? scenarios[bestKey] : null;
  const budgetData = [
    { navn: "Kontant", finansiering: 0, drift: Math.round(monthlyDrift) },
    { navn: bestLoan?.short || "Beste lån", finansiering: Math.round(bestLoan?.monthly || 0), drift: Math.round(monthlyDrift) },
    { navn: "Leasing", finansiering: Math.round(leasingpris || 0), drift: Math.round(monthlyDrift) },
  ];

  const money = (v, n) => [formatKR(v), n];

  return (
    <section aria-labelledby="charts-heading" className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="charts-body"
        className="w-full flex items-center justify-between gap-3 mb-6 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
      >
        <h2 id="charts-heading" className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
          Visuell oversikt
        </h2>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform group-hover:text-primary ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
      <div id="charts-body" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Cumulative cost over time */}
        <ChartCard title="Kostnadsutvikling over tid" hint="Kumulativ total kostnad per år — kontant vs. beste lån vs. leasing.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={yearlySeries} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="år" tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: C.grid }} unit=" år" />
              <YAxis tickFormatter={kompakt} tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={money} labelFormatter={(l) => `År ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="kontant" name="Kontant" stroke={C.cyan} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="lån" name="Beste lån" stroke={C.magenta} strokeWidth={2} strokeDasharray="6 4" dot={false} />
              <Line type="monotone" dataKey="leasing" name="Leasing" stroke={C.purple} strokeWidth={2} strokeDasharray="2 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Wealth over time */}
        <ChartCard title="Formuesutvikling" hint="Netto formue (sparing vokser + bilverdi − gjeld) — kontant vs. beste lån.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={wealthSeries} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="år" tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: C.grid }} unit=" år" />
              <YAxis tickFormatter={kompakt} tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={money} labelFormatter={(l) => `År ${l}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="kontant" name="Kontant" stroke={C.cyan} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="lån" name="Beste lån" stroke={C.magenta} strokeWidth={2} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Fixed vs variable */}
        <ChartCard title="Fast vs. variabel kostnad" hint="Fordeling for beste lån over eierperioden.">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={splitData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} stroke="none">
                {splitData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={money} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Comparison across scenarios */}
        <ChartCard title="Total kostnad per scenario" hint="Alle finansieringsløsninger i én oversikt (grønt = billigst, rødt = dyrest).">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={compareData} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={C.grid} horizontal={false} />
              <XAxis type="number" tickFormatter={kompakt} tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="navn" tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={70} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatKR(v), "Total kostnad"]} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                {compareData.map((d) => (
                  <Cell key={d.key} fill={d.key === bestKey ? C.green : d.key === worstKey ? C.red : C.cyan} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Monthly car budget */}
        <ChartCard title="Månedlig bilbudsjett" hint="Typisk måned: lån/leie + driftskostnader." >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={budgetData} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="navn" tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={{ stroke: C.grid }} />
              <YAxis tickFormatter={kompakt} tick={{ fill: C.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={tooltipStyle} formatter={money} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="finansiering" name="Lån/leie" stackId="b" fill={C.cyan} radius={[0, 0, 0, 0]} />
              <Bar dataKey="drift" name="Driftskostnad" stackId="b" fill={C.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      )}
    </section>
  );
}
