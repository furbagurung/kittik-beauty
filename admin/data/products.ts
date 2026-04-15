import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "P-001",
    name: "Vitamin C Face Serum",
    category: "Skincare",
    price: "NPR 1,200",
    stock: 24,
    status: "Active",
  },
  {
    id: "P-002",
    name: "Hydrating Cleanser",
    category: "Face Wash",
    price: "NPR 850",
    stock: 10,
    status: "Active",
  },
  {
    id: "P-003",
    name: "Matte Lipstick",
    category: "Makeup",
    price: "NPR 950",
    stock: 0,
    status: "Out of Stock",
  },
];
