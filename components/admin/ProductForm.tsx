"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import type { Wine, WineType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { upsertProductAction } from "@/app/admin/actions";
import { BottlePlate } from "@/components/BottlePlate";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { formatBRL, WINE_TYPE_LABEL } from "@/lib/format";

const TYPE_OPTIONS = (
  ["tinto", "branco", "rosé", "espumante", "laranja"] as WineType[]
).map((t) => ({ value: t, label: WINE_TYPE_LABEL[t] }));

export function ProductForm({ initial }: { initial?: Wine }) {
  const router = useRouter();
  const isEdit = !!initial;
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [producer, setProducer] = useState(initial?.producer ?? "");
  const [type, setType] = useState<WineType>(initial?.type ?? "tinto");
  const [vintage, setVintage] = useState(
    initial?.vintage ? String(initial.vintage) : "",
  );
  const [grapes, setGrapes] = useState(initial?.grapes.join(", ") ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [country, setCountry] = useState(initial?.country ?? "Brasil");
  const [priceReais, setPriceReais] = useState(
    initial ? (initial.priceCents / 100).toFixed(2) : "",
  );
  const [abv, setAbv] = useState(initial ? String(initial.abv) : "");
  const [servingTemp, setServingTemp] = useState(initial?.servingTemp ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tastingNotes, setTastingNotes] = useState(initial?.tastingNotes ?? "");
  const [pairings, setPairings] = useState(initial?.pairings.join(", ") ?? "");
  const [stockQty, setStockQty] = useState(
    initial ? String(initial.stockQty) : "0",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initial ? String(initial.lowStockThreshold) : "6",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.images[0]?.url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const stockNum = Number(stockQty) || 0;
  const lowNum = Number(lowStockThreshold) || 0;
  const lowWarning = stockNum <= lowNum;

  const grapesArr = grapes
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const preview = useMemo(
    () => ({
      name: name || "Nome do vinho",
      producer: producer || "Produtor",
      type,
      vintage: vintage ? Number(vintage) : null,
      region: region || "Região",
      grapes: grapesArr.length ? grapesArr : ["Uva"],
    }),
    [name, producer, type, vintage, region, grapes], // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${initial?.id ?? "novo"}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-photos")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage
        .from("product-photos")
        .getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch {
      setError("Falha no upload da foto.");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const price = Math.round(parseFloat(priceReais.replace(",", ".")) * 100);
    if (!name.trim() || !producer.trim()) {
      setError("Nome e produtor são obrigatórios.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    startTransition(async () => {
      const res = await upsertProductAction({
        id: initial?.id,
        name: name.trim(),
        producer: producer.trim(),
        type,
        vintage: vintage ? Number(vintage) : null,
        grapes: grapesArr,
        region: region.trim(),
        country: country.trim(),
        pairings: pairings.split(",").map((p) => p.trim()).filter(Boolean),
        abv: Number(abv) || 0,
        priceCents: price,
        description: description.trim(),
        tastingNotes: tastingNotes.trim(),
        servingTemp: servingTemp.trim(),
        stockQty: stockNum,
        lowStockThreshold: lowNum,
        featured,
        isActive,
        imageUrl:
          imageUrl && imageUrl !== initial?.images[0]?.url
            ? imageUrl
            : undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/admin/produtos");
      router.refresh();
    });
  }

  const busy = pending || uploading;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-2 font-sans text-[0.72rem] uppercase tracking-[0.14em] text-bone-faint hover:text-bone"
        >
          <ArrowLeft size={13} strokeWidth={1.5} /> Produtos
        </Link>
        <h1 className="mt-3 font-display text-3xl text-bone">
          {isEdit ? `Editar — ${initial?.name}` : "Novo produto"}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <Field
              label="Produtor"
              value={producer}
              onChange={(e) => setProducer(e.target.value)}
            />
            <Select
              label="Tipo"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value as WineType)}
            />
            <Field
              label="Safra"
              inputMode="numeric"
              placeholder="Deixe vazio para sem safra"
              value={vintage}
              onChange={(e) => setVintage(e.target.value.replace(/\D/g, ""))}
            />
            <Field
              label="Teor alcoólico (%)"
              inputMode="decimal"
              value={abv}
              onChange={(e) => setAbv(e.target.value)}
            />
            <Field
              label="Uvas (separadas por vírgula)"
              value={grapes}
              onChange={(e) => setGrapes(e.target.value)}
              containerClassName="sm:col-span-2"
            />
            <Field
              label="Região"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
            <Field
              label="País"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
            <Field
              label="Preço (R$)"
              inputMode="decimal"
              placeholder="0,00"
              value={priceReais}
              onChange={(e) => setPriceReais(e.target.value)}
            />
            <Field
              label="Servir a"
              placeholder="16–18 °C"
              value={servingTemp}
              onChange={(e) => setServingTemp(e.target.value)}
            />
          </fieldset>

          <TextArea
            label="Chamada curta"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            hint="Aparece nos cards e no topo da ficha."
          />
          <TextArea
            label="Notas de degustação"
            value={tastingNotes}
            onChange={(e) => setTastingNotes(e.target.value)}
          />
          <Field
            label="Harmonizações (separadas por vírgula)"
            value={pairings}
            onChange={(e) => setPairings(e.target.value)}
          />

          <fieldset className="grid gap-5 border-t border-line-soft pt-6 sm:grid-cols-2">
            <Field
              label="Estoque (unidades)"
              inputMode="numeric"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value.replace(/\D/g, ""))}
            />
            <Field
              label="Alerta de estoque baixo"
              inputMode="numeric"
              value={lowStockThreshold}
              onChange={(e) =>
                setLowStockThreshold(e.target.value.replace(/\D/g, ""))
              }
            />
            {lowWarning && (
              <p className="flex items-center gap-2 border border-warn/40 bg-warn-bg px-3 py-2 font-sans text-xs text-warn sm:col-span-2">
                <AlertTriangle size={13} strokeWidth={1.5} />
                Estoque no limite ou abaixo — este rótulo entra no alerta do
                painel.
              </p>
            )}
            <label className="flex items-center gap-3 font-sans text-sm text-bone-dim">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-oxblood)]"
              />
              Destacar na home
            </label>
            <label className="flex items-center gap-3 font-sans text-sm text-bone-dim">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-oxblood)]"
              />
              Visível na loja
            </label>
          </fieldset>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
          <p className="label">Prévia</p>
          <div className="relative aspect-[4/5] border border-line bg-ink-soft">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Foto do produto"
                className="h-full w-full object-cover"
              />
            ) : (
              <BottlePlate wine={preview} />
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-ink/70">
                <Loader2
                  size={22}
                  className="animate-spin text-oxblood"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-line px-3 py-3 font-sans text-xs uppercase tracking-[0.14em] text-bone-faint hover:border-oxblood hover:text-oxblood">
            <ImagePlus size={14} strokeWidth={1.5} />
            {imageUrl ? "Trocar foto" : "Enviar foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
              disabled={uploading}
            />
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="font-sans text-[0.7rem] uppercase tracking-[0.14em] text-bone-faint hover:text-danger"
            >
              Remover foto
            </button>
          )}
          <p className="font-sans text-sm text-bone-dim">
            {preview.name} —{" "}
            {formatBRL(
              Math.round(
                parseFloat(priceReais.replace(",", ".") || "0") * 100,
              ),
            )}
          </p>
        </aside>
      </div>

      {error && (
        <p className="border border-danger/40 bg-danger-bg px-4 py-2.5 font-sans text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <Button type="submit" size="lg" disabled={busy}>
          {pending
            ? "Salvando…"
            : isEdit
              ? "Salvar alterações"
              : "Criar produto"}
        </Button>
        <Link
          href="/admin/produtos"
          className="font-sans text-[0.72rem] uppercase tracking-[0.16em] text-bone-faint hover:text-bone"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
