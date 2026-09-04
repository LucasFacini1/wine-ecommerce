"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import type { WineType } from "@/types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type ActionResult = { ok: true } | { ok: false; error: string };

/** Avança o pedido um passo no fluxo (chama a função no banco). */
export async function advanceOrderAction(
  orderId: string,
  note?: string,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Sem acesso." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("advance_order_status", {
    p_order_id: orderId,
    p_note: note?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true };
}

export interface ProductInput {
  id?: string;
  name: string;
  producer: string;
  type: WineType;
  vintage: number | null;
  grapes: string[];
  region: string;
  country: string;
  pairings: string[];
  abv: number;
  priceCents: number;
  description: string;
  tastingNotes: string;
  servingTemp: string;
  stockQty: number;
  lowStockThreshold: number;
  featured: boolean;
  isActive: boolean;
  /** URL pública de uma foto recém-enviada; substitui a imagem principal */
  imageUrl?: string;
}

export async function upsertProductAction(
  input: ProductInput,
): Promise<ActionResult & { slug?: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Sem acesso." };
  if (!input.name.trim() || !input.producer.trim()) {
    return { ok: false, error: "Nome e produtor são obrigatórios." };
  }
  if (!Number.isFinite(input.priceCents) || input.priceCents <= 0) {
    return { ok: false, error: "Preço inválido." };
  }

  const supabase = await createClient();
  const row = {
    name: input.name.trim(),
    producer: input.producer.trim(),
    type: input.type,
    vintage: input.vintage,
    grapes: input.grapes,
    region: input.region.trim(),
    country: input.country.trim(),
    pairings: input.pairings,
    abv: input.abv,
    price_cents: input.priceCents,
    description: input.description.trim(),
    tasting_notes: input.tastingNotes.trim(),
    serving_temp: input.servingTemp.trim(),
    stock_qty: input.stockQty,
    low_stock_threshold: input.lowStockThreshold,
    featured: input.featured,
    is_active: input.isActive,
  };

  let productId = input.id;

  if (productId) {
    const { error } = await supabase
      .from("products")
      .update(row)
      .eq("id", productId);
    if (error) return { ok: false, error: error.message };
  } else {
    const slug = slugify(`${input.name} ${input.vintage ?? ""}`);
    const { data, error } = await supabase
      .from("products")
      .insert({ ...row, slug })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    productId = data.id;
  }

  if (input.imageUrl) {
    await supabase.from("product_images").delete().eq("product_id", productId);
    await supabase.from("product_images").insert({
      product_id: productId,
      url: input.imageUrl,
      alt: `${input.name.trim()} — ${input.producer.trim()}`,
      position: 0,
    });
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/vinhos");
  revalidatePath("/");
  return { ok: true };
}

/** Apaga o produto (e tenta limpar as fotos dele no Storage). */
export async function deleteProductAction(
  productId: string,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Sem acesso." };

  const supabase = await createClient();

  // best-effort: apaga os arquivos da pasta do produto no bucket
  const { data: files } = await supabase.storage
    .from("product-photos")
    .list(productId);
  if (files?.length) {
    await supabase.storage
      .from("product-photos")
      .remove(files.map((f) => `${productId}/${f.name}`));
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/vinhos");
  revalidatePath("/");
  return { ok: true };
}
