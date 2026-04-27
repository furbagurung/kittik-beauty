import type { AdminUser } from "@/lib/admin-session";
import { clearAdminSession, getStoredAdminToken } from "@/lib/admin-session";
import { API_BASE_URL } from "@/lib/api-config";
import type { AdminProductCategoryValue } from "@/lib/product-category";
import type {
  ProductMedia,
  ProductOption,
  ProductStatus,
  ProductVariant,
} from "@/types/product";

const API_BASE = "https://kittik.furkedesigns.com";
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const isFormDataBody =
    typeof FormData !== "undefined" && options?.body instanceof FormData;

  const requestUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.warn("[admin-api] request failed", {
        endpoint,
        requestUrl,
        status: response.status,
        message: errorData?.message,
      });

      if (token && (response.status === 401 || response.status === 403)) {
        clearAdminSession();
      }

      throw new Error(
        errorData?.message || `API request failed: ${response.status}`,
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.warn("[admin-api] request error", {
        endpoint,
        requestUrl,
        message: error.message,
      });
    }

    throw error;
  }
}

export type AdminApiProduct = {
  id: number;
  name: string;
  title?: string;
  slug?: string;
  price: number;
  image?: string;
  images?: string[];
  featuredImage?: string;
  media?: ProductMedia[];
  category: AdminProductCategoryValue;
  categoryId?: number | null;
  stock: number;
  status: ProductStatus;
  description?: string;
  productType?: string | null;
  vendor?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  tags?: string[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  defaultVariantId?: number | null;
  createdAt: string;
};

export type AdminApiProductCategory = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminApiBanner = {
  id: number;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  cta?: string | null;
  link?: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ReelStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type AdminApiReelProductTag = {
  id: number;
  productId: number;
  variantId?: number | null;
  ctaLabel: string;
  sortOrder: number;
  product: {
    id: number;
    name: string;
    category?: AdminProductCategoryValue;
    price: number;
    image?: string;
  };
  variant?: {
    id: number;
    title: string;
    price: number;
    image?: string | null;
  } | null;
};

export type AdminApiReel = {
  id: number;
  title: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  status: ReelStatus;
  featured: boolean;
  sortOrder: number;
  creatorName: string;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  productClickCount: number;
  productTags: AdminApiReelProductTag[];
  createdAt: string;
  updatedAt: string;
};

type ProductMutationInput = {
  name: string;
  price: number;
  category: string;
  categoryId?: number | null;
  stock: number;
  status: ProductStatus;
  description?: string;
  image?: string;
  primaryImageFile?: File | null;
  galleryFiles?: File[];
  existingGalleryImages?: string[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  tags?: string[];
  productType?: string;
  vendor?: string;
  seoTitle?: string;
  seoDescription?: string;
  variantImageFiles?: Array<{ key: string; file: File }>;
};

export type BannerMutationInput = {
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
  order?: number;
};

export type ReelMutationInput = {
  title: string;
  caption?: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  videoFile?: File | null;
  thumbnailFile?: File | null;
  duration?: number | null;
  status: ReelStatus;
  featured: boolean;
  sortOrder: number;
  productTags: Array<{
    productId: number;
    variantId?: number | null;
    ctaLabel: string;
    sortOrder: number;
  }>;
};

function buildProductMutationFormData(data: ProductMutationInput) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("price", String(data.price));
  formData.append("category", data.category);
  formData.append(
    "categoryId",
    data.categoryId == null ? "" : String(data.categoryId),
  );
  formData.append("stock", String(data.stock));
  formData.append("status", data.status);
  formData.append("description", data.description ?? "");
  formData.append("image", data.image ?? "");
  formData.append("options", JSON.stringify(data.options ?? []));
  formData.append("variants", JSON.stringify(data.variants ?? []));
  formData.append("tags", JSON.stringify(data.tags ?? []));
  formData.append("productType", data.productType ?? "");
  formData.append("vendor", data.vendor ?? "");
  formData.append("seoTitle", data.seoTitle ?? "");
  formData.append("seoDescription", data.seoDescription ?? "");
  formData.append(
    "variantImageKeys",
    JSON.stringify(data.variantImageFiles?.map((item) => item.key) ?? []),
  );
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

  for (const item of data.variantImageFiles ?? []) {
    formData.append("variantImages", item.file);
  }

  return formData;
}

function buildReelMutationFormData(data: ReelMutationInput) {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("caption", data.caption ?? "");
  formData.append("videoUrl", data.videoUrl ?? "");
  formData.append("thumbnailUrl", data.thumbnailUrl ?? "");
  formData.append(
    "duration",
    data.duration === null ? "" : String(data.duration ?? ""),
  );
  formData.append("status", data.status);
  formData.append("featured", String(data.featured));
  formData.append("sortOrder", String(data.sortOrder ?? 0));
  formData.append("productTags", JSON.stringify(data.productTags ?? []));

  if (data.videoFile) {
    formData.append("video", data.videoFile);
  }

  if (data.thumbnailFile) {
    formData.append("thumbnail", data.thumbnailFile);
  }

  return formData;
}

export async function getProducts() {
  return apiFetch<AdminApiProduct[]>("/products");
}
export async function getProductById(id: number) {
  return apiFetch<AdminApiProduct>(`/products/${id}`);
}
export async function createProduct(data: ProductMutationInput) {
  return apiFetch<AdminApiProduct>(
    "/products",
    {
      method: "POST",
      body: buildProductMutationFormData(data),
    },
    getStoredAdminToken() || undefined,
  );
}
export async function updateProduct(id: number, data: ProductMutationInput) {
  return apiFetch<AdminApiProduct>(
    `/products/${id}`,
    {
      method: "PUT",
      body: buildProductMutationFormData(data),
    },
    getStoredAdminToken() || undefined,
  );
}
export async function deleteProduct(id: number) {
  return apiFetch<{ message: string }>(
    `/products/${id}`,
    {
      method: "DELETE",
    },
    getStoredAdminToken() || undefined,
  );
}

export async function getProductCategories() {
  return apiFetch<AdminApiProductCategory[]>("/categories");
}

export async function createProductCategory(data: {
  name: string;
  sortOrder?: number;
}) {
  return apiFetch<AdminApiProductCategory>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    getStoredAdminToken() || undefined,
  );
}

export async function updateProductCategory(
  id: number,
  data: {
    name: string;
    sortOrder?: number;
  },
) {
  return apiFetch<AdminApiProductCategory>(
    `/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    getStoredAdminToken() || undefined,
  );
}

export async function deleteProductCategory(id: number) {
  return apiFetch<{ message: string }>(
    `/categories/${id}`,
    {
      method: "DELETE",
    },
    getStoredAdminToken() || undefined,
  );
}

export async function getBanners() {
  const res = await fetch(`${API_BASE}/api/banners`);
  const response = await res.json();

  const banners: AdminApiBanner[] = response.data ?? response;

  return banners.map((banner) => ({
    ...banner,
    image: banner.image.startsWith("/uploads/")
      ? `${API_BASE}${banner.image}`
      : banner.image,
  }));
}

export async function createBanner(data: BannerMutationInput, file: File) {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("title", data.title || "");
  formData.append("subtitle", data.subtitle || "");
  formData.append("cta", data.cta || "");
  formData.append("link", data.link || "");
  formData.append("order", String(data.order || 0));

  const res = await fetch(`${API_BASE}/api/banners`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function deleteBanner(id: number) {
  await fetch(`${API_BASE}/api/banners/${id}`, {
    method: "DELETE",
  });
}

export async function getReels() {
  return apiFetch<AdminApiReel[]>(
    "/reels/admin",
    undefined,
    getStoredAdminToken() || undefined,
  );
}

export async function getReelById(id: number) {
  return apiFetch<AdminApiReel>(
    `/reels/admin/${id}`,
    undefined,
    getStoredAdminToken() || undefined,
  );
}

export async function createReel(data: ReelMutationInput) {
  return apiFetch<AdminApiReel>(
    "/reels",
    {
      method: "POST",
      body: buildReelMutationFormData(data),
    },
    getStoredAdminToken() || undefined,
  );
}

export async function updateReel(id: number, data: ReelMutationInput) {
  return apiFetch<AdminApiReel>(
    `/reels/${id}`,
    {
      method: "PUT",
      body: buildReelMutationFormData(data),
    },
    getStoredAdminToken() || undefined,
  );
}

export async function deleteReel(id: number) {
  return apiFetch<{ message: string }>(
    `/reels/${id}`,
    {
      method: "DELETE",
    },
    getStoredAdminToken() || undefined,
  );
}

export type AdminApiOrderItem = {
  id: number;
  variantId: number;
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
    role?: string;
  };
};

export async function adminLogin(data: { email: string; password: string }) {
  console.debug("[admin-auth] login request", {
    requestUrl: `${API_BASE_URL}/auth/login`,
  });

  const response = await apiFetch<AdminLoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  console.debug("[admin-auth] login response", {
    hasToken: Boolean(response.token),
    userEmail: response.user?.email,
    hasRole: Boolean(response.user?.role),
  });

  return response;
}
export async function getCurrentAdmin(
  token = getStoredAdminToken() || undefined,
) {
  console.debug("[admin-auth] admin validation request", {
    requestUrl: `${API_BASE_URL}/auth/admin/me`,
    hasToken: Boolean(token),
  });

  const response = await apiFetch<AdminUser>(
    "/auth/admin/me",
    undefined,
    token,
  );

  console.debug("[admin-auth] admin validation response", {
    userEmail: response.email,
    role: response.role,
  });

  return response;
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
