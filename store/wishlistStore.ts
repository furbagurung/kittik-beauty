import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProductCategoryValue } from "@/utils/productCategory";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: ProductCategoryValue;
  rating: number;
};

type WishlistStore = {
  items: WishlistItem[];
  hydrated: boolean;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  setHydrated: (value: boolean) => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      toggleWishlist: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.id === item.id);

          if (exists) {
            return {
              items: state.items.filter((i) => i.id !== item.id),
            };
          }

          return {
            items: [...state.items, item],
          };
        }),

      isInWishlist: (id) => get().items.some((item) => item.id === id),

      removeFromWishlist: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "kittik-beauty-wishlist",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
