import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Renova a sessão do Supabase e barra o acesso ao painel de quem não está
 * logado. Dois jeitos de chegar no painel:
 *   - caminho normal: qualquer host, /admin/*
 *   - subdomínio dedicado: admin.<domínio>/* é reescrito por baixo dos panos
 *     para /admin/* (a URL na barra do navegador continua limpa)
 * A checagem de admin (admin_users) fica no layout do painel
 * (lib/auth.ts → requireAdmin).
 */
function isAdminHost(host: string): boolean {
  return host === "admin.localhost:3000" || host.startsWith("admin.");
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const onAdminHost = isAdminHost(host);
  const { pathname } = request.nextUrl;

  // fora do subdomínio admin e fora de /admin: não mexe em nada (loja fica rápida)
  if (!onAdminHost && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // idempotente: se o link interno já aponta pra /admin/... (menu, tabelas
  // etc.), não gruda outro /admin na frente — só prefixa caminhos "limpos".
  const alreadyPrefixed = pathname.startsWith("/admin");
  const virtualPath =
    onAdminHost && !alreadyPrefixed
      ? `/admin${pathname === "/" ? "" : pathname}`
      : pathname;

  const rewriteUrl =
    onAdminHost && !alreadyPrefixed ? request.nextUrl.clone() : null;
  if (rewriteUrl) rewriteUrl.pathname = virtualPath;

  const makeResponse = () =>
    rewriteUrl
      ? NextResponse.rewrite(rewriteUrl, { request })
      : NextResponse.next({ request });

  let response = makeResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = virtualPath === "/admin/login";

  if (virtualPath.startsWith("/admin") && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = onAdminHost ? "/login" : "/admin/login";
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
