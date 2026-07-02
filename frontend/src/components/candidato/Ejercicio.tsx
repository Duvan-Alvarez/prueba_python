import { useState } from 'react';
import EditorCodigo from './EditorCodigo';
import CeldaTexto from './CeldaTexto';
import { ejecutarCodigo } from '../../services/pyodideService';

interface EjercicioProps {
  numero: 1 | 2 | 3;
  titulo: string;
  consigna: string;
  codigo: string;
  outputEjecucion: string;
  interpretacion: string;
  onCodigoChange: (codigo: string) => void;
  onOutputChange: (output: string) => void;
  onInterpretacionChange: (interpretacion: string) => void;
}

export default function Ejercicio({
  numero,
  titulo,
  consigna,
  codigo,
  outputEjecucion,
  interpretacion,
  onCodigoChange,
  onOutputChange,
  onInterpretacionChange,
}: EjercicioProps) {
  const [ejecutando, setEjecutando] = useState(false);

  const handleEjecutar = async () => {
    setEjecutando(true);
    try {
      const resultado = await ejecutarCodigo(codigo);
      const output = resultado.hasError
        ? `ERROR:\n${resultado.stderr}`
        : `${resultado.stdout || '(sin salida)'}`;
      onOutputChange(output);
    } catch (error: any) {
      onOutputChange(`ERROR: ${error.message}`);
    } finally {
      setEjecutando(false);
    }
  };

  const handlePaste = (contenido: string) => {
    window.dispatchEvent(
      new CustomEvent('paste-detectado', {
        detail: { contenido, tiempo: new Date().toISOString(), ejercicio: numero },
      })
    );
  };

  return (
    <div className="card" style={{ marginBottom: '30px' }}>
      <h2 style={{ marginBottom: '10px' }}>Ejercicio {numero}: {titulo}</h2>

      <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Consigna</h4>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>
          {consigna}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Código Python</h4>
        <EditorCodigo
          valor={codigo}
          onChange={onCodigoChange}
          onPaste={handlePaste}
        />
        <button
          className="primary"
          onClick={handleEjecutar}
          disabled={ejecutando || !codigo.trim()}
          style={{ marginTop: '10px' }}
        >
          {ejecutando ? 'Ejecutando...' : '▶ Ejecutar'}
        </button>
      </div>

      {outputEjecucion && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Resultado de ejecución</h4>
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
            }}
          >
            {outputEjecucion}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Interpretación de negocio</h4>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
          Esta es la parte más importante. Explica qué significan los resultados en términos de negocio.
        </p>
        <CeldaTexto
          valor={interpretacion}
          onChange={onInterpretacionChange}
          placeholder="Escribe tu interpretación aquí: qué significan los datos, qué decisiones sugieren, etc."
          label=""
        />
      </div>
    </div>
  );
}
