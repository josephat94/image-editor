import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentFont, setCurrentFont] = useState("Montserrat, sans-serif");
  const [currentColor, setCurrentColor] = useState("#ff0000");

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

    // Agregar el event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
    };
  }, []);

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

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = "#ffffff";
    fabricCanvasRef.current.renderAll();
  };

  const downloadImage = () => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    });

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    link.click();
  };

  return {
    canvasRef,
    fabricCanvas: fabricCanvasRef.current,
    isReady,
    addImage,
    addArrow,
    addText,
    clearCanvas,
    downloadImage,
    currentFont,
    setCurrentFont,
    currentColor,
    setCurrentColor,
  };
};
