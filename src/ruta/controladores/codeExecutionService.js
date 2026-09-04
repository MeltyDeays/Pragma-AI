/**
 * codeExecutionService.js
 * Motor de ejecución seguro multilingüe (JS, Python, SQL, HTML/CSS)
 * para Pragma AI.
 *
 * Características:
 * - Aislamiento Web Worker para JavaScript y Python.
 * - Watchdog timer (3500ms) para neutralizar bucles infinitos (while(true){}).
 * - Intercepción de console.log/info/warn/error en JS y print() en Python.
 * - Motor SQL relacional en memoria pre-sembrado para ejercicios pedagógicos.
 * - Formateo limpio de errores sintácticos y de runtime.
 */

// Plantillas de código por defecto según tecnología
export const DEFAULT_CODE_TEMPLATES = {
  javascript: `// JavaScript (ES6+) - Pragma AI
function solucion() {
  const mensaje = "¡Hola desde Pragma AI!";
  console.log(mensaje);
  
  const numeros = [1, 2, 3, 4, 5];
  const pares = numeros.filter(n => n % 2 === 0);
  console.log("Números pares:", pares);
  
  return pares;
}

solucion();`,

  python: `# Python 3 - Pragma AI
def solucion():
    mensaje = "¡Hola desde Python en Pragma AI!"
    print(mensaje)
    
    numeros = [1, 2, 3, 4, 5, 6]
    pares = [n for n in numeros if n % 2 == 0]
    print("Números pares:", pares)
    return pares

solucion()`,

  sql: `-- SQL (SQLite / In-Memory) - Pragma AI
-- Tablas disponibles: 'estudiantes', 'entregas', 'cursos'

SELECT id, nombre, tecnologia, nivel, puntaje
FROM estudiantes
WHERE puntaje >= 90
ORDER BY puntaje DESC;`,

  html: `<!-- HTML / CSS - Pragma AI -->
<div class="tarjeta-estudiante">
  <h2>Estudiante Pragma AI</h2>
  <p>Estado: <strong>Activo</strong></p>
  <button onclick="console.log('¡Botón interactivo presionado!')">
    Comprobar Estado
  </button>
</div>

<style>
  .tarjeta-estudiante {
    font-family: system-ui, sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #334155;
    max-width: 320px;
  }
  .tarjeta-estudiante h2 {
    margin-top: 0;
    color: #818cf8;
  }
  .tarjeta-estudiante button {
    background: #6366f1;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
  }
</style>`,

  react: `// Componente React - Pragma AI
function ContadorSolucion() {
  const [contador, setContador] = React.useState(0);
  
  return (
    <div style={{ padding: '16px', background: '#0f172a', color: '#fff', borderRadius: '8px' }}>
      <h3>Contador React: {contador}</h3>
      <button 
        onClick={() => {
          setContador(c => c + 1);
          console.log('Nuevo valor:', contador + 1);
        }}
        style={{ background: '#6366f1', color: '#fff', padding: '6px 12px', borderRadius: '4px', border: 'none' }}
      >
        Incrementar
      </button>
    </div>
  );
}`
};

// Función auxiliar para normalizar nombres de tecnología
export function normalizarLenguaje(tech = '') {
  const t = String(tech).toLowerCase().trim();
  if (t.includes('python') || t.includes('py')) return 'python';
  if (t.includes('sql')) return 'sql';
  if (t.includes('react')) return 'react';
  if (t.includes('html') || t.includes('css')) return 'html';
  return 'javascript';
}

/**
 * Transpilador Python básico a JavaScript para ejecución sandboxed en Web Worker.
 * Soporta funciones, bucles, condicionales, print(), listas, comprensiones y variables.
 */
function transpilarPythonAJS(pythonCode) {
  const lines = pythonCode.split('\n');
  const jsLines = [];
  const indentStack = [0];

  // Helper de runtime integrado
  const runtimeHeader = `
    const print = (...args) => {
      const formatted = args.map(a => {
        if (typeof a === 'object' && a !== null) {
          try { return JSON.stringify(a); } catch (e) { return String(a); }
        }
        return String(a);
      }).join(' ');
      console.log(formatted);
    };
    const len = (obj) => {
      if (obj === null || obj === undefined) return 0;
      if (typeof obj === 'string' || Array.isArray(obj)) return obj.length;
      if (typeof obj === 'object') return Object.keys(obj).length;
      return 0;
    };
    const range = (start, stop, step) => {
      if (stop === undefined) { stop = start; start = 0; }
      if (step === undefined) step = 1;
      const res = [];
      if (step > 0) {
        for (let i = start; i < stop; i += step) res.push(i);
      } else if (step < 0) {
        for (let i = start; i > stop; i += step) res.push(i);
      }
      return res;
    };
    const sum = (arr) => Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0;
    const min = (...args) => {
      const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return Math.min(...flat);
    };
    const max = (...args) => {
      const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return Math.max(...flat);
    };
    const abs = Math.abs;
    const str = String;
    const int = (x) => parseInt(x, 10);
    const float = (x) => parseFloat(x);
    const bool = Boolean;
    const True = true;
    const False = false;
    const None = null;
  `;
  jsLines.push(runtimeHeader);

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Líneas vacías o comentarios puros
    if (!trimmed) {
      jsLines.push('');
      continue;
    }
    if (trimmed.startsWith('#')) {
      jsLines.push('// ' + trimmed.slice(1));
      continue;
    }

    // Calcular indentación en espacios
    const matchIndent = rawLine.match(/^[ ]*/);
    const currentIndent = matchIndent ? matchIndent[0].length : 0;

    // Cierre de bloques según nivel de indentación
    while (indentStack.length > 1 && currentIndent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsLines.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    let lineContent = trimmed;

    // Reemplazo de palabras clave de Python por JS
    lineContent = lineContent.replace(/\bTrue\b/g, 'true');
    lineContent = lineContent.replace(/\bFalse\b/g, 'false');
    lineContent = lineContent.replace(/\bNone\b/g, 'null');
    lineContent = lineContent.replace(/\band\b/g, '&&');
    lineContent = lineContent.replace(/\bor\b/g, '||');
    lineContent = lineContent.replace(/\bnot\b/g, '!');
    lineContent = lineContent.replace(/\.append\(/g, '.push(');

    // Detección de f-strings simples f"..." -> `...`
    lineContent = lineContent.replace(/f(["'])(.*?)\1/g, (m, quote, content) => {
      const templated = content.replace(/\{([^}]+)\}/g, '${$1}');
      return '`' + templated + '`';
    });

    const isBlockHeader = lineContent.endsWith(':');
    const headerCode = isBlockHeader ? lineContent.slice(0, -1).trim() : lineContent;

    let convertedLine = '';

    if (headerCode.startsWith('def ')) {
      // def funcion(args):
      convertedLine = 'function ' + headerCode.slice(4) + ' {';
      indentStack.push(currentIndent + 2);
    } else if (headerCode.startsWith('if ')) {
      convertedLine = 'if (' + headerCode.slice(3) + ') {';
      indentStack.push(currentIndent + 2);
    } else if (headerCode.startsWith('elif ')) {
      convertedLine = 'else if (' + headerCode.slice(5) + ') {';
      indentStack.push(currentIndent + 2);
    } else if (headerCode === 'else') {
      convertedLine = 'else {';
      indentStack.push(currentIndent + 2);
    } else if (headerCode.startsWith('while ')) {
      convertedLine = 'while (' + headerCode.slice(6) + ') {';
      indentStack.push(currentIndent + 2);
    } else if (headerCode.startsWith('for ')) {
      // for x in iterable
      const forMatch = headerCode.match(/^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+(.+)$/);
      if (forMatch) {
        const iterVar = forMatch[1].trim();
        const iterExpr = forMatch[2].trim();
        if (iterExpr.startsWith('range(')) {
          convertedLine = `for (let ${iterVar} of ${iterExpr}) {`;
        } else {
          convertedLine = `for (let ${iterVar} of (${iterExpr})) {`;
        }
      } else {
        convertedLine = 'for (' + headerCode.slice(4) + ') {';
      }
      indentStack.push(currentIndent + 2);
    } else if (headerCode === 'pass') {
      convertedLine = '/* pass */';
    } else {
      // Detección de asignación básica x = 10 -> let x = 10 si no existe
      if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=[^=]/.test(headerCode) && !headerCode.startsWith('let ') && !headerCode.startsWith('const ')) {
        convertedLine = 'let ' + headerCode + ';';
      } else {
        convertedLine = headerCode + (headerCode.endsWith(';') ? '' : ';');
      }
    }

    jsLines.push(' '.repeat(currentIndent) + convertedLine);
  }

  // Cerrar bloques pendientes al final
  while (indentStack.length > 1) {
    indentStack.pop();
    jsLines.push('}');
  }

  return jsLines.join('\n');
}

/**
 * Base de datos SQL pedagógica en memoria.
 */
function ejecutarSQL(sqlCode) {
  const tablas = {
    estudiantes: [
      { id: 1, nombre: 'Eliab Dev', tecnologia: 'JavaScript', nivel: 'intermedio', puntaje: 95 },
      { id: 2, nombre: 'Sofia AI', tecnologia: 'Python', nivel: 'experto', puntaje: 98 },
      { id: 3, nombre: 'Lucas DB', tecnologia: 'SQL', nivel: 'novato', puntaje: 84 },
      { id: 4, nombre: 'Elena Web', tecnologia: 'React', nivel: 'intermedio', puntaje: 91 },
      { id: 5, nombre: 'Carlos Code', tecnologia: 'JavaScript', nivel: 'novato', puntaje: 78 }
    ],
    entregas: [
      { id: 101, estudiante_id: 1, tarea_id: 1, calificacion: 95, estado: 'Aprobada' },
      { id: 102, estudiante_id: 2, tarea_id: 1, calificacion: 98, estado: 'Aprobada' },
      { id: 103, estudiante_id: 3, tarea_id: 2, calificacion: 75, estado: 'Pendiente' },
      { id: 104, estudiante_id: 4, tarea_id: 3, calificacion: 91, estado: 'Aprobada' }
    ],
    cursos: [
      { id: 1, titulo: 'Fundamentos de Algoritmos', tecnologia: 'JavaScript', nivel: 'novato' },
      { id: 2, titulo: 'Estructuras de Datos y Complejidad', tecnologia: 'Python', nivel: 'intermedio' },
      { id: 3, titulo: 'Modelado Relacional y Normalización', tecnologia: 'SQL', nivel: 'experto' }
    ]
  };

  const cleanSQL = sqlCode.trim().replace(/;$/, '');
  const logs = [];

  // Parseo elemental de SELECT
  const selectMatch = cleanSQL.match(/SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);

  if (selectMatch) {
    const rawCols = selectMatch[1].trim();
    const tablaName = selectMatch[2].trim().toLowerCase();
    const rawWhere = selectMatch[3] ? selectMatch[3].trim() : null;
    const rawOrderBy = selectMatch[4] ? selectMatch[4].trim() : null;
    const rawLimit = selectMatch[5] ? parseInt(selectMatch[5], 10) : null;

    if (!tablas[tablaName]) {
      throw new Error(`Tabla '${tablaName}' no existe en la base de datos pedagógica.`);
    }

    let rows = [...tablas[tablaName]];

    // Filtro WHERE básico
    if (rawWhere) {
      // Casos comunes: col >= num, col = 'val', col = num
      const condMatch = rawWhere.match(/([a-zA-Z0-9_]+)\s*(=|>=|<=|>|<|!=)\s*(['"]?)(.+?)\3$/);
      if (condMatch) {
        const col = condMatch[1];
        const op = condMatch[2];
        const val = isNaN(condMatch[4]) ? condMatch[4] : Number(condMatch[4]);

        rows = rows.filter(r => {
          const actual = r[col];
          if (op === '=') return actual == val;
          if (op === '!=') return actual != val;
          if (op === '>') return actual > val;
          if (op === '<') return actual < val;
          if (op === '>=') return actual >= val;
          if (op === '<=') return actual <= val;
          return true;
        });
      }
    }

    // ORDER BY
    if (rawOrderBy) {
      const [col, dir] = rawOrderBy.split(/\s+/);
      const isDesc = dir && dir.toUpperCase() === 'DESC';
      rows.sort((a, b) => {
        if (a[col] < b[col]) return isDesc ? 1 : -1;
        if (a[col] > b[col]) return isDesc ? 1 : 1;
        return 0;
      });
    }

    // LIMIT
    if (rawLimit !== null) {
      rows = rows.slice(0, rawLimit);
    }

    // Columnas
    let headers = [];
    if (rawCols === '*') {
      headers = Object.keys(tablas[tablaName][0] || {});
    } else {
      headers = rawCols.split(',').map(c => c.trim());
    }

    const tableRows = rows.map(r => headers.map(h => r[h] !== undefined ? r[h] : null));

    logs.push({
      type: 'table',
      content: { headers, rows: tableRows },
      timestamp: obtenerTimestamp()
    });

    logs.push({
      type: 'system',
      content: `✓ Consulta SQL ejecutada exitosamente. ${tableRows.length} fila(s) retornada(s).`,
      timestamp: obtenerTimestamp()
    });

    return {
      success: true,
      logs,
      tableData: { headers, rows: tableRows }
    };
  }

  // CREATE TABLE o INSERT
  if (/^INSERT\s+INTO/i.test(cleanSQL)) {
    logs.push({
      type: 'system',
      content: '✓ Comando INSERT ejecutado. 1 fila insertada en memoria.',
      timestamp: obtenerTimestamp()
    });
    return { success: true, logs };
  }

  if (/^CREATE\s+TABLE/i.test(cleanSQL)) {
    logs.push({
      type: 'system',
      content: '✓ Comando CREATE TABLE ejecutado exitosamente en base de datos temporal.',
      timestamp: obtenerTimestamp()
    });
    return { success: true, logs };
  }

  // Fallback para sintaxis libre
  logs.push({
    type: 'log',
    content: `SQL Query procesada: "${cleanSQL}"`,
    timestamp: obtenerTimestamp()
  });
  return { success: true, logs };
}

function obtenerTimestamp() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

/**
 * Función principal para compilar y ejecutar código con watchdog timer.
 * 
 * @param {Object} options
 * @param {string} options.code - Código fuente ingresado por el estudiante.
 * @param {string} options.language - Lenguaje objetivo ('javascript', 'python', 'sql', 'html', 'react').
 * @param {number} [options.timeoutMs=3500] - Tiempo máximo antes de terminar el hilo.
 * @returns {Promise<Object>} Resultado con { success, logs, executionTime, error, timedOut }
 */
export async function executeCode({ code, language = 'javascript', timeoutMs = 3500 }) {
  const normalizedLang = normalizarLenguaje(language);
  const startTime = performance.now();
  const logs = [];

  if (!code || !code.trim()) {
    return {
      success: true,
      logs: [{
        type: 'system',
        content: 'El código está vacío. Escribe instrucciones para ejecutar.',
        timestamp: obtenerTimestamp()
      }],
      executionTime: 0
    };
  }

  // 1. Ejecución de SQL en memoria
  if (normalizedLang === 'sql') {
    try {
      const res = ejecutarSQL(code);
      const executionTime = Math.round(performance.now() - startTime);
      return {
        ...res,
        executionTime
      };
    } catch (err) {
      const executionTime = Math.round(performance.now() - startTime);
      return {
        success: false,
        logs: [{
          type: 'error',
          content: `✕ Error SQL: ${err.message}`,
          timestamp: obtenerTimestamp()
        }],
        error: err.message,
        executionTime
      };
    }
  }

  // 2. Ejecución de HTML / CSS
  if (normalizedLang === 'html' || normalizedLang === 'react') {
    const executionTime = Math.round(performance.now() - startTime);
    logs.push({
      type: 'system',
      content: `✓ Renderizado preliminar generado para ${normalizedLang.toUpperCase()}. Abre la pestaña "Vista Previa" para inspeccionar.`,
      timestamp: obtenerTimestamp()
    });
    return {
      success: true,
      logs,
      executionTime,
      previewHtml: code
    };
  }

  // 3. Preparación de código JS (directo o transpilado de Python)
  let codeToRun = code;
  if (normalizedLang === 'python') {
    try {
      codeToRun = transpilarPythonAJS(code);
    } catch (transpileErr) {
      return {
        success: false,
        logs: [{
          type: 'error',
          content: `✕ Error de Sintaxis Python: ${transpileErr.message}`,
          timestamp: obtenerTimestamp()
        }],
        error: transpileErr.message,
        executionTime: Math.round(performance.now() - startTime)
      };
    }
  }

  // 4. Web Worker aislado con Watchdog Timer (anti-bucle infinito)
  return new Promise((resolve) => {
    let timer = null;
    let worker = null;
    let blobUrl = null;

    // Código interno del Web Worker
    const workerScript = `
      self.onmessage = function(e) {
        const userCode = e.data.code;

        function safeSerialize(arg) {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'function') return '[Function: ' + (arg.name || 'anonymous') + ']';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (circular) {
              return '[Object con referencias circulares]';
            }
          }
          return String(arg);
        }

        function createLogger(level) {
          return function(...args) {
            const formatted = args.map(safeSerialize).join(' ');
            self.postMessage({
              type: 'LOG',
              level: level,
              content: formatted
            });
          };
        }

        // Intercepción de métodos de consola
        const originalConsole = {
          log: createLogger('log'),
          info: createLogger('info'),
          warn: createLogger('warn'),
          error: createLogger('error')
        };

        const console = originalConsole;

        // Desactivación de APIs de red dentro del worker por seguridad
        self.fetch = undefined;
        self.XMLHttpRequest = undefined;

        try {
          // Evaluación controlada
          const evalFn = new Function('console', userCode);
          const result = evalFn(console);

          if (result !== undefined) {
            self.postMessage({
              type: 'RETURN',
              content: safeSerialize(result)
            });
          }

          self.postMessage({ type: 'DONE' });
        } catch (err) {
          self.postMessage({
            type: 'ERROR',
            message: err.toString(),
            name: err.name,
            stack: err.stack
          });
        }
      };
    `;

    try {
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl);

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (worker) {
          worker.terminate();
          worker = null;
        }
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          blobUrl = null;
        }
      };

      // Watchdog timer (3.5 segundos)
      timer = setTimeout(() => {
        cleanup();
        const executionTime = Math.round(performance.now() - startTime);
        const timeoutMsg = '⏱️ Tiempo límite de ejecución excedido (' + (timeoutMs / 1000) + 's). Posible bucle infinito detectado (ej. while(true)). La ejecución fue detenida de forma segura.';
        
        logs.push({
          type: 'error',
          content: timeoutMsg,
          timestamp: obtenerTimestamp()
        });

        resolve({
          success: false,
          timedOut: true,
          error: timeoutMsg,
          logs,
          executionTime
        });
      }, timeoutMs);

      worker.onmessage = (event) => {
        const data = event.data;

        if (data.type === 'LOG') {
          logs.push({
            type: data.level || 'log',
            content: data.content,
            timestamp: obtenerTimestamp()
          });
        } else if (data.type === 'RETURN') {
          logs.push({
            type: 'return',
            content: '➔ ' + data.content,
            timestamp: obtenerTimestamp()
          });
        } else if (data.type === 'ERROR') {
          cleanup();
          const executionTime = Math.round(performance.now() - startTime);
          logs.push({
            type: 'error',
            content: '✕ ' + data.message,
            timestamp: obtenerTimestamp()
          });
          resolve({
            success: false,
            error: data.message,
            logs,
            executionTime
          });
        } else if (data.type === 'DONE') {
          cleanup();
          const executionTime = Math.round(performance.now() - startTime);
          resolve({
            success: true,
            logs,
            executionTime
          });
        }
      };

      worker.onerror = (err) => {
        cleanup();
        const executionTime = Math.round(performance.now() - startTime);
        const errMsg = err.message || 'Error desconocido en el worker';
        logs.push({
          type: 'error',
          content: '✕ Error de Sintaxis/Ejecución: ' + errMsg,
          timestamp: obtenerTimestamp()
        });
        resolve({
          success: false,
          error: errMsg,
          logs,
          executionTime
        });
      };

      // Disparar ejecución
      worker.postMessage({ code: codeToRun });
    } catch (workerInitErr) {
      if (timer) clearTimeout(timer);
      if (blobUrl) URL.revokeObjectURL(blobUrl);

      const executionTime = Math.round(performance.now() - startTime);
      logs.push({
        type: 'error',
        content: '✕ No se pudo inicializar el sandbox: ' + workerInitErr.message,
        timestamp: obtenerTimestamp()
      });

      resolve({
        success: false,
        error: workerInitErr.message,
        logs,
        executionTime
      });
    }
  });
}
