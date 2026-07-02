export interface Prueba {
  id: number;
  estado: 'no_iniciada' | 'en_progreso' | 'enviada' | 'enviada_por_tiempo';
  iniciada_en: string | null;
  entregada_en: string | null;
  tiempo_limite_segundos: number;
}

export interface Candidato {
  nombre: string;
  email: string;
}

export interface DatosPrueba {
  prueba: Prueba;
  candidato: Candidato;
}

export interface Respuesta {
  ejercicio_numero: number;
  codigo: string | null;
  output_ejecucion: string | null;
  interpretacion_texto: string | null;
  actualizado_en: string;
}

export interface Ejercicio {
  numero: 1 | 2 | 3;
  titulo: string;
  consigna: string;
  peso: number;
  tiempo_sugerido: number;
}

export interface CalificacionPorCriterio {
  criterio: string;
  puntaje: number;
  justificacion: string;
}

export interface ResultadoCalificacion {
  puntaje_por_criterio: CalificacionPorCriterio[];
  puntaje_total_ejercicio: number;
  nivel: 'excelente' | 'bueno' | 'aceptable' | 'insuficiente';
  retroalimentacion_para_evaluador: string;
  senales_destacables: string[];
}
