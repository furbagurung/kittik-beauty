import type { PaymentPayload } from "@/utils/payment";
import { create } from "zustand";

type PaymentSessionStore = {
  payload: PaymentPayload | null;
  setPayload: (payload: PaymentPayload) => void;
  clearPayload: () => void;
};

export const usePaymentSessionStore = create<PaymentSessionStore>((set) => ({
  payload: null,
  setPayload: (payload) => set({ payload }),
  clearPayload: () => set({ payload: null }),
}));
