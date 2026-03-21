import { create } from "zustand";

export type SidebarStoreStateType = {
    sidebarLeftOpen: boolean;
    toggleSidebarLeft: () => void;
    // setSidebarOpen: (open: boolean) => void;
};

export const useSidebarStore = create<SidebarStoreStateType>((set) => ({
    sidebarLeftOpen: true,
    toggleSidebarLeft: () => set((state) => ({ sidebarLeftOpen: !state.sidebarLeftOpen })),
}));
