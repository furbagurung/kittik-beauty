import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SavedAddress = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  label: string;
};

type AddressStore = {
  hydrated: boolean;
  addresses: SavedAddress[];
  addAddress: (address: SavedAddress) => void;
  removeAddress: (id: string) => void;
  setHydrated: (value: boolean) => void;
};

export const useAddressStore = create<AddressStore>()(
  persist(
    (set) => ({
      hydrated: false,
      addresses: [],

      addAddress: (address) =>
        set((state) => {
          const exists = state.addresses.some(
            (item) =>
              item.fullName === address.fullName &&
              item.phone === address.phone &&
              item.address === address.address,
          );

          if (exists) return state;

          return {
            addresses: [address, ...state.addresses],
          };
        }),

      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((item) => item.id !== id),
        })),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "kittik-beauty-addresses",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        addresses: state.addresses,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
