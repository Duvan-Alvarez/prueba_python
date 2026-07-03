import axios from 'axios';
import { getDatabase } from '../db/database.js';
import { EJERCICIOS } from '../utils/ejercicios.js';

export interface CalificacionPorCriterio {
  criterio: string;
  puntaje: number;
  justificacion: string;
}

export interface ResultadoCalificacionEjercicio {
  puntaje_por_criterio: CalificacionPorCriterio[];
  puntaje_total_ejercicio: number;
  nivel: 'excelente' | 'bueno' | 'aceptable' | 'insuficiente';
  retroalimentacion_para_evaluador: string;
  senales_destacables: string[];
}

export interface Calificacion {
  id: number;
  prueba_id: number;
  ejercicio_numero: number;
  criterio: string;
  puntaje_ia: number | null;
  puntaje_final: number | null;
  comentario_evaluador: string | null;
  calificado_en: string;
}

export async function calificarEjercicio(
  codigoCandidato: string,
  outputEjecucion: string | null,
  interpretacionCandidato: string,
  numeroEjercicio: 1 | 2 | 3
): Promise<ResultadoCalificacionEjercicio> {
  const ejercicio = EJERCICIOS[numeroEjercicio];

  const rubricaTexto = ejercicio.rubrica
    .map((r) => `- ${r.criterio}: ${r.porcentaje}%`)
    .join('\n');

  const prompt = `Eres un evaluador EXPERTO y RIGUROSO de pruebas técnicas para analistas de datos comerciales. Tu evaluación determina si un candidato está listo para trabajar en análisis financiero y comercial real. Califica aplicando estrictamente la rúbrica, siendo exigente pero justo.

EJERCICIO #${numeroEjercicio}:
${ejercicio.consigna}

SOLUCIÓN DE REFERENCIA:
${ejercicio.solucion_referencia}

RÚBRICA PONDERADA (% del ejercicio):
${rubricaTexto}

RESPUESTA DEL CANDIDATO:
=== CÓDIGO ===
${codigoCandidato || '(SIN CÓDIGO)'}

=== OUTPUT DE EJECUCIÓN ===
${outputEjecucion || '(SIN OUTPUT)'}

=== INTERPRETACIÓN DE NEGOCIO ===
${interpretacionCandidato || '(SIN INTERPRETACIÓN)'}

INSTRUCCIONES DE EVALUACIÓN:

1. CORRECCIÓN TÉCNICA:
   - ¿El código responde a lo que pide el ejercicio?
   - ¿Los números/cálculos son correctos?
   - ¿Si hay output, es lógicamente consistente con el código?
   - La sintaxis o estilo distinto NO es penalizable si la lógica es sólida.

2. INTERPRETACIÓN DE NEGOCIO (CRITERIO CRÍTICO):
   - ¿Conecta los números con implicaciones reales de negocio?
   - ¿La recomendación es específica, priorizada y accionable?
   - ¿Responde exactamente lo que el ejercicio pide?
   - ¿Evita generalizaciones vagas? (ej: "aumentar ventas" sin decir QUÉ aumentar)
   - Una interpretación débil o genérica = puntaje bajo aunque el código sea correcto.

3. COMPLETITUD:
   - ¿Entregó TODAS las partes solicitadas del ejercicio?
   - ¿Cada paso tiene código, output E interpretación?

ASIGNACIÓN DE NIVELES:
- "excelente": Ejercicio completo, código correcto, interpretación específica y accionable (80-100)
- "bueno": Código correcto, interpretación presente pero algo genérica, o falta menor completitud (65-79)
- "aceptable": Código parcialmente correcto O interpretación débil (50-64)
- "insuficiente": Código incorrecto O interpretación muy débil O incompleto (0-49)

Responde ÚNICAMENTE JSON válido, sin explicaciones adicionales:

{
  "puntaje_por_criterio": [
    {"criterio": "nombre exacto de la rúbrica", "puntaje": number, "justificacion": "máx 2 líneas, sé específico"}
  ],
  "puntaje_total_ejercicio": number,
  "nivel": "excelente" | "bueno" | "aceptable" | "insuficiente",
  "retroalimentacion_para_evaluador": "párrafo 3-5 líneas: fortalezas reales, debilidades específicas, qué faltó",
  "senales_destacables": ["señal 1", "señal 2", "etc"]
}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no configurada');
  }

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-opus-4-8',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const content = response.data.content?.[0]?.text;
    if (typeof content !== 'string') {
      throw new Error('Respuesta inesperada de la API de Anthropic');
    }

    // Extraer JSON desde la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No se pudo extraer JSON de la respuesta de la API: ${content.slice(0, 500)}`);
    }

    const resultado: ResultadoCalificacionEjercicio = JSON.parse(jsonMatch[0]);
    return resultado;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      const status = error.response?.status;
      const details = typeof responseData === 'string' ? responseData : JSON.stringify(responseData || error.message);
      throw new Error(`Error en Anthropic [status=${status || 'unknown'}]: ${details}`);
    }
    throw error;
  }
}

export function guardarCalificaciones(
  pruebaId: number,
  ejercicioNumero: number,
  resultado: ResultadoCalificacionEjercicio
): void {
  const db = getDatabase();

  db.data.calificaciones = db.data.calificaciones.filter(
    (c) => !(c.prueba_id === pruebaId && c.ejercicio_numero === ejercicioNumero)
  );

  const nextId = db.data.calificaciones.length > 0 ? Math.max(...db.data.calificaciones.map((c) => c.id)) + 1 : 1;

  resultado.puntaje_por_criterio.forEach((item, index) => {
    db.data.calificaciones.push({
      id: nextId + index,
      prueba_id: pruebaId,
      ejercicio_numero: ejercicioNumero,
      criterio: item.criterio,
      puntaje_ia: item.puntaje,
      puntaje_final: item.puntaje,
      comentario_evaluador: null,
      calificado_en: new Date().toISOString(),
    });
  });

  db.write();
}

export function obtenerCalificacionesPorPrueba(pruebaId: number): Calificacion[] {
  const db = getDatabase();
  return db.data.calificaciones
    .filter((c) => c.prueba_id === pruebaId)
    .sort((a, b) => {
      if (a.ejercicio_numero !== b.ejercicio_numero) {
        return a.ejercicio_numero - b.ejercicio_numero;
      }
      return a.criterio.localeCompare(b.criterio);
    });
}

export function actualizarPuntajeFinal(
  calificacionId: number,
  puntajeFinal: number,
  comentario: string | null
): void {
  const db = getDatabase();
  const calificacion = db.data.calificaciones.find((c) => c.id === calificacionId);
  if (!calificacion) return;
  calificacion.puntaje_final = puntajeFinal;
  calificacion.comentario_evaluador = comentario;
  db.write();
}

export function calcularPuntajeTotal(pruebaId: number): number {
  const db = getDatabase();
  const calificaciones = db.data.calificaciones.filter(
    (c) => c.prueba_id === pruebaId && c.puntaje_final !== null
  );

  const promediosPorEjercicio: Record<number, number[]> = {};
  calificaciones.forEach((c) => {
    if (!promediosPorEjercicio[c.ejercicio_numero]) {
      promediosPorEjercicio[c.ejercicio_numero] = [];
    }
    promediosPorEjercicio[c.ejercicio_numero].push(c.puntaje_final as number);
  });

  let total = 0;
  Object.entries(promediosPorEjercicio).forEach(([ejercicioNumero, puntajes]) => {
    const numero = parseInt(ejercicioNumero, 10) as 1 | 2 | 3;
    const promedio = puntajes.reduce((sum, value) => sum + value, 0) / puntajes.length;
    const ejercicio = EJERCICIOS[numero];
    total += (promedio / 100) * ejercicio.peso * 100;
  });

  return Math.round(total * 100) / 100;
}

export function determinaClasificacion(pruebaId: number, puntajeTotal: number): string {
  const calificaciones = obtenerCalificacionesPorPrueba(pruebaId);

  let tieneInsuficiente = false;
  calificaciones.forEach((c) => {
    if (c.puntaje_final !== null && c.puntaje_final < 50) {
      tieneInsuficiente = true;
    }
  });

  if (puntajeTotal >= 80 && !tieneInsuficiente) {
    return 'Listo para el rol';
  }

  if (puntajeTotal >= 50 && tieneInsuficiente) {
    return 'No listo';
  }

  if (puntajeTotal < 50) {
    return 'No listo';
  }

  if (puntajeTotal >= 75) {
    return 'Buen técnico, débil en negocio';
  }

  return 'Buen criterio, técnica limitada';
}
