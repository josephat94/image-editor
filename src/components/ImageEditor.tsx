import React, { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { EditorHeader } from "@/components/EditorHeader";
import { EditorSidebar } from "@/components/EditorSidebar";
import { EditorToolbar } from "@/components/EditorToolbar";
import { EditorCanvas } from "@/components/EditorCanvas";
import { TextInputPanel } from "@/components/TextInputPanel";
import { HistoryPanelFloating } from "@/components/HistoryPanelFloating";
import { CanvasProvider, useCanvasContext } from "@/contexts/CanvasContext";
import { useTour } from "@/hooks/useTour";
import { usePasteImage } from "@/hooks/usePasteImage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUIStore } from "@/stores/uiStore";
import { TOUR_STEPS } from "@/constants/tourSteps";
import { cn } from "@/lib/utils";
import type { DriveStep } from "driver.js";

const ImageEditorContent: React.FC = () => {
  const { isReady, addImage, removeImageBackground } = useCanvasContext();
  const { open } = useSidebar();
  const {
    isHistoryPanelOpen,
    setHistoryPanelOpen,
    isRemovingBg,
    setIsRemovingBg,
    bgRemovalError,
    setBgRemovalError,
  } = useUIStore();

  // Callback para manejar el tour cuando se destaca un elemento
  const handleTourStepHighlight = (
    element: HTMLElement | null,
    step: DriveStep,
    _index: number
  ) => {
    if (step.element === "#history-panel" || element?.id === "history-panel") {
      setHistoryPanelOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const historyPanel = document.querySelector("#history-panel");
            if (historyPanel) {
              historyPanel.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 350);
        });
      });
    }
  };

  const { startTour, hasCompletedTour } = useTour(handleTourStepHighlight);

  // Manejar pegar imagen con Cmd+V
  usePasteImage();

  // Manejar atajos de teclado
  useKeyboardShortcuts();

  // Manejar subir archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = async () => {
    setIsRemovingBg(true);
    setBgRemovalError(null);

    const result = await removeImageBackground();

    setIsRemovingBg(false);

    if (!result.success) {
      setBgRemovalError(result.error || "Error desconocido");
      setTimeout(() => {
        setBgRemovalError(null);
      }, 5000);
    }
  };

  // Manejar evento personalizado para remover fondo (tecla F)
  useEffect(() => {
    const handleRemoveBgEvent = () => {
      handleRemoveBackground();
    };

    window.addEventListener("removeBackground", handleRemoveBgEvent);
    return () => {
      window.removeEventListener("removeBackground", handleRemoveBgEvent);
    };
  }, [isRemovingBg]);

  // Iniciar el tour automáticamente si es la primera vez
  useEffect(() => {
    if (isReady && !hasCompletedTour()) {
      setTimeout(() => {
        startTour(TOUR_STEPS);
      }, 500);
    }
  }, [isReady, hasCompletedTour, startTour]);

  // Función para reiniciar el tour manualmente
  const handleRestartTour = () => {
    startTour(TOUR_STEPS);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        {/* Sidebar con configuraciones */}
        <EditorSidebar />

        {/* Área principal con canvas */}
        <SidebarInset className="flex-1">
          <div
            className={cn(
              "flex flex-col h-screen relative",
              open ? "w-calc(100%-250px)" : "w-full"
            )}
          >
            {/* Header */}
            <EditorHeader onRestartTour={handleRestartTour} />

            {/* Contenido principal */}
            <div
              className={cn(
                "flex-1 p-6 bg-gray-900 overflow-y-auto overflow-x-hidden transition-all duration-300",
                isHistoryPanelOpen ? "pr-[22rem]" : "pr-6"
              )}
            >
              <div className="w-full max-w-full mx-auto">
                <div className="mb-6">
                  {/* Mensaje de error para remover fondo */}
                  {bgRemovalError && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-center text-sm mb-4">
                      ⚠️ {bgRemovalError}
                    </div>
                  )}

                  {/* Mensaje de procesamiento */}
                  {isRemovingBg && (
                    <div className="bg-blue-500/20 border border-blue-500 text-blue-200 px-4 py-2 rounded-lg text-center text-sm mb-4">
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Removiendo fondo con IA... Esto puede tardar unos segundos
                    </div>
                  )}

                  {/* Toolbar */}
                  <EditorToolbar
                    onFileUpload={handleFileUpload}
                    onRemoveBackground={handleRemoveBackground}
                  />
                </div>

                {/* Panel de texto */}
                <TextInputPanel />

                {/* Canvas */}
                <EditorCanvas />
              </div>
            </div>
          </div>

          {/* Panel de historial flotante */}
          <HistoryPanelFloating />
        </SidebarInset>
      </div>
    </TooltipProvider>
  );
};

const ImageEditor: React.FC = () => {
  return (
    <CanvasProvider>
      <ImageEditorContent />
    </CanvasProvider>
  );
};

export default ImageEditor;
