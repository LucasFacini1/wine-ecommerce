/* ------------------------------------------------------------------ *
 *  Tipos de domínio
 *  Desenhados para mapear 1:1 com as tabelas do Supabase na Fase 2.
 *  Valores monetários sempre em centavos (inteiro).
 * ------------------------------------------------------------------ */

export type WineType =
  | "tinto"
  | "branco"
  | "rosé"
  | "espumante"
  | "laranja";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Wine {
  id: string;
  slug: string;
  name: string;
  producer: string;
  type: WineType;
  /** ano da safra; null = sem safra (ex. alguns espumantes) */
  vintage: number | null;
  grapes: string[];
  region: string;
  country: string;
  pairings: string[];
  /** teor alcoólico em % (ex. 13.5) */
  abv: number;
  priceCents: number;
  /** chamada curta para cards e listas */
  description: string;
  /** notas de degustação, texto corrido */
  tastingNotes: string;
  /** temperatura de serviço sugerida, texto livre (ex. "16–18 °C") */
  servingTemp: string;
  images: ProductImage[];
  stockQty: number;
  lowStockThreshold: number;
  featured: boolean;
  /** visível na loja */
  isActive: boolean;
  createdAt: string; // ISO
}

export const ORDER_STATUSES = [
  "recebido",
  "pago",
  "separado",
  "despachado",
  "entregue",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderEvent {
  status: OrderStatus;
  at: string; // ISO
  note?: string;
}

export interface OrderItem {
  wineId: string;
  /** desnormalizado p/ histórico não mudar quando o produto muda */
  name: string;
  producer: string;
  vintage: number | null;
  unitPriceCents: number;
  qty: number;
  imageUrl: string;
}

export interface Customer {
  name: string;
  email: string;
  cpf: string;
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  /** número curto exibido ao cliente, ex. "EP-1042" */
  reference: string;
  customer: Customer;
  shipping: ShippingAddress;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: OrderStatus;
  events: OrderEvent[];
  createdAt: string; // ISO
}
