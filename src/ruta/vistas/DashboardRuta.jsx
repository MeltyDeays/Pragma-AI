import React from 'react';
import { BookOpen, Download, RefreshCw, Send, Code, Target, Award, Check } from 'lucide-react';
import { parsearRequisitos } from '../../core/controladores/markdown';

export default function DashboardRuta({
  indiceTemaActual,
  temario,
  temaNombreActual,
  tareaActiva,
  handleRegenerar,
  isRegenerating,
  API_BASE,
  parseObservaciones,
  enviarEntrega,
  tipoEntrega,
  setTipoEntrega,
  codigoEntregado,
  setCodigoEntregado,
  evaluating,
  githubUrl,
  setGithubUrl,
  tareasDeTecnologia,
  generarNuevaTarea,
  loading,
  mostrarTodoTemario,
  setMostrarTodoTemario,
  estudiante
}) {
  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Panel Principal de la Tarea Activa */}
      <section className="dashboard-panel active-task-panel">
        {/* Progreso del Temario */}
        <div className="temario-progreso-container">
          <div className="progreso-header">
            <span>PLAN DE ESTUDIOS</span>
            <span>Módulo {indiceTemaActual} de {temario.length}</span>
          </div>
          <div className="progreso-bar">
            <div 
              className="progreso-bar-fill"
              style={{ width: `${Math.min(100, (indiceTemaActual / temario.length) * 100)}%` }}
            ></div>
          </div>
          <div className="progreso-tema-nombre">
            <strong>Tema Actual:</strong> {temaNombreActual}
          </div>
        </div>

        {tareaActiva ? (
          <div className="task-detail-card">
            <div className="card-header">
              <span className="badge-tech">{tareaActiva.tema}</span>
              <span className="badge-level">{tareaActiva.nivel}</span>
            </div>

            <h2>{tareaActiva.titulo}</h2>

            <div className="task-desc">
              <h3>Requisitos Técnicos del Módulo</h3>
              <div className="requirements-list">
                {parsearRequisitos(tareaActiva.descripcion).map((req) => (
                  <div key={req.numero} className="requirement-item">
                    <div className="requirement-num">{req.numero}</div>
                    <p className="requirement-text">{req.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="download-area">
              <div className="download-info">
                <BookOpen className="icon-doc" />
                <div>
                  <h4>Guía Conceptual y Tarea</h4>
                  <p>Descarga el documento de Word con explicaciones, retos expertos y buenas prácticas.</p>
                </div>
              </div>
              <div className="action-buttons-wrapper">
                <a
                  href={tareaActiva.word_url ? `${API_BASE}${tareaActiva.word_url}` : '#'}
                  download
                  className="btn-download"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={18} /> Descargar Word
                </a>
                <button
                  onClick={handleRegenerar}
                  disabled={isRegenerating}
                  className="btn-regenerar"
                >
                  <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
                  {isRegenerating ? 'Regenerando...' : 'Regenerar Guía'}
                </button>
              </div>
            </div>

            {/* Historial de Intentos de Evaluación y Rúbricas */}
            {tareaActiva.entregas && tareaActiva.entregas.length > 0 && (() => {
              const ultimaEntrega = tareaActiva.entregas[0];
              const infoObs = parseObservaciones(ultimaEntrega.observaciones);

              return (
                <div className="attempts-history">
                  <h3>Última Evaluación de Pragma AI</h3>
                  <div className="attempt-card failed">
                    <div className="attempt-header">
                      <span className={`attempt-score ${ultimaEntrega.puntaje < 90 ? 'attempt-score-fail' : ''}`}>Calificación: {ultimaEntrega.puntaje}/100</span>
                      <span className="attempt-date">Intento del {new Date(ultimaEntrega.fecha_entrega).toLocaleDateString()}</span>
                    </div>

                    {infoObs.esEstructurado && (
                      <div className="rubrica-desglose">
                        <h4>Desglose de Rúbrica de Producción</h4>
                        <div className="rubrica-items">
                          <div className="rubrica-item">
                            <div className="rubrica-item-header">
                              <span>Funcionalidad (Máx 40)</span>
                              <strong>{infoObs.desglose.funcionalidad} pts</strong>
                            </div>
                            <div className="rubrica-item-bar"><div className="rubrica-item-fill functionality" style={{ width: `${(infoObs.desglose.funcionalidad / 40) * 100}%` }}></div></div>
                          </div>
                          <div className="rubrica-item">
                            <div className="rubrica-item-header">
                              <span>Diseño y Limpieza (Máx 20)</span>
                              <strong>{infoObs.desglose.diseno} pts</strong>
                            </div>
                            <div className="rubrica-item-bar"><div className="rubrica-item-fill design" style={{ width: `${(infoObs.desglose.diseno / 20) * 100}%` }}></div></div>
                          </div>
                          <div className="rubrica-item">
                            <div className="rubrica-item-header">
                              <span>Seguridad y Excepciones (Máx 20)</span>
                              <strong>{infoObs.desglose.seguridad} pts</strong>
                            </div>
                            <div className="rubrica-item-bar"><div className="rubrica-item-fill security" style={{ width: `${(infoObs.desglose.seguridad / 20) * 100}%` }}></div></div>
                          </div>
                          <div className="rubrica-item">
                            <div className="rubrica-item-header">
                              <span>Optimización y Big O (Máx 20)</span>
                              <strong>{infoObs.desglose.rendimiento} pts</strong>
                            </div>
                            <div className="rubrica-item-bar"><div className="rubrica-item-fill performance" style={{ width: `${(infoObs.desglose.rendimiento / 20) * 100}%` }}></div></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="attempt-body">
                      <p><strong>Observaciones:</strong> {infoObs.comentarios}</p>
                      <p className="recom-box"><strong>Instrucciones de Mejora:</strong> {ultimaEntrega.recomendaciones}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Formulario de Entrega */}
            <form onSubmit={(e) => enviarEntrega(e, tareaActiva.id)} className="delivery-form">
              <h3>Entregar Solución del Módulo</h3>
              
              {/* Selector de tipo de entrega */}
              <div className="delivery-tabs">
                <button
                  type="button"
                  onClick={() => setTipoEntrega('codigo')}
                  className={`btn-tab ${tipoEntrega === 'codigo' ? 'active' : ''}`}
                >
                  Pegar Código Solución
                </button>
                <button
                  type="button"
                  onClick={() => setTipoEntrega('github')}
                  className={`btn-tab ${tipoEntrega === 'github' ? 'active' : ''}`}
                >
                  Enviar Repo GitHub
                </button>
              </div>

              {tipoEntrega === 'codigo' ? (
                <div className="codigo-submission-area" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Escribe o pega directamente el código fuente de tu solución en el editor inferior.</p>
                  <textarea
                    placeholder="// Pega tu código de solución aquí..."
                    value={codigoEntregado}
                    onChange={(e) => setCodigoEntregado(e.target.value)}
                    required
                    disabled={evaluating}
                    style={{
                      width: '100%',
                      minHeight: '260px',
                      background: 'var(--bg-input)',
                      color: '#a855f7',
                      fontFamily: 'Consolas, monospace',
                      fontSize: '14px',
                      padding: '16px',
                      border: '1px solid var(--border-light)',
                      borderRadius: '12px',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button type="submit" className="btn-submit-delivery" disabled={evaluating} style={{ width: '100%', padding: '14px' }}>
                    {evaluating ? (
                      <>
                        <RefreshCw className="spinner" /> Analizando Código...
                      </>
                    ) : (
                      <>
                        <Send /> Evaluar Código Pegado
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="github-submission-area">
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '12px' }}>Sube tus correcciones a GitHub y envía el enlace público de tu repositorio.</p>
                  <div className="input-group">
                    <Code className="icon-input-git" />
                    <input
                      type="url"
                      placeholder="https://github.com/tu-usuario/tu-repositorio"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      required
                      disabled={evaluating}
                    />
                    <button type="submit" className="btn-submit-delivery" disabled={evaluating}>
                      {evaluating ? (
                        <>
                          <RefreshCw className="spinner" /> Analizando Código...
                        </>
                      ) : (
                        <>
                          <Send /> Enviar a Calificar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        ) : (
          tareasDeTecnologia.length === 0 ? (
            <div className="no-task-card welcome-card">
              <Target className="icon-award-celebrate animate-bounce" />
              <h2>¡Comienza tu Ruta de Aprendizaje!</h2>
              <p>Aún no has iniciado tu primer módulo en {estudiante ? estudiante.tecnologia_actual : 'esta tecnología'}. Pragma AI generará una lección teórica, requisitos y una tarea práctica adaptada a tu nivel.</p>
              <button onClick={generarNuevaTarea} disabled={loading} className="btn-primary btn-generate-next animate-glow">
                {loading ? 'Generando...' : 'Comenzar Primer Módulo'}
              </button>
            </div>
          ) : (() => {
            const ultimaTareaAprobada = tareasDeTecnologia.find(t => t.estado === 'Aprobado');
            const ultimaEntregaAprobada = ultimaTareaAprobada?.entregas?.[0];
            const puntajeAprobado = ultimaEntregaAprobada ? ultimaEntregaAprobada.puntaje : null;

            return (
              <div className="no-task-card">
                <Award className="icon-award-celebrate" />
                <h2>¡Excelente Trabajo! Módulo Completado.</h2>
                <p>
                  Has aprobado tu tarea del plan de estudios con una calificación de{' '}
                  <strong>{puntajeAprobado !== null ? `${puntajeAprobado}/100` : 'satisfactoria'}</strong>. 
                  Desbloquea la siguiente lección teórica y práctica.
                </p>
                <button onClick={generarNuevaTarea} disabled={loading} className="btn-primary btn-generate-next animate-glow">
                  {loading ? 'Generando...' : 'Generar Siguiente Módulo'}
                </button>
              </div>
            );
          })()
        )}
      </section>

      {/* Listado del Temario Completo y Progreso */}
      <section className="dashboard-panel history-panel">
        <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Ruta de Aprendizaje</h2>
          {temario.length > 5 && (
            <span className="profile-badge level-badge" style={{ fontSize: '0.75rem', padding: '0.25rem 0.60rem' }}>
              Tema {indiceTemaActual} / {temario.length}
            </span>
          )}
        </div>
        <div className="temario-list">
          {!mostrarTodoTemario && temario.length > 5 && indiceTemaActual > 3 && (
            <div className="temario-list-ellipsis">
              <span>• • •</span>
            </div>
          )}
          {temario.map((t, idx) => {
            const numTema = idx + 1;
            const esCompletado = numTema < indiceTemaActual;
            const esActivo = numTema === indiceTemaActual;

            // Ocultar temas lejanos al activo si no se muestra todo
            const lejano = Math.abs(numTema - indiceTemaActual) > 2;
            if (!mostrarTodoTemario && temario.length > 5 && lejano) {
              return null;
            }

            return (
              <div 
                key={idx} 
                className={`temario-list-item ${esCompletado ? 'completed' : ''} ${esActivo ? 'active' : ''}`}
              >
                <div className="item-indicator">
                  {esCompletado ? <Check size={14} className="icon-check-done" /> : <span>{numTema}</span>}
                </div>
                <span className="item-name">{t}</span>
              </div>
            );
          })}
          {!mostrarTodoTemario && temario.length > 5 && indiceTemaActual < temario.length - 2 && (
            <div className="temario-list-ellipsis">
              <span>• • •</span>
            </div>
          )}
        </div>
        
        {temario.length > 5 && (
          <button 
            onClick={() => setMostrarTodoTemario(!mostrarTodoTemario)} 
            className="btn-show-more-temario"
          >
            <RefreshCw size={14} className={mostrarTodoTemario ? 'rotated-icon' : ''} />
            {mostrarTodoTemario ? 'Colapsar ruta de aprendizaje' : `Ver temario completo (${temario.length} temas)`}
          </button>
        )}
      </section>
    </div>
  );
}
