import { getAdminOrders } from "@/lib/data/orders";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const orders = await getAdminOrders();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl text-bone">Pedidos</h1>
        <p className="mt-1 font-sans text-sm text-bone-dim">
          {orders.length} no total
        </p>
      </header>

      <OrdersTable orders={orders} initialStatus={status ?? "todos"} />
    </div>
  );
}
