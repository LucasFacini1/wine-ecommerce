"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Wine, WineType } from "@/types";
import { shippingForSubtotal } from "@/lib/format";

/* ------------------------------------------------------------------ *
 *  Carrinho — estado do cliente, persistido em localStorage.
 *  Guarda um snapshot do vinho no momento de adicionar, então o
 *  drawer/carrinho renderizam sem nova ida ao banco. O preço é
 *  revalidado no servidor durante o checkout.
 * ------------------------------------------------------------------ */

const CART_KEY = "padox.cart"; // guarda o snapshot completo do vinho

function isValidLine(l: unknown): l is CartLine {
  if (!l || typeof l !== "object") return false;
  const x = l as Record<string, unknown>;
  return (
    typeof x.id === "string" &&
    typeof x.slug === "string" &&
    typeof x.name === "string" &&
    typeof x.type === "string" &&
    typeof x.priceCents === "number" &&
    typeof x.qty === "number" &&
    x.qty > 0
  );
}

export interface CartSnapshot {
  id: string;
  slug: string;
  name: string;
  producer: string;
  type: WineType;
  vintage: number | null;
  region: string;
  grapes: string[];
  priceCents: number;
  imageUrl: string;
  stockQty: number;
}

export interface CartLine extends CartSnapshot {
  qty: number;
}

export interface CartLineDetailed {
  wine: CartSnapshot;
  qty: number;
  lineCents: number;
}

function snapshot(wine: Wine): CartSnapshot {
  return {
    id: wine.id,
    slug: wine.slug,
    name: wine.name,
    producer: wine.producer,
    type: wine.type,
    vintage: wine.vintage,
    region: wine.region,
    grapes: wine.grapes,
    priceCents: wine.priceCents,
    imageUrl: wine.images[0]?.url ?? "",
    stockQty: wine.stockQty,
  };
}

interface StoreValue {
  cart: CartLine[];
  cartLines: CartLineDetailed[];
  cartCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  addToCart: (wine: Wine, qty?: number) => void;
  setQty: (wineId: string, qty: number) => void;
  removeFromCart: (wineId: string) => void;
  clearCart: () => void;

  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- hidratação client-only */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCart(Array.isArray(parsed) ? parsed.filter(isValidLine) : []);
      }
      // limpa chaves antigas (formato pré-Supabase e marca anterior)
      localStorage.removeItem("vinaria.cart");
      localStorage.removeItem("vinaria.cart.v2");
      sessionStorage.removeItem("vinaria.orders");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  const cartLines = useMemo<CartLineDetailed[]>(
    () =>
      cart.map((line) => {
        const { qty, ...wine } = line;
        return { wine, qty, lineCents: wine.priceCents * qty };
      }),
    [cart],
  );

  const subtotalCents = cartLines.reduce((s, l) => s + l.lineCents, 0);
  const shippingCents = shippingForSubtotal(subtotalCents);
  const totalCents = subtotalCents + shippingCents;
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback((wine: Wine, qty = 1) => {
    setCart((cur) => {
      const found = cur.find((l) => l.id === wine.id);
      if (found) {
        return cur.map((l) =>
          l.id === wine.id ? { ...l, qty: l.qty + qty } : l,
        );
      }
      return [...cur, { ...snapshot(wine), qty }];
    });
    setCartOpen(true);
  }, []);

  const setQty = useCallback((wineId: string, qty: number) => {
    setCart((cur) =>
      qty <= 0
        ? cur.filter((l) => l.id !== wineId)
        : cur.map((l) => (l.id === wineId ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((wineId: string) => {
    setCart((cur) => cur.filter((l) => l.id !== wineId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value: StoreValue = {
    cart,
    cartLines,
    cartCount,
    subtotalCents,
    shippingCents,
    totalCents,
    addToCart,
    setQty,
    removeFromCart,
    clearCart,
    cartOpen,
    openCart,
    closeCart,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
