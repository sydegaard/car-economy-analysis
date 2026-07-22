import { formatKR } from "@/hooks/useCalculations";
import { Badge } from "@/components/ui/badge";

const keys = ['kontant', 'billån1', 'billån2', 'grønt', 'bolig', 'forbruk', 'leasing'];

function CellValue({ value, isCurrency = true }) {
  if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
  return <span className="font-mono">{isCurrency ? formatKR(value) : value}</span>;
}

export default function ScenarioTable({ scenarios, bestKey, worstKey }) {
  const rows = [
    {
      label: 'Effektiv rente',
      render: (s, key) =>
        key === 'leasing'
          ? <span className="text-muted-foreground italic">Leasing</span>
          : <span className="font-mono">{s.rate?.toFixed(2)}%</span>,
    },
    {
      label: 'Månedskostnad',
      render: (s, key) =>
        key === 'leasing'
          ? <span className="font-mono text-muted-foreground">5 000–8 000</span>
          : key === 'kontant'
            ? <span className="font-mono">{formatKR(0)}</span>
            : <CellValue value={s.monthly} />,
    },
    {
      label: 'Totale renter',
      render: (s, key) =>
        key === 'leasing'
          ? <span className="text-muted-foreground italic">Ikke lån</span>
          : <CellValue value={s.totalInterest} />,
    },
    {
      label: 'Rente etter skatt',
      render: (s, key) =>
        key === 'leasing'
          ? <span className="text-muted-foreground italic">Leieavtale</span>
          : <CellValue value={s.interestAfterTax} />,
    },
  ];

  return (
    <section aria-labelledby="scenario-heading" className="mt-10">
      <h2 id="scenario-heading" className="text-lg font-bold text-foreground mb-6 tracking-tight">
        7 Finansieringsløsninger
      </h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="bg-secondary">
              <th scope="col" className="text-left p-4 font-semibold text-foreground text-xs uppercase tracking-widest sticky left-0 bg-secondary z-10 min-w-[140px]">
                Scenario
              </th>
              {keys.map((key) => (
                <th key={key} scope="col" className="p-4 text-right font-semibold text-xs uppercase tracking-widest whitespace-nowrap min-w-[120px]">
                  <div className="flex items-center justify-end gap-2">
                    <span className={key === bestKey ? 'text-[hsl(var(--neon-green))]' : key === worstKey ? 'text-destructive' : 'text-foreground'}>
                      {scenarios[key]?.short}
                    </span>
                    {key === bestKey && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[hsl(var(--neon-green))]/15 text-[hsl(var(--neon-green))] text-[10px] font-bold uppercase tracking-wider">
                        Best
                      </span>
                    )}
                    {key === worstKey && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold uppercase tracking-wider">
                        Dyrest
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={`border-t border-border/50 ${i % 2 === 0 ? '' : 'bg-secondary/30'} transition-colors hover:bg-secondary/60`}>
                <td className="p-4 font-semibold text-foreground/80 text-xs uppercase tracking-wider sticky left-0 bg-card z-10">
                  {row.label}
                </td>
                {keys.map((key) => (
                  <td key={key} className={`p-4 text-right ${key === bestKey ? 'text-[hsl(var(--neon-green))]' : key === worstKey ? 'text-destructive' : 'text-foreground'}`}>
                    {row.render(scenarios[key], key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
