import { create } from "zustand";

interface UIState {
  // Panels
  isHistoryPanelOpen: boolean;
  setHistoryPanelOpen: (open: boolean) => void;

  // Text input
  showTextInput: boolean;
  setShowTextInput: (show: boolean) => void;
  textInput: string;
  setTextInput: (text: string) => void;

  // Copy state
  copied: boolean;
  setCopied: (copied: boolean) => void;

  // Background removal
  isRemovingBg: boolean;
  setIsRemovingBg: (removing: boolean) => void;
  bgRemovalError: string | null;
  setBgRemovalError: (error: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Panels
  isHistoryPanelOpen: false,
  setHistoryPanelOpen: (open) => set({ isHistoryPanelOpen: open }),

  // Text input
  showTextInput: false,
  setShowTextInput: (show) => set({ showTextInput: show }),
  textInput: "",
  setTextInput: (text) => set({ textInput: text }),

  // Copy state
  copied: false,
  setCopied: (copied) => set({ copied }),

  // Background removal
  isRemovingBg: false,
  setIsRemovingBg: (removing) => set({ isRemovingBg: removing }),
  bgRemovalError: null,
  setBgRemovalError: (error) => set({ bgRemovalError: error }),
}));
