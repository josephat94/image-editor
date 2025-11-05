import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Image,
  Type,
  Circle,
  Square,
  Eye,
  Hash,
  Trash2,
  Layers,
  Paintbrush,
  ArrowRight,
  RotateCcw,
  Copy,
  Eraser,
  Circle as CircleDot,
} from "lucide-react";

interface HistoryItem {
  index: number;
  action: string;
  actionType: string;
  timestamp: number;
  thumbnail?: string;
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onGoToState: (index: number) => void;
  historyVersion: number;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case "image":
      return <Image className="w-4 h-4" />;
    case "text":
      return <Type className="w-4 h-4" />;
    case "arrow":
      return <ArrowRight className="w-4 h-4" />;
    case "rectangle":
      return <Square className="w-4 h-4" />;
    case "circle":
      return <Circle className="w-4 h-4" />;
    case "blur":
      return <Eye className="w-4 h-4" />;
    case "annotation":
      return <Hash className="w-4 h-4" />;
    case "delete":
      return <Trash2 className="w-4 h-4" />;
    case "modify":
      return <Paintbrush className="w-4 h-4" />;
    case "layer":
      return <Layers className="w-4 h-4" />;
    case "duplicate":
      return <Copy className="w-4 h-4" />;
    case "clear":
      return <Eraser className="w-4 h-4" />;
    case "initial":
      return <CircleDot className="w-4 h-4" />;
    default:
      return <Paintbrush className="w-4 h-4" />;
  }
};

const getRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return "Ahora";
  if (seconds < 60) return `Hace ${seconds}s`;
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${days}d`;
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onGoToState,
  historyVersion,
}) => {
  const [localHistory, setLocalHistory] = useState<HistoryItem[]>(history);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Actualizar cuando cambie el historial
  useEffect(() => {
    setLocalHistory(history);
  }, [history, historyVersion]);

  // Auto-scroll al elemento actual cuando cambia
  useEffect(() => {
    const currentElement = document.querySelector(".history-item-current");
    if (currentElement) {
      currentElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [historyVersion]);

  const currentIndex = localHistory.findIndex((item) => item.isCurrent);

  return (
    <div className="flex flex-col h-full">
      {/* Header con información */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {currentIndex >= 0 && (
              <span>
                Paso {currentIndex + 1} de {localHistory.length}
              </span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onGoToState(0)}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={currentIndex === 0}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Inicio
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Volver al estado inicial</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Lista de historial */}
      <div className="flex-1 overflow-y-auto">
        {localHistory.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Sin historial</p>
            <p className="text-xs mt-1">Los cambios aparecerán aquí</p>
          </div>
        ) : (
          <div className="py-2 relative">
            {/* Timeline vertical */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-700" />

            {localHistory.map((item, index) => (
              <div
                key={`${item.index}-${index}-${historyVersion}`}
                onClick={() => onGoToState(item.index)}
                onMouseEnter={() => setHoveredIndex(item.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`
                  relative flex items-start gap-3 px-3 py-3 mx-2 mb-2 rounded-lg cursor-pointer
                  transition-all duration-200 group
                  ${
                    item.isCurrent
                      ? "bg-blue-500/20 border border-blue-500 shadow-md history-item-current"
                      : item.isPast
                      ? "hover:bg-gray-700/50 hover:border-gray-600 border border-transparent"
                      : "opacity-50 hover:bg-gray-700/30 border border-transparent"
                  }
                `}
              >
                {/* Dot en el timeline */}
                <div
                  className={`
                  absolute left-[-6px] top-9 w-3 h-3 rounded-full border-2
                  transition-all duration-200
                  ${
                    item.isCurrent
                      ? "bg-blue-500 border-blue-400 scale-125 shadow-lg shadow-blue-500/50"
                      : item.isPast
                      ? "bg-gray-600 border-gray-500"
                      : "bg-gray-700 border-gray-600"
                  }
                `}
                />

                {/* Thumbnail (si existe) */}
                {item.thumbnail && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-800 shadow-md">
                    <img
                      src={item.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`
                      flex-shrink-0
                      ${
                        item.isCurrent
                          ? "text-blue-400"
                          : item.isPast
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    `}
                    >
                      {getActionIcon(item.actionType)}
                    </div>

                    <p
                      className={`
                      text-sm font-medium truncate
                      ${
                        item.isCurrent
                          ? "text-white"
                          : item.isPast
                          ? "text-gray-300"
                          : "text-gray-500"
                      }
                    `}
                    >
                      {item.action}
                    </p>
                  </div>

                  <p
                    className={`
                    text-xs
                    ${
                      item.isCurrent
                        ? "text-blue-300"
                        : item.isPast
                        ? "text-gray-500"
                        : "text-gray-600"
                    }
                  `}
                  >
                    {getRelativeTime(item.timestamp)}
                    {item.isCurrent && " • Actual"}
                  </p>
                </div>

                {/* Preview en hover (solo para estados pasados) */}
                {hoveredIndex === item.index &&
                  item.thumbnail &&
                  !item.isCurrent && (
                    <div className="absolute left-full ml-3 top-0 z-50 pointer-events-none">
                      <div className="bg-gray-800 border-2 border-gray-600 rounded-xl shadow-2xl p-3">
                        <img
                          src={item.thumbnail}
                          alt="Preview"
                          className="w-64 h-auto rounded-lg"
                        />
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Haz clic para volver a este punto
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con ayuda */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
        <p className="text-xs text-gray-400 text-center">
          Haz clic en cualquier punto para volver
        </p>
      </div>
    </div>
  );
};
