import React, { createContext, useContext, useState, useEffect } from 'react';
import { useEstudiante } from './EstudianteContext';

const MentorContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export function MentorProvider({ children }) {
  const { estudiante, mostrarMensaje, cargarEstado } = useEstudiante();
  const [ideaProyecto, setIdeaProyecto] = useState('');
  const [githubUrlMentor, setGithubUrlMentor] = useState('');
  const [planesMentor, setPlanesMentor] = useState([]);
  const [planActivo, setPlanActivo] = useState(null);
  const [mensajeChatMentor, setMensajeChatMentor] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [tabMentorColumn, setTabMentorColumn] = useState('plan');
  const [guiasAyuda, setGuiasAyuda] = useState([]);
  const [guiaAyudaSeleccionada, setGuiaAyudaSeleccionada] = useState(null);
  const [regeneratingGuiaId, setRegeneratingGuiaId] = useState(null);
  const [perfilCognitivoExpandido, setPerfilCognitivoExpandido] = useState(false);
  const [personalidadMentor, setPersonalidadMentor] = useState('Riguroso');

  const cargarPlanesMentor = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/mentor/planes/${id}`);
      const data = await res.json();
      if (res.ok) {
        setPlanesMentor(data);
        if (data.length > 0 && !planActivo) {
          setPlanActivo(data[0]);
        }
      }
    } catch (err) {
      console.error('Error al cargar planes de mentoría:', err);
    }
  };

  const cargarGuiasAyuda = async (planId) => {
    if (!planId) return;
    try {
      const res = await fetch(`${API_BASE}/api/mentor/planes/${planId}/documentos`);
      const data = await res.json();
      if (res.ok) {
        setGuiasAyuda(data);
      }
    } catch (err) {
      console.error('Error al cargar guías de ayuda:', err);
    }
  };

  const crearPlanMentor = async (e) => {
    e.preventDefault();
    if (!ideaProyecto.trim() || !estudiante) return;
    setMentorLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/crear-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          idea_proyecto: ideaProyecto.trim(),
          github_url: githubUrlMentor.trim() || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje('¡Plan de desarrollo creado exitosamente por tu Mentor IA!', 'exito');
        setIdeaProyecto('');
        setGithubUrlMentor('');
        await cargarPlanesMentor(estudiante.id);
        setPlanActivo(data);
      } else {
        mostrarMensaje(data.error || 'Error al generar el plan.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al conectar con el Mentor IA.', 'error');
    } finally {
      setMentorLoading(false);
    }
  };

  const enviarMensajeChatMentor = async (e) => {
    e.preventDefault();
    if (!mensajeChatMentor.trim() || !planActivo || !estudiante) return;
    setChatLoading(true);
    
    // Incrementar en localStorage mensajes mentor para evaluar logros
    const key = `ia_profesor_mensajes_mentor_${estudiante.id}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, count.toString());

    try {
      const res = await fetch(`${API_BASE}/api/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planActivo.id,
          mensaje: mensajeChatMentor.trim(),
          personalidad: personalidadMentor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPlanActivo(prev => ({
          ...prev,
          mensajes: data.mensajes
        }));
        setMensajeChatMentor('');
        await cargarGuiasAyuda(planActivo.id);
        await cargarEstado(estudiante.id);
      } else {
        mostrarMensaje(data.error || 'Error en el chat con el mentor.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de red al enviar mensaje al mentor.', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const regenerarGuiaAyuda = async (docId) => {
    if (!docId || !planActivo) return;
    setRegeneratingGuiaId(docId);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/documentos/regenerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento_id: docId })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje('Guía técnica regenerada con éxito por tu Mentor.', 'exito');
        await cargarGuiasAyuda(planActivo.id);
        await cargarPlanesMentor(estudiante.id);
        const planesAct = planesMentor.map(p => p.id === planActivo.id ? { ...p, mensajes: data.mensajes || p.mensajes } : p);
        const planMatch = planesAct.find(p => p.id === planActivo.id);
        if (planMatch) setPlanActivo(planMatch);
      } else {
        mostrarMensaje(data.error || 'Error al regenerar guía.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de red al regenerar guía.', 'error');
    } finally {
      setRegeneratingGuiaId(null);
    }
  };

  useEffect(() => {
    if (estudiante?.id) {
      cargarPlanesMentor(estudiante.id);
    }
  }, [estudiante]);

  useEffect(() => {
    if (planActivo?.id) {
      cargarGuiasAyuda(planActivo.id);
    }
  }, [planActivo]);

  return (
    <MentorContext.Provider value={{
      ideaProyecto,
      setIdeaProyecto,
      githubUrlMentor,
      setGithubUrlMentor,
      planesMentor,
      setPlanesMentor,
      planActivo,
      setPlanActivo,
      mensajeChatMentor,
      setMensajeChatMentor,
      chatLoading,
      mentorLoading,
      tabMentorColumn,
      setTabMentorColumn,
      guiasAyuda,
      guiaAyudaSeleccionada,
      setGuiaAyudaSeleccionada,
      regeneratingGuiaId,
      perfilCognitivoExpandido,
      setPerfilCognitivoExpandido,
      personalidadMentor,
      setPersonalidadMentor,
      crearPlanMentor,
      enviarMensajeChatMentor,
      regenerarGuiaAyuda
    }}>
      {children}
    </MentorContext.Provider>
  );
}

export function useMentor() {
  const context = useContext(MentorContext);
  if (!context) throw new Error('useMentor must be used within MentorProvider');
  return context;
}
