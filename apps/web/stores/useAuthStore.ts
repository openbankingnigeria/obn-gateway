import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { getJsCookies, setJsCookies, removeJsCookies } from '@/config/jsCookie';

interface TokenPayload {
  accessToken?: string | null;
  refreshToken?: string | null;
  persistCookies?: boolean;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  lastSyncedAt: number | null;
  setTokens: (payload: TokenPayload) => void;
  clearTokens: (persistCookies?: boolean) => void;
  hydrateFromCookies: () => void;
}

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return getJsCookies(name) || null;
  },
  setItem: (name: string, value: string): void => {
    setJsCookies(name, value);
  },
  removeItem: (name: string): void => {
    removeJsCookies(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      lastSyncedAt: null,
      setTokens: ({ accessToken, refreshToken, persistCookies = true }) => {
        const nextAccess = accessToken ?? null;
        const nextRefresh = refreshToken ?? null;

        set({
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          isAuthenticated: Boolean(nextAccess),
          lastSyncedAt: Date.now(),
        });

        if (persistCookies) {
          if (nextAccess) {
            setJsCookies('aperta-user-accessToken', nextAccess);
          } else {
            removeJsCookies('aperta-user-accessToken');
          }

          if (nextRefresh) {
            setJsCookies('aperta-user-refreshToken', nextRefresh);
          } else {
            removeJsCookies('aperta-user-refreshToken');
          }
        }
      },
      clearTokens: (persistCookies = true) => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          lastSyncedAt: Date.now(),
        });

        if (persistCookies) {
          removeJsCookies('aperta-user-accessToken');
          removeJsCookies('aperta-user-refreshToken');
        }
      },
      hydrateFromCookies: () => {
        const accessToken = getJsCookies('aperta-user-accessToken') || null;
        const refreshToken = getJsCookies('aperta-user-refreshToken') || null;

        set({
          accessToken,
          refreshToken,
          isAuthenticated: Boolean(accessToken),
          lastSyncedAt: Date.now(),
        });
      },
    }),
    {
      name: 'aperta-auth-store',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
