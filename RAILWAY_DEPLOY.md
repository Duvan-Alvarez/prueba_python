# 🚀 Despliegue en Railway

Guía completa para desplegar esta aplicación en [Railway.app](https://railway.app)

## Requisitos previos

- Cuenta en Railway.app
- Repository en GitHub
- API Key de Anthropic (para calificación automática)

## Paso 1: Preparar el repository

1. Asegurate de que todos los archivos estén en Git:
```bash
git add .
git commit -m "Preparado para despliegue en Railway"
git push
```

## Paso 2: Crear un proyecto en Railway

1. Ve a [railway.app](https://railway.app) y conecta tu cuenta de GitHub
2. Crea un nuevo proyecto haciendo clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Busca y selecciona tu repositorio

## Paso 3: Configurar las variables de entorno

En el dashboard de Railway, ve a **Variables** y configura:

### Variables requeridas:

```
ANTHROPIC_API_KEY      = sk-ant-... (obtén de https://console.anthropic.com/)
ADMIN_USER             = admin
ADMIN_PASSWORD         = tu_contraseña_segura
NODE_ENV               = production
TEST_TIME_LIMIT        = 2700
```

### Variables opcionales (Railway las asigna automáticamente):

- `PORT` - Railway asigna automáticamente (normalmente 8080)
- `DATABASE_PATH` - Usa `/data/prueba_tecnica.json` (volumen persistente de Railway)

### Variables para CORS:

- `FRONTEND_URL` - Se establece automáticamente a tu dominio de Railway (ej: `https://tu-app-name.up.railway.app`)
- `RAILWAY_PUBLIC_DOMAIN` - Se establece automáticamente por Railway

## Paso 4: Persistencia de datos

Railroad usa volúmenes para almacenamiento persistente:

1. En el dashboard, ve a **Storage**
2. Crea un nuevo volumen o usa el existente
3. Apunta a `/data` como la ruta de montaje

Esto asegura que tu base de datos SQLite (`prueba_tecnica.json`) persista entre deployments.

## Paso 5: Desplegar

1. Railway detectará automáticamente el `Dockerfile` en la raíz
2. Iniciará el build automáticamente
3. Espera a que termine (2-5 minutos generalmente)

## Verificar el despliegue

Una vez desplegado:

1. Ve a la URL asignada por Railway (visible en el dashboard)
2. Verifica que el frontend cargue correctamente
3. Prueba un candidato accediendo a `/`
4. Prueba el panel de admin en `/admin`

## Health Check

Railway automáticamente monitoreará la salud de tu app usando el endpoint `/health`. Si falla, reiniciará el contenedor automáticamente.

## Troubleshooting

### El build falla
- Verifica que el `Dockerfile` exista en la raíz
- Revisa los logs en Railway: **Deployments** → **Build Logs**

### La app falla al iniciar
- Revisa los logs: **Deployments** → **Deploy Logs**
- Verifica que `ANTHROPIC_API_KEY` esté correctamente seteada
- Comprueba que `DATABASE_PATH` sea `/data/prueba_tecnica.json`

### CORS errors
- Asegúrate de que `FRONTEND_URL` sea la URL completa de Railway
- Verifica que `NODE_ENV=production`

### Base de datos vacía después de deploy
- Verifica que el volumen esté correctamente montado en `/data`
- Revisa que `DATABASE_PATH=/data/prueba_tecnica.json`

## Base de datos inicial

Si necesitas cargar datos iniciales:

1. Crea un script en `backend/src/db/seed.ts`
2. Ejecuta en el contexto de Railway (terminal remota)
3. O modifica `initializeDatabase()` para crear datos por defecto

## Actualizar la app

Para actualizar tu app después de cambios:

1. Haz commit y push a GitHub:
```bash
git add .
git commit -m "Descripción del cambio"
git push
```

2. Railway automáticamente detectará los cambios y hará un nuevo deploy

## Monitoreo

Railway proporciona:
- **Logs en vivo** en la pestaña Logs
- **Métricas** de CPU, memoria y red
- **Alertas** configurables

## Variables adicionales recomendadas

```
LOG_LEVEL=info              # debug, info, warn, error
ENABLE_CORS_LOG=false       # Para debuggear CORS en producción
DATABASE_BACKUP_ENABLED=true # Para backups automáticos de BD
```

## Soporte

- Documentación de Railway: https://docs.railway.app/
- Issues: Crea un issue en tu repositorio de GitHub
