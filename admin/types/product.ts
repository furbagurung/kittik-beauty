export type ProductStatus = "Active" | "Draft" | "Archived" | "Out of Stock";

export type VariantOption = {
  name: string;
  values: string[];
};

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

export type ProductVariantStatus = "ACTIVE" | "ARCHIVED" | "OUT_OF_STOCK";

export type ProductVariant = {
  id?: number;
  productId?: number;
  title: string;
  price: number;
  stock: number;
  image?: string | null;
  imageFileKey?: string | null;
  isDefault: boolean;
  position: number;
  status?: ProductVariantStatus;
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
  id: string;
  name: string;
  title?: string;
  slug?: string;
  category: string;
  price: string;
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
