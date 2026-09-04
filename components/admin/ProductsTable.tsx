"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Wine } from "@/types";
import { StockBadge } from "@/components/admin/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { inputClass } from "@/components/ui/Field";
import { formatBRL, WINE_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ProductsTable({ products }: { products: Wine[] }) {
  const [q, setQ] = useState("");

  const filtered = products.filter((w) => {
    if (!q.trim()) return true;
    const hay =
      `${w.name} ${w.producer} ${w.region} ${w.grapes.join(" ")}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-sm items-center border border-line bg-ink-soft">
        <Search size={15} strokeWidth={1.5} className="ml-3 text-bone-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, produtor, uva…"
          className={cn(inputClass, "border-0 bg-transparent")}
        />
      </div>

      <div className="overflow-x-auto border border-line bg-ink-soft">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="label border-b border-line-soft [&>th]:px-5 [&>th]:py-3 [&>th]:font-medium">
              <th>Vinho</th>
              <th>Tipo</th>
              <th>Safra</th>
              <th className="text-right">Preço</th>
              <th>Estoque</th>
              <th>Loja</th>
              <th />
            </tr>
          </thead>
          <tbody className="font-sans text-sm">
            {filtered.map((w) => (
              <tr
                key={w.id}
                className="border-b border-line-soft transition-colors last:border-0 hover:bg-ink-raise [&>td]:px-5 [&>td]:py-3.5"
              >
                <td>
                  <span className="text-bone">{w.name}</span>
                  <span className="block text-xs text-bone-faint">
                    {w.producer} · {w.region}
                  </span>
                </td>
                <td className="text-bone-dim">{WINE_TYPE_LABEL[w.type]}</td>
                <td className="text-bone-faint tabular-nums">
                  {w.vintage ?? "N.V."}
                </td>
                <td className="text-right tabular-nums text-bone-dim">
                  {formatBRL(w.priceCents)}
                </td>
                <td>
                  <StockBadge
                    qty={w.stockQty}
                    threshold={w.lowStockThreshold}
                  />
                </td>
                <td>
                  {w.isActive ? (
                    <Tag tone="ok">Visível</Tag>
                  ) : (
                    <Tag tone="neutral">Oculto</Tag>
                  )}
                </td>
                <td className="text-right">
                  <Link
                    href={`/admin/produtos/${w.id}`}
                    className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone-faint hover:text-oxblood"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center font-sans text-sm text-bone-faint"
                >
                  Nenhum produto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
