import { getDatabase } from '../db/database.js';
import { generateAccessToken } from '../utils/tokenGenerator.js';

export interface Candidato {
  id: number;
  nombre: string;
  email: string;
  token_acceso: string;
  creado_en: string;
}

export interface Prueba {
  id: number;
  candidato_id: number;
  estado: 'no_iniciada' | 'en_progreso' | 'enviada' | 'enviada_por_tiempo';
  iniciada_en: string | null;
  entregada_en: string | null;
  tiempo_limite_segundos: number;
}

function nextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

export function crearCandidato(nombre: string, email: string): Candidato {
  const db = getDatabase();
  const token = generateAccessToken();

  if (db.data.candidatos.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    throw new Error(`El email ${email} ya está registrado`);
  }

  const candidato: Candidato = {
    id: nextId(db.data.candidatos),
    nombre,
    email,
    token_acceso: token,
    creado_en: new Date().toISOString(),
  };

  db.data.candidatos.push(candidato);
  db.write();

  return candidato;
}

export function obtenerCandidatoPorToken(token: string): Candidato | null {
  const db = getDatabase();
  return db.data.candidatos.find((c) => c.token_acceso === token) || null;
}

export function crearPrueba(candidatoId: number): Prueba {
  const db = getDatabase();
  const timeLimitSeconds = parseInt(process.env.TEST_TIME_LIMIT || '2700');

  const prueba: Prueba = {
    id: nextId(db.data.pruebas),
    candidato_id: candidatoId,
    estado: 'no_iniciada',
    iniciada_en: null,
    entregada_en: null,
    tiempo_limite_segundos: timeLimitSeconds,
  };

  db.data.pruebas.push(prueba);
  db.write();

  return prueba;
}

export function obtenerPruebaPorToken(token: string): (Prueba & { candidato: Candidato }) | null {
  const db = getDatabase();
  const candidato = db.data.candidatos.find((c) => c.token_acceso === token);
  if (!candidato) return null;

  const prueba = db.data.pruebas.find((p) => p.candidato_id === candidato.id);
  if (!prueba) return null;

  return {
    ...prueba,
    candidato,
  };
}

export function obtenerPruebasPorEstado(estado: string): Prueba[] {
  const db = getDatabase();
  return db.data.pruebas.filter((p) => p.estado === estado);
}

export function actualizarEstadoPrueba(
  pruebaId: number,
  nuevoEstado: string,
  iniciada_en?: Date,
  entregada_en?: Date
): void {
  const db = getDatabase();
  const prueba = db.data.pruebas.find((p) => p.id === pruebaId);
  if (!prueba) return;

  prueba.estado = nuevoEstado as Prueba['estado'];
  if (!prueba.iniciada_en && iniciada_en) {
    prueba.iniciada_en = iniciada_en.toISOString();
  }
  if (entregada_en) {
    prueba.entregada_en = entregada_en.toISOString();
  }

  db.write();
}

export function obtenerTodasLasPruebas(): (Prueba & { candidato: Candidato })[] {
  const db = getDatabase();

  return db.data.pruebas
    .slice()
    .sort((a, b) => {
      const aTime = a.entregada_en ? new Date(a.entregada_en).getTime() : 0;
      const bTime = b.entregada_en ? new Date(b.entregada_en).getTime() : 0;
      return bTime - aTime;
    })
    .map((prueba) => ({
      ...prueba,
      candidato: db.data.candidatos.find((c) => c.id === prueba.candidato_id) as Candidato,
    }))
    .filter((item) => Boolean(item.candidato));
}

export function eliminarPruebaYCandidato(pruebaId: number): boolean {
  const db = getDatabase();
  const prueba = db.data.pruebas.find((p) => p.id === pruebaId);
  if (!prueba) return false;

  const candidatoId = prueba.candidato_id;

  db.data.pruebas = db.data.pruebas.filter((p) => p.id !== pruebaId);
  db.data.candidatos = db.data.candidatos.filter((c) => c.id !== candidatoId);
  db.data.respuestas = db.data.respuestas.filter((r) => r.prueba_id !== pruebaId);
  db.data.calificaciones = db.data.calificaciones.filter((c) => c.prueba_id !== pruebaId);
  db.data.eventos_actividad = db.data.eventos_actividad.filter((e) => e.prueba_id !== pruebaId);

  db.write();
  return true;
}
