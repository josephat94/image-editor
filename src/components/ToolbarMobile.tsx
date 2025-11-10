import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ArrowRight,
  Type,
  Download,
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
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { useUIStore } from "@/stores/uiStore";

interface ToolbarMobileProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackground: () => void;
}

export const ToolbarMobile: React.FC<ToolbarMobileProps> = ({
  onFileUpload,
  onRemoveBackground,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
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
    addNumberedAnnotation,
    downloadImage,
    copyToClipboard,
    clearCanvas,
  } = useCanvasContext();

  const { copied, setCopied, isRemovingBg } = useUIStore();
  const { toggleTextMode, isTextMode } = useCanvasContext();

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Botones principales siempre visibles
  const primaryButtons = [
    {
      icon: Upload,
      action: () => document.getElementById("file-upload-mobile")?.click(),
      label: "Subir",
      active: false,
    },
    { icon: ArrowRight, action: addArrow, label: "Flecha", active: false },
    { icon: Type, action: toggleTextMode, label: "Texto", active: isTextMode },
    {
      icon: Hash,
      action: addNumberedAnnotation,
      label: "Anotación",
      active: false,
    },
  ];

  // Botones secundarios en el menú "Más"
  const secondaryButtons = [
    { icon: Square, action: addRectangle, label: "Rectángulo" },
    { icon: Circle, action: addCircle, label: "Círculo" },
    { icon: Eye, action: addBlurBox, label: "Censurar" },
    { icon: Undo2, action: undo, label: "Deshacer" },
    { icon: Redo2, action: redo, label: "Rehacer" },
    { icon: Download, action: downloadImage, label: "Descargar" },
    {
      icon: Scissors,
      action: onRemoveBackground,
      label: "Remover fondo",
      disabled: isRemovingBg,
    },
    { icon: CopyPlus, action: duplicateSelected, label: "Duplicar" },
    { icon: ChevronsUp, action: bringToFront, label: "Al frente" },
    { icon: ChevronsDown, action: sendToBack, label: "Al fondo" },
    { icon: Trash2, action: clearCanvas, label: "Limpiar" },
  ];

  return (
    <>
      {/* Input oculto para subir archivo */}
      <input
        type="file"
        accept="image/*"
        onChange={onFileUpload}
        className="hidden"
        id="file-upload-mobile"
      />

      {/* Toolbar inferior fijo */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 shadow-2xl md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Botones principales */}
          {primaryButtons.map((btn, index) => (
            <Button
              key={index}
              onClick={btn.action}
              variant={btn.active ? "default" : "ghost"}
              size="icon"
              className={`h-12 w-12 ${
                btn.active
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              <btn.icon className="w-5 h-5" />
            </Button>
          ))}

          {/* Botón copiar */}
          <Button
            onClick={handleCopyToClipboard}
            variant={copied ? "secondary" : "ghost"}
            size="icon"
            disabled={copied}
            className="h-12 w-12 text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {copied ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </Button>

          {/* Menú "Más" */}
          <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] bg-gray-900">
              <SheetHeader>
                <SheetTitle className="text-white">Más herramientas</SheetTitle>
                <SheetDescription className="text-gray-400">
                  Todas las herramientas de edición disponibles
                </SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {secondaryButtons.map((btn, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      btn.action();
                      setMoreMenuOpen(false);
                    }}
                    variant="outline"
                    disabled={btn.disabled}
                    className="h-16 flex flex-col items-center justify-center gap-2 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {btn.disabled && isRemovingBg ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <btn.icon className="w-5 h-5" />
                    )}
                    <span className="text-xs">{btn.label}</span>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
};
