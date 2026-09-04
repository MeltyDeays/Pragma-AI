import React, { useState, useEffect, useMemo } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal as TerminalIcon } from 'lucide-react';
import CodeEditor from './CodeEditor';
import ConsoleTerminal from './ConsoleTerminal';
import {
  executeCode,
  normalizarLenguaje,
  DEFAULT_CODE_TEMPLATES
} from '../controladores/codeExecutionService';
import '../estilos/compiler.css';

export default function CodeCompilerTerminal({
  codigo = '',
  onChange,
  tecnologia = 'JavaScript',
  tareaActiva,
  disabled = false
}) {
  // Detección automática del lenguaje inicial
  const detectedLang = useMemo(() => {
    const tech = tareaActiva?.tema || tecnologia || 'JavaScript';
    return normalizarLenguaje(tech);
  }, [tareaActiva, tecnologia]);

  const [language, setLanguage] = useState(detectedLang);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('ready'); // 'ready' | 'running' | 'error' | 'timeout'
  const [executionTime, setExecutionTime] = useState(null);
  const [activeTab, setActiveTab] = useState('console'); // 'console' | 'preview'
  const [previewHtml, setPreviewHtml] = useState('');
  const [copied, setCopied] = useState(false);

  // Sincronizar lenguaje si cambia la tarea activa o tecnología
  useEffect(() => {
    if (detectedLang) {
      setLanguage(detectedLang);
    }
  }, [detectedLang]);

  // Si el editor está vacío al inicio, cargar plantilla por defecto
  useEffect(() => {
    if (!codigo && DEFAULT_CODE_TEMPLATES[language] && onChange) {
      onChange(DEFAULT_CODE_TEMPLATES[language]);
    }
  }, [language]);

  const isWebTech = language === 'html' || language === 'react';

  // Manejador de Ejecución de Código con Watchdog Timer
  const handleRun = async () => {
    if (isRunning || disabled) return;

    setIsRunning(true);
    setStatus('running');

    try {
      const result = await executeCode({
        code: codigo,
        language: language,
        timeoutMs: 3500
      });

      setLogs(result.logs || []);
      setExecutionTime(result.executionTime);

      if (result.timedOut) {
        setStatus('timeout');
      } else if (!result.success) {
        setStatus('error');
      } else {
        setStatus('ready');
      }

      if (result.previewHtml) {
        setPreviewHtml(result.previewHtml);
      }
    } catch (err) {
      setStatus('error');
      setLogs((prev) => [
        ...prev,
        {
          type: 'error',
          content: `✕ Error inesperado del compilador: ${err.message}`,
          timestamp: new Date().toTimeString().split(' ')[0]
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  // Restablecer plantilla base del lenguaje
  const handleResetTemplate = () => {
    const template = DEFAULT_CODE_TEMPLATES[language] || '';
    if (onChange) {
      onChange(template);
    }
    setLogs([
      {
        type: 'system',
        content: `Plantilla base de ${language.toUpperCase()} restaurada.`,
        timestamp: new Date().toTimeString().split(' ')[0]
      }
    ]);
    setStatus('ready');
    setExecutionTime(null);
  };

  // Copiar código al portapapeles
  const handleCopyCode = async () => {
    if (!codigo) return;
    try {
      await navigator.clipboard.writeText(codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback si no hay permisos de portapapeles
      setCopied(false);
    }
  };

  // Limpiar historial de consola
  const handleClearLogs = () => {
    setLogs([]);
    setStatus('ready');
    setExecutionTime(null);
  };

  return (
    <div className="code-compiler-container">
      {/* Barra superior de control */}
      <div className="compiler-toolbar">
        <div className="compiler-toolbar-left">
          <span className="compiler-lang-badge">
            <TerminalIcon size={12} />
            {language}
          </span>

          <select
            className="compiler-lang-select"
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              if (!codigo || codigo === DEFAULT_CODE_TEMPLATES[language]) {
                if (onChange && DEFAULT_CODE_TEMPLATES[newLang]) {
                  onChange(DEFAULT_CODE_TEMPLATES[newLang]);
                }
              }
            }}
            disabled={disabled || isRunning}
            title="Seleccionar lenguaje de programación"
          >
            <option value="javascript">JavaScript (ES6+)</option>
            <option value="python">Python 3</option>
            <option value="sql">SQL (SQLite / In-Memory)</option>
            <option value="html">HTML / CSS</option>
            <option value="react">React JSX</option>
          </select>
        </div>

        <div className="compiler-toolbar-right">
          <button
            type="button"
            className="btn-compiler-secondary"
            onClick={handleResetTemplate}
            disabled={disabled || isRunning}
            title="Restablecer código a plantilla base"
          >
            <RotateCcw size={13} />
            <span>Plantilla</span>
          </button>

          <button
            type="button"
            className="btn-compiler-secondary"
            onClick={handleCopyCode}
            disabled={!codigo}
            title="Copiar código al portapapeles"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-compiler-run"
            onClick={handleRun}
            disabled={disabled || isRunning}
            title="Ejecutar código (Ctrl + Enter)"
          >
            {isRunning ? (
              <>
                <span className="compiler-spinner">⟳</span>
                <span>Ejecutando...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Ejecutar Código</span>
                <span className="compiler-shortcut-hint">Ctrl+↵</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor con resaltado de sintaxis */}
      <CodeEditor
        value={codigo}
        onChange={onChange}
        language={language}
        disabled={disabled || isRunning}
        placeholder="// Escribe o pega tu código aquí..."
        onRun={handleRun}
      />

      {/* Consola interactiva integrada */}
      <ConsoleTerminal
        logs={logs}
        status={status}
        executionTime={executionTime}
        onClear={handleClearLogs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        previewHtml={previewHtml}
        isWebTech={isWebTech}
      />
    </div>
  );
}
