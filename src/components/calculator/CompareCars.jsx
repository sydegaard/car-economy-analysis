import { useState } from "react";
import { Zap, ChevronDown } from "lucide-react";
import { formatKR, computeOwnership, FINANCING_OPTIONS } from "@/hooks/useCalculations";
import { EV_MODELS, carMidPrice, parseRangeKm } from "@/data/evModels";

const PLACEHOLDER_IMAGE = "/car-placeholder.svg";

// Case-insensitive exact match of a typed name against the model list.
function findModel(name) {
  const n = name.trim().toLowerCase();
  return EV_MODELS.find((m) => m.name.toLowerCase() === n) || null;
}

function CarHeader({ car, isBest }) {
  if (!car) {
    return <span className="text-muted-foreground italic text-sm">Ingen bil valgt</span>;
  }
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

export default function CompareCars({ egenkapital, løpetid, skatt, verditap, driftskostnader, bestKey }) {
  const defaultFinancing =
    FINANCING_OPTIONS.find((o) => o.key === bestKey)?.key || FINANCING_OPTIONS[0].key;

  const [open, setOpen] = useState(true);
  const [financingKey, setFinancingKey] = useState(defaultFinancing);
  const [nameA, setNameA] = useState(EV_MODELS[0].name);
  const [nameB, setNameB] = useState(EV_MODELS[1].name);

  const option =
    FINANCING_OPTIONS.find((o) => o.key === financingKey) || FINANCING_OPTIONS[0];

  const carA = findModel(nameA);
  const carB = findModel(nameB);

  const econ = (car) =>
    car
      ? computeOwnership(carMidPrice(car), {
          egenkapital,
          løpetid,
          skatt,
          verditap,
          driftskostnader,
          rate: option.rate,
          fee: option.fee,
        })
      : null;

  const eA = econ(carA);
  const eB = econ(carB);

  // Winner = lowest total cost, only when both cars are resolved.
  const bestSide =
    eA && eB ? (eA.totalCost <= eB.totalCost ? "A" : "B") : null;
  const diff = eA && eB ? Math.abs(eA.totalCost - eB.totalCost) : null;

  const eier = `eierperiode, ${løpetid} år`;

  const rows = [
    { label: "Kjøpesum", a: carA ? formatKR(carMidPrice(carA)) : "—", b: carB ? formatKR(carMidPrice(carB)) : "—" },
    {
      label: "Rekkevidde",
      a: carA && parseRangeKm(carA) != null ? `${parseRangeKm(carA)} km` : "—",
      b: carB && parseRangeKm(carB) != null ? `${parseRangeKm(carB)} km` : "—",
    },
    { label: `Verditap (${eier})`, a: eA ? formatKR(eA.totalDepreciation) : "—", b: eB ? formatKR(eB.totalDepreciation) : "—" },
    { label: "Driftskostnader (totalt)", a: eA ? formatKR(eA.totalDrift) : "—", b: eB ? formatKR(eB.totalDrift) : "—" },
    { label: "Total månedskostnad", highlight: true, a: eA ? formatKR(eA.monthlyTotal) : "—", b: eB ? formatKR(eB.monthlyTotal) : "—" },
    {
      label: `Total kostnad (${eier})`,
      emphasis: true,
      a: eA ? formatKR(eA.totalCost) : "—",
      b: eB ? formatKR(eB.totalCost) : "—",
    },
  ];

  const inputCls =
    "bg-secondary border border-border text-foreground text-base h-12 rounded-md px-3 w-full " +
    "focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all duration-200";

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="compare-financing" className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Finansieringsløsning
            </label>
            <select
              id="compare-financing"
              value={financingKey}
              onChange={(e) => setFinancingKey(e.target.value)}
              className={inputCls}
            >
              {FINANCING_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="compare-a" className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Bil A
            </label>
            <input
              id="compare-a"
              list="ev-model-list"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              placeholder="Søk etter modell…"
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="compare-b" className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Bil B
            </label>
            <input
              id="compare-b"
              list="ev-model-list"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              placeholder="Søk etter modell…"
              className={inputCls}
            />
          </div>
          <datalist id="ev-model-list">
            {EV_MODELS.map((m) => (
              <option key={m.name} value={m.name} />
            ))}
          </datalist>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-secondary">
                <th scope="col" className="text-left p-4 font-semibold text-foreground text-xs uppercase tracking-widest min-w-[150px]">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" /> Nøkkeltall
                  </span>
                </th>
                <th scope="col" className="p-4 align-top w-1/2">
                  <CarHeader car={carA} isBest={bestSide === "A"} />
                </th>
                <th scope="col" className="p-4 align-top w-1/2">
                  <CarHeader car={carB} isBest={bestSide === "B"} />
                </th>
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
                      {row.a}
                    </td>
                    <td className={`p-4 text-right font-mono ${hlY} ${row.highlight ? "border-r-2" : ""} ${row.emphasis ? "text-base" : ""} ${row.emphasis && bestSide === "B" ? "text-[hsl(var(--neon-green))]" : "text-foreground"}`}>
                      {row.b}
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
            <span className="font-bold text-[hsl(var(--neon-green))]">
              {bestSide === "A" ? carA.name : carB.name}
            </span>{" "}
            er <span className="font-mono font-bold">{formatKR(diff)}</span> billigere i total kostnad over {løpetid} år
            (finansiering: {option.label.toLowerCase()}).
          </p>
        )}
        {bestSide && diff === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Begge bilene har samme totale kostnad over perioden.
          </p>
        )}
      </div>
      )}
    </section>
  );
}
