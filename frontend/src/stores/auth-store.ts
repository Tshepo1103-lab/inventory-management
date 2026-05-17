"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse, UserRole } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: Omit<LoginResponse, "token" | "expiresAt"> | null;
  setAuth: (data: LoginResponse) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (data) => {
        localStorage.setItem("imbizo_token", data.token);
        set({
          token: data.token,
          user: {
            userId: data.userId,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
          },
        });
      },
      logout: () => {
        localStorage.removeItem("imbizo_token");
        set({ token: null, user: null });
      },
      hasRole: (...roles) => {
        const role = get().user?.role;
        return role ? roles.includes(role) : false;
      },
    }),
    { name: "imbizo-auth" }
  )
);
