import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentFont, setCurrentFont] = useState("Montserrat, sans-serif");
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [isBlurMode, setIsBlurMode] = useState(false);
  const [isArrowMode, setIsArrowMode] = useState(false);
  const [isRectangleMode, setIsRectangleMode] = useState(false);
  const [isCircleMode, setIsCircleMode] = useState(false);

  // Estado para Undo/Redo
  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef<number>(0);

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

  useEffect(() => {
    if (!canvasRef.current) return;

    // Inicializar Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#ffffff",
    });

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    // Guardar estado inicial
    saveCanvasState();

    // Listeners para detectar cambios en el canvas
    canvas.on("object:added", () => saveCanvasState());
    canvas.on("object:modified", () => saveCanvasState());
    canvas.on("object:removed", () => saveCanvasState());

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

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
      }

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
      }

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
      }

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
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [currentColor, currentFont]);

  const addImage = (imageUrl: string) => {
    if (!fabricCanvasRef.current) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      if (!fabricCanvasRef.current) return;

      // Escalar la imagen para que quepa en el canvas
      const canvas = fabricCanvasRef.current;
      const maxWidth = canvas.width! - 20;
      const maxHeight = canvas.height! - 20;

      const scaleX = maxWidth / img.width!;
      const scaleY = maxHeight / img.height!;
      const scale = Math.min(scaleX, scaleY, 1);

      img.scale(scale);
      img.set({
        left: (canvas.width! - img.width! * scale) / 2,
        top: (canvas.height! - img.height! * scale) / 2,
        selectable: true,
        evented: true,
      });

      canvas.add(img);
      // Enviar la imagen al fondo para que las flechas y textos queden encima
      img.sendToBack();
      canvas.renderAll();
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

    // Activar el modo de dibujo de flechas
    setIsArrowMode(true);
    const canvas = fabricCanvasRef.current;

    // Desactivar la selección de objetos mientras se dibuja
    canvas.selection = false;
    canvas.forEachObject((obj) => {
      obj.selectable = false;
    });

    // Cambiar el cursor para indicar el modo de dibujo
    canvas.defaultCursor = "crosshair";
    canvas.hoverCursor = "crosshair";
  };

  const addText = (text: string) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    const textObj = new fabric.Text(text, {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: currentFont,
      fontWeight: "600",
      fill: currentColor,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      padding: 8,
      selectable: true,
      evented: true,
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    canvas.add(textObj);
    // Asegurar que el texto esté siempre al frente
    textObj.bringToFront();

    // Animación de entrada
    textObj.animate("opacity", 1, {
      duration: 400,
      onChange: canvas.renderAll.bind(canvas),
    });
    textObj.animate("scaleX", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
    textObj.animate("scaleY", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
  };

  const addRectangle = () => {
    if (!fabricCanvasRef.current) return;

    // Activar el modo de dibujo de rectángulos
    setIsRectangleMode(true);
    const canvas = fabricCanvasRef.current;

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

    // Activar el modo de dibujo de círculos
    setIsCircleMode(true);
    const canvas = fabricCanvasRef.current;

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

    const blurRect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      fill: "rgba(0, 0, 0, 0.7)",
      selectable: true,
      evented: true,
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    // Agregar efecto de texto censurado encima
    const censorText = new fabric.Text("█████", {
      left: 100,
      top: 100,
      fontSize: 40,
      fill: "#000000",
      selectable: false,
      evented: false,
      opacity: 0.8,
    });

    const group = new fabric.Group([blurRect, censorText], {
      selectable: true,
      evented: true,
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
  };

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = "#ffffff";
    fabricCanvasRef.current.renderAll();
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

  const saveCanvasState = () => {
    if (!fabricCanvasRef.current) return;

    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    const history = historyRef.current;
    const currentStep = historyStepRef.current;

    // Eliminar estados futuros si estamos en medio del historial
    if (currentStep < history.length - 1) {
      historyRef.current = history.slice(0, currentStep + 1);
    }

    // Agregar nuevo estado
    historyRef.current.push(json);

    // Limitar el historial a 20 pasos
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }

    historyStepRef.current = historyRef.current.length - 1;
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

    canvas.loadFromJSON(previousState, () => {
      canvas.renderAll();

      // Reactivar los listeners
      canvas.on("object:added", () => saveCanvasState());
      canvas.on("object:modified", () => saveCanvasState());
      canvas.on("object:removed", () => saveCanvasState());
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

    canvas.loadFromJSON(nextState, () => {
      canvas.renderAll();

      // Reactivar los listeners
      canvas.on("object:added", () => saveCanvasState());
      canvas.on("object:modified", () => saveCanvasState());
      canvas.on("object:removed", () => saveCanvasState());
    });
  };

  const toggleTextMode = () => {
    // Esta función será llamada desde ImageEditor para activar el input de texto
    return "text-mode-toggle";
  };

  const setBackgroundColor = (color: string) => {
    if (!fabricCanvasRef.current) return;

    fabricCanvasRef.current.backgroundColor = color;
    fabricCanvasRef.current.renderAll();
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
    clearCanvas,
    downloadImage,
    copyToClipboard,
    undo,
    redo,
    toggleTextMode,
    currentFont,
    setCurrentFont,
    currentColor,
    setCurrentColor,
    isBlurMode,
    setIsBlurMode,
    setBackgroundColor,
  };
};
