export const SHOPPING_CATEGORIES = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Body Care",
  "Fragrance",
] as const;

export const PRODUCT_CATEGORY_FILTERS = [
  "All",
  ...SHOPPING_CATEGORIES,
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];
export type ProductCategoryFilter = (typeof PRODUCT_CATEGORY_FILTERS)[number];

export type CategoryMeta = {
  label: ShoppingCategory;
  subtitle: string;
  description: string;
  image: string;
  accentColor: string;
  gradient: [string, string, string];
};

export const CATEGORY_CARDS: CategoryMeta[] = [
  {
    label: "Skincare",
    subtitle: "Barrier-first essentials",
    description:
      "Hydrating layers, brightening serums, and daily rituals for a fresh glow.",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
    accentColor: "#fda4af",
    gradient: [
      "rgba(15,23,42,0.08)",
      "rgba(15,23,42,0.38)",
      "rgba(15,23,42,0.84)",
    ],
  },
  {
    label: "Makeup",
    subtitle: "Studio colour edits",
    description:
      "Velvet lips, soft-focus cheeks, and bold pigment for every mood board.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
    accentColor: "#fdba74",
    gradient: [
      "rgba(120,53,15,0.12)",
      "rgba(120,53,15,0.4)",
      "rgba(17,24,39,0.88)",
    ],
  },
  {
    label: "Haircare",
    subtitle: "Repair and shine",
    description:
      "Nourishing oils, restorative masks, and wash-day staples for healthy bounce.",
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop",
    accentColor: "#67e8f9",
    gradient: [
      "rgba(8,47,73,0.08)",
      "rgba(8,47,73,0.34)",
      "rgba(17,24,39,0.86)",
    ],
  },
  {
    label: "Body Care",
    subtitle: "Soft skin rituals",
    description:
      "Polishing scrubs, body lotions, and shower picks designed for everyday care.",
    image:
      "https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=1200&auto=format&fit=crop",
    accentColor: "#f9a8d4",
    gradient: [
      "rgba(131,24,67,0.08)",
      "rgba(131,24,67,0.34)",
      "rgba(17,24,39,0.84)",
    ],
  },
  {
    label: "Fragrance",
    subtitle: "Signature blends",
    description:
      "Layer clean florals, warm woods, and travel-friendly scents into your routine.",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
    accentColor: "#c4b5fd",
    gradient: [
      "rgba(67,56,202,0.08)",
      "rgba(67,56,202,0.34)",
      "rgba(17,24,39,0.88)",
    ],
  },
];

export function isShoppingCategory(value: string): value is ShoppingCategory {
  return SHOPPING_CATEGORIES.includes(value as ShoppingCategory);
}

export function isProductCategoryFilter(
  value: string,
): value is ProductCategoryFilter {
  return PRODUCT_CATEGORY_FILTERS.includes(value as ProductCategoryFilter);
}

export function getCategoryMeta(
  label?: string,
): CategoryMeta | undefined {
  if (!label || !isShoppingCategory(label)) {
    return undefined;
  }

  return CATEGORY_CARDS.find((item) => item.label === label);
}
