import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data.json');

export interface CandidatoRecord {
  id: number;
  nombre: string;
  email: string;
  token_acceso: string;
  creado_en: string;
}

export interface PruebaRecord {
  id: number;
  candidato_id: number;
  estado: 'no_iniciada' | 'en_progreso' | 'enviada' | 'enviada_por_tiempo';
  iniciada_en: string | null;
  entregada_en: string | null;
  tiempo_limite_segundos: number;
}

export interface RespuestaRecord {
  id: number;
  prueba_id: number;
  ejercicio_numero: number;
  codigo: string | null;
  output_ejecucion: string | null;
  interpretacion_texto: string | null;
  actualizado_en: string;
}

export interface EventoRecord {
  id: number;
  prueba_id: number;
  tipo: 'paste' | 'cambio_pestana';
  detalle: string | null;
  timestamp: string;
}

export interface CalificacionRecord {
  id: number;
  prueba_id: number;
  ejercicio_numero: number;
  criterio: string;
  puntaje_ia: number | null;
  puntaje_final: number | null;
  comentario_evaluador: string | null;
  calificado_en: string;
}

export interface DatabaseSchema {
  candidatos: CandidatoRecord[];
  pruebas: PruebaRecord[];
  respuestas: RespuestaRecord[];
  eventos_actividad: EventoRecord[];
  calificaciones: CalificacionRecord[];
}

const defaultData: DatabaseSchema = {
  candidatos: [],
  pruebas: [],
  respuestas: [],
  eventos_actividad: [],
  calificaciones: [],
};

const adapter = new JSONFileSync<DatabaseSchema>(dbPath);
const db = new LowSync<DatabaseSchema>(adapter, defaultData);

export function initializeDatabase(): void {
  db.read();

  if (!db.data) {
    db.data = defaultData;
  }

  db.write();

  console.log(`✓ Base de datos inicializada: ${dbPath}`);
}

export function getDatabase(): LowSync<DatabaseSchema> {
  if (!db.data) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db.data) {
    db.write();
    console.log('✓ Base de datos cerrada');
  }
}
