import React, { useEffect, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { useEditorStore } from "@/stores/editorStore";
import { useIsLaptop } from "@/hooks/use-is-laptop";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { CanvasResizeHandles } from "@/components/CanvasResizeHandles";

export const EditorCanvas: React.FC = () => {
  const {
    canvasRef,
    isReady,
    getLayersList,
    fabricCanvas,
    resizeCanvas,
    isManualResizing,
  } = useCanvasContext();
  const { imagePalette } = useEditorStore();
  const isLaptop = useIsLaptop();
  const isMobile = useIsMobile();
  const { open: sidebarOpen } = useSidebar();
  const { isHistoryPanelOpen } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<number | null>(null);

  const layers = getLayersList();
  const isCanvasEmpty = layers.length === 0;

  // Función para calcular el tamaño máximo disponible del canvas
  const calculateMaxCanvasSize = useCallback(() => {
    if (!fabricCanvas || !containerRef.current) return null;

    // Obtener dimensiones de la ventana
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calcular espacio ocupado por el sidebar (250px cuando está abierto, 0 cuando está cerrado)
    const sidebarWidth = sidebarOpen && !isMobile ? 250 : 0;

    // Calcular espacio ocupado por el historial panel (22rem = 352px cuando está abierto, 0 cuando está cerrado)
    const historyPanelWidth = isHistoryPanelOpen && !isMobile ? 352 : 0;

    // Calcular padding del contenedor principal
    // Mobile: p-3 = 12px, Laptop: p-5 = 20px, Desktop: p-6 = 24px
    const containerPadding = isMobile ? 24 : isLaptop ? 40 : 48; // 12px * 2, 20px * 2, 24px * 2

    // Obtener altura real del header si existe
    const headerElement = document.querySelector("header");
    const headerHeight = headerElement
      ? headerElement.getBoundingClientRect().height
      : 64;

    // Obtener altura real del toolbar si existe
    const toolbarElement = document.querySelector('[class*="EditorToolbar"]');
    const toolbarHeight = toolbarElement
      ? toolbarElement.getBoundingClientRect().height
      : isMobile
      ? 100
      : 80;

    // Padding del contenedor del canvas (p-3 = 12px * 2 = 24px)
    const canvasContainerPadding = 24;

    // Espacio para el indicador de tamaño debajo del canvas (aproximadamente 40px)
    const sizeIndicatorHeight = 40;

    // Calcular ancho disponible
    const availableWidth =
      windowWidth -
      sidebarWidth -
      historyPanelWidth -
      containerPadding -
      canvasContainerPadding;

    // Calcular alto disponible
    const availableHeight =
      windowHeight -
      headerHeight -
      toolbarHeight -
      containerPadding -
      canvasContainerPadding -
      sizeIndicatorHeight;

    // Asegurar tamaños mínimos
    const minWidth = 200;
    const minHeight = 200;

    return {
      width: Math.max(minWidth, availableWidth),
      height: Math.max(minHeight, availableHeight),
    };
  }, [fabricCanvas, sidebarOpen, isHistoryPanelOpen, isMobile, isLaptop]);

  // Función para redimensionar el canvas
  const handleCanvasResize = useCallback(() => {
    if (!fabricCanvas || !isReady || isManualResizing) return; // No redimensionar si se está haciendo manualmente

    const maxSize = calculateMaxCanvasSize();
    if (maxSize) {
      resizeCanvas(maxSize.width, maxSize.height, true);
    }
  }, [
    fabricCanvas,
    isReady,
    isManualResizing,
    calculateMaxCanvasSize,
    resizeCanvas,
  ]);

  // Efecto para redimensionar el canvas cuando cambia el tamaño de la ventana
  useEffect(() => {
    if (!fabricCanvas || !isReady) return;

    const handleWindowResize = () => {
      // Cancelar cualquier resize automático pendiente si se está haciendo resize manual
      if (isManualResizing) {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
          resizeTimeoutRef.current = null;
        }
        return;
      }

      // Debounce para evitar demasiadas llamadas durante el resize
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      resizeTimeoutRef.current = window.setTimeout(() => {
        // Verificar nuevamente antes de ejecutar
        if (!isManualResizing) {
          handleCanvasResize();
        }
      }, 150);
    };

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [fabricCanvas, isReady, isManualResizing, handleCanvasResize]);

  // Efecto separado para redimensionar cuando cambian las dependencias (sidebar, history panel, etc.)
  // pero solo si no se está haciendo resize manual
  useEffect(() => {
    if (!fabricCanvas || !isReady || isManualResizing) return;

    // Cancelar cualquier resize automático pendiente
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = window.setTimeout(() => {
      // Verificar nuevamente antes de ejecutar
      if (!isManualResizing) {
        handleCanvasResize();
      }
    }, 150);

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [sidebarOpen, isHistoryPanelOpen, isMobile, isLaptop, fabricCanvas, isReady, isManualResizing, handleCanvasResize]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex justify-center items-center w-full",
        isMobile ? "gap-4" : isLaptop ? "gap-5" : "gap-6"
      )}
    >
      {/* Marca de agua - Favicon (oculto en mobile) */}
      {!isMobile && (
        <div className="mb-4 opacity-50 transition-opacity duration-300 absolute bottom-0 right-[16px] z-20">
          <img
            src="/favicon.png"
            alt="Watermark"
            className={isLaptop ? "w-[100px]" : "w-[130px]"}
          />
        </div>
      )}

      {/* Canvas */}
      <div
        className={cn(
          "border-2 border-gray-600 rounded-lg overflow-visible shadow-xl transition-all duration-300 relative inline-block",
          // Padding para que los handles de resize sean visibles (12px = p-3)
          "p-3",
          isMobile
            ? "w-full max-w-full"
            : isLaptop
            ? "max-w-[75%]"
            : "max-w-[80%]"
        )}
        style={{ maxWidth: "100%" }}
      >
        {/* Contenedor interno con overflow-hidden para el canvas */}
        <div className="relative overflow-hidden rounded-md">
          <canvas
            ref={canvasRef}
            className="block"
            style={{
              display: "block",
              maxWidth: "100%",
              height: "auto",
            }}
          />
          {/* Handles de resize del canvas */}
          <CanvasResizeHandles />
          {/* Empty State */}
          {isCanvasEmpty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-center p-8">
                <Upload
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  style={{
                    color: imagePalette?.lightVibrant || "#9ca3af",
                  }}
                />
                <p
                  className="text-lg mb-2 font-medium"
                  style={{
                    color: imagePalette?.lightVibrant || "#9ca3af",
                  }}
                >
                  {isMobile ? (
                    "Toca el botón de subir o pega una imagen"
                  ) : (
                    <>
                      Pega una imagen con{" "}
                      <kbd
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: imagePalette?.lightVibrant
                            ? `${imagePalette.lightVibrant}20`
                            : "#374151",
                          color: imagePalette?.lightVibrant || "#d1d5db",
                          border: imagePalette?.lightVibrant
                            ? `1px solid ${imagePalette.lightVibrant}40`
                            : "none",
                        }}
                      >
                        Cmd+V
                      </kbd>{" "}
                      o sube un archivo
                    </>
                  )}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: imagePalette?.lightVibrant
                      ? `${imagePalette.lightVibrant}CC`
                      : "#6b7280",
                  }}
                >
                  Arrastra una imagen aquí o haz clic en el botón de subir
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isReady && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-300">Cargando editor...</p>
        </div>
      )}
    </div>
  );
};
