const API_BASE_URL = "http://localhost:5000/api";
function getStoredAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || `API request failed: ${response.status}`,
    );
  }

  return response.json();
}

export type AdminApiProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
  createdAt: string;
};
export async function getProducts() {
  return apiFetch<AdminApiProduct[]>("/products");
}
export async function getProductById(id: number) {
  return apiFetch<AdminApiProduct>(`/products/${id}`);
}
export async function createProduct(data: {
  name: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
}) {
  return apiFetch<AdminApiProduct>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    getStoredAdminToken() || undefined,
  );
}
export async function updateProduct(
  id: number,
  data: {
    name: string;
    price: number;
    image?: string;
    category: string;
    stock: number;
    description?: string;
  },
) {
  return apiFetch<AdminApiProduct>(
    `/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    getStoredAdminToken() || undefined,
  );
}
export type AdminApiOrderItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export type AdminApiOrder = {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  totalItems: number;
  status: string;
  createdAt: string;
  items: AdminApiOrderItem[];
};
export async function getOrders() {
  return apiFetch<AdminApiOrder[]>(
    "/orders",
    undefined,
    getStoredAdminToken() || undefined,
  );
}
export async function getOrderById(id: number) {
  return apiFetch<AdminApiOrder>(
    `/orders/${id}`,
    undefined,
    getStoredAdminToken() || undefined,
  );
}
export async function updateOrderStatus(id: number, status: string) {
  return apiFetch<AdminApiOrder>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    getStoredAdminToken() || undefined,
  );
}
export type AdminLoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export async function adminLogin(data: { email: string; password: string }) {
  return apiFetch<AdminLoginResponse>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export type AdminApiUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export async function getUsers() {
  return apiFetch<AdminApiUser[]>(
    "/auth/users",
    undefined,
    getStoredAdminToken() || undefined,
  );
}
export type AdminDashboardStats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
};

export async function getAdminStats() {
  return apiFetch<AdminDashboardStats>(
    "/auth/admin/stats",
    undefined,
    getStoredAdminToken() || undefined,
  );
}
export type AdminRecentOrder = {
  id: number;
  fullName: string;
  total: number;
  status: string;
  createdAt: string;
};

export async function getRecentOrders() {
  return apiFetch<AdminRecentOrder[]>(
    "/auth/admin/recent-orders",
    undefined,
    getStoredAdminToken() || undefined,
  );
}
