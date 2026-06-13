import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Award, Download, CheckCircle2, AlertTriangle, Play, RefreshCw, Send, Code, Sparkles, User, LogOut, Check, ChevronRight, Gamepad2, Zap, Brain, Trophy, Target, Shuffle, GitFork, Lock, Unlock, Keyboard, Eye, Filter } from 'lucide-react';
import './App.css';
import PragmaGames from './PragmaGames';


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const LISTA_LOGROS = [
  // Bronce (1-4)
  { id: 'primer_juego', titulo: '🏆 EL DESPERTAR DEL INICIADO', desc: 'Completa con éxito cualquier minijuego de la Zona de Juegos.', xp: 15, tipo: 'bronce' },
  { id: 'retos_3', titulo: '🏆 TRIPLE ALIANZA DEL CÓDIGO', desc: 'Has completado 3 minijuegos. ¡El impulso es real!', xp: 20, tipo: 'bronce' },
  { id: 'retos_5', titulo: '🏆 GLADIADOR EN ENTRENAMIENTO', desc: 'Has completado 5 minijuegos con destreza e intelecto.', xp: 25, tipo: 'bronce' },
  { id: 'retos_10', titulo: '🏆 GUERRERO DEL COMPILADOR', desc: 'Has completado 10 minijuegos. ¡Dominas la arena!', xp: 30, tipo: 'bronce' },
  
  // Fuego (5-8)
  { id: 'racha_flashcard', titulo: '🔥 LLAMAS DE MEMORIA IMPERECEDERA', desc: 'Consigue una racha de 3 aciertos consecutivos en Flashcards.', xp: 25, tipo: 'fuego' },
  { id: 'racha_flashcard_5', titulo: '🔥 FÉNIX DEL APRENDIZAJE RÁPIDO', desc: 'Consigue una racha de 5 aciertos consecutivos en Flashcards.', xp: 35, tipo: 'fuego' },
  { id: 'racha_flashcard_8', titulo: '🔥 VOLCÁN COGNITIVO ACTIVO', desc: 'Consigue una racha de 8 aciertos consecutivos en Flashcards.', xp: 45, tipo: 'fuego' },
  { id: 'racha_flashcard_10', titulo: '🔥 INFERNO DE CONOCIMIENTO ABSOLUTO', desc: 'Consigue una racha de 10 aciertos en Flashcards. ¡Fuego mental puro!', xp: 60, tipo: 'fuego' },
  
  // Celestial (9-12)
  { id: 'precis_typer', titulo: '👼 AUREOLA DEL MECANÓGRAFO', desc: 'Escribe la línea de código en el Typer con 100% de precisión.', xp: 30, tipo: 'celestial' },
  { id: 'typer_veloz', titulo: '👼 ALAS DEL VIENTO DE SILICIO', desc: 'Supera una velocidad de escritura de 80 WPM en el Code Typer.', xp: 35, tipo: 'celestial' },
  { id: 'typer_supersound', titulo: '👼 BARRERA DEL SONIDO CRUJIENTE', desc: 'Supera una velocidad de escritura de 100 WPM en el Code Typer.', xp: 50, tipo: 'celestial' },
  { id: 'typer_dios', titulo: '👼 DEIDAD DE LA ESCRITURA SAGRADA', desc: 'Logra 100% de precisión a una velocidad de más de 90 WPM.', xp: 60, tipo: 'celestial' },
  
  // Acuático (13-16)
  { id: 'trivias_correct', titulo: '💧 GOTA DE SABIDURÍA ANCESTRAL', desc: 'Responde correctamente una trivia técnica adaptada por la IA.', xp: 25, tipo: 'acuatico' },
  { id: 'trivias_3', titulo: '💧 TRIDENTE DE LA VERDAD TÉCNICA', desc: 'Responde correctamente 3 trivias técnicas.', xp: 30, tipo: 'acuatico' },
  { id: 'trivias_5', titulo: '💧 MAREA ALTA DE RESPUESTAS', desc: 'Responde correctamente 5 trivias técnicas.', xp: 40, tipo: 'acuatico' },
  { id: 'trivias_10', titulo: '💧 POSEIDÓN DEL DESARROLLO', desc: 'Responde correctamente 10 trivias técnicas. ¡El océano de código te obedece!', xp: 60, tipo: 'acuatico' },
  
  // Mecha (17-19)
  { id: 'memory_perfecto', titulo: '🤖 INTERFAZ NEURONAL OPTIMIZADA', desc: 'Completa el juego de Memory Match con 0 errores.', xp: 30, tipo: 'mecha' },
  { id: 'memory_rapido', titulo: '🤖 PROCESADOR DE HILO CUÁNTICO', desc: 'Completa el Memory Match en menos de 10 segundos.', xp: 35, tipo: 'mecha' },
  { id: 'memory_dios', titulo: '🤖 NÚCLEO DE IA AUTO-EVOLUTIVO', desc: 'Completa el Memory Match en menos de 6 segundos.', xp: 50, tipo: 'mecha' },
  
  // Esmeralda (20-27)
  { id: 'xp_10', titulo: '🟢 CHISPA DE ESMERALDA', desc: 'Acumula un total de 10 XP en tu perfil de estudiante.', xp: 10, tipo: 'esmeralda' },
  { id: 'xp_25', titulo: '🟢 CRISTALIZACIÓN EN PROGRESO', desc: 'Acumula un total de 25 XP en tu perfil de estudiante.', xp: 15, tipo: 'esmeralda' },
  { id: 'xp_50', titulo: '🟢 GEMAS DE EXPERIENCIA', desc: 'Acumula un total de 50 XP en tu perfil de estudiante.', xp: 20, tipo: 'esmeralda' },
  { id: 'xp_100', titulo: '🟢 RESPLANDOR ESMERALDA', desc: 'Acumula un total de 100 XP en tu perfil de estudiante.', xp: 45, tipo: 'esmeralda' },
  { id: 'xp_200', titulo: '🟢 PODER DE LA TIERRA VERDE', desc: 'Acumula un total de 200 XP en tu perfil de estudiante.', xp: 55, tipo: 'esmeralda' },
  { id: 'xp_300', titulo: '🟢 CORAZÓN DEL VALLE DE LA IA', desc: 'Acumula un total de 300 XP en tu perfil de estudiante.', xp: 65, tipo: 'esmeralda' },
  { id: 'xp_500', titulo: '🟢 LEYENDA ECOLOGISTA DE SOFTWARE', desc: 'Acumula un total de 500 XP en tu perfil de estudiante.', xp: 80, tipo: 'esmeralda' },
  { id: 'xp_1000', titulo: '🟢 DIOS DE LA ESMERALDA INFINITA', desc: 'Acumula un total de 1000 XP en tu perfil de estudiante.', xp: 150, tipo: 'esmeralda' },
  
  // Anime/Manga (28-31)
  { id: 'primer_mentor', titulo: '🌸 DIARIO DE UNA NUEVA AVENTURA', desc: 'Conéctate con tu Mentor IA para iniciar tu primer plan de proyecto.', xp: 20, tipo: 'anime' },
  { id: 'chat_mentor_5', titulo: '🌸 CONVERSACIONES BAJO EL CEREZO', desc: 'Envía 5 mensajes en el chat del Mentor para resolver tus dudas.', xp: 25, tipo: 'anime' },
  { id: 'chat_mentor_10', titulo: '🌸 VÍNCULO SENSEI-ALUMNO ACTIVO', desc: 'Envía 10 mensajes en el chat del Mentor.', xp: 35, tipo: 'anime' },
  { id: 'chat_mentor_20', titulo: '🌸 TRASPASANDO LÍMITES (PLUS ULTRA)', desc: 'Envía 20 mensajes en el chat del Mentor. ¡Supera tu propio límite!', xp: 50, tipo: 'anime' },
  
  // Diamante (32-37)
  { id: 'calif_100', titulo: '💎 ARQUITECTO DE DIAMANTE', desc: 'Obtén una calificación perfecta de 100 puntos en una entrega calificada por la IA.', xp: 50, tipo: 'diamante' },
  { id: 'calif_95', titulo: '💎 BRILLO IMPECABLE EN ENTREGAS', desc: 'Obtén una calificación superior o igual a 95 en una entrega.', xp: 40, tipo: 'diamante' },
  { id: 'calif_90', titulo: '💎 CRISTAL DE EXCELENCIA', desc: 'Obtén una calificación superior o igual a 90 en una entrega.', xp: 30, tipo: 'diamante' },
  { id: 'entrega_1', titulo: '💎 CÓDIGO SUBIDO AL REPOSITORIO', desc: 'Realiza 1 entrega de tarea evaluada por la IA.', xp: 20, tipo: 'diamante' },
  { id: 'entrega_3', titulo: '💎 MAESTRO DE LOS COMMITS', desc: 'Realiza 3 entregas de tarea.', xp: 30, tipo: 'diamante' },
  { id: 'entrega_5', titulo: '💎 DESPLEGANDO EN PRODUCCIÓN', desc: 'Realiza 5 entregas de tarea.', xp: 45, tipo: 'diamante' },
  
  // Rubí (38-40)
  { id: 'cambio_ruta', titulo: '🔴 CANALIZACIÓN DE RUBÍ BRUTAL', desc: 'Cambia tu tecnología actual en el selector para aprender un nuevo lenguaje.', xp: 15, tipo: 'rubi' },
  { id: 'cambio_ruta_3', titulo: '🔴 POLÍGLOTA DIVINO DEL CÓDIGO', desc: 'Cambia de ruta tecnológica 3 veces para ampliar tus horizontes.', xp: 30, tipo: 'rubi' },
  { id: 'cambio_ruta_5', titulo: '🔴 MAESTRO MULTI-PARADIGMA', desc: 'Cambia de ruta tecnológica 5 veces.', xp: 45, tipo: 'rubi' },
  
  // Cósmico (41-47)
  { id: 'rpg_2', titulo: '🌌 ÓRBITA GEOCÉNTRICA ALCANZADA', desc: 'Alcanza el nivel RPG 2 en la plataforma.', xp: 20, tipo: 'cosmico' },
  { id: 'rpg_3', titulo: '🌌 VIAJE A LA NUBE DE OORT', desc: 'Alcanza el nivel RPG 3 en la plataforma.', xp: 30, tipo: 'cosmico' },
  { id: 'rpg_4', titulo: '🌌 CONSTELACIÓN DE ALTA ENERGÍA', desc: 'Alcanza el nivel RPG 4 en la plataforma.', xp: 40, tipo: 'cosmico' },
  { id: 'rpg_5', titulo: '🌌 SINGULARIDAD ESPACIAL DETECTADA', desc: 'Alcanza el nivel RPG 5. ¡Eres un maestro consumado!', xp: 50, tipo: 'cosmico' },
  { id: 'rpg_6', titulo: '🌌 SUPERNOVA DE LA INGENIERÍA', desc: 'Alcanza el nivel RPG 6.', xp: 60, tipo: 'cosmico' },
  { id: 'rpg_7', titulo: '🌌 AGUJERO DE GUSANO COGNITIVO', desc: 'Alcanza el nivel RPG 7.', xp: 80, tipo: 'cosmico' },
  { id: 'rpg_8', titulo: '🌌 DIOS EMPERADOR DEL COSMOS', desc: 'Alcanza el nivel RPG 8. ¡Poder y control cósmico absoluto!', xp: 150, tipo: 'cosmico' },
  
  // Obsidiana (48-50)
  { id: 'click_perfil', titulo: '🔮 ACCESO A LA MATRIX NEGRA', desc: 'Visita tu perfil de estudiante calificado.', xp: 10, tipo: 'obsidiana' },
  { id: 'click_logros', titulo: '🔮 INSPECCIÓN DEL COFRE DEL TESORO', desc: 'Abre la pestaña de medallero de logros.', xp: 10, tipo: 'obsidiana' },
  { id: 'click_temario', titulo: '🔮 MAPA DEL LABERINTO CREADO', desc: 'Visita la pestaña del temario de aprendizaje.', xp: 10, tipo: 'obsidiana' }
];

const parsearInlineMarkdown = (text) => {
  if (!text) return text;
  const parts = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    let earliest = null;
    let earliestIdx = remaining.length;

    if (boldMatch && boldMatch.index < earliestIdx) { earliest = 'bold'; earliestIdx = boldMatch.index; }
    if (codeMatch && codeMatch.index < earliestIdx) { earliest = 'code'; earliestIdx = codeMatch.index; }
    if (linkMatch && linkMatch.index < earliestIdx) { earliest = 'link'; earliestIdx = linkMatch.index; }
    if (!earliest && italicMatch && italicMatch.index < earliestIdx) { earliest = 'italic'; earliestIdx = italicMatch.index; }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.substring(0, earliestIdx));
    }

    if (earliest === 'bold') {
      parts.push(<strong key={`b${keyIdx++}`}>{boldMatch[1]}</strong>);
      remaining = remaining.substring(earliestIdx + boldMatch[0].length);
    } else if (earliest === 'italic') {
      parts.push(<em key={`i${keyIdx++}`}>{italicMatch[1]}</em>);
      remaining = remaining.substring(earliestIdx + italicMatch[0].length);
    } else if (earliest === 'code') {
      parts.push(<code key={`c${keyIdx++}`} className="inline-code-mentor">{codeMatch[1]}</code>);
      remaining = remaining.substring(earliestIdx + codeMatch[0].length);
    } else if (earliest === 'link') {
      parts.push(<a key={`l${keyIdx++}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="mentor-link">{linkMatch[1]}</a>);
      remaining = remaining.substring(earliestIdx + linkMatch[0].length);
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
};

const parsearMarkdownMentor = (md) => {
  if (!md) return null;
  
  const lines = md.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockContent.join('\n');
        const lang = codeBlockLang;
        elements.push(
          <div key={`code-${i}`} className="mentor-code-wrapper">
            <div className="code-block-header">
              <span className="code-lang-label">{lang ? lang.toUpperCase() : 'CODE'}</span>
              <button
                type="button"
                className="btn-copy-code"
                onClick={(e) => {
                  navigator.clipboard.writeText(codeText);
                  const btn = e.currentTarget;
                  btn.textContent = '✓ Copiado';
                  btn.classList.add('copied');
                  setTimeout(() => { btn.textContent = 'Copiar'; btn.classList.remove('copied'); }, 2000);
                }}
              >Copiar</button>
            </div>
            <pre className="mentor-code-block">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockContent = [];
        codeBlockLang = '';
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={i} className="mentor-hr" />);
    } else if (trimmed.startsWith('####')) {
      elements.push(<h5 key={i}>{parsearInlineMarkdown(trimmed.replace('####', '').trim())}</h5>);
    } else if (trimmed.startsWith('###')) {
      elements.push(<h4 key={i}>{parsearInlineMarkdown(trimmed.replace('###', '').trim())}</h4>);
    } else if (trimmed.startsWith('##')) {
      elements.push(<h3 key={i}>{parsearInlineMarkdown(trimmed.replace('##', '').trim())}</h3>);
    } else if (trimmed.startsWith('#')) {
      elements.push(<h2 key={i}>{parsearInlineMarkdown(trimmed.replace('#', '').trim())}</h2>);
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      elements.push(
        <div key={i} className="numbered-item-mentor">
          <span className="numbered-item-num">{numMatch[1]}</span>
          <span className="numbered-item-text">{parsearInlineMarkdown(numMatch[2])}</span>
        </div>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(<li key={i} className="bullet-li-mentor">{parsearInlineMarkdown(trimmed.substring(2).trim())}</li>);
    } else if (trimmed.length === 0) {
      elements.push(<div key={i} className="md-spacing" />);
    } else {
      elements.push(<p key={i}>{parsearInlineMarkdown(line)}</p>);
    }
  }

  return elements;
};

const parsearRequisitos = (descripcion) => {
  if (!descripcion) return [];
  const regexPasos = /(?:\d+\.\s+)(.*?)(?=\s*\d+\.\s+|$)/gs;
  const matches = [...descripcion.matchAll(regexPasos)];
  
  if (matches.length > 0) {
    return matches.map((m, idx) => ({
      numero: idx + 1,
      texto: m[1].trim()
    }));
  }
  
  const lineas = descripcion.split(/\r?\n/).filter(linea => linea.trim().length > 0);
  if (lineas.length > 1) {
    return lineas.map((linea, idx) => {
      const textoLimpio = linea.replace(/^\s*\d+[\.\)-]\s*/, '').trim();
      return {
        numero: idx + 1,
        texto: textoLimpio
      };
    });
  }
  
  return [{ numero: 1, texto: descripcion }];
};

function App() {
  const [nombre, setNombre] = useState('');
  const [tecnologia, setTecnologia] = useState('JavaScript');
  const [estudiante, setEstudiante] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [temario, setTemario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('codigo'); // 'codigo' o 'github'
  const [codigoEntregado, setCodigoEntregado] = useState('');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [mostrarTodoTemario, setMostrarTodoTemario] = useState(false);

  // Estados para el Asistente de Proyectos (Mentor)
  const [vistaActiva, setVistaActiva] = useState('ruta'); // 'ruta' | 'mentor' | 'juegos' | 'habilidades'
  const [nivelSkillTree, setNivelSkillTree] = useState('Novato');
  const [habilidadSeleccionada, setHabilidadSeleccionada] = useState(null);
  const [ideaProyecto, setIdeaProyecto] = useState('');
  const [githubUrlMentor, setGithubUrlMentor] = useState('');
  const [planesMentor, setPlanesMentor] = useState([]);
  const [planActivo, setPlanActivo] = useState(null);
  const [mensajeChatMentor, setMensajeChatMentor] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [tabMentorColumn, setTabMentorColumn] = useState('plan'); // 'plan' | 'guias'
  const [guiasAyuda, setGuiasAyuda] = useState([]);
  const [guiaAyudaSeleccionada, setGuiaAyudaSeleccionada] = useState(null);
  const [regeneratingGuiaId, setRegeneratingGuiaId] = useState(null);
  const [perfilCognitivoExpandido, setPerfilCognitivoExpandido] = useState(false);
  const [personalidadMentor, setPersonalidadMentor] = useState('Riguroso');

  // Estados de Gamificación
  const [juegoActivo, setJuegoActivo] = useState(null);
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

  // Nuevos estados para Code Typer y Memory Match
  const [typerInput, setTyperInput] = useState('');
  const [typerStartTime, setTyperStartTime] = useState(null);
  const [typerErrors, setTyperErrors] = useState(0);
  const [typerWpm, setTyperWpm] = useState(0);
  const [typerAccuracy, setTyperAccuracy] = useState(100);
  const [memoryCards, setMemoryCards] = useState([]);
  const [memorySelected, setMemorySelected] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [gameTimer, setGameTimer] = useState(null);

  // Estados del sistema de logros
  const [logrosDesbloqueados, setLogrosDesbloqueados] = useState([]);
  const logrosRef = useRef([]);
  const [logroNotificado, setLogroNotificado] = useState(null);
  const [filtroLogros, setFiltroLogros] = useState('todos');

  // Cargar sesión guardada en localStorage al iniciar
  useEffect(() => {
    const sesionGuardada = localStorage.getItem('estudiante_sesion');
    if (sesionGuardada) {
      const parsed = JSON.parse(sesionGuardada);
      setEstudiante(parsed);
      cargarEstado(parsed.id);
    }
  }, []);

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

  // Cargar guías de ayuda de forma aislada para el plan seleccionado
  useEffect(() => {
    if (planActivo) {
      setTabMentorColumn('plan');
      setGuiaAyudaSeleccionada(null);
      cargarGuiasAyuda(planActivo.id);
    } else {
      setGuiasAyuda([]);
      setGuiaAyudaSeleccionada(null);
    }
  }, [planActivo]);

  const cargarGuiasAyuda = async (planId) => {
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

  const cargarLogros = async (id) => {
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

  const desbloquearLogro = async (logroId) => {
    if (!estudiante) return;
    if (logrosRef.current.includes(logroId)) return;
    
    // Actualización inmediata para prevenir llamadas múltiples simultáneas
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

        reproducirSonido('exito');

        setTimeout(() => {
          setLogroNotificado(null);
        }, 5000);

        await cargarXpInfo();
      } else {
        // Deshacer si falla en el servidor
        logrosRef.current = logrosRef.current.filter(id => id !== logroId);
        setLogrosDesbloqueados([...logrosRef.current]);
      }
    } catch (err) {
      console.error('Error al desbloquear logro:', err);
      // Deshacer si hay error de red
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
    
    const xpVal = newXp !== null ? newXp : (xpInfo ? xpInfo.xp : 0);
    const rpgVal = newRpg !== null ? newRpg : (xpInfo ? xpInfo.nivel_rpg : 1);

    if (juegos >= 1) await desbloquearLogro('primer_juego');
    if (juegos >= 3) await desbloquearLogro('retos_3');
    if (juegos >= 5) await desbloquearLogro('retos_5');
    if (juegos >= 10) await desbloquearLogro('retos_10');

    if (xpVal >= 10) await desbloquearLogro('xp_10');
    if (xpVal >= 25) await desbloquearLogro('xp_25');
    if (xpVal >= 50) await desbloquearLogro('xp_50');
    if (xpVal >= 100) await desbloquearLogro('xp_100');
    if (xpVal >= 200) await desbloquearLogro('xp_200');
    if (xpVal >= 300) await desbloquearLogro('xp_300');
    if (xpVal >= 500) await desbloquearLogro('xp_500');
    if (xpVal >= 1000) await desbloquearLogro('xp_1000');

    if (rpgVal >= 2) await desbloquearLogro('rpg_2');
    if (rpgVal >= 3) await desbloquearLogro('rpg_3');
    if (rpgVal >= 4) await desbloquearLogro('rpg_4');
    if (rpgVal >= 5) await desbloquearLogro('rpg_5');
    if (rpgVal >= 6) await desbloquearLogro('rpg_6');
    if (rpgVal >= 7) await desbloquearLogro('rpg_7');
    if (rpgVal >= 8) await desbloquearLogro('rpg_8');

    if (trivias >= 1) await desbloquearLogro('trivias_correct');
    if (trivias >= 3) await desbloquearLogro('trivias_3');
    if (trivias >= 5) await desbloquearLogro('trivias_5');
    if (trivias >= 10) await desbloquearLogro('trivias_10');

    if (cambios >= 1) await desbloquearLogro('cambio_ruta');
    if (cambios >= 3) await desbloquearLogro('cambio_ruta_3');
    if (cambios >= 5) await desbloquearLogro('cambio_ruta_5');

    if (mensajes >= 5) await desbloquearLogro('chat_mentor_5');
    if (mensajes >= 10) await desbloquearLogro('chat_mentor_10');
    if (mensajes >= 20) await desbloquearLogro('chat_mentor_20');

    if (entregas >= 1) await desbloquearLogro('entrega_1');
    if (entregas >= 3) await desbloquearLogro('entrega_3');
    if (entregas >= 5) await desbloquearLogro('entrega_5');
  };

  const irAVista = async (vista) => {
    setVistaActiva(vista);
    if (!estudiante) return;
    if (vista === 'habilidades') {
      const count = parseInt(localStorage.getItem(`ia_profesor_click_temario_${estudiante.id}`) || '0', 10) + 1;
      localStorage.setItem(`ia_profesor_click_temario_${estudiante.id}`, count.toString());
      await evaluarLogros();
    } else if (vista === 'logros') {
      const count = parseInt(localStorage.getItem(`ia_profesor_click_logros_${estudiante.id}`) || '0', 10) + 1;
      localStorage.setItem(`ia_profesor_click_logros_${estudiante.id}`, count.toString());
      await evaluarLogros();
    }
  };

  const cargarEstado = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/estudiantes/${id}/estado`);
      const data = await res.json();
      if (res.ok) {
        setEstudiante(data.estudiante);
        setTareas(data.tareas);
        setTemario(data.temario);
        await cargarPlanesMentor(id);
        await cargarLogros(id);
      } else {
        mostrarMensaje(data.error || 'Error al cargar el estado', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('No se pudo conectar con el servidor backend', 'error');
    }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/estudiantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tecnologia })
      });
      const data = await res.json();

      if (res.ok) {
        setEstudiante(data);
        localStorage.setItem('estudiante_sesion', JSON.stringify(data));
        await cargarEstado(data.id);
        mostrarMensaje(`¡Bienvenido de vuelta, ${data.nombre}!`, 'exito');
      } else {
        mostrarMensaje(data.error || 'Error al iniciar sesión', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión con el backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('estudiante_sesion');
    setEstudiante(null);
    setTareas([]);
    setTemario([]);
    setNombre('');
  };

  const cambiarTecnologia = async (nuevaTech) => {
    if (!estudiante) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const generarNuevaTarea = async () => {
    if (!estudiante) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
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
        if (puntaje === 100) {
          await desbloquearLogro('calif_100');
        }
        if (puntaje >= 95) {
          await desbloquearLogro('calif_95');
        }
        if (puntaje >= 90) {
          await desbloquearLogro('calif_90');
        }
        
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

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 6000);
  };

  const cargarPlanesMentor = async (estId) => {
    try {
      const res = await fetch(`${API_BASE}/api/mentor/planes/${estId}`);
      const data = await res.json();
      if (res.ok) {
        setPlanesMentor(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const crearPlanMentor = async (e) => {
    e.preventDefault();
    if (!ideaProyecto.trim()) return;
    setMentorLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/crear-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          idea_proyecto: ideaProyecto,
          github_url: githubUrlMentor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPlanesMentor(prev => [data, ...prev]);
        setPlanActivo(data);
        setIdeaProyecto('');
        setGithubUrlMentor('');
        mostrarMensaje('¡Plan de Implementación Académico Generado por el Mentor!', 'exito');
        await desbloquearLogro('primer_mentor');
      } else {
        mostrarMensaje(data.error || 'Error al generar el plan', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error al contactar con el mentor', 'error');
    } finally {
      setMentorLoading(false);
    }
  };

  const enviarMensajeMentor = async (e) => {
    e.preventDefault();
    if (!mensajeChatMentor.trim() || !planActivo) return;
    setChatLoading(true);
    const mensajeEstudiante = mensajeChatMentor;
    setMensajeChatMentor('');
    
    // Feedback visual inmediato en el chat
    setPlanActivo(prev => ({
      ...prev,
      mensajes: [...prev.mensajes, { remitente: 'estudiante', texto: mensajeEstudiante, fecha: new Date().toISOString() }]
    }));

    try {
      const res = await fetch(`${API_BASE}/api/mentor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planActivo.id,
          mensaje: mensajeEstudiante,
          personalidad: personalidadMentor
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPlanActivo(prev => ({
          ...prev,
          mensajes: data.mensajes
        }));
        setPlanesMentor(prev => prev.map(p => p.id === planActivo.id ? { ...p, mensajes: data.mensajes } : p));
        // Recargar la lista de guías de ayuda al recibir la respuesta
        await cargarGuiasAyuda(planActivo.id);
        
        // Incrementar mensajes del mentor en localStorage
        const currentMsgs = parseInt(localStorage.getItem(`ia_profesor_mensajes_mentor_${estudiante.id}`) || '0', 10) + 1;
        localStorage.setItem(`ia_profesor_mensajes_mentor_${estudiante.id}`, currentMsgs.toString());
        await evaluarLogros();

        // Cargar el estado del estudiante de forma asíncrona tras un breve delay para refrescar el perfil cognitivo
        setTimeout(() => {
          if (estudiante?.id) {
            cargarEstado(estudiante.id);
          }
        }, 3000);
      } else {
        mostrarMensaje(data.error || 'Error al enviar mensaje al mentor', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión con el mentor', 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const regenerarGuiaAyuda = async (docId) => {
    if (!window.confirm("¿Deseas regenerar esta guía técnica de ayuda con una alternativa de diseño o solución ampliada?")) return;
    setRegeneratingGuiaId(docId);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/documentos/regenerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento_id: docId })
      });
      const data = await res.json();
      if (res.ok) {
        mostrarMensaje('Guía de ayuda técnica regenerada con éxito', 'exito');
        
        // Actualizar la lista de guías
        setGuiasAyuda(prev => prev.map(g => g.id === docId ? {
          ...g,
          respuesta_mentor: data.respuesta_mentor,
          documento_markdown: data.documento_markdown,
          word_url: data.word_url
        } : g));

        // Si es la guía seleccionada actualmente, actualizar la vista previa
        setGuiaAyudaSeleccionada(prev => prev?.id === docId ? {
          ...prev,
          respuesta_mentor: data.respuesta_mentor,
          documento_markdown: data.documento_markdown,
          word_url: data.word_url
        } : prev);

        // Actualizar también en el plan activo los mensajes del chat
        if (planActivo) {
          const mensajesActualizados = planActivo.mensajes.map(m => {
            if (m.documento_ayuda && m.documento_ayuda.id === docId) {
              return {
                ...m,
                texto: data.respuesta_mentor,
                documento_ayuda: {
                  ...m.documento_ayuda,
                  titulo: m.documento_ayuda.titulo,
                  word_url: data.word_url,
                  markdown: data.documento_markdown
                }
              };
            }
            return m;
          });
          setPlanActivo(prev => ({ ...prev, mensajes: mensajesActualizados }));
          setPlanesMentor(prev => prev.map(p => p.id === planActivo.id ? { ...p, mensajes: mensajesActualizados } : p));
        }
      } else {
        mostrarMensaje(data.error || 'Error al regenerar la guía de ayuda', 'error');
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje('Error de conexión al regenerar la guía', 'error');
    } finally {
      setRegeneratingGuiaId(null);
    }
  };

  // Función para parsear observaciones con desglose de rúbrica
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
    } catch (e) {
      // Ignorar error, tratar como texto plano
    }
    return {
      esEstructurado: false,
      comentarios: obsRaw
    };
  };

  // Funciones de Gamificación
  const cargarXpInfo = useCallback(() => {
    if (!estudiante) return;
    try {
      const perfil = JSON.parse(estudiante.perfil_cognitivo || '{}');
      setXpInfo({ xp: perfil.xp || 0, nivel_rpg: perfil.nivel_rpg || 1 });
      setNivelSkillTree(estudiante.nivel_actual || 'Novato');
    } catch { setXpInfo({ xp: 0, nivel_rpg: 1 }); }
  }, [estudiante]);

  useEffect(() => { cargarXpInfo(); }, [cargarXpInfo]);

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
          // Temporizador de Trivia
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

  return (
    <div className="container-app">
      <header className="header-app">
        <div className="header-logo">
          <Sparkles className="icon-logo" />
          <h1>Pragma AI</h1>
        </div>
        {estudiante && (
          <div className="header-profile">
            <span className="profile-badge" onClick={() => { irAVista('habilidades'); desbloquearLogro('click_perfil'); }} style={{ cursor: 'pointer' }} title="Ver mi Perfil y Habilidades">
              <User className="icon-user" /> {estudiante.nombre}
            </span>
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

            {vistaActiva === 'ruta' ? (
              <div className="dashboard-grid">
            {/* Panel Principal de la Tarea Activa */}
            <section className="dashboard-panel active-task-panel">
              {/* Progreso del Temario */}
              <div className="temario-progreso-container">
                <div className="progreso-header">
                  <span>PLAN DE ESTUDIOS</span>
                  <span>Módulo {indiceTemaActual} de {temario.length}</span>
                </div>
                <div className="progreso-bar">
                  <div 
                    className="progreso-bar-fill"
                    style={{ width: `${Math.min(100, (indiceTemaActual / temario.length) * 100)}%` }}
                  ></div>
                </div>
                <div className="progreso-tema-nombre">
                  <strong>Tema Actual:</strong> {temaNombreActual}
                </div>
              </div>

              {tareaActiva ? (
                <div className="task-detail-card">
                  <div className="card-header">
                    <span className="badge-tech">{tareaActiva.tema}</span>
                    <span className="badge-level">{tareaActiva.nivel}</span>
                  </div>

                  <h2>{tareaActiva.titulo}</h2>

                  <div className="task-desc">
                    <h3>Requisitos Técnicos del Módulo</h3>
                    <div className="requirements-list">
                      {parsearRequisitos(tareaActiva.descripcion).map((req) => (
                        <div key={req.numero} className="requirement-item">
                          <div className="requirement-num">{req.numero}</div>
                          <p className="requirement-text">{req.texto}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="download-area">
                    <div className="download-info">
                      <BookOpen className="icon-doc" />
                      <div>
                        <h4>Guía Conceptual y Tarea</h4>
                        <p>Descarga el documento de Word con explicaciones, retos expertos y buenas prácticas.</p>
                      </div>
                    </div>
                    <div className="action-buttons-wrapper">
                      <a
                        href={tareaActiva.word_url ? `${API_BASE}${tareaActiva.word_url}` : '#'}
                        download
                        className="btn-download"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download size={18} /> Descargar Word
                      </a>
                      <button
                        onClick={handleRegenerar}
                        disabled={isRegenerating}
                        className="btn-regenerar"
                      >
                        <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
                        {isRegenerating ? 'Regenerando...' : 'Regenerar Guía'}
                      </button>
                    </div>
                  </div>

                  {/* Historial de Intentos de Evaluación y Rúbricas */}
                  {tareaActiva.entregas && tareaActiva.entregas.length > 0 && (() => {
                    const ultimaEntrega = tareaActiva.entregas[0];
                    const infoObs = parseObservaciones(ultimaEntrega.observaciones);

                    return (
                      <div className="attempts-history">
                        <h3>Última Evaluación de Pragma AI</h3>
                        <div className="attempt-card failed">
                          <div className="attempt-header">
                            <span className={`attempt-score ${ultimaEntrega.puntaje < 90 ? 'attempt-score-fail' : ''}`}>Calificación: {ultimaEntrega.puntaje}/100</span>
                            <span className="attempt-date">Intento del {new Date(ultimaEntrega.fecha_entrega).toLocaleDateString()}</span>
                          </div>

                          {infoObs.esEstructurado && (
                            <div className="rubrica-desglose">
                              <h4>Desglose de Rúbrica de Producción</h4>
                              <div className="rubrica-items">
                                <div className="rubrica-item">
                                  <div className="rubrica-item-header">
                                    <span>Funcionalidad (Máx 40)</span>
                                    <strong>{infoObs.desglose.funcionalidad} pts</strong>
                                  </div>
                                  <div className="rubrica-item-bar"><div className="rubrica-item-fill functionality" style={{ width: `${(infoObs.desglose.funcionalidad / 40) * 100}%` }}></div></div>
                                </div>
                                <div className="rubrica-item">
                                  <div className="rubrica-item-header">
                                    <span>Diseño y Limpieza (Máx 20)</span>
                                    <strong>{infoObs.desglose.diseno} pts</strong>
                                  </div>
                                  <div className="rubrica-item-bar"><div className="rubrica-item-fill design" style={{ width: `${(infoObs.desglose.diseno / 20) * 100}%` }}></div></div>
                                </div>
                                <div className="rubrica-item">
                                  <div className="rubrica-item-header">
                                    <span>Seguridad y Excepciones (Máx 20)</span>
                                    <strong>{infoObs.desglose.seguridad} pts</strong>
                                  </div>
                                  <div className="rubrica-item-bar"><div className="rubrica-item-fill security" style={{ width: `${(infoObs.desglose.seguridad / 20) * 100}%` }}></div></div>
                                </div>
                                <div className="rubrica-item">
                                  <div className="rubrica-item-header">
                                    <span>Optimización y Big O (Máx 20)</span>
                                    <strong>{infoObs.desglose.rendimiento} pts</strong>
                                  </div>
                                  <div className="rubrica-item-bar"><div className="rubrica-item-fill performance" style={{ width: `${(infoObs.desglose.rendimiento / 20) * 100}%` }}></div></div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="attempt-body">
                <p><strong>Observaciones:</strong> {infoObs.comentarios}</p>
                            <p className="recom-box"><strong>Instrucciones de Mejora:</strong> {ultimaEntrega.recomendaciones}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Formulario de Entrega */}
                  <form onSubmit={(e) => enviarEntrega(e, tareaActiva.id)} className="delivery-form">
                    <h3>Entregar Solución del Módulo</h3>
                    
                    {/* Selector de tipo de entrega */}
                    <div className="delivery-tabs">
                      <button
                        type="button"
                        onClick={() => setTipoEntrega('codigo')}
                        className={`btn-tab ${tipoEntrega === 'codigo' ? 'active' : ''}`}
                      >
                        Pegar Código Solución
                      </button>
                      <button
                        type="button"
                        onClick={() => setTipoEntrega('github')}
                        className={`btn-tab ${tipoEntrega === 'github' ? 'active' : ''}`}
                      >
                        Enviar Repo GitHub
                      </button>
                    </div>

                    {tipoEntrega === 'codigo' ? (
                      <div className="codigo-submission-area" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Escribe o pega directamente el código fuente de tu solución en el editor inferior.</p>
                        <textarea
                          placeholder="// Pega tu código de solución aquí..."
                          value={codigoEntregado}
                          onChange={(e) => setCodigoEntregado(e.target.value)}
                          required
                          disabled={evaluating}
                          style={{
                            width: '100%',
                            minHeight: '260px',
                            background: 'var(--bg-input)',
                            color: '#a855f7',
                            fontFamily: 'Consolas, monospace',
                            fontSize: '14px',
                            padding: '16px',
                            border: '1px solid var(--border-light)',
                            borderRadius: '12px',
                            outline: 'none',
                            resize: 'vertical',
                            boxSizing: 'border-box'
                          }}
                        />
                        <button type="submit" className="btn-submit-delivery" disabled={evaluating} style={{ width: '100%', padding: '14px' }}>
                          {evaluating ? (
                            <>
                              <RefreshCw className="spinner" /> Analizando Código...
                            </>
                          ) : (
                            <>
                              <Send /> Evaluar Código Pegado
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="github-submission-area">
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '12px' }}>Sube tus correcciones a GitHub y envía el enlace público de tu repositorio.</p>
                        <div className="input-group">
                          <Code className="icon-input-git" />
                          <input
                            type="url"
                            placeholder="https://github.com/tu-usuario/tu-repositorio"
                            value={githubUrl}
                            onChange={(e) => setGithubUrl(e.target.value)}
                            required
                            disabled={evaluating}
                          />
                          <button type="submit" className="btn-submit-delivery" disabled={evaluating}>
                            {evaluating ? (
                              <>
                                <RefreshCw className="spinner" /> Analizando Código...
                              </>
                            ) : (
                              <>
                                <Send /> Enviar a Calificar
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                tareasDeTecnologia.length === 0 ? (
                  <div className="no-task-card welcome-card">
                    <Target className="icon-award-celebrate animate-bounce" />
                    <h2>¡Comienza tu Ruta de Aprendizaje!</h2>
                    <p>Aún no has iniciado tu primer módulo en {estudiante ? estudiante.tecnologia_actual : 'esta tecnología'}. Pragma AI generará una lección teórica, requisitos y una tarea práctica adaptada a tu nivel.</p>
                    <button onClick={generarNuevaTarea} disabled={loading} className="btn-primary btn-generate-next animate-glow">
                      {loading ? 'Generando...' : 'Comenzar Primer Módulo'}
                    </button>
                  </div>
                ) : (
                  <div className="no-task-card">
                    <Award className="icon-award-celebrate" />
                    <h2>¡Excelente Trabajo! Módulo Completado.</h2>
                    <p>Has aprobado tu tarea del plan de estudios con una calificación satisfactoria. Desbloquea la siguiente lección teórica y práctica.</p>
                    <button onClick={generarNuevaTarea} disabled={loading} className="btn-primary btn-generate-next animate-glow">
                      {loading ? 'Generando...' : 'Generar Siguiente Módulo'}
                    </button>
                  </div>
                )
              )}
            </section>

            {/* Listado del Temario Completo y Progreso */}
            <section className="dashboard-panel history-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Ruta de Aprendizaje</h2>
                {temario.length > 5 && (
                  <span className="profile-badge level-badge" style={{ fontSize: '0.75rem', padding: '0.25rem 0.60rem' }}>
                    Tema {indiceTemaActual} / {temario.length}
                  </span>
                )}
              </div>
              <div className="temario-list">
                {!mostrarTodoTemario && temario.length > 5 && indiceTemaActual > 3 && (
                  <div className="temario-list-ellipsis">
                    <span>• • •</span>
                  </div>
                )}
                {temario.map((t, idx) => {
                  const numTema = idx + 1;
                  const esCompletado = numTema < indiceTemaActual;
                  const esActivo = numTema === indiceTemaActual;

                  // Ocultar temas lejanos al activo si no se muestra todo
                  const lejano = Math.abs(numTema - indiceTemaActual) > 2;
                  if (!mostrarTodoTemario && temario.length > 5 && lejano) {
                    return null;
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`temario-list-item ${esCompletado ? 'completed' : ''} ${esActivo ? 'active' : ''}`}
                    >
                      <div className="item-indicator">
                        {esCompletado ? <Check size={14} className="icon-check-done" /> : <span>{numTema}</span>}
                      </div>
                      <span className="item-name">{t}</span>
                    </div>
                  );
                })}
                {!mostrarTodoTemario && temario.length > 5 && indiceTemaActual < temario.length - 2 && (
                  <div className="temario-list-ellipsis">
                    <span>• • •</span>
                  </div>
                )}
              </div>
              
              {temario.length > 5 && (
                <button 
                  onClick={() => setMostrarTodoTemario(!mostrarTodoTemario)} 
                  className="btn-show-more-temario"
                >
                  <RefreshCw size={14} className={mostrarTodoTemario ? 'rotated-icon' : ''} />
                  {mostrarTodoTemario ? 'Colapsar ruta de aprendizaje' : `Ver temario completo (${temario.length} temas)`}
                </button>
              )}
            </section>
          </div>
          ) : vistaActiva === 'mentor' ? (
            <div className="mentor-workspace">
              <div className="mentor-sidebar">
                <div className="mentor-sidebar-header">
                  <h3>Mis Proyectos</h3>
                  <a
                    href={`${API_BASE}/api/mentor/second-brain/${estudiante.id}`}
                    download
                    className="btn-export-second-brain"
                    title="Exportar bitácora estructurada de aprendizaje para NotebookLM / RAG"
                  >
                    🧠 Exportar Second Brain
                  </a>
                </div>
                <div className="mentor-sidebar-list">
                  <button 
                    type="button"
                    className={`mentor-project-item new-project-btn ${!planActivo ? 'active' : ''}`}
                    onClick={() => setPlanActivo(null)}
                  >
                    <Sparkles size={16} /> + Proponer Idea Nueva
                  </button>
                  {planesMentor.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`mentor-project-item ${planActivo?.id === p.id ? 'active' : ''}`}
                      onClick={() => setPlanActivo(p)}
                    >
                      <div className="project-item-title">{p.titulo}</div>
                      <div className="project-item-date">{new Date(p.creado_en).toLocaleDateString()}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mentor-main-panel">
                {!planActivo ? (
                  <div className="mentor-proposal-card">
                    <div className="proposal-header">
                      <Sparkles className="icon-spark-proposal" />
                      <h2>Asistente de Proyectos & Mentor IA</h2>
                      <p>Propón una idea de proyecto que quieras construir o proporciona un repositorio de GitHub para auditar y refacturar. El Mentor IA diseñará un Plan de Implementación paso a paso de nivel profesional para guiarte, pero no te dará el código resuelto de forma fácil: su misión es enseñarte a hacerlo por tu cuenta.</p>
                    </div>

                    <form onSubmit={crearPlanMentor} className="mentor-proposal-form">
                      <div className="form-group">
                        <label htmlFor="ideaProyecto">¿Qué proyecto quieres construir? Describe tu idea:</label>
                        <textarea
                          id="ideaProyecto"
                          rows={5}
                          placeholder="Ej: Quiero hacer una API REST de e-commerce en Node.js con autenticación JWT, carrito de compras persistente y pasarela de pago ficticia en Stripe..."
                          value={ideaProyecto}
                          onChange={(e) => setIdeaProyecto(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="githubUrlMentor">Repositorio de GitHub base (opcional):</label>
                        <input
                          type="url"
                          id="githubUrlMentor"
                          placeholder="https://github.com/usuario/repositorio"
                          value={githubUrlMentor}
                          onChange={(e) => setGithubUrlMentor(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn-primary mentor-submit-btn" disabled={mentorLoading}>
                        {mentorLoading ? (
                          <>
                            <RefreshCw className="icon-spin" size={16} /> Diseñando Plan de Aprendizaje...
                          </>
                        ) : 'Generar Plan de Implementación Académico'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="mentor-project-workspace">
                    <div className="mentor-plan-column">
                      <div className="plan-column-tabs">
                        <button
                          type="button"
                          className={`plan-tab-btn ${tabMentorColumn === 'plan' ? 'active' : ''}`}
                          onClick={() => {
                            setTabMentorColumn('plan');
                            setGuiaAyudaSeleccionada(null);
                          }}
                        >
                          <BookOpen size={14} /> Plan de Trabajo
                        </button>
                        <button
                          type="button"
                          className={`plan-tab-btn ${tabMentorColumn === 'guias' ? 'active' : ''}`}
                          onClick={() => setTabMentorColumn('guias')}
                        >
                          <Sparkles size={14} /> Historial de Guías ({guiasAyuda.length})
                        </button>
                      </div>

                      {tabMentorColumn === 'plan' ? (
                        <>
                          <div className="plan-column-header">
                            <h2>{planActivo.titulo}</h2>
                            {planActivo.word_url && (
                              <a
                                href={`${API_BASE}${planActivo.word_url}`}
                                download
                                className="btn-download-word-mentor"
                                title="Descargar Plan de Implementación en Word"
                              >
                                <Download size={16} /> Descargar Word (.docx)
                              </a>
                            )}
                          </div>

                          <div className="mentor-plan-body markdown-content-mentor">
                            {parsearMarkdownMentor(planActivo.plan_markdown)}
                          </div>
                        </>
                      ) : (
                        <div className="mentor-guias-body">
                          {guiaAyudaSeleccionada ? (
                            <div className="guia-detalle-vista">
                              <button
                                type="button"
                                className="btn-back-to-guias"
                                onClick={() => setGuiaAyudaSeleccionada(null)}
                              >
                                ← Volver al listado
                              </button>
                              
                              <div className="plan-column-header">
                                <h2>{guiaAyudaSeleccionada.titulo}</h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {guiaAyudaSeleccionada.word_url && (
                                    <a
                                      href={`${API_BASE}${guiaAyudaSeleccionada.word_url}`}
                                      download
                                      className="btn-download-word-mentor"
                                    >
                                      <Download size={16} /> Descargar Word (.docx)
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => regenerarGuiaAyuda(guiaAyudaSeleccionada.id)}
                                    disabled={regeneratingGuiaId === guiaAyudaSeleccionada.id}
                                    className="btn-regenerar-guia-ayuda"
                                  >
                                    <RefreshCw size={16} className={regeneratingGuiaId === guiaAyudaSeleccionada.id ? 'animate-spin' : ''} />
                                    Regenerar Guía
                                  </button>
                                </div>
                              </div>

                              <div className="mentor-plan-body markdown-content-mentor">
                                {parsearMarkdownMentor(guiaAyudaSeleccionada.documento_markdown || guiaAyudaSeleccionada.markdown)}
                              </div>
                            </div>
                          ) : (
                            <div className="guias-lista-vista">
                              <h3>Documentos e Historial de Ayuda</h3>
                              {guiasAyuda.length === 0 ? (
                                <div className="no-guias-placeholder">
                                  <Sparkles size={32} className="placeholder-icon" />
                                  <p>Aún no has solicitado ayuda técnica en este chat.</p>
                                  <span>Escribe tus dudas al Mentor en el panel derecho (ej. "Cómo estructurar geolocalización en Postgres") y se generará un documento detallado descargable en esta sección.</span>
                                </div>
                              ) : (
                                <div className="guias-grid">
                                  {guiasAyuda.map((g) => (
                                    <div key={g.id} className="guia-tarjeta-item">
                                      <div className="guia-tarjeta-header">
                                        <h4>{g.titulo}</h4>
                                        <span className="guia-tarjeta-date">{new Date(g.creado_en || new Date()).toLocaleDateString()}</span>
                                      </div>
                                      <p className="guia-tarjeta-query"><strong>Consulta:</strong> "{g.mensaje_estudiante}"</p>
                                      <div className="guia-tarjeta-acciones">
                                        <button
                                          type="button"
                                          className="btn-ver-guia-card"
                                          onClick={() => setGuiaAyudaSeleccionada(g)}
                                        >
                                          Visualizar Guía
                                        </button>
                                        {g.word_url && (
                                          <a
                                            href={`${API_BASE}${g.word_url}`}
                                            download
                                            className="btn-descargar-guia-card"
                                          >
                                            <Download size={14} /> Word
                                          </a>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => regenerarGuiaAyuda(g.id)}
                                          disabled={regeneratingGuiaId === g.id}
                                          className="btn-regenerar-guia-card"
                                        >
                                          <RefreshCw size={14} className={regeneratingGuiaId === g.id ? 'animate-spin' : ''} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mentor-chat-column">
                      <div className="chat-column-header">
                        <h3>Discusión y Dudas con el Mentor</h3>
                        <span>Enfoque Pedagógico Académico</span>
                      </div>

                      {/* Tarjeta de Perfil Cognitivo / Memoria de IA */}
                      {estudiante && (
                        <div className={`mentor-cognitive-profile-card ${perfilCognitivoExpandido ? 'expanded' : 'collapsed'}`}>
                          <div className="cognitive-card-header" onClick={() => setPerfilCognitivoExpandido(!perfilCognitivoExpandido)}>
                            <div className="header-title-wrapper">
                              <span className="brain-emoji">🧠</span>
                              <div className="cognitive-title-text">
                                <h4>Perfil Cognitivo Activo</h4>
                                <span className="cognitive-subtitle">Machine Learning en Tiempo Real</span>
                              </div>
                            </div>
                            <div className="header-actions-wrapper">
                              {estudiante.perfil_cognitivo?.nivel_real_detectado && (
                                <span className="badge-cognitive-level">
                                  Nivel: {estudiante.perfil_cognitivo.nivel_real_detectado}
                                </span>
                              )}
                              <span className="toggle-icon">{perfilCognitivoExpandido ? '▲ Ocultar' : '▼ Expandir Perfil'}</span>
                            </div>
                          </div>
                          
                          {perfilCognitivoExpandido && (
                            <div className="cognitive-card-body">
                              {estudiante.perfil_cognitivo ? (
                                <>
                                  {estudiante.perfil_cognitivo.observaciones_pedagogicas && (
                                    <div className="cognitive-section obs-section">
                                      <h5>Observaciones del Mentor:</h5>
                                      <p>{estudiante.perfil_cognitivo.observaciones_pedagogicas}</p>
                                    </div>
                                  )}
                                  
                                  <div className="cognitive-grid-details">
                                    <div className="cognitive-detail-item">
                                      <h6>Conceptos Dominados:</h6>
                                      <div className="cognitive-chips-container">
                                        {estudiante.perfil_cognitivo.conceptos_dominados?.length > 0 ? (
                                          estudiante.perfil_cognitivo.conceptos_dominados.map((c, i) => (
                                            <span key={i} className="chip-cognitive chip-success">{c}</span>
                                          ))
                                        ) : (
                                          <span className="cognitive-empty-text">Ninguno dominado aún</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="cognitive-detail-item">
                                      <h6>Conceptos en Progreso:</h6>
                                      <div className="cognitive-chips-container">
                                        {estudiante.perfil_cognitivo.conceptos_en_progreso?.length > 0 ? (
                                          estudiante.perfil_cognitivo.conceptos_en_progreso.map((c, i) => (
                                            <span key={i} className="chip-cognitive chip-progress">{c}</span>
                                          ))
                                        ) : (
                                          <span className="cognitive-empty-text">Ninguno en progreso</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="cognitive-detail-item">
                                      <h6>Temas por Aprender (Vacíos):</h6>
                                      <div className="cognitive-chips-container">
                                        {estudiante.perfil_cognitivo.vacios_de_conocimiento?.length > 0 ? (
                                          estudiante.perfil_cognitivo.vacios_de_conocimiento.map((v, i) => (
                                            <span key={i} className="chip-cognitive chip-vacuum">{v}</span>
                                          ))
                                        ) : (
                                          <span className="cognitive-empty-text">Sin vacíos detectados</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="cognitive-detail-item">
                                      <h6>Fortalezas Clave:</h6>
                                      <div className="cognitive-chips-container">
                                        {estudiante.perfil_cognitivo.fortalezas?.length > 0 ? (
                                          estudiante.perfil_cognitivo.fortalezas.map((f, i) => (
                                            <span key={i} className="chip-cognitive chip-info">{f}</span>
                                          ))
                                        ) : (
                                          <span className="cognitive-empty-text">Mapeando fortalezas...</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="cognitive-detail-item">
                                      <h6>Errores Frecuentes:</h6>
                                      <div className="cognitive-chips-container">
                                        {estudiante.perfil_cognitivo.errores_frecuentes?.length > 0 ? (
                                          estudiante.perfil_cognitivo.errores_frecuentes.map((e, i) => (
                                            <span key={i} className="chip-cognitive chip-danger">{e}</span>
                                          ))
                                        ) : (
                                          <span className="cognitive-empty-text">Ninguno registrado</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="cognitive-detail-item">
                                      <h6>Dudas Recurrentes:</h6>
                                      <div className="cognitive-chips-container">
                                        {estudiante.perfil_cognitivo.dudas_recurrentes?.length > 0 ? (
                                          estudiante.perfil_cognitivo.dudas_recurrentes.map((d, i) => (
                                            <span key={i} className="chip-cognitive chip-warning">{d}</span>
                                          ))
                                        ) : (
                                          <span className="cognitive-empty-text">Sin dudas persistentes</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="cognitive-loading-state">
                                  <div className="pulse-loader"></div>
                                  <p>Construyendo perfil de aprendizaje...</p>
                                  <span>Envía dudas al Mentor en el chat para que el pipeline incremental de Machine Learning analice y visualice tu progreso aquí.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mentor-chat-messages">
                        <div className="chat-message mentor">
                          <div className="message-sender">Mentor de Software</div>
                          <div className="message-text">
                            He diseñado tu plan de implementación. Puedes consultarlo a la izquierda. Escribe aquí cualquier duda técnica que tengas sobre la arquitectura, la base de datos, el flujo o cómo estructurar tu lógica. Recuerda que mi objetivo es enseñarte a hacerlo, no darte el código completo. ¡Manos a la obra!
                          </div>
                        </div>
                        {planActivo.mensajes.map((msg, index) => (
                          <div key={index} className={`chat-message ${msg.remitente}`}>
                            <div className="message-sender">
                              {msg.remitente === 'estudiante' ? estudiante.nombre : 'Mentor de Software'}
                            </div>
                            <div className="message-text">
                              {msg.remitente === 'mentor' ? parsearInlineMarkdown(msg.texto) : msg.texto}
                              
                              {msg.documento_ayuda && (
                                <div className="message-doc-link-card">
                                  <div className="doc-link-header">
                                    <BookOpen size={14} className="doc-icon" />
                                    <span>{msg.documento_ayuda.titulo}</span>
                                  </div>
                                  <div className="doc-link-actions">
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        setTabMentorColumn('guias');
                                        setGuiaAyudaSeleccionada({
                                          id: msg.documento_ayuda.id,
                                          titulo: msg.documento_ayuda.titulo,
                                          documento_markdown: msg.documento_ayuda.markdown,
                                          word_url: msg.documento_ayuda.word_url
                                        });
                                      }}
                                      className="btn-view-doc-chat"
                                    >
                                      Visualizar Guía
                                    </button>
                                    {msg.documento_ayuda.word_url && (
                                      <a 
                                        href={`${API_BASE}${msg.documento_ayuda.word_url}`}
                                        download
                                        className="btn-download-doc-chat"
                                      >
                                        <Download size={12} /> Word
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="chat-message mentor loading-message">
                            <div className="message-sender">Mentor de Software</div>
                            <div className="message-text">
                              <span className="pulse-dots">Escribiendo...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mentor-personality-selector">
                        <span className="personality-label">Tono del Mentor:</span>
                        {['Riguroso', 'Tech Lead', 'Socrático'].map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`personality-btn ${personalidadMentor === p ? 'active' : ''}`}
                            onClick={() => setPersonalidadMentor(p)}
                          >
                            {p === 'Riguroso' ? '🏛️' : p === 'Tech Lead' ? '🚀' : '🤔'} {p}
                          </button>
                        ))}
                      </div>

                      <div className="superpowers-tags">
                        <button 
                          type="button" 
                          className="tag-superpower" 
                          onClick={() => {
                            const clean = mensajeChatMentor.replace(/^\/(planificar|idear|ejecutar)\s*/i, '');
                            setMensajeChatMentor('/planificar ' + clean);
                          }}
                          title="Fuerza un enfoque en pasos de implementación y comandos técnicos"
                        >
                          ⚡ /planificar
                        </button>
                        <button 
                          type="button" 
                          className="tag-superpower" 
                          onClick={() => {
                            const clean = mensajeChatMentor.replace(/^\/(planificar|idear|ejecutar)\s*/i, '');
                            setMensajeChatMentor('/idear ' + clean);
                          }}
                          title="Fuerza un enfoque en pros/contras de arquitectura y patrones"
                        >
                          💡 /idear
                        </button>
                        <button 
                          type="button" 
                          className="tag-superpower" 
                          onClick={() => {
                            const clean = mensajeChatMentor.replace(/^\/(planificar|idear|ejecutar)\s*/i, '');
                            setMensajeChatMentor('/ejecutar ' + clean);
                          }}
                          title="Fuerza un enfoque en andamios de código, firmas de funciones y tests"
                        >
                          🛠️ /ejecutar
                        </button>
                      </div>

                      <form onSubmit={enviarMensajeMentor} className="mentor-chat-form">
                        <input
                          type="text"
                          placeholder="Pregúntale al mentor sobre arquitectura, bases de datos o lógica..."
                          value={mensajeChatMentor}
                          onChange={(e) => setMensajeChatMentor(e.target.value)}
                          disabled={chatLoading}
                          required
                        />
                        <button type="submit" disabled={chatLoading} className="btn-send-chat">
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : vistaActiva === 'habilidades' ? (
            <div className="skill-tree-wrapper">
              <div className="skill-tree-header">
                <h2>🌲 Árbol de Habilidades - {estudiante.tecnologia_actual}</h2>
                <p>Navega a través de las ramas del temario oficial para visualizar tu progreso y dominar nuevos conceptos.</p>
              </div>

              {/* Selector de Nivel */}
              <div className="skill-level-selector">
                {['Novato', 'Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Master', 'Arquitecto', 'Leyenda'].map((lvl, index) => {
                  const esActivo = nivelSkillTree === lvl;
                  const esDesbloqueado = index <= ['Novato', 'Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Master', 'Arquitecto', 'Leyenda'].indexOf(estudiante.nivel_actual || 'Novato');
                  return (
                    <button
                      key={lvl}
                      type="button"
                      className={`skill-level-btn ${esActivo ? 'active' : ''} ${!esDesbloqueado ? 'locked' : ''}`}
                      onClick={() => esDesbloqueado && setNivelSkillTree(lvl)}
                    >
                      {!esDesbloqueado ? <Lock size={12} /> : null} {lvl}
                    </button>
                  );
                })}
              </div>

              <div className="skill-tree-container">
                {/* SVG para dibujar las conexiones */}
                <div className="skill-tree-map">
                  <svg className="skill-tree-connections">
                    {[
                      { id: 0, x: 50, y: 8, dependencias: [] },
                      { id: 1, x: 25, y: 22, dependencias: [0] },
                      { id: 2, x: 75, y: 22, dependencias: [0] },
                      { id: 3, x: 25, y: 40, dependencias: [1] },
                      { id: 4, x: 75, y: 40, dependencias: [2] },
                      { id: 5, x: 50, y: 55, dependencias: [3, 4] },
                      { id: 6, x: 20, y: 72, dependencias: [5] },
                      { id: 7, x: 80, y: 72, dependencias: [5] },
                      { id: 8, x: 50, y: 75, dependencias: [5] },
                      { id: 9, x: 50, y: 92, dependencias: [6, 7, 8] }
                    ].map(nodo => {
                      return nodo.dependencias.map(depId => {
                        const padre = [
                          { id: 0, x: 50, y: 8 },
                          { id: 1, x: 25, y: 22 },
                          { id: 2, x: 75, y: 22 },
                          { id: 3, x: 25, y: 40 },
                          { id: 4, x: 75, y: 40 },
                          { id: 5, x: 50, y: 55 },
                          { id: 6, x: 20, y: 72 },
                          { id: 7, x: 80, y: 72 },
                          { id: 8, x: 50, y: 75 },
                          { id: 9, x: 50, y: 92 }
                        ].find(n => n.id === depId);
                        if (!padre) return null;
                        return (
                          <line
                            key={`${padre.id}-${nodo.id}`}
                            x1={`${padre.x}%`}
                            y1={`${padre.y}%`}
                            x2={`${nodo.x}%`}
                            y2={`${nodo.y}%`}
                            className="connection-line"
                          />
                        );
                      });
                    })}
                  </svg>

                  {/* Nodos del árbol */}
                  {[
                    { id: 0, x: 50, y: 8 },
                    { id: 1, x: 25, y: 22 },
                    { id: 2, x: 75, y: 22 },
                    { id: 3, x: 25, y: 40 },
                    { id: 4, x: 75, y: 40 },
                    { id: 5, x: 50, y: 55 },
                    { id: 6, x: 20, y: 72 },
                    { id: 7, x: 80, y: 72 },
                    { id: 8, x: 50, y: 75 },
                    { id: 9, x: 50, y: 92 }
                  ].map(nodo => {
                    const idxNivel = ['Novato', 'Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Master', 'Arquitecto', 'Leyenda'].indexOf(nivelSkillTree);
                    const idxTema = idxNivel * 10 + nodo.id;
                    const tema = temario[idxTema] || `Habilidad ${idxTema + 1}`;
                    const temaActivoIndex = (estudiante ? estudiante.tema_indice : 1) - 1;
                    const esDominado = idxTema < temaActivoIndex;
                    const esEnProgreso = idxTema === temaActivoIndex;
                    const esBloqueado = idxTema > temaActivoIndex;

                    let estadoClase = 'bloqueado';
                    if (esDominado) estadoClase = 'dominado';
                    else if (esEnProgreso) estadoClase = 'progreso';

                    return (
                      <div
                        key={nodo.id}
                        className={`skill-node-card ${estadoClase} ${habilidadSeleccionada?.idx === idxTema ? 'selected' : ''}`}
                        style={{ left: `${nodo.x}%`, top: `${nodo.y}%` }}
                        onClick={() => {
                          setHabilidadSeleccionada({
                            idx: idxTema,
                            titulo: tema,
                            estado: estadoClase,
                            nodoId: nodo.id,
                            nivel: nivelSkillTree
                          });
                        }}
                      >
                        <div className="node-icon-circle">
                          {esDominado ? <Check size={14} /> : esEnProgreso ? <Zap size={14} className="pulse-glow" /> : <Lock size={12} />}
                        </div>
                        <span className="node-tooltip">{tema}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Panel de Detalles */}
                <div className="skill-tree-details">
                  {habilidadSeleccionada ? (
                    <div className="details-content">
                      <div className={`details-badge ${habilidadSeleccionada.estado}`}>
                        {habilidadSeleccionada.estado.toUpperCase()}
                      </div>
                      <h3>{habilidadSeleccionada.titulo}</h3>
                      <p className="details-level-info">Habilidad #{habilidadSeleccionada.idx + 1} ({habilidadSeleccionada.nivel})</p>
                      
                      <div className="details-description-box">
                        {habilidadSeleccionada.estado === 'bloqueado' ? (
                          <p>Esta habilidad se encuentra bloqueada. Completa y domina las lecciones previas en tu Ruta Académica para poder acceder.</p>
                        ) : habilidadSeleccionada.estado === 'progreso' ? (
                          <p>Esta es tu habilidad activa en curso. Puedes consultarle dudas específicas al Mentor IA o retar tu conocimiento completando minijuegos para ganar XP y desbloquear el siguiente nivel.</p>
                        ) : (
                          <p>¡Habilidad dominada con éxito! Ya has superado este tema. Puedes refrescar tus conocimientos o discutir conceptos avanzados con el Mentor.</p>
                        )}
                      </div>

                      {habilidadSeleccionada.estado !== 'bloqueado' && (
                        <div className="details-actions">
                          <button
                            type="button"
                            className="btn-ask-mentor-skill"
                            onClick={() => {
                              setVistaActiva('mentor');
                              setMensajeChatMentor(`Hola Mentor, estoy en el Árbol de Habilidades y me gustaría que me expliques a detalle con ejemplos prácticos el concepto de: "${habilidadSeleccionada.titulo}".`);
                            }}
                          >
                            <Sparkles size={14} /> Preguntar al Mentor IA
                          </button>
                          <button
                            type="button"
                            className="btn-play-skill"
                            onClick={() => {
                              setVistaActiva('juegos');
                            }}
                          >
                            <Gamepad2 size={14} /> Desafiar en Zona de Juegos
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="details-empty">
                      <GitFork size={36} className="empty-icon" />
                      <p>Haz click en cualquier nodo del árbol para visualizar los detalles y las acciones disponibles.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : vistaActiva === 'juegos' ? (
            <PragmaGames
              estudiante={estudiante}
              onUpdateEstudiante={(estActualizado) => setEstudiante(estActualizado)}
              backendUrl={API_BASE}
            />
          ) : vistaActiva === 'logros' ? (
            <div className="logros-container animate-fade-in">
              <div className="logros-header">
                <h2>🏆 Medallero de Logros Épicos</h2>
                <p>Completa desafíos y desbloquea insignias exclusivas para tu perfil</p>
                <div className="logros-progress-bar-container">
                  <div className="logros-progress-info">
                    <span>Progreso del Medallero</span>
                    <span>{logrosDesbloqueados.length} de 50 completados</span>
                  </div>
                  <div className="logros-progress-bar">
                    <div 
                      className="logros-progress-bar-fill" 
                      style={{ width: `${(logrosDesbloqueados.length / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {(() => {
                const logrosFiltradosYOrdenados = [...LISTA_LOGROS]
                  .filter(logro => {
                    const desbloqueado = logrosDesbloqueados.includes(logro.id);
                    if (filtroLogros === 'completados') return desbloqueado;
                    if (filtroLogros === 'pendientes') return !desbloqueado;
                    return true;
                  })
                  .sort((a, b) => {
                    const aUnlocked = logrosDesbloqueados.includes(a.id);
                    const bUnlocked = logrosDesbloqueados.includes(b.id);
                    if (aUnlocked && !bUnlocked) return -1;
                    if (!aUnlocked && bUnlocked) return 1;
                    return 0;
                  });

                return (
                  <>
                    <div className="logros-filters">
                      <button 
                        type="button" 
                        className={`btn-filter ${filtroLogros === 'todos' ? 'active' : ''}`}
                        onClick={() => setFiltroLogros('todos')}
                      >
                        <Filter size={14} /> Todos ({LISTA_LOGROS.length})
                      </button>
                      <button 
                        type="button" 
                        className={`btn-filter ${filtroLogros === 'completados' ? 'active' : ''}`}
                        onClick={() => setFiltroLogros('completados')}
                      >
                        <Unlock size={14} /> Completados ({logrosDesbloqueados.length})
                      </button>
                      <button 
                        type="button" 
                        className={`btn-filter ${filtroLogros === 'pendientes' ? 'active' : ''}`}
                        onClick={() => setFiltroLogros('pendientes')}
                      >
                        <Lock size={14} /> Pendientes ({LISTA_LOGROS.length - logrosDesbloqueados.length})
                      </button>
                    </div>

                    <div className="logros-grid">
                      {logrosFiltradosYOrdenados.map(logro => {
                        const desbloqueado = logrosDesbloqueados.includes(logro.id);
                        return (
                          <div key={logro.id} className={`logro-card ${logro.tipo} ${desbloqueado ? 'unlocked' : 'locked'}`}>
                            <div className="logro-card-status">
                              {desbloqueado ? <Unlock size={20} className="icon-unlock" /> : <Lock size={20} className="icon-lock" />}
                            </div>
                            <h3>{logro.titulo}</h3>
                            <p>{logro.desc}</p>
                            <div className="logro-card-footer">
                              <span className="logro-xp-reward">+{logro.xp} XP</span>
                              <span className="logro-badge-status">{desbloqueado ? 'Desbloqueado' : 'Bloqueado'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}

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

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
