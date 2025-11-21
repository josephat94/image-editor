import React, { useState, useRef, useEffect } from "react";
import { useCanvasContext } from "@/contexts/CanvasContext";
import { cn } from "@/lib/utils";

export const CanvasResizeHandles: React.FC = () => {
  const {
    fabricCanvas,
    showResizeHandles,
    setShowResizeHandles,
    resizeCanvas,
    setIsManualResizing,
  } = useCanvasContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasWidth = fabricCanvas?.width || 1200;
  const canvasHeight = fabricCanvas?.height || 800;

  // Obtener posición del canvas en la pantalla
  const getCanvasBounds = () => {
    if (!fabricCanvas) return null;
    const canvasElement = fabricCanvas.getElement();
    if (!canvasElement) return null;

    // Buscar el contenedor padre del canvas
    const canvasContainer = canvasElement.closest(".relative");
    if (!canvasContainer) return null;

    const canvasRect = canvasElement.getBoundingClientRect();
    const containerRect = (
      canvasContainer as HTMLElement
    ).getBoundingClientRect();

    return {
      left: canvasRect.left - containerRect.left,
      top: canvasRect.top - containerRect.top,
      width: canvasRect.width,
      height: canvasRect.height,
    };
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: canvasWidth, height: canvasHeight });
    setIsManualResizing(true); // Indicar que se está redimensionando manualmente
  };

  useEffect(() => {
    if (!isDragging || !dragHandle || !fabricCanvas) return;

    let debounceTimeout: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      // Calcular nuevo tamaño según el handle arrastrado
      switch (dragHandle) {
        case "se": // Esquina inferior derecha
          newWidth = startSize.width + deltaX;
          newHeight = startSize.height + deltaY;
          break;
        case "sw": // Esquina inferior izquierda
          newWidth = startSize.width - deltaX;
          newHeight = startSize.height + deltaY;
          break;
        case "ne": // Esquina superior derecha
          newWidth = startSize.width + deltaX;
          newHeight = startSize.height - deltaY;
          break;
        case "nw": // Esquina superior izquierda
          newWidth = startSize.width - deltaX;
          newHeight = startSize.height - deltaY;
          break;
        case "e": // Borde derecho
          newWidth = startSize.width + deltaX;
          break;
        case "w": // Borde izquierdo
          newWidth = startSize.width - deltaX;
          break;
        case "s": // Borde inferior
          newHeight = startSize.height + deltaY;
          break;
        case "n": // Borde superior
          newHeight = startSize.height - deltaY;
          break;
      }

      // Aplicar resize en tiempo real (sin guardar en historial)
      resizeCanvas(newWidth, newHeight, false);

      // Cancelar timeout anterior si existe
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };

    const handleMouseUp = () => {
      // Guardar en historial solo al terminar el drag
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // Obtener el tamaño actual del canvas
      const currentWidth = fabricCanvas.width || startSize.width;
      const currentHeight = fabricCanvas.height || startSize.height;

      // Guardar en historial con el tamaño final
      resizeCanvas(currentWidth, currentHeight, true);

      setIsDragging(false);
      setDragHandle(null);
      setIsManualResizing(false); // Indicar que terminó el redimensionamiento manual
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      // Asegurar que el flag se desactive si el componente se desmonta durante el arrastre
      if (isDragging) {
        setIsManualResizing(false);
      }
    };
  }, [
    isDragging,
    dragHandle,
    startPos,
    startSize,
    resizeCanvas,
    fabricCanvas,
    setIsManualResizing,
  ]);

  // Cerrar handles al hacer click fuera
  useEffect(() => {
    if (!showResizeHandles) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Solo cerrar si no estamos arrastrando
        if (!isDragging) {
          setShowResizeHandles(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showResizeHandles, isDragging, setShowResizeHandles]);

  // Early return DESPUÉS de todos los hooks
  if (!fabricCanvas || !showResizeHandles) return null;

  const bounds = getCanvasBounds();
  if (!bounds) return null;

  const handleSize = 12;
  const handleOffset = handleSize / 2;

  const handles = [
    {
      id: "nw",
      position: { left: -handleOffset, top: -handleOffset },
      cursor: "nwse-resize",
    },
    {
      id: "ne",
      position: { right: -handleOffset, top: -handleOffset },
      cursor: "nesw-resize",
    },
    {
      id: "sw",
      position: { left: -handleOffset, bottom: -handleOffset },
      cursor: "nesw-resize",
    },
    {
      id: "se",
      position: { right: -handleOffset, bottom: -handleOffset },
      cursor: "nwse-resize",
    },
    {
      id: "n",
      position: {
        left: "50%",
        top: -handleOffset,
        transform: "translateX(-50%)",
      },
      cursor: "ns-resize",
    },
    {
      id: "s",
      position: {
        left: "50%",
        bottom: -handleOffset,
        transform: "translateX(-50%)",
      },
      cursor: "ns-resize",
    },
    {
      id: "w",
      position: {
        left: -handleOffset,
        top: "50%",
        transform: "translateY(-50%)",
      },
      cursor: "ew-resize",
    },
    {
      id: "e",
      position: {
        right: -handleOffset,
        top: "50%",
        transform: "translateY(-50%)",
      },
      cursor: "ew-resize",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none z-50"
      style={{
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
      }}
    >
      {/* Borde de resaltado */}
      <div
        className="absolute inset-0 border-2 border-blue-500 pointer-events-none"
        style={{
          boxShadow:
            "0 0 0 1px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3)",
        }}
      />

      {/* Handles de resize */}
      {handles.map((handle) => (
        <div
          key={handle.id}
          className={cn(
            "absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full pointer-events-auto cursor-pointer shadow-lg",
            "hover:bg-blue-600 hover:scale-125 transition-transform"
          )}
          style={{
            ...handle.position,
            cursor: handle.cursor,
            pointerEvents: "auto",
          }}
          onMouseDown={(e) => handleMouseDown(e, handle.id)}
        />
      ))}

      {/* Indicador de tamaño */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-white px-3 py-1 rounded text-xs font-mono pointer-events-none whitespace-nowrap">
        {Math.round(canvasWidth)} × {Math.round(canvasHeight)}px
      </div>
    </div>
  );
};
