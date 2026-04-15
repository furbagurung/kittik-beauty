"use client";

import ProductForm from "@/components/products/ProductForm";
import PageHeader from "@/components/shared/PageHeader";
import { createProduct } from "@/lib/api";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreateProduct(values: Partial<Product>) {
    if (!values.name || !values.category || !values.price) {
      alert("Please fill name, category, and price.");
      return;
    }

    try {
      await createProduct({
        name: values.name,
        price: Number(values.price || 0),
        image: values.image || "",
        category: values.category,
        stock: Number(values.stock ?? 0),
      });

      router.push("/products?success=created");
    } catch (error) {
      console.error("Create product error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create product.";

      alert(message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Add Product"
        description="Create a new product for your store."
      />

      <div className="rounded-xl border bg-white p-6">
        <ProductForm onSubmit={handleCreateProduct} />
      </div>
    </div>
  );
}
