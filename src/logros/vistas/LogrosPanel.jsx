import React from 'react';
import { Filter, Unlock, Lock, Trophy } from 'lucide-react';
import { LISTA_LOGROS as DEFAULT_LISTA_LOGROS } from '../modelos/logrosModel';

export default function LogrosPanel({ 
  logrosDesbloqueados = [], 
  LISTA_LOGROS = DEFAULT_LISTA_LOGROS,
  filtroLogros = 'todos', 
  setFiltroLogros 
}) {
  const listaBase = Array.isArray(LISTA_LOGROS) ? LISTA_LOGROS : DEFAULT_LISTA_LOGROS;
  const listaDesbloqueados = Array.isArray(logrosDesbloqueados) ? logrosDesbloqueados : [];
  const totalLogros = listaBase.length;
  const countDesbloqueados = listaDesbloqueados.length;
  const countPendientes = Math.max(0, totalLogros - countDesbloqueados);
  const porcentaje = totalLogros > 0 ? Math.round((countDesbloqueados / totalLogros) * 100) : 0;

  const logrosFiltradosYOrdenados = [...listaBase]
    .filter(logro => {
      const desbloqueado = listaDesbloqueados.includes(logro.id);
      if (filtroLogros === 'completados') return desbloqueado;
      if (filtroLogros === 'pendientes') return !desbloqueado;
      return true;
    })
    .sort((a, b) => {
      const aUnlocked = listaDesbloqueados.includes(a.id);
      const bUnlocked = listaDesbloqueados.includes(b.id);
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      return 0;
    });

  return (
    <div className="logros-container animate-fade-in">
      {/* Header del Medallero */}
      <div className="logros-header">
        <div className="logros-header-icon">
          <Trophy size={26} className="text-amber-400" />
        </div>
        <h2>Medallero de Logros</h2>
        <p>Completa desafíos prácticos y desbloquea insignias exclusivas para tu perfil de estudiante</p>
        
        {/* Barra de Progreso */}
        <div className="logros-progress-bar-container">
          <div className="logros-progress-info">
            <span>Progreso del Medallero</span>
            <span className="logros-progress-stats">
              <strong>{countDesbloqueados}</strong> de {totalLogros} ({porcentaje}%)
            </span>
          </div>
          <div className="logros-progress-bar" role="progressbar" aria-valuenow={porcentaje} aria-valuemin="0" aria-valuemax="100">
            <div 
              className="logros-progress-bar-fill" 
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selector de Filtros */}
      <div className="logros-filters">
        <button 
          type="button" 
          className={`btn-filter ${filtroLogros === 'todos' ? 'active' : ''}`}
          onClick={() => setFiltroLogros && setFiltroLogros('todos')}
        >
          <Filter size={14} /> 
          <span>Todos</span>
          <span className="btn-filter-count">{totalLogros}</span>
        </button>
        <button 
          type="button" 
          className={`btn-filter ${filtroLogros === 'completados' ? 'active' : ''}`}
          onClick={() => setFiltroLogros && setFiltroLogros('completados')}
        >
          <Unlock size={14} /> 
          <span>Completados</span>
          <span className="btn-filter-count">{countDesbloqueados}</span>
        </button>
        <button 
          type="button" 
          className={`btn-filter ${filtroLogros === 'pendientes' ? 'active' : ''}`}
          onClick={() => setFiltroLogros && setFiltroLogros('pendientes')}
        >
          <Lock size={14} /> 
          <span>Pendientes</span>
          <span className="btn-filter-count">{countPendientes}</span>
        </button>
      </div>

      {/* Grid de Tarjetas */}
      <div className="logros-grid">
        {logrosFiltradosYOrdenados.map(logro => {
          const desbloqueado = listaDesbloqueados.includes(logro.id);
          return (
            <div 
              key={logro.id} 
              className={`logro-card ${logro.tipo || 'bronce'} ${desbloqueado ? 'unlocked' : 'locked'}`}
            >
              <div className="logro-card-status">
                {desbloqueado ? (
                  <Unlock size={18} className="icon-unlock" />
                ) : (
                  <Lock size={18} className="icon-lock" />
                )}
              </div>
              <h3>{logro.titulo}</h3>
              <p>{logro.desc}</p>
              <div className="logro-card-footer">
                <span className="logro-xp-reward">+{logro.xp} XP</span>
                <span className="logro-badge-status">
                  {desbloqueado ? 'Desbloqueado' : 'Bloqueado'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
