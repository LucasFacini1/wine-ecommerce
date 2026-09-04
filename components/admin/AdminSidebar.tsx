"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Wine,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
];

export function AdminSidebar({
  email,
  storeHref,
}: {
  email: string;
  storeHref: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    const onAdminHost = window.location.hostname.startsWith("admin.");
    router.replace(onAdminHost ? "/login" : "/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex shrink-0 flex-col border-b border-line bg-ink-soft md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 border-b border-line-soft px-5 py-5">
        <Wine size={18} strokeWidth={1.5} className="text-oxblood" />
        <Wordmark size="sm" eyebrow={false} />
        <span className="label ml-auto">admin</span>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 whitespace-nowrap border-l-2 px-3 py-2.5 font-sans text-sm transition-colors",
                active
                  ? "border-oxblood bg-wine-tint text-bone"
                  : "border-transparent text-bone-dim hover:bg-ink-raise hover:text-bone",
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden flex-col border-t border-line-soft md:flex">
        {email && (
          <p className="truncate px-5 pt-4 font-sans text-xs text-bone-faint">
            {email}
          </p>
        )}
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 px-5 py-3 font-sans text-xs uppercase tracking-[0.14em] text-bone-faint hover:text-bone"
        >
          <LogOut size={13} strokeWidth={1.5} />
          Sair
        </button>
        <Link
          href={storeHref}
          className="flex items-center gap-2 border-t border-line-soft px-5 py-4 font-sans text-xs uppercase tracking-[0.14em] text-bone-faint hover:text-bone"
        >
          Ver a loja
          <ArrowUpRight size={13} strokeWidth={1.5} />
        </Link>
      </div>
    </aside>
  );
}
