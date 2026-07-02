import { loadPyodide, PyodideInterface } from 'pyodide';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/api$/, '') : '');

let pyodide: PyodideInterface | null = null;
let isInitializing = false;

export async function initPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;

  if (isInitializing) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (pyodide) {
          clearInterval(interval);
          resolve(pyodide);
        }
      }, 100);
      setTimeout(() => {
        if (!pyodide) {
          clearInterval(interval);
          reject(new Error('Timeout inicializando Pyodide'));
        }
      }, 30000);
    });
  }

  isInitializing = true;

  try {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    });

    await pyodide.loadPackage(['pandas', 'numpy', 'matplotlib']);

    isInitializing = false;
    return pyodide;
  } catch (error) {
    isInitializing = false;
    throw error;
  }
}

export async function cargarDatasets(): Promise<void> {
  const py = pyodide || (await initPyodide());

  const datasets = ['ventas.csv', 'clientes.csv', 'productos.csv'];
  const datasetsPath = '/datasets';

  try {
    if (!py.FS.analyzePath(datasetsPath).exists) {
      py.FS.mkdir(datasetsPath);
    }
  } catch (e: any) {
    // En algunos entornos Pyodide el error puede tener un mensaje distinto.
    if (!(e && (e.errno === 17 || e.code === 'EEXIST' || String(e).includes('exists')))) {
      throw e;
    }
  }

  for (const filename of datasets) {
    const response = await fetch(`${BACKEND_URL}/datasets/${filename}`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar el dataset ${filename}: ${response.status} ${response.statusText}`);
    }
    const content = await response.text();
    const filePath = `${datasetsPath}/${filename}`;

    try {
      py.FS.writeFile(filePath, content);
    } catch (e: any) {
      if (e && (e.errno === 17 || e.code === 'EEXIST' || String(e).includes('exists'))) {
        py.FS.unlink(filePath);
        py.FS.writeFile(filePath, content);
      } else {
        throw e;
      }
    }
  }

  // Crear subdirectorio datasets para que rutas relativas como "datasets/ventas.csv" funcionen
  try {
    if (!py.FS.analyzePath(`${datasetsPath}/datasets`).exists) {
      py.FS.mkdir(`${datasetsPath}/datasets`);
    }
  } catch (e: any) {
    if (!(e && (e.errno === 17 || e.code === 'EEXIST' || String(e).includes('exists')))) {
      throw e;
    }
  }

  await py.runPythonAsync('import os\nos.chdir("/datasets")');
}

export async function ejecutarCodigo(codigo: string): Promise<{
  stdout: string;
  stderr: string;
  hasError: boolean;
}> {
  const py = pyodide || (await initPyodide());
  let stdout = '';
  let stderr = '';

  const indentedCode = codigo
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');

  const codeToRun = `import sys\nfrom io import StringIO\n\ncaptured_output = StringIO()\noriginal_stdout = sys.stdout\noriginal_stderr = sys.stderr\nsys.stdout = captured_output\nsys.stderr = captured_output\n\ntry:\n${indentedCode}\nexcept Exception as e:\n    import traceback\n    traceback.print_exc()\nfinally:\n    sys.stdout = original_stdout\n    sys.stderr = original_stderr\n    output = captured_output.getvalue()\n`;

  try {
    await py.runPythonAsync(codeToRun);
    stdout = py.globals.get('output');
    return {
      stdout: String(stdout || ''),
      stderr: '',
      hasError: false,
    };
  } catch (error: any) {
    stderr = String(error.toString());
    return {
      stdout: String(stdout || ''),
      stderr,
      hasError: true,
    };
  }
}

export async function limpiarPyodide(): Promise<void> {
  if (pyodide) {
    try {
      await pyodide.runPythonAsync('import sys; sys.modules.clear()');
    } catch {
      // Ignorar errores de limpieza
    }
  }
}

export function isPyodideReady(): boolean {
  return pyodide !== null && !isInitializing;
}
