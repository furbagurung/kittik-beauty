import ProductsListSection from "@/components/products/ProductsListSection";
import ProductSuccessToast from "@/components/products/ProductSuccessToast";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your product catalog, stock, pricing, and visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline">
            <Download data-icon="inline-start" />
            Export
          </Button>
          <Button asChild>
            <Link href="/products/new">
              <Plus data-icon="inline-start" />
              Add product
            </Link>
          </Button>
        </div>
      </div>

      <ProductSuccessToast success={success} />

      <ProductsListSection />
    </div>
  );
}
