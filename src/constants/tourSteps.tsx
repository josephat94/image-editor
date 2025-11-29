// Tipo para los pasos del tour de Driver.js
export interface TourStep {
  element?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
  };
}

export const TOUR_STEPS: TourStep[] = [
  {
    element: "#editor-header",
    popover: {
      title: "¡Bienvenido a QuickSnap! 🎨",
      description:
        "Esta es una herramienta profesional para editar y anotar imágenes. Te guiaré por las funciones principales en unos segundos.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#file-upload-section",
    popover: {
      title: "Cargar Imágenes 📁",
      description:
        "Puedes subir una imagen haciendo clic aquí o simplemente pegándola con Cmd+V (o Ctrl+V en Windows).\n\n✨ Mágico: Al cargar una imagen, sus colores principales se extraerán automáticamente y se agregarán a tu paleta de colores.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tools-section",
    popover: {
      title: "Herramientas de Anotación ✏️",
      description:
        "Aquí encontrarás todas las herramientas: flechas, formas, texto, censura y anotaciones numeradas. Cada herramienta tiene un atajo de teclado para trabajar más rápido.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#color-selector",
    popover: {
      title: "Selector de Colores 🎨",
      description:
        "Elige el color que quieres usar para tus anotaciones y elementos. El color se aplicará a flechas, formas, texto y más.\n\n✨ Tip: Cuando cargues una imagen, sus colores principales se extraerán automáticamente y se agregarán a esta paleta para que puedas usarlos en tus anotaciones.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#annotation-counter",
    popover: {
      title: "Anotaciones Numeradas 🔢",
      description:
        "Crea anotaciones numeradas secuencialmente. Perfecto para tutoriales y guías paso a paso. Presiona N para agregar una anotación numerada.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#layers-panel",
    popover: {
      title: "Panel de Capas 📚",
      description:
        "Gestiona el orden de tus elementos con drag and drop arrastrando el ícono de agarre. También puedes usar [ y ] para mover capas, o Ctrl+[ y Ctrl+] para enviar al fondo/traer al frente.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#background-selector",
    popover: {
      title: "Fondo del Canvas 🖼️",
      description:
        "Elige el color de fondo para tu canvas. Puedes elegir entre blanco, negro, o el color vibrant extraído automáticamente de tu imagen (si está disponible). El fondo se actualiza automáticamente cuando cargas una imagen.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "#actions-section",
    popover: {
      title: "Exportar tu Trabajo 💾",
      description:
        "Cuando termines, puedes copiar al portapapeles o descargar tu imagen. ¡También puedes limpiar todo para empezar de nuevo!",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "body",
    popover: {
      title: "¡Listo para empezar! 🚀",
      description:
        "Usa los atajos de teclado para trabajar más rápido:\n\n• T - Añadir texto\n• A - Flecha\n• R - Rectángulo\n• C - Círculo\n• B - Censurar\n• N - Anotación numerada\n• Ctrl+Z - Deshacer\n• Ctrl+Shift+Z - Rehacer\n• Delete - Eliminar selección\n• Rueda del mouse - Zoom in/out",
      side: "top",
      align: "center",
    },
  },
];
