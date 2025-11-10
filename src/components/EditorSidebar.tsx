import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";
import { LayersPanel } from "@/components/LayersPanel";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { useEditorStore } from "@/stores/editorStore";

// Component Helper for Tooltip
const TooltipButton = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span>{children}</span>
    </TooltipTrigger>
    <TooltipContent>
      <p>{content}</p>
    </TooltipContent>
  </Tooltip>
);

export const EditorSidebar: React.FC = () => {
  const {
    currentColor,
    setCurrentColor,
    annotationCounter,
    resetAnnotationCounter,
    setBackgroundColor,
    getLayersList,
    selectLayer,
    deleteLayer,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackwards,
    reorderLayers,
    layersVersion,
  } = useCanvasContext();

  const {
    availableColors,
    imagePalette,
    canvasBackground,
    setCanvasBackground,
  } = useEditorStore();

  const layers = getLayersList();

  const handleBackgroundChange = (color: string) => {
    setCanvasBackground(color);
    setBackgroundColor(color);
  };

  return (
    <Sidebar className="border-r border-gray-700 bg-gray-900">
      <SidebarHeader className="border-b border-gray-700 p-4 bg-gray-900">
        <h2 className="text-lg font-semibold text-white">Configuración</h2>
      </SidebarHeader>
      <SidebarContent className="bg-gray-900">
        {/* Selector de Color Global */}
        <SidebarGroup id="color-selector">
          <SidebarGroupLabel className="text-gray-200 font-semibold">
            Color de elementos
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4 py-3">
            <div className="grid grid-cols-3 gap-3">
              {availableColors.map(({ color, title }) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    currentColor === color
                      ? "border-white ring-2 ring-white/50 scale-105"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: color }}
                  title={title}
                />
              ))}
            </div>
            {imagePalette && (
              <p className="text-xs text-gray-400 mt-2 italic">
                Colores extraídos de la imagen
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-gray-700" />

        {/* Contador de Anotaciones */}
        <SidebarGroup id="annotation-counter">
          <SidebarGroupLabel className="text-gray-200 font-semibold">
            Anotaciones numeradas
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 px-4 py-3 rounded-lg border border-gray-700 flex-1">
                <div className="text-xs text-gray-300 mb-1">Próximo número</div>
                <div className="text-2xl font-bold text-white">
                  {annotationCounter}
                </div>
              </div>
              <TooltipButton content="Reiniciar contador">
                <Button
                  onClick={resetAnnotationCounter}
                  variant="outline"
                  size="icon"
                  className="h-12 w-12"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </TooltipButton>
            </div>
            <p className="text-xs text-gray-300 mt-2">
              Presiona{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs text-gray-200">
                N
              </kbd>{" "}
              para agregar
            </p>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-gray-700" />

        {/* Panel de Capas */}
        <SidebarGroup
          id="layers-panel"
          className="flex-1 flex flex-col min-h-0"
        >
          <SidebarGroupLabel className="text-gray-200 font-semibold">
            Capas ({layers.length})
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 overflow-hidden px-0">
            <LayersPanel
              layers={layers}
              onSelectLayer={selectLayer}
              onDeleteLayer={deleteLayer}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              onBringForward={bringForward}
              onSendBackwards={sendBackwards}
              onReorderLayers={reorderLayers}
              layersVersion={layersVersion}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-gray-700" />

        {/* Selector de Fondo del Canvas */}
        <SidebarGroup id="background-selector">
          <SidebarGroupLabel className="text-gray-200 font-semibold">
            Fondo del canvas
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-4 py-3">
            <div
              className={`grid gap-3 ${
                imagePalette?.vibrant ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              <button
                onClick={() => handleBackgroundChange("#ffffff")}
                className={`h-12 rounded-lg border-2 transition-all ${
                  canvasBackground === "#ffffff"
                    ? "border-white ring-2 ring-white/50 scale-105"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                style={{ backgroundColor: "#ffffff" }}
                title="Fondo Blanco"
              >
                <span className="text-xs text-gray-800 font-semibold">
                  Blanco
                </span>
              </button>
              <button
                onClick={() => handleBackgroundChange("#000000")}
                className={`h-12 rounded-lg border-2 transition-all ${
                  canvasBackground === "#000000"
                    ? "border-white ring-2 ring-white/50 scale-105"
                    : "border-gray-600 hover:border-gray-500"
                }`}
                style={{ backgroundColor: "#000000" }}
                title="Fondo Negro"
              >
                <span className="text-xs text-gray-200 font-semibold">
                  Negro
                </span>
              </button>
              {imagePalette?.vibrant && (
                <button
                  onClick={() => handleBackgroundChange(imagePalette.vibrant!)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    canvasBackground === imagePalette.vibrant
                      ? "border-white ring-2 ring-white/50 scale-105"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: imagePalette.vibrant }}
                  title="Fondo Vibrant (de la imagen)"
                >
                  <span className="text-xs text-white font-semibold">
                    Vibrant
                  </span>
                </button>
              )}
            </div>
            {imagePalette?.vibrant && (
              <p className="text-xs text-gray-400 mt-2 italic">
                Color vibrant extraído de la imagen
              </p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
