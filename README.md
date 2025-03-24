# Olimpo Gym - Next.js

## Descripción
Aplicación web para el gimnasio Olimpo, desarrollada con Next.js, React y TypeScript. Esta versión es una migración de la aplicación original de React a Next.js para mejorar el SEO, el rendimiento y la experiencia de usuario.

## Estructura del proyecto
- `src/app`: Páginas y rutas de la aplicación (estructura de carpetas de Next.js App Router)
- `src/components`: Componentes reutilizables
- `src/contexts`: Contextos de React, incluyendo autenticación
- `src/services`: Servicios para comunicación con la API
- `src/types`: Definiciones de tipos de TypeScript

## Características
- Página de inicio con secciones para:
  - Hero
  - Características
  - Membresías
  - Clases
  - Testimonios
  - Llamado a la acción
- Sistema de autenticación
- Panel de administración
- Panel de usuario
- Blog
- Tienda
- Responsive design

## Tecnologías utilizadas
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS
- React Hot Toast

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar en modo producción
npm run start
```

## Variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Para producción, crea un archivo `.env.production` con la URL de tu API:

```
NEXT_PUBLIC_API_URL=https://tu-api-de-produccion.com/api
```

## Despliegue en Vercel

### Preparación para el despliegue

1. **Asegúrate de que tu repositorio esté actualizado en GitHub**:
   ```bash
   git add .
   git commit -m "Preparado para despliegue en Vercel"
   git push
   ```

2. **Verifica que los siguientes archivos estén correctamente configurados**:
   - `vercel.json`: Contiene configuraciones de rutas y redirecciones
   - `next.config.js`: Incluye configuraciones para evitar problemas con dependencias específicas de Windows
   - `public/_redirects`: Maneja redirecciones para SPA

### Pasos para el despliegue

1. **Crear una cuenta en Vercel** (si aún no tienes una): [https://vercel.com/signup](https://vercel.com/signup)

2. **Importar tu repositorio de GitHub**:
   - Ve a [https://vercel.com/new](https://vercel.com/new)
   - Selecciona "Import Git Repository"
   - Elige tu repositorio de GitHub
   - Selecciona la rama `nextjs-version` (o la rama que contenga el código de Next.js)

3. **Configurar el proyecto**:
   - **Directorio raíz**: `olimpo-next` (si estás desplegando desde el repositorio principal)
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (por defecto)
   - **Output Directory**: `.next` (por defecto)

4. **Configurar variables de entorno**:
   - Haz clic en "Environment Variables"
   - Añade `NEXT_PUBLIC_API_URL` con la URL de tu API de backend
   - Ejemplo: `NEXT_PUBLIC_API_URL=https://api.olimpogym.com/api`

5. **Desplegar**:
   - Haz clic en "Deploy"
   - Espera a que se complete el despliegue

### Solución de problemas comunes

#### 1. Errores de dependencias específicas de Windows

Si encuentras errores relacionados con dependencias específicas de Windows (como `@rollup/rollup-win32-x64-msvc`), asegúrate de que:

- El archivo `next.config.js` incluya la configuración webpack que evita estas dependencias
- No haya dependencias específicas de plataforma en el `package.json`

#### 2. Errores 404 al acceder directamente a rutas

Si al acceder directamente a rutas como `/dashboard` o `/login` obtienes un error 404:

- Verifica que el archivo `vercel.json` contenga las configuraciones de rutas correctas
- Asegúrate de que el archivo `public/_redirects` exista con la regla `/* /index.html 200`

#### 3. Problemas de redirección después del inicio de sesión

Si después de iniciar sesión no se redirige correctamente:

- Verifica que en `AuthContext.tsx` se esté utilizando `window.location.href` en lugar de `router.push()` para la redirección después del login
- Asegúrate de que la función `login()` esté actualizando correctamente el estado de autenticación

#### 4. Problemas con la API

Si la aplicación no puede conectarse a la API:

- Verifica que la variable de entorno `NEXT_PUBLIC_API_URL` esté correctamente configurada en Vercel
- Asegúrate de que el backend esté desplegado y accesible desde la URL especificada
- Verifica que el CORS esté correctamente configurado en el backend para permitir solicitudes desde el dominio de Vercel

## Desarrollo local con backend

Para ejecutar la aplicación localmente con el backend:

1. Inicia el backend:
   ```bash
   cd ../back
   npm run start:dev
   ```

2. Inicia el frontend:
   ```bash
   cd ../olimpo-next
   npm run dev
   ```

O utiliza el script `start-dev.bat` en la raíz del proyecto para iniciar ambos simultáneamente.

## Más información

Para más detalles sobre la migración de React a Next.js, consulta el archivo `MIGRATION.md` en la raíz del proyecto.
# OlimpoWEB-Frontend
