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
  const [aviso, setAviso] = useState('');
  const [linkGenerado, setLinkGenerado] = useState('');
  const [nombreGenerado, setNombreGenerado] = useState('');
  const [emailEnviado, setEmailEnviado] = useState<boolean | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setAviso('');
    setLoading(true);

    try {
      const result = await crearCandidato(nombre, email);
      setLinkGenerado(result.link_unico);
      setNombreGenerado(nombre);
      setEmailEnviado(result.email_enviado ?? null);

      if (result.email_enviado === false) {
        setAviso(
          result.warning ||
            result.error ||
            'El link fue creado, pero no se pudo enviar el correo. Puedes copiarlo y enviarlo manualmente.'
        );
      }

      setNombre('');
      setEmail('');
      onSuccess();
    } catch (err: any) {
      const data = err.response?.data;

      if (data?.link_unico) {
        setLinkGenerado(data.link_unico);
        setNombreGenerado(nombre);
        setEmailEnviado(false);
        setAviso(data.warning || data.error || 'El link fue creado, pero no se pudo enviar el correo.');
        setNombre('');
        setEmail('');
        onSuccess();
      } else {
        setError(data?.error || 'Error al crear candidato');
      }
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
      {aviso && <div className="error">{aviso}</div>}

      {linkGenerado ? (
        <div className="success">
          <h4 style={{ marginBottom: '10px' }}>Candidato creado exitosamente</h4>
          <p style={{ marginBottom: '15px' }}>
            Link unico para {nombreGenerado}
            {emailEnviado === true ? ' enviado por correo:' : ':'}
          </p>
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
              setNombreGenerado('');
              setEmailEnviado(null);
              setAviso('');
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
              placeholder="Juan Perez"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electronico</label>
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
