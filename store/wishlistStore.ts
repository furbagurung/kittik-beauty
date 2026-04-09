import { create } from "zustand";

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
};

type WishlistStore = {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  removeFromWishlist: (id: string) => void;
};

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],

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
}));
