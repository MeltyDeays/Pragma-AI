import React from 'react';
import { UserPlus, Copy, RefreshCw, Users, Check, X } from 'lucide-react';

export default function AmigosPanel({
  estudiante,
  mostrarMensaje,
  enviarSolicitudAmistad,
  inputIdAmigo,
  setInputIdAmigo,
  loadingAmigos,
  mensajeAmistad,
  listaAmigos,
  solicitudesPendientes,
  responderSolicitudAmistad
}) {
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
                className="copy-btn hover:text-white transition ml-2 p-1"
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
                className="hud-btn flex items-center justify-center gap-2"
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
          <div className="panel-header-spec">
            <Users size={18} className="text-[#00ffcc]" />
            <h3>COGNICIÓN COMPARTIDA ({listaAmigos.length})</h3>
          </div>

          {/* Solicitudes de Amistad Recibidas (Pendientes) */}
          {solicitudesPendientes.length > 0 && (
            <div className="solicitudes-pendientes-section mb-6 border-b border-slate-800 pb-5">
              <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                Solicitudes de Amistad Recibidas
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
                        className="hud-btn-action accept flex items-center justify-center bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-400 hover:text-white p-2 rounded transition"
                        title="Aceptar"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => responderSolicitudAmistad(req.id, 'rechazar')}
                        className="hud-btn-action reject flex items-center justify-center bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-400 hover:text-white p-2 rounded transition"
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
          ) : (
            <div className="friends-grid grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {listaAmigos.map((amigo) => (
                <div 
                  key={amigo.id} 
                  className="friend-tactical-card hud-panel-spec bg-slate-950/60 border border-slate-800/80 hover:border-[#00ffcc]/40 rounded p-4 flex flex-col justify-between transition duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold tracking-wide text-sm">{amigo.nombre}</span>
                      <span className="text-[10px] bg-[#00ffcc]/10 text-[#00ffcc] border border-[#00ffcc]/20 px-2 py-0.5 rounded uppercase font-mono">
                        {amigo.nivel_actual}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block truncate mb-3">{amigo.id}</span>
                  </div>

                  <div className="friend-stats-hud bg-slate-900/40 rounded p-2 border border-slate-800/40 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Constelación Activa:</span>
                    <span className="text-xs text-[#00ffcc] font-semibold">{amigo.tecnologia_actual} (Módulo {amigo.tema_indice})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
      </div>
    </div>
  );
}
