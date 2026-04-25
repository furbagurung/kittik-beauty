export type AdminProductCategoryObject = {
  id?: number | string | null;
  name?: string | null;
  slug?: string | null;
};

export type AdminProductCategoryValue =
  | string
  | AdminProductCategoryObject
  | null
  | undefined;

export function getAdminProductCategoryName(
  category: AdminProductCategoryValue,
  fallback = "Uncategorized",
): string {
  if (typeof category === "string") {
    return category.trim() || fallback;
  }

  if (category && typeof category === "object") {
    return category.name?.trim() || fallback;
  }

  return fallback;
}

export function getAdminProductCategoryId(
  category: AdminProductCategoryValue,
): number | null {
  if (category && typeof category === "object" && category.id != null) {
    if (typeof category.id === "number") {
      return Number.isFinite(category.id) ? category.id : null;
    }

    const numericId = Number(category.id);

    return Number.isFinite(numericId) ? numericId : null;
  }

  return null;
}
