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
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  onReorderLayers: (oldIndex: number, newIndex: number) => void;
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

// Componente individual de capa con drag and drop
interface SortableLayerItemProps {
  layer: Layer;
  index: number;
  onSelectLayer: (index: number) => void;
  onDeleteLayer: (index: number) => void;
}

const SortableLayerItem: React.FC<SortableLayerItemProps> = ({
  layer,
  index,
  onSelectLayer,
  onDeleteLayer,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectLayer(index)}
      className={`
        group flex items-center gap-2 px-3 py-2 mx-2 mb-1 rounded-lg cursor-pointer
        transition-all duration-200
        ${
          layer.isSelected
            ? "bg-blue-500/20 border border-blue-500"
            : "hover:bg-gray-700/50 border border-transparent"
        }
        ${isDragging ? "z-50 shadow-2xl" : ""}
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

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
  );
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  onSelectLayer,
  onDeleteLayer,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackwards,
  onReorderLayers,
  layersVersion,
}) => {
  const [localLayers, setLocalLayers] = useState<Layer[]>(layers);

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Actualizar cuando cambien las capas
  useEffect(() => {
    setLocalLayers(layers);
  }, [layers, layersVersion]);

  const selectedLayer = localLayers.find((layer) => layer.isSelected);
  const hasSelection = !!selectedLayer;

  // Manejar el fin del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localLayers.findIndex((layer) => layer.id === active.id);
      const newIndex = localLayers.findIndex((layer) => layer.id === over.id);

      // Actualizar localmente para feedback inmediato
      setLocalLayers((items) => arrayMove(items, oldIndex, newIndex));

      // Notificar al componente padre
      onReorderLayers(oldIndex, newIndex);
    }
  };

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

      {/* Lista de capas con drag and drop */}
      <div className="flex-1 overflow-y-auto">
        {localLayers.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Sin capas</p>
            <p className="text-xs mt-1">Agrega elementos al canvas</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localLayers.map((layer) => layer.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="py-2">
                {localLayers.map((layer, index) => (
                  <SortableLayerItem
                    key={`${layer.id}-${layersVersion}`}
                    layer={layer}
                    index={index}
                    onSelectLayer={onSelectLayer}
                    onDeleteLayer={onDeleteLayer}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
