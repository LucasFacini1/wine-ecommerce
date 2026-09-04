import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminOrder } from "@/lib/data/orders";
import { OrderTimeline } from "@/components/OrderTimeline";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { AdvanceOrder } from "@/components/admin/AdvanceOrder";
import { formatBRL, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const s = order.shipping;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-bone-faint hover:text-bone"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Pedidos
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <h1 className="font-display text-3xl text-bone">{order.reference}</h1>
          <OrderStatusBadge status={order.status} />
          <span className="font-sans text-sm text-bone-faint">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          <section className="border border-line bg-ink-soft p-6">
            <h2 className="label mb-5">Fluxo do pedido</h2>
            <OrderTimeline events={order.events} current={order.status} />
            <div className="mt-6 border-t border-line-soft pt-5">
              <AdvanceOrder orderId={order.id} status={order.status} withNote />
            </div>
          </section>

          <section className="border border-line bg-ink-soft">
            <h2 className="label border-b border-line-soft px-6 py-4">Itens</h2>
            <table className="w-full text-left">
              <tbody className="font-sans text-sm">
                {order.items.map((it, i) => (
                  <tr
                    key={`${it.wineId}-${i}`}
                    className="border-b border-line-soft last:border-0 [&>td]:px-6 [&>td]:py-3.5"
                  >
                    <td className="text-bone">
                      {it.name}{" "}
                      <span className="vintage text-bone-faint">
                        {it.vintage ?? "N.V."}
                      </span>
                      <span className="block text-xs text-bone-faint">
                        {it.producer}
                      </span>
                    </td>
                    <td className="text-bone-faint tabular-nums">
                      {it.qty} × {formatBRL(it.unitPriceCents)}
                    </td>
                    <td className="text-right tabular-nums text-bone-dim">
                      {formatBRL(it.unitPriceCents * it.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="border border-line bg-ink-soft p-6">
            <h2 className="label mb-3">Cliente</h2>
            <p className="font-sans text-sm leading-relaxed text-bone-dim">
              {order.customer.name}
              <br />
              {order.customer.email}
              <br />
              CPF {order.customer.cpf}
            </p>
          </div>

          <div className="border border-line bg-ink-soft p-6">
            <h2 className="label mb-3">Entrega</h2>
            <p className="font-sans text-sm leading-relaxed text-bone-dim">
              {s.street}, {s.number}
              {s.complement ? ` — ${s.complement}` : ""}
              <br />
              {s.district}
              <br />
              {s.city}/{s.state} · CEP {s.cep}
            </p>
          </div>

          <div className="border border-line bg-ink-soft p-6">
            <h2 className="label mb-3">Pagamento</h2>
            <dl className="flex flex-col gap-2 font-sans text-sm">
              <div className="flex justify-between text-bone-dim">
                <dt>Subtotal</dt>
                <dd className="text-bone">{formatBRL(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-bone-dim">
                <dt>Frete</dt>
                <dd className="text-bone">
                  {order.shippingCents === 0
                    ? "Grátis"
                    : formatBRL(order.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-display text-base text-bone">
                <dt>Total</dt>
                <dd>{formatBRL(order.totalCents)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
