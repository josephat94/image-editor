import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowRight,
  Type,
  Download,
  Trash2,
  Upload,
  Square,
  Circle,
  Eye,
  Copy,
  Check,
  Undo2,
  Redo2,
  CopyPlus,
  Scissors,
  Loader2,
  Hash,
  ChevronsUp,
  ChevronsDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsLaptop } from "@/hooks/use-is-laptop";
import { ToolbarMobile } from "@/components/ToolbarMobile";
import { cn } from "@/lib/utils";

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

interface EditorToolbarProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackground: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onFileUpload,
  onRemoveBackground,
}) => {
  const isMobile = useIsMobile();
  const {
    undo,
    redo,
    duplicateSelected,
    bringToFront,
    sendToBack,
    addArrow,
    addRectangle,
    addCircle,
    addBlurBox,
    addMagnifier,
    addNumberedAnnotation,
    downloadImage,
    copyToClipboard,
    clearCanvas,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    currentZoom,
  } = useCanvasContext();

  const { copied, setCopied, isRemovingBg } = useUIStore();
  const { toggleTextMode, isTextMode } = useCanvasContext();
  const isLaptop = useIsLaptop();

  // En mobile, mostrar el toolbar mobile
  if (isMobile) {
    return (
      <ToolbarMobile
        onFileUpload={onFileUpload}
        onRemoveBackground={onRemoveBackground}
      />
    );
  }

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "sticky top-0 z-10 bg-gray-700 rounded-lg shadow-inner md:top-4",
        isLaptop ? "p-5" : "p-4"
      )}
    >
      <div
        className={cn(
          "flex flex-wrap justify-center items-center",
          isLaptop ? "gap-3.5" : "gap-3"
        )}
      >
        {/* Sección: Archivo */}
        <div id="file-upload-section" className="flex gap-2 items-center">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
            Archivo
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            className="hidden"
            id="file-upload"
          />
          <TooltipButton content="Subir imagen">
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="cursor-pointer"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </TooltipButton>
        </div>

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-600" />

        {/* Sección: Edición */}
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
            Edición
          </div>
          <TooltipButton content="Deshacer (Ctrl+Z)">
            <Button onClick={undo} variant="outline" size="icon">
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Rehacer (Ctrl+Shift+Z)">
            <Button onClick={redo} variant="outline" size="icon">
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Duplicar elemento (Ctrl+D)">
            <Button onClick={duplicateSelected} variant="outline" size="icon">
              <CopyPlus className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Traer al frente (Ctrl+])">
            <Button onClick={bringToFront} variant="outline" size="icon">
              <ChevronsUp className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Enviar al fondo (Ctrl+[)">
            <Button onClick={sendToBack} variant="outline" size="icon">
              <ChevronsDown className="w-4 h-4" />
            </Button>
          </TooltipButton>
        </div>

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-600" />

        {/* Sección: Herramientas */}
        <div id="tools-section" className="flex gap-2 items-center">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
            Herramientas
          </div>
          <TooltipButton content="Flecha (A)">
            <Button onClick={addArrow} variant="outline" size="icon">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Rectángulo (R)">
            <Button onClick={addRectangle} variant="outline" size="icon">
              <Square className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Círculo (C)">
            <Button onClick={addCircle} variant="outline" size="icon">
              <Circle className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Censurar (B)">
            <Button onClick={addBlurBox} variant="outline" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Lupa (M) - Click y arrastra para crear">
            <Button onClick={addMagnifier} variant="outline" size="icon">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Anotación Numerada (N)">
            <Button
              onClick={addNumberedAnnotation}
              variant="outline"
              size="icon"
            >
              <Hash className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Texto (T) - Click en canvas para agregar">
            <Button
              onClick={toggleTextMode}
              variant={isTextMode ? "default" : "outline"}
              size="icon"
              className={isTextMode ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              <Type className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Remover Fondo IA (F)">
            <Button
              id="remove-bg-button"
              onClick={onRemoveBackground}
              variant="outline"
              size="icon"
              disabled={isRemovingBg}
              className="relative"
            >
              {isRemovingBg ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Scissors className="w-4 h-4" />
              )}
            </Button>
          </TooltipButton>
        </div>

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-600" />

        {/* Sección: Zoom */}
        <div className="flex gap-2 items-center">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
            Zoom
          </div>
          <TooltipButton content="Alejar (Rueda del mouse)">
            <Button onClick={zoomOut} variant="outline" size="icon">
              <ZoomOut className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton
            content={`Zoom actual: ${Math.round(currentZoom * 100)}%`}
          >
            <Button
              onClick={resetZoom}
              variant="outline"
              size="sm"
              className="min-w-[70px]"
            >
              {Math.round(currentZoom * 100)}%
            </Button>
          </TooltipButton>

          <TooltipButton content="Acercar (Rueda del mouse)">
            <Button onClick={zoomIn} variant="outline" size="icon">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton content="Ajustar a pantalla">
            <Button onClick={fitToScreen} variant="outline" size="icon">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </TooltipButton>
        </div>

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-600" />

        {/* Sección: Acciones */}
        <div id="actions-section" className="flex gap-2 items-center">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
            Acciones
          </div>
          <TooltipButton content="Limpiar canvas">
            <Button onClick={clearCanvas} variant="outline" size="icon">
              <Trash2 className="w-4 h-4" />
            </Button>
          </TooltipButton>

          <TooltipButton
            content={copied ? "¡Copiado!" : "Copiar al portapapeles"}
          >
            <Button
              onClick={handleCopyToClipboard}
              variant={copied ? "secondary" : "default"}
              disabled={copied}
              size="icon"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </TooltipButton>

          <TooltipButton content="Descargar imagen">
            <Button onClick={downloadImage} variant="default" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </TooltipButton>
        </div>
      </div>
    </div>
  );
};
