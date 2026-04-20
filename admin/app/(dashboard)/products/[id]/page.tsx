"use client";

import ProductForm, {
  type ProductFormValues,
} from "@/components/products/ProductForm";
import Notice from "@/components/shared/Notice";
import {
  getProductById,
  type AdminApiProduct,
  updateProduct,
} from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<AdminApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        const data = await getProductById(id);
        if (!cancelled) {
          setProduct(data);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setProduct(null);
          setErrorMessage(
            error instanceof Error ? error.message : "Failed to load product.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (!Number.isFinite(id) || id <= 0) {
      setProduct(null);
      setErrorMessage("");
      setLoading(false);
      return () => {};
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleUpdateProduct(values: ProductFormValues) {
    if (!values.name || !values.category || !values.price) {
      alert("Please fill name, category, and price.");
      return;
    }

    try {
      await updateProduct(id, {
        name: values.name,
        price: Number(values.price || 0),
        category: values.category,
        stock: Number(values.stock ?? 0),
        description: values.description || "",
        primaryImageFile: values.primaryImageFile,
        galleryFiles: values.galleryFiles,
        existingGalleryImages: values.existingGalleryImages,
      });

      router.push("/products?success=updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update product.";

      alert(message);
    }
  }

  if (loading) {
    return <Notice tone="info" message="Loading product..." />;
  }

  if (errorMessage) {
    return <Notice tone="danger" message={errorMessage} />;
  }

  if (!product) {
    return <Notice tone="warn" message="Product not found." />;
  }

  return (
    <ProductForm
      mode="edit"
      defaultValues={{
        name: product.name,
        category: product.category,
        price: String(product.price),
        image: product.image,
        images: product.images ?? [],
        stock: product.stock,
        description: product.description || "",
      }}
      onSubmit={handleUpdateProduct}
    />
  );
}
