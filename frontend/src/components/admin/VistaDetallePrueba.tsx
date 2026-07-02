import { useEffect, useState } from 'react';
import { obtenerDetallePrueba } from '../../services/api';
import CalificadorIA from './CalificadorIA';

interface DetallePrueba {
  prueba: {
    id: number;
    candidato: { nombre: string; email: string; token: string };
    estado: string;
    iniciada_en: string | null;
    entregada_en: string | null;
    tiempo_limite_segundos: number;
  };
  respuestas: Array<{
    ejercicio_numero: number;
    codigo: string | null;
    output_ejecucion: string | null;
    interpretacion_texto: string | null;
    actualizado_en: string;
  }>;
}

interface VistaPruebaProps {
  pruebaId: number;
  onBack: () => void;
}

const EJERCICIOS = [
  {
    numero: 1,
    titulo: 'Limpieza y facturación del período',
  },
  {
    numero: 2,
    titulo: 'Rentabilidad por producto y segmento de cliente',
  },
  {
    numero: 3,
    titulo: 'Mini reporte ejecutivo',
  },
];

export default function VistaDetallePrueba({ pruebaId, onBack }: VistaPruebaProps) {
  const [prueba, setPrueba] = useState<DetallePrueba | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ejercicioActual, setEjercicioActual] = useState(1);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await obtenerDetallePrueba(pruebaId);
        setPrueba(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la prueba');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [pruebaId]);

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
        <button className="secondary" onClick={onBack}>
          ← Atrás
        </button>
      </div>
    );
  }

  if (!prueba) return null;

  const respuestaActual = prueba.respuestas.find((r) => r.ejercicio_numero === ejercicioActual);
  const ejercicioData = EJERCICIOS[ejercicioActual - 1];

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>{prueba.prueba.candidato.nombre}</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>{prueba.prueba.candidato.email}</p>
        </div>
        <button className="secondary" onClick={onBack}>
          ← Atrás
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Estado</div>
            <div style={{ fontWeight: 'bold' }}>{prueba.prueba.estado.replace(/_/g, ' ')}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Iniciada</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              {prueba.prueba.iniciada_en ? new Date(prueba.prueba.iniciada_en).toLocaleString('es-CO') : '-'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Entregada</div>
            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
              {prueba.prueba.entregada_en ? new Date(prueba.prueba.entregada_en).toLocaleString('es-CO') : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de ejercicios */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {EJERCICIOS.map((e) => (
          <button
            key={e.numero}
            onClick={() => setEjercicioActual(e.numero)}
            className={ejercicioActual === e.numero ? 'primary' : 'secondary'}
          >
            Ejercicio {e.numero}
          </button>
        ))}
      </div>

      {/* Respuesta actual */}
      {respuestaActual && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>Ejercicio {ejercicioActual}: {ejercicioData.titulo}</h3>

          {respuestaActual.codigo && (
            <div style={{ marginBottom: '15px' }}>
              <h4>Código</h4>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  border: '1px solid #ddd',
                }}
              >
                {respuestaActual.codigo}
              </pre>
            </div>
          )}

          {respuestaActual.output_ejecucion && (
            <div style={{ marginBottom: '15px' }}>
              <h4>Output de ejecución</h4>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  border: '1px solid #ddd',
                }}
              >
                {respuestaActual.output_ejecucion}
              </pre>
            </div>
          )}

          {respuestaActual.interpretacion_texto && (
            <div style={{ marginBottom: '15px' }}>
              <h4>Interpretación de negocio</h4>
              <div
                style={{
                  backgroundColor: '#f9f9f9',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  lineHeight: '1.6',
                }}
              >
                {respuestaActual.interpretacion_texto}
              </div>
            </div>
          )}

          <CalificadorIA
            pruebaId={pruebaId}
            numeroEjercicio={ejercicioActual}
          />
        </div>
      )}
    </div>
  );
}
