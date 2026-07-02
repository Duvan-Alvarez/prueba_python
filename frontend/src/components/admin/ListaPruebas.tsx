import { useEffect, useState } from 'react';
import { eliminarPrueba, obtenerPruebas } from '../../services/api';

interface PruebaRow {
  id: number;
  candidato_nombre: string;
  candidato_email: string;
  estado: string;
  iniciada_en: string | null;
  entregada_en: string | null;
  tiempo_limite_segundos: number;
}

interface ListaPruebasProps {
  onSelectPrueba: (pruebaId: number) => void;
  refresh: number;
}

export default function ListaPruebas({ onSelectPrueba, refresh }: ListaPruebasProps) {
  const [pruebas, setPruebas] = useState<PruebaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleEliminar = async (pruebaId: number) => {
    if (!window.confirm('¿Eliminar al participante y su prueba? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setLoading(true);
      await eliminarPrueba(pruebaId);
      const data = await obtenerPruebas();
      setPruebas(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al eliminar participante');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await obtenerPruebas();
        setPruebas(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar pruebas');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [refresh]);

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
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-CO');
  };

  const getEstadoBadge = (estado: string) => {
    const estilos: { [key: string]: { backgroundColor: string; color: string } } = {
      no_iniciada: { backgroundColor: '#e0e0e0', color: '#333' },
      en_progreso: { backgroundColor: '#fff3cd', color: '#856404' },
      enviada: { backgroundColor: '#d4edda', color: '#155724' },
      enviada_por_tiempo: { backgroundColor: '#d1ecf1', color: '#0c5460' },
    };

    const estilo = estilos[estado] || estilos.no_iniciada;
    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          ...estilo,
        }}
      >
        {estado.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Pruebas recibidas ({pruebas.length})</h2>

      {pruebas.length === 0 ? (
        <p style={{ color: '#666' }}>No hay pruebas aún. Crea un candidato para comenzar.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Iniciada</th>
                <th>Entregada</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {pruebas.map((prueba) => (
                <tr key={prueba.id}>
                  <td>
                    <strong>{prueba.candidato_nombre}</strong>
                  </td>
                  <td>{prueba.candidato_email}</td>
                  <td>{getEstadoBadge(prueba.estado)}</td>
                  <td style={{ fontSize: '12px' }}>{formatDate(prueba.iniciada_en)}</td>
                  <td style={{ fontSize: '12px' }}>{formatDate(prueba.entregada_en)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {prueba.estado === 'enviada' || prueba.estado === 'enviada_por_tiempo' ? (
                        <button
                          className="primary"
                          onClick={() => onSelectPrueba(prueba.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Ver y calificar
                        </button>
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>-</span>
                      )}
                      <button
                        className="secondary"
                        onClick={() => handleEliminar(prueba.id)}
                        style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white' }}
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
