import { request } from "@/services/http";
import type {
  AdminCustomerSummary,
  AdminDashboard,
  AdminOrder,
  AdminProduct,
  AdminProductInput,
} from "@/types/admin";
import type { OrderStatus } from "@/types/order";

type AdminListParams = {
  search?: string;
  category?: string;
  status?: OrderStatus;
};

function buildQuery(params?: AdminListParams) {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.append("search", params.search);
  }

  if (params?.category) {
    searchParams.append("category", params.category);
  }

  if (params?.status) {
    searchParams.append("status", params.status);
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

export const adminClient = {
  getDashboard: (token: string) => {
    return request<AdminDashboard>("/admin/dashboard", {
      method: "GET",
      token,
    });
  },

  getProducts: (token: string, params?: AdminListParams) => {
    return request<AdminProduct[]>(`/admin/products${buildQuery(params)}`, {
      method: "GET",
      token,
    });
  },

  createProduct: (token: string, body: AdminProductInput) => {
    return request<AdminProduct>("/admin/products", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  updateProduct: (
    token: string,
    productId: number,
    body: AdminProductInput,
  ) => {
    return request<AdminProduct>(`/admin/products/${productId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    });
  },

  deleteProduct: (token: string, productId: number) => {
    return request<{ success: boolean; message: string }>(
      `/admin/products/${productId}`,
      {
        method: "DELETE",
        token,
      },
    );
  },

  getOrders: (token: string, params?: AdminListParams) => {
    return request<AdminOrder[]>(`/admin/orders${buildQuery(params)}`, {
      method: "GET",
      token,
    });
  },

  updateOrderStatus: (
    token: string,
    orderId: number,
    status: OrderStatus,
  ) => {
    return request<AdminOrder>(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
  },

  getCustomers: (token: string, params?: Pick<AdminListParams, "search">) => {
    return request<AdminCustomerSummary[]>(
      `/admin/customers${buildQuery(params)}`,
      {
        method: "GET",
        token,
      },
    );
  },
};
