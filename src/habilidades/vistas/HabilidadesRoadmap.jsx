import React from 'react';
import { Filter, GitFork, Lock, Unlock, Check, Zap, Sparkles, Gamepad2 } from 'lucide-react';
import NebulaCanvas from '../../core/vistas/NebulaCanvas';

export default function HabilidadesRoadmap({
  nivelSkillTree,
  setNivelSkillTree,
  estudiante,
  temario,
  habilidadSeleccionada,
  setHabilidadSeleccionada,
  setVistaActiva,
  setMensajeChatMentor
}) {
  const niveles = ['Novato', 'Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Master', 'Arquitecto', 'Leyenda'];

  const nodos = [
    { id: 0, x: 50, y: 8, dependencias: [] },
    { id: 1, x: 25, y: 22, dependencias: [0] },
    { id: 2, x: 75, y: 22, dependencias: [0] },
    { id: 3, x: 25, y: 40, dependencias: [1] },
    { id: 4, x: 75, y: 40, dependencias: [2] },
    { id: 5, x: 50, y: 55, dependencias: [3, 4] },
    { id: 6, x: 20, y: 72, dependencias: [5] },
    { id: 7, x: 80, y: 72, dependencias: [5] },
    { id: 8, x: 50, y: 75, dependencias: [5] },
    { id: 9, x: 50, y: 92, dependencias: [6, 7, 8] }
  ];

  return (
    <div className="perfil-cosmico-layout animate-fade-in">
      <div className="perfil-cosmico-grid two-columns">
        
        {/* 1. COLUMNA IZQUIERDA: FILTROS DE RUTA */}
        <section className="hud-panel-spec profile-sidebar-panel">
          <div className="panel-header-spec">
            <Filter size={16} className="text-[#00ffcc]" />
            <h3>FILTRAR RUTA</h3>
          </div>

          <div className="map-filters-hud">
            <span className="filters-header-title">SELECCIÓN DE NIVEL</span>
            <div className="flex flex-col gap-2 mt-2">
              {niveles.map((lvl, index) => {
                const esActivo = nivelSkillTree === lvl;
                const lvlActual = estudiante.nivel_actual || 'Novato';
                const esDesbloqueado = index <= niveles.indexOf(lvlActual);
                const esNivelActual = lvlActual === lvl;
                const numStr = String(index + 1).padStart(2, '0');

                return (
                  <button
                    key={lvl}
                    type="button"
                    className={`map-filter-btn ${esActivo ? 'active' : ''} ${esNivelActual ? 'current-level' : ''} ${!esDesbloqueado ? 'locked' : 'unlocked'}`}
                    onClick={() => esDesbloqueado && setNivelSkillTree(lvl)}
                  >
                    <div className="filter-btn-inner">
                      <div className="filter-level-number">{numStr}</div>
                      <div className="filter-level-info">
                        <div className="filter-level-name">{lvl}</div>
                        <div className="filter-level-status">
                          {esNivelActual ? (
                            <span className="status-tag active-tag">RANGO ACTUAL</span>
                          ) : esDesbloqueado ? (
                            <span className="status-tag unlocked-tag">DESBLOQUEADO</span>
                          ) : (
                            <span className="status-tag locked-tag">BLOQUEADO</span>
                          )}
                        </div>
                      </div>
                      <div className="filter-level-icon">
                        {esNivelActual ? (
                          <Zap size={12} className="text-[#00ffcc] animate-pulse" />
                        ) : esDesbloqueado ? (
                          <Unlock size={11} className="text-emerald-400" />
                        ) : (
                          <Lock size={11} className="text-slate-600" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. COLUMNA DERECHA: ROADMAP DE HABILIDADES Y CONTROLES */}
        <section className="hud-panel-spec skill-roadmap-panel">
          <div className="panel-header-spec">
            <GitFork size={16} className="text-[#00ffcc]" />
            <h3>ROADMAP ESTELAR ({nivelSkillTree})</h3>
          </div>

          <div className="skill-tree-mini-container relative w-full">
            <NebulaCanvas />
            <svg className="skill-tree-connections absolute inset-0 w-full h-full pointer-events-none">
              {nodos.map(nodo => {
                return nodo.dependencias.map(depId => {
                  const padre = nodos.find(n => n.id === depId);
                  if (!padre) return null;

                  const idxNivel = niveles.indexOf(nivelSkillTree);
                  const temaActivoIndex = (estudiante ? estudiante.tema_indice : 1) - 1;
                  const idxPadre = idxNivel * 10 + padre.id;
                  const idxHijo = idxNivel * 10 + nodo.id;
                  const padreDominado = idxPadre < temaActivoIndex;
                  const hijoDominado = idxHijo < temaActivoIndex;
                  const hijoProgreso = idxHijo === temaActivoIndex;

                  let connClase = 'bloqueado';
                  if (padreDominado && hijoDominado) connClase = 'dominado';
                  else if (padreDominado && hijoProgreso) connClase = 'progreso';

                  return (
                    <line
                      key={`${padre.id}-${nodo.id}`}
                      x1={`${padre.x}%`}
                      y1={`${padre.y}%`}
                      x2={`${nodo.x}%`}
                      y2={`${nodo.y}%`}
                      className={`connection-line ${connClase}`}
                      strokeWidth="1.5"
                    />
                  );
                });
              })}
            </svg>

            {/* Nodos del árbol */}
            {nodos.map(nodo => {
              const idxNivel = niveles.indexOf(nivelSkillTree);
              const idxTema = idxNivel * 10 + nodo.id;
              const tema = temario[idxTema] || `Habilidad ${idxTema + 1}`;
              const temaActivoIndex = (estudiante ? estudiante.tema_indice : 1) - 1;
              const esDominado = idxTema < temaActivoIndex;
              const esEnProgreso = idxTema === temaActivoIndex;

              let estadoClase = 'bloqueado';
              if (esDominado) estadoClase = 'dominado';
              else if (esEnProgreso) estadoClase = 'progreso';

              return (
                <div
                  key={nodo.id}
                  className={`skill-node-card-mini ${estadoClase} ${habilidadSeleccionada?.idx === idxTema ? 'selected' : ''}`}
                  style={{ 
                    position: 'absolute',
                    left: `${nodo.x}%`, 
                    top: `${nodo.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setHabilidadSeleccionada({
                      idx: idxTema,
                      titulo: tema,
                      estado: estadoClase,
                      nodoId: nodo.id,
                      nivel: nivelSkillTree
                    });
                  }}
                >
                  <div className="node-icon-circle-mini">
                    {esDominado ? <Check size={15} /> : esEnProgreso ? <Zap size={15} className="pulse-glow-mini" /> : <Lock size={12} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel de Detalles de Habilidad Seleccionada en la misma columna */}
          <div className="skill-details-mini mt-3" style={{
            background: 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(8,20,40,0.9) 100%)',
            border: '1px solid rgba(0,255,204,0.15)',
            borderRadius: '8px',
            padding: '14px',
            boxShadow: 'inset 0 0 20px rgba(0,255,204,0.03), 0 4px 20px rgba(0,0,0,0.4)',
            boxSizing: 'border-box'
          }}>
            {habilidadSeleccionada ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: habilidadSeleccionada.estado === 'dominado' ? 'radial-gradient(circle, #059669, #064e3b)' :
                                 habilidadSeleccionada.estado === 'progreso' ? 'radial-gradient(circle, #0891b2, #083344)' :
                                 'radial-gradient(circle, rgba(30,41,59,0.9), rgba(15,23,42,0.95))',
                    border: `2px solid ${habilidadSeleccionada.estado === 'dominado' ? '#34d399' : habilidadSeleccionada.estado === 'progreso' ? '#22d3ee' : 'rgba(148,163,184,0.25)'}`,
                    boxShadow: habilidadSeleccionada.estado === 'dominado' ? '0 0 14px rgba(52,211,153,0.5)' :
                                habilidadSeleccionada.estado === 'progreso' ? '0 0 14px rgba(34,211,238,0.5)' : 'none'
                  }}>
                    {habilidadSeleccionada.estado === 'dominado' ? <Check size={18} className="text-white" /> :
                     habilidadSeleccionada.estado === 'progreso' ? <Zap size={18} className="text-white" /> :
                     <Lock size={16} className="text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-widest ${
                        habilidadSeleccionada.estado === 'dominado' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        habilidadSeleccionada.estado === 'progreso' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                        'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                      }`}>
                        {habilidadSeleccionada.estado === 'dominado' ? '✓ ASIMILADO' : habilidadSeleccionada.estado === 'progreso' ? '⚡ EN CURSO' : '🔒 ENCRIPTADO'}
                      </span>
                      <span className="text-[8px] text-slate-600 font-mono">#{habilidadSeleccionada.idx + 1}</span>
                    </div>
                    <h4 className="text-white font-bold text-[11px] tracking-wide leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {habilidadSeleccionada.titulo}
                    </h4>
                  </div>
                </div>

                <div className="mb-3" style={{ height: '3px', borderRadius: '2px', background: 'rgba(30,41,59,0.8)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
                    width: habilidadSeleccionada.estado === 'dominado' ? '100%' : habilidadSeleccionada.estado === 'progreso' ? '45%' : '0%',
                    background: habilidadSeleccionada.estado === 'dominado' ? 'linear-gradient(90deg, #059669, #34d399)' :
                                 'linear-gradient(90deg, #0891b2, #22d3ee)',
                    boxShadow: habilidadSeleccionada.estado !== 'bloqueado' ? '0 0 8px rgba(0,243,255,0.4)' : 'none'
                  }} />
                </div>

                <p className="text-[10px] leading-relaxed mb-3" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  {habilidadSeleccionada.estado === 'bloqueado' ? '🔐 Habilidad encriptada. Supera las misiones anteriores para descifrar este conocimiento.' :
                   habilidadSeleccionada.estado === 'progreso' ? '🎯 Misión activa. Completa desafíos teóricos o prácticos en la Zona de Juegos.' :
                   '✅ Conocimiento asimilado. Acceso completo a este módulo en tu córtex cerebral.'}
                </p>

                {habilidadSeleccionada.estado !== 'bloqueado' && (
                  <div className="action-buttons-roadmap-container">
                    <button
                      type="button"
                      className="btn-action-roadmap btn-action-mentor"
                      onClick={() => {
                        setVistaActiva('mentor');
                        setMensajeChatMentor(`Hola Mentor, estoy en el Árbol de Habilidades y me gustaría que me expliques a detalle con ejemplos prácticos el concepto de: "${habilidadSeleccionada.titulo}".`);
                      }}
                    >
                      <Sparkles size={14} /> MENTOR IA
                    </button>
                    <button
                      type="button"
                      className="btn-action-roadmap btn-action-desafiar"
                      onClick={() => setVistaActiva('juegos')}
                    >
                      <Gamepad2 size={14} /> DESAFIAR
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                <GitFork size={24} className="opacity-30 mb-2" />
                <p className="text-[10px]">Selecciona un nodo del Roadmap para consultar telemetría.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
