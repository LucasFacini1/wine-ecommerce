import "server-only";
import { cache } from "react";
import type { Wine } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { mapWine } from "./map";

const SELECT = "*, product_images(*)";

type Row = Parameters<typeof mapWine>[0] & {
  product_images: Parameters<typeof mapWine>[1];
};

function toWine(row: Row): Wine {
  const { product_images, ...product } = row;
  return mapWine(product, product_images ?? []);
}

/** Todos os vinhos visíveis na loja, mais recentes primeiro. */
export const getActiveWines = cache(async (): Promise<Wine[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`getActiveWines: ${error.message}`);
  return (data as Row[]).map(toWine);
});

/** Todos os produtos, inclusive inativos — painel admin (RLS exige admin). */
export async function getAdminWines(): Promise<Wine[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .order("name", { ascending: true });

  if (error) throw new Error(`getAdminWines: ${error.message}`);
  return (data as Row[]).map(toWine);
}

export async function getAdminWineById(id: string): Promise<Wine | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAdminWineById: ${error.message}`);
  return data ? toWine(data as Row) : null;
}

export const getWineBySlug = cache(
  async (slug: string): Promise<Wine | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(`getWineBySlug: ${error.message}`);
    return data ? toWine(data as Row) : null;
  },
);

/** Facetas para o FilterBar (regiões, uvas, faixa de preço). */
export async function getCatalogFacets() {
  const wines = await getActiveWines();
  const regions = [...new Set(wines.map((w) => w.region))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const grapes = [...new Set(wines.flatMap((w) => w.grapes))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const prices = wines.map((w) => w.priceCents);
  return {
    regions,
    grapes,
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 100000,
  };
}

/** Sugestões: mesmo tipo primeiro, completa com o resto. */
export function relatedWines(all: Wine[], wine: Wine, limit = 4): Wine[] {
  const sameType = all.filter((w) => w.id !== wine.id && w.type === wine.type);
  const rest = all.filter((w) => w.id !== wine.id && w.type !== wine.type);
  return [...sameType, ...rest].slice(0, limit);
}
