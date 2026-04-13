import type { PaymentMethod } from "@/types/payment";

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type { PaymentMethod } from "@/types/payment";

export type OrderStatus =
  | "placed"
  | "pending_payment"
  | "paid"
  | "processing"
  | "delivered";

export type Order = {
  id: string;
  items: OrderItem[];
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalItems: number;
  status: OrderStatus;
  createdAt: string;
};
