import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveWines, getWineBySlug, relatedWines } from "@/lib/data/wines";
import { ProductGallery } from "@/components/loja/ProductGallery";
import { AddToCart } from "@/components/loja/AddToCart";
import { BuyBar } from "@/components/loja/BuyBar";
import { ProductCard } from "@/components/loja/ProductCard";
import { SectionHeading } from "@/components/loja/SectionHeading";
import { Price } from "@/components/ui/Price";
import { Tag } from "@/components/ui/Tag";
import { formatABV, WINE_TYPE_LABEL } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) return {};
  return {
    title: `${wine.name} ${wine.vintage ?? ""}`.trim(),
    description: wine.description,
  };
}

export default async function WinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) notFound();

  const low = wine.stockQty <= wine.lowStockThreshold;
  const related = relatedWines(await getActiveWines(), wine);

  const spec: [string, string][] = [
    ["Tipo", WINE_TYPE_LABEL[wine.type]],
    ["Safra", wine.vintage ? String(wine.vintage) : "Sem safra"],
    ["Uva", wine.grapes.join(", ")],
    ["Região", wine.region],
    ["País", wine.country],
    ["Teor alcoólico", formatABV(wine.abv)],
    ["Servir a", wine.servingTemp],
    ["Produtor", wine.producer],
  ];

  return (
    <div className="wrap py-10 pb-24 md:py-14 md:pb-14">
      <nav className="mb-8 flex items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-bone-faint">
        <Link href="/vinhos" className="hover:text-bone">
          Catálogo
        </Link>
        <span>/</span>
        <Link
          href={`/vinhos?tipo=${wine.type}`}
          className="hover:text-bone"
        >
          {WINE_TYPE_LABEL[wine.type]}
        </Link>
        <span>/</span>
        <span className="text-bone-dim">{wine.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <ProductGallery wine={wine} />

        <div className="flex flex-col">
          <div className="flex items-baseline justify-between gap-4">
            <p className="label label-brass">{wine.producer}</p>
            <span className="vintage text-3xl text-bone-dim">
              {wine.vintage ?? "N.V."}
            </span>
          </div>

          <h1 className="mt-2 font-display text-4xl leading-tight text-bone md:text-5xl">
            {wine.name}
          </h1>

          <p className="mt-3 font-text text-lg italic text-bone-dim">
            {wine.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Price
              cents={wine.priceCents}
              className="font-display text-3xl text-bone"
            />
            {low ? (
              <Tag tone="warn">Só {wine.stockQty} em estoque</Tag>
            ) : (
              <Tag tone="ok">Em estoque</Tag>
            )}
          </div>

          <div className="mt-7">
            <AddToCart wine={wine} />
          </div>

          <hr className="rule my-8" />

          <div>
            <p className="label mb-3">Ficha técnica</p>
            <dl className="grid grid-cols-2 gap-x-6">
              {spec.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 border-b border-line-soft py-2.5"
                >
                  <dt className="font-sans text-xs uppercase tracking-[0.14em] text-bone-faint">
                    {k}
                  </dt>
                  <dd className="text-right font-sans text-sm text-bone">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8">
            <p className="label mb-3">Na taça</p>
            <p className="font-text text-lg leading-relaxed text-bone/90">
              {wine.tastingNotes}
            </p>
          </div>

          <div className="mt-8">
            <p className="label mb-3">Combina com</p>
            <div className="flex flex-wrap gap-2">
              {wine.pairings.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <SectionHeading
          label="Se gostou desse"
          title="Talvez também"
          link={{ href: "/vinhos", text: "Ver o catálogo" }}
        />
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {related.map((w) => (
            <ProductCard key={w.id} wine={w} />
          ))}
        </div>
      </section>

      <BuyBar wine={wine} />
    </div>
  );
}
