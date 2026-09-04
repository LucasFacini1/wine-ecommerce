import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAdminOrders } from "@/lib/data/orders";
import { getAdminWines } from "@/lib/data/wines";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge, StockBadge } from "@/components/admin/StatusBadge";
import { AdvanceOrder } from "@/components/admin/AdvanceOrder";
import { formatBRL, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, wines] = await Promise.all([
    getAdminOrders(),
    getAdminWines(),
  ]);

  const open = orders.filter((o) => o.status !== "entregue");
  const toPack = orders.filter((o) => o.status === "pago");
  const revenue = orders
    .filter((o) => o.status !== "recebido")
    .reduce((s, o) => s + o.totalCents, 0);
  const lowStock = wines.filter((w) => w.stockQty <= w.lowStockThreshold);
  const recent = orders.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-display text-3xl text-bone">Painel</h1>
        <p className="mt-1 font-sans text-sm text-bone-dim">
          Visão geral da operação — pedidos, faturamento e estoque.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pedidos abertos"
          value={open.length}
          sub="Ainda não entregues"
        />
        <StatCard
          label="Aguardando separação"
          value={toPack.length}
          sub="Pagos, prontos para embalar"
          accent={toPack.length > 0}
        />
        <StatCard
          label="Faturamento"
          value={formatBRL(revenue)}
          sub="Pedidos pagos"
        />
        <StatCard
          label="Estoque baixo"
          value={lowStock.length}
          sub="Rótulos no limite ou abaixo"
          accent={lowStock.length > 0}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="border border-line bg-ink-soft">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <h2 className="font-display text-lg text-bone">Precisa de ação</h2>
            <Link
              href="/admin/pedidos?status=pago"
              className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone-faint hover:text-oxblood"
            >
              Ver pedidos
            </Link>
          </div>
          {toPack.length === 0 ? (
            <p className="px-5 py-8 font-sans text-sm text-bone-faint">
              Nada pendente. Tudo separado.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {toPack.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-sans text-sm text-bone hover:text-oxblood"
                    >
                      {o.reference}
                    </Link>
                    <p className="truncate font-sans text-xs text-bone-faint">
                      {o.customer.name} · {formatBRL(o.totalCents)}
                    </p>
                  </div>
                  <AdvanceOrder
                    orderId={o.id}
                    status={o.status}
                    size="sm"
                    variant="outline"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-line bg-ink-soft">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <h2 className="font-display text-lg text-bone">Estoque baixo</h2>
            <Link
              href="/admin/produtos"
              className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone-faint hover:text-oxblood"
            >
              Ver produtos
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 font-sans text-sm text-bone-faint">
              Nenhum rótulo no limite.
            </p>
          ) : (
            <ul className="divide-y divide-line-soft">
              {lowStock.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/produtos/${w.id}`}
                      className="font-sans text-sm text-bone hover:text-oxblood"
                    >
                      {w.name} {w.vintage ?? ""}
                    </Link>
                    <p className="truncate font-sans text-xs text-bone-faint">
                      {w.producer}
                    </p>
                  </div>
                  <StockBadge
                    qty={w.stockQty}
                    threshold={w.lowStockThreshold}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="border border-line bg-ink-soft">
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
          <h2 className="font-display text-lg text-bone">Pedidos recentes</h2>
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center gap-1.5 font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone-faint hover:text-oxblood"
          >
            Todos <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="label border-b border-line-soft [&>th]:px-5 [&>th]:py-3 [&>th]:font-medium">
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th className="text-right">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="font-sans text-sm">
              {recent.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-line-soft last:border-0 [&>td]:px-5 [&>td]:py-3"
                >
                  <td>
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="text-bone hover:text-oxblood"
                    >
                      {o.reference}
                    </Link>
                  </td>
                  <td className="text-bone-dim">{o.customer.name}</td>
                  <td className="text-bone-faint">{formatDate(o.createdAt)}</td>
                  <td className="text-right tabular-nums text-bone-dim">
                    {formatBRL(o.totalCents)}
                  </td>
                  <td>
                    <OrderStatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center font-sans text-sm text-bone-faint"
                  >
                    Nenhum pedido ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
