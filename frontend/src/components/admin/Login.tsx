import { FormEvent, useState } from 'react';
import { loginAdmin, setAdminAuth } from '../../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAdmin(username, password);
      if (result.success) {
        setAdminAuth(username, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.response?.status === 401 ? 'Usuario o contraseña incorrectos' : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '60px', maxWidth: '400px', margin: '0 auto' }}>
      <div className="card">
        <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Prueba Técnica</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Panel de evaluación - Análisis de datos
        </p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="primary"
            disabled={loading || !username || !password}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
          <strong>Demo:</strong> usuario: <code>admin</code>, contraseña: <code>password123</code>
        </div>
      </div>
    </div>
  );
}
