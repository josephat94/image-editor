import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentFont, setCurrentFont] = useState("Montserrat, sans-serif");
  const [currentColor, setCurrentColor] = useState("#ff0000");
  const [isBlurMode, setIsBlurMode] = useState(false);

  // Estado para Undo/Redo
  const historyRef = useRef<string[]>([]);
  const historyStepRef = useRef<number>(0);

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

  const addArrow = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const startX = 100;
    const startY = 100;
    const endX = 250;
    const endY = 100;

    // Calcular ángulo de la flecha
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 15; // Longitud de la punta de la flecha

    // Crear la línea principal
    const line = new fabric.Line([startX, startY, endX, endY], {
      stroke: currentColor,
      strokeWidth: 4,
      selectable: false,
      evented: false,
    });

    // Crear las dos líneas de la punta de la flecha
    const arrowLine1 = new fabric.Line(
      [
        endX,
        endY,
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6),
      ],
      {
        stroke: currentColor,
        strokeWidth: 4,
        selectable: false,
        evented: false,
      }
    );

    const arrowLine2 = new fabric.Line(
      [
        endX,
        endY,
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6),
      ],
      {
        stroke: currentColor,
        strokeWidth: 4,
        selectable: false,
        evented: false,
      }
    );

    // Agrupar todas las partes de la flecha
    const arrowGroup = new fabric.Group([line, arrowLine1, arrowLine2], {
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: false,
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    canvas.add(arrowGroup);
    // Asegurar que la flecha esté siempre al frente
    arrowGroup.bringToFront();

    // Animación de entrada
    arrowGroup.animate("opacity", 1, {
      duration: 400,
      onChange: canvas.renderAll.bind(canvas),
    });
    arrowGroup.animate("scaleX", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
    arrowGroup.animate("scaleY", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
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

    const canvas = fabricCanvasRef.current;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "transparent",
      stroke: currentColor,
      strokeWidth: 4,
      rx: 10,
      ry: 10,
      selectable: true,
      evented: true,
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    canvas.add(rect);
    rect.bringToFront();

    // Animación de entrada
    rect.animate("opacity", 1, {
      duration: 400,
      onChange: canvas.renderAll.bind(canvas),
    });
    rect.animate("scaleX", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
    rect.animate("scaleY", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
  };

  const addCircle = () => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 75,
      fill: "transparent",
      stroke: currentColor,
      strokeWidth: 4,
      selectable: true,
      evented: true,
      opacity: 0,
      scaleX: 0.5,
      scaleY: 0.5,
    });

    canvas.add(circle);
    circle.bringToFront();

    // Animación de entrada
    circle.animate("opacity", 1, {
      duration: 400,
      onChange: canvas.renderAll.bind(canvas),
    });
    circle.animate("scaleX", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
    circle.animate("scaleY", 1, {
      duration: 400,
      easing: fabric.util.ease.easeOutBack,
      onChange: canvas.renderAll.bind(canvas),
    });
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
  };
};
