import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface EditorCodigoProps {
  valor: string;
  onChange: (valor: string) => void;
  onPaste: (contenido: string) => void;
}

export default function EditorCodigo({ valor, onChange, onPaste }: EditorCodigoProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    editorInstance.current = monaco.editor.create(editorRef.current, {
      value: valor,
      language: 'python',
      theme: 'vs-light',
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 4,
      insertSpaces: true,
      automaticLayout: true,
    });

    editorInstance.current.onDidChangeModelContent(() => {
      const content = editorInstance.current?.getValue() || '';
      onChange(content);
    });

    // Detectar paste events
    editorInstance.current.onDidPaste(() => {
      const content = editorInstance.current?.getValue() || '';
      if (content.length > 200) {
        onPaste(content);
      }
    });

    return () => {
      editorInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorInstance.current) {
      const currentValue = editorInstance.current.getValue();
      if (currentValue !== valor) {
        editorInstance.current.setValue(valor);
      }
    }
  }, [valor]);

  return (
    <div
      ref={editorRef}
      style={{
        width: '100%',
        height: '300px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    />
  );
}
