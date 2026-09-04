import { cn } from "@/lib/cn";

type Tone = "neutral" | "brass" | "ok" | "warn" | "danger" | "oxblood";

const tones: Record<Tone, string> = {
  neutral: "border-line text-bone-dim",
  brass: "border-oxblood/30 text-oxblood",
  ok: "border-ok/30 text-ok bg-ok-bg",
  warn: "border-warn/30 text-warn bg-warn-bg",
  danger: "border-danger/30 text-danger bg-danger-bg",
  oxblood: "border-oxblood/20 text-oxblood bg-wine-tint",
};

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-sans text-[0.625rem] font-medium uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
