import { useState } from 'react';
import { calificarEjercicio } from '../../services/api';

interface CalificadorIAProps {
  pruebaId: number;
  numeroEjercicio: number;
}

export default function CalificadorIA({ pruebaId, numeroEjercicio }: CalificadorIAProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [editando, setEditando] = useState(false);

  const handleCalificar = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await calificarEjercicio(pruebaId, numeroEjercicio);
      setResultado(data.calificacion);
    } catch (err: any) {
      const message = err?.response?.data?.error || err.message || 'Error al calificar';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!resultado) {
    return (
      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        {error && <div className="error">{error}</div>}
        <button
          className="primary"
          onClick={handleCalificar}
          disabled={loading}
        >
          {loading ? 'Calificando con IA...' : '🤖 Calificar con IA'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '4px', border: '1px solid #0066cc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4>Calificación de IA</h4>
        <span
          style={{
            padding: '6px 12px',
            backgroundColor:
              resultado.nivel === 'excelente'
                ? '#28a745'
                : resultado.nivel === 'bueno'
                ? '#0066cc'
                : resultado.nivel === 'aceptable'
                ? '#ffc107'
                : '#dc3545',
            color: 'white',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          {resultado.nivel.toUpperCase()}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0066cc', marginBottom: '5px' }}>
          {resultado.puntaje_total_ejercicio.toFixed(1)} / 100
        </div>
        <p style={{ fontSize: '12px', color: '#666' }}>Puntaje total del ejercicio</p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h5 style={{ marginBottom: '10px' }}>Puntuación por criterio</h5>
        {resultado.puntaje_por_criterio.map((item: any, idx: number) => (
          <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #ddd' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.criterio}</div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{item.justificacion}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0066cc' }}>
              {item.puntaje.toFixed(1)} puntos
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h5 style={{ marginBottom: '10px' }}>Retroalimentación</h5>
        <p style={{ fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {resultado.retroalimentacion_para_evaluador}
        </p>
      </div>

      {resultado.senales_destacables && resultado.senales_destacables.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ marginBottom: '10px' }}>Señales destacables</h5>
          <ul style={{ fontSize: '13px', paddingLeft: '20px' }}>
            {resultado.senales_destacables.map((senal: string, idx: number) => (
              <li key={idx}>{senal}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="secondary"
        onClick={() => setEditando(!editando)}
        style={{ marginTop: '10px' }}
      >
        {editando ? 'Cancelar' : 'Editar puntajes'}
      </button>

      {editando && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            Aquí puedes ajustar los puntajes sugeridos por la IA. Los cambios serán guardados automáticamente.
          </p>
          {/* En una segunda versión, implementar edición de puntajes */}
        </div>
      )}
    </div>
  );
}
