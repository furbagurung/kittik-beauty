export type ProductStatus = "Active" | "Draft" | "Archived" | "Out of Stock";
export type VariantStatus = "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";

export type ProductOptionValue = {
  id?: number;
  optionId?: number;
  value: string;
  position?: number;
};

export type ProductOption = {
  id?: number;
  name: string;
  position?: number;
  values: ProductOptionValue[];
};

export type ProductVariantSelection = {
  optionId?: number;
  optionName: string;
  optionValueId?: number;
  value: string;
};

export type ProductVariant = {
  id?: number;
  productId?: number;
  title: string;
  sku?: string | null;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  stock: number;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  weight?: number | null;
  weightUnit?: "KG" | "G" | "LB" | "OZ" | null;
  image?: string | null;
  imageFileKey?: string | null;
  isDefault: boolean;
  position: number;
  status: VariantStatus;
  selectedOptions: ProductVariantSelection[];
};

export type ProductMedia = {
  id?: number;
  productId?: number;
  url: string;
  altText?: string | null;
  type?: "IMAGE" | "VIDEO";
  position: number;
};

export type Product = {
  id: number;
  name: string;
  title?: string;
  slug?: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  images?: string[];
  featuredImage?: string;
  media?: ProductMedia[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  defaultVariantId?: number | null;
  tags?: string[];
  productType?: string | null;
  vendor?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  description?: string;
  rating?: number;
};
