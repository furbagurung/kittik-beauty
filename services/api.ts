import { request } from "@/services/http";
import type { AuthUser } from "@/types/auth";

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type EsewaInitiateBody = {
  orderId: string;
  amount: number;
  customerName: string;
  phone: string;
  returnUrl?: string;
};

type EsewaInitiateResponse = {
  success: boolean;
  message: string;
  transaction_uuid: string;
  amount: number;
  customerName: string;
  phone: string;
  redirectUrl: string;
};

type EsewaVerifyBody = {
  orderId: string;
  paymentId?: string;
  providerReference?: string;
  data?: string;
};

type EsewaVerifyResponse = {
  success: boolean;
  status: string;
  message: string;
};

export const api = {
  getProducts: (params?: {
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const searchParams = new URLSearchParams();

    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sort) searchParams.append("sort", params.sort);

    const query = searchParams.toString();
    return request<any[]>(`/products${query ? `?${query}` : ""}`);
  },

  getProductById: (id: string | number) => {
    return request<any>(`/products/${id}`);
  },

  signup: (body: { name: string; email: string; password: string }) => {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login: (body: { email: string; password: string }) => {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getCurrentUser: (token: string) => {
    return request<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      token,
    });
  },

  getOrders: (token: string) => {
    return request<any[]>("/orders", {
      method: "GET",
      token,
    });
  },

  getOrderById: (token: string, id: string | number) => {
    return request<any>(`/orders/${id}`, {
      method: "GET",
      token,
    });
  },

  createOrder: (token: string, body: any) => {
    return request<any>("/orders", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  updateOrderStatus: (token: string, id: string | number, status: string) => {
    return request<any>(`/orders/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
  },

  initiateEsewaPayment: (body: EsewaInitiateBody, token?: string | null) => {
    return request<EsewaInitiateResponse>("/payments/esewa/initiate", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  verifyEsewaPayment: (body: EsewaVerifyBody, token?: string | null) => {
    return request<EsewaVerifyResponse>("/payments/esewa/verify", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },
};
