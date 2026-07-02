import axios from 'axios';
import { DatosPrueba, Respuesta } from '../types/index.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar autenticación básica al admin
export function setAdminAuth(username: string, password: string) {
  const encoded = btoa(`${username}:${password}`);
  api.defaults.headers.common['Authorization'] = `Basic ${encoded}`;
}

export function clearAdminAuth() {
  delete api.defaults.headers.common['Authorization'];
}

// ===== CANDIDATO =====

export async function obtenerDatosPrueba(token: string): Promise<DatosPrueba> {
  const res = await api.get(`/candidatos/prueba/${token}`);
  return res.data;
}

export async function iniciarPrueba(token: string): Promise<{ success: boolean }> {
  const res = await api.post(`/candidatos/prueba/${token}/iniciar`);
  return res.data;
}

export async function guardarRespuesta(
  token: string,
  numeroEjercicio: number,
  codigo: string,
  outputEjecucion: string,
  interpretacionTexto: string
): Promise<void> {
  await api.post(`/candidatos/prueba/${token}/respuestas/${numeroEjercicio}`, {
    codigo,
    output_ejecucion: outputEjecucion,
    interpretacion_texto: interpretacionTexto,
  });
}

export async function obtenerRespuestas(token: string): Promise<Respuesta[]> {
  const res = await api.get(`/candidatos/prueba/${token}/respuestas`);
  return res.data.respuestas;
}

export async function entregarPrueba(token: string, porTiempo: boolean = false): Promise<{ success: boolean }> {
  const res = await api.post(`/candidatos/prueba/${token}/entregar`, { porTiempo });
  return res.data;
}

export async function registrarEvento(
  token: string,
  tipo: 'paste' | 'cambio_pestana',
  detalle: string
): Promise<void> {
  await api.post(`/candidatos/prueba/${token}/eventos`, { tipo, detalle });
}

export async function obtenerActividadSospechosa(token: string): Promise<{
  pastes: number;
  cambios_pestana: number;
  tiempo_fuera_total_segundos: number;
}> {
  const res = await api.get(`/candidatos/prueba/${token}/actividad-sospechosa`);
  return res.data;
}

// ===== ADMIN =====

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; user: string }> {
  const res = await api.post('/admin/login', {}, {
    headers: {
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`
    }
  });
  return res.data;
}

export async function crearCandidato(
  nombre: string,
  email: string
): Promise<{ candidato: any; link_unico: string }> {
  const res = await api.post('/admin/candidatos', { nombre, email });
  return res.data;
}

export async function obtenerPruebas(): Promise<any[]> {
  const res = await api.get('/admin/pruebas');
  return res.data.pruebas;
}

export async function obtenerDetallePrueba(pruebaId: number): Promise<any> {
  const res = await api.get(`/admin/pruebas/${pruebaId}`);
  return res.data;
}

export async function eliminarPrueba(pruebaId: number): Promise<{ success: boolean }> {
  const res = await api.delete(`/admin/pruebas/${pruebaId}`);
  return res.data;
}

export async function obtenerInstrucciones(): Promise<{ instrucciones_generales: string }> {
  const res = await api.get('/admin/instrucciones');
  return res.data;
}

// ===== CALIFICACIÓN =====

export async function calificarEjercicio(
  pruebaId: number,
  numeroEjercicio: number
): Promise<any> {
  const res = await api.post(`/calificacion/ejercicio/${pruebaId}/${numeroEjercicio}`);
  return res.data;
}

export async function obtenerCalificaciones(pruebaId: number): Promise<any> {
  const res = await api.get(`/calificacion/prueba/${pruebaId}`);
  return res.data;
}

export async function actualizarPuntajeFinal(
  calificacionId: number,
  puntajeFinal: number,
  comentario: string | null
): Promise<{ success: boolean }> {
  const res = await api.put(`/calificacion/${calificacionId}`, {
    puntaje_final: puntajeFinal,
    comentario,
  });
  return res.data;
}
