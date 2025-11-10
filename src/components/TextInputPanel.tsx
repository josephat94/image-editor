import React from "react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { Type } from "lucide-react";

export const TextInputPanel: React.FC = () => {
  const { showTextInput, setShowTextInput, textInput, setTextInput } =
    useUIStore();
  const { addText, currentFont, setCurrentFont, toggleTextMode, isTextMode } =
    useCanvasContext();

  // Si está en modo texto inline, mostrar indicador en lugar del input
  if (isTextMode) {
    return (
      <div className="mb-4 p-4 bg-blue-500/20 border-2 border-blue-500 rounded-lg">
        <div className="flex items-center gap-3">
          <Type className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-200">
              Modo texto activo
            </p>
            <p className="text-xs text-blue-300">
              Haz click en el canvas para agregar texto. Presiona{" "}
              <kbd className="px-1.5 py-0.5 bg-blue-600 rounded text-xs">T</kbd>{" "}
              nuevamente para cancelar.
            </p>
          </div>
          <Button
            onClick={toggleTextMode}
            variant="outline"
            size="sm"
            className="border-blue-400 text-blue-200 hover:bg-blue-500/20"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (!showTextInput) return null;

  const handleAddText = () => {
    if (textInput.trim()) {
      addText(textInput);
      setTextInput("");
      setShowTextInput(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-gray-700 rounded-lg">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Fuente:
        </label>
        <div className="flex gap-2">
          <Button
            onClick={() => setCurrentFont("Montserrat, sans-serif")}
            variant={
              currentFont === "Montserrat, sans-serif" ? "default" : "outline"
            }
            size="sm"
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
  );
};
