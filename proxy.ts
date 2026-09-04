import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Renova a sessão do Supabase a cada request e barra o acesso a /admin
 * de quem não está logado. A checagem de admin (admin_users) fica no
 * layout do painel (lib/auth.ts → requireAdmin).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
          response = NextResponse.next({ request });
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

  const { pathname } = request.nextUrl;
  const isAdminArea =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminArea && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

// Só o painel precisa de sessão — a loja é pública.
export const config = {
  matcher: ["/admin/:path*"],
};
