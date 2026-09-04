import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveWines } from "@/lib/data/wines";
import { BottlePlate } from "@/components/BottlePlate";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/loja/ProductCard";
import { SectionHeading } from "@/components/loja/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";

export const dynamic = "force-dynamic";

const CRITERIA = [
  {
    n: "01",
    title: "Quem faz",
    body: "Produtores pequenos, de preferência com a mão na tesoura de poda. Nada de marca sem rosto.",
  },
  {
    n: "02",
    title: "Como faz",
    body: "Intervenção mínima na vinha e na adega. Menos aditivo, mais lugar dentro da garrafa.",
  },
  {
    n: "03",
    title: "Se a gente bebe",
    body: "O teste final é banal: abrimos a garrafa no jantar. Se some rápido, entra no catálogo.",
  },
];

const COLLECTIONS = [
  { label: "Para carne e fogo", tipo: "tinto" as const },
  { label: "Para a mesa de peixe", tipo: "branco" as const },
  { label: "Para começar a noite", tipo: "espumante" as const },
];

export default async function HomePage() {
  const wines = await getActiveWines();

  if (wines.length === 0) {
    return (
      <div className="wrap py-32 text-center">
        <p className="label label-brass">Empório Padox</p>
        <h1 className="mt-4 font-display text-4xl text-bone">
          Catálogo em preparação
        </h1>
        <p className="mx-auto mt-3 max-w-sm font-text text-lg text-bone-dim">
          Nenhum vinho publicado ainda. Cadastre os primeiros rótulos no painel.
        </p>
      </div>
    );
  }

  const newest = wines.slice(0, 4);
  const hero = wines.find((w) => w.featured) ?? wines[0];
  const spotlight = [...wines].sort((a, b) => a.stockQty - b.stockQty)[0];

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="wrap grid items-center gap-10 pt-14 pb-20 md:grid-cols-[1.05fr_0.95fr] md:pt-20 md:pb-28">
        <div>
          <p className="label label-brass">Seleção da casa</p>
          <h1 className="mt-5 font-display text-[2.75rem] leading-[0.98] text-bone md:text-[4.25rem]">
            Vinho de gente
            <br />
            que faz vinho.
          </h1>
          <p className="mt-6 max-w-md font-text text-lg leading-relaxed text-bone-dim">
            Um catálogo curto e cabeça-dura: rótulos de produtor que a gente
            provou, gostou e trouxe. Sem prateleira infinita, sem enrolação.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/vinhos">
                Ver o catálogo
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </Button>
            <Link
              href="/sobre"
              className="link-underline font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone-dim hover:text-bone"
            >
              Como a gente escolhe
            </Link>
          </div>
        </div>

        <div className="relative">
          {hero.vintage && (
            <span
              className="pointer-events-none absolute -right-2 -top-10 select-none font-display text-[9rem] leading-none text-ink-raise md:text-[12rem]"
              aria-hidden
            >
              {hero.vintage}
            </span>
          )}
          <Link
            href={`/vinhos/${hero.slug}`}
            className="relative mx-auto block aspect-[4/5] max-w-sm border border-line bg-ink-soft"
          >
            <ProductImage wine={hero} priority sizes="(min-width: 768px) 40vw, 90vw" />
          </Link>
          <div className="relative mx-auto mt-4 flex max-w-sm items-baseline justify-between">
            <p className="font-text italic text-bone-dim">
              {hero.name} — {hero.region}
            </p>
            <Price cents={hero.priceCents} className="text-bone" />
          </div>
        </div>
      </section>

      {/* ---------- faixa de valores ---------- */}
      <section className="border-y border-line">
        <div className="wrap grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            ["Provado antes de trazer", "Nada entra no site sem passar pela nossa mesa."],
            ["Entrega climatizada", "Caixa térmica em trajetos longos, sem custo extra."],
            ["Produtor pequeno", "Vinhos de safra limitada — quando acaba, acabou."],
          ].map(([t, d]) => (
            <div key={t} className="py-7 md:px-8 md:first:pl-0 md:last:pr-0">
              <p className="font-display text-lg text-bone">{t}</p>
              <p className="mt-1 font-sans text-sm text-bone-faint">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- novidades ---------- */}
      <section className="wrap py-20 md:py-24">
        <SectionHeading
          label="Chegou agora"
          title="Novidades na adega"
          link={{ href: "/vinhos", text: "Ver todos os vinhos" }}
        />
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {newest.map((wine, i) => (
            <ProductCard key={wine.id} wine={wine} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* ---------- critérios ---------- */}
      <section className="border-y border-line bg-ink-soft">
        <div className="wrap grid gap-12 py-20 md:grid-cols-[0.8fr_1.2fr] md:py-24">
          <div>
            <p className="label label-brass">O método</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-bone md:text-[2.5rem]">
              Três perguntas antes de qualquer garrafa entrar.
            </h2>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            {CRITERIA.map((c) => (
              <li key={c.n}>
                <span className="vintage block text-4xl text-oxblood">
                  {c.n}
                </span>
                <h3 className="mt-3 font-display text-xl text-bone">{c.title}</h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-bone-dim">
                  {c.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- coleções ---------- */}
      <section className="wrap py-20 md:py-24">
        <SectionHeading label="Atalhos" title="Escolha pela ocasião" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {COLLECTIONS.map((col) => {
            const w = wines.find((x) => x.type === col.tipo) ?? wines[0];
            return (
              <Link
                key={col.label}
                href={`/vinhos?tipo=${col.tipo}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden border border-line bg-ink-soft p-6"
              >
                <div className="absolute inset-y-0 right-0 w-1/2 opacity-70 transition-transform duration-700 group-hover:scale-105">
                  <BottlePlate wine={w} variant="label" />
                </div>
                <div className="relative">
                  <p className="label label-brass">Coleção</p>
                  <p className="mt-2 font-display text-2xl text-bone">
                    {col.label}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-bone-dim group-hover:text-oxblood">
                    Explorar <ArrowRight size={13} strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- spotlight ---------- */}
      <section className="border-y border-line bg-wine-tint">
        <div className="wrap grid items-center gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-20">
          <Link
            href={`/vinhos/${spotlight.slug}`}
            className="relative mx-auto block aspect-[4/5] w-full max-w-xs border border-oxblood/20"
          >
            <ProductImage wine={spotlight} sizes="(min-width: 768px) 35vw, 90vw" />
          </Link>
          <div>
            <p className="label label-brass">
              {spotlight.stockQty <= spotlight.lowStockThreshold
                ? `Últimas ${spotlight.stockQty} garrafas`
                : "Em destaque"}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-bone md:text-[2.75rem]">
              {spotlight.name}
              {spotlight.vintage ? `, ${spotlight.vintage}` : ""}
            </h2>
            <p className="mt-4 max-w-lg font-text text-lg leading-relaxed text-bone-dim">
              {spotlight.tastingNotes || spotlight.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button asChild variant="outline" size="lg">
                <Link href={`/vinhos/${spotlight.slug}`}>Ver a ficha</Link>
              </Button>
              <Price
                cents={spotlight.priceCents}
                className="font-display text-2xl text-bone"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
