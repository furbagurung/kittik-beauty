"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ProductMediaStatus = "idle" | "ready" | "error";
export type ProductMediaKind = "existing" | "new";

export type ProductMediaItem = {
  id: string;
  kind: ProductMediaKind;
  file?: File;
  previewUrl: string;
  sourceUrl?: string;
  name: string;
  size: number;
  isPrimary: boolean;
  status: ProductMediaStatus;
  errorMessage?: string;
};

type UseProductMediaOptions = {
  initialPrimaryImage?: string;
  initialGalleryImages?: string[];
  maxFiles?: number;
  maxFileSize?: number;
};

const DEFAULT_MAX_FILES = 9;
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

function createExistingItem(sourceUrl: string, isPrimary: boolean): ProductMediaItem {
  const filename = sourceUrl.split("/").pop() || "existing-image";

  return {
    id: `existing-${sourceUrl}`,
    kind: "existing",
    previewUrl: sourceUrl,
    sourceUrl,
    name: filename,
    size: 0,
    isPrimary,
    status: "ready",
  };
}

function ensurePrimary(items: ProductMediaItem[]) {
  if (!items.length) return items;

  let foundPrimary = false;

  return items.map((item, index) => {
    if (item.isPrimary && !foundPrimary) {
      foundPrimary = true;
      return item;
    }

    if (!foundPrimary && index === 0) {
      foundPrimary = true;
      return { ...item, isPrimary: true };
    }

    return item.isPrimary ? { ...item, isPrimary: false } : item;
  });
}

function normalizeIncomingItems(items: ProductMediaItem[]) {
  const ordered = [...items];
  const primaryIndex = ordered.findIndex((item) => item.isPrimary);

  if (primaryIndex > 0) {
    const [primaryItem] = ordered.splice(primaryIndex, 1);
    ordered.unshift(primaryItem);
  }

  return ensurePrimary(ordered).map((item, index) => ({
    ...item,
    isPrimary: index === 0,
  }));
}

function buildInitialItems(
  initialPrimaryImage: string,
  initialGalleryImages: string[],
) {
  const initialItems: ProductMediaItem[] = [];

  if (initialPrimaryImage) {
    initialItems.push(createExistingItem(initialPrimaryImage, true));
  }

  initialGalleryImages.forEach((imageUrl) => {
    if (imageUrl && imageUrl !== initialPrimaryImage) {
      initialItems.push(createExistingItem(imageUrl, false));
    }
  });

  return normalizeIncomingItems(initialItems);
}

function revokeNewPreviewUrls(items: ProductMediaItem[]) {
  items.forEach((item) => {
    if (item.kind === "new" && item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
  });
}

export function useProductMedia({
  initialPrimaryImage = "",
  initialGalleryImages = [],
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
}: UseProductMediaOptions) {
  const [mediaItems, setMediaItems] = useState<ProductMediaItem[]>(() =>
    buildInitialItems(initialPrimaryImage, initialGalleryImages),
  );
  const [dropzoneError, setDropzoneError] = useState("");
  const mediaItemsRef = useRef<ProductMediaItem[]>([]);

  const resetToInitial = useCallback(() => {
    setMediaItems((current) => {
      revokeNewPreviewUrls(current);
      return buildInitialItems(initialPrimaryImage, initialGalleryImages);
    });
    setDropzoneError("");
  }, [initialGalleryImages, initialPrimaryImage]);

  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  useEffect(() => {
    return () => {
      revokeNewPreviewUrls(mediaItemsRef.current);
    };
  }, []);

  const acceptFiles = useCallback(
    (files: File[]) => {
      setMediaItems((current) => {
        const remainingSlots = maxFiles - current.length;

        if (remainingSlots <= 0) {
          setDropzoneError(`You can upload up to ${maxFiles} images.`);
          return current;
        }

        const accepted = files.slice(0, remainingSlots);
        const rejectedOversize = accepted.find((file) => file.size > maxFileSize);

        if (rejectedOversize) {
          setDropzoneError("Each image must be 5 MB or smaller.");
          return current;
        }

        if (files.length > remainingSlots) {
          setDropzoneError(`Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added.`);
        } else {
          setDropzoneError("");
        }

        const nextItems = accepted.map((file, index) => ({
          id: `new-${file.name}-${file.lastModified}-${file.size}-${index}`,
          kind: "new" as const,
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          isPrimary: false,
          status: "ready" as const,
        }));

        return normalizeIncomingItems([...current, ...nextItems]);
      });
    },
    [maxFileSize, maxFiles],
  );

  const removeItem = useCallback((id: string) => {
    setMediaItems((current) => {
      const next = current.filter((item) => item.id !== id);
      const removed = current.find((item) => item.id === id);

      if (removed?.kind === "new") {
        URL.revokeObjectURL(removed.previewUrl);
      }

      return normalizeIncomingItems(next);
    });
  }, []);

  const setPrimary = useCallback((id: string) => {
    setMediaItems((current) =>
      normalizeIncomingItems(
        current.map((item) => ({
          ...item,
          isPrimary: item.id === id,
        })),
      ),
    );
  }, []);

  const moveItem = useCallback((id: string, direction: "left" | "right") => {
    setMediaItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;

      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);

      return normalizeIncomingItems(next);
    });
  }, []);

  const replacePrimary = useCallback(
    (file: File) => {
      if (file.size > maxFileSize) {
        setDropzoneError("Each image must be 5 MB or smaller.");
        return;
      }

      setDropzoneError("");
      setMediaItems((current) => {
        const nextPrimary: ProductMediaItem = {
          id: `new-${file.name}-${file.lastModified}-${file.size}-primary`,
          kind: "new",
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          isPrimary: true,
          status: "ready",
        };

        const previousPrimary = current[0];
        if (previousPrimary?.kind === "new") {
          URL.revokeObjectURL(previousPrimary.previewUrl);
        }

        const rest = current.slice(1);
        return normalizeIncomingItems([nextPrimary, ...rest]);
      });
    },
    [maxFileSize],
  );

  const derived = useMemo(() => {
    const primaryItem = mediaItems[0] ?? null;
    const galleryItems = mediaItems.slice(1);

    return {
      items: mediaItems,
      primaryItem,
      galleryItems,
      totalCount: mediaItems.length,
      hasPrimary: Boolean(primaryItem),
      existingGalleryImages: galleryItems
        .filter((item) => item.kind === "existing" && item.sourceUrl)
        .map((item) => item.sourceUrl as string),
      galleryFiles: galleryItems
        .filter((item): item is ProductMediaItem & { file: File } => item.kind === "new" && Boolean(item.file))
        .map((item) => item.file),
      primaryImageFile:
        primaryItem?.kind === "new" && primaryItem.file ? primaryItem.file : null,
      primaryExistingImage:
        primaryItem?.kind === "existing" ? primaryItem.sourceUrl ?? "" : "",
    };
  }, [mediaItems]);

  return {
    ...derived,
    dropzoneError,
    acceptFiles,
    moveItem,
    removeItem,
    replacePrimary,
    setPrimary,
    reset: resetToInitial,
    reportDropzoneError: (message: string) => setDropzoneError(message),
    clearDropzoneError: () => setDropzoneError(""),
  };
}
