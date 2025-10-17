# Editor de Imágenes

Una aplicación web moderna para editar imágenes con captura de pantalla, construida con Vite, React TypeScript, Tailwind CSS y shadcn/ui.

## Características

- 📸 **Pegar imágenes con Cmd+V**: Simplemente pega una captura de pantalla o imagen desde el portapapeles
- 📁 **Subir archivos**: Arrastra y suelta o selecciona imágenes desde tu computadora
- ➡️ **Agregar flechas**: Herramienta para señalar elementos importantes en la imagen
- 📝 **Agregar texto**: Añade anotaciones de texto personalizables
- 🎨 **Interfaz moderna**: Diseño limpio y responsivo con Tailwind CSS
- 💾 **Descargar**: Guarda tu imagen editada en formato PNG

## Tecnologías Utilizadas

- **Vite** - Herramienta de construcción rápida
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI modernos
- **Fabric.js** - Biblioteca de canvas para manipulación de imágenes
- **Lucide React** - Iconos SVG

## Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

## Uso

1. **Pegar imagen**: Usa `Cmd+V` (Mac) o `Ctrl+V` (Windows/Linux) para pegar una imagen desde el portapapeles
2. **Subir archivo**: Haz clic en "Subir Imagen" para seleccionar un archivo desde tu computadora
3. **Agregar flecha**: Haz clic en "Agregar Flecha" para añadir una flecha roja
4. **Agregar texto**: Haz clic en "Agregar Texto", escribe tu mensaje y presiona Enter
5. **Limpiar**: Usa "Limpiar" para borrar todo el contenido del canvas
6. **Descargar**: Haz clic en "Descargar" para guardar tu imagen editada

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/
│   │   └── button.tsx          # Componente de botón de shadcn/ui
│   └── ImageEditor.tsx         # Componente principal del editor
├── hooks/
│   └── useCanvas.ts            # Hook personalizado para manejar Fabric.js
├── lib/
│   └── utils.ts                # Utilidades de shadcn/ui
├── App.tsx                     # Componente raíz
├── main.tsx                    # Punto de entrada
└── index.css                   # Estilos globales de Tailwind
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta el linter ESLint

## Personalización

Puedes personalizar fácilmente:

- Colores de las flechas y texto en `useCanvas.ts`
- Estilos de la interfaz en `ImageEditor.tsx`
- Configuración de Tailwind en `tailwind.config.js`
