"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Order } from "@/types";
import { ORDER_STATUSES } from "@/types";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { inputClass } from "@/components/ui/Field";
import { formatBRL, formatDate, ORDER_STATUS_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

export function OrdersTable({
  orders,
  initialStatus = "todos",
}: {
  orders: Order[];
  initialStatus?: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [q, setQ] = useState("");

  const filtered = orders
    .filter((o) => (status === "todos" ? true : o.status === status))
    .filter((o) => {
      if (!q.trim()) return true;
      const hay =
        `${o.reference} ${o.customer.name} ${o.customer.email}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {["todos", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "border px-3 py-1.5 font-sans text-[0.68rem] uppercase tracking-[0.14em] transition-colors",
              status === s
                ? "border-oxblood bg-oxblood/10 text-oxblood"
                : "border-line text-bone-dim hover:text-bone",
            )}
          >
            {s === "todos" ? "Todos" : ORDER_STATUS_LABEL[s as never]}
          </button>
        ))}
      </div>

      <div className="flex max-w-sm items-center border border-line bg-ink-soft">
        <Search size={15} strokeWidth={1.5} className="ml-3 text-bone-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nº, nome ou e-mail"
          className={cn(inputClass, "border-0 bg-transparent")}
        />
      </div>

      <div className="overflow-x-auto border border-line bg-ink-soft">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="label border-b border-line-soft [&>th]:px-5 [&>th]:py-3 [&>th]:font-medium">
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Data</th>
              <th className="text-right">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="font-sans text-sm">
            {filtered.map((o) => (
              <tr
                key={o.id}
                className="border-b border-line-soft transition-colors last:border-0 hover:bg-ink-raise [&>td]:px-5 [&>td]:py-3.5"
              >
                <td>
                  <Link
                    href={`/admin/pedidos/${o.id}`}
                    className="text-bone hover:text-oxblood"
                  >
                    {o.reference}
                  </Link>
                </td>
                <td className="text-bone-dim">
                  {o.customer.name}
                  <span className="block text-xs text-bone-faint">
                    {o.customer.email}
                  </span>
                </td>
                <td className="text-bone-faint tabular-nums">
                  {o.items.reduce((s, it) => s + it.qty, 0)}
                </td>
                <td className="text-bone-faint">{formatDate(o.createdAt)}</td>
                <td className="text-right tabular-nums text-bone-dim">
                  {formatBRL(o.totalCents)}
                </td>
                <td>
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center font-sans text-sm text-bone-faint"
                >
                  Nenhum pedido com esse filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
