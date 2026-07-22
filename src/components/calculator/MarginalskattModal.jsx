import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const tableData = [
  { skatt: "0 % (ingen skatt)", beregning: "5.000 × (1 - 0)", etter: "5.000 kr", staten: "0 kr" },
  { skatt: "22 % (minstesats)", beregning: "5.000 × (1 - 0,22)", etter: "3.900 kr", staten: "1.100 kr" },
  { skatt: "28 % (vanlig lønnstaker)", beregning: "5.000 × (1 - 0,28)", etter: "3.600 kr", staten: "1.400 kr" },
  { skatt: "47 % (høy inntekt)", beregning: "5.000 × (1 - 0,47)", etter: "2.650 kr", staten: "2.350 kr" },
];

export default function MarginalskattModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Skattefradrag på renter – forklart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Practical example */}
          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span>📊</span> Praktisk eksempel
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              La oss si du har et billån med <span className="font-mono font-semibold text-foreground">5.000 kr</span> i totale renter i løpet av et år.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-xs uppercase tracking-widest">
                    <th className="text-left p-3 font-semibold">Marginalskatt</th>
                    <th className="text-left p-3 font-semibold">Beregning</th>
                    <th className="text-right p-3 font-semibold text-[hsl(var(--neon-green))]">Rente etter skatt</th>
                    <th className="text-right p-3 font-semibold text-primary">Staten betaler</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i} className={`border-t border-border/30 ${i % 2 === 0 ? '' : 'bg-secondary/30'}`}>
                      <td className="p-3 font-medium text-foreground">{row.skatt}</td>
                      <td className="p-3 font-mono text-muted-foreground text-xs">{row.beregning}</td>
                      <td className="p-3 text-right font-mono font-semibold text-[hsl(var(--neon-green))]">{row.etter}</td>
                      <td className="p-3 text-right font-mono text-primary">{row.staten}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-3 italic">
              <strong className="text-foreground">Konklusjon:</strong> Jo høyere skatt du betaler, desto billigere blir lånet i praksis.
            </p>
          </section>

          {/* Why it matters */}
          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span>🎯</span> Hvorfor er dette viktig for deg?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Når du vurderer om du skal betale kontant eller ta opp lån, må du sammenligne:
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/50 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-xs uppercase tracking-widest">
                    <th className="text-left p-3 font-semibold">Alternativ</th>
                    <th className="text-left p-3 font-semibold">Effektiv kostnad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/30">
                    <td className="p-3 font-medium text-foreground">Betale kontant</td>
                    <td className="p-3 text-muted-foreground text-sm">Tapt avkastning (f.eks. 5 % på fond) – ingen skattefordel</td>
                  </tr>
                  <tr className="border-t border-border/30 bg-secondary/30">
                    <td className="p-3 font-medium text-foreground">Ta opp lån</td>
                    <td className="p-3 text-muted-foreground text-sm">Lånerente minus skattefradrag</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-secondary/50 rounded-xl p-5 border border-primary/30 space-y-2">
              <p className="text-sm font-semibold text-foreground mb-3">Eksempel med dine tall:</p>
              <div className="space-y-1 text-sm text-muted-foreground font-mono">
                <p>Billånrente: <span className="text-foreground">5,19 %</span></p>
                <p>Din marginalskatt: <span className="text-foreground">28 %</span></p>
                <p>Effektiv rente etter skatt: <span className="text-primary font-bold">5,19 % × (1 - 0,28) = 3,74 %</span></p>
              </div>
              <div className="pt-3 border-t border-border/40 space-y-1 text-sm">
                <p className="text-muted-foreground">Kontant: Taper <span className="text-[hsl(var(--warning))]">5 % avkastning</span> på sparingen</p>
                <p className="text-muted-foreground">Lån: Betaler <span className="text-[hsl(var(--neon-green))]">3,74 % effektiv rente</span></p>
                <p className="font-bold text-primary pt-1">Resultat: Lån er 1,26 % billigere per år!</p>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
