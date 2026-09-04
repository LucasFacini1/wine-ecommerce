import "server-only";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function config() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
  }
  return new MercadoPagoConfig({ accessToken });
}

/** Cria/gerencia preferências do Checkout Pro. */
export function preferenceClient() {
  return new Preference(config());
}

/** Consulta pagamentos — sempre a fonte de verdade, nunca o corpo do webhook. */
export function paymentClient() {
  return new Payment(config());
}
