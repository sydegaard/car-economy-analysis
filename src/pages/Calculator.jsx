import { useState } from "react";
import useCalculations from "@/hooks/useCalculations";
import InputSection from "../components/calculator/InputSection";
import ScenarioTable from "../components/calculator/ScenarioTable";
import OpportunityCost from "../components/calculator/OpportunityCost";
import ConclusionBox from "../components/calculator/ConclusionBox";
import AdviceGrid from "../components/calculator/AdviceGrid";
import CarCarousel from "../components/calculator/CarCarousel";
import CompareCars from "../components/calculator/CompareCars";
import SensitivitySlider from "../components/calculator/SensitivitySlider";

const DEFAULT_VALUES = {
  bilPris: 350000,
  egenkapital: 100000,
  løpetid: 5,
  avkastning: 5,
  skatt: 28,
  sparepenger: 500000,
  inntekt: 50000,
  verditap: 15,
  driftskostnader: 30000,
  leasingpris: 5500,
  renteJustering: 0,
};

export default function Calculator() {
  const [values, setValues] = useState(DEFAULT_VALUES);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const result = useCalculations(values);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Header */}
        <header className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">
                  Analyseverktøy
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                Bilfinansierings
                <span className="text-primary">analyse</span>
                <span className="text-accent">.</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
                Sammenlign 7 finansieringsløsninger og finn den mest lønnsomme strategien for ditt bilkjøp i 2026.
              </p>
            </div>
            {/* EV Car Carousel */}
            <div className="w-full md:w-72 lg:w-80 h-48 md:h-52 flex-shrink-0">
              <CarCarousel bilPris={values.bilPris} />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main>
          <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
            <InputSection values={values} onChange={handleChange} />
          </div>

          <SensitivitySlider
            value={values.renteJustering}
            onChange={(val) => handleChange("renteJustering", val)}
          />

          <ScenarioTable
            scenarios={result.scenarios}
            bestKey={result.bestKey}
            worstKey={result.worstKey}
            totalDepreciation={result.totalDepreciation}
            totalDrift={result.totalDrift}
            løpetid={values.løpetid}
          />

          <OpportunityCost data={result.opportunityCost} løpetid={values.løpetid} />

          <CompareCars
            egenkapital={values.egenkapital}
            løpetid={values.løpetid}
            skatt={values.skatt}
            verditap={values.verditap}
            driftskostnader={values.driftskostnader}
            bestKey={result.bestKey}
          />

          <ConclusionBox conclusion={result.conclusion} />

          <AdviceGrid advice={result.advice} />
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
            ⚠️ Dette er en veiledende analyse. Renter er basert på markedet 2026.
            Kontakt bank for nøyaktige tilbud. Verditap og driftskostnader er anslag —
            juster dem for din bil for et mer nøyaktig totalregnestykke.
          </p>
        </footer>
      </div>
    </div>
  );
}
