import React from "react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";
import { useCanvasContext } from "@/contexts/CanvasContext";

export const TextInputPanel: React.FC = () => {
  const { showTextInput, setShowTextInput, textInput, setTextInput } =
    useUIStore();
  const { addText, currentFont, setCurrentFont } = useCanvasContext();

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
