const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

type RequestOptions = RequestInit & {
  token?: string | null;
};

type AuthUser = {
  id: number;
  name: string;
  email: string;
};

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

export type ReelProductTag = {
  id: number;
  productId: number;
  variantId?: number | null;
  ctaLabel: string;
  sortOrder: number;
  product: {
    id: number;
    name: string;
    category?: string | null;
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

export type Reel = {
  id: number;
  title: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured?: boolean;
  sortOrder?: number;
  creatorName: string;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  productClickCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt?: string;
  updatedAt?: string;
  productTags: ReelProductTag[];
};

type ReelViewBody = {
  watchedSeconds?: number;
  completed?: boolean;
};

type ReelLikeResponse = {
  likedByMe: boolean;
  likeCount: number;
};

type ReelSaveResponse = {
  savedByMe: boolean;
  saveCount: number;
};

type ReelProductClickBody = {
  productId: number;
  variantId?: number | null;
  reelProductTagId?: number | null;
  source?: string;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

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
  cancelOwnOrder: (token: string, id: string | number) => {
    return request<any>(`/orders/${id}/cancel`, {
      method: "PATCH",
      token,
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

  getReels: (token?: string | null) => {
    return request<Reel[]>("/reels", {
      method: "GET",
      token,
    });
  },

  getReelById: (id: string | number, token?: string | null) => {
    return request<Reel>(`/reels/${id}`, {
      method: "GET",
      token,
    });
  },

  trackReelView: (
    id: string | number,
    body: ReelViewBody = {},
    token?: string | null,
  ) => {
    return request<{ viewCount: number }>(`/reels/${id}/view`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  trackReelShare: (id: string | number, token?: string | null) => {
    return request<{ shareCount: number }>(`/reels/${id}/share`, {
      method: "POST",
      token,
      body: JSON.stringify({ channel: "native-share" }),
    });
  },

  trackReelProductClick: (
    id: string | number,
    body: ReelProductClickBody,
    token?: string | null,
  ) => {
    return request<{ productClickCount: number }>(`/reels/${id}/product-click`, {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
  },

  likeReel: (id: string | number, token: string) => {
    return request<ReelLikeResponse>(`/reels/${id}/like`, {
      method: "POST",
      token,
    });
  },

  unlikeReel: (id: string | number, token: string) => {
    return request<ReelLikeResponse>(`/reels/${id}/like`, {
      method: "DELETE",
      token,
    });
  },

  saveReel: (id: string | number, token: string) => {
    return request<ReelSaveResponse>(`/reels/${id}/save`, {
      method: "POST",
      token,
    });
  },

  unsaveReel: (id: string | number, token: string) => {
    return request<ReelSaveResponse>(`/reels/${id}/save`, {
      method: "DELETE",
      token,
    });
  },
};
