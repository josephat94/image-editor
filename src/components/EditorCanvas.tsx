import React from "react";
import { Upload } from "lucide-react";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { useEditorStore } from "@/stores/editorStore";
import { useIsLaptop } from "@/hooks/use-is-laptop";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const EditorCanvas: React.FC = () => {
  const { canvasRef, isReady, getLayersList } = useCanvasContext();
  const { imagePalette } = useEditorStore();
  const isLaptop = useIsLaptop();
  const isMobile = useIsMobile();

  const layers = getLayersList();
  const isCanvasEmpty = layers.length === 0;

  return (
    <div className="flex justify-center items-center gap-6 w-full">
      {/* Marca de agua - Favicon (oculto en mobile) */}
      {!isMobile && (
        <div className="mb-4 opacity-50 transition-opacity duration-300 absolute bottom-0 left-[16px] z-20">
          <img
            src="/favicon.png"
            alt="Watermark"
            className={isLaptop ? "w-[150px]" : "w-[300px]"}
          />
        </div>
      )}

      {/* Canvas */}
      <div
        className={cn(
          "border-2 border-gray-600 rounded-lg overflow-hidden shadow-xl transition-all duration-300 relative inline-block",
          isMobile
            ? "w-full max-w-full"
            : isLaptop
            ? "max-w-[68%]"
            : "max-w-[80%]"
        )}
        style={{ maxWidth: "100%" }}
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
          }}
        />
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

      {!isReady && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-300">Cargando editor...</p>
        </div>
      )}
    </div>
  );
};
