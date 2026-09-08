import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEstudiante } from './EstudianteContext';
import { safeFetchJson } from '../controladores/apiClient';

const SocialContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export function SocialProvider({ children }) {
  const { estudiante, mostrarMensaje } = useEstudiante();
  const [listaAmigos, setListaAmigos] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [inputIdAmigo, setInputIdAmigo] = useState('');
  const [mensajeAmistad, setMensajeAmistad] = useState({ texto: '', tipo: '' });
  const [loadingAmigos, setLoadingAmigos] = useState(false);
  const [mostrarSocialDropdown, setMostrarSocialDropdown] = useState(false);
  
  const [solicitudesVistas, setSolicitudesVistas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('solicitudes_vistas') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [dueloActivo, setDueloActivo] = useState(null);
  const [amigoChatActivo, setAmigoChatActivo] = useState(null);
  const [mensajesChat, setMensajesChat] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [retarAmigoActivo, setRetarAmigoActivo] = useState(null);
  const [tipoMatchDuelo, setTipoMatchDuelo] = useState('1v1');
  const [modosDueloSeleccionados, setModosDueloSeleccionados] = useState(['trivia']);
  const [duelosRecibidos, setDuelosRecibidos] = useState([]);
  const [dueloEnviadoActivo, setDueloEnviadoActivo] = useState(null);
  const [lenguajeDuelo, setLenguajeDuelo] = useState('JavaScript');
  const [nivelDuelo, setNivelDuelo] = useState('Novato');
  const [partidaDueloActiva, setPartidaDueloActiva] = useState(null);
  const [toastActivo, setToastActivo] = useState(null);

  const cargarAmigosYSolicitudes = async (id) => {
    if (!id) return;
    try {
      const [amigosRes, pendientesRes] = await Promise.all([
        safeFetchJson(`${API_BASE}/api/amistades/listar/${id}`),
        safeFetchJson(`${API_BASE}/api/amistades/pendientes/${id}`)
      ]);
      if (amigosRes.ok && Array.isArray(amigosRes.data)) {
        setListaAmigos(amigosRes.data);
      }
      if (pendientesRes.ok && Array.isArray(pendientesRes.data)) {
        const pendientesData = pendientesRes.data;
        setSolicitudesPendientes(pendientesData);
        const pendientesIds = pendientesData.map(r => r.id);
        setSolicitudesVistas(prev => {
          const filtrados = prev.filter(pId => pendientesIds.includes(pId));
          localStorage.setItem('solicitudes_vistas', JSON.stringify(filtrados));
          return filtrados;
        });
      }
    } catch (err) {
      console.error('Error al cargar amigos/solicitudes:', err);
    }
  };

  const enviarSolicitudAmistad = async (e) => {
    e.preventDefault();
    if (!inputIdAmigo.trim() || !estudiante) return;
    setLoadingAmigos(true);
    setMensajeAmistad({ texto: '', tipo: '' });
    try {
      const res = await safeFetchJson(`${API_BASE}/api/amistades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitante_id: estudiante.id, receptor_id: inputIdAmigo.trim() })
      });
      if (res.ok && res.data) {
        setMensajeAmistad({ texto: res.data.mensaje || 'Solicitud enviada.', tipo: 'success' });
        setInputIdAmigo('');
        cargarAmigosYSolicitudes(estudiante.id);
      } else {
        setMensajeAmistad({ texto: res.error || 'Error al enviar solicitud.', tipo: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMensajeAmistad({ texto: 'Error de red al enviar la solicitud.', tipo: 'error' });
    } finally {
      setLoadingAmigos(false);
    }
  };

  const responderSolicitudAmistad = async (solicitudId, accion) => {
    if (!estudiante) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/amistades/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitud_id: solicitudId, accion })
      });
      if (res.ok && res.data) {
        mostrarMensaje(res.data.mensaje || 'Solicitud procesada.', 'success');
        cargarAmigosYSolicitudes(estudiante.id);
      } else {
        mostrarMensaje(res.error || 'Error al responder la solicitud.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de red al responder.', 'error');
    }
  };

  const eliminarAmigo = async (amigoId) => {
    if (!estudiante) return;
    if (!confirm('¿Estás seguro de que deseas eliminar a este amigo de tu lista táctica social?')) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/amistades/eliminar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, amigo_id: amigoId })
      });
      if (res.ok && res.data) {
        mostrarMensaje(res.data.mensaje || 'Amigo eliminado.', 'success');
        cargarAmigosYSolicitudes(estudiante.id);
      } else {
        mostrarMensaje(res.error || 'Error al eliminar amigo.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de red al eliminar amigo.', 'error');
    }
  };

  const cargarMensajesChat = async (amigoId) => {
    if (!estudiante) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/chats/listar/${estudiante.id}/${amigoId}`);
      if (res.ok && Array.isArray(res.data)) {
        setMensajesChat(res.data);
      }
    } catch (err) {
      console.error("Error al cargar mensajes de chat:", err);
    }
  };

  const enviarMensajeChat = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !estudiante || !amigoChatActivo) return;
    setLoadingChat(true);
    try {
      const res = await safeFetchJson(`${API_BASE}/api/chats/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remitente_id: estudiante.id,
          remitente_nombre: estudiante.nombre,
          destinatario_id: amigoChatActivo.id,
          destinatario_nombre: amigoChatActivo.nombre,
          mensaje: nuevoMensaje.trim()
        })
      });
      if (res.ok) {
        setNuevoMensaje('');
        await cargarMensajesChat(amigoChatActivo.id);
      } else {
        mostrarMensaje(res.error || 'Error al enviar mensaje.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al enviar mensaje.', 'error');
    } finally {
      setLoadingChat(false);
    }
  };

  const enviarInvitacionDuelo = async () => {
    if (!estudiante || !retarAmigoActivo) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/duelos/invitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retador_id: estudiante.id,
          retador_nombre: estudiante.nombre,
          retado_id: retarAmigoActivo.id,
          retado_nombre: retarAmigoActivo.nombre,
          tipo_match: tipoMatchDuelo,
          modos: modosDueloSeleccionados,
          lenguaje: lenguajeDuelo,
          nivel: nivelDuelo
        })
      });
      if (res.ok && res.data) {
        mostrarMensaje(`Invitación de duelo enviada a ${retarAmigoActivo.nombre}`, 'success');
        setDueloEnviadoActivo(res.data.duelo);
        setRetarAmigoActivo(null);
      } else {
        mostrarMensaje(res.error || 'Error al enviar invitación.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al enviar la invitación.', 'error');
    }
  };

  const cargarDuelosPendientes = async (id) => {
    if (!id) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/duelos/pendientes/${id}`);
      if (res.ok && Array.isArray(res.data)) {
        setDuelosRecibidos(res.data);
      }
    } catch (err) {
      console.error("Error al obtener duelos pendientes:", err);
    }
  };

  const responderDuelo = async (dueloId, accion) => {
    try {
      const res = await safeFetchJson(`${API_BASE}/api/duelos/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelo_id: dueloId, accion })
      });
      if (res.ok && res.data) {
        mostrarMensaje(`Duelo ${accion === 'aceptar' ? 'aceptado' : 'rechazado'}.`, 'success');
        if (accion === 'aceptar' && res.data.duelo) {
          setPartidaDueloActiva(res.data.duelo);
        }
        if (estudiante) cargarDuelosPendientes(estudiante.id);
      } else {
        mostrarMensaje(res.error || 'Error al responder al duelo.', 'error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Efecto para sincronizar eventos en tiempo real mediante SSE
  useEffect(() => {
    if (!estudiante?.id) return;

    const eventSource = new EventSource(`${API_BASE}/api/realtime/stream/${estudiante.id}`);

    eventSource.addEventListener('nueva_amistad', (e) => {
      try {
        const data = JSON.parse(e.data);
        mostrarMensaje(`Nueva solicitud de amistad de ${data.solicitante_nombre}`, 'success');
        setToastActivo({
          id: `amistad_${data.solicitud_id}`,
          tipo: 'amistad',
          titulo: '🤝 SOLICITUD DE AMISTAD',
          descripcion: `${data.solicitante_nombre} quiere unirse a tu red social táctica.`,
          countdownTotal: 15,
          accionLabel: 'ACEPTAR',
          rechazarLabel: 'RECHAZAR',
          onAccion: () => {
            responderSolicitudAmistad(data.solicitud_id, 'aceptar');
            setToastActivo(null);
          },
          onRechazar: () => {
            responderSolicitudAmistad(data.solicitud_id, 'rechazar');
            setToastActivo(null);
          }
        });
        cargarAmigosYSolicitudes(estudiante.id);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('amistad_aceptada', (e) => {
      try {
        const data = JSON.parse(e.data);
        mostrarMensaje(`¡${data.receptor_nombre} aceptó tu solicitud de amistad!`, 'exito');
        cargarAmigosYSolicitudes(estudiante.id);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('nuevo_duelo', (e) => {
      try {
        const data = JSON.parse(e.data);
        mostrarMensaje(`¡Desafío entrante de ${data.retador_nombre}! Revisa tus combates pendientes.`, 'success');
        setToastActivo({
          id: `duelo_${data.id}`,
          tipo: 'duelo',
          titulo: '⚔️ DESAFÍO TÁCTICO ENTRANTE',
          descripcion: `¡${data.retador_nombre} te ha desafiado en ${data.lenguaje || 'Código'} (${data.nivel || 'Intermedio'})!`,
          countdownTotal: 15,
          accionLabel: 'COMBATIR',
          rechazarLabel: 'DECLINAR',
          onAccion: () => {
            responderDuelo(data.id, 'aceptar');
            setToastActivo(null);
          },
          onRechazar: () => {
            responderDuelo(data.id, 'rechazar');
            setToastActivo(null);
          }
        });
        cargarDuelosPendientes(estudiante.id);
      } catch (err) {
        console.error(err);
      }
    });

    eventSource.addEventListener('duelo_aceptado', (e) => {
      try {
        const data = JSON.parse(e.data);
        mostrarMensaje(`¡${data.retado_nombre} ha aceptado tu desafío! Entrando a la arena...`, 'success');
        setPartidaDueloActiva(data);
        setDueloEnviadoActivo(null);
      } catch (err) {
        console.error("Error al procesar duelo_aceptado:", err);
      }
    });

    eventSource.addEventListener('duelo_rechazado', (e) => {
      try {
        const data = JSON.parse(e.data);
        mostrarMensaje(`El operador ${data.retado_nombre || 'rival'} ha declinado la invitación de combate.`, 'error');
        setDueloEnviadoActivo(null);
      } catch (err) {
        console.error("Error al procesar duelo_rechazado:", err);
      }
    });

    eventSource.addEventListener('duelo_progreso', (e) => {
      try {
        const data = JSON.parse(e.data);
        window.dispatchEvent(new CustomEvent('pragma-progreso-rival', { detail: data }));
      } catch (err) {
        console.error("Error al recibir telemetría del rival:", err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [estudiante]);

  return (
    <SocialContext.Provider value={{
      listaAmigos,
      solicitudesPendientes,
      inputIdAmigo,
      setInputIdAmigo,
      mensajeAmistad,
      loadingAmigos,
      mostrarSocialDropdown,
      setMostrarSocialDropdown,
      solicitudesVistas,
      setSolicitudesVistas,
      dueloActivo,
      setDueloActivo,
      amigoChatActivo,
      setAmigoChatActivo,
      mensajesChat,
      nuevoMensaje,
      setNuevoMensaje,
      loadingChat,
      retarAmigoActivo,
      setRetarAmigoActivo,
      tipoMatchDuelo,
      setTipoMatchDuelo,
      modosDueloSeleccionados,
      setModosDueloSeleccionados,
      duelosRecibidos,
      dueloEnviadoActivo,
      setDueloEnviadoActivo,
      lenguajeDuelo,
      setLenguajeDuelo,
      nivelDuelo,
      setNivelDuelo,
      partidaDueloActiva,
      setPartidaDueloActiva,
      toastActivo,
      setToastActivo,
      cargarAmigosYSolicitudes,
      enviarSolicitudAmistad,
      responderSolicitudAmistad,
      eliminarAmigo,
      cargarMensajesChat,
      enviarMensajeChat,
      enviarInvitacionDuelo,
      responderDuelo,
      cargarDuelosPendientes
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial debe usarse dentro de SocialProvider');
  return context;
}
