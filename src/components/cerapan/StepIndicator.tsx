import { cn } from "@/lib/utils";

const steps = ["Maklumat", "Penskoran", "Ringkasan"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
              active && "border-brand-500 bg-brand-50 text-brand-700",
              done && "border-green-200 bg-green-50 text-green-700",
              !active && !done && "border-slate-200 bg-white text-slate-500"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                active && "bg-brand-700 text-white",
                done && "bg-green-600 text-white",
                !active && !done && "bg-slate-200 text-slate-600"
              )}
            >
              {done ? "✓" : step}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}