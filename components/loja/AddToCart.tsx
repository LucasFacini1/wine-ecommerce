"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { Wine } from "@/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";

export function AddToCart({ wine }: { wine: Wine }) {
  const { addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = wine.stockQty <= 0;
  const max = Math.max(1, Math.min(12, wine.stockQty));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Stepper value={qty} onChange={setQty} min={1} max={max} />
      <Button
        size="lg"
        disabled={soldOut}
        className="flex-1"
        onClick={() => {
          addToCart(wine, qty);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2200);
        }}
      >
        {added ? (
          <>
            <Check size={16} strokeWidth={2} /> Adicionado
          </>
        ) : soldOut ? (
          "Esgotado"
        ) : (
          <>
            <ShoppingBag size={15} strokeWidth={1.5} /> Adicionar —{" "}
            {qty === 1 ? "1 garrafa" : `${qty} garrafas`}
          </>
        )}
      </Button>
    </div>
  );
}
