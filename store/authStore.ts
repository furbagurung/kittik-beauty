import { api } from "@/services/api";
import type { AuthUser } from "@/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type { AuthUser };

type AuthStore = {
  hydrated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      hydrated: false,
      user: null,
      token: null,

      login: async (email, password) => {
        const data = await api.login({ email, password });

        set({
          user: data.user,
          token: data.token,
        });
      },

      signup: async (name, email, password) => {
        const data = await api.signup({ name, email, password });

        set({
          user: data.user,
          token: data.token,
        });
      },

      logout: () =>
        set({
          user: null,
          token: null,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "kittik-beauty-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
