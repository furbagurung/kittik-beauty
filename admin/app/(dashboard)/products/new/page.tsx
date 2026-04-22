"use client";

import ProductForm, {
  type ProductFormValues,
} from "@/components/products/ProductForm";
import { createProduct } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreateProduct(values: ProductFormValues) {
    if (!values.name || !values.category || !values.price) {
      toast.error("Fill name, category, and price");
      return;
    }

    try {
      await createProduct({
        name: values.name,
        price: Number(values.price || 0),
        category: values.category,
        stock: Number(values.stock ?? 0),
        status: values.status,
        description: values.description || "",
        image: values.image,
        primaryImageFile: values.primaryImageFile,
        galleryFiles: values.galleryFiles,
        existingGalleryImages: values.existingGalleryImages,
        options: values.options,
        variants: values.variants,
        tags: values.tags,
        productType: values.productType,
        vendor: values.vendor,
        seoTitle: values.seoTitle,
        seoDescription: values.seoDescription,
        variantImageFiles: values.variantImageFiles,
      });

      router.push("/products?success=created");
    } catch (error) {
      console.error("Create product error:", error);
      toast.error(getErrorMessage(error, "Failed to create product"));
    }
  }

  return (
    <ProductForm mode="create" onSubmit={handleCreateProduct} />
  );
}
