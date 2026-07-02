import { ClipboardEvent, useRef } from 'react';

interface CeldaTextoProps {
  valor?: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  label?: string;
}

export default function CeldaTexto({ valor, onChange, placeholder, label }: CeldaTextoProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.length > 200) {
      // Reportar paste importante
      window.dispatchEvent(
        new CustomEvent('paste-detectado', {
          detail: { contenido: pastedText, tiempo: new Date().toISOString() },
        })
      );
    }
  };

  return (
    <div>
      {label && <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{label}</label>}
      <textarea
        ref={textareaRef}
        value={valor ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder || 'Escribe tu respuesta aquí...'}
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />
    </div>
  );
}
