import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

type CartStore = {
  items: CartItem[];
  hydrated: boolean;
  addToCart: (item: CartItem) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  setHydrated: (value: boolean) => void;
  syncItemStock: (id: string, stock: number) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      setHydrated: (value) => set({ hydrated: value }),

      addToCart: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);

          if (existing) {
            const newQty = existing.quantity + item.quantity;

            if (newQty > item.stock) {
              return {
                items: state.items.map((i) =>
                  i.id === item.id ? { ...i, quantity: item.stock } : i,
                ),
              };
            }

            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQty } : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: Math.min(item.quantity, item.stock),
              },
            ],
          };
        }),

      increaseQty: (id) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            if (i.quantity >= i.stock) return i;
            return { ...i, quantity: i.quantity + 1 };
          }),
        })),

      decreaseQty: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i,
          ),
        })),

      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) }
              : i,
          ),
        })),
      syncItemStock: (id, stock) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;

            return {
              ...i,
              stock,
              quantity:
                stock <= 0
                  ? i.quantity
                  : Math.max(1, Math.min(i.quantity, stock)),
            };
          }),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "kittik-beauty-cart",
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
