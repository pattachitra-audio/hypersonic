import { create } from "zustand";

export type HeaderStoreStateType = {
    text: string;
    setText: (text: string) => void;
    resetText: () => void;
};

export const useHeaderStore = create<HeaderStoreStateType>((set) => ({
    text: "",
    setText: (text: string) => set(() => ({ text })),
    resetText: () => set(() => ({ text: "" })),
}));
