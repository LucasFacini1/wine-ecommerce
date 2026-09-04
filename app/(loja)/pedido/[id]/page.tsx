import Link from "next/link";
import { getPublicOrder } from "@/lib/data/orders";
import { OrderTimeline } from "@/components/OrderTimeline";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Tag } from "@/components/ui/Tag";
import { formatBRL, formatDate, ORDER_STATUS_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getPublicOrder(id);

  if (!order) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="font-display text-4xl text-bone">
          Pedido não encontrado
        </h1>
        <p className="mx-auto mt-3 max-w-md font-text text-lg text-bone-dim">
          Confira o link do seu e-mail de confirmação.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/vinhos">Voltar ao catálogo</Link>
        </Button>
      </div>
    );
  }

  const s = order.shipping;
  const isRecebido = order.status === "recebido";

  return (
    <div className="wrap py-14 md:py-16">
      <header className="border-b border-line pb-8">
        <p className="label label-brass">
          {isRecebido ? "Pedido recebido" : "Pedido confirmado"}
        </p>
        <h1 className="mt-3 font-display text-4xl text-bone md:text-5xl">
          {isRecebido ? "Recebemos seu pedido" : "Tudo certo com seu pedido"}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="font-sans text-sm text-bone-dim">
            Nº <span className="text-bone">{order.reference}</span>
          </span>
          <span className="font-sans text-sm text-bone-faint">
            {formatDate(order.createdAt)}
          </span>
          <Tag tone={isRecebido ? "warn" : "ok"}>
            {ORDER_STATUS_LABEL[order.status]}
          </Tag>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <section>
            <p className="label mb-5">Acompanhamento</p>
            <OrderTimeline events={order.events} current={order.status} />
            {isRecebido && (
              <p className="mt-6 border border-line-soft bg-ink-soft p-4 font-sans text-sm text-bone-dim">
                Assim que o pagamento for confirmado, o status muda para{" "}
                <strong className="text-bone">Pago</strong> automaticamente.
                Você recebe um e-mail a cada etapa.
              </p>
            )}
          </section>

          <section>
            <p className="label mb-4">Itens</p>
            <ul className="divide-y divide-line-soft border-y border-line-soft">
              {order.items.map((it, i) => (
                <li key={`${it.wineId}-${i}`} className="flex gap-4 py-4">
                  <div className="aspect-[4/5] w-14 shrink-0 overflow-hidden border border-line bg-ink-soft">
                    {it.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <span className="font-display text-base text-bone">
                      {it.name}{" "}
                      <span className="vintage text-bone-dim">
                        {it.vintage ?? "N.V."}
                      </span>
                    </span>
                    <span className="font-sans text-xs text-bone-faint">
                      {it.producer} · {it.qty} × {formatBRL(it.unitPriceCents)}
                    </span>
                  </div>
                  <Price
                    cents={it.unitPriceCents * it.qty}
                    className="self-center text-sm text-bone-dim"
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="border border-line bg-ink-soft p-6">
            <p className="label mb-4">Pagamento</p>
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
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-display text-lg text-bone">Total</span>
              <Price
                cents={order.totalCents}
                className="font-display text-2xl text-bone"
              />
            </div>
          </div>

          <div className="border border-line bg-ink-soft p-6">
            <p className="label mb-3">Entrega</p>
            <p className="font-sans text-sm leading-relaxed text-bone-dim">
              {order.customer.name}
              <br />
              {s.street}, {s.number}
              {s.complement ? ` — ${s.complement}` : ""}
              <br />
              {s.district} · {s.city}/{s.state}
              <br />
              CEP {s.cep}
            </p>
          </div>

          <Button asChild variant="outline" size="md">
            <Link href="/vinhos">Continuar comprando</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
