import "server-only";
import type { Order } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder } from "./map";
import type { OrderEventRow, OrderItemRow, OrderRow } from "@/types/database";

const SELECT = "*, order_items(*), order_events(*)";

type Row = OrderRow & {
  order_items: OrderItemRow[];
  order_events: OrderEventRow[];
};

function toOrder(row: Row): Order {
  return mapOrder(row, row.order_items ?? [], row.order_events ?? []);
}

/** Todos os pedidos (painel admin — exige sessão de admin por RLS). */
export async function getAdminOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getAdminOrders: ${error.message}`);
  return (data as Row[]).map(toOrder);
}

/** Um pedido pelo id ou pela referência (EP-…), para o painel admin. */
export async function getAdminOrder(idOrRef: string): Promise<Order | null> {
  const supabase = await createClient();
  const column = idOrRef.startsWith("EP-") ? "reference" : "id";
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .eq(column, idOrRef)
    .maybeSingle();

  if (error) throw new Error(`getAdminOrder: ${error.message}`);
  return data ? toOrder(data as Row) : null;
}

/**
 * Pedido para a página pública de confirmação. Só por `id` (UUID, não
 * adivinhável) — a referência EP-xxxx é sequencial e não serve de token.
 * Usa a service role porque o anônimo não lê `orders` (RLS).
 */
export async function getPublicOrder(id: string): Promise<Order | null> {
  if (!/^[0-9a-f-]{20,}$/i.test(id)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getPublicOrder: ${error.message}`);
  return data ? toOrder(data as Row) : null;
}
