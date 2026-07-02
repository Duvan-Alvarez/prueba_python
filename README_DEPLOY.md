Despliegue (local con Docker)

1. Construir la imagen Docker (desde la raíz del proyecto):

```bash
docker build -t prueba-tecnica:latest .
```

2. Ejecutar el contenedor exponiendo el puerto 5000:

```bash
docker run -p 5000:5000 --env NODE_ENV=production --name prueba-app prueba-tecnica:latest
```

3. Abrir la app en el navegador:

- Candidate/admin UI: http://localhost:5000/

Notas:
- El backend sirve el frontend estático si encuentra `frontend/dist` en el árbol de la imagen.
- Para desarrollo use `npm run dev` en `frontend` y `npm run dev` en `backend`.
