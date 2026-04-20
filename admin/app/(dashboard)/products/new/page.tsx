"use client";

import ProductForm, {
  type ProductFormValues,
} from "@/components/products/ProductForm";
import { createProduct } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreateProduct(values: ProductFormValues) {
    if (!values.name || !values.category || !values.price) {
      alert("Please fill name, category, and price.");
      return;
    }

    try {
      await createProduct({
        name: values.name,
        price: Number(values.price || 0),
        category: values.category,
        stock: Number(values.stock ?? 0),
        description: values.description || "",
        primaryImageFile: values.primaryImageFile,
        galleryFiles: values.galleryFiles,
        existingGalleryImages: values.existingGalleryImages,
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
    <ProductForm mode="create" onSubmit={handleCreateProduct} />
  );
}
