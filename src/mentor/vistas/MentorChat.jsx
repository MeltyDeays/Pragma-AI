import { useState, useEffect } from 'react';
import { 
  Sparkles, RefreshCw, BookOpen, Download, Send, 
  CheckSquare, Copy, Check, Layers, ShieldCheck, Code2, Database 
} from 'lucide-react';
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
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setEsMovil(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [allChecklists, setAllChecklists] = useState(() => {
    try {
      const items = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mentor_checklist_')) {
          items[key.replace('mentor_checklist_', '')] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      }
      return items;
    } catch {
      return {};
    }
  });

  const checklist = (planActivo?.id && allChecklists[planActivo.id]) ? allChecklists[planActivo.id] : {};

  const toggleChecklistItem = (itemKey) => {
    if (!planActivo?.id) return;
    setAllChecklists(prev => {
      const current = prev[planActivo.id] || {};
      const updated = { ...current, [itemKey]: !current[itemKey] };
      try {
        localStorage.setItem(`mentor_checklist_${planActivo.id}`, JSON.stringify(updated));
      } catch {
        console.debug('Storage no disponible');
      }
      return { ...prev, [planActivo.id]: updated };
    });
  };

  const copiarTexto = (id, texto) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

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
            href={`${API_BASE}/api/mentor/second-brain/${estudiante?.id || 'estudiante_local'}`}
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
                <button
                  type="button"
                  className={`plan-tab-btn ${tabMentorColumn === 'blueprints' ? 'active' : ''}`}
                  onClick={() => setTabMentorColumn('blueprints')}
                >
                  <Layers size={14} /> Blueprints & Recursos
                </button>
                <button
                  type="button"
                  className={`plan-tab-btn ${tabMentorColumn === 'checklist' ? 'active' : ''}`}
                  onClick={() => setTabMentorColumn('checklist')}
                >
                  <CheckSquare size={14} /> Checklist de Fases
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
              ) : tabMentorColumn === 'blueprints' ? (
                <div className="mentor-blueprints-body">
                  <div className="blueprints-header mb-4">
                    <h3>📐 Blueprints Arquitectónicos & Recursos de Producción</h3>
                    <p className="text-xs text-slate-400">
                      Plantillas y andamios estructurados listos para producción para diseñar la arquitectura de tu proyecto de forma limpia.
                    </p>
                  </div>

                  <div className="blueprints-grid">
                    {/* Blueprint 1: Clean Architecture */}
                    <div className="blueprint-card">
                      <div className="blueprint-card-top">
                        <div className="flex items-center gap-2">
                          <Layers size={16} className="text-indigo-400" />
                          <h4 className="font-semibold text-white text-sm">Clean Architecture & UseCases</h4>
                        </div>
                        <span className="bp-tag bp-tag-arch">Modular</span>
                      </div>
                      <p className="bp-desc">
                        Aislamiento estricto de dominio, casos de uso puros y adaptadores de infraestructura para evitar acoplamiento.
                      </p>
                      <pre className="bp-code-snippet">
{`src/
├── domain/          # Entidades y reglas de negocio
│   └── entities/
├── application/     # Casos de uso (CreateOrder, AuthUser)
│   └── usecases/
├── infrastructure/  # Repositorios DB, APIs externas, Prisma
│   ├── database/
│   └── repositories/
└── interfaces/      # Controladores HTTP, DTOs y Rutas
    └── http/`}
                      </pre>
                      <div className="bp-card-actions">
                        <button
                          type="button"
                          className="btn-bp-copy"
                          onClick={() => copiarTexto('bp_clean', `src/\n├── domain/entities/\n├── application/usecases/\n├── infrastructure/repositories/\n└── interfaces/http/`)}
                        >
                          {copiadoId === 'bp_clean' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiadoId === 'bp_clean' ? 'Copiado' : 'Copiar Estructura'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-bp-ask"
                          onClick={() => {
                            setMensajeChatMentor(`¿Cómo aplico Clean Architecture y casos de uso en mi proyecto ${planActivo?.titulo || ''}?`);
                          }}
                        >
                          💬 Consultar al Mentor
                        </button>
                      </div>
                    </div>

                    {/* Blueprint 2: Express + PostgreSQL + Prisma */}
                    <div className="blueprint-card">
                      <div className="blueprint-card-top">
                        <div className="flex items-center gap-2">
                          <Database size={16} className="text-emerald-400" />
                          <h4 className="font-semibold text-white text-sm">Express REST + PostgreSQL & Prisma</h4>
                        </div>
                        <span className="bp-tag bp-tag-db">Database</span>
                      </div>
                      <p className="bp-desc">
                        Configuración de connection pool con pg/Prisma, migraciones versionadas y middleware de manejo de errores global.
                      </p>
                      <pre className="bp-code-snippet">
{`// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'UNKNOWN_ERROR'
  });
}`}
                      </pre>
                      <div className="bp-card-actions">
                        <button
                          type="button"
                          className="btn-bp-copy"
                          onClick={() => copiarTexto('bp_express', `export function errorHandler(err, req, res, next) {\n  const status = err.statusCode || 500;\n  res.status(status).json({ ok: false, error: err.message });\n}`)}
                        >
                          {copiadoId === 'bp_express' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiadoId === 'bp_express' ? 'Copiado' : 'Copiar Middleware'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-bp-ask"
                          onClick={() => {
                            setMensajeChatMentor(`¿Cuál es el mejor esquema relacional e índices en PostgreSQL para ${planActivo?.titulo || 'este proyecto'}?`);
                          }}
                        >
                          💬 Consultar al Mentor
                        </button>
                      </div>
                    </div>

                    {/* Blueprint 3: JWT & Refresh Rotation */}
                    <div className="blueprint-card">
                      <div className="blueprint-card-top">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-amber-400" />
                          <h4 className="font-semibold text-white text-sm">Autenticación JWT & Refresh Rotation</h4>
                        </div>
                        <span className="bp-tag bp-tag-sec">Seguridad</span>
                      </div>
                      <p className="bp-desc">
                        Tokens de acceso en memoria y refresh tokens en HttpOnly Cookies con rotación e invalidación en cierre de sesión.
                      </p>
                      <pre className="bp-code-snippet">
{`// auth/tokens.js
export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });
}`}
                      </pre>
                      <div className="bp-card-actions">
                        <button
                          type="button"
                          className="btn-bp-copy"
                          onClick={() => copiarTexto('bp_jwt', `res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'lax' });`)}
                        >
                          {copiadoId === 'bp_jwt' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiadoId === 'bp_jwt' ? 'Copiado' : 'Copiar Cookie Config'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-bp-ask"
                          onClick={() => {
                            setMensajeChatMentor(`¿Cómo mitigo vulnerabilidades de XSS y CSRF en el flujo de autenticación de ${planActivo?.titulo || 'mi app'}?`);
                          }}
                        >
                          💬 Consultar al Mentor
                        </button>
                      </div>
                    </div>

                    {/* Blueprint 4: Testing Pyramid */}
                    <div className="blueprint-card">
                      <div className="blueprint-card-top">
                        <div className="flex items-center gap-2">
                          <Code2 size={16} className="text-cyan-400" />
                          <h4 className="font-semibold text-white text-sm">Pirámide de Pruebas (Vitest + Supertest)</h4>
                        </div>
                        <span className="bp-tag bp-tag-test">Testing</span>
                      </div>
                      <p className="bp-desc">
                        Estructura de pruebas unitarias sobre casos de uso y pruebas de integración sobre endpoints de Express.
                      </p>
                      <pre className="bp-code-snippet">
{`// tests/integration/api.test.js
import request from 'supertest';
import { app } from '../../src/app';

describe('POST /api/recurso', () => {
  it('debe responder 201 y retornar el recurso creado', async () => {
    const res = await request(app).post('/api/recurso').send({ name: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });
});`}
                      </pre>
                      <div className="bp-card-actions">
                        <button
                          type="button"
                          className="btn-bp-copy"
                          onClick={() => copiarTexto('bp_test', `import request from 'supertest';\nimport { app } from '../../src/app';`)}
                        >
                          {copiadoId === 'bp_test' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          <span>{copiadoId === 'bp_test' ? 'Copiado' : 'Copiar Test Boilerplate'}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-bp-ask"
                          onClick={() => {
                            setMensajeChatMentor(`¿Qué casos de prueba esenciales debo escribir para validar la lógica de ${planActivo?.titulo || 'este plan'}?`);
                          }}
                        >
                          💬 Consultar al Mentor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : tabMentorColumn === 'checklist' ? (
                <div className="mentor-checklist-body">
                  {(() => {
                    const checklistItems = [
                      { key: 'f1_req', fase: 'Fase 1: Análisis & Requerimientos', text: 'Definir entidades primarias y relaciones (1:N, N:M)' },
                      { key: 'f1_dto', fase: 'Fase 1: Análisis & Requerimientos', text: 'Establecer contratos de API (DTOs y endpoints REST)' },
                      { key: 'f2_schema', fase: 'Fase 2: Modelado DB & Persistencia', text: 'Diseñar esquema SQL relacional e índices en llaves foráneas' },
                      { key: 'f2_mig', fase: 'Fase 2: Modelado DB & Persistencia', text: 'Configurar migraciones de base de datos y seeds de prueba' },
                      { key: 'f3_usecase', fase: 'Fase 3: Lógica de Negocio & Servicios', text: 'Implementar casos de uso desacoplados de frameworks' },
                      { key: 'f3_val', fase: 'Fase 3: Lógica de Negocio & Servicios', text: 'Validación estricta de payloads (Zod/Joi) y errores tipados' },
                      { key: 'f4_auth', fase: 'Fase 4: Seguridad & Middleware', text: 'Autenticación segura con JWT y hash de contraseñas (Bcrypt/Argon2)' },
                      { key: 'f4_owasp', fase: 'Fase 4: Seguridad & Middleware', text: 'Rate limiting, CORS estricto y sanitización anti-inyección' },
                      { key: 'f5_state', fase: 'Fase 5: Frontend Reactivo & UI', text: 'Gestión de estado global limpio (Zustand) y caché de datos' },
                      { key: 'f5_ux', fase: 'Fase 5: Frontend Reactivo & UI', text: 'Manejo de estados de carga, estados vacíos y feedback de error' },
                      { key: 'f6_test', fase: 'Fase 6: Testing & Despliegue', text: 'Cobertura de pruebas unitarias sobre casos de uso críticos' },
                      { key: 'f6_docker', fase: 'Fase 6: Testing & Despliegue', text: 'Contenedor Dockerfile multi-stage y variables de entorno seguras' }
                    ];

                    const total = checklistItems.length;
                    const completados = checklistItems.filter(i => checklist[i.key]).length;
                    const porcentaje = Math.round((completados / total) * 100);

                    // Agrupar por fase
                    const fasesUnicas = [...new Set(checklistItems.map(i => i.fase))];

                    return (
                      <div>
                        <div className="checklist-progress-card mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <h3 className="font-bold text-white text-sm">Progreso Global de Implementación</h3>
                              <span className="text-xs text-slate-400">{completados} de {total} hitos completados</span>
                            </div>
                            <span className="text-xl font-mono font-bold text-emerald-400">{porcentaje}%</span>
                          </div>
                          <div className="checklist-progress-bar">
                            <div className="checklist-progress-fill" style={{ width: `${porcentaje}%` }}></div>
                          </div>
                          {porcentaje === 100 && (
                            <p className="text-xs text-emerald-300 font-semibold mt-2">
                              🎉 ¡Proyecto completado al 100%! Estás listo para desplegar a producción.
                            </p>
                          )}
                        </div>

                        <div className="checklist-phases-container">
                          {fasesUnicas.map((faseNombre, fIdx) => {
                            const itemsFase = checklistItems.filter(i => i.fase === faseNombre);
                            const faseCompletada = itemsFase.every(i => checklist[i.key]);

                            return (
                              <div key={fIdx} className={`checklist-phase-block ${faseCompletada ? 'phase-all-done' : ''}`}>
                                <div className="phase-block-header">
                                  <span className="phase-title">{faseNombre}</span>
                                  <span className={`phase-badge ${faseCompletada ? 'badge-done' : 'badge-pending'}`}>
                                    {faseCompletada ? '✓ Completada' : 'En Progreso'}
                                  </span>
                                </div>
                                <div className="phase-items-list">
                                  {itemsFase.map(item => {
                                    const isChecked = !!checklist[item.key];
                                    return (
                                      <label key={item.key} className={`checklist-item-row ${isChecked ? 'item-checked' : ''}`}>
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => toggleChecklistItem(item.key)}
                                          className="checklist-checkbox"
                                        />
                                        <span className="item-text">{item.text}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
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

              {/* Quick Actions Prompts de Producción */}
              <div className="mentor-quick-prompts-bar">
                <span className="quick-prompts-lbl">Consultas Rápidas:</span>
                <button
                  type="button"
                  className="btn-quick-prompt"
                  onClick={() => setMensajeChatMentor(`¿Cómo estructuro el esquema relacional de base de datos e índices para este proyecto?`)}
                >
                  📐 Esquema DB
                </button>
                <button
                  type="button"
                  className="btn-quick-prompt"
                  onClick={() => setMensajeChatMentor(`¿Qué medidas de seguridad (OWASP, validación, JWT) debo priorizar en esta arquitectura?`)}
                >
                  🛡️ OWASP Seguridad
                </button>
                <button
                  type="button"
                  className="btn-quick-prompt"
                  onClick={() => setMensajeChatMentor(`¿Cómo diseño la estrategia y pirámide de pruebas (unitarias e integración) para este proyecto?`)}
                >
                  🧪 Estrategia Tests
                </button>
                <button
                  type="button"
                  className="btn-quick-prompt"
                  onClick={() => setMensajeChatMentor(`¿Qué cuellos de botella de Big-O o rendimiento debo prevenir al implementar esta lógica?`)}
                >
                  ⚡ Optimización Big-O
                </button>
                <button
                  type="button"
                  className="btn-quick-prompt"
                  onClick={() => setMensajeChatMentor(`¿Cómo defino los contratos de API REST (códigos HTTP, DTOs y manejo de errores)?`)}
                >
                  🔌 Contrato REST
                </button>
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
