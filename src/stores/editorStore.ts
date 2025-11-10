import { create } from "zustand";
import type { ImagePalette, ColorOption } from "@/types/editor";
import { BASE_COLORS } from "@/constants/colors";

interface EditorState {
  // Color palette
  imagePalette: ImagePalette | null;
  setImagePalette: (palette: ImagePalette | null) => void;

  // Available colors (base + palette)
  availableColors: ColorOption[];
  updateAvailableColors: () => void;

  // Canvas background
  canvasBackground: string;
  setCanvasBackground: (color: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // Color palette
  imagePalette: null,
  setImagePalette: (palette) => {
    set({ imagePalette: palette });
    // Update available colors when palette changes
    get().updateAvailableColors();
  },

  // Available colors
  availableColors: BASE_COLORS,
  updateAvailableColors: () => {
    const { imagePalette } = get();
    const colors = [...BASE_COLORS];

    if (imagePalette) {
      const paletteColors: ColorOption[] = [
        { color: imagePalette.vibrant, title: "Vibrant" },
        { color: imagePalette.muted, title: "Muted" },
        { color: imagePalette.darkVibrant, title: "Dark Vibrant" },
        { color: imagePalette.darkMuted, title: "Dark Muted" },
        { color: imagePalette.lightVibrant, title: "Light Vibrant" },
        { color: imagePalette.lightMuted, title: "Light Muted" },
      ].filter(
        (c): c is ColorOption =>
          !!c.color && !colors.some((base) => base.color === c.color)
      );

      colors.push(...paletteColors);
    }

    set({ availableColors: colors });
  },

  // Canvas background
  canvasBackground: "#ffffff",
  setCanvasBackground: (color) => set({ canvasBackground: color }),
}));
