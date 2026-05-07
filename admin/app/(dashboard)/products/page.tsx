import ProductsListSection from "@/components/products/ProductsListSection";
import ProductSuccessToast from "@/components/products/ProductSuccessToast";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

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

      <ProductsListSection />
    </div>
  );
}
