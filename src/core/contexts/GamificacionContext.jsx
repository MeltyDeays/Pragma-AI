import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useEstudiante } from './EstudianteContext';
import { LISTA_LOGROS } from '../../logros/modelos/logrosModel';

const GamificacionContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export function GamificacionProvider({ children }) {
  const { estudiante, cargarEstado } = useEstudiante();
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [modoJuego, setModoJuego] = useState('pragma');
  const [juegoData, setJuegoData] = useState(null);
  const [juegoLoading, setJuegoLoading] = useState(false);
  const [juegoResultado, setJuegoResultado] = useState(null);
  const [juegoSeleccion, setJuegoSeleccion] = useState(null);
  const [sorterLineas, setSorterLineas] = useState([]);
  const [fillRespuestas, setFillRespuestas] = useState({});
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardScore, setFlashcardScore] = useState(0);
  const [flashcardStreak, setFlashcardStreak] = useState(0);
  const [xpInfo, setXpInfo] = useState({ xp: 0, nivel_rpg: 1 });

  const [typerInput, setTyperInput] = useState('');
  const [typerStartTime, setTyperStartTime] = useState(null);
  const [typerErrors, setTyperErrors] = useState(0);
  const [typerWpm, setTyperWpm] = useState(0);
  const [typerAccuracy, setTyperAccuracy] = useState(100);
  const [memoryCards, setMemoryCards] = useState([]);
  const [memorySelected, setMemorySelected] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [gameTimer, setGameTimer] = useState(null);

  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState([]);
  const logrosRef = useRef([]);
  const [logroNotificado, setLogroNotificado] = useState(null);
  const [filtroLogros, setFiltroLogros] = useState('todos');

  const cargarLogros = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/logros?estudiante_id=${id}`);
      const data = await res.json();
      if (res.ok && data.logros) {
        const ids = data.logros.map(l => l.logro_id);
        setLogrosDesbloqueados(ids);
        logrosRef.current = ids;
      }
    } catch (err) {
      console.error('Error al cargar logros:', err);
    }
  };

  const cargarXpInfo = async () => {
    if (!estudiante) return;
    try {
      const res = await fetch(`${API_BASE}/api/estudiantes/${estudiante.id}/estado`);
      const data = await res.json();
      if (res.ok && data.estudiante) {
        const pc = typeof data.estudiante.perfil_cognitivo === 'string' 
          ? JSON.parse(data.estudiante.perfil_cognitivo || '{}') 
          : data.estudiante.perfil_cognitivo;
        setXpInfo({
          xp: pc?.xp || 0,
          nivel_rpg: pc?.nivel_rpg || 1
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const desbloquearLogro = async (logroId) => {
    if (!estudiante) return;
    if (logrosRef.current.includes(logroId)) return;
    
    logrosRef.current = [...logrosRef.current, logroId];
    setLogrosDesbloqueados([...logrosRef.current]);

    try {
      const res = await fetch(`${API_BASE}/api/logros/desbloquear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, logro_id: logroId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const logroDef = LISTA_LOGROS.find(l => l.id === logroId);
        const detalle = logroDef || { titulo: '🌟 Logro Desbloqueado', desc: '¡Has superado un nuevo desafío!', tipo: 'bronce' };
        
        setLogroNotificado({
          titulo: detalle.titulo,
          desc: detalle.desc,
          xp: data.xpGanada,
          tipo: detalle.tipo
        });

        setTimeout(() => {
          setLogroNotificado(null);
        }, 5000);

        await cargarXpInfo();
      } else {
        logrosRef.current = logrosRef.current.filter(id => id !== logroId);
        setLogrosDesbloqueados([...logrosRef.current]);
      }
    } catch (err) {
      console.error('Error al desbloquear logro:', err);
      logrosRef.current = logrosRef.current.filter(id => id !== logroId);
      setLogrosDesbloqueados([...logrosRef.current]);
    }
  };

  const evaluarLogros = async (newXp = null, newRpg = null) => {
    if (!estudiante) return;
    
    const juegos = parseInt(localStorage.getItem(`ia_profesor_juegos_completados_${estudiante.id}`) || '0', 10);
    const trivias = parseInt(localStorage.getItem(`ia_profesor_trivias_correctas_${estudiante.id}`) || '0', 10);
    const cambios = parseInt(localStorage.getItem(`ia_profesor_cambios_ruta_${estudiante.id}`) || '0', 10);
    const mensajes = parseInt(localStorage.getItem(`ia_profesor_mensajes_mentor_${estudiante.id}`) || '0', 10);
    const entregas = parseInt(localStorage.getItem(`ia_profesor_entregas_tareas_${estudiante.id}`) || '0', 10);
    
    const xpVal = newXp !== null ? newXp : xpInfo.xp;
    const rpgVal = newRpg !== null ? newRpg : xpInfo.nivel_rpg;

    const candidatos = [];
    
    if (juegos >= 1) candidatos.push('primer_juego');
    if (juegos >= 3) candidatos.push('retos_3');
    if (juegos >= 5) candidatos.push('retos_5');
    if (juegos >= 10) candidatos.push('retos_10');

    if (xpVal >= 10) candidatos.push('xp_10');
    if (xpVal >= 25) candidatos.push('xp_25');
    if (xpVal >= 50) candidatos.push('xp_50');
    if (xpVal >= 100) candidatos.push('xp_100');
    if (xpVal >= 200) candidatos.push('xp_200');
    if (xpVal >= 300) candidatos.push('xp_300');
    if (xpVal >= 500) candidatos.push('xp_500');
    if (xpVal >= 1000) candidatos.push('xp_1000');

    if (rpgVal >= 2) candidatos.push('rpg_2');
    if (rpgVal >= 3) candidatos.push('rpg_3');
    if (rpgVal >= 4) candidatos.push('rpg_4');
    if (rpgVal >= 5) candidatos.push('rpg_5');
    if (rpgVal >= 6) candidatos.push('rpg_6');
    if (rpgVal >= 7) candidatos.push('rpg_7');
    if (rpgVal >= 8) candidatos.push('rpg_8');

    if (trivias >= 1) candidatos.push('trivias_correct');
    if (trivias >= 3) candidatos.push('trivias_3');
    if (trivias >= 5) candidatos.push('trivias_5');
    if (trivias >= 10) candidatos.push('trivias_10');

    if (cambios >= 1) candidatos.push('cambio_ruta');
    if (cambios >= 3) candidatos.push('cambio_ruta_3');
    if (cambios >= 5) candidatos.push('cambio_ruta_5');

    if (mensajes >= 5) candidatos.push('chat_mentor_5');
    if (mensajes >= 10) candidatos.push('chat_mentor_10');
    if (mensajes >= 20) candidatos.push('chat_mentor_20');

    if (entregas >= 1) candidatos.push('entrega_1');
    if (entregas >= 3) candidatos.push('entrega_3');
    if (entregas >= 5) candidatos.push('entrega_5');

    const nuevos = candidatos.filter(id => !logrosRef.current.includes(id));
    if (nuevos.length === 0) return;

    logrosRef.current = [...logrosRef.current, ...nuevos];
    setLogrosDesbloqueados([...logrosRef.current]);

    try {
      const res = await fetch(`${API_BASE}/api/logros/desbloquear-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, logros_ids: nuevos })
      });
      const data = await res.json();
      if (res.ok && data.success && data.nuevosDesbloqueados && data.nuevosDesbloqueados.length > 0) {
        const primerLogro = data.nuevosDesbloqueados[0];
        const logroDef = LISTA_LOGROS.find(l => l.id === primerLogro);
        const detalle = logroDef || { titulo: '🌟 Logro Desbloqueado', desc: '¡Has superado un nuevo desafío!', tipo: 'bronce' };
        
        setLogroNotificado({
          titulo: data.nuevosDesbloqueados.length > 1 
            ? `${detalle.titulo} (+${data.nuevosDesbloqueados.length - 1} más)`
            : detalle.titulo,
          desc: detalle.desc,
          xp: data.xpGanada,
          tipo: detalle.tipo
        });

        setTimeout(() => { setLogroNotificado(null); }, 5000);
        await cargarXpInfo();
      }
    } catch (err) {
      console.error('Error al desbloquear logros en batch:', err);
      logrosRef.current = logrosRef.current.filter(id => !nuevos.includes(id));
      setLogrosDesbloqueados([...logrosRef.current]);
    }
  };

  useEffect(() => {
    if (estudiante?.id) {
      cargarLogros(estudiante.id);
      cargarXpInfo();
    }
  }, [estudiante]);

  return (
    <GamificacionContext.Provider value={{
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
    }}>
      {children}
    </GamificacionContext.Provider>
  );
}

export function useGamificacion() {
  const context = useContext(GamificacionContext);
  if (!context) throw new Error('useGamificacion debe usarse dentro de GamificacionProvider');
  return context;
}
