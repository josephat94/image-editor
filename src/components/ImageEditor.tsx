import React, { useState, useEffect } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
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
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-9xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Editor de Imágenes
          </h1>

          {/* Selector de Color Global */}
          <div className="mb-4 flex flex-col items-center">
            <label className="block text-sm font-medium text-white mb-2">
              Color de los elementos dinamicos
            </label>
            <div className="flex gap-3 items-center">
              {/* Colores predefinidos */}
              {AVAILABLE_COLORS.map(({ color, title }) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    currentColor === color
                      ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                      : "border-gray-500"
                  }`}
                  style={{ backgroundColor: color }}
                  title={title}
                />
              ))}
            </div>
          </div>

          {/* Selector de Fondo del Canvas */}
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-sm font-medium text-white mb-2">
              Color de fondo del canvas
            </label>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => handleBackgroundChange("#ffffff")}
                className={`w-12 h-12 rounded-lg border-2 ${
                  canvasBackground === "#ffffff"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#ffffff" }}
                title="Fondo Blanco"
              />
              <button
                onClick={() => handleBackgroundChange("#000000")}
                className={`w-12 h-12 rounded-lg border-2 ${
                  canvasBackground === "#000000"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#000000" }}
                title="Fondo Negro"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white text-center mb-2">
              Pega una imagen con{" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Cmd+V</kbd>{" "}
              o sube un archivo
            </p>
            <p className="text-white text-center text-sm mb-4">
              Presiona{" "}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">
                Delete
              </kbd>{" "}
              o <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌫</kbd>{" "}
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

                {/* Divisor */}
                <div className="h-8 w-px bg-gray-600" />

                {/* Sección: Edición */}
                <div className="flex gap-2 items-center">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                    Edición
                  </div>
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
                </div>

                {/* Divisor */}
                <div className="h-8 w-px bg-gray-600" />

                {/* Sección: Herramientas */}
                <div className="flex gap-2 items-center">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                    Herramientas
                  </div>
                  <Tooltip content="Flecha (A)">
                    <Button onClick={addArrow} variant="outline" size="icon">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Rectángulo (R)">
                    <Button
                      onClick={addRectangle}
                      variant="outline"
                      size="icon"
                    >
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

                {/* Divisor */}
                <div className="h-8 w-px bg-gray-600" />

                {/* Sección: Acciones */}
                <div className="flex gap-2 items-center">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">
                    Acciones
                  </div>
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
                    <Button
                      onClick={downloadImage}
                      variant="default"
                      size="icon"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
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
                    onClick={() => setCurrentFont("Montserrat, sans-serif")}
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
                    style={{ fontFamily: "Red Hat Display, sans-serif" }}
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
                  onKeyPress={(e) => e.key === "Enter" && handleAddText()}
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
  );
};

export default ImageEditor;
