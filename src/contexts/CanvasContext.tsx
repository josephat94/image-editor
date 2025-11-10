import React, { createContext, useContext, ReactNode } from "react";
import { useCanvas } from "@/hooks/useCanvas";

interface CanvasContextType {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isReady: boolean;
  addImage: (imageUrl: string) => void;
  addArrow: () => void;
  addText: (text: string) => void;
  addRectangle: () => void;
  addCircle: () => void;
  addBlurBox: () => void;
  addNumberedAnnotation: () => void;
  resetAnnotationCounter: () => void;
  annotationCounter: number;
  duplicateSelected: () => void;
  clearCanvas: () => void;
  downloadImage: () => void;
  copyToClipboard: () => Promise<boolean>;
  undo: () => void;
  redo: () => void;
  toggleTextMode: () => void;
  isTextMode: boolean;
  currentFont: string;
  setCurrentFont: (font: string) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  removeImageBackground: () => Promise<{ success: boolean; error?: string }>;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackwards: () => void;
  getLayersList: () => any[];
  selectLayer: (index: number) => void;
  deleteLayer: (index: number) => void;
  reorderLayers: (oldIndex: number, newIndex: number) => void;
  layersVersion: number;
  getHistoryList: () => any[];
  goToHistoryState: (index: number) => void;
  clearHistory: () => void;
  historyVersion: number;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const canvasMethods = useCanvas();

  return (
    <CanvasContext.Provider value={canvasMethods}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvasContext must be used within CanvasProvider");
  }
  return context;
};
