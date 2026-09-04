import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminWines } from "@/lib/data/wines";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminWines();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-bone">Produtos</h1>
          <p className="mt-1 font-sans text-sm text-bone-dim">
            {products.length} rótulos no catálogo
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/produtos/novo">
            <Plus size={14} strokeWidth={1.5} /> Novo produto
          </Link>
        </Button>
      </header>

      <ProductsTable products={products} />
    </div>
  );
}
