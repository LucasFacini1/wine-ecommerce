import type { OrderStatus } from "@/types";
import { Tag } from "@/components/ui/Tag";
import { ORDER_STATUS_LABEL } from "@/lib/format";

const TONE: Record<
  OrderStatus,
  "neutral" | "warn" | "brass" | "ok"
> = {
  recebido: "warn",
  pago: "brass",
  separado: "brass",
  despachado: "brass",
  entregue: "ok",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Tag tone={TONE[status]}>{ORDER_STATUS_LABEL[status]}</Tag>;
}

export function StockBadge({
  qty,
  threshold,
}: {
  qty: number;
  threshold: number;
}) {
  if (qty <= 0) return <Tag tone="danger">Esgotado</Tag>;
  if (qty <= threshold) return <Tag tone="warn">Baixo · {qty}</Tag>;
  return <Tag tone="ok">{qty} un.</Tag>;
}
