import type { DriveStep } from "driver.js";

export const TOUR_STEPS: DriveStep[] = [
  {
    element: "#editor-header",
    popover: {
      title: "¡Bienvenido a QuickSnap! 🎨",
      description:
        "Esta es una herramienta profesional para editar y anotar imágenes. Te guiaré por las funciones principales en unos segundos.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#file-upload-section",
    popover: {
      title: "Cargar Imágenes 📁",
      description:
        "Puedes subir una imagen haciendo clic aquí o simplemente pegándola con <strong>Cmd+V</strong> (o Ctrl+V en Windows).<br/><br/><strong>✨ Mágico:</strong> Al cargar una imagen, sus colores principales se extraerán automáticamente y se agregarán a tu paleta de colores.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#color-selector",
    popover: {
      title: "Selector de Colores 🎨",
      description:
        "Elige el color que quieres usar para tus anotaciones y elementos. El color se aplicará a flechas, formas, texto y más.<br/><br/><strong>✨ Tip:</strong> Cuando cargues una imagen, sus colores principales se extraerán automáticamente y se agregarán a esta paleta para que puedas usarlos en tus anotaciones.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tools-section",
    popover: {
      title: "Herramientas de Anotación ✏️",
      description:
        "Aquí encontrarás todas las herramientas: flechas, formas, texto, censura y anotaciones numeradas. Cada herramienta tiene un atajo de teclado.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#remove-bg-button",
    popover: {
      title: "Remover Fondo con IA 🤖",
      description:
        "Esta función usa inteligencia artificial para eliminar el fondo de tus imágenes automáticamente. Presiona <strong>F</strong> para activarla.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "#annotation-counter",
    popover: {
      title: "Anotaciones Numeradas 🔢",
      description:
        "Crea anotaciones numeradas secuencialmente. Perfecto para tutoriales. Presiona <strong>N</strong> para agregar una anotación.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#layers-panel",
    popover: {
      title: "Panel de Capas 📚",
      description:
        "Gestiona el orden de tus elementos con <strong>drag and drop</strong> arrastrando el ícono de agarre. También puedes usar <strong>[</strong> y <strong>]</strong> para mover capas, o <strong>Ctrl+[</strong> y <strong>Ctrl+]</strong> para enviar al fondo/traer al frente.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#background-selector",
    popover: {
      title: "Fondo del Canvas 🖼️",
      description:
        "Elige el color de fondo para tu canvas. Puedes elegir entre blanco, negro, o el color <strong>vibrant</strong> extraído automáticamente de tu imagen (si está disponible). El fondo se actualiza automáticamente cuando cargas una imagen.",
      side: "right",
      align: "center",
    },
  },
  {
    element: "#history-panel",
    popover: {
      title: "Historial de Cambios ⏱️",
      description:
        "Viaja en el tiempo! Haz clic en cualquier punto del historial para volver a ese momento. Puedes ver hasta 50 acciones pasadas. El panel puede abrirse y cerrarse según lo necesites.",
      side: "left",
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
      align: "end",
    },
  },
  {
    popover: {
      title: "¡Listo para empezar! 🚀",
      description:
        "Usa los atajos de teclado para trabajar más rápido:<br/><br/>" +
        "• <strong>T</strong> - Añadir texto<br/>" +
        "• <strong>A</strong> - Flecha<br/>" +
        "• <strong>R</strong> - Rectángulo<br/>" +
        "• <strong>C</strong> - Círculo<br/>" +
        "• <strong>B</strong> - Censurar<br/>" +
        "• <strong>N</strong> - Anotación numerada<br/>" +
        "• <strong>F</strong> - Remover fondo<br/>" +
        "• <strong>Ctrl+Z</strong> - Deshacer<br/>" +
        "• <strong>Ctrl+Shift+Z</strong> - Rehacer<br/>" +
        "• <strong>Delete</strong> - Eliminar selección",
    },
  },
];
