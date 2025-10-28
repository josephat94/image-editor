import React, { useState, useEffect } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Editor de Imágenes</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
            sidebarOpen ? "w-80" : "w-0"
          } overflow-hidden`}
        >
          <div className="p-6 space-y-6 w-80">
            {/* Sección: Colores */}
            <div>
              <Label className="mb-3 block">Color de Elementos</Label>
              <div className="grid grid-cols-3 gap-3">
                {AVAILABLE_COLORS.map(({ color, title }) => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-full h-12 rounded-lg border-2 transition-all ${
                      currentColor === color
                        ? "border-white ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-105"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: color }}
                    title={title}
                  />
                ))}
              </div>
            </div>

            <Separator />

            {/* Sección: Anotaciones Numeradas */}
            <div>
              <Label className="mb-3 block">Anotaciones Numeradas</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-700 px-4 py-3 rounded-lg border border-gray-600 text-center">
                  <div className="text-sm text-gray-400 mb-1">
                    Próximo número
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {annotationCounter}
                  </div>
                </div>
                <Tooltip content="Reiniciar contador">
                  <Button
                    onClick={resetAnnotationCounter}
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Presiona{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                  N
                </kbd>{" "}
                para agregar
              </p>
            </div>

            <Separator />

            {/* Sección: Fondo del Canvas */}
            <div>
              <Label className="mb-3 block">Fondo del Canvas</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleBackgroundChange("#ffffff")}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    canvasBackground === "#ffffff"
                      ? "border-white ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: "#ffffff" }}
                  title="Fondo Blanco"
                >
                  <span className="text-gray-900 text-sm font-medium">
                    Claro
                  </span>
                </button>
                <button
                  onClick={() => handleBackgroundChange("#000000")}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    canvasBackground === "#000000"
                      ? "border-white ring-2 ring-white ring-offset-2 ring-offset-gray-800"
                      : "border-gray-600 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: "#000000" }}
                  title="Fondo Negro"
                >
                  <span className="text-white text-sm font-medium">Oscuro</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Sección: Fuentes */}
            <div>
              <Label className="mb-3 block">Fuente de Texto</Label>
              <div className="space-y-2">
                <Button
                  onClick={() => setCurrentFont("Montserrat, sans-serif")}
                  variant={
                    currentFont === "Montserrat, sans-serif"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Montserrat
                </Button>
                <Button
                  onClick={() => setCurrentFont("Red Hat Display, sans-serif")}
                  variant={
                    currentFont === "Red Hat Display, sans-serif"
                      ? "default"
                      : "outline"
                  }
                  className="w-full justify-start"
                  style={{ fontFamily: "Red Hat Display, sans-serif" }}
                >
                  Red Hat Display
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center gap-2">
              {/* Botón Toggle Sidebar */}
              <Tooltip
                content={sidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
              >
                <Button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  variant="outline"
                  size="icon"
                >
                  {sidebarOpen ? (
                    <ChevronLeft className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </Tooltip>

              <Separator className="h-8 w-[1px] mx-2" />

              {/* Sección: Archivo */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Archivo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Tooltip content="Subir imagen">
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </label>
              </div>

              <Separator className="h-8 w-[1px] mx-2" />

              {/* Sección: Edición */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Edición
                </span>
                <Tooltip content="Deshacer (Ctrl+Z)">
                  <Button onClick={undo} variant="outline" size="icon">
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Rehacer (Ctrl+Shift+Z)">
                  <Button onClick={redo} variant="outline" size="icon">
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Duplicar elemento (Ctrl+D)">
                  <Button
                    onClick={duplicateSelected}
                    variant="outline"
                    size="icon"
                  >
                    <CopyPlus className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>

              <Separator className="h-8 w-[1px] mx-2" />

              {/* Sección: Herramientas */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Herramientas
                </span>
                <Tooltip content="Flecha (A)">
                  <Button onClick={addArrow} variant="outline" size="icon">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Rectángulo (R)">
                  <Button onClick={addRectangle} variant="outline" size="icon">
                    <Square className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Círculo (C)">
                  <Button onClick={addCircle} variant="outline" size="icon">
                    <Circle className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Censurar (B)">
                  <Button onClick={addBlurBox} variant="outline" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Anotación Numerada (N)">
                  <Button
                    onClick={addNumberedAnnotation}
                    variant="outline"
                    size="icon"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip content="Texto (T)">
                  <Button
                    onClick={() => setShowTextInput(!showTextInput)}
                    variant="outline"
                    size="icon"
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>

              <Separator className="h-8 w-[1px] mx-2" />

              {/* Sección: Acciones */}
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  Acciones
                </span>
                <Tooltip content="Limpiar canvas">
                  <Button onClick={clearCanvas} variant="outline" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Tooltip>

                <Tooltip
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
                </Tooltip>

                <Tooltip content="Descargar imagen">
                  <Button onClick={downloadImage} variant="default" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Input de Texto */}
          {showTextInput && (
            <div className="p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Escribe tu texto aquí..."
                  className="flex-1 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && handleAddText()}
                  style={{ fontFamily: currentFont }}
                  autoFocus
                />
                <Button onClick={handleAddText}>Agregar</Button>
                <Button
                  onClick={() => setShowTextInput(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900 overflow-auto">
            <div className="mb-4 text-center">
              <p className="text-white text-sm mb-1">
                Pega una imagen con{" "}
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                  Cmd+V
                </kbd>{" "}
                o súbela con el botón de arriba
              </p>
              <p className="text-gray-400 text-xs">
                Presiona{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                  Delete
                </kbd>{" "}
                para eliminar elementos seleccionados
              </p>
            </div>

            {!isReady ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-300">Cargando editor...</p>
              </div>
            ) : (
              <div className="border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl bg-white">
                <canvas
                  ref={canvasRef}
                  className="block"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
