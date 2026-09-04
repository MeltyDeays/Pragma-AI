import React, { useRef, useEffect } from 'react';
import { Terminal, Trash2, Eye, Code, Clock, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function ConsoleTerminal({
  logs = [],
  status = 'ready',
  executionTime = null,
  onClear,
  activeTab = 'console',
  setActiveTab,
  previewHtml = '',
  isWebTech = false
}) {
  const consoleBodyRef = useRef(null);

  // Auto-scroll al final cada vez que llegan nuevos registros
  useEffect(() => {
    if (consoleBodyRef.current && activeTab === 'console') {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  return (
    <div className="console-terminal-container">
      {/* Cabecera de la Consola */}
      <div className="console-terminal-header">
        <div className="console-status-group">
          <div className="console-title">
            <Terminal size={14} className="text-indigo-400" />
            <span>Terminal de Salida</span>
          </div>

          {/* Pill de Estado */}
          {status === 'running' && (
            <span className="console-status-pill running">
              <span className="compiler-spinner">⟳</span> Ejecutando...
            </span>
          )}
          {status === 'ready' && (
            <span className="console-status-pill ready">
              <CheckCircle2 size={11} /> Listo
            </span>
          )}
          {status === 'error' && (
            <span className="console-status-pill error">
              <AlertCircle size={11} /> Error
            </span>
          )}
          {status === 'timeout' && (
            <span className="console-status-pill timeout">
              <AlertTriangle size={11} /> Timeout
            </span>
          )}

          {/* Métrica de tiempo de ejecución */}
          {executionTime !== null && executionTime !== undefined && (
            <span className="console-time-metric flex items-center gap-1 text-[11px]">
              <Clock size={11} /> {executionTime} ms
            </span>
          )}
        </div>

        {/* Acciones de Consola y Pestañas */}
        <div className="console-actions-group">
          {isWebTech && setActiveTab && (
            <div className="flex gap-1 mr-2">
              <button
                type="button"
                className={`btn-compiler-secondary text-[11px] py-1 px-2.5 ${activeTab === 'console' ? 'active' : ''}`}
                onClick={() => setActiveTab('console')}
              >
                <Code size={12} /> Consola
              </button>
              <button
                type="button"
                className={`btn-compiler-secondary text-[11px] py-1 px-2.5 ${activeTab === 'preview' ? 'active' : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                <Eye size={12} /> Vista Previa
              </button>
            </div>
          )}

          {onClear && (
            <button
              type="button"
              className="btn-console-icon"
              onClick={onClear}
              title="Limpiar consola"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo de la Consola o Vista Previa */}
      {isWebTech && activeTab === 'preview' ? (
        <div className="p-3 bg-slate-950">
          <iframe
            className="console-preview-iframe"
            srcDoc={previewHtml}
            sandbox="allow-scripts"
            title="Vista Previa de Código"
          />
        </div>
      ) : (
        <div className="console-body" ref={consoleBodyRef}>
          {logs.length === 0 ? (
            <div className="console-empty-state">
              <Terminal size={24} className="opacity-40 mb-1 text-slate-600" />
              <span>Consola lista. Presiona "Ejecutar Código" (Ctrl + Enter) para ver la salida en tiempo real.</span>
            </div>
          ) : (
            logs.map((log, index) => {
              if (log.type === 'table' && log.content && log.content.headers) {
                return (
                  <div key={index} className="console-sql-table-wrapper">
                    <table className="console-sql-table">
                      <thead>
                        <tr>
                          {log.content.headers.map((h, hIdx) => (
                            <th key={hIdx}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {log.content.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{cell !== null ? String(cell) : <span className="text-slate-500 italic">NULL</span>}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return (
                <div key={index} className={`console-log-row ${log.type || 'log'}`}>
                  {log.timestamp && (
                    <span className="console-timestamp">[{log.timestamp}]</span>
                  )}
                  <div className="console-msg-content">{String(log.content)}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
