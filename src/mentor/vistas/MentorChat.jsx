import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, RefreshCw, BookOpen, Download, Send, 
  CheckSquare, Copy, Check, Layers, ShieldCheck, Code2, Database,
  AlertTriangle, Search, Cpu, Radio, Smartphone, Cloud, Activity, Terminal, Lock
} from 'lucide-react';
import { parsearMarkdownMentor, parsearInlineMarkdown } from '../../core/controladores/markdown';
import { descargarDocumentoPDF } from '../../core/controladores/pdfGenerator';
import { LISTA_BLUEPRINTS, BLUEPRINT_CATEGORIAS } from '../modelos/blueprintsModel';

const normalizarTexto = (texto) =>
  (texto || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const ALIAS_CATEGORIAS = {
  'base de datos': 'Database',
  'bases de datos': 'Database',
  'bd': 'Database',
  'tiempo real': 'Realtime',
  'pruebas': 'Testing',
  'tests': 'Testing',
  'test': 'Testing',
  'nube': 'Cloud',
  'servidor': 'Backend',
  'interfaz': 'Frontend',
  'movil': 'Modular',
  'arquitectura': 'Modular'
};

const ICONS_MAP = {
  Layers,
  Database,
  Code2,
  ShieldCheck,
  Cpu,
  Radio,
  Smartphone,
  Cloud,
  Activity,
  Terminal,
  Lock
};

function getIconColorClass(tagClass) {
  switch (tagClass) {
    case 'bp-tag-arch': return 'text-indigo-400';
    case 'bp-tag-db': return 'text-emerald-400';
    case 'bp-tag-back': return 'text-purple-400';
    case 'bp-tag-sec': return 'text-amber-400';
    case 'bp-tag-front': return 'text-blue-400';
    case 'bp-tag-realtime': return 'text-rose-400';
    case 'bp-tag-cloud': return 'text-sky-400';
    case 'bp-tag-test': return 'text-teal-400';
    default: return 'text-indigo-400';
  }
}

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
  enviarMensajeMentor,
  chatError = null,
  setChatError = null,
  cancelarConsultaMentor = null,
  generarBlueprintsDinamicos = null,
  blueprintsLoading = false
}) {
  const [esMovil, setEsMovil] = useState(false);
  const [copiadoId, setCopiadoId] = useState(null);
  const [busquedaBlueprint, setBusquedaBlueprint] = useState('');
  const [categoriaBlueprint, setCategoriaBlueprint] = useState('Todos');
  const [origenBlueprints, setOrigenBlueprints] = useState('proyecto');

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

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [planActivo?.mensajes?.length, chatLoading, chatError]);

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

  const handleConsultarBlueprint = (bp) => {
    const prompt = typeof bp.askPrompt === 'function'
      ? bp.askPrompt(planActivo?.titulo)
      : (bp.askPrompt || `¿Cómo implemento ${bp.titulo} en ${planActivo?.titulo || 'mi proyecto'}?`);

    setMensajeChatMentor(prompt);
    if (enviarMensajeMentor && planActivo?.id && !chatLoading) {
      enviarMensajeMentor(null, prompt);
      const chatColumn = document.querySelector('.mentor-chat-column');
      if (chatColumn && window.innerWidth <= 1024) {
        chatColumn.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const blueprintsDelProyecto = (() => {
    if (!planActivo?.blueprints) return [];
    if (Array.isArray(planActivo.blueprints)) return planActivo.blueprints;
    try {
      const parsed = JSON.parse(planActivo.blueprints);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const listaBase = origenBlueprints === 'proyecto' ? blueprintsDelProyecto : LISTA_BLUEPRINTS;

  const blueprintsFiltrados = listaBase.filter(bp => {
    const coincideCategoria = categoriaBlueprint === 'Todos' || bp.categoria === categoriaBlueprint;
    const q = normalizarTexto(busquedaBlueprint.trim());
    const catAlias = ALIAS_CATEGORIAS[q];
    const coincideBusqueda = !q || 
      normalizarTexto(bp.titulo).includes(q) || 
      normalizarTexto(bp.desc).includes(q) ||
      normalizarTexto(bp.categoria).includes(q) ||
      (catAlias && bp.categoria === catAlias) ||
      (bp.tags && normalizarTexto(Array.isArray(bp.tags) ? bp.tags.join(' ') : bp.tags).includes(q)) ||
      (bp.snippet && normalizarTexto(bp.snippet).includes(q));
    return coincideCategoria && coincideBusqueda;
  });

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
                  <Layers size={14} /> Blueprints & Recursos {blueprintsDelProyecto.length > 0 ? `(${blueprintsDelProyecto.length})` : `(${LISTA_BLUEPRINTS.length})`}
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
                  <div className="blueprints-header">
                    <div className="blueprints-header-top">
                      <div>
                        <h3>📐 Blueprints Arquitectónicos & Recursos</h3>
                        <p className="text-xs text-slate-400">
                          {origenBlueprints === 'proyecto'
                            ? `Andamios técnicos generados dinámicamente con IA adaptados al stack de "${planActivo?.titulo || 'tu proyecto'}".`
                            : `Plantillas y andamios arquitectónicos estándar listos para producción (${LISTA_BLUEPRINTS.length} disponibles).`}
                        </p>
                      </div>

                      <div className="blueprints-header-actions">
                        <div className="bp-source-switch">
                          <button
                            type="button"
                            className={`btn-bp-source ${origenBlueprints === 'proyecto' ? 'active' : ''}`}
                            onClick={() => setOrigenBlueprints('proyecto')}
                          >
                            🎯 Para este Proyecto ({blueprintsDelProyecto.length})
                          </button>
                          <button
                            type="button"
                            className={`btn-bp-source ${origenBlueprints === 'biblioteca' ? 'active' : ''}`}
                            onClick={() => setOrigenBlueprints('biblioteca')}
                          >
                            📚 Biblioteca Base ({LISTA_BLUEPRINTS.length})
                          </button>
                        </div>

                        {origenBlueprints === 'proyecto' && (
                          <button
                            type="button"
                            className="btn-bp-generate-ai"
                            disabled={blueprintsLoading || !planActivo?.id}
                            onClick={() => generarBlueprintsDinamicos?.(planActivo?.id)}
                            title="Generar nuevos blueprints personalizados con IA para este proyecto"
                          >
                            {blueprintsLoading ? (
                              <>
                                <RefreshCw size={13} className="animate-spin" />
                                <span>Generando con IA...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={13} />
                                <span>{blueprintsDelProyecto.length > 0 ? 'Regenerar con IA' : 'Generar con IA'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Barra de búsqueda y categorías */}
                    <div className="blueprints-toolbar">
                      <div className="blueprints-search-bar">
                        <Search size={14} className="blueprints-search-icon" />
                        <input
                          type="text"
                          placeholder={origenBlueprints === 'proyecto' ? "Buscar en blueprints de este proyecto..." : "Buscar blueprint o snippet..."}
                          value={busquedaBlueprint}
                          onChange={(e) => setBusquedaBlueprint(e.target.value)}
                          className="blueprints-search-input"
                        />
                        {busquedaBlueprint && (
                          <button
                            type="button"
                            className="blueprints-search-clear"
                            onClick={() => setBusquedaBlueprint('')}
                            title="Limpiar búsqueda"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="blueprints-categories-bar">
                        {BLUEPRINT_CATEGORIAS.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            className={`bp-category-btn ${categoriaBlueprint === cat ? 'active' : ''}`}
                            onClick={() => setCategoriaBlueprint(cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {origenBlueprints === 'proyecto' && blueprintsDelProyecto.length === 0 ? (
                    <div className="blueprints-dynamic-generator-card">
                      <div className="bp-gen-icon-wrap">
                        <Sparkles size={30} className="text-indigo-400 animate-pulse" />
                      </div>
                      <h4>Generar Blueprints Específicos con IA</h4>
                      <p>
                        Cada proyecto tiene requerimientos y stacks únicos. Pulsa para que el Arquitecto IA analice el alcance, stack tecnológico y contratos de <strong>"{planActivo?.titulo}"</strong> y diseñe entre 4 y 6 andamios de código 100% personalizados y listos para producción.
                      </p>
                      <div className="bp-gen-actions">
                        <button
                          type="button"
                          className="btn-bp-generate-cta"
                          disabled={blueprintsLoading || !planActivo?.id}
                          onClick={() => generarBlueprintsDinamicos?.(planActivo?.id)}
                        >
                          {blueprintsLoading ? (
                            <>
                              <RefreshCw size={15} className="animate-spin" />
                              <span>Diseñando Blueprints con IA...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={15} />
                              <span>✨ Generar Blueprints para "{planActivo?.titulo}"</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn-bp-switch-library"
                          onClick={() => setOrigenBlueprints('biblioteca')}
                        >
                          📚 Ver Biblioteca Base ({LISTA_BLUEPRINTS.length})
                        </button>
                      </div>
                    </div>
                  ) : blueprintsFiltrados.length === 0 ? (
                    <div className="blueprints-empty-state">
                      <p className="text-sm text-slate-400">No se encontraron blueprints con los filtros aplicados en esta vista.</p>
                      <button
                        type="button"
                        className="btn-bp-reset"
                        onClick={() => {
                          setBusquedaBlueprint('');
                          setCategoriaBlueprint('Todos');
                        }}
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  ) : (
                    <div className="blueprints-grid">
                      {blueprintsFiltrados.map((bp) => {
                        const IconComponent = ICONS_MAP[bp.icono] || Layers;
                        return (
                          <div key={bp.id} className="blueprint-card">
                            <div className="blueprint-card-top">
                              <div className="flex items-center gap-2">
                                <IconComponent size={16} className={getIconColorClass(bp.tagClass)} />
                                <h4 className="font-semibold text-white text-sm">{bp.titulo}</h4>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {origenBlueprints === 'proyecto' && (
                                  <span className="bp-dyn-badge" title="Blueprint adaptado dinámicamente a este proyecto">⚡ IA Proyecto</span>
                                )}
                                <span className={`bp-tag ${bp.tagClass}`}>{bp.categoria}</span>
                              </div>
                            </div>
                            <p className="bp-desc">{bp.desc}</p>
                            <pre className="bp-code-snippet">{bp.snippet}</pre>
                            <div className="bp-card-actions">
                              <button
                                type="button"
                                className="btn-bp-copy"
                                onClick={() => copiarTexto(bp.id, bp.copyText || bp.snippet)}
                              >
                                {copiadoId === bp.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                <span>{copiadoId === bp.id ? 'Copiado' : 'Copiar Código'}</span>
                              </button>
                              <button
                                type="button"
                                className="btn-bp-ask"
                                disabled={chatLoading}
                                onClick={() => handleConsultarBlueprint(bp)}
                                title={chatLoading ? 'Esperando respuesta del mentor...' : 'Enviar consulta al mentor'}
                              >
                                💬 Consultar al Mentor
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  <div className="chat-message mentor loading-message animate-fade-in">
                    <div className="message-sender">Mentor de Software</div>
                    <div className="message-text loading-bubble">
                      <div className="flex items-center justify-between gap-3">
                        <span className="pulse-dots">Analizando arquitectura y generando guía...</span>
                        {cancelarConsultaMentor && (
                          <button
                            type="button"
                            className="btn-cancel-generation"
                            onClick={cancelarConsultaMentor}
                            title="Cancelar generación si toma demasiado tiempo"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {chatError && (
                  <div className="chat-message mentor chat-error-alert animate-fade-in">
                    <div className="message-sender text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      <span>Servicio del Mentor IA</span>
                    </div>
                    <div className="message-text error-bubble">
                      <p className="error-message-text">{chatError.mensaje}</p>
                      <span className="error-advice">
                        El servicio puede estar experimentando alta demanda o una desconexión temporal. Tu consulta sigue guardada.
                      </span>
                      <div className="error-actions-strip">
                        <button
                          type="button"
                          className="btn-retry-chat"
                          onClick={() => {
                            const textoAReintentar = chatError.consultaPendiente || mensajeChatMentor;
                            if (textoAReintentar) {
                              setMensajeChatMentor(textoAReintentar);
                            }
                            if (setChatError) setChatError(null);
                            if (enviarMensajeMentor) enviarMensajeMentor(null, textoAReintentar);
                          }}
                        >
                          <RefreshCw size={13} /> Reintentar Consulta
                        </button>
                        <button
                          type="button"
                          className="btn-dismiss-error"
                          onClick={() => {
                            if (setChatError) setChatError(null);
                          }}
                        >
                          Descartar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
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
