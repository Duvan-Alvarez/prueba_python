# 📋 Checklist de Despliegue en Railway

Use esta checklist para asegurar un despliegue exitoso en Railway.

## Pre-Deployment

- [ ] Código está en un repository de GitHub
- [ ] Todos los cambios están committed y pushed
- [ ] Variables de entorno sensibles están en `.env.example` (sin valores reales)
- [ ] `ANTHROPIC_API_KEY` está configurada
- [ ] `ADMIN_PASSWORD` es fuerte (mínimo 8 caracteres)
- [ ] Dockerfile existe en la raíz del proyecto
- [ ] `railway.json` está configurado
- [ ] No hay archivos sensibles en `.gitignore` (especialmente `.env` y `*.key`)

## Configuración de Railway

- [ ] Cuenta de Railway creada
- [ ] GitHub conectado a Railway
- [ ] Proyecto creado en Railway
- [ ] Repository seleccionado

## Variables de Entorno en Dashboard

- [ ] `NODE_ENV=production`
- [ ] `ANTHROPIC_API_KEY=sk-ant-...` (válido)
- [ ] `ADMIN_USER=admin` (o tu usuario)
- [ ] `ADMIN_PASSWORD=...` (fuerte y único)
- [ ] `DATABASE_PATH=/data/prueba_tecnica.json`
- [ ] `TEST_TIME_LIMIT=2700`
- [ ] `FRONTEND_URL=` (dejar vacío, se auto-configura)

## Volúmenes de Almacenamiento

- [ ] Volumen `/data` creado en Railway
- [ ] Ruta de montaje configurada correctamente

## Deployment

- [ ] Dockerfile build sin errores
- [ ] Logs muestran: "✓ Servidor corriendo en..."
- [ ] Health check `/health` responde con 200 OK
- [ ] Frontend carga correctamente
- [ ] Admin login funciona
- [ ] Candidato puede crear una prueba

## Post-Deployment

- [ ] Aplicación accesible vía URL de Railway
- [ ] CORS no genera errores en console
- [ ] Base de datos persiste entre restarts
- [ ] Logs se ven limpios (sin errores críticos)

## Verificación Funcional

- [ ] Panel Admin: Crear candidato ✓
- [ ] Panel Admin: Generar link ✓
- [ ] Panel Candidato: Acceder con link ✓
- [ ] Panel Candidato: Comenzar prueba ✓
- [ ] Panel Candidato: Escribir y ejecutar código ✓
- [ ] Panel Candidato: Entregar prueba ✓
- [ ] Panel Admin: Ver prueba entregada ✓
- [ ] Panel Admin: Calificar con IA ✓

## Troubleshooting

### El build falla
```
Verificar:
- Dockerfile is valid
- NODE_ENV está seteado
- Todos los archivos están en git
```

### CORS errors
```
Verificar:
- FRONTEND_URL es exacta a tu dominio de Railway
- NODE_ENV=production
- Los logs muestran qué origen fue rechazado
```

### Base de datos vacía
```
Verificar:
- Volumen /data está montado
- DATABASE_PATH=/data/prueba_tecnica.json
- Permisos de lectura/escritura en /data
```

### App se reinicia constantemente
```
Verificar:
- Logs de error con railway logs
- Que ANTHROPIC_API_KEY sea válido
- Que PORT esté disponible
- Health check status
```

## Recursos

- [Railway Docs](https://docs.railway.app/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Guía completada:** ¡Tu app está lista en Railroad! 🚀
