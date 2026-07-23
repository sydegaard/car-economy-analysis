// Interest-rate sensitivity control. Drives the `renteJustering` input in
// useCalculations, shifting every loan rate by ±X percentage points so the user
// can see how the scenario table and recommendation react to rate changes.
//
// Rendered as a sticky, condensed bar: once you scroll past it, it pins to the top
// of the viewport so the rate stays adjustable while the results below recompute live.
export default function SensitivitySlider({ value, onChange }) {
  const sign = value > 0 ? '+' : '';
  const shifted = value !== 0;

  return (
    <section aria-labelledby="sensitivity-heading" className="mt-10 sticky top-4 z-30">
      <h2 id="sensitivity-heading" className="sr-only">
        Følsomhetsanalyse — rentejustering
      </h2>
      <div className="bg-card/90 backdrop-blur-md border border-border/60 rounded-xl shadow-lg px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <label
            htmlFor="renteJustering"
            className="text-xs font-semibold text-foreground tracking-wide uppercase whitespace-nowrap flex items-center gap-2"
          >
            <span className="h-1 w-6 bg-primary rounded-full" aria-hidden="true" />
            Rentejustering
          </label>
          <input
            id="renteJustering"
            type="range"
            min={-2}
            max={2}
            step={0.25}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{ accentColor: 'hsl(var(--primary))' }}
            className="flex-1 min-w-0 h-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-full"
            aria-describedby="sensitivity-hint"
          />
          <span
            className={`font-mono text-base font-bold whitespace-nowrap tabular-nums text-right w-24 ${shifted ? 'text-primary' : 'text-muted-foreground'}`}
          >
            {sign}{value.toFixed(2)} pp
          </span>
        </div>
        <p id="sensitivity-hint" className="sr-only">
          Juster alle lånerenter opp eller ned for å se hvor følsom anbefalingen er.
          Tabellen og konklusjonen oppdateres automatisk.
        </p>
      </div>
    </section>
  );
}
