# 🚀 Guía Rápida: Railway en 5 pasos

## 1️⃣ Preparar GitHub
```bash
git add .
git commit -m "Preparado para Railway"
git push
```

## 2️⃣ Ir a Railway.app
- [railway.app](https://railway.app) → **New Project**
- Conectar GitHub
- Seleccionar este repositorio

## 3️⃣ Configurar Variables (Dashboard → Variables)
```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxx
ADMIN_USER = admin
ADMIN_PASSWORD = tu_contraseña_fuerte
NODE_ENV = production
DATABASE_PATH = /data/prueba_tecnica.json
TEST_TIME_LIMIT = 2700
```

## 4️⃣ Crear Volumen (Dashboard → Storage)
- **New Volume**
- Name: `data`
- Mount path: `/data`

## 5️⃣ Deploy
- Railway detecta el Dockerfile automáticamente
- Espera 2-5 minutos
- ¡Listo! Tu app está en vivo 🎉

---

## URLs Importantes
- **Dashboard**: [Railway](https://railway.app/dashboard)
- **Documentación**: [Railway Docs](https://docs.railway.app)
- **Apoyo**: [Guía de Despliegue](./RAILWAY_DEPLOY.md)
- **Checklist**: [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

## Acceder a tu App
- Frontend: `https://tu-dominio.up.railway.app`
- Admin: `https://tu-dominio.up.railway.app/admin`
- Health: `https://tu-dominio.up.railway.app/health`

---

**¿Necesitas ayuda?** Ver [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) para troubleshooting.
