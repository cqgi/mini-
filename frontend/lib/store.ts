import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./api";

interface KnownAccount {
  username: string;
  nickname?: string;
  role?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginMessage: string | null;
  knownAccounts: KnownAccount[];
  login: (user: User, loginMessage?: string) => void;
  rememberAccount: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

function mergeKnownAccount(
  accounts: KnownAccount[],
  user: Pick<User, "username" | "nickname" | "role">
) {
  const next: KnownAccount = {
    username: user.username,
    nickname: user.nickname,
    role: user.role,
  };

  return [
    next,
    ...accounts.filter((account) => account.username !== user.username),
  ].slice(0, 12);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loginMessage: null,
      knownAccounts: [],
      login: (user, loginMessage) =>
        set((state) => ({
          user,
          isAuthenticated: true,
          loginMessage: loginMessage ?? state.loginMessage,
          knownAccounts: mergeKnownAccount(state.knownAccounts, user),
        })),
      rememberAccount: (user) =>
        set((state) => ({
          knownAccounts: mergeKnownAccount(state.knownAccounts, user),
        })),
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false, loginMessage: null });
      },
      updateUser: (updates) =>
        set((state) => {
          if (!state.user) {
            return state;
          }

          const nextUser = {
            ...state.user,
            ...updates,
          };

          return {
            user: nextUser,
            knownAccounts: mergeKnownAccount(state.knownAccounts, nextUser),
          };
        }),
    }),
    {
      name: "miniblog-auth-v2",
    }
  )
);
