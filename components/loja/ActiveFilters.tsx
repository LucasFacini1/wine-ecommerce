"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { formatBRL, WINE_TYPE_LABEL } from "@/lib/format";

export function ActiveFilters({ priceMax }: { priceMax: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const types = (params.get("tipo") ?? "").split(",").filter(Boolean);
  const regiao = params.get("regiao") ?? "";
  const uva = params.get("uva") ?? "";
  const q = params.get("q") ?? "";
  const precoMax = Number(params.get("precoMax") ?? priceMax);

  const chips: { key: string; label: string; clear: () => void }[] = [];
  const mutate = (fn: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params.toString());
    fn(p);
    const qs = p.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  for (const t of types) {
    chips.push({
      key: `t-${t}`,
      label: WINE_TYPE_LABEL[t],
      clear: () =>
        mutate((p) => {
          const next = types.filter((x) => x !== t);
          if (next.length) p.set("tipo", next.join(","));
          else p.delete("tipo");
        }),
    });
  }
  if (regiao)
    chips.push({
      key: "regiao",
      label: regiao,
      clear: () => mutate((p) => p.delete("regiao")),
    });
  if (uva)
    chips.push({
      key: "uva",
      label: uva,
      clear: () => mutate((p) => p.delete("uva")),
    });
  if (q)
    chips.push({
      key: "q",
      label: `"${q}"`,
      clear: () => mutate((p) => p.delete("q")),
    });
  if (precoMax < priceMax)
    chips.push({
      key: "preco",
      label: `Até ${formatBRL(precoMax)}`,
      clear: () => mutate((p) => p.delete("precoMax")),
    });

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.clear}
          className="inline-flex items-center gap-1.5 border border-oxblood/30 bg-wine-tint px-2.5 py-1 font-sans text-[0.68rem] uppercase tracking-[0.12em] text-oxblood transition-colors hover:bg-oxblood hover:text-on-dark"
        >
          {c.label}
          <X size={12} strokeWidth={2} />
        </button>
      ))}
      <button
        type="button"
        onClick={() => router.push(pathname, { scroll: false })}
        className="font-sans text-[0.68rem] uppercase tracking-[0.14em] text-bone-faint underline-offset-4 hover:text-bone hover:underline"
      >
        Limpar tudo
      </button>
    </div>
  );
}
