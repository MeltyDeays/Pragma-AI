import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useEstudiante } from './EstudianteContext';
import { safeFetchJson } from '../controladores/apiClient';

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
  const [chatError, setChatError] = useState(null);
  const chatAbortControllerRef = useRef(null);

  const cancelarConsultaMentor = () => {
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
      chatAbortControllerRef.current = null;
    }
    setChatLoading(false);
    setChatError({
      mensaje: 'Consulta cancelada por el usuario.',
      consultaPendiente: mensajeChatMentor,
      tipo: 'warning'
    });
  };

  const cargarPlanesMentor = async (id) => {
    if (!id) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/planes/${id}`);
      if (res.ok && Array.isArray(res.data)) {
        setPlanesMentor(res.data);
        if (res.data.length > 0 && !planActivo) {
          setPlanActivo(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error al cargar planes de mentoría:', err);
    }
  };

  const cargarGuiasAyuda = async (planId) => {
    if (!planId) return;
    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/planes/${planId}/documentos`);
      if (res.ok && Array.isArray(res.data)) {
        setGuiasAyuda(res.data);
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
      const res = await safeFetchJson(`${API_BASE}/api/mentor/crear-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          idea_proyecto: ideaProyecto.trim(),
          github_url: githubUrlMentor.trim() || null
        })
      });
      if (res.ok && res.data) {
        mostrarMensaje('¡Plan de desarrollo creado exitosamente por tu Mentor IA!', 'exito');
        setIdeaProyecto('');
        setGithubUrlMentor('');
        await cargarPlanesMentor(estudiante.id);
        setPlanActivo(res.data);
      } else {
        mostrarMensaje(res.error || 'Error al generar el plan.', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al conectar con el Mentor IA.', 'error');
    } finally {
      setMentorLoading(false);
    }
  };

  const enviarMensajeChatMentor = async (e, textoCustom = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const textoAEnviar = (textoCustom !== null ? textoCustom : mensajeChatMentor).trim();
    if (!textoAEnviar || !planActivo || !estudiante) return;

    setChatError(null);
    setChatLoading(true);

    const controller = new AbortController();
    chatAbortControllerRef.current = controller;
    
    // Incrementar en localStorage mensajes mentor para evaluar logros
    const key = `ia_profesor_mensajes_mentor_${estudiante.id}`;
    const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
    localStorage.setItem(key, count.toString());

    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planActivo.id,
          mensaje: textoAEnviar,
          personalidad: personalidadMentor
        }),
        signal: controller.signal,
        timeoutMs: 45000
      });

      if (res.ok && res.data) {
        const nuevosBps = Array.isArray(res.data.blueprints) ? res.data.blueprints : null;
        setPlanActivo(prev => ({
          ...prev,
          mensajes: res.data.mensajes || prev.mensajes,
          ...(nuevosBps ? { blueprints: nuevosBps } : {})
        }));
        if (nuevosBps) {
          setPlanesMentor(prev => prev.map(p => p.id === planActivo.id ? { ...p, blueprints: nuevosBps } : p));
        }
        if (res.data.nuevo_blueprint?.titulo) {
          mostrarMensaje(`⚡ ¡Nuevo Blueprint detectado y añadido: "${res.data.nuevo_blueprint.titulo}"!`, 'exito');
        }
        setMensajeChatMentor('');
        setChatError(null);
        await cargarGuiasAyuda(planActivo.id);
        await cargarEstado(estudiante.id);
      } else {
        const errorMsg = res.error || 'Error en el chat con el mentor.';
        setChatError({
          mensaje: errorMsg,
          consultaPendiente: textoAEnviar,
          tipo: 'error'
        });
        mostrarMensaje(errorMsg, 'error');
      }
    } catch (err) {
      console.error(err);
      setChatError({
        mensaje: 'Error de red al enviar mensaje al mentor.',
        consultaPendiente: textoAEnviar,
        tipo: 'error'
      });
      mostrarMensaje('Error de red al enviar mensaje al mentor.', 'error');
    } finally {
      chatAbortControllerRef.current = null;
      setChatLoading(false);
    }
  };

  const regenerarGuiaAyuda = async (docId) => {
    if (!docId || !planActivo) return;
    setRegeneratingGuiaId(docId);
    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/documentos/regenerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento_id: docId })
      });
      if (res.ok && res.data) {
        mostrarMensaje('Guía técnica regenerada con éxito por tu Mentor.', 'exito');
        await cargarGuiasAyuda(planActivo.id);
        await cargarPlanesMentor(estudiante.id);
        const planesAct = planesMentor.map(p => p.id === planActivo.id ? { ...p, mensajes: res.data.mensajes || p.mensajes } : p);
        const planMatch = planesAct.find(p => p.id === planActivo.id);
        if (planMatch) setPlanActivo(planMatch);
      } else {
        mostrarMensaje(res.error || 'Error al regenerar guía.', 'error');
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

  const [blueprintsLoading, setBlueprintsLoading] = useState(false);

  const generarBlueprintsDinamicos = async (planId, enfoque = null) => {
    if (!planId) return null;
    setBlueprintsLoading(true);
    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/planes/${planId}/generar-blueprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enfoque })
      });
      if (res.ok && res.data && Array.isArray(res.data.blueprints)) {
        mostrarMensaje('¡Blueprints arquitectónicos personalizados generados con IA!', 'exito');
        const nuevosBps = res.data.blueprints;
        setPlanActivo(prev => prev && prev.id === planId ? { ...prev, blueprints: nuevosBps } : prev);
        setPlanesMentor(prev => prev.map(p => p.id === planId ? { ...p, blueprints: nuevosBps } : p));
        return nuevosBps;
      } else {
        mostrarMensaje(res.error || 'No se pudieron generar los blueprints dinámicos.', 'error');
        return null;
      }
    } catch (err) {
      console.error('Error al generar blueprints dinámicos:', err);
      mostrarMensaje('Error de red al generar blueprints dinámicos.', 'error');
      return null;
    } finally {
      setBlueprintsLoading(false);
    }
  };

  const [regenerandoPlan, setRegenerandoPlan] = useState(false);
  const [regenerandoWord, setRegenerandoWord] = useState(false);

  const regenerarPlanMentor = async (planId, enfoque = null, instrucciones = null) => {
    if (!planId) return null;
    setRegenerandoPlan(true);
    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/planes/${planId}/regenerar-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enfoque: enfoque || null,
          instrucciones_adicionales: instrucciones || null
        }),
        timeoutMs: 65000
      });
      if (res.ok && res.data && res.data.plan) {
        mostrarMensaje('¡Plan de desarrollo regenerado y enriquecido con éxito!', 'exito');
        const planActualizado = res.data.plan;
        setPlanActivo(planActualizado);
        setPlanesMentor(prev => prev.map(p => p.id === planId ? planActualizado : p));
        await cargarPlanesMentor(estudiante?.id);
        return planActualizado;
      } else {
        mostrarMensaje(res.error || 'Error al regenerar el plan.', 'error');
        return null;
      }
    } catch (err) {
      console.error('Error al regenerar plan mentor:', err);
      mostrarMensaje('Error de red al regenerar el plan.', 'error');
      return null;
    } finally {
      setRegenerandoPlan(false);
    }
  };

  const regenerarWordPlan = async (planId) => {
    if (!planId) return null;
    setRegenerandoWord(true);
    try {
      const res = await safeFetchJson(`${API_BASE}/api/mentor/planes/${planId}/regenerar-word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok && res.data && res.data.word_url) {
        mostrarMensaje('¡Documento Word reconstruido con formato enriquecido!', 'exito');
        setPlanActivo(prev => prev && prev.id === planId ? { ...prev, word_url: res.data.word_url } : prev);
        setPlanesMentor(prev => prev.map(p => p.id === planId ? { ...p, word_url: res.data.word_url } : p));
        return res.data.word_url;
      } else {
        mostrarMensaje(res.error || 'Error al reconstruir documento Word.', 'error');
        return null;
      }
    } catch (err) {
      console.error('Error al regenerar word:', err);
      mostrarMensaje('Error de red al regenerar documento Word.', 'error');
      return null;
    } finally {
      setRegenerandoWord(false);
    }
  };

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
      chatError,
      setChatError,
      cancelarConsultaMentor,
      crearPlanMentor,
      enviarMensajeChatMentor,
      regenerarGuiaAyuda,
      generarBlueprintsDinamicos,
      blueprintsLoading,
      regenerandoPlan,
      regenerandoWord,
      regenerarPlanMentor,
      regenerarWordPlan
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
