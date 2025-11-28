import type { Step } from "react-joyride";

export const TOUR_STEPS: Step[] = [
  {
    target: "#editor-header",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          ¡Bienvenido a QuickSnap! 🎨
        </h3>
        <p className="text-gray-300">
          Esta es una herramienta profesional para editar y anotar imágenes. Te
          guiaré por las funciones principales en unos segundos.
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#file-upload-section",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Cargar Imágenes 📁
        </h3>
        <p className="text-gray-300">
          Puedes subir una imagen haciendo clic aquí o simplemente pegándola con{" "}
          <strong>Cmd+V</strong> (o Ctrl+V en Windows).
          <br />
          <br />
          <strong>✨ Mágico:</strong> Al cargar una imagen, sus colores
          principales se extraerán automáticamente y se agregarán a tu paleta de
          colores.
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#tools-section",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Herramientas de Anotación ✏️
        </h3>
        <p className="text-gray-300">
          Aquí encontrarás todas las herramientas: flechas, formas, texto,
          censura y anotaciones numeradas. Cada herramienta tiene un atajo de
          teclado para trabajar más rápido.
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "#color-selector",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Selector de Colores 🎨
        </h3>
        <p className="text-gray-300">
          Elige el color que quieres usar para tus anotaciones y elementos. El
          color se aplicará a flechas, formas, texto y más.
          <br />
          <br />
          <strong>✨ Tip:</strong> Cuando cargues una imagen, sus colores
          principales se extraerán automáticamente y se agregarán a esta paleta
          para que puedas usarlos en tus anotaciones.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "#annotation-counter",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Anotaciones Numeradas 🔢
        </h3>
        <p className="text-gray-300">
          Crea anotaciones numeradas secuencialmente. Perfecto para tutoriales y
          guías paso a paso. Presiona <strong>N</strong> para agregar una
          anotación numerada.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "#layers-panel",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Panel de Capas 📚
        </h3>
        <p className="text-gray-300">
          Gestiona el orden de tus elementos con <strong>drag and drop</strong>{" "}
          arrastrando el ícono de agarre. También puedes usar <strong>[</strong>{" "}
          y <strong>]</strong> para mover capas, o <strong>Ctrl+[</strong> y{" "}
          <strong>Ctrl+]</strong> para enviar al fondo/traer al frente.
        </p>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "#background-selector",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Fondo del Canvas 🖼️
        </h3>
        <p className="text-gray-300">
          Elige el color de fondo para tu canvas. Puedes elegir entre blanco,
          negro, o el color <strong>vibrant</strong> extraído automáticamente de
          tu imagen (si está disponible). El fondo se actualiza automáticamente
          cuando cargas una imagen.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
    disableScrolling: true,
  },
  {
    target: "#actions-section",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Exportar tu Trabajo 💾
        </h3>
        <p className="text-gray-300">
          Cuando termines, puedes copiar al portapapeles o descargar tu imagen.
          ¡También puedes limpiar todo para empezar de nuevo!
        </p>
      </div>
    ),
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "body",
    content: (
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          ¡Listo para empezar! 🚀
        </h3>
        <p className="text-gray-300">
          Usa los atajos de teclado para trabajar más rápido:
          <br />
          <br />• <strong>T</strong> - Añadir texto
          <br />• <strong>A</strong> - Flecha
          <br />• <strong>R</strong> - Rectángulo
          <br />• <strong>C</strong> - Círculo
          <br />• <strong>B</strong> - Censurar
          <br />• <strong>N</strong> - Anotación numerada
          <br />• <strong>Ctrl+Z</strong> - Deshacer
          <br />• <strong>Ctrl+Shift+Z</strong> - Rehacer
          <br />• <strong>Delete</strong> - Eliminar selección
          <br />• <strong>Rueda del mouse</strong> - Zoom in/out
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
    disableOverlayClose: true,
  },
];
