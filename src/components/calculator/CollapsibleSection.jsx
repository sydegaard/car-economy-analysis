import { useState } from "react";
import { ChevronDown } from "lucide-react";

// Section with a collapsible body, toggled by its own heading. Shared by
// CompareCars, CostCharts and OpportunityCost so the header markup and the
// aria-expanded/aria-controls wiring live in one place.
export default function CollapsibleSection({ id, title, subtitle, defaultOpen = true, bodyClassName = "", children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section aria-labelledby={`${id}-heading`} className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        className="w-full flex items-center justify-between gap-3 mb-6 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
      >
        <span className="flex flex-col gap-1">
          <h2 id={`${id}-heading`} className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-muted-foreground leading-relaxed font-normal">{subtitle}</span>
          )}
        </span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform group-hover:text-primary ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div id={`${id}-body`} className={bodyClassName}>
          {children}
        </div>
      )}
    </section>
  );
}
