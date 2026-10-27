import { create } from 'zustand';

export type NavViewId =
  | 'home'
  | 'movies'
  | 'series'
  | 'anime'
  | 'asian-drama'
  | 'tv'
  | 'sports'
  | 'radio'
  | 'discover'
  | 'library'
  | 'calendar'
  | 'addons'
  | 'collection'
  | 'history'
  | 'manga'
  | '4k';

export interface UIState {
  // Sidebar State
  isSidebarOpen: boolean;
  activeNavView: NavViewId;
  activeCategory: string;

  // Search Panel State
  searchQuery: string;
  isSearchOpen: boolean;

  // Modals & Panels
  isWatchPartyOpen: boolean;
  isSettingsOpen: boolean;
  isPictureSoundPanelOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveNavView: (view: NavViewId) => void;
  setActiveCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setWatchPartyOpen: (isOpen: boolean) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setPictureSoundPanelOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  activeNavView: 'home',
  activeCategory: 'all',
  searchQuery: '',
  isSearchOpen: false,
  isWatchPartyOpen: false,
  isSettingsOpen: false,
  isPictureSoundPanelOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setActiveNavView: (activeNavView) => set({ activeNavView }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setWatchPartyOpen: (isWatchPartyOpen) => set({ isWatchPartyOpen }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setPictureSoundPanelOpen: (isPictureSoundPanelOpen) =>
    set({ isPictureSoundPanelOpen }),
}));
