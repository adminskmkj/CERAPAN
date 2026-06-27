import { cn } from "@/lib/utils";

const steps = ["Maklumat", "Penskoran", "Ringkasan"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold font-mono",
                active && "border-accent bg-accent text-white",
                done && "border-emerald-700 bg-emerald-700 text-white",
                !active && !done && "border-stone bg-paper-card text-muted"
              )}
            >
              {done ? "✓" : step}
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                active ? "text-ink" : "text-muted"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-1 h-px w-8",
                  done ? "bg-emerald-700" : "bg-stone"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
