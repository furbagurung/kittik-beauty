import fs from "fs/promises";
import path from "path";

const UPLOADS_PREFIX = "/uploads/";
const UPLOADS_ROOT_DIR = path.resolve(process.cwd(), "uploads");

function safeParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(value);
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function normalizeManagedPath(value) {
  if (!value) return null;

  const normalized = String(value).trim().replace(/\\/g, "/");

  if (!normalized) return null;
  if (normalized.startsWith(UPLOADS_PREFIX)) return normalized;
  if (normalized.startsWith("uploads/")) return `/${normalized}`;

  return null;
}

function normalizeGalleryArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function getPublicServerBaseUrl(req) {
  const configuredBaseUrl = process.env.PUBLIC_SERVER_URL?.trim();

  if (configuredBaseUrl) {
    return stripTrailingSlash(configuredBaseUrl);
  }

  return `${req.protocol}://${req.get("host")}`;
}

export function toStoredImagePath(value, req) {
  if (!value) return null;

  const stringValue = String(value).trim();

  if (!stringValue) return null;

  const managedPath = normalizeManagedPath(stringValue);
  if (managedPath) return managedPath;

  if (!isHttpUrl(stringValue)) {
    return stringValue;
  }

  const parsedUrl = safeParseUrl(stringValue);
  if (!parsedUrl) return stringValue;

  const configuredOrigin = safeParseUrl(getPublicServerBaseUrl(req))?.origin;
  const requestOrigin = safeParseUrl(`${req.protocol}://${req.get("host")}`)?.origin;

  if (
    parsedUrl.pathname.startsWith(UPLOADS_PREFIX) &&
    [configuredOrigin, requestOrigin].filter(Boolean).includes(parsedUrl.origin)
  ) {
    return parsedUrl.pathname;
  }

  return stringValue;
}

export function buildPublicImageUrl(value, req) {
  const storedPath = toStoredImagePath(value, req);

  if (!storedPath) return null;
  if (isHttpUrl(storedPath)) return storedPath;
  if (storedPath.startsWith(UPLOADS_PREFIX)) {
    return `${getPublicServerBaseUrl(req)}${storedPath}`;
  }

  return storedPath;
}

export function normalizeStoredGalleryImages(value, req) {
  return normalizeGalleryArray(value)
    .map((item) => toStoredImagePath(item, req))
    .filter(Boolean);
}

export function parseGalleryField(value, req) {
  const rawEntries = Array.isArray(value) ? value : [value];
  const flattened = [];

  for (const entry of rawEntries) {
    if (!entry) continue;

    if (Array.isArray(entry)) {
      flattened.push(...entry);
      continue;
    }

    if (typeof entry === "string") {
      try {
        const parsed = JSON.parse(entry);

        if (Array.isArray(parsed)) {
          flattened.push(...parsed);
          continue;
        }
      } catch {
        // Ignore JSON parsing failures and treat the value as a plain string.
      }
    }

    flattened.push(entry);
  }

  return Array.from(
    new Set(flattened.map((item) => toStoredImagePath(item, req)).filter(Boolean)),
  );
}

export function getUploadedImagePaths(files = []) {
  return files
    .map((file) => file?.filename)
    .filter(Boolean)
    .map((filename) => `/uploads/products/${filename}`);
}

export async function deleteManagedImageFiles(values = []) {
  const uniqueManagedPaths = Array.from(
    new Set(values.map((value) => normalizeManagedPath(value)).filter(Boolean)),
  );

  await Promise.all(
    uniqueManagedPaths.map(async (relativePath) => {
      const absolutePath = path.resolve(process.cwd(), `.${relativePath}`);

      if (!absolutePath.startsWith(UPLOADS_ROOT_DIR)) {
        return;
      }

      try {
        await fs.unlink(absolutePath);
      } catch (error) {
        if (error?.code !== "ENOENT") {
          console.error("Failed to delete image file:", error);
        }
      }
    }),
  );
}

export function buildProductResponse(product, req) {
  const media = Array.isArray(product.productmedia)
    ? [...product.productmedia].sort(
        (left, right) => left.position - right.position,
      )
    : [];
  const variants = Array.isArray(product.variants)
    ? [...product.variants].sort(
        (left, right) => left.position - right.position,
      )
    : [];

  const defaultVariant =
    variants.find((variant) => variant.isDefault) ?? variants[0] ?? null;
  const featuredImage =
    product.featuredImage ?? defaultVariant?.image ?? media[0]?.url ?? null;
  const mediaImages = media
    .map((item) => item.url)
    .filter(Boolean);
  const gallerySource = mediaImages.length
    ? mediaImages.filter((item) => item !== featuredImage)
    : normalizeStoredGalleryImages(product.images, req);
  const galleryImages = gallerySource
    .map((value) => buildPublicImageUrl(value, req))
    .filter(Boolean);
  const stock = variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
  const variantStatuses = variants.map((variant) => variant.status);
  const allVariantsOutOfStock =
    variants.length > 0 &&
    variantStatuses.every((status) => status === "OUT_OF_STOCK");
  const compatibilityStatus =
    allVariantsOutOfStock || stock === 0
      ? "Out of Stock"
      : product.status === "ACTIVE"
        ? "Active"
        : product.status === "ARCHIVED"
          ? "Archived"
          : "Draft";

  const options = Array.isArray(product.options)
    ? [...product.options]
        .sort((left, right) => left.position - right.position)
        .map((option) => ({
          id: option.id,
          name: option.name,
          position: option.position,
          values: [...(option.values ?? [])]
            .sort((left, right) => left.position - right.position)
            .map((value) => ({
              id: value.id,
              optionId: value.optionId,
              value: value.value,
              position: value.position,
            })),
        }))
    : [];

  const normalizedVariants = variants.map((variant) => ({
    ...variant,
    selectedOptions: [...(variant.selections ?? [])]
      .sort(
        (left, right) =>
          (left.option?.position ?? 0) - (right.option?.position ?? 0),
      )
      .map((selection) => ({
        optionId: selection.optionId,
        optionName: selection.option?.name,
        optionValueId: selection.optionValueId,
        value: selection.optionValue?.value,
      }))
      .filter((selection) => selection.optionName && selection.value),
    selections: undefined,
  }));
  const publicMedia = media.map((item) => ({
    ...item,
    url: buildPublicImageUrl(item.url, req) || item.url,
  }));

  return {
    id: product.id,
    name: product.title,
    title: product.title,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category ?? product.categoryLegacy,
    categoryId: product.categoryId,
    status: compatibilityStatus,

    image: buildPublicImageUrl(featuredImage, req) || undefined,
    images: galleryImages,

    price: defaultVariant?.price ?? 0,
    stock,
    defaultVariantId: defaultVariant?.id ?? null,

    media: publicMedia,
    options,
    variants: normalizedVariants.map((variant) => ({
      ...variant,
      image: buildPublicImageUrl(variant.image, req) || variant.image,
    })),

    tags: Array.isArray(product.producttag)
      ? product.producttag.map((tag) => tag.value)
      : [],

    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
