"use client";
/* eslint-disable @next/next/no-img-element */

import ConfirmActionDialog from "@/components/shared/ConfirmActionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminApiProduct,
  AdminApiReel,
  ReelMutationInput,
  ReelStatus,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ImagePlus, Plus, Save, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ProductTagDraft = {
  ctaLabel: string;
  productId: string;
  sortOrder: string;
  variantId: string;
};

type ReelFormProps = {
  defaultValues?: AdminApiReel;
  mode: "create" | "edit";
  onDelete?: () => Promise<void> | void;
  onSubmit: (values: ReelMutationInput) => Promise<void> | void;
  products: AdminApiProduct[];
};

const statusOptions: Array<{ label: string; value: ReelStatus }> = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

function buildInitialTags(defaultValues?: AdminApiReel): ProductTagDraft[] {
  return (defaultValues?.productTags ?? []).map((tag) => ({
    ctaLabel: tag.ctaLabel || "Shop now",
    productId: String(tag.productId),
    sortOrder: String(tag.sortOrder ?? 0),
    variantId: tag.variantId ? String(tag.variantId) : "none",
  }));
}

function productLabel(product: AdminApiProduct) {
  return `${product.name} / ${formatCurrency(Number(product.price || 0))}`;
}

export default function ReelForm({
  defaultValues,
  mode,
  onDelete,
  onSubmit,
  products,
}: ReelFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [caption, setCaption] = useState(defaultValues?.caption ?? "");
  const [status, setStatus] = useState<ReelStatus>(
    defaultValues?.status ?? "DRAFT",
  );
  const [featured, setFeatured] = useState(Boolean(defaultValues?.featured));
  const [sortOrder, setSortOrder] = useState(
    String(defaultValues?.sortOrder ?? 0),
  );
  const [duration, setDuration] = useState(
    defaultValues?.duration == null ? "" : String(defaultValues.duration),
  );
  const [videoUrl, setVideoUrl] = useState(defaultValues?.videoUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    defaultValues?.thumbnailUrl ?? "",
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [productTags, setProductTags] = useState<ProductTagDraft[]>(() =>
    buildInitialTags(defaultValues),
  );
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const productById = useMemo(() => {
    const map = new Map<string, AdminApiProduct>();
    products.forEach((product) => map.set(String(product.id), product));
    return map;
  }, [products]);

  const effectiveVideoUrl = videoPreviewUrl || videoUrl;
  const effectiveThumbnailUrl = thumbnailPreviewUrl || thumbnailUrl;
  const isBusy = isSubmitting || isDeleting;

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [thumbnailPreviewUrl, videoPreviewUrl]);

  function resetForm() {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);

    setTitle(defaultValues?.title ?? "");
    setCaption(defaultValues?.caption ?? "");
    setStatus(defaultValues?.status ?? "DRAFT");
    setFeatured(Boolean(defaultValues?.featured));
    setSortOrder(String(defaultValues?.sortOrder ?? 0));
    setDuration(
      defaultValues?.duration == null ? "" : String(defaultValues.duration),
    );
    setVideoUrl(defaultValues?.videoUrl ?? "");
    setThumbnailUrl(defaultValues?.thumbnailUrl ?? "");
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreviewUrl("");
    setThumbnailPreviewUrl("");
    setProductTags(buildInitialTags(defaultValues));
  }

  function selectVideo(file: File | undefined) {
    if (!file) return;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  }

  function selectThumbnail(file: File | undefined) {
    if (!file) return;
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  }

  function addProductTag() {
    setProductTags((current) => [
      ...current,
      {
        ctaLabel: "Shop now",
        productId: products[0] ? String(products[0].id) : "none",
        sortOrder: String(current.length),
        variantId: "none",
      },
    ]);
  }

  function updateProductTag(index: number, patch: Partial<ProductTagDraft>) {
    setProductTags((current) =>
      current.map((tag, tagIndex) =>
        tagIndex === index ? { ...tag, ...patch } : tag,
      ),
    );
  }

  function removeProductTag(index: number) {
    setProductTags((current) =>
      current
        .filter((_, tagIndex) => tagIndex !== index)
        .map((tag, tagIndex) => ({ ...tag, sortOrder: String(tagIndex) })),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || (!videoFile && !videoUrl)) {
      toast.error("Title and video are required");
      return;
    }

    const normalizedTags = productTags
      .map((tag, index) => ({
        ctaLabel: tag.ctaLabel.trim() || "Shop now",
        productId: Number(tag.productId),
        sortOrder: Number(tag.sortOrder || index),
        variantId: tag.variantId === "none" ? null : Number(tag.variantId),
      }))
      .filter((tag) => Number.isFinite(tag.productId) && tag.productId > 0);

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        caption: caption.trim(),
        videoUrl,
        thumbnailUrl,
        videoFile,
        thumbnailFile,
        duration: duration ? Number(duration) : null,
        status,
        featured,
        sortOrder: Number(sortOrder || 0),
        productTags: normalizedTags,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reel content</CardTitle>
                <CardDescription>
                  Upload vertical video content and keep the caption concise.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Dewy tint routine"
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    placeholder="Short shopping context for the reel."
                    rows={4}
                    disabled={isBusy}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="grid gap-2">
                    <Label>Video</Label>
                    <label
                      className={cn(
                        "flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/35 text-center transition hover:border-primary/60 hover:bg-muted/55",
                        isBusy && "pointer-events-none opacity-60",
                      )}
                    >
                      {effectiveVideoUrl ? (
                        <video
                          src={effectiveVideoUrl}
                          className="h-80 w-full bg-black object-contain"
                          controls
                          muted
                          playsInline
                        />
                      ) : (
                        <span className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                          <UploadCloud className="size-5" />
                          Upload a vertical reel video
                        </span>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(event) => {
                          selectVideo(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid gap-2">
                    <Label>Thumbnail</Label>
                    <label
                      className={cn(
                        "flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/35 text-center transition hover:border-primary/60 hover:bg-muted/55",
                        isBusy && "pointer-events-none opacity-60",
                      )}
                    >
                      {effectiveThumbnailUrl ? (
                        <img
                          src={effectiveThumbnailUrl}
                          alt=""
                          className="h-80 w-full object-cover"
                        />
                      ) : (
                        <span className="flex flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                          <ImagePlus className="size-5" />
                          Upload a cover image
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isBusy}
                        onChange={(event) => {
                          selectThumbnail(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shoppable products</CardTitle>
                <CardDescription>
                  Attach product CTAs that send shoppers to product detail.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {productTags.length ? (
                  productTags.map((tag, index) => {
                    const selectedProduct = productById.get(tag.productId);
                    const variants = selectedProduct?.variants ?? [];

                    return (
                      <div
                        key={`${tag.productId}-${index}`}
                        className="rounded-xl border border-border bg-card p-3"
                      >
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_140px_44px]">
                          <div className="grid gap-2">
                            <Label className="text-xs">Product</Label>
                            <Select
                              value={tag.productId}
                              onValueChange={(value) =>
                                updateProductTag(index, {
                                  productId: value,
                                  variantId: "none",
                                })
                              }
                              disabled={isBusy || products.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.length ? (
                                  products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={String(product.id)}
                                    >
                                      {productLabel(product)}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="none" disabled>
                                    No products available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs">Variant</Label>
                            <Select
                              value={tag.variantId}
                              onValueChange={(value) =>
                                updateProductTag(index, { variantId: value })
                              }
                              disabled={isBusy || variants.length === 0}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Any variant" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Any variant</SelectItem>
                                {variants
                                  .filter((variant) => variant.id)
                                  .map((variant) => (
                                    <SelectItem
                                      key={variant.id}
                                      value={String(variant.id)}
                                    >
                                      {variant.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label className="text-xs">CTA</Label>
                            <Input
                              value={tag.ctaLabel}
                              onChange={(event) =>
                                updateProductTag(index, {
                                  ctaLabel: event.target.value,
                                })
                              }
                              disabled={isBusy}
                              placeholder="Shop now"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeProductTag(index)}
                              disabled={isBusy}
                              aria-label="Remove product tag"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/35 px-4 py-8 text-center text-sm text-muted-foreground">
                    No product tags yet.
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addProductTag}
                  disabled={isBusy || products.length === 0}
                >
                  <Plus className="size-4" />
                  Add product tag
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="self-start space-y-6 xl:sticky xl:top-28">
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
                <CardDescription>
                  Control feed visibility and ordering.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as ReelStatus)}
                    disabled={isBusy}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/35 px-3 py-2.5">
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Featured
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Boost this reel in the deterministic feed.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(event) => setFeatured(event.target.checked)}
                    disabled={isBusy}
                    className="size-4 rounded border-border"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="grid gap-2">
                    <Label htmlFor="sortOrder">Sort order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value)}
                      disabled={isBusy}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration seconds</Label>
                    <Input
                      id="duration"
                      type="number"
                      min={0}
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      disabled={isBusy}
                    />
                  </div>
                </div>

                {defaultValues ? (
                  <div className="grid gap-2 rounded-xl border border-border bg-muted/35 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Views</span>
                      <Badge variant="outline">{defaultValues.viewCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Likes</span>
                      <Badge variant="outline">{defaultValues.likeCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Shares</span>
                      <Badge variant="outline">{defaultValues.shareCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Product clicks</span>
                      <Badge variant="outline">
                        {defaultValues.productClickCount}
                      </Badge>
                    </div>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDiscardOpen(true)}
                  disabled={isBusy}
                >
                  Discard
                </Button>
                <Button type="submit" disabled={isBusy}>
                  <Save className="size-4" />
                  {isSubmitting
                    ? "Saving..."
                    : mode === "create"
                      ? "Create reel"
                      : "Save reel"}
                </Button>
              </CardFooter>
            </Card>

            {onDelete ? (
              <Card>
                <CardHeader>
                  <CardTitle>Danger zone</CardTitle>
                  <CardDescription>
                    Delete this reel and remove its managed local media files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    disabled={isBusy}
                    className="w-full"
                  >
                    <Trash2 className="size-4" />
                    Delete reel
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </form>

      <ConfirmActionDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard changes?"
        description="Unsaved reel edits will be lost."
        confirmLabel="Discard"
        onConfirm={resetForm}
        disabled={isBusy}
      />

      <ConfirmActionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${title || "this reel"}"?`}
        description="This cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete reel"}
        variant="destructive"
        onConfirm={handleDelete}
        disabled={isBusy}
      />
    </>
  );
}
