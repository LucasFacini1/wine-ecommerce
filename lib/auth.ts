import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
 */
export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  if (!(await isAdmin())) redirect("/admin/login?erro=sem-acesso");
  return user;
}
