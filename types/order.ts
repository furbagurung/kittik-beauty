export type OrderItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type PaymentMethod = "cod" | "esewa" | "khalti";

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
