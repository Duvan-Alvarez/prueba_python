import { useEffect, useState } from 'react';

interface CronometroProps {
  segundosRestantes: number;
  tiempoLimite: number;
  onTiempoAgotado: () => void;
}

export default function Cronometro({ segundosRestantes, tiempoLimite, onTiempoAgotado }: CronometroProps) {
  const [alerta, setAlerta] = useState(false);

  useEffect(() => {
    if (segundosRestantes <= 300 && segundosRestantes > 0) {
      setAlerta(true);
    } else {
      setAlerta(false);
    }

    if (segundosRestantes === 0) {
      onTiempoAgotado();
    }
  }, [segundosRestantes, onTiempoAgotado]);

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  const porcentajeTiempo = (segundosRestantes / tiempoLimite) * 100;

  const barraColor =
    porcentajeTiempo > 50 ? '#28a745' : porcentajeTiempo > 20 ? '#ffc107' : '#dc3545';

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: '200px',
        zIndex: 100,
        border: alerta ? '2px solid #dc3545' : '2px solid #ccc',
      }}
    >
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Tiempo restante</div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: alerta ? '#dc3545' : '#333',
          fontFamily: 'monospace',
          marginBottom: '12px',
        }}
      >
        {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
      </div>

      <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            backgroundColor: barraColor,
            width: `${porcentajeTiempo}%`,
            transition: 'width 0.5s ease',
          }}
        />
      </div>

      {alerta && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#dc3545', fontWeight: 'bold' }}>
          ⚠ Menos de 5 minutos
        </div>
      )}
    </div>
  );
}
