# QuickSnap

Una aplicación web moderna para editar imágenes y capturas de pantalla al instante. Pega, anota y descarga en segundos. Construida con Vite, React TypeScript, Tailwind CSS y shadcn/ui.

## Características

- 📸 **Pegar imágenes con Cmd+V**: Simplemente pega una captura de pantalla o imagen desde el portapapeles
- 📁 **Subir archivos**: Arrastra y suelta o selecciona imágenes desde tu computadora
- ✂️ **Remover Fondo con IA**: Elimina el fondo de cualquier imagen automáticamente (100% gratis, funciona en el navegador)
- ➡️ **Agregar flechas**: Herramienta para señalar elementos importantes en la imagen
- 📝 **Agregar texto**: Añade anotaciones de texto personalizables con fuentes personalizadas
- 🔲 **Formas**: Rectángulos, círculos y anotaciones numeradas
- 👁️ **Censurar**: Efecto pixelado para ocultar información sensible
- 🎨 **Selector de colores**: 6 colores predefinidos para personalizar elementos
- 🔄 **Undo/Redo**: Deshacer y rehacer cambios (Ctrl+Z / Ctrl+Shift+Z)
- 📋 **Copiar al portapapeles**: Copia directamente al portapapeles para pegar en otras apps
- 🎨 **Interfaz moderna**: Diseño limpio y responsivo con Tailwind CSS
- 💾 **Descargar**: Guarda tu imagen editada en formato PNG

## Tecnologías Utilizadas

- **Vite** - Herramienta de construcción rápida
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **shadcn/ui** - Componentes de UI modernos
- **Fabric.js** - Biblioteca de canvas para manipulación de imágenes
- **@imgly/background-removal** - IA para remover fondos de imágenes (gratis, local)
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
3. **Remover fondo**: Selecciona una imagen y presiona `F` o haz clic en el botón de tijeras ✂️ para eliminar el fondo automáticamente con IA
4. **Agregar flecha**: Presiona `A` o haz clic en el botón para dibujar una flecha
5. **Agregar texto**: Presiona `T` o haz clic en "Agregar Texto", escribe tu mensaje y presiona Enter
6. **Formas**: Presiona `R` para rectángulo, `C` para círculo, `N` para anotación numerada
7. **Censurar**: Presiona `B` para crear un área pixelada
8. **Deshacer/Rehacer**: Usa `Ctrl+Z` para deshacer, `Ctrl+Shift+Z` para rehacer
9. **Duplicar**: Selecciona un elemento y presiona `Ctrl+D` para duplicarlo
10. **Copiar al portapapeles**: Haz clic en el botón de copiar para copiar la imagen editada
11. **Descargar**: Haz clic en "Descargar" para guardar tu imagen editada en PNG

### 🎯 Atajos de Teclado

- `Cmd+V` / `Ctrl+V` - Pegar imagen
- `F` - Remover fondo de imagen seleccionada
- `A` - Agregar flecha
- `R` - Agregar rectángulo
- `C` - Agregar círculo
- `B` - Agregar área censurada (blur)
- `N` - Agregar anotación numerada
- `T` - Agregar texto
- `Ctrl+Z` / `Cmd+Z` - Deshacer
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Rehacer
- `Ctrl+D` / `Cmd+D` - Duplicar elemento seleccionado
- `Delete` / `Backspace` - Eliminar elemento seleccionado

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
