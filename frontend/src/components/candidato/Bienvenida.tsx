interface BienvenidaProps {
  nombreCandidato: string;
  onBegin: () => void;
  loading: boolean;
}

export default function Bienvenida({ nombreCandidato, onBegin, loading }: BienvenidaProps) {
  const instrucciones = `Esta prueba consta de 3 ejercicios de análisis de datos con Python y pandas, diseñada para completarse en 45 minutos. Trabajarás sobre tres datasets ya cargados: ventas.csv, clientes.csv y productos.csv. Puedes usar documentación oficial de pandas, pero no está permitido el uso de asistentes de inteligencia artificial generativa (ChatGPT, Copilot, Claude u otros) durante la prueba. En cada ejercicio, la interpretación de negocio que escribas en la celda de texto tiene tanto o más peso que el código: se evalúa tu capacidad de traducir datos en decisiones, no solo tu dominio de sintaxis. El cronómetro iniciará al presionar 'Comenzar' y tu trabajo se enviará automáticamente al agotarse el tiempo.`;

  return (
    <div className="container" style={{ paddingTop: '40px', maxWidth: '700px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '10px' }}>Bienvenido, {nombreCandidato}</h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
          Prueba Técnica: Análisis de Datos Comerciales y Financieros
        </p>

        <div style={{ backgroundColor: '#f0f7ff', padding: '20px', borderRadius: '4px', marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Instrucciones</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '14px' }}>
            {instrucciones}
          </p>
        </div>

        <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '4px', marginBottom: '30px', borderLeft: '4px solid #ffc107' }}>
          <strong>⏱ Duración: 45 minutos</strong>
          <p style={{ marginTop: '5px', fontSize: '14px' }}>El tiempo comenzará cuando hagas clic en "Comenzar".</p>
        </div>

        <button
          className="primary"
          onClick={onBegin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Iniciando...' : 'Comenzar'}
        </button>
      </div>
    </div>
  );
}
