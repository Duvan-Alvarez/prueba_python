import { getDatabase } from '../db/database.js';

export interface Respuesta {
  id: number;
  prueba_id: number;
  ejercicio_numero: number;
  codigo: string | null;
  output_ejecucion: string | null;
  interpretacion_texto: string | null;
  actualizado_en: string;
}

export function guardarRespuesta(
  pruebaId: number,
  ejercicioNumero: number,
  codigo: string | null,
  outputEjecucion: string | null,
  interpretacionTexto: string | null
): Respuesta {
  const db = getDatabase();
  const existing = db.data.respuestas.find(
    (r) => r.prueba_id === pruebaId && r.ejercicio_numero === ejercicioNumero
  );

  if (existing) {
    existing.codigo = codigo;
    existing.output_ejecucion = outputEjecucion;
    existing.interpretacion_texto = interpretacionTexto;
    existing.actualizado_en = new Date().toISOString();
    db.write();
    return existing;
  }

  const respuesta: Respuesta = {
    id: db.data.respuestas.length > 0 ? Math.max(...db.data.respuestas.map((r) => r.id)) + 1 : 1,
    prueba_id: pruebaId,
    ejercicio_numero: ejercicioNumero,
    codigo,
    output_ejecucion: outputEjecucion,
    interpretacion_texto: interpretacionTexto,
    actualizado_en: new Date().toISOString(),
  };

  db.data.respuestas.push(respuesta);
  db.write();
  return respuesta;
}

export function obtenerRespuesta(pruebaId: number, ejercicioNumero: number): Respuesta | null {
  const db = getDatabase();
  return (
    db.data.respuestas.find(
      (r) => r.prueba_id === pruebaId && r.ejercicio_numero === ejercicioNumero
    ) || null
  );
}

export function obtenerRespuestasPorPrueba(pruebaId: number): Respuesta[] {
  const db = getDatabase();
  return db.data.respuestas
    .filter((r) => r.prueba_id === pruebaId)
    .sort((a, b) => a.ejercicio_numero - b.ejercicio_numero);
}

export function registrarEvento(
  pruebaId: number,
  tipo: 'paste' | 'cambio_pestana',
  detalle: string
): void {
  const db = getDatabase();
  const evento = {
    id: db.data.eventos_actividad.length > 0 ? Math.max(...db.data.eventos_actividad.map((e) => e.id)) + 1 : 1,
    prueba_id: pruebaId,
    tipo,
    detalle: detalle || null,
    timestamp: new Date().toISOString(),
  };
  db.data.eventos_actividad.push(evento);
  db.write();
}

export function obtenerEventos(pruebaId: number): any[] {
  const db = getDatabase();
  return db.data.eventos_actividad
    .filter((e) => e.prueba_id === pruebaId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function obtenerResumenActividadSospechosa(pruebaId: number): {
  pastes: number;
  cambios_pestana: number;
  tiempo_fuera_total_segundos: number;
} {
  const eventos = obtenerEventos(pruebaId);

  let pastes = 0;
  let cambios = 0;
  let tiempoFuera = 0;

  eventos.forEach((e) => {
    if (e.tipo === 'paste') {
      pastes++;
    } else if (e.tipo === 'cambio_pestana') {
      cambios++;
      if (e.detalle && !isNaN(parseInt(e.detalle))) {
        tiempoFuera += parseInt(e.detalle, 10);
      }
    }
  });

  return {
    pastes,
    cambios_pestana: cambios,
    tiempo_fuera_total_segundos: tiempoFuera,
  };
}
