import { Suspense } from "react";
import type { Metadata } from "next";
import { getActiveWines, getCatalogFacets } from "@/lib/data/wines";
import { FilterBar } from "@/components/loja/FilterBar";
import { ActiveFilters } from "@/components/loja/ActiveFilters";
import { ProductCard } from "@/components/loja/ProductCard";
import type { Wine } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todos os vinhos do Empório Padox: tintos, brancos, rosés, espumantes e vinhos de contato, filtráveis por tipo, região, uva e preço.",
};

type SP = Record<string, string | string[] | undefined>;

function applyFilters(sp: SP, wines: Wine[], priceCeil: number): Wine[] {
  const one = (k: string) =>
    typeof sp[k] === "string" ? (sp[k] as string) : "";
  const types = one("tipo").split(",").filter(Boolean);
  const regiao = one("regiao");
  const uva = one("uva");
  const q = one("q").trim().toLowerCase();
  const precoMax = Number(one("precoMax")) || priceCeil;
  const ordem = one("ordem") || "curadoria";

  let list = wines.filter((w) => {
    if (types.length && !types.includes(w.type)) return false;
    if (regiao && w.region !== regiao) return false;
    if (uva && !w.grapes.includes(uva)) return false;
    if (w.priceCents > precoMax) return false;
    if (q) {
      const hay = [w.name, w.producer, w.region, w.country, ...w.grapes]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  switch (ordem) {
    case "preco-asc":
      list = [...list].sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "preco-desc":
      list = [...list].sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "novos":
      list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    default:
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  return list;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const [sp, allWines, facets] = await Promise.all([
    searchParams,
    getActiveWines(),
    getCatalogFacets(),
  ]);
  const wines = applyFilters(sp, allWines, facets.priceMax);

  return (
    <div className="wrap py-14 md:py-16">
      <header className="border-b border-line pb-6">
        <p className="label label-brass">O catálogo inteiro</p>
        <h1 className="mt-3 font-display text-4xl text-bone md:text-5xl">
          {allWines.length}{" "}
          {allWines.length === 1 ? "rótulo" : "rótulos"}, nada de enchimento
        </h1>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Suspense fallback={<div className="h-96 border border-line" />}>
            <FilterBar
              regions={facets.regions}
              grapes={facets.grapes}
              priceMin={facets.priceMin}
              priceMax={facets.priceMax}
            />
          </Suspense>
        </aside>

        <div>
          <Suspense fallback={null}>
            <ActiveFilters priceMax={facets.priceMax} />
          </Suspense>

          <p className="label mb-6">
            {wines.length} {wines.length === 1 ? "vinho" : "vinhos"}
          </p>

          {wines.length === 0 ? (
            <div className="border border-line bg-ink-soft p-12 text-center">
              <p className="font-display text-2xl text-bone">
                Nada com esses filtros
              </p>
              <p className="mt-2 font-sans text-sm text-bone-dim">
                Tente afrouxar o preço ou tirar uma das restrições.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
              {wines.map((wine, i) => (
                <ProductCard key={wine.id} wine={wine} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
