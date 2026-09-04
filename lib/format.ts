import type { OrderStatus } from "@/types";

/** Frete fixo da demo. Fase 2 troca por cálculo por CEP. */
export const SHIPPING_FLAT_CENTS = 2990;
export const FREE_SHIPPING_THRESHOLD_CENTS = 30000;

export function shippingForSubtotal(subtotalCents: number): number {
  if (subtotalCents === 0) return 0;
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFmt.format(new Date(iso));
}

export function formatCEP(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatCPF(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatABV(abv: number): string {
  return `${abv.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}% vol.`;
}

export const WINE_TYPE_LABEL: Record<string, string> = {
  tinto: "Tinto",
  branco: "Branco",
  "rosé": "Rosé",
  espumante: "Espumante",
  laranja: "Laranja",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  recebido: "Recebido",
  pago: "Pago",
  separado: "Separado",
  despachado: "Despachado",
  entregue: "Entregue",
};

/** próximo passo no fluxo, ou null se já entregue */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  const order: OrderStatus[] = [
    "recebido",
    "pago",
    "separado",
    "despachado",
    "entregue",
  ];
  const i = order.indexOf(status);
  return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
}
