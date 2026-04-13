import type { Order, PaymentMethod } from "@/types/order";

export type PaymentDisplayConfig = {
  id: PaymentMethod;
  label: string;
  description: string;
};

export const PAYMENT_METHODS: PaymentDisplayConfig[] = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
  },
  {
    id: "esewa",
    label: "eSewa",
    description: "Fast and secure digital payment",
  },
  {
    id: "khalti",
    label: "Khalti",
    description: "Pay with your Khalti wallet",
  },
];

export function getPaymentLabel(method: PaymentMethod): string {
  switch (method) {
    case "cod":
      return "Cash on Delivery";
    case "esewa":
      return "eSewa";
    case "khalti":
      return "Khalti";
    default:
      return method;
  }
}

export function isOnlinePayment(method: PaymentMethod): boolean {
  return method === "esewa" || method === "khalti";
}

export type PaymentPayload = {
  orderId: string;
  amount: number;
  customerName: string;
  phone: string;
  method: PaymentMethod;
  redirectUrl?: string;
  paymentId?: string;
  providerReference?: string;
};

export function buildPaymentPayload(order: Order): PaymentPayload {
  return {
    orderId: order.id,
    amount: order.total,
    customerName: order.fullName,
    phone: order.phone,
    method: order.paymentMethod,
  };
}
