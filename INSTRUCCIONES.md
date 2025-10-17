# Instrucciones de Ejecución

## Pasos para ejecutar el proyecto

1. **Navegar al directorio del proyecto:**

   ```bash
   cd "/Users/joseph/Desktop/repos custom/image-editor"
   ```

2. **Instalar las dependencias:**

   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**

   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   - El proyecto se ejecutará en `http://localhost:5173`
   - Se abrirá automáticamente en tu navegador predeterminado

## Funcionalidades disponibles

### ✅ Pegar imagen con Cmd+V

- Toma una captura de pantalla (Cmd+Shift+4 en Mac)
- Ve a la aplicación web
- Presiona Cmd+V para pegar la imagen

### ✅ Subir archivo

- Haz clic en "Subir Imagen"
- Selecciona una imagen desde tu computadora

### ✅ Agregar flechas

- Haz clic en "Agregar Flecha"
- Se añadirá una flecha roja que puedes mover y redimensionar

### ✅ Agregar texto

- Haz clic en "Agregar Texto"
- Escribe tu mensaje
- Presiona Enter para añadirlo al canvas

### ✅ Limpiar canvas

- Haz clic en "Limpiar" para borrar todo el contenido

### ✅ Descargar imagen

- Haz clic en "Descargar" para guardar tu imagen editada en PNG

## Notas importantes

- Las imágenes se escalan automáticamente para ajustarse al canvas
- Todos los elementos (flechas, texto) son seleccionables y editables
- La aplicación es completamente responsiva
- Funciona mejor con imágenes PNG y JPG

## Solución de problemas

Si encuentras algún error:

1. **Error de dependencias:** Ejecuta `npm install` nuevamente
2. **Error de TypeScript:** Verifica que todas las dependencias estén instaladas
3. **Error de Vite:** Intenta eliminar `node_modules` y ejecutar `npm install` de nuevo

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar construcción
npm run preview

# Linter
npm run lint
```
