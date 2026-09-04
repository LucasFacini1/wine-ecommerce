"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div
      className={cn(
        "inline-flex items-center border border-line",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className="grid h-11 w-11 place-items-center text-bone-dim transition-colors hover:text-bone disabled:opacity-30"
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className="w-10 text-center font-sans text-sm tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        className="grid h-11 w-11 place-items-center text-bone-dim transition-colors hover:text-bone disabled:opacity-30"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}
