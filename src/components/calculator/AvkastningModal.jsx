import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const bands = [
  { scenario: "Forsiktig", rate: "3 %", tapt: "15 000 kr" },
  { scenario: "Moderat", rate: "5 %", tapt: "25 000 kr" },
  { scenario: "Optimistisk", rate: "7 %", tapt: "35 000 kr" },
];

export default function AvkastningModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border text-foreground max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Forventet avkastning – forklart</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* What is it */}
          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span>💡</span> Hva er det?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Forventet avkastning er den gjennomsnittlige årlige gevinsten du regner med å få hvis du
              investerer pengene i markedet (typisk indeksfond eller aksjer) i stedet for å bruke dem på bilen.
              Over tid har et bredt globalt aksjefond historisk gitt omtrent{" "}
              <span className="font-semibold text-foreground">5–7 % i året</span>, men avkastningen svinger fra
              år til år og er aldri garantert.
            </p>
          </section>

          {/* Why it matters */}
          <section>
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span>🎯</span> Hvorfor er dette viktig?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Når du betaler bilen kontant, låser du egenkapitalen i noe som synker i verdi. De samme pengene
              kunne i stedet stått og vokst. Den tapte gevinsten kalles{" "}
              <span className="font-semibold text-foreground">alternativkostnad</span> — og kalkulatoren bruker
              forventet avkastning til å regne den ut.
            </p>

            <p className="text-sm text-muted-foreground mb-3">
              Tapt avkastning på <span className="font-mono font-semibold text-foreground">100 000 kr</span>{" "}
              bundet i bil over 5 år:
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary text-xs uppercase tracking-widest">
                    <th className="text-left p-3 font-semibold">Scenario</th>
                    <th className="text-left p-3 font-semibold">Avkastning</th>
                    <th className="text-right p-3 font-semibold text-[hsl(var(--warning))]">Tapt avkastning</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((row, i) => (
                    <tr key={row.scenario} className={`border-t border-border/30 ${i % 2 === 0 ? "" : "bg-secondary/30"}`}>
                      <td className="p-3 font-medium text-foreground">{row.scenario}</td>
                      <td className="p-3 font-mono text-muted-foreground">{row.rate}</td>
                      <td className="p-3 text-right font-mono font-semibold text-[hsl(var(--warning))]">{row.tapt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-3 italic">
              Merk: Kalkulatoren bruker en enkel lineær modell (avkastning × antall år). Med rentes-rente kan
              tallet bli høyere over tid — og husk at verdien også kan falle.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
