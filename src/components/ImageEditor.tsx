import React, { useState, useEffect } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
  Hash,
  RotateCcw,
  CopyPlus,
} from "lucide-react";

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

// Colores disponibles para los elementos
const AVAILABLE_COLORS = [
  { color: "#3A86FF", title: "Azul" },
  { color: "#FF006E", title: "Fuchsia" },
  { color: "#8338EC", title: "Morado" },
  { color: "#FB5607", title: "Naranja" },
  { color: "#FFBE0B", title: "Amarillo" },
  { color: "#000000", title: "Negro" },
];

const ImageEditor: React.FC = () => {
  const {
    canvasRef,
    isReady,
    addImage,
    addArrow,
    addText,
    addRectangle,
    addCircle,
    addBlurBox,
    addNumberedAnnotation,
    resetAnnotationCounter,
    annotationCounter,
    duplicateSelected,
    clearCanvas,
    downloadImage,
    copyToClipboard,
    undo,
    redo,
    currentFont,
    setCurrentFont,
    currentColor,
    setCurrentColor,
    setBackgroundColor,
  } = useCanvas();
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canvasBackground, setCanvasBackground] = useState<
    "#ffffff" | "#000000"
  >("#ffffff");

  // Manejar pegar imagen con Cmd+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageUrl = event.target?.result as string;
              addImage(imageUrl);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [addImage]);

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

  const handleAddText = () => {
    if (textInput.trim()) {
      addText(textInput);
      setTextInput("");
      setShowTextInput(false);
    }
  };

  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      // Resetear el estado después de 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleBackgroundChange = (color: "#ffffff" | "#000000") => {
    setCanvasBackground(color);
    setBackgroundColor(color);
  };

  // Manejar atajo de teclado para texto (T)
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
        setShowTextInput(true);
      }
    };

    document.addEventListener("keydown", handleTextShortcut);
    return () => {
      document.removeEventListener("keydown", handleTextShortcut);
    };
  }, []);

  // Manejar atajos Ctrl+Z (Undo) y Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleUndoRedo = (e: KeyboardEvent) => {
      // Detectar Ctrl (Windows/Linux) o Cmd (Mac)
      if (e.ctrlKey || e.metaKey) {
        if (e.shiftKey && e.key.toLowerCase() === "z") {
          // Ctrl+Shift+Z o Cmd+Shift+Z = Redo
          e.preventDefault();
          redo();
        } else if (e.key.toLowerCase() === "z") {
          // Ctrl+Z o Cmd+Z = Undo
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

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-gray-900">
          {/* Sidebar con configuraciones */}
          <Sidebar className="border-r border-gray-700 bg-gray-900">
            <SidebarHeader className="border-b border-gray-700 p-4 bg-gray-900">
              <h2 className="text-lg font-semibold text-white">
                Configuración
              </h2>
            </SidebarHeader>
            <SidebarContent className="bg-gray-900">
              {/* Selector de Color Global */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-200 font-semibold">
                  Color de elementos
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-4 py-3">
                  <div className="grid grid-cols-3 gap-3">
                    {AVAILABLE_COLORS.map(({ color, title }) => (
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
                </SidebarGroupContent>
              </SidebarGroup>

              <Separator className="bg-gray-700" />

              {/* Contador de Anotaciones */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-200 font-semibold">
                  Anotaciones numeradas
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-800 px-4 py-3 rounded-lg border border-gray-700 flex-1">
                      <div className="text-xs text-gray-300 mb-1">
                        Próximo número
                      </div>
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

              {/* Selector de Fondo del Canvas */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-200 font-semibold">
                  Fondo del canvas
                </SidebarGroupLabel>
                <SidebarGroupContent className="px-4 py-3">
                  <div className="grid grid-cols-2 gap-3">
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
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          {/* Área principal con canvas */}
          <SidebarInset className="flex-1">
            <div className="flex flex-col h-screen">
              {/* Header con título y trigger */}
              <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-700 px-6 bg-gray-800">
                <SidebarTrigger className="text-white" />
                <Separator orientation="vertical" className="h-6 bg-gray-600" />
                <h1 className="text-xl font-bold text-white">
                  Editor de Imágenes
                </h1>
              </header>

              {/* Contenido principal */}
              <div className="flex-1 p-6 bg-gray-900 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-6">
                    <p className="text-white text-center mb-2">
                      Pega una imagen con{" "}
                      <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">
                        Cmd+V
                      </kbd>{" "}
                      o sube un archivo
                    </p>
                    <p className="text-white text-center text-sm mb-4">
                      Presiona{" "}
                      <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                        Delete
                      </kbd>{" "}
                      o{" "}
                      <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                        ⌫
                      </kbd>{" "}
                      para eliminar elementos seleccionados
                    </p>

                    {/* Toolbar Profesional */}
                    <div className="bg-gray-700 rounded-lg p-4 shadow-inner">
                      <div className="flex flex-wrap gap-3 justify-center items-center">
                        {/* Sección: Archivo */}
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                            Archivo
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label htmlFor="file-upload">
                            <TooltipButton content="Subir imagen">
                              <Button
                                variant="outline"
                                size="icon"
                                className="cursor-pointer"
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            </TooltipButton>
                          </label>
                        </div>

                        {/* Divisor */}
                        <div className="h-8 w-px bg-gray-600" />

                        {/* Sección: Edición */}
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                            Edición
                          </div>
                          <TooltipButton content="Deshacer (Ctrl+Z)">
                            <Button
                              onClick={undo}
                              variant="outline"
                              size="icon"
                            >
                              <Undo2 className="w-4 h-4" />
                            </Button>
                          </TooltipButton>

                          <TooltipButton content="Rehacer (Ctrl+Shift+Z)">
                            <Button
                              onClick={redo}
                              variant="outline"
                              size="icon"
                            >
                              <Redo2 className="w-4 h-4" />
                            </Button>
                          </TooltipButton>

                          <TooltipButton content="Duplicar elemento (Ctrl+D)">
                            <Button
                              onClick={duplicateSelected}
                              variant="outline"
                              size="icon"
                            >
                              <CopyPlus className="w-4 h-4" />
                            </Button>
                          </TooltipButton>
                        </div>

                        {/* Divisor */}
                        <div className="h-8 w-px bg-gray-600" />

                        {/* Sección: Herramientas */}
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                            Herramientas
                          </div>
                          <TooltipButton content="Flecha (A)">
                            <Button
                              onClick={addArrow}
                              variant="outline"
                              size="icon"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </TooltipButton>

                          <TooltipButton content="Rectángulo (R)">
                            <Button
                              onClick={addRectangle}
                              variant="outline"
                              size="icon"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          </TooltipButton>

                          <TooltipButton content="Círculo (C)">
                            <Button
                              onClick={addCircle}
                              variant="outline"
                              size="icon"
                            >
                              <Circle className="w-4 h-4" />
                            </Button>
                          </TooltipButton>

                          <TooltipButton content="Censurar (B)">
                            <Button
                              onClick={addBlurBox}
                              variant="outline"
                              size="icon"
                            >
                              <Eye className="w-4 h-4" />
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

                          <TooltipButton content="Texto (T)">
                            <Button
                              onClick={() => setShowTextInput(!showTextInput)}
                              variant="outline"
                              size="icon"
                            >
                              <Type className="w-4 h-4" />
                            </Button>
                          </TooltipButton>
                        </div>

                        {/* Divisor */}
                        <div className="h-8 w-px bg-gray-600" />

                        {/* Sección: Acciones */}
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                            Acciones
                          </div>
                          <TooltipButton content="Limpiar canvas">
                            <Button
                              onClick={clearCanvas}
                              variant="outline"
                              size="icon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipButton>

                          <TooltipButton
                            content={
                              copied ? "¡Copiado!" : "Copiar al portapapeles"
                            }
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
                            <Button
                              onClick={downloadImage}
                              variant="default"
                              size="icon"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </TooltipButton>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showTextInput && (
                    <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-200 mb-2">
                          Fuente:
                        </label>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              setCurrentFont("Montserrat, sans-serif")
                            }
                            variant={
                              currentFont === "Montserrat, sans-serif"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            Montserrat
                          </Button>
                          <Button
                            onClick={() =>
                              setCurrentFont("Red Hat Display, sans-serif")
                            }
                            variant={
                              currentFont === "Red Hat Display, sans-serif"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            style={{
                              fontFamily: "Red Hat Display, sans-serif",
                            }}
                          >
                            Red Hat Display
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Escribe tu texto aquí..."
                          className="flex-1 px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleAddText()
                          }
                          style={{ fontFamily: currentFont }}
                          autoFocus
                        />
                        <Button onClick={handleAddText} size="sm">
                          Agregar
                        </Button>
                        <Button
                          onClick={() => setShowTextInput(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <div className="border-2 border-gray-600 rounded-lg overflow-hidden shadow-xl">
                      <canvas
                        ref={canvasRef}
                        className="block"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                    </div>
                  </div>

                  {!isReady && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-2 text-gray-300">Cargando editor...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default ImageEditor;
