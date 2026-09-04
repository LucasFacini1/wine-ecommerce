import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "border bg-ink-soft p-5",
        accent ? "border-brass/40" : "border-line",
      )}
    >
      <p className="label">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl",
          accent ? "text-brass-bright" : "text-bone",
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1 font-sans text-xs text-bone-faint">{sub}</p>
      )}
    </div>
  );
}
