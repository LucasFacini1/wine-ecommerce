import { requireAdmin } from "@/lib/auth";
import { getStoreHref } from "@/lib/store-link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, storeHref] = await Promise.all([requireAdmin(), getStoreHref()]);

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <AdminSidebar email={user.email ?? ""} storeHref={storeHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
