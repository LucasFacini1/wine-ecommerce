import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { shippingForSubtotal } from "@/lib/format";
import { preferenceClient } from "@/lib/mercadopago";

interface Body {
  items?: { productId?: string; qty?: number }[];
  customer?: { name?: string; email?: string; cpf?: string };
  shipping?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
  };
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return bad("Corpo inválido.");
  }

  const items = (body.items ?? []).filter(
    (i): i is { productId: string; qty: number } =>
      typeof i?.productId === "string" && Number.isInteger(i.qty) && i.qty! > 0,
  );
  if (items.length === 0) return bad("Carrinho vazio.");

  const c = body.customer ?? {};
  const s = body.shipping ?? {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email ?? "");
  if (!c.name || c.name.trim().length < 3) return bad("Nome inválido.");
  if (!emailOk) return bad("E-mail inválido.");
  if ((c.cpf ?? "").replace(/\D/g, "").length !== 11) return bad("CPF inválido.");
  for (const [k, v] of Object.entries({
    cep: s.cep,
    street: s.street,
    number: s.number,
    district: s.district,
    city: s.city,
    state: s.state,
  })) {
    if (!v || !String(v).trim()) return bad(`Endereço incompleto (${k}).`);
  }
  if ((s.state ?? "").trim().length !== 2) return bad("UF inválida.");

  const supabase = createAdminClient();

  // preços e estoque autoritativos vêm do banco
  const ids = [...new Set(items.map((i) => i.productId))];
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select(
      "id, name, producer, vintage, price_cents, stock_qty, is_active, product_images(url, position)",
    )
    .in("id", ids);

  if (prodErr) return bad("Erro ao ler o catálogo.", 500);

  const byId = new Map((products ?? []).map((p) => [p.id, p]));
  const lines: { p: NonNullable<ReturnType<typeof byId.get>>; qty: number }[] =
    [];
  for (const i of items) {
    const p = byId.get(i.productId);
    if (!p || !p.is_active) {
      return bad("Um dos vinhos saiu do catálogo. Revise o carrinho.", 409);
    }
    if (i.qty > p.stock_qty) {
      return bad(`Estoque insuficiente para ${p.name}.`, 409);
    }
    lines.push({ p, qty: i.qty });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.p.price_cents * l.qty, 0);
  const shipping = shippingForSubtotal(subtotal);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name: c.name!.trim(),
      customer_email: c.email!.trim(),
      customer_cpf: c.cpf!.trim(),
      shipping_cep: s.cep!.trim(),
      shipping_street: s.street!.trim(),
      shipping_number: s.number!.trim(),
      shipping_complement: s.complement?.trim() || null,
      shipping_district: s.district!.trim(),
      shipping_city: s.city!.trim(),
      shipping_state: s.state!.trim().toUpperCase(),
      subtotal_cents: subtotal,
      shipping_cents: shipping,
      total_cents: subtotal + shipping,
    })
    .select("id, reference")
    .single();

  if (orderErr || !order) return bad("Não foi possível criar o pedido.", 500);

  const itemRows = lines.map(({ p, qty }) => {
    const image = [...(p.product_images ?? [])].sort(
      (a, b) => a.position - b.position,
    )[0]?.url;
    return {
      order_id: order.id,
      product_id: p.id,
      name: p.name,
      producer: p.producer,
      vintage: p.vintage,
      unit_price_cents: p.price_cents,
      qty,
      image_url: image ?? "",
    };
  });

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemRows);

  if (itemsErr) {
    await supabase.from("orders").delete().eq("id", order.id);
    return bad("Falha ao registrar os itens do pedido.", 500);
  }

  // Mercado Pago — Checkout Pro: cria a preferência e devolve o link de pagamento
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const orderUrl = `${siteUrl}/pedido/${order.id}`;

  const preferenceItems = lines.map(({ p, qty }) => ({
    id: p.id,
    title: p.vintage ? `${p.name} ${p.vintage}` : p.name,
    quantity: qty,
    unit_price: p.price_cents / 100,
    currency_id: "BRL",
  }));
  if (shipping > 0) {
    preferenceItems.push({
      id: "frete",
      title: "Frete",
      quantity: 1,
      unit_price: shipping / 100,
      currency_id: "BRL",
    });
  }

  try {
    const preference = await preferenceClient().create({
      body: {
        items: preferenceItems,
        payer: { name: c.name!.trim(), email: c.email!.trim() },
        external_reference: order.id,
        statement_descriptor: "EMPORIO PADOX",
        back_urls: { success: orderUrl, pending: orderUrl, failure: orderUrl },
        auto_return: "approved",
        notification_url: siteUrl
          ? `${siteUrl}/api/webhooks/mercadopago`
          : undefined,
      },
    });

    if (!preference.init_point) throw new Error("preferência sem init_point");

    return NextResponse.json({
      orderId: order.id,
      reference: order.reference,
      initPoint: preference.init_point,
    });
  } catch (mpErr) {
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    console.error("mercadopago preference:", mpErr);
    return bad("Não foi possível iniciar o pagamento. Tente novamente.", 502);
  }
}
