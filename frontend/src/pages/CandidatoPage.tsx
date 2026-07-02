import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Bienvenida from '../components/candidato/Bienvenida';
import Cronometro from '../components/candidato/Cronometro';
import Ejercicio from '../components/candidato/Ejercicio';
import {
  obtenerDatosPrueba,
  iniciarPrueba,
  guardarRespuesta,
  entregarPrueba,
  obtenerRespuestas,
} from '../services/api';
import { initPyodide, cargarDatasets } from '../services/pyodideService';
import { DatosPrueba, Respuesta } from '../types/index';

const EJERCICIOS = [
  {
    numero: 1,
    titulo: 'Limpieza y facturación del período',
    consigna: `Recibes ventas.csv del área comercial. Antes de reportar cualquier cifra, necesitas confirmar que los datos son confiables.
1. Carga los datos y elimina duplicados exactos.
2. Estandariza la columna fecha a un único formato datetime.
3. Decide y aplica un tratamiento razonable para los valores nulos en costo_unitario (justifica tu decisión en la celda de interpretación).
4. Calcula el ingreso total (cantidad multiplicado por precio_unitario) del dataset ya limpio.`,
    peso: 0.25,
    tiempo_sugerido: 12,
  },
  {
    numero: 2,
    titulo: 'Rentabilidad por producto y segmento de cliente',
    consigna: `El CFO quiere saber qué está generando (o destruyendo) valor: productos y segmentos de cliente. Continúa trabajando sobre el dataset ya limpio del ejercicio anterior.
1. Calcula el margen (ingreso menos cantidad multiplicada por costo_unitario) y el porcentaje de margen por transacción.
2. Identifica los 3 productos más rentables y los 3 menos rentables, usando productos.csv para mostrar sus nombres.
3. Usando clientes.csv, identifica qué segmento (Retail, Corporativo o PyME) genera más margen total y más margen por cliente.
4. En la celda de interpretación, en 3-4 líneas: ¿qué acción concreta recomendarías al equipo comercial con base en estos hallazgos?`,
    peso: 0.35,
    tiempo_sugerido: 15,
  },
  {
    numero: 3,
    titulo: 'Mini reporte ejecutivo',
    consigna: `Debes enviar un resumen breve al Comité Comercial. No tienen tiempo de leer código.
1. Calcula 3 KPIs del período: ingreso total, porcentaje de margen total, y ticket promedio.
2. Construye una serie de ingreso mensual y calcula el porcentaje de crecimiento del último mes disponible respecto al mes anterior.
3. Elige una visualización que consideres más útil para el comité (por ejemplo ingreso por región, por canal, o la serie mensual) y justifica en 1 línea por qué la elegiste.
4. En la celda de interpretación, redacta un resumen ejecutivo de 4-6 líneas: desempeño general, el hallazgo más relevante, y una recomendación priorizada.`,
    peso: 0.4,
    tiempo_sugerido: 18,
  },
];

export default function CandidatoPage() {
  const { token } = useParams<{ token: string }>();
  const [estado, setEstado] = useState<'cargando' | 'bienvenida' | 'prueba' | 'entregado'>('cargando');
  const [error, setError] = useState('');
  const [datosPrueba, setDatosPrueba] = useState<DatosPrueba | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [ejercicioActual, setEjercicioActual] = useState(1);

  const storageKey = token ? `prueba-${token}-respuestas` : 'prueba-respuestas';

  const cargarRespuestasCache = (): Respuesta[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Respuesta[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const guardarRespuestasCache = (items: Respuesta[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Ignorar fallos de almacenamiento
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargar = async () => {
      try {
        if (!token) {
          setError('Token no encontrado');
          return;
        }

        const datos = await obtenerDatosPrueba(token);
        setDatosPrueba(datos);

        if (datos.prueba.estado === 'no_iniciada') {
          setEstado('bienvenida');
        } else if (datos.prueba.estado === 'en_progreso') {          await initPyodide();
          await cargarDatasets();          setEstado('prueba');
          // Calcular segundos restantes
          const iniciada = new Date(datos.prueba.iniciada_en!).getTime();
          const ahora = new Date().getTime();
          const transcurridos = Math.floor((ahora - iniciada) / 1000);
          setSegundosRestantes(Math.max(0, datos.prueba.tiempo_limite_segundos - transcurridos));

          const respuestasGuardadas = await obtenerRespuestas(token);
          const respuestasLocal = cargarRespuestasCache();

          setRespuestas(
            [1, 2, 3].map((numero) => {
              const respuestaGuardada = respuestasGuardadas.find((r) => r.ejercicio_numero === numero);
              const respuestaLocal = respuestasLocal.find((r) => r.ejercicio_numero === numero);
              return {
                ejercicio_numero: numero,
                codigo: respuestaLocal?.codigo ?? respuestaGuardada?.codigo ?? '',
                output_ejecucion: respuestaLocal?.output_ejecucion ?? respuestaGuardada?.output_ejecucion ?? '',
                interpretacion_texto: respuestaLocal?.interpretacion_texto ?? respuestaGuardada?.interpretacion_texto ?? '',
                actualizado_en: respuestaLocal?.actualizado_en ?? respuestaGuardada?.actualizado_en ?? new Date().toISOString(),
              };
            })
          );
        } else {
          setEstado('entregado');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la prueba');
      }
    };

    cargar();
  }, [token]);

  // Cronómetro
  useEffect(() => {
    if (estado !== 'prueba' || segundosRestantes <= 0) return;

    const interval = setInterval(() => {
      setSegundosRestantes((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [estado, segundosRestantes]);

  const iniciarPruebaHandler = async () => {
    try {
      if (!token) throw new Error('Token no encontrado');

      await iniciarPrueba(token);

      // Inicializar Pyodide y cargar datasets
      await initPyodide();
      await cargarDatasets();
      setEstado('prueba');
      setSegundosRestantes(datosPrueba!.prueba.tiempo_limite_segundos);
      setRespuestas(
        EJERCICIOS.map((e) => ({
          ejercicio_numero: e.numero,
          codigo: '',
          output_ejecucion: '',
          interpretacion_texto: '',
          actualizado_en: new Date().toISOString(),
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la prueba');
    }
  };

  const guardarRespuestaHandler = async (
    numeroEjercicio: number,
    codigo: string,
    output: string,
    interpretacion: string
  ) => {
    try {
      if (!token) throw new Error('Token no encontrado');

      setRespuestas((current) => {
        const existing = current.find((resp) => resp.ejercicio_numero === numeroEjercicio);
        const updatedRespuesta: Respuesta = {
          ejercicio_numero: numeroEjercicio,
          codigo,
          output_ejecucion: output,
          interpretacion_texto: interpretacion,
          actualizado_en: new Date().toISOString(),
        };

        const next = existing
          ? current.map((resp) =>
              resp.ejercicio_numero === numeroEjercicio ? updatedRespuesta : resp
            )
          : [...current, updatedRespuesta];

        guardarRespuestasCache(next);
        return next;
      });

      await guardarRespuesta(token, numeroEjercicio, codigo, output, interpretacion);
    } catch (err: any) {
      console.error('Error al guardar respuesta:', err);
    }
  };

  const entregarPruebaHandler = async () => {
    try {
      if (!token) throw new Error('Token no encontrado');

      if (!window.confirm('¿Estás seguro de que deseas entregar la prueba?')) {
        return;
      }

      await entregarPrueba(token, false);
      setEstado('entregado');
    } catch (err: any) {
      setError(err.message || 'Error al entregar la prueba');
    }
  };

  const entregarPorTiempo = async () => {
    try {
      if (!token) throw new Error('Token no encontrado');
      await entregarPrueba(token, true);
      setEstado('entregado');
    } catch (err: any) {
      console.error('Error al entregar por tiempo:', err);
    }
  };

  if (estado === 'cargando') {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (estado === 'bienvenida') {
    return (
      <Bienvenida
        nombreCandidato={datosPrueba?.candidato.nombre || 'Candidato'}
        onBegin={iniciarPruebaHandler}
        loading={false}
      />
    );
  }

  if (estado === 'entregado') {
    return (
      <div className="container" style={{ paddingTop: '40px', maxWidth: '700px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#28a745', marginBottom: '20px' }}>✓ Prueba entregada</h1>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            Tu prueba ha sido enviada exitosamente. El equipo de evaluadores revisará tu trabajo pronto.
          </p>
          <p style={{ color: '#666' }}>Gracias por tu participación.</p>
        </div>
      </div>
    );
  }

  const respuestaActual = respuestas.find((r) => r.ejercicio_numero === ejercicioActual) || {
    ejercicio_numero: ejercicioActual,
    codigo: '',
    output_ejecucion: '',
    interpretacion_texto: '',
    actualizado_en: new Date().toISOString(),
  };

  const ejercicioActualData = EJERCICIOS[ejercicioActual - 1];

  return (
    <div>
      <Cronometro
        segundosRestantes={segundosRestantes}
        tiempoLimite={datosPrueba!.prueba.tiempo_limite_segundos}
        onTiempoAgotado={entregarPorTiempo}
      />

      <div className="container" style={{ paddingRight: '230px' }}>
        {/* Navegación de ejercicios */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            {EJERCICIOS.map((e) => (
              <button
                key={e.numero}
                onClick={() => setEjercicioActual(e.numero)}
                className={ejercicioActual === e.numero ? 'primary' : 'secondary'}
                style={{
                  flex: 1,
                  padding: '12px',
                }}
              >
                Ejercicio {e.numero}
              </button>
            ))}
          </div>
        </div>

        {/* Ejercicio actual */}
        <Ejercicio
          key={ejercicioActual}
          numero={ejercicioActualData.numero as 1 | 2 | 3}
          titulo={ejercicioActualData.titulo}
          consigna={ejercicioActualData.consigna}
          codigo={respuestaActual.codigo || ''}
          outputEjecucion={respuestaActual.output_ejecucion || ''}
          interpretacion={respuestaActual.interpretacion_texto || ''}
          onCodigoChange={(codigo) =>
            guardarRespuestaHandler(
              ejercicioActual,
              codigo,
              respuestaActual.output_ejecucion || '',
              respuestaActual.interpretacion_texto || ''
            )
          }
          onOutputChange={(output) =>
            guardarRespuestaHandler(
              ejercicioActual,
              respuestaActual.codigo || '',
              output,
              respuestaActual.interpretacion_texto || ''
            )
          }
          onInterpretacionChange={(interpretacion) =>
            guardarRespuestaHandler(
              ejercicioActual,
              respuestaActual.codigo || '',
              respuestaActual.output_ejecucion || '',
              interpretacion
            )
          }
        />

        {/* Botón de entregar */}
        <div className="card" style={{ textAlign: 'center' }}>
          <button
            className="primary"
            onClick={entregarPruebaHandler}
            style={{
              padding: '14px 40px',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            ✓ Entregar prueba
          </button>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
            Al entregar, tu prueba no podrá ser editada.
          </p>
        </div>
      </div>
    </div>
  );
}
