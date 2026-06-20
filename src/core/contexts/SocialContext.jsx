import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEstudiante } from './EstudianteContext';

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
        fetch(`${API_BASE}/api/amistades/listar/${id}`),
        fetch(`${API_BASE}/api/amistades/pendientes/${id}`)
      ]);
      if (amigosRes.ok) {
        setListaAmigos(await amigosRes.json());
      }
      if (pendientesRes.ok) {
        const pendientesData = await pendientesRes.json();
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
      const res = await fetch(`${API_BASE}/api/amistades/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitante_id: estudiante.id, receptor_id: inputIdAmigo.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setMensajeAmistad({ texto: data.mensaje, tipo: 'success' });
        setInputIdAmigo('');
        cargarAmigosYSolicitudes(estudiante.id);
      } else {
        setMensajeAmistad({ texto: data.error || 'Error al enviar solicitud.', tipo: 'error' });
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
      const res = await fetch(`${API_BASE}/api/amistades/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solicitud_id: solicitudId, accion })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje(data.mensaje, 'success');
        cargarAmigosYSolicitudes(estudiante.id);
      } else {
        mostrarMensaje(data.error || 'Error al responder la solicitud.', 'error');
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
      const res = await fetch(`${API_BASE}/api/amistades/eliminar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, amigo_id: amigoId })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje(data.mensaje, 'success');
        cargarAmigosYSolicitudes(estudiante.id);
      } else {
        mostrarMensaje(data.error || 'Error al eliminar amigo.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de red al eliminar amigo.', 'error');
    }
  };

  const cargarMensajesChat = async (amigoId) => {
    if (!estudiante) return;
    try {
      const res = await fetch(`${API_BASE}/api/chats/listar/${estudiante.id}/${amigoId}`);
      if (res.ok) {
        setMensajesChat(await res.json());
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
      const res = await fetch(`${API_BASE}/api/chats/enviar`, {
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
      const res = await fetch(`${API_BASE}/api/duelos/invitar`, {
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
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje(`Invitación de duelo enviada a ${retarAmigoActivo.nombre}`, 'success');
        setDueloEnviadoActivo(data.duelo);
        setRetarAmigoActivo(null);
      } else {
        mostrarMensaje(data.error || 'Error al enviar invitación.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al enviar la invitación.', 'error');
    }
  };

  const cargarDuelosPendientes = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/duelos/pendientes/${id}`);
      if (res.ok) {
        setDuelosRecibidos(await res.json());
      }
    } catch (err) {
      console.error("Error al obtener duelos pendientes:", err);
    }
  };

  const responderDuelo = async (dueloId, accion) => {
    try {
      const res = await fetch(`${API_BASE}/api/duelos/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelo_id: dueloId, accion })
      });
      if (res.ok) {
        mostrarMensaje(`Duelo ${accion === 'aceptar' ? 'aceptado' : 'rechazado'}.`, 'success');
        if (accion === 'aceptar') {
          // El padre se unirá a la partida
          setPartidaDueloActiva({ id: dueloId });
        }
        if (estudiante) cargarDuelosPendientes(estudiante.id);
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
          titulo: '🤝 SOLICITUD DE AMISTAD',
          descripcion: `${data.solicitante_nombre} quiere unirse a tu red social táctica.`,
          accionLabel: 'ACEPTAR',
          onAccion: () => {
            responderSolicitudAmistad(data.solicitud_id, 'aceptar');
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
          titulo: '⚔️ DESAFÍO ENTRANTE',
          descripcion: `¡${data.retador_nombre} te ha desafiado en ${data.lenguaje} (${data.nivel})!`,
          accionLabel: 'COMBATIR',
          onAccion: () => {
            responderDuelo(data.id, 'aceptar');
            setToastActivo(null);
          }
        });
        cargarDuelosPendientes(estudiante.id);
      } catch (err) {
        console.error(err);
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
