import ProductsTable from "@/components/products/ProductsTable";
import ProductSuccessToast from "@/components/products/ProductSuccessToast";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getProducts, type AdminApiProduct } from "@/lib/api";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  let products: AdminApiProduct[] = [];
  let errorMessage = "";

  try {
    products = await getProducts();
  } catch (error) {
    products = [];
    errorMessage =
      error instanceof Error ? error.message : "Failed to load products.";
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Catalog"
        title="Products"
        description="Manage inventory, pricing, and product visibility."
        action={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="size-4" strokeWidth={2} />
              New product
            </Link>
          </Button>
        }
      />

      <ProductSuccessToast success={success} />
      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}

      <ProductsTable products={products} />
    </div>
  );
}
