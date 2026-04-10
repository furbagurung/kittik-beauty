import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CheckoutDetails = {
  fullName: string;
  phone: string;
  address: string;
};

type CheckoutStore = {
  hydrated: boolean;
  details: CheckoutDetails;
  saveDetails: (details: CheckoutDetails) => void;
  clearDetails: () => void;
  setHydrated: (value: boolean) => void;
};

const initialDetails: CheckoutDetails = {
  fullName: "",
  phone: "",
  address: "",
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      hydrated: false,
      details: initialDetails,

      saveDetails: (details) => set({ details }),
      clearDetails: () => set({ details: initialDetails }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "kittik-beauty-checkout-details",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        details: state.details,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
