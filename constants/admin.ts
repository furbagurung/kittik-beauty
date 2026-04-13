import type {
  AdminProduct,
  AdminProductFormState,
  AdminSection,
} from "@/types/admin";

export const ADMIN_SECTIONS: Array<{ key: AdminSection; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "products", label: "Products" },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
];

export const ADMIN_ORDER_STATUSES = [
  "pending_payment",
  "placed",
  "paid",
  "processing",
  "delivered",
] as const;

export const ADMIN_PRODUCT_CATEGORIES = [
  "Skincare",
  "Makeup",
  "Haircare",
  "Body Care",
  "Fragrance",
] as const;

export function createEmptyAdminProductForm(): AdminProductFormState {
  return {
    name: "",
    price: "",
    image: "",
    category: ADMIN_PRODUCT_CATEGORIES[0],
    rating: "4.5",
  };
}

export function createAdminProductFormFromProduct(
  product: AdminProduct,
): AdminProductFormState {
  return {
    name: product.name,
    price: String(product.price),
    image: product.image,
    category: product.category,
    rating: String(product.rating),
  };
}
