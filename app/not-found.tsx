import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="label label-brass">Erro 404</p>
      <p className="mt-4 font-display text-6xl text-bone md:text-8xl">
        Garrafa não encontrada
      </p>
      <p className="mt-5 max-w-md font-text text-lg leading-relaxed text-bone-dim">
        A página que você procurou saiu de linha ou nunca existiu. Acontece — o
        catálogo muda a cada safra.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
        <Link
          href="/"
          className="border border-oxblood bg-oxblood px-6 py-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-on-dark transition-colors hover:bg-oxblood-bright"
        >
          Voltar ao início
        </Link>
        <Link
          href="/vinhos"
          className="link-underline font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone-dim hover:text-bone"
        >
          Ver o catálogo
        </Link>
      </div>
    </div>
  );
}
