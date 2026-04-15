"use client";

import ProductForm from "@/components/products/ProductForm";
import PageHeader from "@/components/shared/PageHeader";
import { getProductById, updateProduct } from "@/lib/api";
import type { Product } from "@/types/product";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type EditableProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [product, setProduct] = useState<EditableProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  async function handleUpdateProduct(values: Partial<Product>) {
    if (!values.name || !values.category || !values.price) {
      alert("Please fill name, category, and price.");
      return;
    }

    try {
      await updateProduct(id, {
        name: values.name,
        price: Number(values.price || 0),
        image: values.image || "",
        category: values.category,
        stock: Number(values.stock ?? 0),
        description: values.description || "",
      });

      router.push("/products?success=updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update product.";

      alert(message);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="p-6 text-sm text-red-600">Product not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title="Edit Product"
        description={`You are editing: ${product.name}`}
      />

      <div className="rounded-xl border bg-white p-6">
        <ProductForm
          defaultValues={{
            name: product.name,
            category: product.category,
            price: String(product.price),
            image: product.image,
            stock: product.stock,
            description: product.description || "",
          }}
          onSubmit={handleUpdateProduct}
        />
      </div>
    </div>
  );
}
