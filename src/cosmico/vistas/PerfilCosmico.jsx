import React from 'react';
import { User, Brain, Globe } from 'lucide-react';
import ArbolDeLaVidaCanvas from './ArbolDeLaVidaCanvas';
import { obtenerPosicionesProcedurales } from '../controladores/posicionamiento';

export default function PerfilCosmico({ estudiante, tareas, xpInfo }) {
  // Calcular lenguaje/tecnología más dominado basado en las tareas aprobadas
  const conteoTecnologias = {};
  (tareas || []).forEach(t => {
    if (t.estado === 'Aprobada' || t.estado === 'Aprobado') {
      const tech = t.tecnologia || 'JavaScript';
      conteoTecnologias[tech] = (conteoTecnologias[tech] || 0) + 1;
    }
  });

  let lenguajeMasDominado = estudiante?.tecnologia_actual || 'JavaScript';
  let maxAprobadas = 0;
  Object.entries(conteoTecnologias).forEach(([tech, cant]) => {
    if (cant > maxAprobadas) {
      maxAprobadas = cant;
      lenguajeMasDominado = tech;
    }
  });

  const partidasJugadas = estudiante?.partidas_jugadas || 0;
  const partidasGanadas = estudiante?.partidas_ganadas || 0;
  const winRate = partidasJugadas > 0 ? Math.round((partidasGanadas / partidasJugadas) * 100) : 0;

  return (
    <div className="cosmico-container animate-fade-in">
      <div className="cosmico-header mb-4">
        <h2>🌌 Perfil de Operador y Universo Cognitivo</h2>
        <p>Monitorea tu rango cognitivo, estadísticas tácticas y el Árbol de la Vida que representa tus tecnologías dominadas.</p>
      </div>

      <div className="perfil-cosmico-grid two-columns">
        
        {/* 1. COLUMNA IZQUIERDA: PERFIL DE OPERADOR COGNITIVO */}
        <section className="hud-panel-spec profile-sidebar-panel">
          <div className="panel-header-spec">
            <User size={16} className="text-[#00ffcc]" />
            <h3>PERFIL DE OPERADOR COGNITIVO</h3>
          </div>

          <div className="avatar-hologram-container">
            <div className="avatar-hologram-glow"></div>
            <div className="avatar-hologram-scanline"></div>
            <div className="avatar-frame">
              <div className="avatar-image-fallback">
                <Brain size={48} className="text-[#00ffcc] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="profile-military-specs">
            <div className="section-divider-spec">INFORMACIÓN GENERAL</div>
            <div className="spec-row">
              <span className="spec-label">ESTUDIANTE:</span>
              <span className="spec-val font-bold text-white">{estudiante.nombre}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">RANGO RPG:</span>
              <span className="spec-val text-[#00ffcc] uppercase font-mono">{estudiante.nivel_actual || 'Novato'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">ESTADO DE COGNICIÓN:</span>
              <span className="spec-val text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> ACTIVO
              </span>
            </div>

            <div className="section-divider-spec">MÉTRICAS TÁCTICAS</div>
            <div className="spec-row">
              <span className="spec-label">XP TOTAL ACUMULADA:</span>
              <span className="spec-val font-mono text-amber-400 font-bold">{xpInfo?.xp_total || 0} XP</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">TECNOLOGÍA ACTIVA:</span>
              <span className="spec-val text-cyan-400 font-bold">{estudiante.tecnologia_actual}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">LENGUAJE DOMINANTE:</span>
              <span className="spec-val text-[#00ffcc] font-bold">{lenguajeMasDominado}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">PARTIDAS JUGADAS:</span>
              <span className="spec-val font-mono text-slate-100 font-bold">{partidasJugadas}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">WIN RATE ONLINE:</span>
              <span className={`spec-val font-mono font-bold ${winRate >= 60 ? 'text-emerald-400' : winRate >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>{winRate}%</span>
            </div>
          </div>
        </section>

        {/* 2. COLUMNA DERECHA: EL UNIVERSO COGNITIVO (CONSTELACIONES ESTELARES) */}
        <section className="hud-panel-spec cosmic-canvas-panel flex-1">
          <div className="panel-header-spec">
            <Globe size={16} className="text-[#00ffcc]" />
            <h3>SISTEMA ESTELAR DE CONOCIMIENTOS (ÁRBOL DE LA VIDA)</h3>
          </div>

          {(() => {
            const posiciones = obtenerPosicionesProcedurales(estudiante?.nombre || 'PragmaUser');

            return (
              <div className="cosmico-canvas-container relative w-full h-[550px] bg-black overflow-hidden">
                <ArbolDeLaVidaCanvas 
                  estudiante={estudiante} 
                  tareas={tareas} 
                  posiciones={posiciones} 
                />

                {/* Capas y HUD flotantes del Universo Cognitivo */}
                <div className="absolute top-2.5 left-2.5 z-30 pointer-events-none font-mono text-[9px] text-[#00ffcc] bg-[#020617]/85 border border-[#00ffcc]/20 rounded-md px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-md shadow-lg shadow-black/40">
                  <span className="w-1.5 h-1.5 bg-[#00ffcc] rounded-full animate-ping"></span>
                  TELEMETRÍA DE RED: SECTOR [ {estudiante?.nombre ? estudiante.nombre.toUpperCase() : 'PRAGMA_OPERATOR'} ]
                </div>

                <div className="absolute top-2.5 right-2.5 z-30 pointer-events-none font-mono text-[9px] text-slate-400 bg-[#020617]/85 border border-slate-800 rounded-md px-2.5 py-1 backdrop-blur-md shadow-lg shadow-black/40">
                  SISTEMA: CORE COGNITIVO
                </div>

                {/* Nodos de Esencia (Soles Estelares Únicos de Ciencia Ficción en Coordenadas Procedurales) */}
                {[
                  { name: 'JavaScript', type: 'nuclear-yellow' },
                  { name: 'React', type: 'quantum-cyan' },
                  { name: 'HTML', type: 'plasma-orange' },
                  { name: 'CSS', type: 'nebula-blue' },
                  { name: 'Node.js', type: 'emerald-flow' },
                  { name: 'Supabase', type: 'volt-green' },
                  { name: 'Python', type: 'dual-snake' },
                  { name: 'Java', type: 'solar-gold' },
                  { name: 'C++', type: 'dark-pulsar' }
                ].map((tech) => {
                  const pos = posiciones[tech.name];
                  if (!pos) return null;

                  // Calcular tareas aprobadas directamente
                  const aprobadas = tareas.filter(t => t.tecnologia === tech.name && (t.estado === 'Aprobada' || t.estado === 'Aprobado')).length;
                  
                  // Regla de Oro: Si no ha completado al menos 1 tarea de esa tecnología, NO SE MUESTRA
                  if (aprobadas === 0) return null;

                  const progreso = Math.min(100, aprobadas);

                  // Tamaño de la estrella escala con el progreso
                  const size = Math.max(45, Math.min(110, 40 + progreso * 0.7));

                  return (
                    <div
                      key={tech.name}
                      className={`essence-solar-node star-unique-3d ${tech.type}`}
                      style={{
                        position: 'absolute',
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: `${size}px`,
                        height: `${size}px`,
                        zIndex: 20
                      }}
                    >
                      {/* Efectos 3D orbitantes específicos del tipo de estrella */}
                      <div className="star-3d-orbit-ring"></div>
                      <div className="star-3d-orbit-ring-secondary"></div>
                      <div className="star-solar-corona"></div>
                      
                      <div className="solar-core">
                        <span className="solar-name">{tech.name}</span>
                        <span className="solar-percent">{progreso}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
