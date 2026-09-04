"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/vinhos", label: "Todos os vinhos" },
  { href: "/vinhos?tipo=tinto", label: "Tintos" },
  { href: "/vinhos?tipo=branco", label: "Brancos" },
  { href: "/vinhos?tipo=espumante", label: "Espumantes" },
  { href: "/sobre", label: "O Empório" },
];

export function Masthead() {
  const pathname = usePathname();
  const { cartCount, openCart } = useStore();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-ink/85 backdrop-blur-md transition-shadow",
        scrolled ? "border-b border-line shadow-[0_1px_0_rgba(0,0,0,0.02)]" : "border-b border-transparent",
      )}
    >
      <div className="hidden items-center justify-center border-b border-line-soft py-2 text-center md:flex">
        <p className="label label-brass">
          Frete grátis acima de R$ 300 · entregamos para todo o Brasil
        </p>
      </div>

      <div className="wrap flex h-16 items-center justify-between gap-6 md:h-20">
        <div className="flex flex-1 items-center gap-4 md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            className="text-bone-dim"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        </div>

        <Link href="/" aria-label="Empório Padox — início">
          <Wordmark size="md" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/vinhos"
                ? pathname === "/vinhos"
                : pathname + "" === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "font-sans text-[0.7rem] uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "text-oxblood"
                    : "text-bone-dim hover:text-bone",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-4 md:gap-5">
          <Link
            href="/vinhos"
            aria-label="Buscar vinhos"
            className="text-bone-dim transition-colors hover:text-bone"
          >
            <Search size={18} strokeWidth={1.5} />
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 text-bone-dim transition-colors hover:text-bone"
            aria-label={`Abrir carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span className="hidden font-sans text-[0.7rem] uppercase tracking-[0.16em] lg:inline">
              Carrinho
            </span>
            {cartCount > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-oxblood px-1 font-sans text-[0.65rem] tabular-nums text-on-dark">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink md:hidden">
          <div className="wrap flex h-16 items-center justify-between">
            <Wordmark size="md" />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="text-bone-dim"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="wrap mt-6 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-line-soft py-4 font-display text-xl text-bone"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
