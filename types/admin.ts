import type { UserRole } from "@/types/auth";
import type { OrderStatus } from "@/types/order";
import type { PaymentMethod } from "@/types/payment";

export type AdminSection = "overview" | "products" | "orders" | "customers";

export type AdminMetrics = {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  averageOrderValue: number;
};

export type AdminStatusBreakdown = {
  status: OrderStatus;
  count: number;
  total: number;
};

export type AdminOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export type AdminOrderUser = {
  id: number;
  name: string;
  email: string;
};

export type AdminOrder = {
  id: number;
  userId: number;
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
  items: AdminOrderItem[];
  user: AdminOrderUser;
};

export type AdminDashboard = {
  metrics: AdminMetrics;
  statusBreakdown: AdminStatusBreakdown[];
  recentOrders: AdminOrder[];
};

export type AdminProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  createdAt: string;
};

export type AdminProductInput = {
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
};

export type AdminProductFormState = {
  name: string;
  price: string;
  image: string;
  category: string;
  rating: string;
};

export type AdminCustomerSummary = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
};
