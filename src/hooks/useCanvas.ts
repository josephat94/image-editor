import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { removeBackground } from "@imgly/background-removal";
import type { Config } from "@imgly/background-removal";
import { Vibrant } from "node-vibrant/browser";
import { useEditorStore } from "@/stores/editorStore";
import { useUIStore } from "@/stores/uiStore";

const AUTOSAVE_KEY = "quicksnap-autosave";

export const useCanvas = () => {
  const { setImagePalette, setCanvasBackground } = useEditorStore();
  const { setLastSaved, setIsAutoSaving } = useUIStore();

  // Necesitamos una referencia a setBackgroundColor que se define más abajo
  // Por ahora, lo manejaremos de otra forma
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentFont, setCurrentFont] = useState("Montserrat, sans-serif");
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [isArrowMode, setIsArrowMode] = useState(false);
  const [isRectangleMode, setIsRectangleMode] = useState(false);
  const [isCircleMode, setIsCircleMode] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isMagnifierMode, setIsMagnifierMode] = useState(false);
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  const isManualResizingRef = useRef(false); // Flag para redimensionamiento manual (usando ref para evitar re-renders)
  const [annotationCounter, setAnnotationCounter] = useState(1);
  const [layersVersion, setLayersVersion] = useState(0); // Para forzar re-render de la lista de capas
  const [historyVersion, setHistoryVersion] = useState(0); // Para forzar re-render del historial
  const [currentZoom, setCurrentZoom] = useState(1); // Zoom actual del canvas
  const isPanningRef = useRef(false); // Flag para panning
  const lastPanPointRef = useRef({ x: 0, y: 0 }); // Último punto de panning
  const isSpacePressedRef = useRef(false); // Flag para tecla espacio

  // Interfaz para el historial con metadata
  interface HistoryState {
    canvasState: string;
    action: string;
    actionType:
      | "image"
      | "text"
      | "arrow"
      | "rectangle"
      | "circle"
      | "blur"
      | "annotation"
      | "magnifier"
      | "delete"
      | "modify"
      | "layer"
      | "background"
      | "duplicate"
      | "clear"
      | "initial";
    timestamp: number;
    thumbnail?: string; // Thumbnail opcional (solo para acciones importantes)
  }

  // Estado para Undo/Redo con metadata
  const historyRef = useRef<HistoryState[]>([]);
  const historyStepRef = useRef<number>(0);
  const lastActionRef = useRef<string>("initial"); // Para rastrear la última acción
  const modifyTimeoutRef = useRef<number | null>(null); // Para debounce de modificaciones
  const addTimeoutRef = useRef<number | null>(null); // Para debounce de creación
  const saveTimeoutRef = useRef<number | null>(null); // Para debounce de guardado local
  const isModifyingRef = useRef<boolean>(false); // Flag para saber si está modificando
  const isDrawingModeRef = useRef<boolean>(false); // Flag para ignorar elementos temporales en object:removed

  // Referencias para el modo de dibujo de flechas
  const arrowDrawingRef = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    tempArrow: fabric.Group | null;
  }>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempArrow: null,
  });

  // Referencias para el modo de dibujo de rectángulos
  const rectangleDrawingRef = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    tempRect: fabric.Rect | null;
  }>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempRect: null,
  });

  // Referencias para el modo de dibujo de círculos
  const circleDrawingRef = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    tempCircle: fabric.Circle | null;
  }>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempCircle: null,
  });

  // Referencias para el modo de dibujo de blur
  const blurDrawingRef = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    tempBlur: fabric.Group | fabric.Rect | null;
  }>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempBlur: null,
  });

  // Referencias para el modo de dibujo de lupa
  const magnifierDrawingRef = useRef<{
    isDrawing: boolean;
    startX: number;
    startY: number;
    tempMagnifier: fabric.Group | null;
  }>({
    isDrawing: false,
    startX: 0,
    startY: 0,
    tempMagnifier: null,
  });

  // Función para ajustar el canvas inicialmente para que quepa en la pantalla
  const adjustCanvasToFit = (force: boolean = false) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.width || 1200;
    const canvasHeight = canvas.height || 800;

    // Obtener el tamaño del contenedor del canvas
    const canvasElement = canvas.getElement();
    if (!canvasElement) return;

    const container = canvasElement.parentElement;
    if (!container) return;

    // Esperar a que el DOM esté listo
    setTimeout(() => {
      const containerRect = container.getBoundingClientRect();
      const availableWidth = containerRect.width - 40; // Padding
      const availableHeight = window.innerHeight - 200; // Espacio para toolbar y otros elementos

      // Calcular el zoom necesario para que el canvas quepa
      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;
      const initialZoom = Math.min(scaleX, scaleY, 1); // No hacer zoom in, solo out si es necesario

      // Solo ajustar si se fuerza o si el zoom actual es 1 (por defecto)
      const currentZoom = canvas.getZoom();
      if (force || (currentZoom === 1 && initialZoom < 1)) {
        canvas.setZoom(initialZoom);
        setCurrentZoom(initialZoom);

        // Centrar el canvas
        const vpt = canvas.viewportTransform;
        if (vpt) {
          const scaledWidth = canvasWidth * initialZoom;
          const scaledHeight = canvasHeight * initialZoom;
          const offsetX = (availableWidth - scaledWidth) / 2;
          const offsetY = (availableHeight - scaledHeight) / 2;
          vpt[4] = offsetX;
          vpt[5] = offsetY;
          canvas.setViewportTransform(vpt);
        }
        canvas.renderAll();
      }
    }, 100);
  };

  // Función para guardar en localStorage
  const saveToLocalStorage = () => {
    if (!fabricCanvasRef.current) return;

    // Cancelar timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsAutoSaving(true);

    // Debounce de 2 segundos para no saturar el localStorage
    saveTimeoutRef.current = window.setTimeout(() => {
      if (!fabricCanvasRef.current) return;

      try {
        const canvas = fabricCanvasRef.current;
        const json = canvas.toJSON();

        // Guardar también las dimensiones y el fondo
        const saveData = {
          canvas: json,
          width: canvas.width,
          height: canvas.height,
          backgroundColor: canvas.backgroundColor,
          timestamp: Date.now(),
        };

        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
        setLastSaved(new Date());
        setIsAutoSaving(false);
      } catch (error) {
        console.error("Error al guardar en localStorage:", error);
        setIsAutoSaving(false);
      }
    }, 2000);
  };

  // Función para cargar desde localStorage
  const loadFromLocalStorage = () => {
    if (!fabricCanvasRef.current) return false;

    try {
      const savedData = localStorage.getItem(AUTOSAVE_KEY);
      if (!savedData) return false;

      const parsedData = JSON.parse(savedData);
      const canvas = fabricCanvasRef.current;

      // Verificar si hay datos válidos (al menos un objeto o fondo cambiado)
      if (
        !parsedData.canvas ||
        (!parsedData.canvas.objects?.length &&
          parsedData.canvas.background === "#ffffff")
      ) {
        return false;
      }

      // Restaurar dimensiones
      if (parsedData.width && parsedData.height) {
        canvas.setDimensions({
          width: parsedData.width,
          height: parsedData.height,
        });
      }

      // Restaurar color de fondo
      if (parsedData.backgroundColor) {
        canvas.backgroundColor = parsedData.backgroundColor;
        setCanvasBackground(parsedData.backgroundColor);
      }

      // Cargar objetos
      canvas.loadFromJSON(parsedData.canvas, () => {
        canvas.renderAll();

        // Inicializar historial con el estado cargado
        saveCanvasState("initial", "Restaurado de autoguardado");
        setLastSaved(new Date(parsedData.timestamp));
      });

      return true;
    } catch (error) {
      console.error("Error al cargar desde localStorage:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicializar Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true, // Respetar z-index incluso con objetos seleccionados
    });

    fabricCanvasRef.current = canvas;

    // Inicializar zoom siempre en 100% (1.0)
    canvas.setZoom(1);
    setCurrentZoom(1);

    // Centrar el canvas en el viewport sin cambiar el zoom
    const vpt = canvas.viewportTransform;
    if (vpt) {
      vpt[4] = 0;
      vpt[5] = 0;
      canvas.setViewportTransform(vpt);
    }

    setIsReady(true);

    // Intentar cargar desde localStorage primero
    const restored = loadFromLocalStorage();

    if (!restored) {
      // Si no hay datos guardados, guardar estado inicial
      saveCanvasState();
    }
    // Nota: Ya no ajustamos el zoom automáticamente, siempre inicia en 100%

    // Listeners para detectar cambios en el canvas
    canvas.on("object:added", () => {
      // Solo guardar si no estamos en medio de una modificación
      if (!isModifyingRef.current) {
        // Cancelar timeout anterior si existe
        if (addTimeoutRef.current) {
          clearTimeout(addTimeoutRef.current);
        }

        // Debounce de 300ms para agrupar creaciones rápidas (como elementos temporales)
        addTimeoutRef.current = window.setTimeout(() => {
          // El tipo de acción se determina por la última acción realizada
          saveCanvasState(lastActionRef.current as HistoryState["actionType"]);
          setLayersVersion((v) => v + 1);
          addTimeoutRef.current = null;
        }, 300);
      }
    });

    // Ocultar handles de resize cuando se selecciona un objeto
    canvas.on("selection:created", () => {
      setShowResizeHandles(false);
    });

    canvas.on("selection:updated", () => {
      setShowResizeHandles(false);
    });

    // Detectar cuando EMPIEZA a modificar (mover, escalar, rotar)
    canvas.on("object:moving", () => {
      isModifyingRef.current = true;
    });
    canvas.on("object:scaling", () => {
      isModifyingRef.current = true;
    });
    canvas.on("object:rotating", () => {
      isModifyingRef.current = true;
    });

    // Detectar cuando TERMINA de modificar (suelta el mouse)
    canvas.on("object:modified", () => {
      // Cancelar timeout anterior si existe
      if (modifyTimeoutRef.current) {
        clearTimeout(modifyTimeoutRef.current);
      }

      // Esperar un poco para asegurarnos de que terminó la modificación
      modifyTimeoutRef.current = window.setTimeout(() => {
        isModifyingRef.current = false;
        saveCanvasState("modify");
        setLayersVersion((v) => v + 1);
        modifyTimeoutRef.current = null;
      }, 300); // 300ms de debounce
    });

    canvas.on("object:removed", () => {
      // Guardar inmediatamente cuando se elimina (no debounce)
      // Pero NO guardar si estamos en modo dibujo (eliminando elementos temporales)
      if (!isModifyingRef.current && !isDrawingModeRef.current) {
        saveCanvasState("delete");
        setLayersVersion((v) => v + 1);
      }
    });

    // Agregar efecto de transparencia al mover objetos
    canvas.on("object:moving", (e) => {
      if (e.target) {
        e.target.animate("opacity", 0.5, {
          duration: 200,
          onChange: canvas.renderAll.bind(canvas),
        });
      }
    });

    canvas.on("object:modified", (e) => {
      if (e.target) {
        e.target.animate("opacity", 1, {
          duration: 300,
          onChange: canvas.renderAll.bind(canvas),
        });
      }
    });

    canvas.on("mouse:up", () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.animate("opacity", 1, {
          duration: 300,
          onChange: canvas.renderAll.bind(canvas),
        });
      }
    });

    // Manejar doble click en texto para edición inline
    const handleDoubleClick = (e: fabric.IEvent) => {
      if (e.target && e.target.type === "i-text") {
        const textObj = e.target as fabric.IText;
        canvas.setActiveObject(textObj);
        textObj.enterEditing();
        canvas.renderAll();
      }
    };

    canvas.on("mouse:dblclick", handleDoubleClick);

    // Manejar click en área vacía para mostrar handles de resize
    const handleEmptyAreaClick = (e: fabric.IEvent) => {
      // Solo si no hay objeto seleccionado y no estamos en ningún modo de dibujo
      // Esperar un poco para asegurarnos de que no es un click en un objeto
      setTimeout(() => {
        const activeObject = canvas.getActiveObject();
        if (
          !activeObject &&
          !e.target &&
          !isTextMode &&
          !isArrowMode &&
          !isRectangleMode &&
          !isCircleMode &&
          !isBlurMode &&
          !isMagnifierMode
        ) {
          setShowResizeHandles(true);
        } else {
          setShowResizeHandles(false);
        }
      }, 50);
    };

    canvas.on("mouse:down", handleEmptyAreaClick);

    // Manejar teclas Delete y Backspace para eliminar elementos seleccionados
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar si la tecla es Delete o Backspace
      if (e.key === "Delete" || e.key === "Backspace") {
        // Evitar que Backspace navegue hacia atrás en el navegador
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();

          const activeObject = canvas.getActiveObject();
          if (activeObject) {
            // Verificar si es una selección múltiple
            if (activeObject.type === "activeSelection") {
              // Eliminar todos los objetos seleccionados
              const selection = activeObject as fabric.ActiveSelection;
              const objects = selection.getObjects();
              canvas.discardActiveObject();
              objects.forEach((obj) => {
                canvas.remove(obj);
              });
            } else {
              // Eliminar un solo objeto
              canvas.remove(activeObject);
              canvas.discardActiveObject();
            }
            canvas.renderAll();
          }
        }
      }
    };

    // Agregar el event listener para Delete/Backspace
    document.addEventListener("keydown", handleKeyDown);

    // ===== ZOOM Y PANNING =====
    // Manejar zoom con la rueda del mouse
    const handleWheel = (e: WheelEvent) => {
      // Solo hacer zoom si el canvas está enfocado o el mouse está sobre él
      const canvasElement = canvas.getElement();
      if (!canvasElement) return;

      const rect = canvasElement.getBoundingClientRect();
      const isOverCanvas =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isOverCanvas) return;

      e.preventDefault();
      e.stopPropagation();

      // Obtener el punto del mouse relativo al canvas
      const pointer = canvas.getPointer(e);
      const zoom = canvas.getZoom();
      const delta = e.deltaY > 0 ? 0.9 : 1.1; // Zoom in/out
      const newZoom = Math.max(0.1, Math.min(5, zoom * delta)); // Limitar entre 0.1x y 5x

      // Zoom hacia el punto del mouse
      canvas.zoomToPoint(pointer, newZoom);
      setCurrentZoom(newZoom);
      canvas.renderAll();
    };

    // Manejar panning con botón medio del mouse o espacio + arrastre
    const handleMouseDown = (e: fabric.IEvent) => {
      const evt = e.e as MouseEvent;
      // Botón medio del mouse (button === 1) o espacio + click izquierdo
      if (evt.button === 1 || (evt.button === 0 && isSpacePressedRef.current)) {
        isPanningRef.current = true;
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
        canvas.hoverCursor = "grabbing";
        lastPanPointRef.current = canvas.getPointer(e.e);
        evt.preventDefault();
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isPanningRef.current) return;

      const evt = e.e as MouseEvent;
      const pointer = canvas.getPointer(evt);
      const vpt = canvas.viewportTransform;
      if (!vpt) return;

      // Calcular el desplazamiento
      const deltaX = pointer.x - lastPanPointRef.current.x;
      const deltaY = pointer.y - lastPanPointRef.current.y;

      // Aplicar el desplazamiento al viewport
      vpt[4] += deltaX;
      vpt[5] += deltaY;

      canvas.setViewportTransform(vpt);
      lastPanPointRef.current = pointer;
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        canvas.selection = true;
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
      }
    };

    // Manejar tecla espacio para panning
    const handleSpaceKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          isSpacePressedRef.current = true;
          if (!isPanningRef.current) {
            canvas.defaultCursor = "grab";
            canvas.hoverCursor = "grab";
          }
        }
      }
    };

    const handleSpaceKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressedRef.current = false;
        if (!isPanningRef.current) {
          canvas.defaultCursor = "default";
          canvas.hoverCursor = "move";
        }
      }
    };

    // Agregar event listeners para zoom y panning
    canvas.getElement().addEventListener("wheel", handleWheel, {
      passive: false,
    });
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    document.addEventListener("keydown", handleSpaceKey);
    document.addEventListener("keyup", handleSpaceKeyUp);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keydown", handleSpaceKey);
      document.removeEventListener("keyup", handleSpaceKeyUp);
      canvas.getElement().removeEventListener("wheel", handleWheel);
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      if (modifyTimeoutRef.current) {
        clearTimeout(modifyTimeoutRef.current);
      }
      if (addTimeoutRef.current) {
        clearTimeout(addTimeoutRef.current);
      }
      canvas.dispose();
    };
  }, []);

  // Efecto para manejar el modo de dibujo de flechas
  useEffect(() => {
    if (!fabricCanvasRef.current || !isArrowMode) return;

    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!canvas || !e.pointer) return;

      arrowDrawingRef.current.isDrawing = true;
      arrowDrawingRef.current.startX = e.pointer.x;
      arrowDrawingRef.current.startY = e.pointer.y;
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!canvas || !arrowDrawingRef.current.isDrawing || !e.pointer) return;

      // Eliminar la flecha temporal anterior si existe
      if (arrowDrawingRef.current.tempArrow) {
        canvas.remove(arrowDrawingRef.current.tempArrow);
      }

      const { startX, startY } = arrowDrawingRef.current;
      const endX = e.pointer.x;
      const endY = e.pointer.y;

      // Crear una flecha temporal
      const tempArrow = createArrowShape(
        startX,
        startY,
        endX,
        endY,
        currentColor,
        true
      );

      arrowDrawingRef.current.tempArrow = tempArrow;
      canvas.add(tempArrow);
      canvas.renderAll();
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (!canvas || !arrowDrawingRef.current.isDrawing || !e.pointer) return;

      const { startX, startY } = arrowDrawingRef.current;
      const endX = e.pointer.x;
      const endY = e.pointer.y;

      // Eliminar la flecha temporal
      if (arrowDrawingRef.current.tempArrow) {
        canvas.remove(arrowDrawingRef.current.tempArrow);
        arrowDrawingRef.current.tempArrow = null;
      }

      // Solo crear la flecha si hay un movimiento mínimo (para evitar flechas de punto)
      const distance = Math.sqrt(
        Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
      );

      if (distance > 10) {
        // Crear la flecha final
        const finalArrow = createArrowShape(
          startX,
          startY,
          endX,
          endY,
          currentColor,
          false
        );

        canvas.add(finalArrow);
        finalArrow.bringToFront();
        canvas.renderAll();
        // El debounce en object:added se encargará de guardar
      }

      // Desactivar flag de modo dibujo DESPUÉS de crear el elemento final
      isDrawingModeRef.current = false;

      // Resetear el estado de dibujo
      arrowDrawingRef.current.isDrawing = false;

      // Desactivar el modo de flecha y restaurar la funcionalidad normal
      setIsArrowMode(false);
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    };

    // Manejar tecla Escape para cancelar el modo de dibujo
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Eliminar la flecha temporal si existe
        if (arrowDrawingRef.current.tempArrow) {
          canvas.remove(arrowDrawingRef.current.tempArrow);
          arrowDrawingRef.current.tempArrow = null;
        }

        // Resetear el estado
        arrowDrawingRef.current.isDrawing = false;
        isDrawingModeRef.current = false; // Desactivar flag
        setIsArrowMode(false);
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.renderAll();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    document.addEventListener("keydown", handleEscape);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isArrowMode, currentColor]);

  // Efecto para manejar el modo de dibujo de rectángulos
  useEffect(() => {
    if (!fabricCanvasRef.current || !isRectangleMode) return;

    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!canvas || !e.pointer) return;

      rectangleDrawingRef.current.isDrawing = true;
      rectangleDrawingRef.current.startX = e.pointer.x;
      rectangleDrawingRef.current.startY = e.pointer.y;
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!canvas || !rectangleDrawingRef.current.isDrawing || !e.pointer)
        return;

      // Eliminar el rectángulo temporal anterior si existe
      if (rectangleDrawingRef.current.tempRect) {
        canvas.remove(rectangleDrawingRef.current.tempRect);
      }

      const { startX, startY } = rectangleDrawingRef.current;
      const width = e.pointer.x - startX;
      const height = e.pointer.y - startY;

      // Crear un rectángulo temporal
      const tempRect = new fabric.Rect({
        left: width > 0 ? startX : e.pointer.x,
        top: height > 0 ? startY : e.pointer.y,
        width: Math.abs(width),
        height: Math.abs(height),
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: 4,
        rx: 10,
        ry: 10,
        selectable: false,
        evented: false,
        opacity: 0.6,
      });

      rectangleDrawingRef.current.tempRect = tempRect;
      canvas.add(tempRect);
      canvas.renderAll();
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (!canvas || !rectangleDrawingRef.current.isDrawing || !e.pointer)
        return;

      const { startX, startY } = rectangleDrawingRef.current;
      const width = e.pointer.x - startX;
      const height = e.pointer.y - startY;

      // Eliminar el rectángulo temporal
      if (rectangleDrawingRef.current.tempRect) {
        canvas.remove(rectangleDrawingRef.current.tempRect);
        rectangleDrawingRef.current.tempRect = null;
      }

      // Solo crear el rectángulo si tiene un tamaño mínimo
      if (Math.abs(width) > 10 && Math.abs(height) > 10) {
        // Crear el rectángulo final
        const finalRect = new fabric.Rect({
          left: width > 0 ? startX : e.pointer.x,
          top: height > 0 ? startY : e.pointer.y,
          width: Math.abs(width),
          height: Math.abs(height),
          fill: "transparent",
          stroke: currentColor,
          strokeWidth: 4,
          rx: 10,
          ry: 10,
          selectable: true,
          evented: true,
        });

        canvas.add(finalRect);
        finalRect.bringToFront();
        canvas.renderAll();
        // El debounce en object:added se encargará de guardar
      }

      // Desactivar flag de modo dibujo DESPUÉS de crear el elemento final
      isDrawingModeRef.current = false;

      // Resetear el estado de dibujo
      rectangleDrawingRef.current.isDrawing = false;

      // Desactivar el modo de rectángulo y restaurar la funcionalidad normal
      setIsRectangleMode(false);
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    };

    // Manejar tecla Escape para cancelar el modo de dibujo
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Eliminar el rectángulo temporal si existe
        if (rectangleDrawingRef.current.tempRect) {
          canvas.remove(rectangleDrawingRef.current.tempRect);
          rectangleDrawingRef.current.tempRect = null;
        }

        // Resetear el estado
        rectangleDrawingRef.current.isDrawing = false;
        isDrawingModeRef.current = false; // Desactivar flag
        setIsRectangleMode(false);
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.renderAll();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    document.addEventListener("keydown", handleEscape);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isRectangleMode, currentColor]);

  // Efecto para manejar el modo de dibujo de círculos
  useEffect(() => {
    if (!fabricCanvasRef.current || !isCircleMode) return;

    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!canvas || !e.pointer) return;

      circleDrawingRef.current.isDrawing = true;
      circleDrawingRef.current.startX = e.pointer.x;
      circleDrawingRef.current.startY = e.pointer.y;
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!canvas || !circleDrawingRef.current.isDrawing || !e.pointer) return;

      // Eliminar el círculo temporal anterior si existe
      if (circleDrawingRef.current.tempCircle) {
        canvas.remove(circleDrawingRef.current.tempCircle);
      }

      const { startX, startY } = circleDrawingRef.current;
      const deltaX = e.pointer.x - startX;
      const deltaY = e.pointer.y - startY;
      const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Crear un círculo temporal
      const tempCircle = new fabric.Circle({
        left: startX - radius,
        top: startY - radius,
        radius: radius,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: 4,
        selectable: false,
        evented: false,
        opacity: 0.6,
      });

      circleDrawingRef.current.tempCircle = tempCircle;
      canvas.add(tempCircle);
      canvas.renderAll();
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (!canvas || !circleDrawingRef.current.isDrawing || !e.pointer) return;

      const { startX, startY } = circleDrawingRef.current;
      const deltaX = e.pointer.x - startX;
      const deltaY = e.pointer.y - startY;
      const radius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Eliminar el círculo temporal
      if (circleDrawingRef.current.tempCircle) {
        canvas.remove(circleDrawingRef.current.tempCircle);
        circleDrawingRef.current.tempCircle = null;
      }

      // Solo crear el círculo si tiene un tamaño mínimo
      if (radius > 10) {
        // Crear el círculo final
        const finalCircle = new fabric.Circle({
          left: startX - radius,
          top: startY - radius,
          radius: radius,
          fill: "transparent",
          stroke: currentColor,
          strokeWidth: 4,
          selectable: true,
          evented: true,
        });

        canvas.add(finalCircle);
        finalCircle.bringToFront();
        canvas.renderAll();
        // El debounce en object:added se encargará de guardar
      }

      // Desactivar flag de modo dibujo DESPUÉS de crear el elemento final
      isDrawingModeRef.current = false;

      // Resetear el estado de dibujo
      circleDrawingRef.current.isDrawing = false;

      // Desactivar el modo de círculo y restaurar la funcionalidad normal
      setIsCircleMode(false);
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    };

    // Manejar tecla Escape para cancelar el modo de dibujo
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Eliminar el círculo temporal si existe
        if (circleDrawingRef.current.tempCircle) {
          canvas.remove(circleDrawingRef.current.tempCircle);
          circleDrawingRef.current.tempCircle = null;
        }

        // Resetear el estado
        circleDrawingRef.current.isDrawing = false;
        isDrawingModeRef.current = false; // Desactivar flag
        setIsCircleMode(false);
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.renderAll();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    document.addEventListener("keydown", handleEscape);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCircleMode, currentColor]);

  // Efecto para manejar el modo de dibujo de blur (censurar)
  useEffect(() => {
    if (!fabricCanvasRef.current || !isBlurMode) return;

    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!canvas || !e.pointer) return;

      blurDrawingRef.current.isDrawing = true;
      blurDrawingRef.current.startX = e.pointer.x;
      blurDrawingRef.current.startY = e.pointer.y;
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!canvas || !blurDrawingRef.current.isDrawing || !e.pointer) return;

      // Eliminar el blur temporal anterior si existe
      if (blurDrawingRef.current.tempBlur) {
        canvas.remove(blurDrawingRef.current.tempBlur);
      }

      const { startX, startY } = blurDrawingRef.current;
      const width = e.pointer.x - startX;
      const height = e.pointer.y - startY;

      const rectWidth = Math.abs(width);
      const rectHeight = Math.abs(height);

      // Crear efecto pixelado temporal
      const pixelSize = 15;
      const pixelsX = Math.ceil(rectWidth / pixelSize);
      const pixelsY = Math.ceil(rectHeight / pixelSize);

      const pixels: fabric.Rect[] = [];
      for (let i = 0; i < pixelsX; i++) {
        for (let j = 0; j < pixelsY; j++) {
          const brightness = Math.floor(Math.random() * 100) + 100; // 100-200
          const pixel = new fabric.Rect({
            left: i * pixelSize,
            top: j * pixelSize,
            width: pixelSize - 1,
            height: pixelSize - 1,
            fill: `rgb(${brightness}, ${brightness}, ${brightness})`,
            selectable: false,
            evented: false,
          });
          pixels.push(pixel);
        }
      }

      const tempBlurGroup = new fabric.Group(pixels, {
        left: width > 0 ? startX : e.pointer.x,
        top: height > 0 ? startY : e.pointer.y,
        selectable: false,
        evented: false,
        opacity: 0.6,
      });

      blurDrawingRef.current.tempBlur = tempBlurGroup;
      canvas.add(tempBlurGroup);
      canvas.renderAll();
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (!canvas || !blurDrawingRef.current.isDrawing || !e.pointer) return;

      const { startX, startY } = blurDrawingRef.current;
      const width = e.pointer.x - startX;
      const height = e.pointer.y - startY;

      // Eliminar el blur temporal
      if (blurDrawingRef.current.tempBlur) {
        canvas.remove(blurDrawingRef.current.tempBlur);
        blurDrawingRef.current.tempBlur = null;
      }

      const rectWidth = Math.abs(width);
      const rectHeight = Math.abs(height);

      // Solo crear el blur si tiene un tamaño mínimo
      if (rectWidth > 20 && rectHeight > 20) {
        // Crear efecto pixelado final
        const pixelSize = 15;
        const pixelsX = Math.ceil(rectWidth / pixelSize);
        const pixelsY = Math.ceil(rectHeight / pixelSize);

        const pixels: fabric.Rect[] = [];
        for (let i = 0; i < pixelsX; i++) {
          for (let j = 0; j < pixelsY; j++) {
            const brightness = Math.floor(Math.random() * 100) + 100; // 100-200
            const pixel = new fabric.Rect({
              left: i * pixelSize,
              top: j * pixelSize,
              width: pixelSize - 1,
              height: pixelSize - 1,
              fill: `rgb(${brightness}, ${brightness}, ${brightness})`,
              selectable: false,
              evented: false,
            });
            pixels.push(pixel);
          }
        }

        const finalBlurGroup = new fabric.Group(pixels, {
          left: width > 0 ? startX : e.pointer.x,
          top: height > 0 ? startY : e.pointer.y,
          selectable: true,
          evented: true,
        });

        canvas.add(finalBlurGroup);
        finalBlurGroup.bringToFront();
        canvas.renderAll();
        // El debounce en object:added se encargará de guardar
      }

      // Desactivar flag de modo dibujo DESPUÉS de crear el elemento final
      isDrawingModeRef.current = false;

      // Resetear el estado de dibujo
      blurDrawingRef.current.isDrawing = false;

      // Desactivar el modo de blur y restaurar la funcionalidad normal
      setIsBlurMode(false);
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    };

    // Manejar tecla Escape para cancelar el modo de dibujo
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Eliminar el blur temporal si existe
        if (blurDrawingRef.current.tempBlur) {
          canvas.remove(blurDrawingRef.current.tempBlur);
          blurDrawingRef.current.tempBlur = null;
        }

        // Resetear el estado
        blurDrawingRef.current.isDrawing = false;
        isDrawingModeRef.current = false; // Desactivar flag
        setIsBlurMode(false);
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.renderAll();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    document.addEventListener("keydown", handleEscape);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isBlurMode]);

  // Función helper para crear un objeto de lupa
  const createMagnifier = (
    centerX: number,
    centerY: number,
    radius: number,
    zoomLevel: number = 2,
    isTemp: boolean = false,
    callback?: (magnifier: fabric.Group) => void
  ): void => {
    if (!fabricCanvasRef.current) {
      return;
    }

    const canvas = fabricCanvasRef.current;

    // Crear el círculo exterior (borde de la lupa)
    const outerCircle = new fabric.Circle({
      radius: radius,
      fill: "rgba(255, 255, 255, 0.95)",
      stroke: "#333",
      strokeWidth: 3,
      originX: "center",
      originY: "center",
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    // Crear el círculo interior (área de zoom)
    const innerRadius = radius - 8;

    // Calcular el área fuente a capturar (más pequeña que el área visible)
    const sourceRadius = innerRadius / zoomLevel;
    const sourceX = Math.max(0, centerX - sourceRadius);
    const sourceY = Math.max(0, centerY - sourceRadius);
    const sourceWidth = Math.min(sourceRadius * 2, canvas.width! - sourceX);
    const sourceHeight = Math.min(sourceRadius * 2, canvas.height! - sourceY);

    // Ocultar temporalmente la lupa si existe para no capturarla a sí misma
    const existingTempMagnifier = magnifierDrawingRef.current.tempMagnifier;
    if (existingTempMagnifier && !isTemp) {
      canvas.remove(existingTempMagnifier);
      canvas.renderAll();
    }

    // Usar toDataURL del canvas de fabric para capturar todos los objetos
    // Esto captura el canvas completo con todos los objetos renderizados
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      left: sourceX,
      top: sourceY,
      width: sourceWidth,
      height: sourceHeight,
    });

    // Restaurar la lupa temporal si existía
    if (existingTempMagnifier && !isTemp) {
      canvas.add(existingTempMagnifier);
      canvas.renderAll();
    }

    // Crear un canvas temporal para escalar la imagen al tamaño de la lupa
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = innerRadius * 2;
    tempCanvas.height = innerRadius * 2;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      return;
    }

    // Cargar la imagen capturada y escalarla
    const img = new Image();
    img.onload = () => {
      // Dibujar la imagen escalada en el canvas temporal (zoom 2x)
      tempCtx.drawImage(img, 0, 0, innerRadius * 2, innerRadius * 2);

      // Convertir a data URL y crear imagen de fabric
      const scaledDataUrl = tempCanvas.toDataURL("image/png");

      fabric.Image.fromURL(
        scaledDataUrl,
        (fabricImg) => {
          if (!fabricImg) return;

          fabricImg.set({
            left: -innerRadius,
            top: -innerRadius,
            originX: "left",
            originY: "top",
            selectable: false,
            evented: false,
          });

          // Crear un clipPath para el círculo interior
          const clipPath = new fabric.Circle({
            radius: innerRadius,
            originX: "center",
            originY: "center",
            left: 0,
            top: 0,
          });

          fabricImg.clipPath = clipPath;

          // Crear el grupo con el círculo exterior y la imagen
          const magnifierGroup = new fabric.Group([outerCircle, fabricImg], {
            left: centerX,
            top: centerY,
            originX: "center",
            originY: "center",
            selectable: !isTemp,
            evented: !isTemp,
            opacity: isTemp ? 0.7 : 1,
          });

          if (isTemp) {
            // Reemplazar el objeto temporal si existe
            if (magnifierDrawingRef.current.tempMagnifier) {
              canvas.remove(magnifierDrawingRef.current.tempMagnifier);
            }
            magnifierDrawingRef.current.tempMagnifier = magnifierGroup;
            canvas.add(magnifierGroup);
            canvas.renderAll();
          } else {
            // Agregar el objeto final al canvas
            canvas.add(magnifierGroup);
            magnifierGroup.bringToFront();
            canvas.renderAll();

            // Llamar al callback si existe
            if (callback) {
              callback(magnifierGroup);
            }
          }
        },
        {
          crossOrigin: "anonymous",
        }
      );
    };

    img.onerror = () => {
      console.error("Error loading magnifier image");
    };

    img.src = dataUrl;
  };

  // Efecto para manejar el modo de dibujo de lupa
  useEffect(() => {
    if (!fabricCanvasRef.current || !isMagnifierMode) return;

    const canvas = fabricCanvasRef.current;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!canvas || !e.pointer) return;

      magnifierDrawingRef.current.isDrawing = true;
      magnifierDrawingRef.current.startX = e.pointer.x;
      magnifierDrawingRef.current.startY = e.pointer.y;
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!canvas || !magnifierDrawingRef.current.isDrawing || !e.pointer)
        return;

      // Eliminar la lupa temporal anterior si existe
      if (magnifierDrawingRef.current.tempMagnifier) {
        canvas.remove(magnifierDrawingRef.current.tempMagnifier);
      }

      const { startX, startY } = magnifierDrawingRef.current;
      const endX = e.pointer.x;
      const endY = e.pointer.y;

      // Calcular la distancia desde el punto inicial (esquina) hasta el punto final
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // El radio es la distancia desde la esquina hasta el punto final
      const radius = Math.max(30, distance);

      // El centro está en startX + radius, startY + radius (desde la esquina superior izquierda)
      const centerX = startX + radius;
      const centerY = startY + radius;

      // Crear una lupa temporal
      createMagnifier(centerX, centerY, radius, 2, true);
    };

    const handleMouseUp = (e: fabric.IEvent) => {
      if (!canvas || !magnifierDrawingRef.current.isDrawing || !e.pointer)
        return;

      const { startX, startY } = magnifierDrawingRef.current;
      const endX = e.pointer.x;
      const endY = e.pointer.y;

      // Calcular la distancia desde el punto inicial (esquina) hasta el punto final
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // El radio es la distancia desde la esquina hasta el punto final
      const radius = Math.max(30, distance);

      // El centro está en startX + radius, startY + radius (desde la esquina superior izquierda)
      const centerX = startX + radius;
      const centerY = startY + radius;

      // Eliminar la lupa temporal
      if (magnifierDrawingRef.current.tempMagnifier) {
        canvas.remove(magnifierDrawingRef.current.tempMagnifier);
        magnifierDrawingRef.current.tempMagnifier = null;
      }

      // Solo crear la lupa si tiene un tamaño mínimo
      if (radius > 30) {
        // Crear la lupa final
        createMagnifier(centerX, centerY, radius, 2, false);
        // El debounce en object:added se encargará de guardar
      }

      // Desactivar flag de modo dibujo DESPUÉS de crear el elemento final
      isDrawingModeRef.current = false;

      // Resetear el estado de dibujo
      magnifierDrawingRef.current.isDrawing = false;

      // Desactivar el modo de lupa y restaurar la funcionalidad normal
      setIsMagnifierMode(false);
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
      });
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
    };

    // Manejar tecla Escape para cancelar el modo de dibujo
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Eliminar la lupa temporal si existe
        if (magnifierDrawingRef.current.tempMagnifier) {
          canvas.remove(magnifierDrawingRef.current.tempMagnifier);
          magnifierDrawingRef.current.tempMagnifier = null;
        }

        // Resetear el estado
        magnifierDrawingRef.current.isDrawing = false;
        isDrawingModeRef.current = false; // Desactivar flag
        setIsMagnifierMode(false);
        canvas.selection = true;
        canvas.forEachObject((obj) => {
          obj.selectable = true;
        });
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.renderAll();
      }
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    document.addEventListener("keydown", handleEscape);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMagnifierMode]);

  // Efecto para manejar el modo de texto inline
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    const handleTextModeClick = (e: fabric.IEvent) => {
      if (isTextMode && !e.target) {
        // Click en espacio vacío del canvas
        const pointer = canvas.getPointer(e.e as MouseEvent);
        createTextAtPosition(pointer.x, pointer.y);
        // Desactivar modo texto después de crear
        setIsTextMode(false);
        canvas.defaultCursor = "default";
        canvas.hoverCursor = "move";
        canvas.selection = true;
      }
    };

    if (isTextMode) {
      canvas.on("mouse:down", handleTextModeClick);
    }

    return () => {
      if (isTextMode) {
        canvas.off("mouse:down", handleTextModeClick);
      }
    };
  }, [isTextMode, currentFont, currentColor]);

  // Efecto para atajos de teclado globales
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Ignorar si estamos en un input o textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Atajos con Ctrl/Cmd
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.key.toLowerCase() === "d") {
          e.preventDefault();
          duplicateSelected();
          return;
        }
      }

      // Atajos con teclas solas
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case "a":
            e.preventDefault();
            addArrow();
            break;
          case "r":
            e.preventDefault();
            addRectangle();
            break;
          case "c":
            e.preventDefault();
            addCircle();
            break;
          case "b":
            e.preventDefault();
            addBlurBox();
            break;
          case "m":
            e.preventDefault();
            addMagnifier();
            break;
          case "n":
            e.preventDefault();
            addNumberedAnnotation();
            break;
          case "f":
            e.preventDefault();
            // Disparar un evento personalizado para que ImageEditor.tsx lo maneje
            window.dispatchEvent(new CustomEvent("removeBackground"));
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [currentColor, currentFont, annotationCounter]);

  const addImage = (imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    lastActionRef.current = "image"; // Trackear tipo de acción

    Vibrant.from(imageUrl)
      .getPalette()
      .then((palette) => {
        const hexas = {
          darkVibrant: palette.DarkVibrant?.hex,
          vibrant: palette.Vibrant?.hex,
          lightVibrant: palette.LightVibrant?.hex,
          muted: palette.Muted?.hex,
          darkMuted: palette.DarkMuted?.hex,
          lightMuted: palette.LightMuted?.hex,
        };
        setImagePalette(hexas);

        // Si hay un color vibrant, actualizar el fondo del canvas automáticamente
        if (hexas.vibrant && fabricCanvasRef.current) {
          setCanvasBackground(hexas.vibrant);
          fabricCanvasRef.current.backgroundColor = hexas.vibrant;
          fabricCanvasRef.current.renderAll();
        }
      });

    fabric.Image.fromURL(imageUrl, (img) => {
      if (!fabricCanvasRef.current) return;

      // Escalar la imagen para que quepa en el canvas
      const canvas = fabricCanvasRef.current;

      // Detectar si estamos en laptop (ancho de ventana entre 768 y 1440)
      const isLaptop = window.innerWidth >= 768 && window.innerWidth < 1440;

      // Ajustar el tamaño máximo según si es laptop o no
      // En laptops el canvas visual es ~68% del tamaño original
      const canvasVisualScale = isLaptop ? 0.68 : 1.0;

      const maxWidth = (canvas.width! - 20) * canvasVisualScale;
      const maxHeight = (canvas.height! - 20) * canvasVisualScale;

      const scaleX = maxWidth / img.width!;
      const scaleY = maxHeight / img.height!;
      const scale = Math.min(scaleX, scaleY, 1);

      img.scale(scale);

      // Calcular posición inteligente para múltiples imágenes (Best Fit Strategy)
      const newImgWidth = img.width! * scale;
      const newImgHeight = img.height! * scale;
      const gap = 20;

      const existingImages = canvas.getObjects("image");

      // Posición por defecto (centro) si es la primera imagen
      let bestPos = {
        left: (canvas.width! - newImgWidth) / 2,
        top: (canvas.height! - newImgHeight) / 2,
      };

      if (existingImages.length > 0) {
        // Puntos candidatos: inicio y puntos relativos a cada imagen existente
        const candidates = [{ left: gap, top: gap }];

        existingImages.forEach((obj) => {
          const objWidth = obj.width! * obj.scaleX!;
          const objHeight = obj.height! * obj.scaleY!;

          // Candidato a la derecha
          candidates.push({
            left: obj.left! + objWidth + gap,
            top: obj.top!,
          });

          // Candidato abajo (nueva fila)
          candidates.push({
            left: gap,
            top: obj.top! + objHeight + gap,
          });
        });

        // Ordenar candidatos: prioridad arriba-izquierda
        candidates.sort((a, b) => {
          // Margen de error pequeño para alineación vertical
          if (Math.abs(a.top - b.top) > 10) return a.top - b.top;
          return a.left - b.left;
        });

        // Buscar el primer candidato válido (que no colisione y quepa)
        let found = false;
        for (const pos of candidates) {
          // Verificar límites del canvas (ancho)
          if (pos.left + newImgWidth > canvas.width!) continue;

          // Verificar colisiones con otras imágenes
          const hasCollision = existingImages.some((obj) => {
            const objWidth = obj.width! * obj.scaleX!;
            const objHeight = obj.height! * obj.scaleY!;

            // Lógica de no-superposición (AABB)
            const isSeparate =
              pos.left + newImgWidth <= obj.left! || // Nuevo está a la izquierda
              pos.left >= obj.left! + objWidth || // Nuevo está a la derecha
              pos.top + newImgHeight <= obj.top! || // Nuevo está arriba
              pos.top >= obj.top! + objHeight; // Nuevo está abajo

            return !isSeparate; // Si no están separados, hay colisión
          });

          if (!hasCollision) {
            bestPos = pos;
            found = true;
            break;
          }
        }

        // Fallback: Si no se encontró hueco, colocar al final (abajo de la más baja)
        if (!found) {
          const maxBottom = existingImages.reduce((max, obj) => {
            const bottom = obj.top! + obj.height! * obj.scaleY!;
            return Math.max(max, bottom);
          }, 0);
          bestPos = { left: gap, top: maxBottom + gap };
        }
      }

      // Verificar si es necesario redimensionar el canvas si la imagen se sale
      const requiredWidth = bestPos.left + newImgWidth + 20; // +20 padding
      const requiredHeight = bestPos.top + newImgHeight + 20; // +20 padding

      let newCanvasWidth = canvas.width!;
      let newCanvasHeight = canvas.height!;
      let needsResize = false;

      if (requiredWidth > canvas.width!) {
        newCanvasWidth = requiredWidth;
        needsResize = true;
      }

      if (requiredHeight > canvas.height!) {
        newCanvasHeight = requiredHeight;
        needsResize = true;
      }

      if (needsResize) {
        // Redimensionar el canvas para que quepa la nueva imagen
        // No guardamos en historial aquí porque la acción de agregar imagen ya lo hará
        resizeCanvas(newCanvasWidth, newCanvasHeight, false);
      }

      img.set({
        left: bestPos.left,
        top: bestPos.top,
        selectable: true,
        evented: true,
      });

      canvas.add(img);
      // Enviar la imagen al fondo para que las flechas y textos queden encima
      img.sendToBack();
      canvas.renderAll();
      // El debounce en object:added se encargará de guardar
    });
  };

  // Función auxiliar para crear una flecha dados dos puntos
  const createArrowShape = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    isTemp: boolean = false
  ) => {
    // Calcular ángulo y longitud de la flecha
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 31; // Longitud de la punta triangular (25% más grande)
    const headWidth = 25; // Ancho de la punta triangular (25% más grande)
    const tailWidth = 3; // Grosor al inicio (delgado)
    const bodyEndWidth = 14; // Grosor al final del cuerpo (antes de la punta)

    // Calcular el punto donde termina el cuerpo (antes de la punta)
    const bodyEndX = endX - headLength * Math.cos(angle);
    const bodyEndY = endY - headLength * Math.sin(angle);

    // Crear el cuerpo cónico de la flecha (trapecio)
    const bodyPoints = [
      // Lado superior del inicio (delgado)
      {
        x: startX + (tailWidth / 2) * Math.cos(angle + Math.PI / 2),
        y: startY + (tailWidth / 2) * Math.sin(angle + Math.PI / 2),
      },
      // Lado superior del final (más ancho)
      {
        x: bodyEndX + (bodyEndWidth / 2) * Math.cos(angle + Math.PI / 2),
        y: bodyEndY + (bodyEndWidth / 2) * Math.sin(angle + Math.PI / 2),
      },
      // Lado inferior del final (más ancho)
      {
        x: bodyEndX + (bodyEndWidth / 2) * Math.cos(angle - Math.PI / 2),
        y: bodyEndY + (bodyEndWidth / 2) * Math.sin(angle - Math.PI / 2),
      },
      // Lado inferior del inicio (delgado)
      {
        x: startX + (tailWidth / 2) * Math.cos(angle - Math.PI / 2),
        y: startY + (tailWidth / 2) * Math.sin(angle - Math.PI / 2),
      },
    ];

    // Crear el cuerpo cónico con esquinas redondeadas
    const body = new fabric.Polygon(bodyPoints, {
      fill: color,
      stroke: color,
      strokeWidth: 1,
      strokeLineJoin: "round",
      strokeLineCap: "round",
      selectable: false,
      evented: false,
    });

    // Calcular los puntos del triángulo de la punta
    const trianglePoints = [
      { x: endX, y: endY }, // Punta de la flecha
      {
        x:
          endX -
          headLength * Math.cos(angle) -
          (headWidth / 2) * Math.cos(angle + Math.PI / 2),
        y:
          endY -
          headLength * Math.sin(angle) -
          (headWidth / 2) * Math.sin(angle + Math.PI / 2),
      },
      {
        x:
          endX -
          headLength * Math.cos(angle) -
          (headWidth / 2) * Math.cos(angle - Math.PI / 2),
        y:
          endY -
          headLength * Math.sin(angle) -
          (headWidth / 2) * Math.sin(angle - Math.PI / 2),
      },
    ];

    // Crear el triángulo relleno para la punta con esquinas redondeadas
    const arrowHead = new fabric.Polygon(trianglePoints, {
      fill: color,
      stroke: color,
      strokeWidth: 3,
      strokeLineJoin: "round",
      strokeLineCap: "round",
      selectable: false,
      evented: false,
    });

    // Agrupar el cuerpo cónico y la punta
    const arrowGroup = new fabric.Group([body, arrowHead], {
      selectable: !isTemp,
      evented: !isTemp,
      hasControls: !isTemp,
      hasBorders: !isTemp,
      lockRotation: false,
      opacity: isTemp ? 0.6 : 1,
    });

    return arrowGroup;
  };

  const addArrow = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();
    canvas.renderAll();

    lastActionRef.current = "arrow"; // Trackear tipo de acción
    isDrawingModeRef.current = true; // Activar flag para ignorar eliminaciones temporales

    // Desactivar modo texto si está activo
    if (isTextMode) {
      setIsTextMode(false);
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = true;
    }

    // Activar el modo de dibujo de flechas
    setIsArrowMode(true);

    // Desactivar la selección de objetos mientras se dibuja
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    // Cambiar el cursor para indicar el modo de dibujo
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  };

  // Función para crear texto inline en una posición específica
  const createTextAtPosition = (
    x: number,
    y: number,
    initialText: string = ""
  ) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();

    lastActionRef.current = "text";

    // Usar IText para edición inline
    const textObj = new fabric.IText(initialText || "Escribe aquí...", {
      left: x,
      top: y,
      fontSize: 24,
      fontFamily: currentFont,
      fontWeight: "600",
      fill: currentColor,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      padding: 8,
      selectable: true,
      evented: true,
      editable: true,
    });

    canvas.add(textObj);
    textObj.bringToFront();

    // Activar edición inmediatamente si hay texto inicial, o si está vacío
    canvas.setActiveObject(textObj);
    textObj.enterEditing();
    textObj.selectAll();

    // Si el texto es el placeholder, seleccionarlo todo para que se reemplace al escribir
    if (!initialText) {
      setTimeout(() => {
        textObj.selectAll();
        canvas.renderAll();
      }, 100);
    }

    canvas.renderAll();
  };

  // Función legacy para compatibilidad (cuando se llama desde TextInputPanel)
  const addText = (text: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Si hay un objeto seleccionado y es texto, reemplazarlo
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      (activeObject as fabric.IText).set("text", text);
      canvas.renderAll();
      return;
    }

    // Si no, deseleccionar cualquier elemento y crear nuevo texto en el centro
    canvas.discardActiveObject();
    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;
    createTextAtPosition(centerX, centerY, text);
  };

  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();
    canvas.renderAll();

    lastActionRef.current = "rectangle"; // Trackear tipo de acción
    isDrawingModeRef.current = true; // Activar flag para ignorar eliminaciones temporales

    // Desactivar modo texto si está activo
    if (isTextMode) {
      setIsTextMode(false);
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = true;
    }

    // Activar el modo de dibujo de rectángulos
    setIsRectangleMode(true);

    // Desactivar la selección de objetos mientras se dibuja
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    // Cambiar el cursor para indicar el modo de dibujo
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();
    canvas.renderAll();

    lastActionRef.current = "circle"; // Trackear tipo de acción
    isDrawingModeRef.current = true; // Activar flag para ignorar eliminaciones temporales

    // Desactivar modo texto si está activo
    if (isTextMode) {
      setIsTextMode(false);
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = true;
    }

    // Activar el modo de dibujo de círculos
    setIsCircleMode(true);

    // Desactivar la selección de objetos mientras se dibuja
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    // Cambiar el cursor para indicar el modo de dibujo
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  };

  const addBlurBox = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();
    canvas.renderAll();

    lastActionRef.current = "blur"; // Trackear tipo de acción
    isDrawingModeRef.current = true; // Activar flag para ignorar eliminaciones temporales

    // Desactivar modo texto si está activo
    if (isTextMode) {
      setIsTextMode(false);
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = true;
    }

    // Activar el modo de dibujo de blur
    setIsBlurMode(true);

    // Desactivar la selección de objetos mientras se dibuja
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    // Cambiar el cursor para indicar el modo de dibujo
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  };

  const addMagnifier = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();
    canvas.renderAll();

    lastActionRef.current = "magnifier"; // Trackear tipo de acción
    isDrawingModeRef.current = true; // Activar flag para ignorar eliminaciones temporales

    // Desactivar modo texto si está activo
    if (isTextMode) {
      setIsTextMode(false);
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = true;
    }

    // Activar el modo de dibujo de lupa
    setIsMagnifierMode(true);

    // Desactivar la selección de objetos mientras se dibuja
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    // Cambiar el cursor para indicar el modo de dibujo
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  };

  const addNumberedAnnotation = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    // Deseleccionar cualquier elemento previamente seleccionado
    canvas.discardActiveObject();
    canvas.renderAll();

    lastActionRef.current = "annotation"; // Trackear tipo de acción

    const radius = 30;

    // Crear el círculo
    const circle = new fabric.Circle({
      radius: radius,
      fill: currentColor,
      stroke: currentColor,
      strokeWidth: 3,
      originX: "center",
      originY: "center",
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    // Crear el texto con el número
    const text = new fabric.Text(annotationCounter.toString(), {
      fontSize: 32,
      fontFamily: "Montserrat, sans-serif",
      fontWeight: "bold",
      fill: "#ffffff",
      originX: "center",
      originY: "center",
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
    });

    // Agrupar el círculo y el texto
    const group = new fabric.Group([circle, text], {
      left: 100,
      top: 100,
      selectable: true,
      evented: true,
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      // @ts-ignore - Propiedad personalizada para identificar anotaciones numeradas
      isNumberedAnnotation: true,
    });

    canvas.add(group);
    group.bringToFront();

    // Animación de entrada
    group.animate("opacity", 1, {
      duration: 400,
      onChange: canvas.renderAll.bind(canvas),
    });
    group.animate("scaleX", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
    group.animate("scaleY", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
    // El debounce en object:added se encargará de guardar

    // Incrementar el contador para la siguiente anotación
    setAnnotationCounter(annotationCounter + 1);
  };

  const resetAnnotationCounter = () => {
    setAnnotationCounter(1);
  };

  const duplicateSelected = () => {
    if (!fabricCanvasRef.current) return;

    lastActionRef.current = "duplicate"; // Trackear tipo de acción
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    // @ts-ignore - Verificar si es una anotación numerada
    if (activeObject.isNumberedAnnotation) {
      // Para anotaciones numeradas, crear una nueva con el número siguiente
      const radius = 30;

      // Crear el círculo
      const circle = new fabric.Circle({
        radius: radius,
        fill: currentColor,
        stroke: currentColor,
        strokeWidth: 3,
        originX: "center",
        originY: "center",
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      // Crear el texto con el número actual del contador
      const text = new fabric.Text(annotationCounter.toString(), {
        fontSize: 32,
        fontFamily: "Montserrat, sans-serif",
        fontWeight: "bold",
        fill: "#ffffff",
        originX: "center",
        originY: "center",
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });

      // Agrupar el círculo y el texto
      const group = new fabric.Group([circle, text], {
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20,
        selectable: true,
        evented: true,
        scaleX: activeObject.scaleX,
        scaleY: activeObject.scaleY,
        angle: activeObject.angle,
        // @ts-ignore - Propiedad personalizada
        isNumberedAnnotation: true,
      });

      canvas.add(group);
      group.bringToFront();

      // Seleccionar el nuevo objeto
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
      // El debounce en object:added se encargará de guardar

      // Incrementar el contador
      setAnnotationCounter(annotationCounter + 1);
      return;
    }

    // Clonar objetos normales
    activeObject.clone((cloned: fabric.Object) => {
      // Descartar la selección actual
      canvas.discardActiveObject();

      // Configurar la posición del objeto clonado (offset de 20px)
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
        evented: true,
      });

      // Si es una selección múltiple, clonar cada objeto
      if (cloned.type === "activeSelection") {
        cloned.canvas = canvas;
        (cloned as fabric.ActiveSelection).forEachObject(
          (obj: fabric.Object) => {
            canvas.add(obj);
          }
        );
        cloned.setCoords();
      } else {
        canvas.add(cloned);
      }

      // Seleccionar el objeto clonado
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      // El debounce en object:added se encargará de guardar
    });
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    lastActionRef.current = "clear"; // Trackear tipo de acción
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = "#ffffff";
    fabricCanvasRef.current.renderAll();
    saveCanvasState("clear");
  };

  const downloadImage = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    let dataURL: string;

    if (objects.length === 0) {
      // Si no hay objetos, descargar el canvas completo
      dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
      });
    } else {
      // Calcular el bounding box de todos los objetos
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      objects.forEach((obj) => {
        const bound = obj.getBoundingRect();
        minX = Math.min(minX, bound.left);
        minY = Math.min(minY, bound.top);
        maxX = Math.max(maxX, bound.left + bound.width);
        maxY = Math.max(maxY, bound.top + bound.height);
      });

      // Agregar un pequeño padding
      const padding = 10;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(canvas.width!, maxX + padding);
      maxY = Math.min(canvas.height!, maxY + padding);

      // Exportar solo el área con contenido
      dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        left: minX,
        top: minY,
        width: maxX - minX,
        height: maxY - minY,
      });
    }

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    link.click();
  };

  const copyToClipboard = async () => {
    if (!fabricCanvasRef.current) return;

    try {
      const canvas = fabricCanvasRef.current;

      // Calcular el área ocupada por los objetos
      const objects = canvas.getObjects();
      if (objects.length === 0) {
        // Si no hay objetos, copiar el canvas completo
        const dataURL = canvas.toDataURL({
          format: "png",
          quality: 1,
        });
        const response = await fetch(dataURL);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        return true;
      }

      // Calcular el bounding box de todos los objetos
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      objects.forEach((obj) => {
        const bound = obj.getBoundingRect();
        minX = Math.min(minX, bound.left);
        minY = Math.min(minY, bound.top);
        maxX = Math.max(maxX, bound.left + bound.width);
        maxY = Math.max(maxY, bound.top + bound.height);
      });

      // Agregar un pequeño padding
      const padding = 10;
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(canvas.width!, maxX + padding);
      maxY = Math.min(canvas.height!, maxY + padding);

      // Exportar solo el área con contenido
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        left: minX,
        top: minY,
        width: maxX - minX,
        height: maxY - minY,
      });

      // Convertir dataURL a blob
      const response = await fetch(dataURL);
      const blob = await response.blob();

      // Copiar al portapapeles usando la API de Clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);

      return true; // Éxito
    } catch (error) {
      console.error("Error al copiar al portapapeles:", error);
      return false; // Error
    }
  };

  const saveCanvasState = (
    actionType: HistoryState["actionType"] = "modify",
    actionDescription?: string
  ) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const json = JSON.stringify(canvas.toJSON());
    const history = historyRef.current;
    const currentStep = historyStepRef.current;

    // Eliminar estados futuros si estamos en medio del historial
    if (currentStep < history.length - 1) {
      historyRef.current = history.slice(0, currentStep + 1);
    }

    // Generar descripción automática si no se proporciona
    let action = actionDescription;
    if (!action) {
      switch (actionType) {
        case "image":
          action = "Agregaste una imagen";
          break;
        case "text":
          action = "Agregaste texto";
          break;
        case "arrow":
          action = "Agregaste una flecha";
          break;
        case "rectangle":
          action = "Agregaste un rectángulo";
          break;
        case "circle":
          action = "Agregaste un círculo";
          break;
        case "blur":
          action = "Aplicaste censura";
          break;
        case "annotation":
          action = "Agregaste una anotación";
          break;
        case "delete":
          action = "Eliminaste un elemento";
          break;
        case "modify":
          action = "Modificaste un elemento";
          break;
        case "layer":
          action = "Cambiaste el orden de capas";
          break;
        case "background":
          action = "Cambiaste el fondo";
          break;
        case "duplicate":
          action = "Duplicaste un elemento";
          break;
        case "clear":
          action = "Limpiaste el canvas";
          break;
        case "initial":
          action = "Estado inicial";
          break;
        default:
          action = "Hiciste un cambio";
      }
    }

    // Generar thumbnail solo para acciones importantes
    let thumbnail: string | undefined;
    const importantActions: HistoryState["actionType"][] = [
      "image",
      "clear",
      "background",
    ];

    // Generar thumbnail cada 5 acciones o para acciones importantes
    if (
      importantActions.includes(actionType) ||
      historyRef.current.length % 5 === 0
    ) {
      try {
        thumbnail = canvas.toDataURL({
          format: "png",
          quality: 0.3, // Baja calidad para thumbnails pequeños
          multiplier: 0.1, // Thumbnail muy pequeño (10% del tamaño original)
        });
      } catch (error) {
        console.warn("No se pudo generar thumbnail:", error);
      }
    }

    // Agregar nuevo estado con metadata
    const newState: HistoryState = {
      canvasState: json,
      action,
      actionType,
      timestamp: Date.now(),
      thumbnail,
    };

    historyRef.current.push(newState);

    // Limitar el historial a 50 pasos (más que antes para mejor historial)
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }

    historyStepRef.current = historyRef.current.length - 1;
    lastActionRef.current = actionType;
    setHistoryVersion((v) => v + 1);

    // Disparar autoguardado
    saveToLocalStorage();
  };

  const undo = () => {
    if (!fabricCanvasRef.current || historyStepRef.current === 0) return;

    historyStepRef.current -= 1;
    const canvas = fabricCanvasRef.current;
    const previousState = historyRef.current[historyStepRef.current];

    // Temporalmente desactivar los listeners para no guardar el estado
    canvas.off("object:added");
    canvas.off("object:modified");
    canvas.off("object:removed");

    canvas.loadFromJSON(previousState.canvasState, () => {
      canvas.renderAll();

      // Reactivar los listeners
      canvas.on("object:added", () =>
        saveCanvasState(lastActionRef.current as HistoryState["actionType"])
      );
      canvas.on("object:modified", () => saveCanvasState("modify"));
      canvas.on("object:removed", () => saveCanvasState("delete"));

      setHistoryVersion((v) => v + 1);
      setLayersVersion((v) => v + 1);
    });
  };

  const redo = () => {
    if (
      !fabricCanvasRef.current ||
      historyStepRef.current >= historyRef.current.length - 1
    )
      return;

    historyStepRef.current += 1;
    const canvas = fabricCanvasRef.current;
    const nextState = historyRef.current[historyStepRef.current];

    // Temporalmente desactivar los listeners
    canvas.off("object:added");
    canvas.off("object:modified");
    canvas.off("object:removed");

    canvas.loadFromJSON(nextState.canvasState, () => {
      canvas.renderAll();

      // Reactivar los listeners
      canvas.on("object:added", () =>
        saveCanvasState(lastActionRef.current as HistoryState["actionType"])
      );
      canvas.on("object:modified", () => saveCanvasState("modify"));
      canvas.on("object:removed", () => saveCanvasState("delete"));

      setHistoryVersion((v) => v + 1);
      setLayersVersion((v) => v + 1);
    });
  };

  // Navegar a un punto específico del historial
  const goToHistoryState = (index: number) => {
    if (
      !fabricCanvasRef.current ||
      index < 0 ||
      index >= historyRef.current.length
    )
      return;

    historyStepRef.current = index;
    const canvas = fabricCanvasRef.current;
    const targetState = historyRef.current[index];

    // Temporalmente desactivar los listeners
    canvas.off("object:added");
    canvas.off("object:modified");
    canvas.off("object:removed");

    canvas.loadFromJSON(targetState.canvasState, () => {
      canvas.renderAll();

      // Reactivar los listeners
      canvas.on("object:added", () =>
        saveCanvasState(lastActionRef.current as HistoryState["actionType"])
      );
      canvas.on("object:modified", () => saveCanvasState("modify"));
      canvas.on("object:removed", () => saveCanvasState("delete"));

      setHistoryVersion((v) => v + 1);
      setLayersVersion((v) => v + 1);
    });
  };

  // Obtener la lista del historial
  const getHistoryList = () => {
    return historyRef.current.map((state, index) => ({
      index,
      action: state.action,
      actionType: state.actionType,
      timestamp: state.timestamp,
      thumbnail: state.thumbnail,
      isCurrent: index === historyStepRef.current,
      isPast: index < historyStepRef.current,
      isFuture: index > historyStepRef.current,
    }));
  };

  const toggleTextMode = () => {
    setIsTextMode((prev) => !prev);

    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;

    if (!isTextMode) {
      // Deseleccionar cualquier elemento previamente seleccionado al activar modo texto
      canvas.discardActiveObject();
      canvas.renderAll();
      // Activar modo texto
      canvas.defaultCursor = "text";
      canvas.hoverCursor = "text";
      // Desactivar selección de otros objetos temporalmente
      canvas.selection = false;
    } else {
      // Desactivar modo texto
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.selection = true;
    }
  };

  const setBackgroundColor = (color: string) => {
    if (!fabricCanvasRef.current) return;

    lastActionRef.current = "background"; // Trackear tipo de acción
    fabricCanvasRef.current.backgroundColor = color;
    fabricCanvasRef.current.renderAll();
    saveCanvasState(
      "background",
      `Cambiaste el fondo a ${color === "#ffffff" ? "blanco" : "negro"}`
    );
  };

  // Función para cambiar el tamaño del canvas
  const resizeCanvas = (
    newWidth: number,
    newHeight: number,
    saveToHistory: boolean = true
  ) => {
    if (!fabricCanvasRef.current) return;

    lastActionRef.current = "background"; // Trackear como cambio de canvas
    const canvas = fabricCanvasRef.current;

    // Validar tamaños mínimos
    const minWidth = 200;
    const minHeight = 200;
    const maxWidth = 5000;
    const maxHeight = 5000;

    const width = Math.max(minWidth, Math.min(maxWidth, newWidth));
    const height = Math.max(minHeight, Math.min(maxHeight, newHeight));

    // Cambiar dimensiones del canvas
    canvas.setDimensions({ width, height });
    canvas.renderAll();

    // Guardar en historial solo si se solicita (para evitar guardar en cada movimiento del drag)
    if (saveToHistory) {
      saveCanvasState("background");
      setLayersVersion((v) => v + 1);
    }
  };

  // Funciones de control de capas (z-index)
  const bringToFront = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    lastActionRef.current = "layer"; // Trackear tipo de acción
    canvas.bringToFront(activeObject);
    activeObject.setCoords(); // Actualizar coordenadas del objeto
    canvas.discardActiveObject(); // Deseleccionar temporalmente
    canvas.setActiveObject(activeObject); // Re-seleccionar para actualizar controles
    canvas.requestRenderAll(); // Forzar re-render completo
    setLayersVersion((v) => v + 1);
    saveCanvasState("layer", "Trajiste un elemento al frente");
  };

  const sendToBack = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    lastActionRef.current = "layer"; // Trackear tipo de acción
    canvas.sendToBack(activeObject);
    activeObject.setCoords(); // Actualizar coordenadas del objeto
    canvas.discardActiveObject(); // Deseleccionar temporalmente
    canvas.setActiveObject(activeObject); // Re-seleccionar para actualizar controles
    canvas.requestRenderAll(); // Forzar re-render completo
    setLayersVersion((v) => v + 1);
    saveCanvasState("layer", "Enviaste un elemento al fondo");
  };

  const bringForward = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    lastActionRef.current = "layer"; // Trackear tipo de acción
    canvas.bringForward(activeObject);
    activeObject.setCoords(); // Actualizar coordenadas del objeto
    canvas.discardActiveObject(); // Deseleccionar temporalmente
    canvas.setActiveObject(activeObject); // Re-seleccionar para actualizar controles
    canvas.requestRenderAll(); // Forzar re-render completo
    setLayersVersion((v) => v + 1);
    saveCanvasState("layer", "Subiste un elemento una capa");
  };

  const sendBackwards = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    if (!activeObject) return;

    lastActionRef.current = "layer"; // Trackear tipo de acción
    canvas.sendBackwards(activeObject);
    activeObject.setCoords(); // Actualizar coordenadas del objeto
    canvas.discardActiveObject(); // Deseleccionar temporalmente
    canvas.setActiveObject(activeObject); // Re-seleccionar para actualizar controles
    canvas.requestRenderAll(); // Forzar re-render completo
    setLayersVersion((v) => v + 1);
    saveCanvasState("layer", "Bajaste un elemento una capa");
  };

  // Obtener información de las capas
  const getLayersList = () => {
    if (!fabricCanvasRef.current) return [];

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    return objects
      .map((obj, index) => {
        let layerType = "Objeto";
        let layerName = "";

        // Determinar el tipo de capa
        if (obj.type === "image") {
          layerType = "Imagen";
          layerName = "Imagen";
        } else if (obj.type === "text") {
          layerType = "Texto";
          layerName = (obj as fabric.Text).text?.substring(0, 20) || "Texto";
        } else if (obj.type === "group") {
          // @ts-ignore - Verificar si es una anotación numerada
          if (obj.isNumberedAnnotation) {
            layerType = "Anotación";
            const textObj = (
              obj as fabric.Group
            ).getObjects()[1] as fabric.Text;
            layerName = `Anotación #${textObj.text}`;
          } else {
            layerType = "Grupo";
            layerName = "Blur/Flecha";
          }
        } else if (obj.type === "rect") {
          layerType = "Rectángulo";
          layerName = "Rectángulo";
        } else if (obj.type === "circle") {
          layerType = "Círculo";
          layerName = "Círculo";
        }

        return {
          id: index,
          object: obj,
          type: layerType,
          name: layerName,
          isSelected: obj === canvas.getActiveObject(),
        };
      })
      .reverse(); // Invertir para mostrar las capas superiores primero
  };

  // Seleccionar una capa específica
  const selectLayer = (layerIndex: number) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - layerIndex; // Invertir índice
    const object = objects[actualIndex];

    if (object) {
      canvas.setActiveObject(object);
      canvas.renderAll();
      setLayersVersion((v) => v + 1);
    }
  };

  // Eliminar una capa específica
  const deleteLayer = (layerIndex: number) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();
    const actualIndex = objects.length - 1 - layerIndex; // Invertir índice
    const object = objects[actualIndex];

    if (object) {
      canvas.remove(object);
      canvas.renderAll();
      setLayersVersion((v) => v + 1);
    }
  };

  // Reordenar capas (drag and drop)
  const reorderLayers = (oldIndex: number, newIndex: number) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    // Convertir índices invertidos a índices reales
    const actualOldIndex = objects.length - 1 - oldIndex;
    const actualNewIndex = objects.length - 1 - newIndex;

    // Obtener el objeto a mover
    const object = objects[actualOldIndex];
    if (!object) return;

    // Remover el objeto de su posición actual
    objects.splice(actualOldIndex, 1);

    // Insertar en la nueva posición
    objects.splice(actualNewIndex, 0, object);

    // Actualizar z-index en Fabric.js moviendo cada objeto a su nuevo índice
    objects.forEach((obj, index) => {
      canvas.moveTo(obj, index);
    });

    canvas.renderAll();
    setLayersVersion((v) => v + 1);

    // Guardar en historial
    lastActionRef.current = "layer";
    saveCanvasState("layer", "Reordenaste capas");
  };

  // Función para limpiar todo el historial
  const clearHistory = () => {
    if (!fabricCanvasRef.current) return;

    // Guardar el estado actual del canvas
    const currentState = fabricCanvasRef.current.toJSON();

    // Reiniciar el historial con solo el estado actual
    historyRef.current = [
      {
        canvasState: JSON.stringify(currentState),
        action: "Estado inicial",
        actionType: "initial",
        timestamp: Date.now(),
      },
    ];

    historyStepRef.current = 0;
    lastActionRef.current = "initial";

    // Actualizar la UI
    setHistoryVersion((v) => v + 1);
  };

  // Funciones públicas para controlar el zoom
  const zoomIn = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const zoom = canvas.getZoom();
    const newZoom = Math.min(5, zoom * 1.2);
    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom);
    setCurrentZoom(newZoom);
    canvas.renderAll();
  };

  const zoomOut = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const zoom = canvas.getZoom();
    const newZoom = Math.max(0.1, zoom * 0.8);
    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, newZoom);
    setCurrentZoom(newZoom);
    canvas.renderAll();
  };

  const resetZoom = () => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    canvas.setZoom(1);
    setCurrentZoom(1);

    // Resetear el viewport al centro
    const vpt = canvas.viewportTransform;
    if (vpt) {
      vpt[4] = 0;
      vpt[5] = 0;
      canvas.setViewportTransform(vpt);
    }
    canvas.renderAll();
  };

  const fitToScreen = () => {
    adjustCanvasToFit(true);
  };

  const removeImageBackground = async () => {
    if (!fabricCanvasRef.current)
      return { success: false, error: "Canvas no disponible" };

    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();

    // Verificar si hay un objeto seleccionado y si es una imagen
    if (!activeObject) {
      return {
        success: false,
        error: "Por favor, selecciona una imagen primero",
      };
    }

    if (activeObject.type !== "image") {
      return {
        success: false,
        error: "Por favor, selecciona una imagen (no texto ni formas)",
      };
    }

    try {
      const imageObject = activeObject as fabric.Image;

      // Convertir el objeto Fabric.js a Blob
      const imageDataUrl = imageObject.toDataURL({ format: "png" });

      // Convertir dataURL a Blob
      const response = await fetch(imageDataUrl);
      const imageBlob = await response.blob();

      console.log("Iniciando remoción de fondo...", imageBlob);

      // Configuración para la remoción de fondo
      const config: Config = {
        debug: true,
        progress: (key: string, current: number, total: number) => {
          console.log(`Progreso: ${key} - ${current}/${total}`);
        },
      };

      // Remover el fondo usando IA
      const blob = await removeBackground(imageBlob, config);

      console.log("Fondo removido exitosamente", blob);

      // Convertir blob a URL
      const url = URL.createObjectURL(blob);

      // Crear una nueva imagen sin fondo
      fabric.Image.fromURL(url, (newImg) => {
        if (!fabricCanvasRef.current) return;

        // Copiar las propiedades de la imagen original
        newImg.set({
          left: imageObject.left,
          top: imageObject.top,
          scaleX: imageObject.scaleX,
          scaleY: imageObject.scaleY,
          angle: imageObject.angle,
          opacity: imageObject.opacity,
          selectable: true,
          evented: true,
        });

        // Eliminar la imagen original
        canvas.remove(imageObject);

        // Agregar la nueva imagen sin fondo
        canvas.add(newImg);
        newImg.setCoords();
        canvas.setActiveObject(newImg);
        canvas.renderAll();

        // Liberar la URL temporal
        URL.revokeObjectURL(url);
      });

      return { success: true };
    } catch (error) {
      console.error("Error al remover fondo:", error);
      return {
        success: false,
        error:
          "Error al procesar la imagen. Intenta con una imagen más pequeña.",
      };
    }
  };

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    isReady,
    addImage,
    addArrow,
    addText,
    addRectangle,
    addCircle,
    addBlurBox,
    addMagnifier,
    addNumberedAnnotation,
    resetAnnotationCounter,
    annotationCounter,
    duplicateSelected,
    clearCanvas,
    downloadImage,
    copyToClipboard,
    undo,
    redo,
    toggleTextMode,
    isTextMode,
    showResizeHandles,
    setShowResizeHandles,
    isManualResizing: () => isManualResizingRef.current, // Función getter que siempre devuelve el valor actual
    setIsManualResizing: (value: boolean) => {
      isManualResizingRef.current = value;
    },
    resizeCanvas,
    currentFont,
    setCurrentFont,
    currentColor,
    setCurrentColor,
    isBlurMode,
    setIsBlurMode,
    setBackgroundColor,
    removeImageBackground,
    // Funciones de control de capas
    bringToFront,
    sendToBack,
    bringForward,
    sendBackwards,
    getLayersList,
    selectLayer,
    deleteLayer,
    reorderLayers,
    layersVersion,
    // Funciones de historial
    getHistoryList,
    goToHistoryState,
    clearHistory,
    historyVersion,
    // Funciones de zoom y panning
    zoomIn,
    zoomOut,
    resetZoom,
    fitToScreen,
    currentZoom,
  };
};
