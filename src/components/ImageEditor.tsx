import React, { useState, useEffect } from "react";
import { useCanvas } from "@/hooks/useCanvas";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

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
    currentFont,
    setCurrentFont,
    currentColor,
    setCurrentColor,
  } = useCanvas();
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-9xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Editor de Imágenes
          </h1>

          {/* Selector de Color Global */}
          <div className="mb-6 flex flex-col items-center">
            <label className="block text-sm font-medium text-white mb-2">
              Color de los elementos dinamicos
            </label>
            <div className="flex gap-3 items-center">
              {/* Colores predefinidos */}
              <button
                onClick={() => setCurrentColor("#ff0000")}
                className={`w-10 h-10 rounded-full border-2 ${
                  currentColor === "#ff0000"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#ff0000" }}
                title="Rojo"
              />
              <button
                onClick={() => setCurrentColor("#000000")}
                className={`w-10 h-10 rounded-full border-2 ${
                  currentColor === "#000000"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#000000" }}
                title="Negro"
              />
              <button
                onClick={() => setCurrentColor("#2563eb")}
                className={`w-10 h-10 rounded-full border-2 ${
                  currentColor === "#2563eb"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#2563eb" }}
                title="Azul"
              />
              <button
                onClick={() => setCurrentColor("#16a34a")}
                className={`w-10 h-10 rounded-full border-2 ${
                  currentColor === "#16a34a"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#16a34a" }}
                title="Verde"
              />
              <button
                onClick={() => setCurrentColor("#ea580c")}
                className={`w-10 h-10 rounded-full border-2 ${
                  currentColor === "#ea580c"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#ea580c" }}
                title="Naranja"
              />
              <button
                onClick={() => setCurrentColor("#9333ea")}
                className={`w-10 h-10 rounded-full border-2 ${
                  currentColor === "#9333ea"
                    ? "border-white ring-2 ring-offset-2 ring-white ring-offset-gray-800"
                    : "border-gray-500"
                }`}
                style={{ backgroundColor: "#9333ea" }}
                title="Morado"
              />
              {/* Selector de color personalizado */}
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

            <div className="flex flex-wrap gap-2 justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imagen
                </Button>
              </label>

              <Button onClick={addArrow} variant="outline">
                <ArrowRight className="w-4 h-4 mr-2" />
                Flecha
              </Button>

              <Button onClick={addRectangle} variant="outline">
                <Square className="w-4 h-4 mr-2" />
                Rectángulo
              </Button>

              <Button onClick={addCircle} variant="outline">
                <Circle className="w-4 h-4 mr-2" />
                Círculo
              </Button>

              <Button onClick={addBlurBox} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Censurar
              </Button>

              <Button
                onClick={() => setShowTextInput(!showTextInput)}
                variant="outline"
              >
                <Type className="w-4 h-4 mr-2" />
                Texto
              </Button>

              <Button onClick={clearCanvas} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar
              </Button>

              <Button 
                onClick={handleCopyToClipboard} 
                variant={copied ? "secondary" : "default"}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>

              <Button onClick={downloadImage} variant="default">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
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
