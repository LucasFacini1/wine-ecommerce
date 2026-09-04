"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Wine } from "@/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

/** Barra fixa de compra — só no mobile, complementa o bloco AddToCart. */
export function BuyBar({ wine }: { wine: Wine }) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const soldOut = wine.stockQty <= 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur-md md:hidden">
      <div className="wrap flex items-center justify-between gap-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm text-bone">{wine.name}</p>
          <Price cents={wine.priceCents} className="text-sm text-bone-dim" />
        </div>
        <Button
          size="md"
          disabled={soldOut}
          onClick={() => {
            addToCart(wine, 1);
            setAdded(true);
            window.setTimeout(() => setAdded(false), 2000);
          }}
        >
          {added ? (
            <>
              <Check size={15} strokeWidth={2} /> Ok
            </>
          ) : soldOut ? (
            "Esgotado"
          ) : (
            "Adicionar"
          )}
        </Button>
      </div>
    </div>
  );
}
