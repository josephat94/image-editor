import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { fabric } from "fabric";
import { useCanvas } from "@/hooks/useCanvas";

interface CanvasContextType {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  fabricCanvas: fabric.Canvas | null;
  isReady: boolean;
  addImage: (imageUrl: string) => void;
  addArrow: () => void;
  addText: (text: string) => void;
  addRectangle: () => void;
  addCircle: () => void;
  addBlurBox: () => void;
  addMagnifier: () => void;
  addNumberedAnnotation: () => void;
  resetAnnotationCounter: () => void;
  annotationCounter: number;
  duplicateSelected: () => void;
  clearCanvas: () => void;
  downloadImage: () => void;
  copyToClipboard: () => Promise<boolean | undefined>;
  undo: () => void;
  redo: () => void;
  toggleTextMode: () => void;
  isTextMode: boolean;
  showResizeHandles: boolean;
  setShowResizeHandles: (show: boolean) => void;
  isManualResizing: () => boolean; // Función getter que devuelve el valor actual del ref
  setIsManualResizing: (isResizing: boolean) => void;
  resizeCanvas: (
    width: number,
    height: number,
    saveToHistory?: boolean
  ) => void;
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
  // Funciones de zoom y panning
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  currentZoom: number;
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
