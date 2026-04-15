const API_BASE_URL = "http://192.168.1.66:5000/api";

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
};
