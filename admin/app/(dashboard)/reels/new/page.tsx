"use client";

import ReelForm from "@/components/reels/ReelForm";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import {
  createReel,
  getProducts,
  type AdminApiProduct,
  type ReelMutationInput,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NewReelPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await getProducts();
        if (!cancelled) {
          setProducts(data);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setErrorMessage(getErrorMessage(error, "Failed to load products"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(values: ReelMutationInput) {
    try {
      await createReel(values);
      toast.success("Reel created");
      router.push("/reels");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save reel"));
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Catalog"
        title="New reel"
        description="Create a shoppable vertical video for the buyer app feed."
      />

      {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}
      {loading ? <Notice tone="info" message="Loading products..." /> : null}

      <ReelForm mode="create" products={products} onSubmit={handleCreate} />
    </div>
  );
}
