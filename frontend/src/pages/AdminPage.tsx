import { useState } from 'react';
import Login from '../components/admin/Login';
import GenerarPrueba from '../components/admin/GenerarPrueba';
import ListaPruebas from '../components/admin/ListaPruebas';
import VistaDetallePrueba from '../components/admin/VistaDetallePrueba';
import { clearAdminAuth } from '../services/api';

type View = 'dashboard' | 'detalle';

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [vista, setVista] = useState<View>('dashboard');
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLoginSuccess = () => {
    setAutenticado(true);
  };

  const handleLogout = () => {
    setAutenticado(false);
    clearAdminAuth();
  };

  const handleSelectPrueba = (pruebaId: number) => {
    setPruebaSeleccionada(pruebaId);
    setVista('detalle');
  };

  const handleBack = () => {
    setPruebaSeleccionada(null);
    setVista('dashboard');
  };

  const handleCrearCandidato = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!autenticado) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <div className="header">
        <div>
          <h1>Prueba Técnica - Panel de Evaluación</h1>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Análisis de datos comerciales y financieros</p>
        </div>
        <button className="secondary" onClick={handleLogout} style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}>
          Cerrar sesión
        </button>
      </div>

      <div className="container">
        {vista === 'dashboard' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <div>
              <GenerarPrueba onSuccess={handleCrearCandidato} />
            </div>
            <div>
              <ListaPruebas onSelectPrueba={handleSelectPrueba} refresh={refreshTrigger} />
            </div>
          </div>
        ) : (
          <>
            {pruebaSeleccionada && (
              <VistaDetallePrueba pruebaId={pruebaSeleccionada} onBack={handleBack} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
