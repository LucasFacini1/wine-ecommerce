import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Price({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  return (
    <span className={cn("font-sans tabular-nums", className)}>
      {formatBRL(cents)}
    </span>
  );
}
