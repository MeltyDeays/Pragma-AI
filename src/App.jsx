import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Award, Download, CheckCircle2, AlertTriangle, Play, RefreshCw, Send, Code, Sparkles, User, LogOut, Check, ChevronRight, Gamepad2, Zap, Brain, Trophy, Target, Shuffle, GitFork, Lock, Unlock, Keyboard, Eye, Filter, Globe, UserPlus, Users, Copy, X, Swords, Trash2, MessageSquare } from 'lucide-react';
import './App.css';

// Componentes React cargados dinámicamente con Lazy Loading (Mejora de performance móvil)
const PragmaGames = React.lazy(() => import('./PragmaGames'));
const NebulaCanvas = React.lazy(() => import('./core/vistas/NebulaCanvas'));
const LogrosPanel = React.lazy(() => import('./logros/vistas/LogrosPanel'));
const ArbolDeLaVidaCanvas = React.lazy(() => import('./cosmico/vistas/ArbolDeLaVidaCanvas'));
const PerfilCosmico = React.lazy(() => import('./cosmico/vistas/PerfilCosmico'));
const HabilidadesRoadmap = React.lazy(() => import('./habilidades/vistas/HabilidadesRoadmap'));
const DashboardRuta = React.lazy(() => import('./ruta/vistas/DashboardRuta'));
const MentorChat = React.lazy(() => import('./mentor/vistas/MentorChat'));
const AmigosPanel = React.lazy(() => import('./amigos/vistas/AmigosPanel'));

import { parsearInlineMarkdown, parsearMarkdownMentor, parsearRequisitos } from './core/controladores/markdown';
import { LISTA_LOGROS } from './logros/modelos/logrosModel';
import { obtenerPosicionesProcedurales } from './cosmico/controladores/posicionamiento';

// Estilos de los Módulos
import './logros/estilos/logros.css';
import './cosmico/estilos/cosmico.css';
import './habilidades/estilos/habilidades.css';
import './ruta/estilos/ruta.css';
import './mentor/estilos/mentor.css';
import './amigos/estilos/amigos.css';

import { useEstudiante } from './core/contexts/EstudianteContext';
import { useSocial } from './core/contexts/SocialContext';
import { useGamificacion } from './core/contexts/GamificacionContext';
import { useMentor } from './core/contexts/MentorContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function App() {
  const {
    estudiante,
    setEstudiante,
    tareas,
    setTareas,
    temario,
    setTemario,
    loading,
    mensaje,
    mostrarMensaje,
    cargarEstado,
    iniciarSesion,
    cerrarSesion
  } = useEstudiante();

  const {
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
  } = useSocial();

  const {
    juegoActivo,
    setJuegoActivo,
    modoJuego,
    setModoJuego,
    juegoData,
    setJuegoData,
    juegoLoading,
    setJuegoLoading,
    juegoResultado,
    setJuegoResultado,
    juegoSeleccion,
    setJuegoSeleccion,
    sorterLineas,
    setSorterLineas,
    fillRespuestas,
    setFillRespuestas,
    flashcardIdx,
    setFlashcardIdx,
    flashcardScore,
    setFlashcardScore,
    flashcardStreak,
    setFlashcardStreak,
    xpInfo,
    setXpInfo,
    typerInput,
    setTyperInput,
    typerStartTime,
    setTyperStartTime,
    typerErrors,
    setTyperErrors,
    typerWpm,
    setTyperWpm,
    typerAccuracy,
    setTyperAccuracy,
    memoryCards,
    setMemoryCards,
    memorySelected,
    setMemorySelected,
    memoryMoves,
    setMemoryMoves,
    gameTimer,
    setGameTimer,
    logrosDesbloqueados,
    logroNotificado,
    setLogroNotificado,
    filtroLogros,
    setFiltroLogros,
    cargarLogros,
    cargarXpInfo,
    desbloquearLogro,
    evaluarLogros
  } = useGamificacion();

  const {
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
  } = useMentor();

  const [nombre, setNombre] = useState('');
  const [tecnologia, setTecnologia] = useState('JavaScript');
  const [evaluating, setEvaluating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('codigo'); // 'codigo' o 'github'
  const [codigoEntregado, setCodigoEntregado] = useState('');
  const [mostrarTodoTemario, setMostrarTodoTemario] = useState(false);

  const [vistaActiva, setVistaActiva] = useState('ruta'); // 'ruta' | 'mentor' | 'juegos' | 'habilidades'
  const [nivelSkillTree, setNivelSkillTree] = useState('Novato');
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState(null);

  const [isVisible, setIsVisible] = useState(true);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Polling para actualizar amigos y solicitudes entrantes cada 12 segundos (suspendido si pestaña oculta)
  useEffect(() => {
    if (!estudiante || !isVisible) return;
    const interval = setInterval(() => {
      cargarAmigosYSolicitudes(estudiante.id);
    }, 12000);
    return () => clearInterval(interval);
  }, [estudiante, isVisible]);

  // Polling para actualizar chats activos cada 4 segundos (suspendido si pestaña oculta)
  useEffect(() => {
    if (!estudiante || !amigoChatActivo || !isVisible) return;
    cargarMensajesChat(amigoChatActivo.id);
    const interval = setInterval(() => {
      cargarMensajesChat(amigoChatActivo.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [estudiante, amigoChatActivo, isVisible]);

  // Polling para duelos pendientes recibidos cada 8 segundos (suspendido si pestaña oculta)
  useEffect(() => {
    if (!estudiante || !isVisible) return;
    cargarDuelosPendientes(estudiante.id);
    const interval = setInterval(() => {
      cargarDuelosPendientes(estudiante.id);
    }, 8000);
    return () => clearInterval(interval);
  }, [estudiante, isVisible]);

  // Ping de presencia online cada 15 segundos (suspendido si pestaña oculta)
  useEffect(() => {
    if (!estudiante || !isVisible) return;
    const ping = () => {
      fetch(`${API_BASE}/api/estudiantes/${estudiante.id}/ping`, { method: 'POST' }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 15000);
    return () => clearInterval(interval);
  }, [estudiante, isVisible]);

  // Polling para monitorear aceptación de invitaciones de duelo enviadas (cada 3 segundos)
  useEffect(() => {
    if (!estudiante || !dueloEnviadoActivo) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/duelos/estado/${dueloEnviadoActivo.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.estado === 'aceptado') {
            clearInterval(interval);
            mostrarMensaje(`¡${dueloEnviadoActivo.retado_nombre} ha aceptado tu duelo!`, 'success');
            setDueloEnviadoActivo(null);
            setDueloActivo({
              oponenteNombre: dueloEnviadoActivo.retado_nombre,
              cargando: false,
              mision: `Duelo de Combate (${dueloEnviadoActivo.tipo_match.toUpperCase()}) - Modos: ${Array.isArray(dueloEnviadoActivo.modos) ? dueloEnviadoActivo.modos.join(', ').toUpperCase() : dueloEnviadoActivo.modos.toUpperCase()}`
            });
            setMostrarSocialDropdown(false);
          } else if (data.estado === 'rechazado') {
            clearInterval(interval);
            mostrarMensaje(`${dueloEnviadoActivo.retado_nombre} rechazó tu invitación de duelo.`, 'error');
            setDueloEnviadoActivo(null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [estudiante, dueloEnviadoActivo]);

  // Temporizador para Trivia
  useEffect(() => {
    if (gameTimer === null || gameTimer <= 0 || juegoResultado !== null) return;
    const interval = setInterval(() => {
      setGameTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setJuegoResultado('incorrecto');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameTimer, juegoResultado]);

  const irAVista = async (vista) => {
    setVistaActiva(vista);
    if (!estudiante) return;
    if (vista === 'habilidades' || vista === 'cosmico') {
      const count = parseInt(localStorage.getItem(`ia_profesor_click_temario_${estudiante.id}`) || '0', 10) + 1;
      localStorage.setItem(`ia_profesor_click_temario_${estudiante.id}`, count.toString());
      await evaluarLogros();
    } else if (vista === 'logros') {
      const count = parseInt(localStorage.getItem(`ia_profesor_click_logros_${estudiante.id}`) || '0', 10) + 1;
      localStorage.setItem(`ia_profesor_click_logros_${estudiante.id}`, count.toString());
      await evaluarLogros();
    }
  };

  const estaOnline = (ultimaConexion) => {
    if (!ultimaConexion) return false;
    const diff = Date.now() - new Date(ultimaConexion).getTime();
    return diff < 30000;
  };

  const submitIniciarSesion = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await iniciarSesion(nombre, tecnologia);
  };

  const cambiarTecnologia = async (nuevaTech) => {
    if (!estudiante) return;
    try {
      const res = await fetch(`${API_BASE}/api/estudiantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: estudiante.nombre, tecnologia: nuevaTech })
      });
      const data = await res.json();
      if (res.ok) {
        setEstudiante(data);
        localStorage.setItem('estudiante_sesion', JSON.stringify(data));
        await cargarEstado(data.id);
        
        // Registrar cambios de ruta en localStorage
        const cambios = parseInt(localStorage.getItem(`ia_profesor_cambios_ruta_${data.id}`) || '0', 10) + 1;
        localStorage.setItem(`ia_profesor_cambios_ruta_${data.id}`, cambios.toString());
        
        mostrarMensaje(`Ruta cambiada a ${nuevaTech} de forma exitosa.`, 'exito');
        await evaluarLogros();
      } else {
        mostrarMensaje(data.error || 'Error al cambiar de ruta', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión con el backend', 'error');
    }
  };

  const generarNuevaTarea = async () => {
    if (!estudiante) return;
    try {
      const res = await fetch(`${API_BASE}/api/generar-tarea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          tecnologia: estudiante.tecnologia_actual,
          nivel: estudiante.nivel_actual
        })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje('Nueva tarea conceptual y práctica generada con éxito', 'exito');
        await cargarEstado(estudiante.id);
      } else {
        mostrarMensaje(data.error || 'Error al generar la tarea', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión con el backend', 'error');
    }
  };

  const enviarEntrega = async (e, tareaId) => {
    e.preventDefault();
    if (tipoEntrega === 'codigo' && !codigoEntregado.trim()) {
      mostrarMensaje('Por favor, pega el código de tu solución antes de enviarla.', 'error');
      return;
    }
    if (tipoEntrega === 'github') {
      if (!githubUrl.trim()) return;
      const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?\/?$/;
      if (!githubUrlRegex.test(githubUrl.trim())) {
        mostrarMensaje('URL de GitHub inválida. Debe seguir el formato: https://github.com/usuario/repositorio', 'error');
        return;
      }
    }

    setEvaluating(true);
    try {
      const res = await fetch(`${API_BASE}/api/evaluar-entrega`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarea_id: tareaId,
          github_url: tipoEntrega === 'github' ? githubUrl.trim() : '',
          tipo_entrega: tipoEntrega,
          codigo_entregado: tipoEntrega === 'codigo' ? codigoEntregado : ''
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.aprobada) {
          mostrarMensaje(`¡Excelente! Aprobado con ${data.entrega.puntaje}/100. Siguiente módulo desbloqueado.`, 'exito');
        } else {
          mostrarMensaje(`Calificación: ${data.entrega.puntaje}/100. Debes corregir los errores e intentar de nuevo.`, 'error');
        }
        setGithubUrl('');
        setCodigoEntregado('');
        await cargarEstado(estudiante.id);

        // Incrementar entregas en localStorage
        const entregasCount = parseInt(localStorage.getItem(`ia_profesor_entregas_tareas_${estudiante.id}`) || '0', 10) + 1;
        localStorage.setItem(`ia_profesor_entregas_tareas_${estudiante.id}`, entregasCount.toString());

        // Evaluar puntaje para logros de calificación
        const puntaje = data.entrega.puntaje;
        if (puntaje === 100) await desbloquearLogro('calif_100');
        if (puntaje >= 95) await desbloquearLogro('calif_95');
        if (puntaje >= 90) await desbloquearLogro('calif_90');
        
        await evaluarLogros();
      } else {
        mostrarMensaje(data.error || 'Error al evaluar entrega', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al conectar con la API de evaluación', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const handleRegenerar = async () => {
    if (!tareaActiva) return;
    if (!window.confirm("¿Estás seguro de que deseas regenerar esta guía conceptual y el reto práctico? Se creará un nuevo documento con diferentes ejemplos y retos adaptados.")) return;
    setIsRegenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/regenerar-tarea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarea_id: tareaActiva.id })
      });
      const data = await res.json();
      if (!res.ok) {
        mostrarMensaje(data.error || 'Error al regenerar la tarea', 'error');
      } else {
        mostrarMensaje('Guía conceptual y reto práctico regenerados con éxito.', 'exito');
        await cargarEstado(estudiante.id);
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de red al intentar regenerar la tarea.', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const parseObservaciones = (obsRaw) => {
    try {
      const parsed = JSON.parse(obsRaw);
      if (parsed && parsed.desglose) {
        return {
          esEstructurado: true,
          desglose: parsed.desglose,
          comentarios: parsed.comentarios
        };
      }
    } catch (e) {}
    return {
      esEstructurado: false,
      comentarios: obsRaw
    };
  };

  const JUEGOS = [
    { id: 'trivia', nombre: '🧠 Trivia Técnica', desc: 'Responde preguntas sobre conceptos clave', icon: Brain, xp: 20, endpoint: '/api/gamificacion/trivia' },
    { id: 'refactor', nombre: '🐛 Bug Hunter', desc: 'Encuentra y corrige el bug oculto', icon: Target, xp: 50, endpoint: '/api/gamificacion/refactor' },
    { id: 'sorter', nombre: '🧩 Code Sorter', desc: 'Reordena las líneas de código correctamente', icon: Shuffle, xp: 35, endpoint: '/api/gamificacion/sorter' },
    { id: 'fill-blank', nombre: '✏️ Fill the Code', desc: 'Completa los huecos en el código', icon: Code, xp: 30, endpoint: '/api/gamificacion/fill-blank' },
    { id: 'output', nombre: '🖥️ Output Predictor', desc: '¿Qué imprime este código?', icon: Zap, xp: 25, endpoint: '/api/gamificacion/output' },
    { id: 'flashcard', nombre: '⚡ Flashcard Battle', desc: '¿Verdadero o Falso? Decide rápido', icon: Trophy, xp: 20, endpoint: '/api/gamificacion/flashcard' },
    { id: 'typer', nombre: '⌨️ Code Typer', desc: 'Carrera de velocidad y sintaxis exacta', icon: Keyboard, xp: 40, endpoint: '/api/gamificacion/typer' },
    { id: 'memory', nombre: '🎴 Memory Match', desc: 'Parejas en 3D de concepto y definición', icon: Eye, xp: 45, endpoint: '/api/gamificacion/memory' }
  ];

  const iniciarJuego = async (juego) => {
    if (!estudiante) return;
    setJuegoActivo(juego);
    setJuegoData(null);
    setJuegoResultado(null);
    setJuegoSeleccion(null);
    setFillRespuestas({});
    setFlashcardIdx(0);
    setFlashcardScore(0);
    setFlashcardStreak(0);
    setTyperInput('');
    setTyperStartTime(null);
    setTyperErrors(0);
    setTyperWpm(0);
    setTyperAccuracy(100);
    setMemoryCards([]);
    setMemorySelected([]);
    setMemoryMoves(0);
    if (gameTimer) clearInterval(gameTimer);
    setGameTimer(null);
    setJuegoLoading(true);
    try {
      const res = await fetch(`${API_BASE}${juego.endpoint}?estudiante_id=${estudiante.id}`);
      const data = await res.json();
      if (res.ok) {
        setJuegoData(data);
        if (juego.id === 'sorter' && data.lineas_ordenadas) {
          const shuffled = [...data.lineas_ordenadas].sort(() => Math.random() - 0.5);
          setSorterLineas(shuffled);
        } else if (juego.id === 'typer') {
          setTyperStartTime(Date.now());
        } else if (juego.id === 'memory' && data.cartas) {
          const inicializadas = data.cartas.map(c => ({ ...c, flipped: false, matched: false }));
          setMemoryCards(inicializadas);
          setTyperStartTime(Date.now());
        } else if (juego.id === 'trivia') {
          setGameTimer(20);
        }
      } else {
        mostrarMensaje(data.error || 'Error al cargar el juego', 'error');
        setJuegoActivo(null);
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión al cargar el juego', 'error');
      setJuegoActivo(null);
    } finally {
      setJuegoLoading(false);
    }
  };


  const completarReto = async (tipoReto) => {
    if (!estudiante) return;
    try {
      const res = await fetch(`${API_BASE}/api/gamificacion/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, tipo_reto: tipoReto })
      });
      const data = await res.json();
      if (res.ok) {
        setXpInfo({ xp: data.xp_total, nivel_rpg: data.nivel_rpg });
        mostrarMensaje(`+${data.xp_ganada} XP! Total: ${data.xp_total} XP (Nivel ${data.nivel_rpg})`, 'exito');
        
        // 1. Incrementar total de juegos completados
        const juegos = parseInt(localStorage.getItem(`ia_profesor_juegos_completados_${estudiante.id}`) || '0', 10) + 1;
        localStorage.setItem(`ia_profesor_juegos_completados_${estudiante.id}`, juegos.toString());
        
        await registrarPartidaOnline(true);

        // 2. Incrementar trivias correctas si es trivia
        if (tipoReto === 'trivia') {
          const trivias = parseInt(localStorage.getItem(`ia_profesor_trivias_correctas_${estudiante.id}`) || '0', 10) + 1;
          localStorage.setItem(`ia_profesor_trivias_correctas_${estudiante.id}`, trivias.toString());
        }

        // 3. Logros de desempeño específicos
        if (tipoReto === 'typer') {
          if (typerAccuracy === 100) {
            await desbloquearLogro('precis_typer');
          }
          if (typerWpm > 80) {
            await desbloquearLogro('typer_veloz');
          }
          if (typerWpm > 100) {
            await desbloquearLogro('typer_supersound');
          }
          if (typerAccuracy === 100 && typerWpm > 90) {
            await desbloquearLogro('typer_dios');
          }
        } else if (tipoReto === 'flashcard') {
          if (flashcardStreak >= 3) await desbloquearLogro('racha_flashcard');
          if (flashcardStreak >= 5) await desbloquearLogro('racha_flashcard_5');
          if (flashcardStreak >= 8) await desbloquearLogro('racha_flashcard_8');
          if (flashcardStreak >= 10) await desbloquearLogro('racha_flashcard_10');
        } else if (tipoReto === 'memory') {
          const errors = memoryMoves - 4; // 4 parejas en memory match
          if (errors === 0) {
            await desbloquearLogro('memory_perfecto');
          }
          if (typerStartTime) {
            const duracion = (Date.now() - typerStartTime) / 1000;
            if (duracion < 10) {
              await desbloquearLogro('memory_rapido');
            }
            if (duracion < 6) {
              await desbloquearLogro('memory_dios');
            }
          }
        }

        // 4. Evaluar los logros generales (XP, RPG, etc.)
        await evaluarLogros(data.xp_total, data.nivel_rpg);
      }
    } catch (err) { console.error(err); }
  };

  const [draggedIndex, setDraggedIndex] = useState(null);

  const moverLineaSorter = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= sorterLineas.length) return;
    const nuevas = [...sorterLineas];
    const [moved] = nuevas.splice(fromIdx, 1);
    nuevas.splice(toIdx, 0, moved);
    setSorterLineas(nuevas);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const nuevas = [...sorterLineas];
    const [moved] = nuevas.splice(draggedIndex, 1);
    nuevas.splice(index, 0, moved);
    setDraggedIndex(index);
    setSorterLineas(nuevas);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedIndex(null);
  };

  const verificarSorter = () => {
    if (!juegoData) return;
    const correcto = JSON.stringify(sorterLineas) === JSON.stringify(juegoData.lineas_ordenadas);
    setJuegoResultado(correcto ? 'correcto' : 'incorrecto');
    if (correcto) completarReto('sorter');
  };

  const verificarFillBlank = () => {
    if (!juegoData || !juegoData.respuestas) return;
    const respuestasCorrectas = juegoData.respuestas;
    const todasCorrectas = Object.keys(respuestasCorrectas).every(
      key => (fillRespuestas[key] || '').trim().toLowerCase() === respuestasCorrectas[key].trim().toLowerCase()
    );
    setJuegoResultado(todasCorrectas ? 'correcto' : 'incorrecto');
    if (todasCorrectas) completarReto('fill-blank');
  };

  const reproducirSonido = (tipo) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (tipo === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (tipo === 'error') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        osc.frequency.setValueAtTime(80, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (tipo === 'exito') {
        const notas = [261.63, 329.63, 392.00, 523.25];
        notas.forEach((frec, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frec, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.2);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.2);
        });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const verificarTyper = (rawVal) => {
    if (!juegoData || !juegoData.codigo) return;
    
    // Normalizar guiones bajos a espacios para evitar confusión del usuario
    const val = rawVal.replace(/_/g, ' ');

    // Iniciar temporizador al escribir el primer carácter
    if (!typerStartTime && val.length > 0) {
      setTyperStartTime(Date.now());
    }
    
    // Comparar último carácter ingresado para ver si es correcto
    const isBackspace = val.length < typerInput.length;
    if (!isBackspace && val.length > 0) {
      const lastTypedChar = val[val.length - 1];
      const expectedChar = juegoData.codigo[val.length - 1];
      
      if (lastTypedChar === expectedChar) {
        reproducirSonido('click');
      } else {
        reproducirSonido('error');
        setTyperErrors(prev => prev + 1);
      }
    }

    setTyperInput(val);

    // Calcular WPM y Accuracy
    if (typerStartTime && val.length > 0) {
      const segundos = (Date.now() - typerStartTime) / 1000;
      const calculadoWpm = Math.round(((val.length / 5) / (segundos / 60)) || 0);
      setTyperWpm(calculadoWpm);
      
      const totalChars = val.length + typerErrors;
      const calculadoAccuracy = Math.round(((val.length) / totalChars) * 100);
      setTyperAccuracy(calculadoAccuracy);
    }

    if (val === juegoData.codigo) {
      reproducirSonido('exito');
      setJuegoResultado('correcto');
      completarReto('typer');
    }
  };

  const voltearCartaMemory = (cardId) => {
    if (juegoResultado || memorySelected.length >= 2) return;
    
    // Obtener la carta seleccionada
    const targetIdx = memoryCards.findIndex(c => c.id === cardId);
    if (targetIdx === -1 || memoryCards[targetIdx].flipped || memoryCards[targetIdx].matched) return;

    reproducirSonido('click');

    // Voltear la carta
    const nuevasCartas = [...memoryCards];
    nuevasCartas[targetIdx] = { ...nuevasCartas[targetIdx], flipped: true };
    setMemoryCards(nuevasCartas);

    const nuevasSelected = [...memorySelected, nuevasCartas[targetIdx]];
    setMemorySelected(nuevasSelected);

    if (nuevasSelected.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [first, second] = nuevasSelected;
      
      if (first.matchingId === second.matchingId) {
        // Emparejamiento exitoso
        setTimeout(() => {
          reproducirSonido('click');
          setMemoryCards(prev => prev.map(c => {
            if (c.matchingId === first.matchingId) {
              return { ...c, matched: true };
            }
            return c;
          }));
          setMemorySelected([]);
          
          // Comprobar si se completaron todas las parejas
          setMemoryCards(prev => {
            const todasCompletadas = prev.every(c => c.matched || c.matchingId === first.matchingId);
            if (todasCompletadas) {
              reproducirSonido('exito');
              setJuegoResultado('correcto');
              completarReto('memory');
            }
            return prev;
          });
        }, 600);
      } else {
        // No coinciden, volver a voltear tras un retraso
        setTimeout(() => {
          reproducirSonido('error');
          setMemoryCards(prev => prev.map(c => {
            if (c.id === first.id || c.id === second.id) {
              // Asignar clase de error temporal para animación de vibración en el DOM
              return { ...c, flipped: false, errorShake: true };
            }
            return c;
          }));
          setMemorySelected([]);
        }, 1200);
      }
    }
  };

  const tareasDeTecnologia = tareas.filter(t => t.tecnologia === (estudiante ? estudiante.tecnologia_actual : ''));
  const tareaActiva = tareas.find(t => t.estado === 'Pendiente' && t.tecnologia === (estudiante ? estudiante.tecnologia_actual : ''));
  const indiceTemaActual = estudiante ? estudiante.tema_indice : 1;
  const temaNombreActual = temario[indiceTemaActual - 1] || 'Finalizado';

  const nuevasSolicitudes = solicitudesPendientes.filter(req => !solicitudesVistas.includes(req.id));
  const nuevasSolicitudesCount = nuevasSolicitudes.length;

  const desafiarAmigo1vs1 = (amigo) => {
    setRetarAmigoActivo(amigo);
    setTipoMatchDuelo('1v1');
    setModosDueloSeleccionados(['trivia']);
    setLenguajeDuelo(estudiante?.tecnologia_actual || 'JavaScript');
    setNivelDuelo('Novato');
  };

  const abrirSocialModal = () => {
    setMostrarSocialDropdown(true);
    if (solicitudesPendientes.length > 0) {
      const nuevosIdsVistos = [...new Set([...solicitudesVistas, ...solicitudesPendientes.map(r => r.id)])];
      setSolicitudesVistas(nuevosIdsVistos);
      localStorage.setItem('solicitudes_vistas', JSON.stringify(nuevosIdsVistos));
    }
  };

  return (
    <div className="container-app">
      <header className="header-app">
        <div className="header-logo">
          <Sparkles className="icon-logo" />
          <h1>Pragma AI</h1>
        </div>
        {estudiante && (
          <div className="header-profile">
            <span className="profile-badge" onClick={() => { irAVista('cosmico'); desbloquearLogro('click_perfil'); }} style={{ cursor: 'pointer' }} title="Ver mi Perfil y Habilidades">
              <User className="icon-user" /> {estudiante.nombre}
            </span>
            
            <div className="relative flex items-center">
              <button 
                className={`btn-social-header ${mostrarSocialDropdown ? 'active' : ''}`}
                onClick={abrirSocialModal}
                title="Red Social / Amigos"
              >
                <Users size={16} />
                {nuevasSolicitudesCount > 0 && (
                  <span className="social-notification-dot">
                    {nuevasSolicitudesCount}
                  </span>
                )}
              </button>
              
              {mostrarSocialDropdown && (
                <div className="social-modal-overlay animate-fade-in" style={{ zIndex: 300 }}>
                  <div className="social-modal-card">
                    <div className="social-modal-header">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-[#00ffcc]" />
                        <span>REGISTRO COGNITIVO SOCIAL (RED MILITAR DE COGNICIÓN)</span>
                      </div>
                      <button className="close-modal-btn" onClick={() => setMostrarSocialDropdown(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="social-modal-body-columns">
                      {/* Columna Izquierda: Identidad militar, invitación y solicitudes entrantes */}
                      <div className="social-modal-col-left">
                        <div className="social-modal-section">
                          <h4 className="text-[#00ffcc] font-bold text-xs tracking-wider mb-2 font-mono uppercase">TU IDENTIFICACIÓN NEURONAL</h4>
                          <div className="student-id-display flex items-center justify-between font-mono text-xs bg-slate-950 border border-slate-800/80 rounded px-3 py-2 text-[#00ffcc] mb-3">
                            <span className="truncate max-w-[220px]">{estudiante.id}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(estudiante.id || '');
                                mostrarMensaje('¡ID copiado al portapapeles!', 'success');
                              }}
                              className="copy-btn hover:text-white transition p-1"
                              title="Copiar ID"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="social-modal-section">
                          <h4 className="text-[#00ffcc] font-bold text-xs tracking-wider mb-2 font-mono uppercase">VINCULAR NUEVO OPERADOR</h4>
                          <form onSubmit={enviarSolicitudAmistad} className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Ingresar ID del operador..."
                              value={inputIdAmigo}
                              onChange={(e) => setInputIdAmigo(e.target.value)}
                              className="hud-input font-mono text-xs py-2 px-3 border border-slate-800/80 rounded flex-1"
                            />
                            <button 
                              type="submit" 
                              disabled={loadingAmigos} 
                              className="hud-btn py-2 px-4 text-xs flex items-center justify-center gap-1.5"
                            >
                              {loadingAmigos ? <RefreshCw className="animate-spin" size={14} /> : <UserPlus size={14} />}
                              Enviar
                            </button>
                          </form>

                          {mensajeAmistad.texto && (
                            <div className={`alert-toast-mini text-[10px] mt-2 p-2 rounded ${mensajeAmistad.tipo === 'success' ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-400' : 'bg-rose-950/80 border border-rose-500/30 text-rose-400'}`}>
                              {mensajeAmistad.texto}
                            </div>
                          )}
                        </div>

                        {/* Solicitudes Pendientes */}
                        {solicitudesPendientes.length > 0 && (
                          <div className="social-modal-section border-t border-slate-800/80 pt-4 mt-2">
                            <h4 className="text-amber-400 font-bold text-xs tracking-wider mb-2 font-mono uppercase">SOLICITUDES ENTRANTES PENDIENTES</h4>
                            <div className="solicitudes-container">
                              {solicitudesPendientes.map((req) => {
                                const inicial = req.solicitante_nombre ? req.solicitante_nombre.charAt(0).toUpperCase() : 'O';
                                return (
                                  <div key={req.id} className="solicitud-pendiente-card">
                                    <div className="solicitud-info">
                                      <div className="solicitud-avatar">{inicial}</div>
                                      <span className="solicitud-nombre">{req.solicitante_nombre}</span>
                                    </div>
                                    <div className="solicitud-acciones">
                                      <button 
                                        onClick={() => responderSolicitudAmistad(req.id, 'aceptar')}
                                        className="solicitud-btn solicitud-btn-aceptar"
                                      >
                                        <Check size={12} /> Aceptar
                                      </button>
                                      <button 
                                        onClick={() => responderSolicitudAmistad(req.id, 'rechazar')}
                                        className="solicitud-btn solicitud-btn-rechazar"
                                      >
                                        <X size={12} /> Rechazar
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Invitaciones de Duelo Entrantes */}
                        {duelosRecibidos.length > 0 && (
                          <div className="social-modal-section border-t border-slate-800/80 pt-4 mt-2">
                            <h4 className="text-cyan-400 font-bold text-xs tracking-wider mb-2 font-mono uppercase flex items-center gap-1">
                              <Swords size={12} className="animate-pulse" /> COMBATES PENDIENTES
                            </h4>
                            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                              {duelosRecibidos.map((duelo) => (
                                <div key={duelo.id} className="bg-cyan-950/30 border border-cyan-500/25 p-2 rounded flex flex-col gap-1.5">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[11px] text-slate-100">{duelo.retador_nombre} te desafía</span>
                                    <span className="text-[9px] text-[#00ffcc] font-mono">Modo: {duelo.tipo_match.toUpperCase()} | Arenas: {Array.isArray(duelo.modos) ? duelo.modos.join(', ').toUpperCase() : duelo.modos.toUpperCase()}</span>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button 
                                      onClick={() => responderDuelo(duelo.id, 'aceptar')}
                                      className="bg-[#00ffcc] hover:bg-[#00ffcc]/80 text-slate-950 px-2 py-0.5 rounded text-[9px] font-bold transition flex items-center gap-0.5"
                                    >
                                      <Check size={10} /> Aceptar
                                    </button>
                                    <button 
                                      onClick={() => responderDuelo(duelo.id, 'rechazar')}
                                      className="bg-rose-950 border border-rose-500/30 text-[#fb7185] hover:bg-rose-900 px-2 py-0.5 rounded text-[9px] font-bold transition flex items-center gap-0.5"
                                    >
                                      <X size={10} /> Rechazar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Columna Derecha: Lista de amigos vinculados O Chat privado */}
                      <div className="social-modal-col-right">
                        {amigoChatActivo ? (
                          <div className="chat-privado-container animate-fade-in">
                            <div className="chat-header">
                              <div className="chat-header-user">
                                <div className="status-dot-container">
                                  <div className="amigo-avatar">
                                    {amigoChatActivo.nombre ? amigoChatActivo.nombre.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <span className={`status-dot ${estaOnline(amigoChatActivo.ultima_conexion) ? 'status-online' : 'status-offline'}`} />
                                </div>
                                <div className="chat-header-info">
                                  <span className="chat-header-name">{amigoChatActivo.nombre}</span>
                                  <span className="chat-header-status">
                                    {estaOnline(amigoChatActivo.ultima_conexion) ? '● En línea' : '○ Desconectado'} — {amigoChatActivo.nivel_actual}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  setAmigoChatActivo(null);
                                  setMensajesChat([]);
                                }}
                                className="chat-btn-volver"
                              >
                                <ChevronRight size={14} className="rotate-180" /> Volver
                              </button>
                            </div>

                            <div className="chat-mensajes-area">
                              {mensajesChat.length === 0 ? (
                                <div className="chat-empty-state">
                                  <MessageSquare size={20} className="chat-empty-icon" />
                                  <span>Sin transmisiones registradas. Envía un mensaje para iniciar.</span>
                                </div>
                              ) : (
                                mensajesChat.map((msg) => {
                                  const esMio = msg.remitente_id === estudiante.id;
                                  const hora = msg.creado_en 
                                    ? new Date(msg.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                    : '--:--';
                                  return (
                                    <div 
                                      key={msg.id} 
                                      className={`chat-burbuja ${esMio ? 'chat-burbuja-mio' : 'chat-burbuja-otro'}`}
                                    >
                                      <span className="chat-msg-sender">
                                        {esMio ? 'TÚ' : msg.remitente_nombre}
                                      </span>
                                      <span className="chat-msg-text">{msg.mensaje}</span>
                                      <span className="chat-msg-time">{hora}</span>
                                    </div>
                                  );
                                })
                              )}
                              <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={enviarMensajeChat} className="chat-input-form">
                              <input 
                                type="text"
                                placeholder="Escribe un mensaje neuronal..."
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                className="chat-input-field"
                                disabled={loadingChat}
                              />
                              <button 
                                type="submit"
                                disabled={loadingChat || !nuevoMensaje.trim()}
                                className="chat-btn-enviar"
                              >
                                {loadingChat ? <RefreshCw className="animate-spin" size={14} /> : <Send size={14} />}
                              </button>
                            </form>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-[#00ffcc] font-bold text-xs tracking-wider mb-2 font-mono uppercase">AMIGOS VINCULADOS EN LA RED ({listaAmigos.length})</h4>
                            {listaAmigos.length === 0 ? (
                              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                                No tienes operarios en tu red militar social. ¡Comparte tu ID para conectarte!
                              </div>
                            ) : (
                              <div className="amigos-container">
                                {listaAmigos.map((amigo) => {
                                  const inicial = amigo.nombre ? amigo.nombre.charAt(0).toUpperCase() : 'O';
                                  const onlineAmigo = estaOnline(amigo.ultima_conexion);
                                  return (
                                    <div key={amigo.id} className="amigo-card">
                                      <div className="amigo-header">
                                        <div className="status-dot-container">
                                          <div className="amigo-avatar">{inicial}</div>
                                          <span className={`status-dot ${onlineAmigo ? 'status-online' : 'status-offline'}`} />
                                        </div>
                                        <div className="amigo-meta">
                                          <div className="amigo-nombre-line">
                                            <span className="amigo-nombre">{amigo.nombre}</span>
                                            <span className="amigo-rango">{amigo.nivel_actual}</span>
                                          </div>
                                          <span className="amigo-progreso-texto">
                                            {onlineAmigo ? '● En línea' : '○ Offline'} — {amigo.tecnologia_actual} - Módulo {amigo.tema_indice}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="amigo-footer">
                                        <button 
                                          onClick={() => setAmigoChatActivo(amigo)}
                                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 font-semibold transition"
                                          title="Chatear con este amigo"
                                        >
                                          <MessageSquare size={12} /> Chat
                                        </button>
                                        <button 
                                          onClick={() => desafiarAmigo1vs1(amigo)}
                                          className="amigo-btn-desafiar"
                                          title="Retar a un duelo"
                                        >
                                          <Swords size={12} /> Retar
                                        </button>
                                        <button 
                                          onClick={() => eliminarAmigo(amigo.id)}
                                          className="amigo-btn-eliminar"
                                          title="Eliminar amistad"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de Configuración de Duelo */}
              {retarAmigoActivo && (
                <div className="social-modal-overlay animate-fade-in" style={{ zIndex: 400 }}>
                   <div className="hologram-modal-card">
                    <div className="social-modal-header" style={{ borderBottomColor: 'rgba(0, 255, 204, 0.4)' }}>
                      <div className="flex items-center gap-2">
                        <Swords size={18} className="text-[#00ffcc] animate-pulse" />
                        <span className="tracking-wider">CONFIGURACIÓN DE COMBATE HOLOGRÁFICO</span>
                      </div>
                      <button className="close-modal-btn" onClick={() => setRetarAmigoActivo(null)}>
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-4 flex flex-col gap-4 font-mono text-xs text-slate-100">
                      
                      <div className="target-banner">
                        <div className="target-status-glow">
                          <span className="target-status-dot"></span>
                          TARGET ACQUIRED
                        </div>
                        <div className="font-mono text-xs">
                          <span className="text-slate-400 font-bold">OPERADOR: </span>
                          <span className="text-[#00ffcc] font-extrabold text-sm">{retarAmigoActivo.nombre}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#00ffcc] font-bold text-[9px] uppercase tracking-widest font-mono">TECNOLOGÍA DEL DESAFÍO</label>
                        <select
                          value={lenguajeDuelo}
                          onChange={(e) => setLenguajeDuelo(e.target.value)}
                          className="select-tech-header w-full p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[#00ffcc] focus:border-[#00ffcc] outline-none font-mono text-xs"
                          style={{ height: '38px', padding: '0 12px' }}
                        >
                          <option value="JavaScript">JavaScript</option>
                          <option value="Python">Python</option>
                          <option value="Java">Java</option>
                          <option value="React">React</option>
                          <option value="Node.js">Node.js</option>
                          <option value="Supabase">Supabase</option>
                          <option value="HTML">HTML</option>
                          <option value="CSS">CSS</option>
                          <option value="C++">C++</option>
                        </select>
                      </div>

                      {(() => {
                        const JERARQUIA_NIVELES = ['Novato', 'Principiante', 'Intermedio', 'Experto'];
                        const idxMaximo = JERARQUIA_NIVELES.indexOf(estudiante?.nivel_actual || 'Novato');
                        const nivelesPermitidos = JERARQUIA_NIVELES.slice(0, idxMaximo !== -1 ? idxMaximo + 1 : 1);
                        return (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[#00ffcc] font-bold text-[9px] uppercase tracking-widest font-mono">DIFICULTAD (MÁXIMO: {estudiante?.nivel_actual || 'Novato'})</label>
                            <div className="cyber-grid-tiles">
                              {JERARQUIA_NIVELES.map((nivel) => {
                                const permitido = nivelesPermitidos.includes(nivel);
                                return (
                                  <button
                                    key={nivel}
                                    type="button"
                                    disabled={!permitido}
                                    onClick={() => setNivelDuelo(nivel)}
                                    className={`cyber-tile-btn ${nivelDuelo === nivel ? 'active' : ''}`}
                                  >
                                    {nivel}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#00ffcc] font-bold text-[9px] uppercase tracking-widest font-mono">TAMAÑO DEL ENCUENTRO</label>
                        <div className="cyber-grid-tiles">
                          {[
                            { id: '1v1', label: '1vs1 (Duelo)' },
                            { id: '2v2', label: '2vs2 (Dúo)' },
                            { id: '4v4', label: '4vs4 (Escuadra)' },
                            { id: 'todos_vs_todos', label: 'Todos vs Todos' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setTipoMatchDuelo(t.id)}
                              className={`cyber-tile-btn ${tipoMatchDuelo === t.id ? 'active' : ''}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#00ffcc] font-bold text-[9px] uppercase tracking-widest font-mono">ARENAS DE COMBATE</label>
                        <div className="cyber-checkbox-list">
                          {[
                            { id: 'trivia', label: 'Preguntas Técnicas (Trivia)' },
                            { id: 'refactor', label: 'Bug Hunter (Refactor)' },
                            { id: 'sorter', label: 'Code Sorter (Ordenar líneas)' },
                            { id: 'fill-blank', label: 'Fill the Code (Completar)' },
                            { id: 'output', label: 'Output Predictor (Predicción)' },
                            { id: 'flashcard', label: 'Flashcards de Conceptos' },
                            { id: 'typer', label: 'Code Typer Speed (Tipeo)' },
                            { id: 'memory', label: 'Memory Match (Parejas)' }
                          ].map((modo) => {
                            const seleccionado = modosDueloSeleccionados.includes(modo.id);
                            return (
                              <div
                                key={modo.id}
                                onClick={() => {
                                  if (seleccionado) {
                                    if (modosDueloSeleccionados.length > 1) {
                                      setModosDueloSeleccionados(prev => prev.filter(m => m !== modo.id));
                                    }
                                  } else {
                                    setModosDueloSeleccionados(prev => [...prev, modo.id]);
                                  }
                                }}
                                className={`cyber-checkbox-card ${seleccionado ? 'selected' : ''}`}
                              >
                                <div className="cyber-checkbox-indicator">
                                  {seleccionado && <Check size={10} strokeWidth={4} />}
                                </div>
                                <span className="cyber-checkbox-label">{modo.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={enviarInvitacionDuelo}
                          className="hud-btn hud-btn-primary-neon flex-1 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-lg"
                        >
                          <Swords size={13} /> ENVIAR DESAFÍO
                        </button>
                        <button
                          onClick={() => setRetarAmigoActivo(null)}
                          className="hud-btn hud-btn-secondary-cyber px-5 py-3 rounded-lg text-[10px] uppercase font-semibold transition"
                        >
                          Abortar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="profile-badge level-badge dropdown-badge">
              <span className="badge-text-label">Ruta:</span>
              <select
                className="select-tech-header"
                value={estudiante.tecnologia_actual}
                onChange={(e) => cambiarTecnologia(e.target.value)}
                disabled={loading}
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="Supabase">Supabase</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="C++">C++</option>
                <option value="Multilenguaje">Combinación de Lenguajes</option>
                <option value="Videojuegos">Programación de Videojuegos</option>
                <option value="IA">Inteligencia Artificial</option>
                <option value="Logica">Lógica de Programación</option>
                <option value="Optimizacion">Optimización y Recursos</option>
                <option value="MejoraCodigo">Mejora y Calidad de Código</option>
              </select>
              <span className="badge-text-level">({estudiante.nivel_actual})</span>
            </div>
            <button className="btn-logout" onClick={cerrarSesion} title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>

      {mensaje.texto && (
        <div className={`alert-box alert-${mensaje.tipo}`}>
          {mensaje.tipo === 'exito' ? <CheckCircle2 className="icon-alert" /> : <AlertTriangle className="icon-alert" />}
          <span>{mensaje.texto}</span>
        </div>
      )}

      <main className="main-content">
        {!estudiante ? (
          <section className="login-section">
            <div className="login-card">
              <Sparkles className="icon-card-spark" />
              <h2>Aprende Programación a Nivel Producción</h2>
              <p>Pragma AI te guiará secuencialmente a través de temarios profesionales avanzados. Generará documentación teórica y misiones prácticas dinámicas, evaluando tus habilidades en tiempo real mediante una suite completa de minijuegos gamificados.</p>

              <form onSubmit={iniciarSesion} className="login-form">
                <div className="form-group">
                  <label htmlFor="nombre">Tu Nombre de Desarrollador:</label>
                  <input
                    type="text"
                    id="nombre"
                    placeholder="Ej. Eliab Moreno"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tecnologia">Elegir Ruta Tecnológica:</label>
                  <select
                    id="tecnologia"
                    value={tecnologia}
                    onChange={(e) => setTecnologia(e.target.value)}
                  >
                    <option value="JavaScript">JavaScript Developer</option>
                    <option value="Python">Python Engineer</option>
                    <option value="Java">Java Specialist</option>
                    <option value="React">React UI Engineer</option>
                    <option value="Node.js">Node.js Backend Developer</option>
                    <option value="Supabase">Supabase DBA (SQL)</option>
                    <option value="HTML">HTML Fronted Developer</option>
                    <option value="CSS">CSS Styling Expert</option>
                    <option value="C++">C++ Systems Programmer</option>
                    <option value="Multilenguaje">Combinación de Lenguajes</option>
                    <option value="Videojuegos">Programación de Videojuegos</option>
                    <option value="IA">Inteligencia Artificial</option>
                    <option value="Logica">Lógica de Programación</option>
                    <option value="Optimizacion">Optimización y Recursos</option>
                    <option value="MejoraCodigo">Mejora y Calidad de Código</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Inicializando...' : 'Iniciar Ruta Secuencial'}
                </button>
              </form>
            </div>
          </section>
        ) : (
          <div className="dashboard-wrapper">
            <div className="nav-tabs-container">
              <button 
                type="button"
                className={`nav-tab-btn ${vistaActiva === 'ruta' ? 'active' : ''}`}
                onClick={() => irAVista('ruta')}
              >
                <BookOpen size={16} /> Ruta Académica
              </button>
              <button 
                type="button"
                className={`nav-tab-btn ${vistaActiva === 'habilidades' ? 'active' : ''}`}
                onClick={() => irAVista('habilidades')}
              >
                <GitFork size={16} /> Árbol de Habilidades
              </button>
              <button 
                type="button"
                className={`nav-tab-btn ${vistaActiva === 'mentor' ? 'active' : ''}`}
                onClick={() => irAVista('mentor')}
              >
                <Sparkles size={16} /> Asistente de Proyectos (Mentor IA)
              </button>
              <button 
                type="button"
                className={`nav-tab-btn ${vistaActiva === 'juegos' ? 'active' : ''}`}
                onClick={() => irAVista('juegos')}
              >
                <Gamepad2 size={16} /> Zona de Juegos
                {xpInfo.xp > 0 && <span className="xp-badge-mini">{xpInfo.xp} XP</span>}
              </button>
              <button 
                type="button"
                className={`nav-tab-btn ${vistaActiva === 'logros' ? 'active' : ''}`}
                onClick={() => irAVista('logros')}
              >
                <Trophy size={16} /> Logros
                {logrosDesbloqueados.length > 0 && <span className="logros-badge-mini">{logrosDesbloqueados.length}</span>}
              </button>
            </div>

            <React.Suspense fallback={
              <div className="flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-900/50 rounded-2xl border border-gray-800/80 backdrop-blur-md">
                <RefreshCw className="animate-spin text-teal-400 mb-4" size={32} />
                <p className="text-sm font-semibold tracking-wide uppercase">Cargando módulo de Pragma...</p>
              </div>
            }>
            {vistaActiva === 'ruta' ? (
              <DashboardRuta
                indiceTemaActual={indiceTemaActual}
                temario={temario}
                temaNombreActual={temaNombreActual}
                tareaActiva={tareaActiva}
                handleRegenerar={handleRegenerar}
                isRegenerating={isRegenerating}
                API_BASE={API_BASE}
                parseObservaciones={parseObservaciones}
                enviarEntrega={enviarEntrega}
                tipoEntrega={tipoEntrega}
                setTipoEntrega={setTipoEntrega}
                codigoEntregado={codigoEntregado}
                setCodigoEntregado={setCodigoEntregado}
                evaluating={evaluating}
                githubUrl={githubUrl}
                setGithubUrl={setGithubUrl}
                tareasDeTecnologia={tareasDeTecnologia}
                generarNuevaTarea={generarNuevaTarea}
                loading={loading}
                mostrarTodoTemario={mostrarTodoTemario}
                setMostrarTodoTemario={setMostrarTodoTemario}
                estudiante={estudiante}
              />
          ) : vistaActiva === 'mentor' ? (
            <MentorChat
              estudiante={estudiante}
              API_BASE={API_BASE}
              planActivo={planActivo}
              setPlanActivo={setPlanActivo}
              planesMentor={planesMentor}
              ideaProyecto={ideaProyecto}
              setIdeaProyecto={setIdeaProyecto}
              githubUrlMentor={githubUrlMentor}
              setGithubUrlMentor={setGithubUrlMentor}
              crearPlanMentor={crearPlanMentor}
              mentorLoading={mentorLoading}
              tabMentorColumn={tabMentorColumn}
              setTabMentorColumn={setTabMentorColumn}
              guiasAyuda={guiasAyuda}
              guiaAyudaSeleccionada={guiaAyudaSeleccionada}
              setGuiaAyudaSeleccionada={setGuiaAyudaSeleccionada}
              regenerarGuiaAyuda={regenerarGuiaAyuda}
              regeneratingGuiaId={regeneratingGuiaId}
              perfilCognitivoExpandido={perfilCognitivoExpandido}
              setPerfilCognitivoExpandido={setPerfilCognitivoExpandido}
              chatLoading={chatLoading}
              personalidadMentor={personalidadMentor}
              setPersonalidadMentor={setPersonalidadMentor}
              mensajeChatMentor={mensajeChatMentor}
              setMensajeChatMentor={setMensajeChatMentor}
              enviarMensajeMentor={enviarMensajeChatMentor}
            />
          ) : vistaActiva === 'habilidades' ? (
            <HabilidadesRoadmap
              nivelSkillTree={nivelSkillTree}
              setNivelSkillTree={setNivelSkillTree}
              estudiante={estudiante}
              temario={temario}
              habilidadSeleccionada={habilidadSeleccionada}
              setHabilidadSeleccionada={setHabilidadSeleccionada}
              setVistaActiva={setVistaActiva}
              setMensajeChatMentor={setMensajeChatMentor}
            />
          ) : vistaActiva === 'juegos' ? (
            <div className="juegos-seccion-contenedor animate-fade-in">
              {/* Selector de Modo de Juego */}
              <div className="juegos-mode-selector-panel">
                <button 
                  className={`juegos-mode-tab ${modoJuego === 'pragma' ? 'active' : ''}`}
                  onClick={() => setModoJuego('pragma')}
                >
                  <Gamepad2 size={14} />
                  <span>PROYECTO PRAGMA</span>
                  <span className="mode-desc-tag">ARENA & CAMPAÑA CIBERPUNK</span>
                </button>
                <button 
                  className={`juegos-mode-tab ${modoJuego === 'arcade' ? 'active' : ''}`}
                  onClick={() => {
                    setModoJuego('arcade');
                    setJuegoActivo(null);
                  }}
                >
                  <Trophy size={14} />
                  <span>ARCADE CLÁSICO</span>
                  <span className="mode-desc-tag">MINIJUEGOS INDIVIDUALES</span>
                </button>
              </div>

              {modoJuego === 'pragma' ? (
                <PragmaGames
                  estudiante={estudiante}
                  onUpdateEstudiante={(estActualizado) => setEstudiante(estActualizado)}
                  backendUrl={API_BASE}
                  listaAmigos={listaAmigos}
                  partidaDueloActiva={partidaDueloActiva}
                  onLimpiarPartidaDuelo={() => setPartidaDueloActiva(null)}
                />
              ) : (
                /* RENDERIZADO DEL ARCADE DE MINIJUEGOS CLÁSICOS */
                <div className="arcade-container-spec animate-fade-in">
                  {!juegoActivo ? (
                    /* CATALOGO DE JUEGOS CLÁSICOS */
                    <div className="arcade-catalog-layout">
                      <div className="arcade-catalog-header">
                        <h2>🕹️ SISTEMA DE MINIJUEGOS ARCADE</h2>
                        <p>Completa desafíos técnicos focalizados para acelerar tu asimilación neuronal de conceptos</p>
                      </div>
                      <div className="arcade-catalog-grid">
                        {JUEGOS.map((juego) => {
                          const IconComponent = juego.icon;
                          return (
                            <div key={juego.id} className="arcade-game-card">
                              <div className="arcade-card-glow"></div>
                              <div className="arcade-card-icon">
                                <IconComponent size={20} className="text-[#00ffcc]" />
                              </div>
                              <h3 className="arcade-card-title">{juego.nombre}</h3>
                              <p className="arcade-card-desc">{juego.desc}</p>
                              <div className="arcade-card-footer">
                                <span className="arcade-card-xp">💎 +{juego.xp} XP</span>
                                <button className="arcade-card-btn" onClick={() => iniciarJuego(juego)}>
                                  INICIAR RETO
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* MINIJUEGO CLÁSICO ACTIVO */
                    <div className="classic-game-player-panel glass-panel">
                      <div className="classic-game-header">
                        <div className="flex items-center gap-2">
                          {React.createElement(juegoActivo.icon, { size: 16, className: "text-[#00ffcc]" })}
                          <span className="classic-game-title font-bold text-xs tracking-wider font-mono uppercase">{juegoActivo.nombre}</span>
                        </div>
                        <button className="btn-hud-cancel btn-sm" onClick={() => setJuegoActivo(null)}>
                          SALIR DEL RETO
                        </button>
                      </div>

                      <div className="classic-game-body">
                        {juegoLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400 font-mono text-xs">
                            <RefreshCw className="animate-spin mb-3 text-[#00ffcc]" size={20} />
                            <span>DESENCRIPTANDO RETO CON INTELIGENCIA ARTIFICIAL...</span>
                          </div>
                        ) : juegoResultado === 'correcto' ? (
                          <div className="classic-game-success-card animate-scale-in">
                            <span className="success-badge-large">🏆 RETO SUPERADO</span>
                            <h3>¡Excelente Trabajo, Operario!</h3>
                            <p className="success-xp">Has ganado {juegoActivo.xp} XP Cognitiva</p>
                            {juegoData?.explicacion && (
                              <div className="success-explicacion">
                                <strong>Análisis Técnico:</strong>
                                <p>{juegoData.explicacion}</p>
                              </div>
                            )}
                            <button className="btn-action-hud mt-6" onClick={() => setJuegoActivo(null)}>
                              RETORNAR AL ARCADE
                            </button>
                          </div>
                        ) : (
                          /* RENDERIZADO ESPECÍFICO DE CADA MINIJUEGO CLÁSICO */
                          <div className="classic-game-content-panel">
                            
                            {/* 1. TRIVIA TÉCNICA */}
                            {juegoActivo.id === 'trivia' && juegoData && (
                              <div className="trivia-game-view animate-fade-in">
                                <p className="trivia-question font-mono">{juegoData.pregunta}</p>
                                <div className="trivia-options-grid">
                                  {juegoData.opciones?.map((opcion, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => {
                                        if (idx === juegoData.respuesta_correcta) {
                                          reproducirSonido('exito');
                                          setJuegoResultado('correcto');
                                          completarReto('trivia');
                                        } else {
                                          reproducirSonido('error');
                                          mostrarMensaje('Respuesta errónea, reinténtalo.', 'error');
                                        }
                                      }}
                                      className="trivia-option-btn"
                                    >
                                      <span className="option-index font-mono">0{idx + 1}.</span>
                                      <span className="option-text">{opcion}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 2. FLASHCARD BATTLE (VERDADERO O FALSO) */}
                            {juegoActivo.id === 'flashcard' && juegoData?.flashcards && (
                              <div className="flashcard-game-view animate-fade-in">
                                <div className="flashcard-streak-badge font-mono">
                                  RACHA DE ACIERTOS: <span className="text-glow text-[#00ffcc]">{flashcardStreak}</span>
                                </div>
                                {flashcardIdx < juegoData.flashcards.length ? (
                                  <div className="flashcard-active-card">
                                    <p className="flashcard-text font-mono">
                                      {juegoData.flashcards[flashcardIdx].afirmacion}
                                    </p>
                                    <div className="flashcard-actions">
                                      <button 
                                        className="flashcard-btn verdadero"
                                        onClick={() => {
                                          const correcto = juegoData.flashcards[flashcardIdx].es_verdadero === true;
                                          if (correcto) {
                                            reproducirSonido('exito');
                                            setFlashcardStreak(prev => prev + 1);
                                            mostrarMensaje('¡Correcto!', 'exito');
                                          } else {
                                            reproducirSonido('error');
                                            setFlashcardStreak(0);
                                            mostrarMensaje('Incorrecto.', 'error');
                                          }
                                          if (flashcardIdx + 1 >= juegoData.flashcards.length) {
                                            setJuegoResultado('correcto');
                                            completarReto('flashcard');
                                          } else {
                                            setFlashcardIdx(prev => prev + 1);
                                          }
                                        }}
                                      >
                                        VERDADERO
                                      </button>
                                      <button 
                                        className="flashcard-btn falso"
                                        onClick={() => {
                                          const correcto = juegoData.flashcards[flashcardIdx].es_verdadero === false;
                                          if (correcto) {
                                            reproducirSonido('exito');
                                            setFlashcardStreak(prev => prev + 1);
                                            mostrarMensaje('¡Correcto!', 'exito');
                                          } else {
                                            reproducirSonido('error');
                                            setFlashcardStreak(0);
                                            mostrarMensaje('Incorrecto.', 'error');
                                          }
                                          if (flashcardIdx + 1 >= juegoData.flashcards.length) {
                                            setJuegoResultado('correcto');
                                            completarReto('flashcard');
                                          } else {
                                            setFlashcardIdx(prev => prev + 1);
                                          }
                                        }}
                                      >
                                        FALSO
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center font-mono py-10">
                                    Flashcards completadas con éxito.
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 3. CODE SORTER */}
                            {juegoActivo.id === 'sorter' && juegoData && (
                              <div className="sorter-game-view animate-fade-in">
                                <p className="sorter-instructions mb-4 font-mono">{juegoData.descripcion}</p>
                                <div className="sorter-lines-list">
                                  {sorterLineas.map((linea, idx) => (
                                    <div 
                                      key={idx}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, idx)}
                                      onDragOver={(e) => handleDragOver(e, idx)}
                                      onDragEnd={handleDragEnd}
                                      className="sorter-line-card"
                                    >
                                      <div className="drag-handle">☰</div>
                                      <pre className="line-code font-mono"><code>{linea}</code></pre>
                                      <div className="sorter-arrows flex gap-1">
                                        <button className="arrow-btn" onClick={() => moverLineaSorter(idx, idx - 1)}>▲</button>
                                        <button className="arrow-btn" onClick={() => moverLineaSorter(idx, idx + 1)}>▼</button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <button className="btn-action-hud mt-4" onClick={verificarSorter}>
                                  VERIFICAR ORDENAMIENTO
                                </button>
                              </div>
                            )}

                            {/* 4. FILL IN THE BLANKS */}
                            {juegoActivo.id === 'fill-blank' && juegoData && (
                              <div className="fill-blank-game-view animate-fade-in">
                                <p className="fill-instructions font-mono mb-3">{juegoData.descripcion}</p>
                                <div className="fill-code-editor bg-slate-950 p-4 border border-slate-800 rounded mb-4 font-mono">
                                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                                    {juegoData.codigo_con_huecos.split(/(___\d+___)/g).map((token, index) => {
                                      const match = token.match(/___(\d+)___/);
                                      if (match) {
                                        const huecoNum = match[1];
                                        return (
                                          <input 
                                            key={index}
                                            type="text"
                                            value={fillRespuestas[huecoNum] || ''}
                                            onChange={(e) => setFillRespuestas({
                                              ...fillRespuestas,
                                              [huecoNum]: e.target.value
                                            })}
                                            placeholder={`Hueco ${huecoNum}`}
                                            className="fill-hueco-input"
                                            style={{ width: `${Math.max(80, (fillRespuestas[huecoNum] || '').length * 10)}px` }}
                                          />
                                        );
                                      }
                                      return token;
                                    })}
                                  </pre>
                                </div>
                                <button className="btn-action-hud" onClick={verificarFillBlank}>
                                  VERIFICAR RESPUESTAS
                                </button>
                              </div>
                            )}

                            {/* 5. OUTPUT PREDICTOR */}
                            {juegoActivo.id === 'output' && juegoData && (
                              <div className="output-game-view animate-fade-in">
                                <p className="output-desc mb-3 font-mono">Analiza el fragmento de código e indica el output exacto en consola:</p>
                                <pre className="output-code bg-slate-950 p-4 border border-slate-800 rounded font-mono mb-4"><code>{juegoData.codigo}</code></pre>
                                <div className="trivia-options-grid">
                                  {juegoData.opciones?.map((opcion, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => {
                                        if (idx === juegoData.respuesta_correcta) {
                                          reproducirSonido('exito');
                                          setJuegoResultado('correcto');
                                          completarReto('output');
                                        } else {
                                          reproducirSonido('error');
                                          mostrarMensaje('Respuesta incorrecta, analiza bien el flujo lógico.', 'error');
                                        }
                                      }}
                                      className="trivia-option-btn"
                                    >
                                      <span className="option-index font-mono">0{idx + 1}.</span>
                                      <span className="option-text font-mono"><code>{opcion}</code></span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 6. BUG HUNTER / REFACTOR */}
                            {juegoActivo.id === 'refactor' && juegoData && (
                              <div className="refactor-game-view animate-fade-in">
                                <p className="refactor-desc mb-3 font-mono">Corrige el bug en el código:</p>
                                <pre className="output-code bg-slate-950 p-4 border border-slate-800 rounded font-mono mb-4"><code>{juegoData.codigo_con_bug}</code></pre>
                                <div className="trivia-options-grid">
                                  {juegoData.opciones?.map((opcion, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => {
                                        if (idx === juegoData.opcion_correcta) {
                                          reproducirSonido('exito');
                                          setJuegoResultado('correcto');
                                          completarReto('refactor');
                                        } else {
                                          reproducirSonido('error');
                                          mostrarMensaje('Corrección inválida, analiza los leaks o errores de sintaxis.', 'error');
                                        }
                                      }}
                                      className="trivia-option-btn"
                                    >
                                      <span className="option-index font-mono">0{idx + 1}.</span>
                                      <span className="option-text font-mono"><code>{opcion}</code></span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 7. CODE TYPER */}
                            {juegoActivo.id === 'typer' && juegoData && (
                              <div className="typer-game-view animate-fade-in">
                                <p className="typer-desc font-mono mb-3">Escribe el código exactamente igual respetando indentación y mayúsculas:</p>
                                <pre className="output-code bg-slate-950 p-4 border border-slate-800 rounded font-mono mb-3"><code>{juegoData.codigo}</code></pre>
                                
                                <div className="typer-stats flex gap-4 font-mono text-xs text-slate-400 mb-3 bg-slate-900/60 p-2.5 rounded border border-slate-850">
                                  <span>WPM: <strong className="text-glow text-cyan-400">{typerWpm}</strong></span>
                                  <span>Precisión: <strong className="text-glow text-emerald-400">{typerAccuracy}%</strong></span>
                                  <span>Errores: <strong className="text-glow text-rose-400">{typerErrors}</strong></span>
                                </div>

                                <textarea 
                                  value={typerInput}
                                  onChange={(e) => verificarTyper(e.target.value)}
                                  placeholder="Escribe el código aquí para iniciar..."
                                  className="code-textarea font-mono text-xs w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded p-3 text-emerald-400 focus:border-[#00ffcc] outline-none"
                                />
                              </div>
                            )}

                            {/* 8. MEMORY MATCH */}
                            {juegoActivo.id === 'memory' && memoryCards.length > 0 && (
                              <div className="memory-game-view animate-fade-in">
                                <div className="memory-stats font-mono text-xs text-slate-400 mb-4 bg-slate-900/60 p-2 rounded border border-slate-850 flex justify-between">
                                  <span>MOVIMIENTOS: <strong className="text-glow text-[#00ffcc]">{memoryMoves}</strong></span>
                                  <span>PAREJAS LOGRADAS: <strong className="text-glow text-[#00ffcc]">{memoryCards.filter(c => c.matched).length / 2} / 4</strong></span>
                                </div>
                                <div className="memory-grid-cards">
                                  {memoryCards.map((card) => {
                                    const isFlipped = card.flipped || card.matched;
                                    return (
                                      <div 
                                        key={card.id}
                                        onClick={() => voltearCartaMemory(card.id)}
                                        className={`memory-card-element ${isFlipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''} ${card.errorShake ? 'shake-err' : ''}`}
                                      >
                                        <div className="memory-card-inner">
                                          <div className="memory-card-front font-mono text-xs">
                                            {card.texto}
                                          </div>
                                          <div className="memory-card-back">
                                            <span>🎴</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : vistaActiva === 'logros' ? (
            <LogrosPanel
              logrosDesbloqueados={logrosDesbloqueados}
              LISTA_LOGROS={LISTA_LOGROS}
              filtroLogros={filtroLogros}
              setFiltroLogros={setFiltroLogros}
            />
          ) : vistaActiva === 'cosmico' ? (
            <PerfilCosmico
              estudiante={estudiante}
              tareas={tareas}
              xpInfo={xpInfo}
              obtenerPosicionesProcedurales={obtenerPosicionesProcedurales}
              ArbolDeLaVidaCanvas={ArbolDeLaVidaCanvas}
            />
          ) : vistaActiva === 'amigos' ? (
            <AmigosPanel
              estudiante={estudiante}
              mostrarMensaje={mostrarMensaje}
              enviarSolicitudAmistad={enviarSolicitudAmistad}
              inputIdAmigo={inputIdAmigo}
              setInputIdAmigo={setInputIdAmigo}
              loadingAmigos={loadingAmigos}
              mensajeAmistad={mensajeAmistad}
              listaAmigos={listaAmigos}
              solicitudesPendientes={solicitudesPendientes}
              responderSolicitudAmistad={responderSolicitudAmistad}
            />
          ) : null}
          </React.Suspense>

          {/* Modal de Duelo 1vs1 Táctico */}
          {dueloActivo && (
            <div className="social-modal-overlay animate-fade-in" style={{ zIndex: 300 }}>
              <div className="duel-modal-card">
                <div className="duel-modal-header">
                  <Swords size={20} className="text-rose-500 animate-pulse" />
                  <span>SISTEMA DE DUELO COGNITIVO 1VS1</span>
                  <button className="close-modal-btn" onClick={() => setDueloActivo(null)}>
                    <X size={18} />
                  </button>
                </div>
                
                <div className="duel-modal-body text-center p-6">
                  {dueloActivo.cargando ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="radar-scan-circle mb-4">
                        <Swords size={32} className="text-[#00ffcc] animate-spin" style={{ animationDuration: '4s' }} />
                      </div>
                      <span className="text-xs text-slate-400 font-mono tracking-widest animate-pulse">
                        ESTABLECIENDO ENLACE NEURONAL CON {dueloActivo.oponenteNombre.toUpperCase()}...
                      </span>
                    </div>
                  ) : (
                    <div className="animate-scale-in">
                      <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-4 rounded mb-4">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-slate-400 font-mono">RETADOR</span>
                          <span className="font-bold text-base text-[#00ffcc]">{estudiante.nombre}</span>
                        </div>
                        <span className="text-rose-500 font-black text-xl italic font-mono px-4">VS</span>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-slate-400 font-mono">OPONENTE</span>
                          <span className="font-bold text-base text-rose-400">{dueloActivo.oponenteNombre}</span>
                        </div>
                      </div>

                      <div className="mission-assignment bg-rose-950/20 border border-rose-500/30 rounded p-4 mb-4 text-left">
                        <span className="text-[10px] text-rose-400 font-mono font-bold tracking-wider block mb-1">MISIÓN ASIGNADA POR EL MENTOR IA:</span>
                        <p className="text-xs text-slate-200 leading-relaxed font-mono">{dueloActivo.mision}</p>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button 
                          className="hud-btn bg-slate-900 border border-slate-800 text-slate-400 py-2.5 px-4 text-xs flex-1"
                          onClick={() => setDueloActivo(null)}
                        >
                          Abortar Duelo
                        </button>
                        <button 
                          className="hud-btn bg-rose-600 border border-rose-500 text-white py-2.5 px-4 text-xs flex-1 flex items-center justify-center gap-2"
                          onClick={() => {
                            setDueloActivo(null);
                            setVistaActiva('juegos');
                            registrarPartidaOnline(false);
                          }}
                        >
                          <Gamepad2 size={14} /> Comenzar Combate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notificación Flotante (Toast) de Logros */}
          {logroNotificado && (
            <div className={`logro-toast-notification animate-slide-in ${logroNotificado.tipo || 'bronce'}`}>
              <div className="toast-glow"></div>
              <div className="toast-content">
                <Trophy className="toast-icon animate-bounce" size={28} />
                <div className="toast-text">
                  <span className="toast-meta">¡LOGRO DESBLOQUEADO!</span>
                  <h4>{logroNotificado.titulo}</h4>
                  <p>{logroNotificado.desc}</p>
                </div>
                <div className="toast-xp">
                  <span>+{logroNotificado.xp} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Notificación Táctica en Tiempo Real (Solicitudes/Duelos) */}
          {toastActivo && (
            <div className="logro-toast-notification animate-slide-in oro" style={{ bottom: '24px', right: '24px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(8, 14, 28, 0.98))', borderColor: '#00f3ff', borderStyle: 'solid', borderWidth: '1px', boxShadow: '0 0 15px rgba(0, 243, 255, 0.25)', minWidth: '320px' }}>
              <div className="toast-glow" style={{ background: 'radial-gradient(circle at center, rgba(0, 243, 255, 0.2) 0%, transparent 70%)' }}></div>
              <div className="toast-content flex items-center justify-between gap-4 w-full p-1">
                <div className="toast-text flex-1">
                  <span className="toast-meta text-[#00f3ff] text-[9px] tracking-widest block uppercase font-mono">{toastActivo.titulo}</span>
                  <h4 className="text-white text-xs font-mono font-bold mt-1 leading-snug">{toastActivo.descripcion}</h4>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setToastActivo(null)}
                    className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-800 rounded transition-all"
                  >
                    DESCARTAR
                  </button>
                  <button 
                    onClick={toastActivo.onAccion}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-[#00ffcc] text-slate-950 font-mono text-[10px] font-bold rounded shadow-[0_0_8px_rgba(0,255,204,0.3)] transition-all hover:scale-105"
                  >
                    {toastActivo.accionLabel}
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
