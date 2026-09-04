import type { Order, OrderEvent, OrderItem, Wine } from "@/types";
import type {
  OrderEventRow,
  OrderItemRow,
  OrderRow,
  ProductImageRow,
  ProductRow,
} from "@/types/database";

/** Linha `products` (+ imagens) → domínio `Wine`. */
export function mapWine(
  row: ProductRow,
  images: ProductImageRow[] = [],
): Wine {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    producer: row.producer,
    type: row.type,
    vintage: row.vintage,
    grapes: row.grapes ?? [],
    region: row.region,
    country: row.country,
    pairings: row.pairings ?? [],
    abv: Number(row.abv),
    priceCents: row.price_cents,
    description: row.description,
    tastingNotes: row.tasting_notes,
    servingTemp: row.serving_temp,
    images: [...images]
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ url: i.url, alt: i.alt })),
    stockQty: row.stock_qty,
    lowStockThreshold: row.low_stock_threshold,
    featured: row.featured,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function mapEvent(row: OrderEventRow): OrderEvent {
  return {
    status: row.status,
    at: row.created_at,
    note: row.note ?? undefined,
  };
}

function mapItem(row: OrderItemRow): OrderItem {
  return {
    wineId: row.product_id ?? "",
    name: row.name,
    producer: row.producer,
    vintage: row.vintage,
    unitPriceCents: row.unit_price_cents,
    qty: row.qty,
    imageUrl: row.image_url,
  };
}

/** Linha `orders` (+ itens + eventos) → domínio `Order`. */
export function mapOrder(
  row: OrderRow,
  items: OrderItemRow[] = [],
  events: OrderEventRow[] = [],
): Order {
  return {
    id: row.id,
    reference: row.reference,
    customer: {
      name: row.customer_name,
      email: row.customer_email,
      cpf: row.customer_cpf,
    },
    shipping: {
      cep: row.shipping_cep,
      street: row.shipping_street,
      number: row.shipping_number,
      complement: row.shipping_complement ?? undefined,
      district: row.shipping_district,
      city: row.shipping_city,
      state: row.shipping_state,
    },
    items: items.map(mapItem),
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    status: row.status,
    events: [...events]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map(mapEvent),
    createdAt: row.created_at,
  };
}
