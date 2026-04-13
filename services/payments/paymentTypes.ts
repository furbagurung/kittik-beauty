import type { PaymentMethod } from "@/types/order";

export type InitiatePaymentInput = {
  orderId: string;
  amount: number;
  customerName: string;
  phone: string;
  email?: string;
  token?: string | null;
  method: PaymentMethod;
};

export type InitiatePaymentResult = {
  success: boolean;
  method: PaymentMethod;
  redirectUrl?: string;
  paymentId?: string;
  providerReference?: string;
  message?: string;
};

export type VerifyPaymentInput = {
  method: PaymentMethod;
  orderId: string;
  token?: string | null;
  paymentId?: string;
  providerReference?: string;
  data?: string;
};

export type VerifyPaymentResult = {
  success: boolean;
  status: "paid" | "pending" | "failed";
  message?: string;
};
