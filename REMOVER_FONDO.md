# 🎨 Remover Fondo con IA - Guía de Uso

## 🚀 ¿Qué es esto?

Esta funcionalidad te permite **eliminar el fondo de cualquier imagen automáticamente** usando Inteligencia Artificial, completamente **GRATIS** y sin necesidad de conexión a servicios externos. Todo funciona en tu navegador!

## 🆓 ¿Por qué es gratis?

Usa la librería `@imgly/background-removal` que:

- ✅ Funciona 100% en el navegador (no requiere servidor)
- ✅ Sin límites de uso
- ✅ Sin API keys
- ✅ Sin costos ocultos
- ✅ Privacidad total (tus imágenes nunca salen de tu computadora)

## 📖 Cómo usar

### Opción 1: Con el mouse 🖱️

1. **Sube o pega una imagen** en el canvas
2. **Selecciona la imagen** haciendo clic sobre ella
3. **Haz clic en el botón de tijeras** ✂️ en la barra de herramientas
4. **Espera unos segundos** mientras la IA procesa la imagen
5. ¡Listo! La imagen ahora tiene el fondo transparente

### Opción 2: Con teclado ⌨️

1. **Sube o pega una imagen** en el canvas
2. **Selecciona la imagen** haciendo clic sobre ella
3. **Presiona la tecla `F`** (de "Fondo")
4. **Espera unos segundos** mientras procesa
5. ¡Listo!

## ⚡ Consejos y Trucos

### ✅ Funciona mejor con:

- Fotos de personas
- Objetos con bordes definidos
- Imágenes con buena iluminación
- Fondos simples o uniformes

### ⚠️ Puede tardar más con:

- Imágenes muy grandes (reduce el tamaño primero)
- Fondos muy complejos
- Imágenes con mucho detalle

### 💡 Tips profesionales:

1. **Primera vez**: La primera vez que uses la función puede tardar un poco más (descarga el modelo de IA)
2. **Fondo blanco vs negro**: Cambia el color de fondo del canvas para ver mejor el resultado
3. **Combina con otras herramientas**: Después de remover el fondo, puedes agregar flechas, texto, etc.
4. **Descarga con transparencia**: El formato PNG mantiene la transparencia

## 🎯 Casos de Uso

### 📸 Fotos de Perfil

Elimina el fondo de tus fotos para crear imágenes profesionales para LinkedIn, CV, etc.

### 🛍️ Productos

Crea imágenes de productos con fondo blanco para tiendas online.

### 🎨 Diseño Gráfico

Recorta elementos para crear composiciones y collages.

### 📱 Redes Sociales

Crea contenido visual atractivo sin fondos distractores.

## ⏱️ Tiempos de Procesamiento

| Tamaño de Imagen    | Tiempo Aproximado |
| ------------------- | ----------------- |
| Pequeña (< 500KB)   | 2-5 segundos      |
| Media (500KB - 2MB) | 5-10 segundos     |
| Grande (> 2MB)      | 10-30 segundos    |

_Nota: Los tiempos dependen de la potencia de tu computadora_

## ❓ Solución de Problemas

### "Por favor, selecciona una imagen primero"

➡️ Asegúrate de hacer clic en la imagen para seleccionarla antes de presionar F o el botón

### "Por favor, selecciona una imagen (no texto ni formas)"

➡️ Solo funciona con imágenes, no con texto, flechas o formas que hayas dibujado

### "Error al procesar la imagen"

➡️ Prueba con una imagen más pequeña o de menor resolución

### El botón se queda girando

➡️ La primera vez puede tardar en descargar el modelo de IA. Ten paciencia!

## 🔧 Detalles Técnicos

### Tecnología

- **Modelo de IA**: ONNX Runtime (optimizado para web)
- **Librería**: @imgly/background-removal v1.7.0
- **Procesamiento**: 100% client-side (en tu navegador)
- **Compatibilidad**: Chrome, Firefox, Safari, Edge (navegadores modernos)

### Rendimiento

- El modelo de IA se descarga solo la primera vez (~20MB)
- Después se cachea en tu navegador
- Usa WebAssembly para máxima velocidad
- Puede usar GPU si está disponible

## 🌟 Alternativas Comparadas

| Servicio     | Costo       | Límites         | Privacidad         | Velocidad         |
| ------------ | ----------- | --------------- | ------------------ | ----------------- |
| **Esta app** | ✅ Gratis   | ✅ Sin límites  | ✅ Total           | ⚡ Rápido         |
| Remove.bg    | 💰 Pago     | ❌ 50 fotos/mes | ❌ Sube a servidor | ⚡⚡ Muy rápido   |
| Photoshop    | 💰💰 Caro   | ✅ Sin límites  | ✅ Local           | ⚡⚡⚡ Muy rápido |
| Canva        | 💰 Freemium | ❌ Limitado     | ❌ En la nube      | ⚡ Regular        |

## 🎉 ¡Disfruta!

Ahora tienes una herramienta profesional de remoción de fondos totalmente gratis en tu navegador. ¡Experimenta y crea contenido increíble!

---

**¿Necesitas ayuda?** Revisa los mensajes en pantalla o consulta el README principal del proyecto.

