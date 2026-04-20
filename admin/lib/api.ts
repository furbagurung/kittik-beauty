import { getStoredAdminToken } from "@/lib/admin-session";

const API_BASE_URL = "http://localhost:5000/api";

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const isFormDataBody =
    typeof FormData !== "undefined" && options?.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
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
  image?: string;
  images?: string[];
  category: string;
  stock: number;
  description?: string;
  createdAt: string;
};

type ProductMutationInput = {
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  primaryImageFile?: File | null;
  galleryFiles?: File[];
  existingGalleryImages?: string[];
};

function buildProductMutationFormData(data: ProductMutationInput) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("category", data.category);
  formData.append("stock", String(data.stock));
  formData.append("description", data.description ?? "");
  formData.append(
    "existingGalleryImages",
    JSON.stringify(data.existingGalleryImages ?? []),
  );

  if (data.primaryImageFile) {
    formData.append("primaryImage", data.primaryImageFile);
  }

  for (const file of data.galleryFiles ?? []) {
    formData.append("galleryImages", file);
  }

  return formData;
}
export async function getProducts() {
  return apiFetch<AdminApiProduct[]>("/products");
}
export async function getProductById(id: number) {
  return apiFetch<AdminApiProduct>(`/products/${id}`);
}
export async function createProduct(data: {
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  primaryImageFile?: File | null;
  galleryFiles?: File[];
  existingGalleryImages?: string[];
}) {
  return apiFetch<AdminApiProduct>(
    "/products",
    {
      method: "POST",
      body: buildProductMutationFormData(data),
    },
    getStoredAdminToken() || undefined,
  );
}
export async function updateProduct(
  id: number,
  data: {
    name: string;
    price: number;
    category: string;
    stock: number;
    description?: string;
    primaryImageFile?: File | null;
    galleryFiles?: File[];
    existingGalleryImages?: string[];
  },
) {
  return apiFetch<AdminApiProduct>(
    `/products/${id}`,
    {
      method: "PUT",
      body: buildProductMutationFormData(data),
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
