import React from 'react';
import { Filter, Unlock, Lock } from 'lucide-react';
import { LISTA_LOGROS } from '../modelos/logrosModel';

export default function LogrosPanel({ 
  logrosDesbloqueados, 
  filtroLogros, 
  setFiltroLogros 
}) {
  const logrosFiltradosYOrdenados = [...LISTA_LOGROS]
    .filter(logro => {
      const desbloqueado = logrosDesbloqueados.includes(logro.id);
      if (filtroLogros === 'completados') return desbloqueado;
      if (filtroLogros === 'pendientes') return !desbloqueado;
      return true;
    })
    .sort((a, b) => {
      const aUnlocked = logrosDesbloqueados.includes(a.id);
      const bUnlocked = logrosDesbloqueados.includes(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });

  return (
    <div className="logros-container animate-fade-in">
      <div className="logros-header">
        <h2>🏆 Medallero de Logros Épicos</h2>
        <p>Completa desafíos y desbloquea insignias exclusivas para tu perfil</p>
        <div className="logros-progress-bar-container">
          <div className="logros-progress-info">
            <span>Progreso del Medallero</span>
            <span>{logrosDesbloqueados.length} de {LISTA_LOGROS.length} completados</span>
          </div>
          <div className="logros-progress-bar">
            <div 
              className="logros-progress-bar-fill" 
              style={{ width: `${(logrosDesbloqueados.length / LISTA_LOGROS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="logros-filters">
        <button 
          type="button" 
          className={`btn-filter ${filtroLogros === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltroLogros('todos')}
        >
          <Filter size={14} /> Todos ({LISTA_LOGROS.length})
        </button>
        <button 
          type="button" 
          className={`btn-filter ${filtroLogros === 'completados' ? 'active' : ''}`}
          onClick={() => setFiltroLogros('completados')}
        >
          <Unlock size={14} /> Completados ({logrosDesbloqueados.length})
        </button>
        <button 
          type="button" 
          className={`btn-filter ${filtroLogros === 'pendientes' ? 'active' : ''}`}
          onClick={() => setFiltroLogros('pendientes')}
        >
          <Lock size={14} /> Pendientes ({LISTA_LOGROS.length - logrosDesbloqueados.length})
        </button>
      </div>

      <div className="logros-grid">
        {logrosFiltradosYOrdenados.map(logro => {
          const desbloqueado = logrosDesbloqueados.includes(logro.id);
          return (
            <div key={logro.id} className={`logro-card ${logro.tipo} ${desbloqueado ? 'unlocked' : 'locked'}`}>
              <div className="logro-card-status">
                {desbloqueado ? <Unlock size={20} className="icon-unlock" /> : <Lock size={20} className="icon-lock" />}
              </div>
              <h3>{logro.titulo}</h3>
              <p>{logro.desc}</p>
              <div className="logro-card-footer">
                <span className="logro-xp-reward">+{logro.xp} XP</span>
                <span className="logro-badge-status">{desbloqueado ? 'Desbloqueado' : 'Bloqueado'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
