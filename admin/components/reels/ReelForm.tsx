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
import {
  Camera,
  ImagePlus,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

function formatTimestamp(value: number) {
  if (!Number.isFinite(value) || value < 0) return "00:00";

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ReelForm({
  defaultValues,
  mode,
  onDelete,
  onSubmit,
  products,
}: ReelFormProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
  const [manualThumbnailFile, setManualThumbnailFile] = useState<File | null>(
    null,
  );
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [capturedThumbnailTimestamp, setCapturedThumbnailTimestamp] = useState<
    number | null
  >(null);
  const [captureError, setCaptureError] = useState("");
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
  const canUseFramePicker = Boolean(
    effectiveVideoUrl && videoMetadataLoaded && videoDuration > 0,
  );
  const canCaptureVideoFrame = Boolean(canUseFramePicker && videoCanPlay);

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
    setManualThumbnailFile(null);
    setVideoPreviewUrl("");
    setThumbnailPreviewUrl("");
    setVideoCanPlay(false);
    setVideoMetadataLoaded(false);
    setVideoDuration(0);
    setVideoTimestamp(0);
    setCapturedThumbnailTimestamp(null);
    setCaptureError("");
    setProductTags(buildInitialTags(defaultValues));
  }

  function selectVideo(file: File | undefined) {
    if (!file) return;
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setVideoCanPlay(false);
    setVideoMetadataLoaded(false);
    setVideoDuration(0);
    setVideoTimestamp(0);
    setCaptureError("");
  }

  function selectThumbnail(
    file: File | undefined,
    options?: { capturedAt?: number | null; source?: "manual" | "capture" },
  ) {
    if (!file) return;
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);

    if (options?.source !== "capture") {
      setManualThumbnailFile(file);
    }

    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
    setCapturedThumbnailTimestamp(options?.capturedAt ?? null);
    setCaptureError("");
  }

  function seekVideoTo(value: number) {
    const video = videoRef.current;
    if (!video || !canUseFramePicker) return;

    const nextTime = Math.min(Math.max(value, 0), videoDuration);
    video.currentTime = nextTime;
    setVideoTimestamp(nextTime);
  }

  function resetCapturedThumbnail() {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);

    if (manualThumbnailFile) {
      setThumbnailFile(manualThumbnailFile);
      setThumbnailPreviewUrl(URL.createObjectURL(manualThumbnailFile));
    } else {
      setThumbnailFile(null);
      setThumbnailPreviewUrl("");
      setThumbnailUrl(defaultValues?.thumbnailUrl ?? "");
    }

    setCapturedThumbnailTimestamp(null);
    setCaptureError("");
  }

  async function captureCurrentFrameAsThumbnail() {
    const video = videoRef.current;

    if (!video || !canCaptureVideoFrame) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    const currentTime = video.currentTime || 0;

    if (!width || !height) {
      const message = "Video frame is not ready yet. Try again after it loads.";
      setCaptureError(message);
      toast.error(message);
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Canvas is unavailable in this browser.");
      }

      context.drawImage(video, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) {
        throw new Error("The selected frame could not be converted to JPEG.");
      }

      const file = new File(
        [blob],
        `reel-frame-${Math.round(currentTime * 1000)}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        },
      );

      selectThumbnail(file, { capturedAt: currentTime, source: "capture" });
      setVideoTimestamp(currentTime);
      toast.success(`Thumbnail captured at ${formatTimestamp(currentTime)}`);
    } catch {
      const message =
        "Could not capture this video frame. Upload a thumbnail image manually.";
      setCaptureError(message);
      toast.error(message);
    }
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
                          key={effectiveVideoUrl}
                          ref={videoRef}
                          crossOrigin={videoPreviewUrl ? undefined : "anonymous"}
                          src={effectiveVideoUrl}
                          className="h-80 w-full bg-black object-contain"
                          controls
                          muted
                          playsInline
                          onCanPlay={() => {
                            setVideoCanPlay(true);
                            setVideoTimestamp(videoRef.current?.currentTime ?? 0);
                          }}
                          onLoadedMetadata={(event) => {
                            const nextDuration = event.currentTarget.duration;
                            setVideoDuration(
                              Number.isFinite(nextDuration) ? nextDuration : 0,
                            );
                            setVideoMetadataLoaded(true);
                            setVideoTimestamp(event.currentTarget.currentTime);
                          }}
                          onTimeUpdate={(event) => {
                            setVideoTimestamp(event.currentTarget.currentTime);
                          }}
                          onSeeked={(event) => {
                            setVideoTimestamp(event.currentTarget.currentTime);
                          }}
                          onError={() => {
                            setVideoCanPlay(false);
                            setVideoMetadataLoaded(false);
                            setVideoDuration(0);
                          }}
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
                    {effectiveVideoUrl ? (
                      <div className="grid gap-4 rounded-xl border border-border bg-muted/35 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Frame picker
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Scrub to the best cover frame.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={captureCurrentFrameAsThumbnail}
                            disabled={isBusy || !canCaptureVideoFrame}
                          >
                            <Camera className="size-4" />
                            Capture frame
                          </Button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-lg border border-border bg-background/70 px-3 py-2">
                            <p className="text-[0.68rem] font-medium uppercase text-muted-foreground">
                              Current
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatTimestamp(videoTimestamp)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border bg-background/70 px-3 py-2">
                            <p className="text-[0.68rem] font-medium uppercase text-muted-foreground">
                              Duration
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatTimestamp(videoDuration)}
                            </p>
                          </div>
                          <div className="rounded-lg border border-border bg-background/70 px-3 py-2">
                            <p className="text-[0.68rem] font-medium uppercase text-muted-foreground">
                              Captured
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {capturedThumbnailTimestamp === null
                                ? "--:--"
                                : formatTimestamp(capturedThumbnailTimestamp)}
                            </p>
                          </div>
                        </div>

                        <input
                          type="range"
                          min={0}
                          max={videoDuration || 0}
                          step={0.1}
                          value={
                            canUseFramePicker
                              ? Math.min(videoTimestamp, videoDuration)
                              : 0
                          }
                          onChange={(event) =>
                            seekVideoTo(Number(event.target.value))
                          }
                          disabled={isBusy || !canUseFramePicker}
                          aria-label="Select video frame timestamp"
                          className="h-2 w-full cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "1s", time: 1 },
                            { label: "25%", time: videoDuration * 0.25 },
                            { label: "50%", time: videoDuration * 0.5 },
                            { label: "75%", time: videoDuration * 0.75 },
                          ].map((preset) => (
                            <Button
                              key={preset.label}
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => seekVideoTo(preset.time)}
                              disabled={isBusy || !canUseFramePicker}
                              className="h-8 px-3 text-xs"
                            >
                              {preset.label}
                            </Button>
                          ))}
                        </div>

                        {!videoMetadataLoaded ? (
                          <p className="text-xs text-muted-foreground">
                            Frame controls unlock after the video metadata loads.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {captureError ? (
                      <p className="text-xs text-destructive">{captureError}</p>
                    ) : null}
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
                          selectThumbnail(event.target.files?.[0], {
                            source: "manual",
                          });
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {capturedThumbnailTimestamp !== null ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-muted/35 px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Captured at{" "}
                          {formatTimestamp(capturedThumbnailTimestamp)}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={resetCapturedThumbnail}
                          disabled={isBusy}
                          className="h-8 px-3 text-xs"
                        >
                          <RotateCcw className="size-3.5" />
                          Reset to uploaded thumbnail
                        </Button>
                      </div>
                    ) : null}
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
