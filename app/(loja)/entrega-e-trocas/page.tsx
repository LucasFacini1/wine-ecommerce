import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrega e trocas",
  description:
    "Prazos, fretes, embalagem térmica e política de troca do Empório Padox.",
};

const BLOCKS: { h: string; items: [string, string][] }[] = [
  {
    h: "Prazos e frete",
    items: [
      [
        "Capitais do Sul e Sudeste",
        "2 a 4 dias úteis após a confirmação do pagamento.",
      ],
      ["Demais regiões", "4 a 8 dias úteis, conforme a transportadora."],
      [
        "Frete grátis",
        "Para pedidos acima de R$ 300. Abaixo disso, taxa fixa de R$ 29,90 em qualquer lugar do país.",
      ],
    ],
  },
  {
    h: "Embalagem",
    items: [
      [
        "Proteção individual",
        "Cada garrafa vai em berço de papelão rígido, dentro de caixa reforçada.",
      ],
      [
        "Caixa térmica",
        "Incluída sem custo em trajetos longos ou quando a previsão passa de 30 °C na rota.",
      ],
    ],
  },
  {
    h: "Recebimento",
    items: [
      [
        "Maior de 18 anos",
        "A entrega só é feita mediante assinatura de pessoa maior de idade, com documento.",
      ],
      [
        "Conferência",
        "Abra a caixa na frente do entregador sempre que possível. Garrafa quebrada no transporte é trocada sem custo.",
      ],
    ],
  },
  {
    h: "Trocas e devolução",
    items: [
      [
        "Arrependimento",
        "Você tem 7 dias corridos após o recebimento para desistir da compra, conforme o Código de Defesa do Consumidor. As garrafas devem estar lacradas.",
      ],
      [
        "Vinho com defeito",
        "Rolha comprometida, vinho oxidado ou avinagrado: fotografe, escreva para a gente e enviamos outra garrafa ou devolvemos o valor.",
      ],
      [
        "Como solicitar",
        "Responda o e-mail de confirmação do pedido com o número (EP-xxxx) e o motivo. Resolvemos em até 2 dias úteis.",
      ],
    ],
  },
];

export default function EntregaPage() {
  return (
    <article className="wrap-narrow py-16 md:py-24">
      <p className="label label-brass">Ajuda</p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-bone md:text-5xl">
        Entrega e trocas
      </h1>
      <p className="mt-5 font-text text-lg leading-relaxed text-bone-dim">
        O essencial sobre como o vinho chega até você e o que fazer se algo sair
        errado.
      </p>

      <div className="mt-12 flex flex-col gap-12">
        {BLOCKS.map((block) => (
          <section key={block.h}>
            <h2 className="border-b border-line pb-3 font-display text-2xl text-bone">
              {block.h}
            </h2>
            <dl className="mt-5 flex flex-col gap-4">
              {block.items.map(([t, d]) => (
                <div key={t} className="grid gap-1 sm:grid-cols-[200px_1fr]">
                  <dt className="font-sans text-xs uppercase tracking-[0.14em] text-brass">
                    {t}
                  </dt>
                  <dd className="font-sans text-sm leading-relaxed text-bone-dim">
                    {d}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </article>
  );
}
