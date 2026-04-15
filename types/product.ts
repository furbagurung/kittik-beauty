export type Product = {
  id: string | number;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category?: string;
  rating?: number;
  description?: string;
  stock: number;
};
