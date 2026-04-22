/* eslint-disable @next/next/no-img-element */

"use client";

import MediaDropzone from "@/components/products/MediaDropzone";
import type { ProductMediaItem } from "@/components/products/useProductMedia";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImagePlus,
  Star,
  Trash2,
} from "lucide-react";

type ProductMediaSectionProps = {
  items: ProductMediaItem[];
  primaryItem: ProductMediaItem | null;
  galleryCount: number;
  maxFiles?: number;
  disabled?: boolean;
  errorMessage?: string;
  onFilesAccepted: (files: File[]) => void;
  onError: (message: string) => void;
  onMakePrimary: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onRemove: (id: string) => void;
  onReplacePrimary: (file: File) => void;
};

const MAX_FILES = 9;

function formatSize(size: number) {
  if (!size) return "Existing";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProductMediaSection({
  items,
  primaryItem,
  galleryCount,
  maxFiles = MAX_FILES,
  disabled,
  errorMessage,
  onFilesAccepted,
  onError,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onReplacePrimary,
}: ProductMediaSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Media</h3>
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[0.68rem]">
              {items.length}/{maxFiles}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
            Add images and choose the featured storefront image.
          </p>
        </div>

        {primaryItem ? (
          <ReplacePrimaryButton
            disabled={disabled}
            onReplacePrimary={onReplacePrimary}
          />
        ) : null}
      </div>

      {items.length === 0 ? (
        <MediaDropzone
          disabled={disabled}
          onFilesAccepted={onFilesAccepted}
          onError={onError}
          maxFiles={maxFiles}
          currentCount={items.length}
          errorMessage={errorMessage}
        />
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {items.map((item, index) => (
              <MediaTile
                key={item.id}
                item={item}
                index={index}
                totalCount={items.length}
                disabled={disabled}
                isPrimaryTile={index === 0}
                onMakePrimary={onMakePrimary}
                onMoveLeft={onMoveLeft}
                onMoveRight={onMoveRight}
                onRemove={onRemove}
              />
            ))}

            {items.length < maxFiles ? (
              <MediaDropzone
                variant="tile"
                disabled={disabled}
                onFilesAccepted={onFilesAccepted}
                onError={onError}
                maxFiles={maxFiles}
                currentCount={items.length}
                errorMessage={errorMessage}
                hideError
                hideMeta
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.72rem] text-muted-foreground">
            <span>
              {galleryCount} supporting image{galleryCount === 1 ? "" : "s"} after the primary image.
            </span>
            <span>
              PNG, JPG, WEBP, or GIF up to 5 MB each.
            </span>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-destructive/25 bg-destructive/6 px-3 py-2 text-sm text-[color:var(--destructive)]">
              {errorMessage}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MediaTile({
  item,
  index,
  totalCount,
  disabled,
  isPrimaryTile,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: {
  item: ProductMediaItem;
  index: number;
  totalCount: number;
  disabled?: boolean;
  isPrimaryTile: boolean;
  onMakePrimary: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const canMoveLeft = index > 0;
  const canMoveRight = index < totalCount - 1;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card",
        "transition hover:border-primary/35 hover:shadow-sm",
        item.isPrimary && "ring-1 ring-primary/25",
        isPrimaryTile && "col-span-2 row-span-2",
      )}
    >
      <div className={cn("relative bg-muted", isPrimaryTile ? "aspect-[1.35]" : "aspect-square")}>
        <img
          src={item.previewUrl}
          alt={item.name || "Product media"}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.01]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent opacity-70" />

        <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-1">
          {item.isPrimary ? (
            <Badge className="h-5 border-primary/25 bg-card/90 px-1.5 text-[0.64rem] text-primary">
              <Star className="size-3" />
              Primary
            </Badge>
          ) : null}
          {item.kind === "new" ? (
            <Badge variant="secondary" className="h-5 bg-card/90 px-1.5 text-[0.64rem]">
              New
            </Badge>
          ) : null}
        </div>

        <div className="absolute inset-x-1.5 bottom-1.5 flex flex-wrap justify-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          {!item.isPrimary ? (
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() => onMakePrimary(item.id)}
              disabled={disabled}
              aria-label={`Make ${item.name} the primary image`}
            >
              <CheckCircle2 className="size-3.5" />
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => onMoveLeft(item.id)}
            disabled={disabled || !canMoveLeft}
            aria-label={`Move ${item.name} left`}
          >
            <ArrowLeft className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => onMoveRight(item.id)}
            disabled={disabled || !canMoveRight}
            aria-label={`Move ${item.name} right`}
          >
            <ArrowRight className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => onRemove(item.id)}
            disabled={disabled}
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {isPrimaryTile ? (
        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-2.5 py-1.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">
              {item.name || "Primary image"}
            </p>
            <p className="text-[0.68rem] text-muted-foreground">
              {formatSize(item.size)}
            </p>
          </div>
          <span className="shrink-0 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Featured
          </span>
        </div>
      ) : null}
    </article>
  );
}

function ReplacePrimaryButton({
  disabled,
  onReplacePrimary,
}: {
  disabled?: boolean;
  onReplacePrimary: (file: File) => void;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onReplacePrimary(file);
          event.target.value = "";
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
        <span>
          <ImagePlus className="size-4" />
          Replace primary
        </span>
      </Button>
    </label>
  );
}
