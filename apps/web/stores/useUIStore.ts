import { create } from 'zustand';

interface UIState {
  isNotificationOpen: boolean;
  isModalOpen: boolean;
  modalType: string;
  isSidebarCollapsed: boolean;
  
  // Actions
  toggleNotification: () => void;
  openModal: (type: string) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  setNotificationOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isNotificationOpen: false,
  isModalOpen: false,
  modalType: '',
  isSidebarCollapsed: false,

  // Actions
  toggleNotification: () => set((state) => ({ 
    isNotificationOpen: !state.isNotificationOpen 
  })),
  
  openModal: (type) => set({ 
    isModalOpen: true, 
    modalType: type 
  }),
  
  closeModal: () => set({ 
    isModalOpen: false, 
    modalType: '' 
  }),
  
  toggleSidebar: () => set((state) => ({ 
    isSidebarCollapsed: !state.isSidebarCollapsed 
  })),
  
  setNotificationOpen: (isOpen) => set({ 
    isNotificationOpen: isOpen 
  }),
}));
