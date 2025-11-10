# 📧 Configuración de EmailJS para Feedback

Este documento explica cómo configurar EmailJS para recibir feedback de los usuarios de QuickSnap.

## ¿Qué es EmailJS?

EmailJS es un servicio que permite enviar emails directamente desde el navegador sin necesidad de un backend. Es perfecto para aplicaciones client-side como QuickSnap.

## Pasos para Configurar

### 1. Crear una cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (el plan gratuito incluye 200 emails/mes)
3. Verifica tu email

### 2. Crear un Email Service

1. En el dashboard de EmailJS, ve a **Email Services**
2. Haz clic en **Add New Service**
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. **Guarda el Service ID** (ej: `service_abc123`)

### 3. Crear un Email Template

1. Ve a **Email Templates**
2. Haz clic en **Create New Template**
3. Usa este template como base:

```
Subject: Nuevo Feedback de QuickSnap

Hola,

Has recibido un nuevo feedback de QuickSnap:

Nombre: {{from_name}}
Email: {{from_email}}
Calificación: {{rating}}

Mensaje:
{{message}}

---
Información técnica:
- User Agent: {{user_agent}}
- Timestamp: {{timestamp}}
```

4. **Guarda el Template ID** (ej: `template_xyz789`)

### 4. Obtener tu Public Key

1. Ve a **Account** → **General**
2. Copia tu **Public Key** (ej: `abcdefghijklmnop`)

### 5. Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Agrega las siguientes variables:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

**⚠️ IMPORTANTE:**

- El prefijo `VITE_` es necesario para que Vite exponga estas variables al cliente
- **NO** subas el archivo `.env` a Git (ya debería estar en `.gitignore`)
- Para producción, configura estas variables en tu plataforma de hosting (Vercel, Netlify, etc.)

### 6. Verificar la Configuración

1. Reinicia el servidor de desarrollo (`npm run dev` o `pnpm dev`)
2. Abre QuickSnap en el navegador
3. Haz clic en el botón de feedback (ícono de mensaje en el header)
4. Envía un mensaje de prueba
5. Revisa tu email para confirmar que recibiste el feedback

## Configuración en Producción

### Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las tres variables con el prefijo `VITE_`
4. Haz redeploy

### Netlify

1. Ve a tu proyecto en Netlify
2. Site settings → Environment variables
3. Agrega las tres variables con el prefijo `VITE_`
4. Haz redeploy

### Otros Hostings

Cualquier plataforma que soporte variables de entorno debería funcionar. Solo asegúrate de:

- Usar el prefijo `VITE_` para las variables
- Reiniciar/redeployar después de agregar las variables

## Límites del Plan Gratuito

- **200 emails/mes** - Más que suficiente para feedback de usuarios
- Si necesitas más, el plan pago es muy económico ($15/mes para 1,000 emails)

## Solución de Problemas

### "EmailJS no está configurado"

- Verifica que las variables de entorno tengan el prefijo `VITE_`
- Reinicia el servidor de desarrollo
- Verifica que el archivo `.env` esté en la raíz del proyecto

### "Error al enviar el feedback"

- Verifica que el Service ID, Template ID y Public Key sean correctos
- Revisa la consola del navegador para ver el error específico
- Asegúrate de que el template tenga los campos correctos (`{{from_name}}`, `{{message}}`, etc.)

### No recibo los emails

- Revisa la carpeta de spam
- Verifica que el servicio de email esté correctamente conectado en EmailJS
- Revisa los logs en el dashboard de EmailJS

## Seguridad

- El Public Key de EmailJS es seguro de exponer en el cliente
- EmailJS tiene protección contra spam integrada
- Los emails se envían directamente desde el navegador, no pasan por tu servidor

## Alternativas

Si prefieres no usar EmailJS, puedes:

1. **Formspree** - Similar a EmailJS, también gratuito
2. **Google Forms** - Redirigir a un formulario de Google
3. **GitHub Issues** - Si el proyecto es open source, crear issues automáticamente
4. **Backend propio** - Si en el futuro decides agregar un backend
