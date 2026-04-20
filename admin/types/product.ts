export type ProductStatus = "Active" | "Draft" | "Archived" | "Out of Stock";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: ProductStatus;
  image?: string;
  images?: string[];
  description?: string;
};
