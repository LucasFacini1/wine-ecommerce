"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { BottlePlate } from "@/components/BottlePlate";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Price } from "@/components/ui/Price";
import { formatBRL, formatCEP, formatCPF } from "@/lib/format";

interface Form {
  name: string;
  email: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

const EMPTY: Form = {
  name: "",
  email: "",
  cpf: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartLines, subtotalCents, shippingCents, totalCents, clearCart } =
    useStore();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (k: keyof Form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  if (cartLines.length === 0 && !submitting) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="font-display text-4xl text-bone">Carrinho vazio</h1>
        <p className="mx-auto mt-3 max-w-sm font-text text-lg text-bone-dim">
          Escolha ao menos uma garrafa antes de fechar o pedido.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/vinhos">Ver os vinhos</Link>
        </Button>
      </div>
    );
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (form.name.trim().length < 3) e.name = "Informe seu nome completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "E-mail inválido.";
    if (form.cpf.replace(/\D/g, "").length !== 11)
      e.cpf = "CPF deve ter 11 dígitos.";
    if (form.cep.replace(/\D/g, "").length !== 8)
      e.cep = "CEP deve ter 8 dígitos.";
    if (!form.street.trim()) e.street = "Obrigatório.";
    if (!form.number.trim()) e.number = "Obrigatório.";
    if (!form.district.trim()) e.district = "Obrigatório.";
    if (!form.city.trim()) e.city = "Obrigatório.";
    if (form.state.trim().length !== 2) e.state = "UF.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ productId: l.id, qty: l.qty })),
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            cpf: formatCPF(form.cpf),
          },
          shipping: {
            cep: formatCEP(form.cep),
            street: form.street.trim(),
            number: form.number.trim(),
            complement: form.complement.trim() || undefined,
            district: form.district.trim(),
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Falha ao gerar o pedido.");
      clearCart();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/pedido/${data.orderId}`);
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Falha ao gerar o pedido.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="wrap py-14 md:py-16">
      <header className="border-b border-line pb-6">
        <p className="label label-brass">Passo 1 de 2 — Entrega</p>
        <h1 className="mt-3 font-display text-4xl text-bone md:text-5xl">
          Para onde vai o vinho
        </h1>
      </header>

      <form
        onSubmit={onSubmit}
        className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-5">
            <legend className="label mb-2">Seus dados</legend>
            <Field
              label="Nome completo"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
                autoComplete="email"
                hint="Para o comprovante e o rastreio."
              />
              <Field
                label="CPF"
                inputMode="numeric"
                value={form.cpf}
                onChange={(e) => set("cpf", formatCPF(e.target.value))}
                error={errors.cpf}
                placeholder="000.000.000-00"
              />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-5">
            <legend className="label mb-2">Endereço de entrega</legend>
            <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
              <Field
                label="CEP"
                inputMode="numeric"
                value={form.cep}
                onChange={(e) => set("cep", formatCEP(e.target.value))}
                error={errors.cep}
                placeholder="00000-000"
              />
              <Field
                label="Rua / logradouro"
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
                error={errors.street}
                autoComplete="address-line1"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <Field
                label="Número"
                value={form.number}
                onChange={(e) => set("number", e.target.value)}
                error={errors.number}
              />
              <Field
                label="Complemento"
                value={form.complement}
                onChange={(e) => set("complement", e.target.value)}
                hint="Opcional"
              />
              <Field
                label="Bairro"
                value={form.district}
                onChange={(e) => set("district", e.target.value)}
                error={errors.district}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-[1fr_120px]">
              <Field
                label="Cidade"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                error={errors.city}
              />
              <Field
                label="UF"
                value={form.state}
                maxLength={2}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
                error={errors.state}
              />
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-ink-soft p-6">
            <p className="label mb-4">Seu pedido</p>
            <ul className="flex flex-col gap-4 border-b border-line-soft pb-4">
              {cartLines.map(({ wine, qty, lineCents }) => (
                <li key={wine.id} className="flex gap-3">
                  <div className="aspect-[4/5] w-12 shrink-0 border border-line">
                    <BottlePlate wine={wine} />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-display text-sm text-bone">
                      {wine.name}
                    </span>
                    <span className="font-sans text-xs text-bone-faint">
                      {qty} × {formatBRL(wine.priceCents)}
                    </span>
                  </div>
                  <Price
                    cents={lineCents}
                    className="text-sm text-bone-dim"
                  />
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-2 font-sans text-sm">
              <div className="flex justify-between text-bone-dim">
                <dt>Subtotal</dt>
                <dd className="text-bone">{formatBRL(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between text-bone-dim">
                <dt>Frete</dt>
                <dd className="text-bone">
                  {shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-display text-lg text-bone">Total</span>
              <Price
                cents={totalCents}
                className="font-display text-2xl text-bone"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full"
              disabled={submitting}
            >
              {submitting ? "Abrindo pagamento…" : "Pagar com Mercado Pago"}
            </Button>
            {submitError && (
              <p className="mt-3 border border-danger/40 bg-danger-bg px-3 py-2 font-sans text-xs text-danger">
                {submitError}
              </p>
            )}
            <p className="mt-3 text-center font-sans text-[0.7rem] leading-relaxed text-bone-faint">
              Você será levado ao ambiente seguro do Mercado Pago — Pix, boleto
              ou cartão.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
