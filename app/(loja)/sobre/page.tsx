import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "O Empório",
  description:
    "Como nasceu o Empório Padox, o que a gente procura numa garrafa e por que o catálogo é tão curto.",
};

export default function SobrePage() {
  return (
    <article className="wrap-narrow py-16 md:py-24">
      <p className="label label-brass">A casa</p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-bone md:text-6xl">
        Começou com uma adega pequena demais e uma teimosia grande demais.
      </h1>

      <div className="mt-10 flex flex-col gap-6 font-text text-lg leading-relaxed text-bone/90">
        <p>
          O Empório Padox nasceu de um incômodo: prateleira cheia de rótulo que
          ninguém provou, ficha técnica copiada do importador, e aquela sensação
          de que a escolha era entre marcas, não entre vinhos. A gente queria o
          contrário — um lugar onde alguém tivesse aberto cada garrafa antes de
          colocá-la à venda.
        </p>
        <p>
          Então o catálogo é curto de propósito: poucos rótulos por temporada,
          renovados conforme a safra acaba. Cada um vem de produtor pequeno,
          quase sempre de gente que poda a própria vinha, e passou pela nossa
          mesa num jantar comum de terça-feira. Se a garrafa esvaziou rápido e
          alguém perguntou “que vinho é esse?”, ela entra.
        </p>
        <p>
          Trabalhamos com viticultores do Rio Grande do Sul, do Douro, da
          Campanha, do Etna e de mais um punhado de lugares onde ainda se faz
          vinho com as mãos. Preferimos intervenção mínima, sulfitagem baixa e
          rótulos honestos. Não temos nada contra tecnologia — temos contra
          maquiagem.
        </p>
      </div>

      <hr className="rule my-12" />

      <h2 className="font-display text-2xl text-bone">O que você encontra aqui</h2>
      <ul className="mt-6 flex flex-col gap-4">
        {[
          [
            "Ficha de verdade",
            "Uva, safra, região, teor alcoólico, temperatura de serviço e uma nota de degustação escrita por quem bebeu — não pelo assessor de marketing.",
          ],
          [
            "Estoque real",
            "Quando dizemos “últimas garrafas”, são últimas garrafas. O número no site é o número na adega.",
          ],
          [
            "Entrega com cuidado",
            "Caixa térmica em trajetos longos ou em dias quentes, sem cobrar a mais por isso.",
          ],
        ].map(([t, d]) => (
          <li key={t} className="border-l-2 border-brass pl-4">
            <p className="font-display text-lg text-bone">{t}</p>
            <p className="mt-1 font-sans text-sm leading-relaxed text-bone-dim">
              {d}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-14">
        <Button asChild size="lg">
          <Link href="/vinhos">Ver a seleção atual</Link>
        </Button>
      </div>
    </article>
  );
}
