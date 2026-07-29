import { useState } from "react";
import { Zap, ChevronDown, X } from "lucide-react";
import { formatKR, computeOwnership, totalRunningCost, FINANCING_OPTIONS } from "@/hooks/useCalculations";
import { EV_MODELS, carMidPrice, parseRangeKm } from "@/data/evModels";

const PLACEHOLDER_IMAGE = "/car-placeholder.svg";

function findModel(name) {
  const n = name.trim().toLowerCase();
  return EV_MODELS.find((m) => m.name.toLowerCase() === n) || null;
}

function CarHeader({ car, isBest }) {
  if (!car) return <span className="text-muted-foreground italic text-sm">Ingen bil valgt</span>;
  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={car.image}
        alt={car.name}
        loading="lazy"
        className="w-full h-24 object-cover rounded-lg"
        onError={(e) => {
          if (e.currentTarget.dataset.fallback) return;
          e.currentTarget.dataset.fallback = "1";
          e.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
      />
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-foreground text-center">{car.name}</span>
        {isBest && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/15 text-[hsl(var(--neon-green))] text-[10px] font-bold uppercase tracking-wider">
            Best
          </span>
        )}
      </div>
    </div>
  );
}

function FormToggle({ value, onChange, idPrefix }) {
  return (
    <div className="inline-flex rounded-lg border border-border/60 overflow-hidden self-start" role="group" aria-label="Finansieringsform">
      {[["loan", "Lån"], ["lease", "Leasing"]].map(([val, txt]) => (
        <button
          key={val}
          id={`${idPrefix}-${val}`}
          type="button"
          onClick={() => onChange(val)}
          className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${value === val ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
        >
          {txt}
        </button>
      ))}
    </div>
  );
}

const inputCls =
  "bg-secondary border border-border text-foreground text-base h-12 rounded-md px-3 w-full " +
  "focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all duration-200";

// Module-scope so React keeps the input mounted (no focus loss while typing).
function SearchField({ id, label, name, setName, form, setForm }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          id={id}
          list="ev-model-list"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Søk etter modell…"
          className={`${inputCls} pr-9`}
        />
        {name !== "" && (
          <button
            type="button"
            onClick={() => setName("")}
            aria-label="Tøm felt"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <FormToggle value={form} onChange={setForm} idPrefix={id} />
    </div>
  );
}

export default function CompareCars({ egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning, leasingpris, innskudd, bestKey }) {
  const defaultFinancing = FINANCING_OPTIONS.find((o) => o.key === bestKey)?.key || FINANCING_OPTIONS[0].key;

  const [open, setOpen] = useState(true);
  const [financingKey, setFinancingKey] = useState(defaultFinancing);
  const [nameA, setNameA] = useState(EV_MODELS[0].name);
  const [nameB, setNameB] = useState(EV_MODELS[1].name);
  const [formA, setFormA] = useState("loan");
  const [formB, setFormB] = useState("lease");

  const option = FINANCING_OPTIONS.find((o) => o.key === financingKey) || FINANCING_OPTIONS[0];

  // Compute one car's economics under its chosen financing form.
  const compute = (name, form) => {
    const car = findModel(name);
    if (!car) return null;
    const price = carMidPrice(car);
    const rangeKm = parseRangeKm(car);
    if (form === "lease") {
      const totalDrift = totalRunningCost(driftskostnader, løpetid, kostnadsøkning);
      const monthlyDrift = løpetid > 0 ? totalDrift / (løpetid * 12) : driftskostnader / 12;
      return {
        car, form, rangeKm,
        price: null,
        startleie: innskudd || 0,
        totalDepreciation: null,
        totalDrift,
        monthlyTotal: (leasingpris || 0) + monthlyDrift,
        totalCost: (innskudd || 0) + (leasingpris || 0) * 12 * løpetid + totalDrift,
      };
    }
    const e = computeOwnership(price, {
      egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning,
      rate: option.rate, fee: option.fee,
    });
    return { car, form, rangeKm, price, startleie: null, ...e };
  };

  const A = compute(nameA, formA);
  const B = compute(nameB, formB);

  const bestSide = A && B ? (A.totalCost <= B.totalCost ? "A" : "B") : null;
  const diff = A && B ? Math.abs(A.totalCost - B.totalCost) : null;
  const eier = `eierperiode, ${løpetid} år`;

  const cell = (v) => (v == null ? <span className="text-muted-foreground">—</span> : <span>{v}</span>);

  const rows = [
    {
      label: "Finansieringsform",
      render: (c) => c
        ? <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.form === "lease" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"}`}>{c.form === "lease" ? "Leasing" : "Lån"}</span>
        : cell(null),
    },
    { label: "Kjøpesum", render: (c) => cell(c && c.price != null ? formatKR(c.price) : null) },
    { label: "Rekkevidde", render: (c) => cell(c && c.rangeKm != null ? `${c.rangeKm} km` : null) },
    { label: "Startleie (innskudd)", render: (c) => cell(c && c.form === "lease" ? formatKR(c.startleie) : null) },
    {
      label: `Verditap (${eier})`,
      render: (c) => c && c.form === "lease"
        ? <span className="text-muted-foreground italic">Ikke eier</span>
        : cell(c ? formatKR(c.totalDepreciation) : null),
    },
    { label: "Driftskostnader (totalt)", render: (c) => cell(c ? formatKR(c.totalDrift) : null) },
    { label: "Total månedskostnad", highlight: true, render: (c) => cell(c ? formatKR(c.monthlyTotal) : null) },
    { label: `Total kostnad (${eier})`, emphasis: true, render: (c) => cell(c ? formatKR(c.totalCost) : null) },
  ];

  return (
    <section aria-labelledby="compare-heading" className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="compare-body"
        className="w-full flex items-center justify-between gap-3 mb-6 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
      >
        <h2 id="compare-heading" className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
          Sammenlign to elbiler
        </h2>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform group-hover:text-primary ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
      <div id="compare-body" className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SearchField id="compare-a" label="Bil A" name={nameA} setName={setNameA} form={formA} setForm={setFormA} />
          <SearchField id="compare-b" label="Bil B" name={nameB} setName={setNameB} form={formB} setForm={setFormB} />
        </div>
        <div className="flex flex-col gap-2 mb-6 max-w-xs">
          <label htmlFor="compare-financing" className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Lånetype (ved lån)
          </label>
          <select id="compare-financing" value={financingKey} onChange={(e) => setFinancingKey(e.target.value)} className={inputCls}>
            {FINANCING_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <datalist id="ev-model-list">
          {EV_MODELS.map((m) => <option key={m.name} value={m.name} />)}
        </datalist>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-secondary">
                <th scope="col" className="text-left p-4 font-semibold text-foreground text-xs uppercase tracking-widest min-w-[150px]">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Nøkkeltall</span>
                </th>
                <th scope="col" className="p-4 align-top w-1/2"><CarHeader car={A?.car} isBest={bestSide === "A"} /></th>
                <th scope="col" className="p-4 align-top w-1/2"><CarHeader car={B?.car} isBest={bestSide === "B"} /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowCls = row.emphasis
                  ? "border-t-2 border-primary/40 bg-primary/5 font-semibold"
                  : row.highlight
                    ? "bg-[hsl(var(--warning))]/[0.08] font-semibold"
                    : `border-t border-border/50 ${i % 2 === 0 ? "" : "bg-secondary/30"}`;
                const hlY = row.highlight ? "border-y-2 border-[hsl(var(--warning))]" : "";
                return (
                  <tr key={row.label} className={`${rowCls} transition-colors hover:bg-secondary/60`}>
                    <td className={`p-4 font-semibold text-xs uppercase tracking-wider ${hlY} ${row.highlight ? "border-l-2 text-[hsl(var(--warning))]" : row.emphasis ? "text-foreground" : "text-foreground/80"}`}>
                      {row.label}
                    </td>
                    <td className={`p-4 text-right font-mono ${hlY} ${row.emphasis ? "text-base" : ""} ${row.emphasis && bestSide === "A" ? "text-[hsl(var(--neon-green))]" : "text-foreground"}`}>
                      {row.render(A)}
                    </td>
                    <td className={`p-4 text-right font-mono ${hlY} ${row.highlight ? "border-r-2" : ""} ${row.emphasis ? "text-base" : ""} ${row.emphasis && bestSide === "B" ? "text-[hsl(var(--neon-green))]" : "text-foreground"}`}>
                      {row.render(B)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Difference summary */}
        {bestSide && diff > 0 && (
          <p className="mt-4 text-sm text-foreground">
            <span className="font-bold text-[hsl(var(--neon-green))]">{bestSide === "A" ? A.car.name : B.car.name}</span>
            {" "}({bestSide === "A" ? (A.form === "lease" ? "leasing" : "lån") : (B.form === "lease" ? "leasing" : "lån")})
            {" "}er <span className="font-mono font-bold">{formatKR(diff)}</span> billigere i total kostnad over {løpetid} år.
          </p>
        )}
        {bestSide && diff === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">Begge alternativene har samme totale kostnad over perioden.</p>
        )}
      </div>
      )}
    </section>
  );
}
