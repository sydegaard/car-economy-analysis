import { useState, useEffect, useRef } from "react";
import { X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function InputField({ id, label, hint, value, onChange, optional = false, help, onMoreInfo, ...props }) {
  const [raw, setRaw] = useState(String(value));
  const inputRef = useRef(null);

  // Sync if parent value changes from outside (e.g. reset). Don't override an
  // intentionally-cleared (empty) field — empty is allowed and counts as 0.
  useEffect(() => {
    if (raw !== "" && parseFloat(raw) !== value) {
      setRaw(String(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const str = e.target.value;
    setRaw(str);
    if (str === "") {
      onChange(0); // empty is treated as 0 in the calculation
      return;
    }
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // Reset only invalid non-empty input; keep an intentionally-empty field empty.
    if (raw !== "" && isNaN(parseFloat(raw))) {
      setRaw(String(value));
    }
  };

  const handleClear = () => {
    setRaw("");
    onChange(0);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor={id}
          className="text-sm font-semibold text-foreground tracking-wide uppercase"
        >
          {label}
          {optional && (
            <span className="ml-1.5 font-normal normal-case tracking-normal text-muted-foreground">
              (valgfritt)
            </span>
          )}
        </Label>
        {help && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Mer info om ${label}`}
                  className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs text-xs leading-relaxed bg-card border-border text-foreground shadow-xl"
              >
                <p className="mb-1">{help}</p>
                {onMoreInfo && (
                  <button
                    type="button"
                    onClick={onMoreInfo}
                    className="text-primary underline underline-offset-2 hover:text-primary/80 font-semibold mt-1"
                  >
                    Se utfyllende forklaring →
                  </button>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="number"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          className="no-spinner bg-secondary border-border text-foreground font-mono text-base h-12 pr-9
            focus:border-primary focus:ring-2 focus:ring-primary/30
            placeholder:text-muted-foreground transition-all duration-200"
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
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
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}
