export type ProductCategoryObject = {
  id?: number;
  name?: string | null;
  slug?: string | null;
};

export type ProductCategoryValue =
  | string
  | ProductCategoryObject
  | null
  | undefined;

export function getProductCategoryName(
  category: ProductCategoryValue,
  fallback = "Uncategorized",
) {
  if (typeof category === "string") {
    return category.trim() || fallback;
  }

  if (category && typeof category === "object") {
    return category.name?.trim() || fallback;
  }

  return fallback;
}
