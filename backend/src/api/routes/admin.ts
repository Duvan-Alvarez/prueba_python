import { Router, Request, Response } from 'express';
import { authAdminBasic } from '../middleware/auth.js';
import {
  crearCandidato,
  crearPrueba,
  obtenerTodasLasPruebas,
  obtenerPruebaPorToken,
  eliminarPruebaYCandidato,
} from '../../services/candidatoService.js';
import { obtenerRespuestasPorPrueba } from '../../services/respuestaService.js';
import { INSTRUCCIONES_GENERALES } from '../../utils/ejercicios.js';
import { sendCandidateLinkEmail } from '../../services/emailService.js';
const router = Router();

// POST /api/admin/login - Validar credenciales admin
router.post('/login', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

  if (username === adminUser && password === adminPassword) {
    return res.json({ success: true, user: username });
  }

  res.status(401).json({ error: 'Unauthorized' });
});

// POST /api/admin/candidatos - Crear nuevo candidato y prueba
router.post('/candidatos', authAdminBasic, async (req: Request, res: Response) => {
  try {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ error: 'Nombre y email requeridos' });
    }

    const candidato = crearCandidato(nombre, email);
    const prueba = crearPrueba(candidato.id);

    // Generar link único para compartir
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const linkUnico = `${frontendUrl.replace(/\/$/, '')}/prueba/${candidato.token_acceso}`;

    try {
      await sendCandidateLinkEmail(candidato.email, linkUnico);
    } catch (emailError) {
      console.error('Error enviando email de link de prueba:', emailError);
      return res.json({
        error: 'Candidato creado, pero no se pudo enviar el email con el link. Revisa la configuración SMTP.',
        candidato: {
          id: candidato.id,
          nombre: candidato.nombre,
          email: candidato.email,
          token_acceso: candidato.token_acceso,
        },
        prueba: {
          id: prueba.id,
          estado: prueba.estado,
          tiempo_limite_segundos: prueba.tiempo_limite_segundos,
        },
        link_unico: linkUnico,
        email_enviado: false,
      });
    }

    res.json({
      candidato: {
        id: candidato.id,
        nombre: candidato.nombre,
        email: candidato.email,
        token_acceso: candidato.token_acceso,
      },
      prueba: {
        id: prueba.id,
        estado: prueba.estado,
        tiempo_limite_segundos: prueba.tiempo_limite_segundos,
      },
      link_unico: linkUnico,
      email_enviado: true,
    });
  } catch (error: any) {
    console.error(error);
    if (error.message.includes('ya está registrado')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al crear candidato' });
  }
});

// GET /api/admin/pruebas - Listar todas las pruebas
router.get('/pruebas', authAdminBasic, (req: Request, res: Response) => {
  try {
    const pruebas = obtenerTodasLasPruebas();

    const resultado = pruebas.map((p) => ({
      id: p.id,
      candidato_nombre: p.candidato.nombre,
      candidato_email: p.candidato.email,
      estado: p.estado,
      iniciada_en: p.iniciada_en,
      entregada_en: p.entregada_en,
      tiempo_limite_segundos: p.tiempo_limite_segundos,
    }));

    res.json({ pruebas: resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pruebas' });
  }
});

// GET /api/admin/pruebas/:id - Obtener detalle de una prueba
router.get('/pruebas/:id', authAdminBasic, (req: Request, res: Response) => {
  try {
    const pruebaId = parseInt(req.params.id);

    // Buscar la prueba en la lista
    const pruebas = obtenerTodasLasPruebas();
    const prueba = pruebas.find((p) => p.id === pruebaId);

    if (!prueba) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    const respuestas = obtenerRespuestasPorPrueba(pruebaId);

    res.json({
      prueba: {
        id: prueba.id,
        candidato: {
          nombre: prueba.candidato.nombre,
          email: prueba.candidato.email,
          token: prueba.candidato.token_acceso,
        },
        estado: prueba.estado,
        iniciada_en: prueba.iniciada_en,
        entregada_en: prueba.entregada_en,
        tiempo_limite_segundos: prueba.tiempo_limite_segundos,
      },
      respuestas: respuestas.map((r) => ({
        ejercicio_numero: r.ejercicio_numero,
        codigo: r.codigo,
        output_ejecucion: r.output_ejecucion,
        interpretacion_texto: r.interpretacion_texto,
        actualizado_en: r.actualizado_en,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener detalle de la prueba' });
  }
});

// GET /api/admin/instrucciones - Obtener instrucciones de la prueba (para mostrar en admin)
router.get('/instrucciones', authAdminBasic, (req: Request, res: Response) => {
  try {
    res.json({
      instrucciones_generales: INSTRUCCIONES_GENERALES,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener instrucciones' });
  }
});

// DELETE /api/admin/pruebas/:id - Eliminar prueba y candidato asociado
router.delete('/pruebas/:id', authAdminBasic, (req: Request, res: Response) => {
  try {
    const pruebaId = parseInt(req.params.id);
    if (Number.isNaN(pruebaId)) {
      return res.status(400).json({ error: 'ID de prueba inválido' });
    }

    const eliminado = eliminarPruebaYCandidato(pruebaId);
    if (!eliminado) {
      return res.status(404).json({ error: 'Prueba no encontrada' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el participante' });
  }
});

export default router;
