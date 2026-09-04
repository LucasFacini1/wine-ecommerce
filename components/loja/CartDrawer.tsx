"use client";

import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { BottlePlate } from "@/components/BottlePlate";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Price } from "@/components/ui/Price";
import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  formatBRL,
} from "@/lib/format";

export function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    cartLines,
    cartCount,
    setQty,
    removeFromCart,
    subtotalCents,
    shippingCents,
  } = useStore();

  const pct = Math.min(
    100,
    Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100),
  );
  const missing = FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents;

  return (
    <Dialog.Root open={cartOpen} onOpenChange={(o) => !o && closeCart()}>
      <AnimatePresence>
        {cartOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-bone/30 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[27rem] flex-col bg-ink shadow-xl"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <Dialog.Title className="font-display text-xl text-bone">
                    Seu carrinho
                    {cartCount > 0 && (
                      <span className="ml-2 font-sans text-sm text-bone-faint">
                        ({cartCount})
                      </span>
                    )}
                  </Dialog.Title>
                  <Dialog.Close
                    aria-label="Fechar carrinho"
                    className="text-bone-dim transition-colors hover:text-bone"
                  >
                    <X size={19} strokeWidth={1.5} />
                  </Dialog.Close>
                </div>

                {cartLines.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                    <ShoppingBag
                      size={28}
                      strokeWidth={1}
                      className="text-bone-faint"
                    />
                    <p className="font-display text-2xl text-bone">
                      Carrinho vazio
                    </p>
                    <p className="font-sans text-sm text-bone-dim">
                      Escolha uma garrafa para começar.
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href="/vinhos" onClick={closeCart}>
                        Ver os vinhos
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="border-b border-line-soft px-5 py-3">
                      {missing > 0 ? (
                        <p className="font-sans text-xs text-bone-dim">
                          Faltam{" "}
                          <span className="text-bone">{formatBRL(missing)}</span>{" "}
                          para o frete grátis
                        </p>
                      ) : (
                        <p className="font-sans text-xs text-ok">
                          Você ganhou frete grátis
                        </p>
                      )}
                      <div className="mt-2 h-1 w-full overflow-hidden bg-line">
                        <div
                          className="h-full bg-oxblood transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <ul className="flex-1 divide-y divide-line-soft overflow-y-auto px-5">
                      {cartLines.map(({ wine, qty, lineCents }) => (
                        <li key={wine.id} className="flex gap-4 py-4">
                          <Link
                            href={`/vinhos/${wine.slug}`}
                            onClick={closeCart}
                            className="aspect-[4/5] w-16 shrink-0 border border-line"
                          >
                            <BottlePlate wine={wine} />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <Link
                              href={`/vinhos/${wine.slug}`}
                              onClick={closeCart}
                              className="font-display text-base leading-tight text-bone hover:text-oxblood"
                            >
                              {wine.name}
                            </Link>
                            <p className="mt-0.5 font-sans text-xs text-bone-faint">
                              {wine.producer}
                            </p>
                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              <Stepper
                                value={qty}
                                onChange={(n) => setQty(wine.id, n)}
                                min={1}
                                max={12}
                                className="scale-90 origin-left"
                              />
                              <div className="flex items-center gap-3">
                                <Price
                                  cents={lineCents}
                                  className="text-sm text-bone"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(wine.id)}
                                  aria-label={`Remover ${wine.name}`}
                                  className="text-bone-faint transition-colors hover:text-danger"
                                >
                                  <Trash2 size={15} strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-line px-5 py-5">
                      <dl className="flex flex-col gap-1.5 font-sans text-sm">
                        <div className="flex justify-between text-bone-dim">
                          <dt>Subtotal</dt>
                          <dd className="text-bone">
                            {formatBRL(subtotalCents)}
                          </dd>
                        </div>
                        <div className="flex justify-between text-bone-dim">
                          <dt>Frete</dt>
                          <dd className="text-bone">
                            {shippingCents === 0
                              ? "Grátis"
                              : formatBRL(shippingCents)}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-4 grid gap-2">
                        <Button asChild size="md" className="w-full">
                          <Link href="/checkout" onClick={closeCart}>
                            Finalizar compra
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          <Link href="/carrinho" onClick={closeCart}>
                            Ver carrinho completo
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
