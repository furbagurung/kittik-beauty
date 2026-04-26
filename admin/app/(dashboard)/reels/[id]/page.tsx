"use client";

import ReelForm from "@/components/reels/ReelForm";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import {
  deleteReel,
  getProducts,
  getReelById,
  type AdminApiProduct,
  type AdminApiReel,
  type ReelMutationInput,
  updateReel,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditReelPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const invalidId = !Number.isFinite(id) || id <= 0;

  const [reel, setReel] = useState<AdminApiReel | null>(null);
  const [products, setProducts] = useState<AdminApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadReel() {
      try {
        const [reelData, productData] = await Promise.all([
          getReelById(id),
          getProducts(),
        ]);

        if (!cancelled) {
          setReel(reelData);
          setProducts(productData);
          setErrorMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setReel(null);
          setProducts([]);
          setErrorMessage(getErrorMessage(error, "Failed to load reel"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (invalidId) return;

    loadReel();

    return () => {
      cancelled = true;
    };
  }, [id, invalidId]);

  async function handleUpdate(values: ReelMutationInput) {
    try {
      await updateReel(id, values);
      toast.success("Reel updated");
      router.push("/reels");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save reel"));
    }
  }

  const handleAutoSave = useCallback(
    async (values: ReelMutationInput) => {
      const savedReel = await updateReel(id, values);
      setReel(savedReel);
      return savedReel;
    },
    [id],
  );

  async function handleDelete() {
    try {
      await deleteReel(id);
      toast.success("Reel deleted");
      router.push("/reels");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete reel"));
    }
  }

  if (invalidId) {
    return <Notice tone="warn" message="Reel not found." />;
  }

  if (loading) {
    return <Notice tone="info" message="Loading reel..." />;
  }

  if (errorMessage) {
    return <Notice tone="danger" message={errorMessage} />;
  }

  if (!reel) {
    return <Notice tone="warn" message="Reel not found." />;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4">
      <PageHeader
        kicker="Catalog"
        title={reel.title}
        description="Edit reel publishing, media, product tags, and analytics context."
      />

      <ReelForm
        key={reel.id}
        contained={false}
        mode="edit"
        defaultValues={reel}
        products={products}
        onAutoSave={handleAutoSave}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
