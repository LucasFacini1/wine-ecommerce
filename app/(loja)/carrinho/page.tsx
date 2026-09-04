"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { ProductImage } from "@/components/ProductImage";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Price } from "@/components/ui/Price";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  formatBRL,
} from "@/lib/format";

export default function CartPage() {
  const {
    cartLines,
    setQty,
    removeFromCart,
    subtotalCents,
    shippingCents,
    totalCents,
  } = useStore();

  if (cartLines.length === 0) {
    return (
      <div className="wrap py-24 text-center">
        <p className="label label-brass">Carrinho</p>
        <h1 className="mt-3 font-display text-4xl text-bone">
          Ainda está vazio
        </h1>
        <p className="mx-auto mt-3 max-w-sm font-text text-lg text-bone-dim">
          Nada aqui dentro. Vá até o catálogo e escolha uma garrafa para
          começar.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/vinhos">Ver os vinhos</Link>
        </Button>
      </div>
    );
  }

  const missingForFree = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;

  return (
    <div className="wrap py-14 md:py-16">
      <header className="border-b border-line pb-6">
        <p className="label label-brass">Carrinho</p>
        <h1 className="mt-3 font-display text-4xl text-bone md:text-5xl">
          Sua seleção
        </h1>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-line-soft border-y border-line-soft">
          {cartLines.map(({ wine, qty, lineCents }) => (
            <li key={wine.id} className="flex gap-5 py-6">
              <Link
                href={`/vinhos/${wine.slug}`}
                className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden border border-line"
              >
                <ProductImage wine={wine} sizes="96px" />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="label">{wine.producer}</p>
                  <span className="vintage text-bone-dim">
                    {wine.vintage ?? "N.V."}
                  </span>
                </div>
                <Link
                  href={`/vinhos/${wine.slug}`}
                  className="mt-1 font-display text-xl text-bone hover:text-brass-bright"
                >
                  {wine.name}
                </Link>
                <p className="mt-0.5 font-text text-sm italic text-bone-faint">
                  {wine.region}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                  <div className="flex items-center gap-3">
                    <Stepper
                      value={qty}
                      onChange={(n) => setQty(wine.id, n)}
                      min={1}
                      max={12}
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCart(wine.id)}
                      aria-label={`Remover ${wine.name}`}
                      className="text-bone-faint transition-colors hover:text-danger"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  <Price cents={lineCents} className="text-bone" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-ink-soft p-6">
            <p className="label mb-4">Resumo</p>

            <dl className="flex flex-col gap-2.5 font-sans text-sm">
              <div className="flex justify-between text-bone-dim">
                <dt>Subtotal</dt>
                <dd className="text-bone">{formatBRL(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-bone-dim">
                <dt>Frete</dt>
                <dd className="text-bone">
                  {shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}
                </dd>
              </div>
            </dl>

            {missingForFree > 0 && (
              <p className="mt-3 border border-line-soft bg-ink px-3 py-2 font-sans text-xs text-bone-faint">
                Faltam {formatBRL(missingForFree)} para o frete sair de graça.
              </p>
            )}

            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="font-display text-lg text-bone">Total</span>
              <Price
                cents={totalCents}
                className="font-display text-2xl text-bone"
              />
            </div>

            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/checkout">Ir para a entrega</Link>
            </Button>
            <p className="mt-3 text-center font-sans text-[0.7rem] text-bone-faint">
              Pagamento por Pix, boleto ou cartão via Mercado Pago.
            </p>
          </div>

          <Link
            href="/vinhos"
            className="mt-4 block text-center font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone-faint hover:text-bone"
          >
            Continuar escolhendo
          </Link>
        </aside>
      </div>
    </div>
  );
}
