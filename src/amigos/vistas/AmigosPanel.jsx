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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Panel Izquierdo: Identidad de Estudiante & Agregar Amigo */}
        <section className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-base leading-tight">Comunidad de Estudiantes</h3>
                <p className="text-xs text-slate-400">Conecta y practica con otros compañeros</p>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 mb-6">
              <span className="text-xs font-medium text-slate-400 block mb-2">Tu ID de Estudiante:</span>
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 break-all">
                <span>{estudiante?.id}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(estudiante?.id || '');
                    mostrarMensaje('¡ID copiado al portapapeles!', 'success');
                  }}
                  className="text-slate-400 hover:text-white transition ml-2 p-1 rounded hover:bg-slate-800 cursor-pointer"
                  title="Copiar ID"
                >
                  <Copy size={15} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Comparte este identificador con tus amigos para que te agreguen.</p>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Agregar Amigo por ID</h4>
              <form onSubmit={enviarSolicitudAmistad} className="flex flex-col gap-2.5">
                <input 
                  type="text" 
                  placeholder="Pega el ID único del estudiante..."
                  value={inputIdAmigo}
                  onChange={(e) => setInputIdAmigo(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
                <button 
                  type="submit" 
                  disabled={loadingAmigos || !inputIdAmigo.trim()} 
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition cursor-pointer"
                >
                  {loadingAmigos ? <RefreshCw className="animate-spin" size={15} /> : <UserPlus size={15} />}
                  <span>Enviar Solicitud</span>
                </button>
              </form>

              {mensajeAmistad.texto && (
                <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium border ${
                  mensajeAmistad.tipo === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {mensajeAmistad.texto}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Panel Derecho: Lista de Amigos & Notificaciones de Pendientes */}
        <section className="lg:col-span-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl shadow-black/30 flex flex-col">
          <div className="flex justify-between items-center flex-wrap gap-3 pb-4 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users size={18} />
              </div>
              <h3 className="text-white font-semibold text-base">Mis Amigos ({listaAmigos.length})</h3>
            </div>
            
            {/* Buscador de amigos */}
            {listaAmigos.length > 0 && (
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Buscar amigos por nombre..." 
                  value={filtroAmigos}
                  onChange={(e) => setFiltroAmigos(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-52 transition-all"
                />
              </div>
            )}
          </div>

          {/* Solicitudes de Amistad Recibidas (Pendientes) */}
          {solicitudesPendientes.length > 0 && (
            <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <h4 className="text-amber-400 font-semibold text-xs mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Solicitudes de Amistad Recibidas ({solicitudesPendientes.length})
              </h4>
              <div className="flex flex-col gap-2">
                {solicitudesPendientes.map((req) => (
                  <div 
                    key={req.id} 
                    className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition"
                  >
                    <div>
                      <span className="text-white font-medium text-sm block">{req.solicitante_nombre}</span>
                      <span className="text-xs text-slate-500 font-mono block truncate max-w-[220px]">{req.solicitante_id}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => responderSolicitudAmistad(req.id, 'aceptar')}
                        className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                        title="Aceptar solicitud"
                      >
                        <Check size={14} />
                        <span>Aceptar</span>
                      </button>
                      <button 
                        onClick={() => responderSolicitudAmistad(req.id, 'rechazar')}
                        className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                        title="Rechazar solicitud"
                      >
                        <X size={14} />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Amigos Aceptados */}
          {listaAmigos.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Users size={40} className="mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-sm font-medium text-slate-400">Aún no has agregado a ningún compañero.</p>
              <p className="text-xs text-slate-500 mt-1">Comparte tu ID de estudiante para comenzar a colaborar y competir.</p>
            </div>
          ) : amigosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No se encontraron amigos que coincidan con "{filtroAmigos}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-1">
              {amigosFiltrados.map((amigo) => {
                const online = estaOnline ? estaOnline(amigo.ultima_conexion) : false;
                const inicial = amigo.nombre ? amigo.nombre.charAt(0).toUpperCase() : 'E';
                return (
                  <div 
                    key={amigo.id} 
                    className="bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                            {inicial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                              <span className="text-white font-medium text-sm">{amigo.nombre}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[11px] text-slate-500 block truncate max-w-[150px] font-mono">{amigo.id}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(amigo.id || '');
                                  mostrarMensaje && mostrarMensaje('¡ID copiado!', 'success');
                                }}
                                className="text-slate-500 hover:text-indigo-400 transition cursor-pointer p-0.5"
                                title="Copiar ID"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-medium">
                          {amigo.nivel_actual || 'Estudiante'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-slate-900">
                      <div className="bg-slate-900/60 rounded-lg px-2.5 py-1.5 border border-slate-800/50 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Ruta de Aprendizaje:</span>
                        <span className="text-slate-200 font-medium">{amigo.tecnologia_actual || 'General'} (Módulo {amigo.tema_indice || 1})</span>
                      </div>

                      {desafiarAmigo1vs1 && (
                        <button
                          onClick={() => desafiarAmigo1vs1(amigo)}
                          className="w-full py-2 bg-slate-900 hover:bg-indigo-600/90 border border-slate-700/60 hover:border-indigo-500 text-slate-200 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                        >
                          <Swords size={14} className="text-indigo-400 group-hover:text-white" />
                          <span>Desafiar 1 vs 1</span>
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
