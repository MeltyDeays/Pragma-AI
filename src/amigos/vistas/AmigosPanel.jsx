import React, { useState } from 'react';
import { UserPlus, Copy, RefreshCw, Users, Check, X, Swords, Search } from 'lucide-react';

export default function AmigosPanel({
  estudiante,
  mostrarMensaje,
  enviarSolicitudAmistad,
  inputIdAmigo,
  setInputIdAmigo,
  loadingAmigos,
  mensajeAmistad,
  listaAmigos = [],
  solicitudesPendientes = [],
  responderSolicitudAmistad,
  desafiarAmigo1vs1,
  estaOnline
}) {
  const [filtroAmigos, setFiltroAmigos] = useState('');

  const amigosFiltrados = listaAmigos.filter(amigo => {
    const q = filtroAmigos.toLowerCase().trim();
    if (!q) return true;
    return (
      (amigo.nombre && amigo.nombre.toLowerCase().includes(q)) ||
      (amigo.tecnologia_actual && amigo.tecnologia_actual.toLowerCase().includes(q)) ||
      (amigo.id && amigo.id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="amigos-tab-container animate-fade-in">
      <div className="dashboard-grid">
        
        {/* Panel Izquierdo: Tu Identidad Militar & Agregar Amigo */}
        <section className="dashboard-panel identity-panel">
          <div className="panel-header-spec">
            <UserPlus size={18} className="text-[#00ffcc]" />
            <h3>REGISTRO TÁCTICO SOCIAL</h3>
          </div>

          <div className="identity-card-hud">
            <p className="text-sm text-slate-400 mb-2">Tu identificador único de estudiante para compartir con tus amigos:</p>
            <div className="student-id-display flex items-center justify-between bg-slate-900 border border-slate-700/60 rounded px-3 py-2 text-sm font-mono text-[#00ffcc] break-all">
              <span>{estudiante?.id}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(estudiante?.id || '');
                  mostrarMensaje('¡ID copiado al portapapeles!', 'success');
                }}
                className="copy-btn hover:text-white transition ml-2 p-1 cursor-pointer"
                title="Copiar ID"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="add-friend-form-container mt-6">
            <h4>Agregar Amigo por ID</h4>
            <form onSubmit={enviarSolicitudAmistad} className="flex flex-col gap-3 mt-2">
              <input 
                type="text" 
                placeholder="Pega el ID único de tu amigo..."
                value={inputIdAmigo}
                onChange={(e) => setInputIdAmigo(e.target.value)}
                className="hud-input font-mono text-xs"
              />
              <button 
                type="submit" 
                disabled={loadingAmigos} 
                className="hud-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                {loadingAmigos ? <RefreshCw className="animate-spin" size={16} /> : <UserPlus size={16} />}
                <span>Enviar Solicitud</span>
              </button>
            </form>
            {mensajeAmistad.texto && (
              <div className={`alert-toast-mini mt-3 ${mensajeAmistad.tipo === 'success' ? 'success' : 'error'}`}>
                {mensajeAmistad.texto}
              </div>
            )}
          </div>
        </section>

        {/* Panel Derecho: Lista de Amigos & Notificaciones de Pendientes */}
        <section className="dashboard-panel friends-list-panel flex-1">
          <div className="panel-header-spec flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#00ffcc]" />
              <h3>COGNICIÓN COMPARTIDA ({listaAmigos.length})</h3>
            </div>
            
            {/* Buscador táctico de amigos */}
            {listaAmigos.length > 0 && (
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-slate-500 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Filtrar operadores..."
                  value={filtroAmigos}
                  onChange={(e) => setFiltroAmigos(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-full pl-8 pr-3 py-1 text-xs font-mono text-slate-200 focus:border-[#00ffcc] outline-none w-48 transition-all"
                />
              </div>
            )}
          </div>

          {/* Solicitudes de Amistad Recibidas (Pendientes) */}
          {solicitudesPendientes.length > 0 && (
            <div className="solicitudes-pendientes-section mb-6 border-b border-slate-800 pb-5">
              <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                Solicitudes de Amistad Recibidas ({solicitudesPendientes.length})
              </h4>
              <div className="flex flex-col gap-3">
                {solicitudesPendientes.map((req) => (
                  <div 
                    key={req.id} 
                    className="pending-request-card flex items-center justify-between bg-slate-900/80 border border-amber-500/30 rounded p-3"
                  >
                    <div>
                      <span className="text-white font-bold block">{req.solicitante_nombre}</span>
                      <span className="text-xs text-slate-500 font-mono block truncate max-w-[200px]">{req.solicitante_id}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => responderSolicitudAmistad(req.id, 'aceptar')}
                        className="hud-btn-action accept flex items-center justify-center bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white p-2 rounded transition cursor-pointer"
                        title="Aceptar"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => responderSolicitudAmistad(req.id, 'rechazar')}
                        className="hud-btn-action reject flex items-center justify-center bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-400 hover:text-white p-2 rounded transition cursor-pointer"
                        title="Rechazar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Amigos Aceptados */}
          {listaAmigos.length === 0 ? (
            <div className="empty-friends-state text-center py-10 text-slate-500">
              <Users size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
              <p>Aún no has agregado a ningún colega a tu red.</p>
              <p className="text-xs text-slate-600 mt-1">Comparte tu ID militar para empezar a comparar constelaciones estelares.</p>
            </div>
          ) : amigosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-xs">
              No se encontraron operadores coincidentes con "{filtroAmigos}".
            </div>
          ) : (
            <div className="friends-grid grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {amigosFiltrados.map((amigo) => {
                const online = estaOnline ? estaOnline(amigo.ultima_conexion) : false;
                return (
                  <div 
                    key={amigo.id} 
                    className="friend-tactical-card hud-panel-spec bg-slate-950/70 border border-slate-800/90 hover:border-[#00ffcc]/50 rounded-lg p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_0_15px_rgba(0,255,204,0.15)]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-600'}`} />
                          <span className="text-white font-bold tracking-wide text-sm">{amigo.nombre}</span>
                        </div>
                        <span className="text-[10px] bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20 px-2 py-0.5 rounded uppercase font-mono font-bold">
                          {amigo.nivel_actual}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3 text-[10px] text-slate-500 font-mono">
                        <span className="truncate max-w-[170px]">{amigo.id}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(amigo.id || '');
                            mostrarMensaje && mostrarMensaje('ID del amigo copiado', 'success');
                          }}
                          className="hover:text-cyan-400 transition cursor-pointer p-0.5"
                          title="Copiar ID de amigo"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-auto">
                      <div className="friend-stats-hud bg-slate-900/60 rounded p-2 border border-slate-800/60 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-400">Ruta:</span>
                        <span className="text-[#00ffcc] font-bold">{amigo.tecnologia_actual || 'General'} (Módulo {amigo.tema_indice || 1})</span>
                      </div>

                      {desafiarAmigo1vs1 && (
                        <button
                          onClick={() => desafiarAmigo1vs1(amigo)}
                          className="w-full py-2 bg-gradient-to-r from-cyan-500/20 via-[#00ffcc]/20 to-indigo-500/20 hover:from-cyan-500/40 hover:to-[#00ffcc]/40 border border-[#00ffcc]/40 hover:border-[#00ffcc] text-[#00ffcc] hover:text-white rounded font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer shadow-[0_0_8px_rgba(0,255,204,0.15)]"
                        >
                          <Swords size={13} className="text-[#00ffcc]" />
                          <span>RETAR A DUELO 1v1</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
}
