import "server-only";
import { headers } from "next/headers";

async function currentHost(): Promise<string> {
  const h = await headers();
  return h.get("host") ?? "";
}

/** true quando a request chegou pelo subdomínio admin.* */
export async function isOnAdminHost(): Promise<boolean> {
  return (await currentHost()).startsWith("admin.");
}

/**
 * Link "voltar pra loja" a partir do admin. No subdomínio admin.* isso
 * precisa ser uma URL absoluta pro domínio principal — um "/" ali dentro
 * ficaria preso no próprio admin (o proxy reescreve tudo por lá pra /admin).
 */
export async function getStoreHref(): Promise<string> {
  return (await isOnAdminHost())
    ? process.env.NEXT_PUBLIC_SITE_URL || "/"
    : "/";
}
