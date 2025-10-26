import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { getJsCookies, setJsCookies, removeJsCookies } from '@/config/jsCookie';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  companyRole?: string;
  user?: {
    role?: {
      parent?: {
        slug?: string;
      };
      permissions?: any[];
    };
  };
}

interface CompanyDetails {
  id?: string;
  name?: string;
  type?: string;
  isVerified?: boolean;
  kybStatus?: string;
  status?: string;
  primaryUser?: any;
}

interface Settings {
  [key: string]: any;
}

interface UserState {
  profile: UserProfile | null;
  companyDetails: CompanyDetails | null;
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
  
  setProfile: (profile: UserProfile | null) => void;
  setCompanyDetails: (details: CompanyDetails | null) => void;
  setSettings: (settings: Settings | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
  
  getUserType: () => string | undefined;
  getFullName: () => string;
  getAvatarAlt: () => string;
  isApiConsumer: () => boolean;
  isApiProvider: () => boolean;
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

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      companyDetails: null,
      settings: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile, error: null }),
      setCompanyDetails: (details) => set({ companyDetails: details, error: null }),
      setSettings: (settings) => set({ settings, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ 
        profile: null, 
        companyDetails: null, 
        settings: null,
        error: null,
        isLoading: false 
      }),

      getUserType: () => {
        const state = get();
        return state.profile?.user?.role?.parent?.slug;
      },

      getFullName: () => {
        const state = get();
        const firstName = state.profile?.firstName;
        const lastName = state.profile?.lastName;
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        }
        return state.companyDetails?.name || '';
      },

      getAvatarAlt: () => {
        const state = get();
        const firstName = state.profile?.firstName;
        const lastName = state.profile?.lastName;
        
        if (firstName || lastName) {
          return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`;
        }
        
        return state.companyDetails?.name ? state.companyDetails.name[0] : '';
      },

      isApiConsumer: () => {
        const state = get();
        return state.profile?.user?.role?.parent?.slug === 'api-consumer';
      },

      isApiProvider: () => {
        const state = get();
        return state.profile?.user?.role?.parent?.slug === 'api-provider';
      },
    }),
    {
      name: 'aperta-user-store',
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        profile: state.profile,
        companyDetails: state.companyDetails,
        settings: state.settings,
      }),
    }
  )
);
