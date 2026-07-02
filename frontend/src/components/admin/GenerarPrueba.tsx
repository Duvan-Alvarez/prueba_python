import { FormEvent, useState } from 'react';
import { crearCandidato } from '../../services/api';

interface GenerarPruebaProps {
  onSuccess: () => void;
}

export default function GenerarPrueba({ onSuccess }: GenerarPruebaProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkGenerado, setLinkGenerado] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await crearCandidato(nombre, email);
      setLinkGenerado(result.link_unico);
      setNombre('');
      setEmail('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear candidato');
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGenerado);
    alert('Link copiado al portapapeles');
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>Generar nueva prueba</h2>

      {error && <div className="error">{error}</div>}

      {linkGenerado ? (
        <div className="success">
          <h4 style={{ marginBottom: '10px' }}>Candidato creado exitosamente</h4>
          <p style={{ marginBottom: '15px' }}>Link único para {nombre}:</p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              value={linkGenerado}
              readOnly
              style={{ flex: 1, padding: '10px', fontFamily: 'monospace', fontSize: '12px' }}
            />
            <button className="primary" onClick={copiarLink}>
              Copiar
            </button>
          </div>
          <button
            className="secondary"
            onClick={() => {
              setLinkGenerado('');
              onSuccess();
            }}
          >
            Crear otra prueba
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del candidato</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="primary"
            disabled={loading || !nombre || !email}
            style={{ width: '100%' }}
          >
            {loading ? 'Generando...' : 'Generar link'}
          </button>
        </form>
      )}
    </div>
  );
}
