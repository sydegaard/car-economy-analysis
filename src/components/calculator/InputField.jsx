import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function InputField({ id, label, hint, value, onChange, ...props }) {
  const [raw, setRaw] = useState(String(value));

  // Sync if parent value changes from outside (e.g. reset)
  useEffect(() => {
    if (parseFloat(raw) !== value) {
      setRaw(String(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const str = e.target.value;
    setRaw(str);
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // On blur, if empty or invalid, reset display to current value
    if (raw === "" || isNaN(parseFloat(raw))) {
      setRaw(String(value));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-foreground tracking-wide uppercase"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        className="bg-secondary border-border text-foreground font-mono text-base h-12
          focus:border-primary focus:ring-2 focus:ring-primary/30
          placeholder:text-muted-foreground transition-all duration-200"
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}
