import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BookOpen, Download, Send } from 'lucide-react';
import { parsearMarkdownMentor, parsearInlineMarkdown } from '../../core/controladores/markdown';
import { descargarDocumentoPDF } from '../../core/controladores/pdfGenerator';

export default function MentorChat({
  estudiante,
  API_BASE,
  planActivo,
  setPlanActivo,
  planesMentor,
  ideaProyecto,
  setIdeaProyecto,
  githubUrlMentor,
  setGithubUrlMentor,
  crearPlanMentor,
  mentorLoading,
  tabMentorColumn,
  setTabMentorColumn,
  guiasAyuda,
  guiaAyudaSeleccionada,
  setGuiaAyudaSeleccionada,
  regenerarGuiaAyuda,
  regeneratingGuiaId,
  perfilCognitivoExpandido,
  setPerfilCognitivoExpandido,
  chatLoading,
  personalidadMentor,
  setPersonalidadMentor,
  mensajeChatMentor,
  setMensajeChatMentor,
  enviarMensajeMentor
}) {
  const [esMovil, setEsMovil] = useState(false);

  useEffect(() => {
    const checkMovil = () => {
      setEsMovil(window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
    };
    checkMovil();
    window.addEventListener('resize', checkMovil);
    return () => window.removeEventListener('resize', checkMovil);
  }, []);

  const handleDescargarPlanPDF = () => {
    if (planActivo) {
      descargarDocumentoPDF(
        planActivo.titulo,
        planActivo.plan_markdown || 'Sin contenido.',
        'Plan de Implementación'
      );
    }
  };

  const handleDescargarGuiaPDF = (guia) => {
    if (guia) {
      descargarDocumentoPDF(
        guia.titulo,
        guia.documento_markdown || guia.markdown || 'Sin contenido.',
        'Guía de Ayuda Técnica'
      );
    }
  };

  return (
    <div className="mentor-workspace animate-fade-in">
      <div className="mentor-sidebar">
        <div className="mentor-sidebar-header">
          <h3>Mis Proyectos</h3>
          <a
            href={`${API_BASE}/api/mentor/second-brain/${estudiante.id}`}
            download
            className="btn-export-second-brain"
            title="Exportar bitácora estructurada de aprendizaje para NotebookLM / RAG"
          >
            🧠 Exportar Second Brain
          </a>
        </div>
        <div className="mentor-sidebar-list">
          <button 
            type="button"
            className={`mentor-project-item new-project-btn ${!planActivo ? 'active' : ''}`}
            onClick={() => setPlanActivo(null)}
          >
            <Sparkles size={16} /> + Proponer Idea Nueva
          </button>
          {planesMentor.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`mentor-project-item ${planActivo?.id === p.id ? 'active' : ''}`}
              onClick={() => setPlanActivo(p)}
            >
              <div className="project-item-title">{p.titulo}</div>
              <div className="project-item-date">{new Date(p.creado_en).toLocaleDateString()}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mentor-main-panel">
        {!planActivo ? (
          <div className="mentor-proposal-card">
            <div className="proposal-header">
              <Sparkles className="icon-spark-proposal" />
              <h2>Asistente de Proyectos & Mentor IA</h2>
              <p>Propón una idea de proyecto que quieras construir o proporciona un repositorio de GitHub para auditar y refacturar. El Mentor IA diseñará un Plan de Implementación paso a paso de nivel profesional para guiarte, pero no te dará el código resuelto de forma fácil: su misión es enseñarte a hacerlo por tu cuenta.</p>
            </div>

            <form onSubmit={crearPlanMentor} className="mentor-proposal-form">
              <div className="form-group">
                <label htmlFor="ideaProyecto">¿Qué proyecto quieres construir? Describe tu idea:</label>
                <textarea
                  id="ideaProyecto"
                  rows={5}
                  placeholder="Ej: Quiero hacer una API REST de e-commerce en Node.js con autenticación JWT, carrito de compras persistente y pasarela de pago ficticia en Stripe..."
                  value={ideaProyecto}
                  onChange={(e) => setIdeaProyecto(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="githubUrlMentor">Repositorio de GitHub base (opcional):</label>
                <input
                  type="url"
                  id="githubUrlMentor"
                  placeholder="https://github.com/usuario/repositorio"
                  value={githubUrlMentor}
                  onChange={(e) => setGithubUrlMentor(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary mentor-submit-btn" disabled={mentorLoading}>
                {mentorLoading ? (
                  <>
                    <RefreshCw className="icon-spin" size={16} /> Diseñando Plan de Aprendizaje...
                  </>
                ) : 'Generar Plan de Implementación Académico'}
              </button>
            </form>
          </div>
        ) : (
          <div className="mentor-project-workspace">
            <div className="mentor-plan-column">
              <div className="plan-column-tabs">
                <button
                  type="button"
                  className={`plan-tab-btn ${tabMentorColumn === 'plan' ? 'active' : ''}`}
                  onClick={() => {
                    setTabMentorColumn('plan');
                    setGuiaAyudaSeleccionada(null);
                  }}
                >
                  <BookOpen size={14} /> Plan de Trabajo
                </button>
                <button
                  type="button"
                  className={`plan-tab-btn ${tabMentorColumn === 'guias' ? 'active' : ''}`}
                  onClick={() => setTabMentorColumn('guias')}
                >
                  <Sparkles size={14} /> Historial de Guías ({guiasAyuda.length})
                </button>
              </div>

              {tabMentorColumn === 'plan' ? (
                <>
                  <div className="plan-column-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                    <h2>{planActivo.titulo}</h2>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleDescargarPlanPDF}
                        className="btn-download-word-mentor btn-pdf-download"
                        style={{
                          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <Download size={16} /> PDF
                      </button>
                      {!esMovil && planActivo.word_url && (
                        <a
                          href={`${API_BASE}${planActivo.word_url}`}
                          download
                          className="btn-download-word-mentor"
                          title="Descargar Plan de Implementación en Word"
                        >
                          <Download size={16} /> Word (.docx)
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mentor-plan-body markdown-content-mentor">
                    {parsearMarkdownMentor(planActivo.plan_markdown)}
                  </div>
                </>
              ) : (
                <div className="mentor-guias-body">
                  {guiaAyudaSeleccionada ? (
                    <div className="guia-detalle-vista">
                      <button
                        type="button"
                        className="btn-back-to-guias"
                        onClick={() => setGuiaAyudaSeleccionada(null)}
                      >
                        ← Volver al listado
                      </button>
                      
                      <div className="plan-column-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                        <h2>{guiaAyudaSeleccionada.titulo}</h2>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleDescargarGuiaPDF(guiaAyudaSeleccionada)}
                            className="btn-download-word-mentor btn-pdf-download"
                            style={{
                              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={16} /> PDF
                          </button>
                          {!esMovil && guiaAyudaSeleccionada.word_url && (
                            <a
                              href={`${API_BASE}${guiaAyudaSeleccionada.word_url}`}
                              download
                              className="btn-download-word-mentor"
                            >
                              <Download size={16} /> Word (.docx)
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => regenerarGuiaAyuda(guiaAyudaSeleccionada.id)}
                            disabled={regeneratingGuiaId === guiaAyudaSeleccionada.id}
                            className="btn-regenerar-guia-ayuda"
                          >
                            <RefreshCw size={16} className={regeneratingGuiaId === guiaAyudaSeleccionada.id ? 'animate-spin' : ''} />
                            Regenerar Guía
                          </button>
                        </div>
                      </div>

                      <div className="mentor-plan-body markdown-content-mentor">
                        {parsearMarkdownMentor(guiaAyudaSeleccionada.documento_markdown || guiaAyudaSeleccionada.markdown)}
                      </div>
                    </div>
                  ) : (
                    <div className="guias-lista-vista">
                      <h3>Documentos e Historial de Ayuda</h3>
                      {guiasAyuda.length === 0 ? (
                        <div className="no-guias-placeholder">
                          <Sparkles size={32} className="placeholder-icon" />
                          <p>Aún no has solicitado ayuda técnica en este chat.</p>
                          <span>Escribe tus dudas al Mentor en el panel derecho (ej. "Cómo estructurar geolocalización en Postgres") y se generará un documento detallado descargable en esta sección.</span>
                        </div>
                      ) : (
                        <div className="guias-grid">
                          {guiasAyuda.map((g) => (
                            <div key={g.id} className="guia-tarjeta-item">
                              <div className="guia-tarjeta-header">
                                <h4>{g.titulo}</h4>
                                <span className="guia-tarjeta-date">{new Date(g.creado_en || new Date()).toLocaleDateString()}</span>
                              </div>
                              <p className="guia-tarjeta-query"><strong>Consulta:</strong> "{g.mensaje_estudiante}"</p>
                              <div className="guia-tarjeta-acciones" style={{ flexWrap: 'wrap', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="btn-ver-guia-card"
                                  onClick={() => setGuiaAyudaSeleccionada(g)}
                                >
                                  Visualizar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDescargarGuiaPDF(g)}
                                  className="btn-descargar-guia-card"
                                  style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                    color: '#ffffff',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px'
                                  }}
                                >
                                  <Download size={12} /> PDF
                                </button>
                                {!esMovil && g.word_url && (
                                  <a
                                    href={`${API_BASE}${g.word_url}`}
                                    download
                                    className="btn-descargar-guia-card"
                                  >
                                    <Download size={12} /> Word
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => regenerarGuiaAyuda(g.id)}
                                  disabled={regeneratingGuiaId === g.id}
                                  className="btn-regenerar-guia-card"
                                >
                                  <RefreshCw size={12} className={regeneratingGuiaId === g.id ? 'animate-spin' : ''} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mentor-chat-column">
              <div className="chat-column-header">
                <h3>Discusión y Dudas con el Mentor</h3>
                <span>Enfoque Pedagógico Académico</span>
              </div>

              {/* Tarjeta de Perfil Cognitivo / Memoria de IA */}
              {estudiante && (
                <div className={`mentor-cognitive-profile-card ${perfilCognitivoExpandido ? 'expanded' : 'collapsed'}`}>
                  <div className="cognitive-card-header" onClick={() => setPerfilCognitivoExpandido(!perfilCognitivoExpandido)}>
                    <div className="header-title-wrapper">
                      <span className="brain-emoji">🧠</span>
                      <div className="cognitive-title-text">
                        <h4>Perfil Cognitivo Activo</h4>
                        <span className="cognitive-subtitle">Machine Learning en Tiempo Real</span>
                      </div>
                    </div>
                    <div className="header-actions-wrapper">
                      {estudiante.perfil_cognitivo?.nivel_real_detectado && (
                        <span className="badge-cognitive-level">
                          Nivel: {estudiante.perfil_cognitivo.nivel_real_detectado}
                        </span>
                      )}
                      <span className="toggle-icon">{perfilCognitivoExpandido ? '▲ Ocultar' : '▼ Expandir Perfil'}</span>
                    </div>
                  </div>
                  
                  {perfilCognitivoExpandido && (
                    <div className="cognitive-card-body">
                      {estudiante.perfil_cognitivo ? (
                        <>
                          {estudiante.perfil_cognitivo.observaciones_pedagogicas && (
                            <div className="cognitive-section obs-section">
                              <h5>Observaciones del Mentor:</h5>
                              <p>{estudiante.perfil_cognitivo.observaciones_pedagogicas}</p>
                            </div>
                          )}
                          
                          <div className="cognitive-grid-details">
                            <div className="cognitive-detail-item">
                              <h6>Conceptos Dominados:</h6>
                              <div className="cognitive-chips-container">
                                {estudiante.perfil_cognitivo.conceptos_dominados?.length > 0 ? (
                                  estudiante.perfil_cognitivo.conceptos_dominados.map((c, i) => (
                                    <span key={i} className="chip-cognitive chip-success">{c}</span>
                                  ))
                                ) : (
                                  <span className="cognitive-empty-text">Ninguno dominado aún</span>
                                )}
                              </div>
                            </div>

                            <div className="cognitive-detail-item">
                              <h6>Conceptos en Progreso:</h6>
                              <div className="cognitive-chips-container">
                                {estudiante.perfil_cognitivo.conceptos_en_progreso?.length > 0 ? (
                                  estudiante.perfil_cognitivo.conceptos_en_progreso.map((c, i) => (
                                    <span key={i} className="chip-cognitive chip-progress">{c}</span>
                                  ))
                                ) : (
                                  <span className="cognitive-empty-text">Ninguno en progreso</span>
                                )}
                              </div>
                            </div>

                            <div className="cognitive-detail-item">
                              <h6>Temas por Aprender (Vacíos):</h6>
                              <div className="cognitive-chips-container">
                                {estudiante.perfil_cognitivo.vacios_de_conocimiento?.length > 0 ? (
                                  estudiante.perfil_cognitivo.vacios_de_conocimiento.map((v, i) => (
                                    <span key={i} className="chip-cognitive chip-vacuum">{v}</span>
                                  ))
                                ) : (
                                  <span className="cognitive-empty-text">Sin vacíos detectados</span>
                                )}
                              </div>
                            </div>

                            <div className="cognitive-detail-item">
                              <h6>Fortalezas Clave:</h6>
                              <div className="cognitive-chips-container">
                                {estudiante.perfil_cognitivo.fortalezas?.length > 0 ? (
                                  estudiante.perfil_cognitivo.fortalezas.map((f, i) => (
                                    <span key={i} className="chip-cognitive chip-info">{f}</span>
                                  ))
                                ) : (
                                  <span className="cognitive-empty-text">Mapeando fortalezas...</span>
                                )}
                              </div>
                            </div>

                            <div className="cognitive-detail-item">
                              <h6>Errores Frecuentes:</h6>
                              <div className="cognitive-chips-container">
                                {estudiante.perfil_cognitivo.errores_frecuentes?.length > 0 ? (
                                  estudiante.perfil_cognitivo.errores_frecuentes.map((e, i) => (
                                    <span key={i} className="chip-cognitive chip-danger">{e}</span>
                                  ))
                                ) : (
                                  <span className="cognitive-empty-text">Ninguno registrado</span>
                                )}
                              </div>
                            </div>

                            <div className="cognitive-detail-item">
                              <h6>Dudas Recurrentes:</h6>
                              <div className="cognitive-chips-container">
                                {estudiante.perfil_cognitivo.dudas_recurrentes?.length > 0 ? (
                                  estudiante.perfil_cognitivo.dudas_recurrentes.map((d, i) => (
                                    <span key={i} className="chip-cognitive chip-warning">{d}</span>
                                  ))
                                ) : (
                                  <span className="cognitive-empty-text">Sin dudas persistentes</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="cognitive-loading-state">
                          <div className="pulse-loader"></div>
                          <p>Construyendo perfil de aprendizaje...</p>
                          <span>Envía dudas al Mentor en el chat para que el pipeline incremental de Machine Learning analice y visualice tu progreso aquí.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mentor-chat-messages">
                <div className="chat-message mentor">
                  <div className="message-sender">Mentor de Software</div>
                  <div className="message-text">
                    He diseñado tu plan de implementación. Puedes consultarlo a la izquierda. Escribe aquí cualquier duda técnica que tengas sobre la arquitectura, la base de datos, el flujo o cómo estructurar tu lógica. Recuerda que mi objetivo es enseñarte a hacerlo, no darte el código completo. ¡Manos a la obra!
                  </div>
                </div>
                {planActivo.mensajes.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.remitente}`}>
                    <div className="message-sender">
                      {msg.remitente === 'estudiante' ? estudiante.nombre : 'Mentor de Software'}
                    </div>
                    <div className="message-text">
                      {msg.remitente === 'mentor' ? parsearInlineMarkdown(msg.texto) : msg.texto}
                      
                      {msg.documento_ayuda && (
                        <div className="message-doc-link-card">
                          <div className="doc-link-header">
                            <BookOpen size={14} className="doc-icon" />
                            <span>{msg.documento_ayuda.titulo}</span>
                          </div>
                          <div className="doc-link-actions">
                            <button 
                              type="button"
                              onClick={() => {
                                setTabMentorColumn('guias');
                                setGuiaAyudaSeleccionada({
                                  id: msg.documento_ayuda.id,
                                  titulo: msg.documento_ayuda.titulo,
                                  documento_markdown: msg.documento_ayuda.markdown,
                                  word_url: msg.documento_ayuda.word_url
                                });
                              }}
                              className="btn-view-doc-chat"
                            >
                              Visualizar Guía
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDescargarGuiaPDF(msg.documento_ayuda)}
                              className="btn-download-doc-chat btn-pdf-download"
                              style={{
                                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px'
                              }}
                            >
                              <Download size={11} /> PDF
                            </button>
                            {!esMovil && msg.documento_ayuda.word_url && (
                              <a 
                                href={`${API_BASE}${msg.documento_ayuda.word_url}`}
                                download
                                className="btn-download-doc-chat"
                              >
                                <Download size={12} /> Word
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-message mentor loading-message">
                    <div className="message-sender">Mentor de Software</div>
                    <div className="message-text">
                      <span className="pulse-dots">Escribiendo...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mentor-personality-selector">
                <span className="personality-label">Tono del Mentor:</span>
                {['Riguroso', 'Tech Lead', 'Socrático'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`personality-btn ${personalidadMentor === p ? 'active' : ''}`}
                    onClick={() => setPersonalidadMentor(p)}
                  >
                    {p === 'Riguroso' ? '🏛️' : p === 'Tech Lead' ? '🚀' : '🤔'} {p}
                  </button>
                ))}
              </div>

              <div className="superpowers-tags">
                <button 
                  type="button" 
                  className="tag-superpower" 
                  onClick={() => {
                    const clean = mensajeChatMentor.replace(/^\/(planificar|idear|ejecutar)\s*/i, '');
                    setMensajeChatMentor('/planificar ' + clean);
                  }}
                  title="Fuerza un enfoque en pasos de implementación y comandos técnicos"
                >
                  ⚡ /planificar
                </button>
                <button 
                  type="button" 
                  className="tag-superpower" 
                  onClick={() => {
                    const clean = mensajeChatMentor.replace(/^\/(planificar|idear|ejecutar)\s*/i, '');
                    setMensajeChatMentor('/idear ' + clean);
                  }}
                  title="Fuerza un enfoque en pros/contras de arquitectura y patrones"
                >
                  💡 /idear
                </button>
                <button 
                  type="button" 
                  className="tag-superpower" 
                  onClick={() => {
                    const clean = mensajeChatMentor.replace(/^\/(planificar|idear|ejecutar)\s*/i, '');
                    setMensajeChatMentor('/ejecutar ' + clean);
                  }}
                  title="Fuerza un enfoque en andamios de código, firmas de funciones y tests"
                >
                  🛠️ /ejecutar
                </button>
              </div>

              <form onSubmit={enviarMensajeMentor} className="mentor-chat-form">
                <input
                  type="text"
                  placeholder="Pregúntale al mentor sobre arquitectura, bases de datos o lógica..."
                  value={mensajeChatMentor}
                  onChange={(e) => setMensajeChatMentor(e.target.value)}
                  disabled={chatLoading}
                  required
                />
                <button type="submit" disabled={chatLoading} className="btn-send-chat">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
