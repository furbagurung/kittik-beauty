"use client";

import ProductForm, {
  type ProductFormValues,
} from "@/components/products/ProductForm";
import Notice from "@/components/shared/Notice";
import {
  deleteProduct,
  getProductById,
  type AdminApiProduct,
  updateProduct,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { getAdminProductCategoryId } from "@/lib/product-category";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    if (
      !values.name ||
      !values.categoryId ||
      !values.category ||
      !values.price
    ) {
      toast.error("Fill name, category, and price");
      return;
    }

    try {
      await updateProduct(id, {
        name: values.name,
        price: Number(values.price || 0),
        category: values.category,
        categoryId: values.categoryId,
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

      router.push("/products?success=updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update product"));
    }
  }

  async function handleDeleteProduct() {
    if (!product) return;

    try {
      await deleteProduct(id);
      router.push("/products?success=deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete product"));
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
      key={product.id}
      mode="edit"
      defaultValues={{
        name: product.name,
        category: product.category,
        categoryId:
          product.categoryId ?? getAdminProductCategoryId(product.category),
        price: String(product.price),
        image: product.image,
        images: product.images ?? [],
        stock: product.stock,
        status: product.status,
        description: product.description || "",
        options: product.options ?? [],
        variants: product.variants ?? [],
        tags: product.tags ?? [],
        productType: product.productType ?? "",
        vendor: product.vendor ?? "",
        seoTitle: product.seoTitle ?? "",
        seoDescription: product.seoDescription ?? "",
      }}
      onSubmit={handleUpdateProduct}
      onDelete={handleDeleteProduct}
    />
  );
}
