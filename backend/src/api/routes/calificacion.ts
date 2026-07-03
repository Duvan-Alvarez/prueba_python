import { Router, Request, Response } from 'express';
import { authAdminBasic } from '../middleware/auth.js';
import {
  calificarEjercicio,
  guardarCalificaciones,
  obtenerCalificacionesPorPrueba,
  actualizarPuntajeFinal,
  calcularPuntajeTotal,
  determinaClasificacion,
} from '../../services/calificacionService.js';
import { obtenerRespuestasPorPrueba } from '../../services/respuestaService.js';
import { obtenerTodasLasPruebas } from '../../services/candidatoService.js';

const router = Router();

// POST /api/calificacion/ejercicio/:pruebaId/:numeroEjercicio - Calificar un ejercicio con IA
router.post(
  '/ejercicio/:pruebaId/:numeroEjercicio',
  authAdminBasic,
  async (req: Request, res: Response) => {
    try {
      const pruebaId = parseInt(req.params.pruebaId);
      const numeroEjercicio = parseInt(req.params.numeroEjercicio) as 1 | 2 | 3;

      if (![1, 2, 3].includes(numeroEjercicio)) {
        return res.status(400).json({ error: 'Número de ejercicio inválido' });
      }

      // Validar que la prueba existe
      const pruebas = obtenerTodasLasPruebas();
      const prueba = pruebas.find((p) => p.id === pruebaId);

      if (!prueba) {
        return res.status(404).json({ error: 'Prueba no encontrada' });
      }

      // Obtener la respuesta del candidato
      const respuestas = obtenerRespuestasPorPrueba(pruebaId);
      const respuesta = respuestas.find((r) => r.ejercicio_numero === numeroEjercicio);

      if (!respuesta) {
        return res.status(404).json({ error: 'Respuesta del ejercicio no encontrada' });
      }

      const tieneCodigo = (respuesta!.codigo || '').trim().length > 0;
      const tieneOutput = (respuesta!.output_ejecucion || '').trim().length > 0;
      const tieneInterpretacion = (respuesta!.interpretacion_texto || '').trim().length > 0;

      if (!tieneCodigo && !tieneOutput && !tieneInterpretacion) {
        return res.status(400).json({
          error: 'No hay contenido suficiente para calificar: falta código, output e interpretación de negocio.',
        });
      }

      // Llamar a la IA para calificar
      const resultado = await calificarEjercicio(
        respuesta!.codigo || '',
        respuesta!.output_ejecucion || '',
        respuesta!.interpretacion_texto || '',
        numeroEjercicio
      );

      // Guardar calificaciones en la BD
      guardarCalificaciones(pruebaId, numeroEjercicio, resultado);

      res.json({
        success: true,
        calificacion: resultado,
      });
    } catch (error: any) {
      console.error(error);
      const message = error.message || 'Error al calificar';
      const statusCode =
        message.includes('ANTHROPIC_API_KEY') || message.includes('contenido suficiente')
          ? 400
          : message.includes('Anthropic')
          ? 502
          : 500;

      res.status(statusCode).json({ error: message });
    }
  }
);

// GET /api/calificacion/prueba/:pruebaId - Obtener calificaciones de una prueba
router.get('/prueba/:pruebaId', authAdminBasic, (req: Request, res: Response) => {
  try {
    const pruebaId = parseInt(req.params.pruebaId);

    const calificaciones = obtenerCalificacionesPorPrueba(pruebaId);
    const puntajeTotal = calcularPuntajeTotal(pruebaId);
    const clasificacion = determinaClasificacion(pruebaId, puntajeTotal);

    res.json({
      calificaciones,
      puntaje_total: puntajeTotal,
      clasificacion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener calificaciones' });
  }
});

// PUT /api/calificacion/:calificacionId - Actualizar puntaje final y comentario
router.put('/:calificacionId', authAdminBasic, (req: Request, res: Response) => {
  try {
    const calificacionId = parseInt(req.params.calificacionId);
    const { puntaje_final, comentario } = req.body;

    if (typeof puntaje_final !== 'number' || puntaje_final < 0 || puntaje_final > 100) {
      return res.status(400).json({ error: 'Puntaje debe estar entre 0 y 100' });
    }

    actualizarPuntajeFinal(calificacionId, puntaje_final, comentario || null);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar puntaje' });
  }
});

export default router;
