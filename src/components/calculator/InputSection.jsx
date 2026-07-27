import { useState, useEffect, useRef } from "react";
import InputField from "./InputField";
import MarginalskattModal from "./MarginalskattModal";
import AvkastningModal from "./AvkastningModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const fields = [
  { id: 'bilPris', label: 'Bilens pris', hint: 'Total kjøpesum inkl. mva', step: 10000 },
  { id: 'egenkapital', label: 'Egenkapital', hint: 'Kontant du legger inn selv', step: 10000 },
  { id: 'løpetid', label: 'Løpetid (år)', hint: 'Nedbetalingstid for lån', step: 1, min: 1, max: 15 },
  { id: 'avkastning', label: 'Forventet avkastning (%)', hint: 'Årlig avkastning på indeksfond/aksjer', step: 0.5, optional: true, help: 'Hvor mye sparepengene dine i snitt kan vokse per år hvis du investerer dem (f.eks. i indeksfond) i stedet for å binde dem i bilen. Brukes til å regne ut tapt avkastning ved å betale kontant (alternativkostnad). Tommelfingerregel: 3 % forsiktig · 5 % moderat · 7 % optimistisk — men avkastning svinger og er ikke garantert.' },
  { id: 'sparepenger', label: 'Totale sparepenger', hint: 'Inkl. BSU, fond, bankinnskudd', step: 50000, optional: true },
  { id: 'inntekt', label: 'Månedlig inntekt', hint: 'Etter skatt ca.', step: 5000, optional: true },
  { id: 'verditap', label: 'Årlig verditap (%)', hint: 'Elbil 10–15% · Bensin 15–20% · Luksus 20–30%', step: 1, min: 0, max: 40 },
  { id: 'driftskostnader', label: 'Årlige driftskostnader', hint: 'Første år: forsikring + strøm/drivstoff + service + bom', step: 5000 },
  { id: 'kostnadsøkning', label: 'Årlig kostnadsøkning (%)', hint: 'Hvor mye driftskostnaden stiger per år (service, dekk, reparasjoner). 0 = flat.', step: 1, min: 0, max: 20, optional: true },
  { id: 'leasingpris', label: 'Månedlig leasingpris', hint: 'Kun leieavgift — drift regnes separat', step: 500, optional: true },
];

function MarginalskattField({ value, onChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [raw, setRaw] = useState(String(value));
  const inputRef = useRef(null);

  useEffect(() => {
    if (raw !== "" && parseFloat(raw) !== value) setRaw(String(value));
  }, [value]);

  const handleChange = (e) => {
    const str = e.target.value;
    setRaw(str);
    if (str === "") {
      onChange(0);
      return;
    }
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    if (raw !== "" && isNaN(parseFloat(raw))) setRaw(String(value));
  };

  const handleClear = () => {
    setRaw("");
    onChange(0);
    inputRef.current?.focus();
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
        <div className="relative">
          <Input
            ref={inputRef}
            id="skatt"
            type="number"
            value={raw}
            onChange={handleChange}
            onBlur={handleBlur}
            step={1}
            placeholder="0"
            className="no-spinner bg-secondary border-border text-foreground font-mono text-base h-12 pr-9
              focus:border-primary focus:ring-2 focus:ring-primary/30
              placeholder:text-muted-foreground transition-all duration-200"
            aria-describedby="skatt-hint"
          />
          {raw !== "" && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Tøm felt"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p id="skatt-hint" className="text-xs text-muted-foreground leading-relaxed">
          Rentefradrag på lån
        </p>
      </div>
      <MarginalskattModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

export default function InputSection({ values, onChange }) {
  const [avkastningModalOpen, setAvkastningModalOpen] = useState(false);

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
            optional={f.optional}
            help={f.help}
            onMoreInfo={f.id === 'avkastning' ? () => setAvkastningModalOpen(true) : undefined}
          />
        ))}
        <MarginalskattField value={values.skatt} onChange={(val) => onChange('skatt', val)} />
      </div>
      <AvkastningModal open={avkastningModalOpen} onOpenChange={setAvkastningModalOpen} />
    </section>
  );
}
