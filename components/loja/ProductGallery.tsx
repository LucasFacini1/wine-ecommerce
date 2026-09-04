"use client";

import { useState } from "react";
import type { Wine } from "@/types";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/cn";

const VARIANTS = ["bottle", "label"] as const;

export function ProductGallery({ wine }: { wine: Wine }) {
  const [active, setActive] = useState<(typeof VARIANTS)[number]>("bottle");

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      <div className="flex gap-3 sm:flex-col">
        {VARIANTS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActive(v)}
            aria-label={v === "bottle" ? "Ver a garrafa" : "Ver o rótulo"}
            className={cn(
              "relative aspect-[4/5] w-16 shrink-0 overflow-hidden border transition-colors",
              active === v
                ? "border-brass"
                : "border-line hover:border-bone-faint",
            )}
          >
            <ProductImage wine={wine} variant={v} sizes="64px" />
          </button>
        ))}
      </div>
      <div className="relative aspect-[4/5] flex-1 overflow-hidden border border-line bg-ink-soft">
        <ProductImage
          wine={wine}
          variant={active}
          priority
          sizes="(min-width: 1024px) 40vw, 90vw"
        />
      </div>
    </div>
  );
}
