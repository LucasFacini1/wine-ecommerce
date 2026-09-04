import { notFound } from "next/navigation";
import { getAdminWineById } from "@/lib/data/wines";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wine = await getAdminWineById(id);
  if (!wine) notFound();

  return <ProductForm initial={wine} />;
}
