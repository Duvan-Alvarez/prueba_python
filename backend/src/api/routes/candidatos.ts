import { Router, Request, Response } from 'express';
import { validateCandidatoToken } from '../middleware/auth.js';
import {
  obtenerCandidatoPorToken,
  obtenerPruebaPorToken,
  actualizarEstadoPrueba,
} from '../../services/candidatoService.js';
import {
  guardarRespuesta,
  obtenerRespuestasPorPrueba,
  registrarEvento,
  obtenerResumenActividadSospechosa,
} from '../../services/respuestaService.js';

const router = Router();

// GET /api/candidatos/prueba/{token} - Obtener datos de la prueba
router.get('/prueba/:token', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const prueba = obtenerPruebaPorToken(token);

    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    res.json({
      prueba: {
        id: prueba.id,
        estado: prueba.estado,
        iniciada_en: prueba.iniciada_en,
        entregada_en: prueba.entregada_en,
        tiempo_limite_segundos: prueba.tiempo_limite_segundos,
      },
      candidato: {
        nombre: prueba.candidato.nombre,
        email: prueba.candidato.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la prueba' });
  }
});

// POST /api/candidatos/prueba/{token}/iniciar - Iniciar prueba
router.post('/prueba/:token/iniciar', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const prueba = obtenerPruebaPorToken(token);

    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    if (prueba.estado !== 'no_iniciada') {
      return res.status(400).json({ error: 'La prueba ya fue iniciada' });
    }

    actualizarEstadoPrueba(prueba.id, 'en_progreso', new Date());

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar la prueba' });
  }
});

// POST /api/candidatos/prueba/{token}/respuestas/{ejercicio} - Guardar respuesta (autosave)
router.post('/prueba/:token/respuestas/:ejercicio', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const numeroEjercicio = parseInt(req.params.ejercicio);
    const { codigo, output_ejecucion, interpretacion_texto } = req.body;

    if (![1, 2, 3].includes(numeroEjercicio)) {
      return res.status(400).json({ error: 'Número de ejercicio inválido' });
    }

    const prueba = obtenerPruebaPorToken(token);
    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    if (prueba.estado === 'enviada' || prueba.estado === 'enviada_por_tiempo') {
      return res.status(400).json({ error: 'La prueba ya fue entregada' });
    }

    const respuesta = guardarRespuesta(
      prueba.id,
      numeroEjercicio,
      codigo || null,
      output_ejecucion || null,
      interpretacion_texto || null
    );

    res.json({ success: true, respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la respuesta' });
  }
});

// GET /api/candidatos/prueba/{token}/respuestas - Obtener todas las respuestas
router.get('/prueba/:token/respuestas', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const prueba = obtenerPruebaPorToken(token);

    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    const respuestas = obtenerRespuestasPorPrueba(prueba.id);
    res.json({ respuestas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
});

// POST /api/candidatos/prueba/{token}/entregar - Entregar prueba
router.post('/prueba/:token/entregar', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const { porTiempo } = req.body;

    const prueba = obtenerPruebaPorToken(token);
    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    if (prueba.estado === 'enviada' || prueba.estado === 'enviada_por_tiempo') {
      return res.status(400).json({ error: 'La prueba ya fue entregada' });
    }

    const nuevoEstado = porTiempo ? 'enviada_por_tiempo' : 'enviada';
    actualizarEstadoPrueba(prueba.id, nuevoEstado, undefined, new Date());

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al entregar la prueba' });
  }
});

// POST /api/candidatos/prueba/{token}/eventos - Registrar evento de actividad sospechosa
router.post('/prueba/:token/eventos', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const { tipo, detalle } = req.body;

    if (!['paste', 'cambio_pestana'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de evento inválido' });
    }

    const prueba = obtenerPruebaPorToken(token);
    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    registrarEvento(prueba.id, tipo, detalle);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar evento' });
  }
});

// GET /api/candidatos/prueba/{token}/actividad-sospechosa - Obtener resumen de actividad
router.get('/prueba/:token/actividad-sospechosa', validateCandidatoToken, (req: Request, res: Response) => {
  try {
    const token = req.candidatoToken!;
    const prueba = obtenerPruebaPorToken(token);

    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    const resumen = obtenerResumenActividadSospechosa(prueba.id);
    res.json(resumen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener actividad sospechosa' });
  }
});

export default router;
