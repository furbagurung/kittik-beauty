"use client";

import ReelForm from "@/components/reels/ReelForm";
import Notice from "@/components/shared/Notice";
import PageHeader from "@/components/shared/PageHeader";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  createReel,
  getProducts,
  updateReel,
  type AdminApiProduct,
  type AdminApiReel,
  type ReelMutationInput,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function NewReelPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdDraftReel, setCreatedDraftReel] =
    useState<AdminApiReel | null>(null);
  const [publishPromptOpen, setPublishPromptOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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
      const createdReel = createdDraftReel
        ? await updateReel(createdDraftReel.id, values)
        : await createReel(values);

      if (createdReel.status === "DRAFT") {
        setCreatedDraftReel(createdReel);
        setPublishPromptOpen(true);
        toast.success("Reel saved as draft");
        return;
      }

      toast.success("Reel created");
      router.push("/reels");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save reel"));
    }
  }

  const handleAutoSave = useCallback(
    async (values: ReelMutationInput) => {
      const draftValues = {
        ...values,
        status: "DRAFT" as const,
      };
      const savedReel = createdDraftReel
        ? await updateReel(createdDraftReel.id, draftValues)
        : await createReel(draftValues);

      setCreatedDraftReel(savedReel);
      return savedReel;
    },
    [createdDraftReel],
  );

  function handleKeepDraft() {
    setPublishPromptOpen(false);
    router.push("/reels");
  }

  async function handlePublishNow() {
    if (!createdDraftReel) return;

    setIsPublishing(true);
    try {
      await updateReel(createdDraftReel.id, {
        title: createdDraftReel.title,
        caption: createdDraftReel.caption,
        videoUrl: createdDraftReel.videoUrl,
        thumbnailUrl: createdDraftReel.thumbnailUrl,
        videoFile: null,
        thumbnailFile: null,
        duration: createdDraftReel.duration,
        status: "ACTIVE",
        featured: createdDraftReel.featured,
        sortOrder: createdDraftReel.sortOrder,
        productTags: createdDraftReel.productTags.map((tag) => ({
          productId: tag.productId,
          variantId: tag.variantId ?? null,
          ctaLabel: tag.ctaLabel,
          sortOrder: tag.sortOrder,
        })),
      });
      toast.success("Reel published");
      router.push("/reels");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to publish reel"));
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-[1400px] px-4">
        <PageHeader kicker="Catalog" title="New reel" />

        {errorMessage ? <Notice tone="danger" message={errorMessage} /> : null}
        {loading ? <Notice tone="info" message="Loading products..." /> : null}

        <ReelForm
          contained={false}
          mode="create"
          products={products}
          onAutoSave={handleAutoSave}
          onSubmit={handleCreate}
        />
      </div>

      <AlertDialog
        open={publishPromptOpen}
        onOpenChange={(open) => {
          if (isPublishing) return;
          setPublishPromptOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this reel?</AlertDialogTitle>
            <AlertDialogDescription>
              Your reel has been saved as a draft. Publish it now to make it
              visible in the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing} onClick={handleKeepDraft}>
              Keep as draft
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={handlePublishNow}
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish now"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
