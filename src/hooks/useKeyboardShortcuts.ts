import { useEffect } from "react";
import { useCanvasContext } from "@/contexts/CanvasContext";

export const useKeyboardShortcuts = () => {
  const {
    undo,
    redo,
    sendBackwards,
    bringForward,
    sendToBack,
    bringToFront,
    toggleTextMode,
  } = useCanvasContext();

  // Manejar atajo de teclado para texto (T) - activa modo texto inline
  useEffect(() => {
    const handleTextShortcut = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        e.key.toLowerCase() === "t" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        e.preventDefault();
        toggleTextMode();
      }
    };

    document.addEventListener("keydown", handleTextShortcut);
    return () => {
      document.removeEventListener("keydown", handleTextShortcut);
    };
  }, [toggleTextMode]);

  // Manejar atajos Ctrl+Z (Undo) y Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleUndoRedo = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey && e.key.toLowerCase() === "z") {
          e.preventDefault();
          redo();
        } else if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          undo();
        }
      }
    };

    document.addEventListener("keydown", handleUndoRedo);
    return () => {
      document.removeEventListener("keydown", handleUndoRedo);
    };
  }, [undo, redo]);

  // Atajos de teclado para control de capas
  useEffect(() => {
    const handleLayerShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // [ = Bajar una capa
      if (e.key === "[" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        sendBackwards();
      }

      // ] = Subir una capa
      if (e.key === "]" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        bringForward();
      }

      // Ctrl/Cmd + [ = Enviar al fondo
      if (e.key === "[" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        sendToBack();
      }

      // Ctrl/Cmd + ] = Traer al frente
      if (e.key === "]" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        bringToFront();
      }
    };

    document.addEventListener("keydown", handleLayerShortcuts);
    return () => {
      document.removeEventListener("keydown", handleLayerShortcuts);
    };
  }, [bringToFront, sendToBack, bringForward, sendBackwards]);
};
