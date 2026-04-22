/* eslint-disable @next/next/no-img-element */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductMediaItem } from "@/components/products/useProductMedia";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ImageUp,
  Star,
  Trash2,
} from "lucide-react";

type MediaPreviewCardProps = {
  item: ProductMediaItem;
  index: number;
  totalCount: number;
  onMakePrimary: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onRemove: (id: string) => void;
};

function formatSize(size: number) {
  if (!size) return "Existing";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPreviewCard({
  item,
  index,
  totalCount,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: MediaPreviewCardProps) {
  const canMoveLeft = index > 0;
  const canMoveRight = index < totalCount - 1;

  return (
    <article
      className={cn(
        "group surface-shadow-soft overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200",
        item.isPrimary && "ring-1 ring-primary/25",
      )}
    >
      <div className="relative aspect-[1.08] overflow-hidden bg-muted">
        <img
          src={item.previewUrl}
          alt={item.name || "Product media"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.015]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          {item.isPrimary ? (
            <Badge className="border-primary/25 bg-primary/12 text-primary">
              <Star className="size-3.5" />
              Primary
            </Badge>
          ) : null}
          {item.kind === "new" ? (
            <Badge variant="secondary" className="bg-card/88 text-foreground">
              New
            </Badge>
          ) : null}
        </div>

        <div className="absolute inset-x-3 bottom-3 flex flex-wrap justify-end gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          {!item.isPrimary ? (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => onMakePrimary(item.id)}
              aria-label={`Make ${item.name} the primary image`}
            >
              <CheckCircle2 className="size-4" />
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onMoveLeft(item.id)}
            disabled={!canMoveLeft}
            aria-label={`Move ${item.name} left`}
          >
            <ArrowLeft className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onMoveRight(item.id)}
            disabled={!canMoveRight}
            aria-label={`Move ${item.name} right`}
          >
            <ArrowRight className="size-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/70 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {item.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatSize(item.size)}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[0.68rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            <ImageUp className="size-3" />
            {index + 1}
          </span>
        </div>
      </div>
    </article>
  );
}
