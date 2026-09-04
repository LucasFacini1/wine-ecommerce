import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isOnAdminHost } from "@/lib/store-link";

/** Usuário logado (ou null). */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** true se o usuário logado está em admin_users. */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

/**
 * Garante que quem acessa é admin; senão redireciona para o login.
 * Use no topo de layouts/páginas do painel.
 *
 * No subdomínio admin.* a rota de login "pública" é /login (o proxy é quem
 * reescreve pra /admin/login por baixo dos panos) — por isso o destino do
 * redirect depende do host.
 */
export async function requireAdmin() {
  const loginPath = (await isOnAdminHost()) ? "/login" : "/admin/login";
  const user = await getUser();
  if (!user) redirect(loginPath);
  if (!(await isAdmin())) redirect(`${loginPath}?erro=sem-acesso`);
  return user;
}
