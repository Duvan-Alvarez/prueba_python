# Prueba Técnica - Análisis de Datos

Aplicación web completa para administrar y calificar una prueba técnica de Python dirigida a candidatos a un puesto de Analista de Datos Comerciales y Financieros.

## Características

- **Frontend interactivo**: Interfaz tipo notebook para los candidatos
- **Editor de código**: Monaco Editor con sintaxis de Python
- **Ejecución de Python**: Pyodide (WebAssembly) - 100% en el navegador del candidato
- **Backend seguro**: Node.js + Express
- **Base de datos**: SQLite
- **Calificación automática**: Integración con Claude API (Anthropic)
- **Admin panel**: Generación de links, revisión de respuestas, calificación manual

## Estructura del proyecto

```
.
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── api/               # Rutas
│   │   ├── db/                # Base de datos
│   │   ├── services/          # Lógica de negocio
│   │   ├── utils/             # Utilidades
│   │   └── index.ts           # Punto de entrada
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── services/          # Servicios (API, Pyodide)
│   │   ├── types/             # Tipos TypeScript
│   │   ├── styles/            # CSS global
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── datasets/
│   ├── generar_datos.py       # Script para generar CSVs
│   ├── ventas.csv
│   ├── clientes.csv
│   └── productos.csv
└── README.md
```

## Requisitos previos

- **Node.js**: v18 o superior
- **npm** o **yarn**
- **Python**: 3.8+ (solo para generar datasets)
- **API Key de Anthropic**: Para la calificación automática

## Instalación

### 1. Generar datasets

Los datasets ya están generados en `datasets/`. Si necesitas regenerarlos:

```bash
cd datasets
python generar_datos.py
cd ..
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env` con tus valores:

```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data.db
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_USER=admin
ADMIN_PASSWORD=password123
FRONTEND_URL=http://localhost:3000
TEST_TIME_LIMIT=2700
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

El archivo `.env` del frontend ya está configurado correctamente.

## Ejecución

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso

### Para los candidatos

1. Abrir el link único: `http://localhost:3000/prueba/{token}`
2. Hacer clic en "Comenzar" para iniciar
3. Resolver los 3 ejercicios en 45 minutos
4. El código se ejecuta en el navegador usando Pyodide
5. Hacer clic en "Entregar prueba" cuando finalice
6. La prueba se envía automáticamente si se agota el tiempo

### Para el evaluador/admin

1. Ir a `http://localhost:3000/admin`
2. Iniciar sesión (usuario: `admin`, contraseña: `password123`)
3. Crear nuevos candidatos con nombre y email
4. Copiar y compartir el link único
5. Ver la lista de pruebas entregadas
6. Hacer clic en "Ver y calificar" para revisar
7. Usar "Calificar con IA" para obtener puntuaciones automáticas
8. Editar puntajes manualmente si es necesario

## Datasets

El proyecto incluye 3 datasets CSV:

- **ventas.csv**: 2000+ transacciones con datos comerciales
- **clientes.csv**: 300 clientes con segmentación
- **productos.csv**: 40 productos con categorización

Los datos contienen inconsistencias intencionales (duplicados, valores nulos, formatos mixtos) para que los candidatos practiquen limpieza de datos.

## Ejercicios

### Ejercicio 1 (25%): Limpieza y facturación del período
- Eliminar duplicados
- Estandarizar fechas
- Tratar valores nulos en costo
- Calcular ingreso total

### Ejercicio 2 (35%): Rentabilidad por producto y segmento
- Calcular margen
- Identificar productos más/menos rentables
- Analizar por segmento de cliente
- Dar recomendaciones de negocio

### Ejercicio 3 (40%): Reporte ejecutivo
- Calcular KPIs
- Analizar tendencia mensual
- Crear visualización
- Redactar resumen ejecutivo

## Modelo de datos

### Candidatos
- id, nombre, email, token_acceso único, creado_en

### Pruebas
- id, candidato_id, estado (no_iniciada/en_progreso/enviada/enviada_por_tiempo)
- iniciada_en, entregada_en, tiempo_limite_segundos

### Respuestas
- id, prueba_id, ejercicio_numero, codigo, output_ejecucion, interpretacion_texto

### Eventos de actividad
- id, prueba_id, tipo (paste/cambio_pestana), detalle, timestamp

### Calificaciones
- id, prueba_id, ejercicio_numero, criterio, puntaje_ia, puntaje_final, comentario_evaluador

## Seguridad

- ✓ Código del candidato ejecuta SOLO en el navegador (Pyodide)
- ✓ API Key de Anthropic nunca se expone al cliente
- ✓ Tokens únicos para cada candidato
- ✓ Admin requiere autenticación básica
- ✓ CORS configurado para el frontend

## Tecnologías utilizadas

**Backend:**
- Express.js
- SQLite (better-sqlite3)
- TypeScript
- Axios (para Anthropic API)

**Frontend:**
- React 18
- TypeScript
- React Router
- Monaco Editor
- Pyodide
- Axios

**Infraestructura:**
- Vite (bundler frontend)
- Node.js runtime

## API Endpoints

### Candidato
- `GET /api/candidatos/prueba/{token}` - Obtener datos de prueba
- `POST /api/candidatos/prueba/{token}/iniciar` - Iniciar prueba
- `POST /api/candidatos/prueba/{token}/respuestas/{ejercicio}` - Guardar respuesta
- `GET /api/candidatos/prueba/{token}/respuestas` - Obtener todas las respuestas
- `POST /api/candidatos/prueba/{token}/entregar` - Entregar prueba
- `POST /api/candidatos/prueba/{token}/eventos` - Registrar eventos sospechosos

### Admin
- `POST /api/admin/login` - Iniciar sesión
- `POST /api/admin/candidatos` - Crear candidato
- `GET /api/admin/pruebas` - Listar todas las pruebas
- `GET /api/admin/pruebas/{id}` - Obtener detalle de prueba

### Calificación
- `POST /api/calificacion/ejercicio/{pruebaId}/{numeroEjercicio}` - Calificar con IA
- `GET /api/calificacion/prueba/{pruebaId}` - Obtener calificaciones
- `PUT /api/calificacion/{calificacionId}` - Actualizar puntaje final

## Variables de entorno

**Backend (`.env`):**
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data.db
ANTHROPIC_API_KEY=sk-ant-xxxxx
ADMIN_USER=admin
ADMIN_PASSWORD=password123
FRONTEND_URL=http://localhost:3000
TEST_TIME_LIMIT=2700
```

**Frontend (`.env`):**
```
VITE_API_URL=http://localhost:5000/api
```

## Notas de desarrollo

### MVP completado:
1. ✓ Flujo candidato completo con Pyodide
2. ✓ Panel admin con generación de links
3. ✓ Listado de pruebas enviadas
4. ✓ Vista de detalle y respuestas
5. ✓ Calificación automática con IA (Claude API)
6. ✓ Puntaje total ponderado

### Próximas iteraciones (no implementadas):
- Exportación a PDF con diseño
- Múltiples evaluadores con permisos
- Detección avanzada de actividad sospechosa
- Soporte multi-idioma
- Dashboard de estadísticas

## Licencia

Confidencial - Prueba técnica para proceso de selección

## Soporte

Para problemas con la instalación o ejecución, verificar:

1. Las variables de entorno están configuradas correctamente
2. Node.js y npm están instalados
3. El puerto 5000 y 3000 están disponibles
4. La API Key de Anthropic es válida
