"use client";

import type { ProductMediaItem } from "@/components/products/useProductMedia";
import MediaPreviewCard from "@/components/products/MediaPreviewCard";

type MediaPreviewGridProps = {
  items: ProductMediaItem[];
  onMakePrimary: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function MediaPreviewGrid({
  items,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
  onRemove,
}: MediaPreviewGridProps) {
  if (!items.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <MediaPreviewCard
          key={item.id}
          item={item}
          index={index}
          totalCount={items.length}
          onMakePrimary={onMakePrimary}
          onMoveLeft={onMoveLeft}
          onMoveRight={onMoveRight}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
