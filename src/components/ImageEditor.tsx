import React, { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Loader2, CheckCircle2, CloudUpload } from "lucide-react";
import { EditorHeader } from "@/components/EditorHeader";
import { EditorSidebar } from "@/components/EditorSidebar";
import { EditorCanvas } from "@/components/EditorCanvas";
import { TextInputPanel } from "@/components/TextInputPanel";
import { HistoryPanelFloating } from "@/components/HistoryPanelFloating";
import { CanvasProvider, useCanvasContext } from "@/contexts/CanvasContext";
import { useTour } from "@/hooks/useTour";
import { usePasteImage } from "@/hooks/usePasteImage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import { useUIStore } from "@/stores/uiStore";
import { TOUR_STEPS } from "@/constants/tourSteps";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsLaptop } from "@/hooks/use-is-laptop";
import { cn } from "@/lib/utils";
import { WhatsNewModal } from "@/components/WhatsNewModal";

const ImageEditorContent: React.FC = () => {
  const { isReady, addImage, removeImageBackground } = useCanvasContext();
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  const isLaptop = useIsLaptop();
  const {
    isHistoryPanelOpen,
    isRemovingBg,
    setIsRemovingBg,
    bgRemovalError,
    setBgRemovalError,
    lastSaved,
    isAutoSaving,
  } = useUIStore();

  const [timeAgo, setTimeAgo] = useState<string>("");

  // Actualizar el tiempo transcurrido cada minuto
  useEffect(() => {
    if (!lastSaved) return;

    const updateTime = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

      if (diff < 60) {
        setTimeAgo("hace unos segundos");
      } else {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`hace ${minutes} min`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  const { startTour, hasCompletedTour } = useTour();
  const { showModal, handleClose } = useWhatsNew();

  // Manejar pegar imagen con Cmd+V
  usePasteImage();

  // Manejar atajos de teclado
  useKeyboardShortcuts();

  // Manejar subir archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen válido");
        e.target.value = ""; // Resetear el input
        return;
      }

      // Validar que el canvas esté listo
      if (!isReady) {
        alert("El editor aún no está listo. Por favor, espera un momento.");
        e.target.value = ""; // Resetear el input
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (imageUrl) {
          addImage(imageUrl);
        }
      };
      reader.onerror = () => {
        alert("Error al leer el archivo. Por favor, intenta de nuevo.");
        e.target.value = ""; // Resetear el input
      };
      reader.readAsDataURL(file);

      // Resetear el input para permitir seleccionar el mismo archivo nuevamente
      e.target.value = "";
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
      // Esperar más tiempo para asegurar que todos los elementos estén en el DOM
      const timer = setTimeout(() => {
        // Verificar que al menos el primer elemento existe antes de iniciar
        const firstElement = document.querySelector("#editor-header");
        if (firstElement) {
          startTour(TOUR_STEPS);
        } else {
          console.warn("Tour elements not ready, retrying...");
          // Reintentar después de un segundo más
          setTimeout(() => {
            startTour(TOUR_STEPS);
          }, 1000);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isReady, hasCompletedTour, startTour]);

  // El hook useWhatsNew ya maneja la lógica de mostrar el modal solo una vez
  // Se mostrará automáticamente después de 1 segundo si no se ha visto antes

  // Función para reiniciar el tour manualmente
  const handleRestartTour = () => {
    startTour(TOUR_STEPS);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex w-full bg-gray-900">
        {/* Sidebar con configuraciones */}
        <div className="relative z-0">
          <EditorSidebar />
        </div>

        {/* Área principal con canvas */}
        <SidebarInset className="flex-1 z-[1]">
          <div
            className={cn(
              "flex flex-col h-screen relative",
              open ? "w-calc(100%-250px)" : "w-full"
            )}
          >
            {/* Header */}
            <EditorHeader
              onRestartTour={handleRestartTour}
              onFileUpload={handleFileUpload}
              onRemoveBackground={handleRemoveBackground}
            />

            {/* Indicador de Auto-guardado flotante */}
            {!isMobile && (isAutoSaving || lastSaved) && (
              <div
                className={cn(
                  "absolute z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-300 bg-gray-800/90 backdrop-blur-sm border border-gray-700 shadow-lg select-none transition-all duration-300",
                  // Posición: debajo del header, pegado a la derecha
                  isHistoryPanelOpen ? "right-[22rem]" : "right-6",
                  isLaptop ? "top-[60px]" : "top-16"
                )}
              >
                {isAutoSaving ? (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 animate-pulse" />
                    <span>Guardando...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span>Guardado {timeAgo}</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Contenido principal */}
            <div
              className={cn(
                "flex-1 bg-gray-900 overflow-y-auto overflow-x-hidden transition-all duration-300",
                // Padding responsive: mobile p-3, laptop p-5, desktop p-6
                isMobile ? "p-3" : isLaptop ? "p-5" : "p-6",
                !isMobile && isHistoryPanelOpen
                  ? "pr-[22rem]"
                  : isMobile
                  ? "pr-3"
                  : isLaptop
                  ? "pr-5"
                  : "pr-6",
                "pb-24 md:pb-6" // Espacio para toolbar mobile
              )}
            >
              <div className="w-full max-w-full mx-auto">
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

      {/* Modal de Novedades */}
      <WhatsNewModal open={showModal} onOpenChange={handleClose} />
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
