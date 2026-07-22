import { useState, useEffect } from "react";
import InputField from "./InputField";
import MarginalskattModal from "./MarginalskattModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const fields = [
  { id: 'bilPris', label: 'Bilens pris', hint: 'Total kjøpesum inkl. mva', step: 10000 },
  { id: 'egenkapital', label: 'Egenkapital', hint: 'Kontant du legger inn selv', step: 10000 },
  { id: 'løpetid', label: 'Løpetid (år)', hint: 'Nedbetalingstid for lån', step: 1, min: 1, max: 15 },
  { id: 'avkastning', label: 'Forventet avkastning (%)', hint: 'Årlig avkastning på indeksfond/aksjer', step: 0.5 },
  { id: 'sparepenger', label: 'Totale sparepenger', hint: 'Inkl. BSU, fond, bankinnskudd', step: 50000 },
  { id: 'inntekt', label: 'Månedlig inntekt', hint: 'Etter skatt ca.', step: 5000 },
];

function MarginalskattField({ value, onChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [raw, setRaw] = useState(String(value));

  useEffect(() => {
    if (parseFloat(raw) !== value) setRaw(String(value));
  }, [value]);

  const handleChange = (e) => {
    const str = e.target.value;
    setRaw(str);
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    if (raw === "" || isNaN(parseFloat(raw))) setRaw(String(value));
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="skatt"
            className="text-sm font-semibold text-foreground tracking-wide uppercase"
          >
            Marginalskatt (%)
          </Label>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Mer info om marginalskatt"
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs text-xs leading-relaxed bg-card border-border text-foreground shadow-xl"
              >
                <p className="mb-1">Rente etter skatt = Rente før skatt × (1 - marginalskattesats)</p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-primary underline underline-offset-2 hover:text-primary/80 font-semibold mt-1"
                >
                  Se utfyllende forklaring →
                </button>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="skatt"
          type="number"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          step={1}
          className="bg-secondary border-border text-foreground font-mono text-base h-12
            focus:border-primary focus:ring-2 focus:ring-primary/30
            placeholder:text-muted-foreground transition-all duration-200"
          aria-describedby="skatt-hint"
        />
        <p id="skatt-hint" className="text-xs text-muted-foreground leading-relaxed">
          Rentefradrag på lån
        </p>
      </div>
      <MarginalskattModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

export default function InputSection({ values, onChange }) {
  return (
    <section aria-labelledby="input-heading">
      <h2 id="input-heading" className="text-lg font-bold text-foreground mb-6 tracking-tight">
        Dine tall
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {fields.map((f) => (
          <InputField
            key={f.id}
            id={f.id}
            label={f.label}
            hint={f.hint}
            value={values[f.id]}
            onChange={(val) => onChange(f.id, val)}
            step={f.step}
            min={f.min}
            max={f.max}
          />
        ))}
        <MarginalskattField value={values.skatt} onChange={(val) => onChange('skatt', val)} />
      </div>
    </section>
  );
}
