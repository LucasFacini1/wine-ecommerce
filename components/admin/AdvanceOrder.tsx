"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types";
import { advanceOrderAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { nextStatus, ORDER_STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

export function AdvanceOrder({
  orderId,
  status,
  withNote = false,
  size = "md",
  variant = "solid",
}: {
  orderId: string;
  status: OrderStatus;
  withNote?: boolean;
  size?: "sm" | "md";
  variant?: "solid" | "outline";
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const next = nextStatus(status);
  if (!next) {
    return (
      <p className="font-sans text-sm text-ok">
        Fluxo concluído — pedido entregue.
      </p>
    );
  }

  const run = () =>
    startTransition(async () => {
      setError("");
      const res = await advanceOrderAction(orderId, note);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setNote("");
      router.refresh();
    });

  return (
    <div className={cn("flex flex-col gap-3", !withNote && "sm:flex-row")}>
      {withNote && (
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota (opcional) — código de rastreio, transportadora…"
          className={inputClass}
          disabled={pending}
        />
      )}
      <Button
        size={size}
        variant={variant}
        disabled={pending}
        onClick={run}
        className="shrink-0"
      >
        {pending ? "Salvando…" : `Avançar para ${ORDER_STATUS_LABEL[next]}`}
      </Button>
      {error && (
        <p className="font-sans text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
