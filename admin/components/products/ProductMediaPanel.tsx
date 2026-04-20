/* eslint-disable @next/next/no-img-element */

import type { ChangeEvent, ReactNode, RefObject } from "react";

import { ImagePlus, Images, RefreshCw, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type GalleryPreview = {
  file: File;
  previewUrl: string;
  id: string;
};

type ProductMediaPanelProps = {
  primaryPreviewUrl: string;
  primaryImageFile: File | null;
  existingGalleryImages: string[];
  galleryPreviews: GalleryPreview[];
  isSubmitting: boolean;
  primaryInputRef: RefObject<HTMLInputElement | null>;
  galleryInputRef: RefObject<HTMLInputElement | null>;
  onPrimaryImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onGalleryImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearPrimaryImage: () => void;
  onRemoveExistingGalleryImage: (imageUrl: string) => void;
  onRemoveGalleryFile: (index: number) => void;
};

function UploadTile({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer flex-col rounded-2xl border border-dashed border-border bg-muted/55 p-4 transition hover:border-primary/40 hover:bg-accent/70"
    >
      <span className="surface-shadow-soft inline-flex size-10 items-center justify-center rounded-xl bg-card text-primary">
        {icon}
      </span>
      <span className="mt-3 text-sm font-medium text-foreground">{title}</span>
      <span className="mt-1 text-sm leading-5 text-muted-foreground">
        {detail}
      </span>
    </button>
  );
}

export default function ProductMediaPanel({
  primaryPreviewUrl,
  primaryImageFile,
  existingGalleryImages,
  galleryPreviews,
  isSubmitting,
  primaryInputRef,
  galleryInputRef,
  onPrimaryImageChange,
  onGalleryImageChange,
  onClearPrimaryImage,
  onRemoveExistingGalleryImage,
  onRemoveGalleryFile,
}: ProductMediaPanelProps) {
  const totalGalleryCount =
    existingGalleryImages.length + galleryPreviews.length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.95fr)]">
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/50">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Primary media</p>
              <p className="text-xs text-muted-foreground">
                Use a sharp front-facing product shot for the main thumbnail.
              </p>
            </div>
            {primaryImageFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearPrimaryImage}
                disabled={isSubmitting}
              >
                Replace
              </Button>
            ) : null}
          </div>

          <div className="media-stage aspect-[5/4]">
            {primaryPreviewUrl ? (
              <img
                src={primaryPreviewUrl}
                alt="Primary product"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="surface-shadow-soft inline-flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card text-primary">
                  <ImagePlus className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Add the hero image first
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    This image is required before the product can be saved.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 bg-card px-4 py-3">
            <div className="text-sm text-muted-foreground">
              {primaryImageFile ? (
                <>
                  <span className="font-medium text-foreground">
                    {primaryImageFile.name}
                  </span>{" "}
                  selected for the primary slot.
                </>
              ) : (
                "PNG, JPG, WEBP, or GIF. Keep the first image clear and product-led."
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={primaryInputRef}
                id="primaryImage"
                type="file"
                accept="image/*"
                onChange={onPrimaryImageChange}
                disabled={isSubmitting}
                className="sr-only"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => primaryInputRef.current?.click()}
                disabled={isSubmitting}
              >
                {primaryPreviewUrl ? "Upload replacement" : "Upload primary"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 content-start">
          <UploadTile
            icon={<Images className="size-5" />}
            title="Add supporting media"
            detail="Upload multiple detail shots, swatches, or merchandising visuals."
            onClick={() => galleryInputRef.current?.click()}
          />
          <input
            ref={galleryInputRef}
            id="galleryImages"
            type="file"
            accept="image/*"
            multiple
            onChange={onGalleryImageChange}
            disabled={isSubmitting}
            className="sr-only"
          />

          <div className="surface-shadow rounded-2xl border border-border/80 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Gallery</p>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Supporting media keeps product pages credible and easier to
                  merchandise.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {totalGalleryCount} asset{totalGalleryCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {totalGalleryCount > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {existingGalleryImages.map((imageUrl) => (
            <div
              key={imageUrl}
              className="surface-shadow-soft overflow-hidden rounded-2xl border border-border/80 bg-card"
            >
              <div className="aspect-square">
                <img
                  src={imageUrl}
                  alt="Existing gallery"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Saved media</p>
                  <p className="text-xs text-muted-foreground">
                    Already attached to this product
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveExistingGalleryImage(imageUrl)}
                  disabled={isSubmitting}
                  aria-label="Remove existing gallery image"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          {galleryPreviews.map((item, index) => (
            <div
              key={item.id}
              className="surface-shadow-soft overflow-hidden rounded-2xl border border-border/80 bg-card"
            >
              <div className="aspect-square">
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border/70 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">New upload</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveGalleryFile(index)}
                  disabled={isSubmitting}
                  aria-label={`Remove ${item.file.name}`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 px-6 py-10 text-center">
          <span className="surface-shadow-soft inline-flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-card text-primary">
            <Upload className="size-5" />
          </span>
          <p className="mt-4 text-sm font-medium text-foreground">
            No supporting media yet
          </p>
          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Add detail shots, packaging angles, or swatches to make the product
            page feel complete.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        <RefreshCw className="size-4 text-primary" />
        New uploads stay local until you save the product.
      </div>
    </div>
  );
}
