import { NextResponse } from "next/server";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { paymentClient } from "@/lib/mercadopago";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook do Mercado Pago. Nunca confia nos dados do corpo — a notificação
 * só diz "algo mudou"; o pagamento em si é sempre relido da API da MP com o
 * nosso Access Token antes de qualquer ação. Isso é o que garante a
 * segurança, mesmo que a verificação de assinatura abaixo falhe ou não
 * esteja configurada ainda.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);

  let body: { type?: string; topic?: string; data?: { id?: string | number } } =
    {};
  try {
    body = await request.json();
  } catch {
    /* algumas notificações antigas vêm só na query string */
  }

  const type = body.type ?? body.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = String(
    body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "",
  );

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ received: true });
  }

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId: url.searchParams.get("data.id") ?? dataId,
        secret,
        toleranceSeconds: 300,
      });
    } catch (err) {
      if (err instanceof InvalidWebhookSignatureError) {
        console.warn("webhook MP: assinatura inválida —", err.reason);
        return NextResponse.json({ error: "assinatura inválida" }, { status: 401 });
      }
      throw err;
    }
  }

  let payment;
  try {
    payment = await paymentClient().get({ id: dataId });
  } catch (err) {
    console.error("webhook MP: falha ao buscar pagamento", dataId, err);
    return NextResponse.json({ received: true }); // evita loop de retry da MP
  }

  if (payment.status !== "approved") {
    return NextResponse.json({ received: true, status: payment.status });
  }

  const orderId = payment.external_reference;
  if (!orderId) {
    console.error("webhook MP: pagamento aprovado sem external_reference", dataId);
    return NextResponse.json({ received: true });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("mark_order_paid", {
    p_order_id: orderId,
    p_payment_ref: String(payment.id),
  });

  if (error) {
    console.error("mark_order_paid:", error.message);
    return NextResponse.json({ error: "falha ao processar" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** A MP às vezes testa a URL com GET ao salvar a configuração do webhook. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
