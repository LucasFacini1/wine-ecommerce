import { Check } from "lucide-react";
import type { OrderEvent, OrderStatus } from "@/types";
import { ORDER_STATUSES } from "@/types";
import { ORDER_STATUS_LABEL, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";

const BLURB: Record<OrderStatus, string> = {
  recebido: "Pedido registrado, aguardando confirmação do pagamento.",
  pago: "Pagamento confirmado pelo Mercado Pago.",
  separado: "Garrafas separadas e embaladas para envio.",
  despachado: "A caminho — código de rastreio enviado por e-mail.",
  entregue: "Entregue no endereço informado.",
};

export function OrderTimeline({
  events,
  current,
}: {
  events: OrderEvent[];
  current: OrderStatus;
}) {
  const currentIdx = ORDER_STATUSES.indexOf(current);
  const eventFor = (s: OrderStatus) => events.find((e) => e.status === s);

  return (
    <ol className="relative">
      {ORDER_STATUSES.map((status, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const ev = eventFor(status);
        const last = i === ORDER_STATUSES.length - 1;

        return (
          <li key={status} className="relative flex gap-4 pb-7 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 h-full w-px",
                  done ? "bg-oxblood" : "bg-line",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border",
                done && "border-oxblood bg-oxblood text-on-dark",
                active && "border-oxblood bg-ink text-oxblood",
                !done && !active && "border-line bg-ink text-transparent",
              )}
            >
              {done ? (
                <Check size={13} strokeWidth={2.5} />
              ) : (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-oxblood" : "bg-line",
                  )}
                />
              )}
            </span>

            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={cn(
                    "font-display text-lg",
                    done || active ? "text-bone" : "text-bone-faint",
                  )}
                >
                  {ORDER_STATUS_LABEL[status]}
                </p>
                {ev && (
                  <time className="font-sans text-xs text-bone-faint">
                    {formatDateTime(ev.at)}
                  </time>
                )}
              </div>
              <p
                className={cn(
                  "mt-0.5 font-sans text-sm",
                  done || active ? "text-bone-dim" : "text-bone-faint",
                )}
              >
                {ev?.note ?? BLURB[status]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
