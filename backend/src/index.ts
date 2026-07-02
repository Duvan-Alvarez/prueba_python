import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, closeDatabase } from './db/database.js';
import candidatosRouter from './api/routes/candidatos.js';
import adminRouter from './api/routes/admin.js';
import calificacionRouter from './api/routes/calificacion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

dotenv.config({ path: envPath });
console.log(`Cargando variables de entorno desde ${envPath}`);

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ALLOWED_FRONTEND_URLS = [
  FRONTEND_URL,
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || ALLOWED_FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// Servir datasets estáticos para Pyodide
const datasetsPath = path.resolve(__dirname, '../..', 'datasets');
app.use('/datasets', express.static(datasetsPath));

// Inicializar base de datos
initializeDatabase();

// Rutas
app.use('/api/candidatos', candidatosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/calificacion', calificacionRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✓ CORS habilitado para: ${FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nCerrando servidor...');
  closeDatabase();
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

export default app;
