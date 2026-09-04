"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Slider from "@radix-ui/react-slider";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { inputClass } from "@/components/ui/Field";
import { formatBRL, WINE_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/cn";

const TYPES = ["tinto", "branco", "rosé", "espumante", "laranja"];

const ORDER_OPTIONS = [
  { value: "curadoria", label: "Curadoria da casa" },
  { value: "preco-asc", label: "Preço: menor primeiro" },
  { value: "preco-desc", label: "Preço: maior primeiro" },
  { value: "novos", label: "Chegaram por último" },
];

export function FilterBar({
  regions,
  grapes,
  priceMin,
  priceMax,
}: {
  regions: string[];
  grapes: string[];
  priceMin: number;
  priceMax: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeTypes = (params.get("tipo") ?? "")
    .split(",")
    .filter(Boolean);
  const regiao = params.get("regiao") ?? "";
  const uva = params.get("uva") ?? "";
  const ordem = params.get("ordem") ?? "curadoria";
  const qParam = params.get("q") ?? "";
  const precoParam = Number(params.get("precoMax") ?? priceMax);

  const [q, setQ] = useState(qParam);
  const [preco, setPreco] = useState(precoParam);
  const [open, setOpen] = useState(false);

  // ressincroniza o estado local quando a URL muda por fora (links, "limpar")
  const [prevQParam, setPrevQParam] = useState(qParam);
  if (qParam !== prevQParam) {
    setPrevQParam(qParam);
    setQ(qParam);
  }
  const [prevPrecoParam, setPrevPrecoParam] = useState(precoParam);
  if (precoParam !== prevPrecoParam) {
    setPrevPrecoParam(precoParam);
    setPreco(precoParam);
  }

  const activeCount =
    activeTypes.length +
    (regiao ? 1 : 0) +
    (uva ? 1 : 0) +
    (qParam ? 1 : 0) +
    (precoParam < priceMax ? 1 : 0);

  const push = useCallback(
    (mut: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(params.toString());
      mut(p);
      const qs = p.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const hasFilters =
    activeTypes.length > 0 ||
    !!regiao ||
    !!uva ||
    !!qParam ||
    precoParam < priceMax;

  // debounce da busca
  useEffect(() => {
    const t = setTimeout(() => {
      if (q === qParam) return;
      push((p) => {
        if (q) p.set("q", q);
        else p.delete("q");
      });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // debounce do preço
  useEffect(() => {
    const t = setTimeout(() => {
      if (preco === precoParam) return;
      push((p) => {
        if (preco < priceMax) p.set("precoMax", String(preco));
        else p.delete("precoMax");
      });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preco]);

  const toggleType = (t: string) => {
    const next = activeTypes.includes(t)
      ? activeTypes.filter((x) => x !== t)
      : [...activeTypes, t];
    push((p) => {
      if (next.length) p.set("tipo", next.join(","));
      else p.delete("tipo");
    });
  };

  const regionOptions = useMemo(
    () => [
      { value: "", label: "Todas as regiões" },
      ...regions.map((r) => ({ value: r, label: r })),
    ],
    [regions],
  );
  const grapeOptions = useMemo(
    () => [
      { value: "", label: "Todas as uvas" },
      ...grapes.map((g) => ({ value: g, label: g })),
    ],
    [grapes],
  );

  return (
    <div className="border border-line bg-ink-soft">
      {/* alternador — só no mobile */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3.5 lg:hidden"
      >
        <span className="flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone">
          <SlidersHorizontal size={14} strokeWidth={1.5} />
          Filtros
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-oxblood px-1 text-[0.65rem] text-on-dark">
              {activeCount}
            </span>
          )}
        </span>
        <span className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone-faint">
          {open ? "Fechar" : "Abrir"}
        </span>
      </button>

      <div className={cn("lg:block", open ? "block" : "hidden")}>
      <div className="flex items-center border-y border-line-soft lg:border-t-0">
        <Search
          size={16}
          strokeWidth={1.5}
          className="ml-3.5 shrink-0 text-bone-faint"
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, produtor ou uva…"
          className={cn(inputClass, "border-0 bg-transparent focus:border-0")}
        />
        {q && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => setQ("")}
            className="mr-3 text-bone-faint hover:text-bone"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line-soft p-4">
        {TYPES.map((t) => {
          const on = activeTypes.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={cn(
                "border px-3 py-1.5 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors",
                on
                  ? "border-brass bg-brass/10 text-brass-bright"
                  : "border-line text-bone-dim hover:border-bone-faint hover:text-bone",
              )}
            >
              {WINE_TYPE_LABEL[t]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 p-4 md:grid-cols-4">
        <Select
          label="Região"
          options={regionOptions}
          value={regiao}
          onChange={(e) =>
            push((p) => {
              if (e.target.value) p.set("regiao", e.target.value);
              else p.delete("regiao");
            })
          }
        />
        <Select
          label="Uva"
          options={grapeOptions}
          value={uva}
          onChange={(e) =>
            push((p) => {
              if (e.target.value) p.set("uva", e.target.value);
              else p.delete("uva");
            })
          }
        />
        <div className="flex flex-col gap-1.5">
          <label className="label">
            Até {formatBRL(preco)}
          </label>
          <Slider.Root
            className="relative flex h-11 w-full touch-none items-center"
            min={priceMin}
            max={priceMax}
            step={500}
            value={[preco]}
            onValueChange={([v]) => setPreco(v)}
          >
            <Slider.Track className="relative h-[2px] w-full grow bg-line">
              <Slider.Range className="absolute h-full bg-brass" />
            </Slider.Track>
            <Slider.Thumb
              aria-label="Preço máximo"
              className="block h-4 w-4 rounded-full border border-brass bg-ink outline-none focus-visible:ring-2 focus-visible:ring-brass"
            />
          </Slider.Root>
        </div>
        <Select
          label="Ordenar"
          options={ORDER_OPTIONS}
          value={ordem}
          onChange={(e) =>
            push((p) => {
              if (e.target.value && e.target.value !== "curadoria")
                p.set("ordem", e.target.value);
              else p.delete("ordem");
            })
          }
        />
      </div>

      {hasFilters && (
        <div className="border-t border-line-soft px-4 py-3">
          <button
            type="button"
            onClick={() => router.push(pathname, { scroll: false })}
            className="inline-flex items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-bone-faint hover:text-oxblood"
          >
            <X size={13} strokeWidth={1.5} />
            Limpar filtros
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
