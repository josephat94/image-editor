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
  Layers,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";

interface Layer {
  id: number;
  type: string;
  name: string;
  isSelected: boolean;
}

interface LayersPanelProps {
  layers: Layer[];
  onSelectLayer: (index: number) => void;
  onDeleteLayer: (index: number) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackwards: () => void;
  layersVersion: number;
}

const getLayerIcon = (type: string) => {
  switch (type) {
    case "Imagen":
      return <Image className="w-4 h-4" />;
    case "Texto":
      return <Type className="w-4 h-4" />;
    case "Círculo":
      return <Circle className="w-4 h-4" />;
    case "Rectángulo":
      return <Square className="w-4 h-4" />;
    case "Anotación":
      return <Hash className="w-4 h-4" />;
    case "Grupo":
      return <Eye className="w-4 h-4" />;
    default:
      return <Layers className="w-4 h-4" />;
  }
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  onSelectLayer,
  onDeleteLayer,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackwards,
  layersVersion,
}) => {
  const [localLayers, setLocalLayers] = useState<Layer[]>(layers);

  // Actualizar cuando cambien las capas
  useEffect(() => {
    setLocalLayers(layers);
  }, [layers, layersVersion]);

  const selectedLayer = localLayers.find((layer) => layer.isSelected);
  const hasSelection = !!selectedLayer;

  return (
    <div className="flex flex-col h-full">
      {/* Header con controles de capas */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex gap-1 justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onBringToFront}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!hasSelection}
              >
                <ChevronsUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Traer al frente</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onBringForward}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!hasSelection}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subir una capa (])</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onSendBackwards}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!hasSelection}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bajar una capa ([)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onSendToBack}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!hasSelection}
              >
                <ChevronsDown className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enviar al fondo</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Lista de capas */}
      <div className="flex-1 overflow-y-auto">
        {localLayers.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Sin capas</p>
            <p className="text-xs mt-1">Agrega elementos al canvas</p>
          </div>
        ) : (
          <div className="py-2">
            {localLayers.map((layer, index) => (
              <div
                key={`${layer.id}-${index}-${layersVersion}`}
                onClick={() => onSelectLayer(index)}
                className={`
                  flex items-center gap-2 px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${
                    layer.isSelected
                      ? "bg-blue-500/20 border border-blue-500"
                      : "hover:bg-gray-700/50 border border-transparent"
                  }
                `}
              >
                <div
                  className={`
                  flex-shrink-0
                  ${layer.isSelected ? "text-blue-400" : "text-gray-400"}
                `}
                >
                  {getLayerIcon(layer.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`
                    text-sm font-medium truncate
                    ${layer.isSelected ? "text-white" : "text-gray-300"}
                  `}
                  >
                    {layer.name}
                  </p>
                  <p className="text-xs text-gray-500">{layer.type}</p>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(index);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar capa</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
