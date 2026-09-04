import Link from "next/link";
import type { Wine } from "@/types";
import { BottlePlate } from "@/components/BottlePlate";
import { Price } from "@/components/ui/Price";
import { WINE_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ProductCard({
  wine,
  priority,
  className,
}: {
  wine: Wine;
  priority?: boolean;
  className?: string;
}) {
  const low = wine.stockQty <= wine.lowStockThreshold;

  return (
    <Link
      href={`/vinhos/${wine.slug}`}
      className={cn("group flex flex-col", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-ink-soft">
        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
          <BottlePlate wine={wine} priority={priority} />
        </div>

        <span className="label absolute left-3 top-3 border border-line bg-ink-soft/90 px-2 py-1 backdrop-blur-sm">
          {WINE_TYPE_LABEL[wine.type]}
        </span>

        {low && (
          <span className="absolute right-3 top-3 border border-warn/40 bg-warn-bg px-2 py-1 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-warn">
            Últimas garrafas
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <p className="label">{wine.producer}</p>
          <span className="vintage text-lg text-bone-dim">
            {wine.vintage ?? "N.V."}
          </span>
        </div>

        <h3 className="mt-1 font-display text-xl leading-tight text-bone transition-colors group-hover:text-brass-bright">
          {wine.name}
        </h3>

        <p className="mt-1 font-text text-sm italic text-bone-faint">
          {wine.grapes.join(", ")} · {wine.region}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
          <Price cents={wine.priceCents} className="text-bone" />
          <span className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-bone-faint transition-colors group-hover:text-brass">
            Ver ficha
          </span>
        </div>
      </div>
    </Link>
  );
}
