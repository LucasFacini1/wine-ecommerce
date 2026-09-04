import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { Newsletter } from "./Newsletter";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink-soft">
      <div className="wrap grid gap-14 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark size="lg" />
          <p className="mt-4 max-w-xs font-text text-[0.95rem] leading-relaxed text-bone-dim">
            Uma seleção pequena e teimosa de vinhos de produtor. Provamos tudo
            antes de trazer — se não colocaríamos na nossa mesa, não entra no
            catálogo.
          </p>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="label mb-1">Comprar</p>
          {[
            ["Todos os vinhos", "/vinhos"],
            ["Tintos", "/vinhos?tipo=tinto"],
            ["Brancos", "/vinhos?tipo=branco"],
            ["Espumantes", "/vinhos?tipo=espumante"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="font-sans text-sm text-bone-dim transition-colors hover:text-bone"
            >
              {label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-3">
          <p className="label mb-1">A casa</p>
          {[
            ["O Empório", "/sobre"],
            ["Entrega e trocas", "/entrega-e-trocas"],
            ["Painel admin", "/admin"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="font-sans text-sm text-bone-dim transition-colors hover:text-bone"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className="label mb-1">Newsletter</p>
          <p className="font-sans text-sm text-bone-dim">
            Uma carta por mês: o que chegou, o que abrimos, o que sobrou pouco.
          </p>
          <Newsletter />
        </div>
      </div>

      <div className="border-t border-line-soft">
        <div className="wrap flex flex-col gap-2 py-6 text-bone-faint md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-xs">
            © {new Date().getFullYear()} Empório Padox Ltda. Beba com moderação.
            Venda proibida para menores de 18 anos.
          </p>
          <p className="font-sans text-xs">
            Entregamos para todo o Brasil.
          </p>
        </div>
      </div>
    </footer>
  );
}
