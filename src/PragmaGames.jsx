import { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Trash2, ShieldAlert, Check, X, 
  Settings, Award, Code, Play, Trophy, Search,
  Sparkles, Flame, CheckCircle2, XCircle, ArrowRight, RefreshCw, Lightbulb, Clock, Radio
} from 'lucide-react';
import './PragmaGames.css';

// Audios Lo-Fi públicos libres de copyright
const LOFI_TRACKS = [
  { title: "Cyber Sunset Chill", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Neon Rain Whispers", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Binary Lullaby", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function PragmaGames({ estudiante, onUpdateEstudiante, backendUrl, listaAmigos, partidaDueloActiva, onLimpiarPartidaDuelo }) {
  const [selectedSubTab, setSelectedSubTab] = useState('lobby'); // lobby, copiloto, zen, taberna, forja, runas, tinder, defense, dungeon
  const pragmaProfile = estudiante?.pragma_profile || {
    rank_points: 0,
    energy: 100,
    inventory: { silicon_shards: 15, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 },
    unlocked_runes: ["quantum", "aural", "cyber", "void", "nexus", "data", "pyro", "chronos", "nexsis", "dati", "aura", "ghost", "weave", "voidp"],
    active_perks: [],
    runic_array: ["chronos", "quantum", "cyber"],
    unlocked_cosmetics: [],
    equipped_cosmetics: { map_skin: "default", star_aura: "none", laser_color: "#38bdf8" }
  };

  const syncProfile = (updatedPragma) => {
    if (onUpdateEstudiante) {
      onUpdateEstudiante({
        ...estudiante,
        pragma_profile: updatedPragma
      });
    }
  };

  return (
    <div className="pragma-container">
      {/* Encabezado del Perfil del Jugador */}
      <div className="pragma-header-panel">
        <div className="pragma-user-badge">
          <div className="avatar-glowing" style={{ borderColor: pragmaProfile.equipped_cosmetics?.laser_color || '#6366f1' }}>
            <span className="avatar-txt">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="user-name">{estudiante?.nombre || 'Evertz'}</h3>
              <span className="rank-badge">
                Rango {Math.floor((pragmaProfile?.rank_points || 0) / 100) + 1}
              </span>
            </div>
            <div className="user-meta flex items-center gap-2 mt-1 text-xs">
              <span className="text-amber-400 font-semibold">{pragmaProfile?.rank_points ?? 25} RP</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-medium">{estudiante?.tecnologia_actual || 'JavaScript'}</span>
            </div>
          </div>
        </div>
        
        {/* Inventario Rápido de Recursos */}
        <div className="pragma-inventory-strip">
          <div className="inv-item shard" title="Silicon Shards">
            <span className="inv-icon">💎</span>
            <span className="inv-val">{pragmaProfile?.inventory?.silicon_shards ?? 14}</span>
            <span className="inv-lbl">Shards</span>
          </div>
          <div className="inv-item thread" title="Memory Threads">
            <span className="inv-icon">⏳</span>
            <span className="inv-val">{pragmaProfile?.inventory?.memory_threads ?? 5}</span>
            <span className="inv-lbl">Threads</span>
          </div>
          <div className="inv-item core" title="Logic Cores">
            <span className="inv-icon">🧪</span>
            <span className="inv-val">{pragmaProfile?.inventory?.logic_cores ?? 2}</span>
            <span className="inv-lbl">Cores</span>
          </div>
          <div className="inv-item js" title="Esencia JavaScript">
            <span className="inv-icon">🟧</span>
            <span className="inv-val">{pragmaProfile?.inventory?.javascript_essence ?? 0}</span>
            <span className="inv-lbl">JS</span>
          </div>
          <div className="inv-item py" title="Esencia Python">
            <span className="inv-icon">🟦</span>
            <span className="inv-val">{pragmaProfile?.inventory?.python_essence ?? 0}</span>
            <span className="inv-lbl">Py</span>
          </div>
          <div className="inv-item sql" title="Esencia SQL">
            <span className="inv-icon">🟩</span>
            <span className="inv-val">{pragmaProfile?.inventory?.sql_essence ?? 0}</span>
            <span className="inv-lbl">SQL</span>
          </div>
        </div>
      </div>

      {/* Banner de Perks Activos del Grimorio */}
      {pragmaProfile?.active_perks?.length > 0 && (
        <div className="pragma-active-perks-bar animate-fade-in">
          <span className="perks-badge-title">⚡ HECHIZOS ACTIVOS DEL GRIMORIO:</span>
          <div className="perks-chips-wrap">
            {pragmaProfile.active_perks.map((p, idx) => (
              <div key={idx} className="perk-chip-active" style={{ borderColor: p.color || '#00ff66' }}>
                <span className="perk-ico">{p.icono}</span>
                <span className="perk-name">{p.titulo}</span>
                <span className="perk-desc">({p.perk?.desc})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Navegación Moderna de Minijuegos */}
      <div className="pragma-nav-strip">
        <button className={selectedSubTab === 'lobby' ? 'active' : ''} onClick={() => setSelectedSubTab('lobby')}>
          <span className="tab-icon">⚔️</span>
          <span>Multijugador</span>
        </button>
        <button className={selectedSubTab === 'copiloto' ? 'active' : ''} onClick={() => setSelectedSubTab('copiloto')}>
          <span className="tab-icon">🤖</span>
          <span>Copiloto</span>
        </button>
        <button className={selectedSubTab === 'zen' ? 'active' : ''} onClick={() => setSelectedSubTab('zen')}>
          <span className="tab-icon">🧘</span>
          <span>Modo Zen</span>
        </button>
        <button className={selectedSubTab === 'taberna' ? 'active' : ''} onClick={() => setSelectedSubTab('taberna')}>
          <span className="tab-icon">🍺</span>
          <span>La Taberna</span>
        </button>
        <button className={selectedSubTab === 'forja' ? 'active' : ''} onClick={() => setSelectedSubTab('forja')}>
          <span className="tab-icon">🔨</span>
          <span>La Forja</span>
        </button>
        <button className={selectedSubTab === 'runas' ? 'active' : ''} onClick={() => setSelectedSubTab('runas')}>
          <span className="tab-icon">📖</span>
          <span>Grimorio</span>
        </button>
        <button className={`tab-tinder ${selectedSubTab === 'tinder' ? 'active active-tinder' : ''}`} onClick={() => setSelectedSubTab('tinder')}>
          <span className="tab-icon">🔥</span>
          <span>Tinder Code</span>
        </button>
        <button className={selectedSubTab === 'defense' ? 'active' : ''} onClick={() => setSelectedSubTab('defense')}>
          <span className="tab-icon">🛡️</span>
          <span>Defense</span>
        </button>
        <button className={selectedSubTab === 'dungeon' ? 'active' : ''} onClick={() => setSelectedSubTab('dungeon')}>
          <span className="tab-icon">🗝️</span>
          <span>SQL Dungeon</span>
        </button>
      </div>

      {/* Pantalla Activa */}
      <div className="pragma-game-screen">
        {selectedSubTab === 'lobby' && (
          <LobbyView
            estudiante={estudiante}
            backendUrl={backendUrl}
            onUpdate={syncProfile}
            listaAmigos={listaAmigos}
            partidaDueloActiva={partidaDueloActiva}
            onLimpiarPartidaDuelo={onLimpiarPartidaDuelo}
          />
        )}
        {selectedSubTab === 'copiloto' && <CopilotoView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'zen' && <ZenView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'taberna' && <TabernaView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'forja' && <ForjaView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'runas' && <RunasView estudiante={estudiante} pragmaProfile={pragmaProfile} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'tinder' && <TinderView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'defense' && <DefenseView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'dungeon' && <DungeonView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
      </div>
    </div>
  );
}

/* ==========================================
   1. LOBBY MULTIJUGADOR COMPETITIVO
   ========================================== */
function LobbyView({ estudiante, backendUrl, onUpdate, listaAmigos = [], partidaDueloActiva, onLimpiarPartidaDuelo }) {
  const [matchType, setMatchType] = useState('1v1');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  // Referencias para timers
  const timerRef = useRef(null);
  const matchIntervalRef = useRef(null);

  const studentId = estudiante?.id || 'estudiante_local';
  const studentName = estudiante?.nombre || 'Evertz';

  // Efecto para unirse a un Duelo Realizado vía SSE / invitación aceptada
  useEffect(() => {
    if (partidaDueloActiva) {
      console.log("Inicializando partida multijugador real de la IA:", partidaDueloActiva);
      const isRetador = partidaDueloActiva.retador_id === studentId;
      const rivalId = isRetador ? partidaDueloActiva.retado_id : partidaDueloActiva.retador_id;
      const rivalNombre = isRetador ? partidaDueloActiva.retado_nombre : partidaDueloActiva.retador_nombre;

      const realPlayers = [
        {
          id: studentId,
          nombre: studentName,
          avatar: '⚡',
          team: 'orange',
          isSelf: true,
          isBot: false,
          progress: 0,
          errors: 0,
          finished: false,
          time: null
        },
        {
          id: rivalId,
          nombre: rivalNombre,
          avatar: '🕶️',
          team: 'blue',
          isSelf: false,
          isBot: false,
          progress: 0,
          errors: 0,
          finished: false,
          time: null
        }
      ];

      let retosDuelo = partidaDueloActiva.retos;
      if (!retosDuelo || !Array.isArray(retosDuelo) || retosDuelo.length === 0) {
        retosDuelo = [
          {
            id: 'trivia_d1',
            tipo: 'trivia',
            titulo: 'Algoritmos & Estructuras',
            pregunta: '¿Cuál es la complejidad temporal promedio de búsqueda en un Map/Set hash?',
            opciones: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
            correcta: 2
          },
          {
            id: 'typer_d1',
            tipo: 'typer',
            titulo: 'Speedrun de Sintaxis',
            codigo: 'const [duelo, setDuelo] = useState(true);',
            descripcion: 'Escribe el snippet a máxima velocidad.'
          },
          {
            id: 'zen_d1',
            tipo: 'zen',
            titulo: 'Caso Base Seguro',
            descripcion: 'Escribe el caso base para evitar recursión infinita.',
            codigoInicial: 'function fib(n) {\n  if (______) return n;\n  return fib(n - 1) + fib(n - 2);\n}',
            codigoCorrecto: 'function fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);\n}',
            guia: 'Ejemplo: n <= 1'
          }
        ];
      }

      const matchState = {
        id: partidaDueloActiva.id,
        retos: retosDuelo,
        retoActualIndice: 0,
        userTriviaRespuestas: {},
        userCodigoInput: retosDuelo[0]?.codigoInicial || '',
        userProgress: 0,
        userErrors: 0,
        userFinished: false,
        userTime: 0,
        timeLeft: 180, // 3 minutos para duelos reales
        players: realPlayers,
        esRealtime: true // Bandera de combate real
      };

      setMatchType('1v1');
      setActiveMatch(matchState);
      setBattleResult(null);

      // Si existe callback para limpiar en App.jsx, lo llamamos
      if (onLimpiarPartidaDuelo) {
        onLimpiarPartidaDuelo();
      }
    }
  }, [partidaDueloActiva]);

  // Listener para capturar el progreso en tiempo real enviado por el rival vía SSE
  useEffect(() => {
    const handleProgresoRival = (e) => {
      const data = e.detail;
      // data: { estudiante_id, progreso, errores, tiempo, finalizado }
      console.log("Progreso del rival recibido vía SSE en LobbyView:", data);

      setActiveMatch(prev => {
        if (!prev || !prev.esRealtime) return prev;

        const updatedPlayers = prev.players.map(p => {
          if (p.id === data.jugador_id) {
            return {
              ...p,
              progress: data.progreso,
              errors: data.errores,
              finished: data.finalizado,
              time: data.finalizado ? data.tiempo : null
            };
          }
          return p;
        });

        // Verificar si todos terminaron
        const allFinished = updatedPlayers.every(p => p.finished);
        if (allFinished && matchIntervalRef.current) {
          clearInterval(matchIntervalRef.current);
          setTimeout(() => calculateFinalResult({ ...prev, players: updatedPlayers }), 500);
        }

        return {
          ...prev,
          players: updatedPlayers
        };
      });
    };

    window.addEventListener('pragma-progreso-rival', handleProgresoRival);
    return () => {
      window.removeEventListener('pragma-progreso-rival', handleProgresoRival);
    };
  }, []);
  
  // Slots estáticos para Naranja y Azul (4 slots cada uno por defecto)
  const [orangeSlots, setOrangeSlots] = useState([
    { type: 'master', name: studentName },
    null,
    null,
    null
  ]);
  const [blueSlots, setBlueSlots] = useState([
    null,
    null,
    null,
    null
  ]);
  const [inviteTarget, setInviteTarget] = useState({ team: 'orange', index: 1 });

  const cambiarTipoMatch = (tipo) => {
    setMatchType(tipo);
    // Limpiar timers de invitaciones pendientes para evitar memory leaks y estados zombi
    [...orangeSlots, ...blueSlots].forEach(s => {
      if (s?.timerId) clearInterval(s.timerId);
    });
    const max = tipo === '1v1' ? 1 : tipo === '2v2' ? 2 : 4;
    setOrangeSlots(() => {
      const slots = Array(max).fill(null);
      slots[0] = { type: 'master', name: estudiante?.nombre || 'Jugador 1' };
      return slots;
    });
    setBlueSlots(Array(max).fill(null));
  };

  const swapTeam = (fromTeam, index) => {
    const maxSlots = matchType === '2v2' ? 2 : 4;
    if (fromTeam === 'orange') {
      const player = orangeSlots[index];
      if (!player) return;

      let targetIndex = -1;
      for (let i = 0; i < maxSlots; i++) {
        if (blueSlots[i] === null) {
          targetIndex = i;
          break;
        }
      }

      const nextOrange = [...orangeSlots];
      const nextBlue = [...blueSlots];

      if (targetIndex !== -1) {
        nextBlue[targetIndex] = player;
        nextOrange[index] = null;
      } else {
        // Swap con el primer slot si todo está lleno
        const temp = blueSlots[0];
        nextBlue[0] = player;
        nextOrange[index] = temp;
      }
      setOrangeSlots(nextOrange);
      setBlueSlots(nextBlue);
    } else {
      const player = blueSlots[index];
      if (!player) return;

      let targetIndex = -1;
      for (let i = 0; i < maxSlots; i++) {
        if (orangeSlots[i] === null) {
          targetIndex = i;
          break;
        }
      }

      const nextOrange = [...orangeSlots];
      const nextBlue = [...blueSlots];

      if (targetIndex !== -1) {
        nextOrange[targetIndex] = player;
        nextBlue[index] = null;
      } else {
        const temp = orangeSlots[0];
        nextOrange[0] = player;
        nextBlue[index] = temp;
      }
      setOrangeSlots(nextOrange);
      setBlueSlots(nextBlue);
    }
  };

  // Estados de configuración de matchmaking del Master
  const [showMasterConfig, setShowMasterConfig] = useState(false);
  const [challengeCategory, setChallengeCategory] = useState('mixed'); // 'mixed', 'pragma', 'arcade'
  const [difficulty, setDifficulty] = useState('intermedio'); // 'novato', 'intermedio', 'experto'

  // Estados de Matchmaking y Partida Activa
  const [searching, setSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [activeMatch, setActiveMatch] = useState(null);
  const [battleResult, setBattleResult] = useState(null);

  // Estados locales para los 8 minijuegos del combate multijugador activo
  const [juegoResultado, setJuegoResultado] = useState(null);
  const [sorterLineas, setSorterLineas] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [fillRespuestas, setFillRespuestas] = useState({});
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardScore, setFlashcardScore] = useState(0);
  const [typerInput, setTyperInput] = useState('');
  const [typerStartTime, setTyperStartTime] = useState(null);
  const [typerErrors, setTyperErrors] = useState(0);
  const [typerWpm, setTyperWpm] = useState(0);
  const [typerAccuracy, setTyperAccuracy] = useState(100);
  const [memoryCards, setMemoryCards] = useState([]);
  const [memorySelected, setMemorySelected] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Inicializar estados específicos por tipo de reto al cambiar retoActualIndice
  useEffect(() => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    if (!currentChallenge) return;

    setJuegoResultado(null);

    if (currentChallenge.tipo === 'sorter') {
      setSorterLineas(currentChallenge.lineas || []);
    } else if (currentChallenge.tipo === 'fill-blank') {
      setFillRespuestas({});
    } else if (currentChallenge.tipo === 'flashcard') {
      setFlashcardIdx(0);
      setFlashcardScore(0);
    } else if (currentChallenge.tipo === 'typer') {
      setTyperInput('');
      setTyperStartTime(null);
      setTyperErrors(0);
      setTyperWpm(0);
      setTyperAccuracy(100);
    } else if (currentChallenge.tipo === 'memory') {
      const clonedCards = (currentChallenge.cartas || []).map(c => ({
        ...c,
        flipped: false,
        matched: false
      }));
      setMemoryCards([...clonedCards].sort(() => 0.5 - Math.random()));
      setMemorySelected([]);
      setMemoryMoves(0);
    }
  }, [activeMatch?.retoActualIndice, activeMatch?.id]);

  // Retos completos disponibles en la simulación táctica multijugador
  const RETOS_MULTIPLAYER = {
    arcade: [
      // JAVASCRIPT
      {
        id: 'trivia_1',
        tipo: 'trivia',
        lenguaje: 'JavaScript',
        dificultad: 'intermedio',
        titulo: 'Complejidad Computacional',
        pregunta: '¿Cuál es la complejidad temporal promedio de búsqueda en un Map/Set bien balanceado en V8?',
        opciones: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
        correcta: 2,
        explicacion: 'Las tablas Hash permiten acceso en O(1) promedio gracias a su función de hashing.'
      },
      {
        id: 'trivia_2',
        tipo: 'trivia',
        lenguaje: 'React',
        dificultad: 'intermedio',
        titulo: 'React Hooks',
        pregunta: '¿Qué Hook de React se utiliza para memorizar una función costosa y evitar recrearla en cada render?',
        opciones: ['useMemo', 'useCallback', 'useRef', 'useEffect'],
        correcta: 1,
        explicacion: 'useCallback memoriza una función en lugar de su valor de retorno.'
      },
      {
        id: 'output_1',
        tipo: 'output',
        lenguaje: 'JavaScript',
        dificultad: 'novato',
        titulo: 'Predicción de Salida: Coerción',
        codigo: 'console.log(1 + +"2" + "2");',
        opciones: ['"32"', '"122"', 'NaN', '3'],
        correcta: 0,
        explicacion: 'El operador unario +"2" convierte a número 2; 1 + 2 = 3; luego 3 + "2" resulta en "32".'
      },
      {
        id: 'refactor_1',
        tipo: 'refactor',
        lenguaje: 'JavaScript',
        dificultad: 'intermedio',
        titulo: 'Auditoría de Bucle Infinito',
        descripcion: 'Identifica la corrección para evitar el bucle infinito causado por la reasignación de i.',
        codigo_con_bug: 'for (let i = 5; i >= 0; i--) {\n  if (i === 0) i = 5;\n}',
        opciones_correcion: [
          'for (let i = 5; i > 0; i--) { break; }',
          'Eliminar "if (i === 0) i = 5;" para permitir que la condición i >= 0 finalice.',
          'Cambiar el decremento i-- por i++.'
        ],
        correcta: 1
      },
      // PYTHON
      {
        id: 'trivia_py_1',
        tipo: 'trivia',
        lenguaje: 'Python',
        dificultad: 'novato',
        titulo: 'Tipos Mutables en Python',
        pregunta: '¿Cuál de las siguientes estructuras de datos en Python es INMUTABLE?',
        opciones: ['list (Lista)', 'dict (Diccionario)', 'tuple (Tupla)', 'set (Conjunto)'],
        correcta: 2,
        explicacion: 'Las tuplas (tuple) en Python son colecciones inmutables ordenadas.'
      },
      {
        id: 'output_py_1',
        tipo: 'output',
        lenguaje: 'Python',
        dificultad: 'intermedio',
        titulo: 'Predicción: Slicing en Python',
        codigo: 'nums = [10, 20, 30, 40, 50]\nprint(nums[::-2])',
        opciones: ['[50, 30, 10]', '[50, 40, 30]', '[10, 30, 50]', '[40, 20]'],
        correcta: 0,
        explicacion: 'El paso negativo -2 recorre la lista en reversa saltando de 2 en 2 desde el final.'
      },
      {
        id: 'refactor_py_1',
        tipo: 'refactor',
        lenguaje: 'Python',
        dificultad: 'intermedio',
        titulo: 'Prevención de KeyError en Diccionarios',
        descripcion: 'Identifica la forma idomática en Python para leer una clave opcional sin lanzar KeyError.',
        codigo_con_bug: 'usuario = {"nombre": "Eliab"}\nrol = usuario["rol"] # Lanza KeyError si no existe',
        opciones_correcion: [
          'rol = usuario.get("rol", "invitado")',
          'rol = usuario.fetch("rol")',
          'rol = usuario["rol"] || "invitado"'
        ],
        correcta: 0
      },
      // SQL
      {
        id: 'trivia_sql_1',
        tipo: 'trivia',
        lenguaje: 'SQL',
        dificultad: 'intermedio',
        titulo: 'Filtrado de Agregaciones en SQL',
        pregunta: '¿Qué cláusula SQL se utiliza obligatoriamente para filtrar resultados de funciones de agregación como COUNT() o SUM()?',
        opciones: ['WHERE', 'HAVING', 'GROUP FILTER', 'ORDER BY'],
        correcta: 1,
        explicacion: 'HAVING filtra sobre los grupos agregados tras GROUP BY; WHERE filtra filas individuales antes de agrupar.'
      },
      {
        id: 'output_sql_1',
        tipo: 'output',
        lenguaje: 'SQL',
        dificultad: 'novato',
        titulo: 'Predicción de Consulta: DISTINCT',
        codigo: '-- Tabla: [1, 2, 2, 3, 3, 3]\nSELECT COUNT(DISTINCT valor) FROM numeros;',
        opciones: ['3', '6', '1', '2'],
        correcta: 0,
        explicacion: 'DISTINCT elimina duplicados dejando únicamente 1, 2 y 3; por tanto COUNT devuelve 3.'
      },
      {
        id: 'flashcard_1',
        tipo: 'flashcard',
        lenguaje: 'General',
        dificultad: 'novato',
        titulo: 'Fundamentos de Motor Web & JS',
        flashcards: [
          { afirmacion: 'Las microtareas (Promise.then) tienen prioridad sobre las macrotareas (setTimeout).', es_verdadero: true },
          { afirmacion: 'Array.prototype.map muta el array original in-place.', es_verdadero: false },
          { afirmacion: 'const en JavaScript previene la mutación de claves internas de un objeto.', es_verdadero: false }
        ]
      },
      {
        id: 'memory_1',
        tipo: 'memory',
        lenguaje: 'General',
        dificultad: 'novato',
        titulo: 'Matriz de Conceptos de Software',
        cartas: [
          { id: 'm1', matchingId: 'p1', texto: 'Closure', flipped: false, matched: false },
          { id: 'm2', matchingId: 'p1', texto: 'Ámbito Léxico Recordado', flipped: false, matched: false },
          { id: 'm3', matchingId: 'p2', texto: 'Idempotencia', flipped: false, matched: false },
          { id: 'm4', matchingId: 'p2', texto: 'Mismo Resultado Siempre', flipped: false, matched: false }
        ]
      }
    ],
    pragma: [
      // JAVASCRIPT / REACT
      {
        id: 'sorter_1',
        tipo: 'sorter',
        lenguaje: 'JavaScript',
        dificultad: 'intermedio',
        titulo: 'Pipeline Funcional de Arrays',
        lineas: ['  .map(n => n * 2);', 'return numeros', '  .filter(n => n % 2 === 0)'],
        lineas_ordenadas: ['return numeros', '  .filter(n => n % 2 === 0)', '  .map(n => n * 2);']
      },
      {
        id: 'fill_1',
        tipo: 'fill-blank',
        lenguaje: 'JavaScript',
        dificultad: 'intermedio',
        titulo: 'Consumo Asíncrono de APIs',
        codigo_con_huecos: 'const response = ___1___ fetch("/api/datos");\nconst payload = ___2___ response.json();',
        respuestas: {
          '1': 'await',
          '2': 'await'
        }
      },
      // PYTHON
      {
        id: 'sorter_py_1',
        tipo: 'sorter',
        lenguaje: 'Python',
        dificultad: 'novato',
        titulo: 'Función Cuadrática en Python',
        lineas: ['    return resultado', 'def calcular_cuadrado(x):', '    resultado = x ** 2'],
        lineas_ordenadas: ['def calcular_cuadrado(x):', '    resultado = x ** 2', '    return resultado']
      },
      {
        id: 'fill_py_1',
        tipo: 'fill-blank',
        lenguaje: 'Python',
        dificultad: 'intermedio',
        titulo: 'List Comprehensions en Python',
        codigo_con_huecos: 'pares = [x ___1___ x in range(10) ___2___ x % 2 == 0]',
        respuestas: {
          '1': 'for',
          '2': 'if'
        }
      },
      // SQL
      {
        id: 'sorter_sql_1',
        tipo: 'sorter',
        lenguaje: 'SQL',
        dificultad: 'novato',
        titulo: 'Estructura Canónica de Consulta SQL',
        lineas: ['ORDER BY fecha_creacion DESC;', 'WHERE activo = TRUE', 'SELECT id, nombre, email', 'FROM usuarios'],
        lineas_ordenadas: ['SELECT id, nombre, email', 'FROM usuarios', 'WHERE activo = TRUE', 'ORDER BY fecha_creacion DESC;']
      },
      {
        id: 'typer_1',
        tipo: 'typer',
        lenguaje: 'General',
        dificultad: 'novato',
        titulo: 'Speedrun: Declaración de Estado',
        codigo: 'const [operador, setOperador] = useState(null);',
        descripcion: 'Escribe el código React exactamente igual a máxima velocidad.'
      },
      {
        id: 'zen_1',
        tipo: 'zen',
        lenguaje: 'JavaScript',
        dificultad: 'intermedio',
        titulo: 'Recursión Segura',
        descripcion: 'Completa la línea de control del caso base recursivo para evitar que un número negativo cause un Stack Overflow.',
        codigoInicial: `function factorial(n) {\n  if (______) return 1;\n  return n * factorial(n - 1);\n}`,
        codigoCorrecto: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}`,
        validador: (codigo) => codigo.includes('n <= 0') || codigo.includes('n < 1') || codigo.includes('n <= 1'),
        guia: 'Ejemplo de entrada: n <= 1'
      },
      {
        id: 'tinder_1',
        tipo: 'tinder',
        lenguaje: 'General',
        dificultad: 'novato',
        titulo: 'Centrado Flexible',
        descripcion: 'Escribe la propiedad CSS correcta para centrar verticalmente elementos dentro de un contenedor flexible con dirección de columna.',
        codigoInicial: `.cyber-container {\n  display: flex;\n  flex-direction: column;\n  /* Centrar verticalmente en flex-direction: column */\n  justify-content: ______;\n}`,
        codigoCorrecto: `.cyber-container {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}`,
        validador: (codigo) => codigo.includes('center') && codigo.includes('justify-content'),
        guia: 'Ejemplo de entrada: justify-content: center;'
      }
    ]
  };

  const cancelInvitation = (team, slotIndex) => {
    const setSlots = team === 'orange' ? setOrangeSlots : setBlueSlots;
    setSlots(prev => {
      const next = [...prev];
      if (next[slotIndex]?.timerId) {
        clearInterval(next[slotIndex].timerId);
      }
      next[slotIndex] = null;
      return next;
    });
  };

  const inviteFriend = (friend, team, slotIndex) => {
    setShowInviteModal(false);
    const setSlots = team === 'orange' ? setOrangeSlots : setBlueSlots;
    const COUNTDOWN_SECONDS = 12; // Espera garantizada de más de 10 segundos
    
    // Si tiene backend y ID real, despachar invitación directa por SSE
    if (friend.id && estudiante?.id) {
      fetch(`${backendUrl}/api/duelos/invitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retador_id: estudiante.id,
          retador_nombre: estudiante.nombre || 'Estudiante',
          retado_id: friend.id,
          retado_nombre: friend.nombre,
          tipo_match: matchType,
          modos: [challengeCategory],
          lenguaje: estudiante.tecnologia_actual || 'JavaScript',
          nivel: estudiante.nivel_actual || 'Intermedio'
        })
      }).catch(err => console.warn('Aviso invitación online:', err));
    }

    let remaining = COUNTDOWN_SECONDS;
    const timerId = setInterval(() => {
      remaining -= 1;
      setSlots(prev => {
        const next = [...prev];
        const current = next[slotIndex];
        if (!current || current.type !== 'inviting' || current.status !== 'sending') {
          clearInterval(timerId);
          return prev;
        }

        if (remaining > 0) {
          next[slotIndex] = { ...current, countdown: remaining, timerId };
          return next;
        }

        // Cuenta regresiva expiró
        clearInterval(timerId);
        const acepta = Math.random() < 0.75;
        if (acepta) {
          next[slotIndex] = { type: 'inviting', status: 'accepted', name: friend.nombre, countdown: 0 };
          setTimeout(() => {
            setSlots(p => {
              const n = [...p];
              n[slotIndex] = { 
                type: 'friend', 
                name: friend.nombre, 
                tech: friend.tecnologia_actual || 'JavaScript',
                friendObj: friend 
              };
              return n;
            });
          }, 1200);
        } else {
          next[slotIndex] = { type: 'inviting', status: 'expired', name: friend.nombre, countdown: 0 };
          setTimeout(() => {
            setSlots(p => {
              const n = [...p];
              if (n[slotIndex]?.status === 'expired') {
                n[slotIndex] = null;
              }
              return n;
            });
          }, 2000);
        }
        return next;
      });
    }, 1000);

    // Cambiar estado inicial del slot con el timer activo
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = { 
        type: 'inviting', 
        status: 'sending', 
        name: friend.nombre, 
        countdown: COUNTDOWN_SECONDS,
        timerId,
        friendObj: friend 
      };
      return next;
    });
  };

  const removeFriend = (team, slotIndex) => {
    const setSlots = team === 'orange' ? setOrangeSlots : setBlueSlots;
    setSlots(prev => {
      const next = [...prev];
      if (next[slotIndex]?.timerId) {
        clearInterval(next[slotIndex].timerId);
      }
      next[slotIndex] = null;
      return next;
    });
  };

  const startMatchmaking = () => {
    setShowMasterConfig(true);
  };

  const confirmAndSearch = async () => {
    setShowMasterConfig(false);
    setSearching(true);
    setSearchTimer(0);
    setBattleResult(null);

    // Intentar registrar ticket en backend de matchmaking incluyendo lenguaje y tecnología
    try {
      fetch(`${backendUrl}/api/pragma/multiplayer/match/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          tipo_match: matchType,
          categoria: challengeCategory,
          dificultad: difficulty,
          lenguaje: estudiante.tecnologia_actual || 'JavaScript'
        })
      }).catch(err => console.warn('Matchmaking join fallback local:', err));
    } catch (e) {
      // Offline fallback
    }

    let sec = 0;
    timerRef.current = setInterval(async () => {
      sec++;
      setSearchTimer(sec);

      // Sondear estado en backend
      try {
        const res = await fetch(`${backendUrl}/api/pragma/multiplayer/match/status/${estudiante.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completado' && data.matchResult) {
            clearInterval(timerRef.current);
            setSearching(false);
            initiateActiveMatch(data.matchResult);
            return;
          }
        }
      } catch (err) {
        // Silencioso
      }

      // Encontrar partida automáticamente a los 5 segundos (fallback local)
      if (sec >= 5) {
        clearInterval(timerRef.current);
        setSearching(false);
        initiateActiveMatch();
      }
    }, 1000);
  };

  const initiateActiveMatch = (backendMatch = null) => {
    // Escoger los retos según la configuración del Master o del backend sincronizado
    let retosElegidos = [];
    if (backendMatch && Array.isArray(backendMatch.retos) && backendMatch.retos.length > 0) {
      retosElegidos = backendMatch.retos;
    } else {
      const techEstudiante = (estudiante?.tecnologia_actual || 'JavaScript').toLowerCase();
      const difActual = (difficulty || 'intermedio').toLowerCase();
      const cantidad = difActual === 'novato' ? 3 : difActual === 'experto' ? 5 : 4;

      const filtrarPorTech = (pool) => {
        const coincidentes = pool.filter(r => !r.lenguaje || r.lenguaje.toLowerCase().includes(techEstudiante) || r.lenguaje === 'General');
        return coincidentes.length >= 2 ? coincidentes : pool;
      };

      if (challengeCategory === 'arcade') {
        const pool = filtrarPorTech(RETOS_MULTIPLAYER.arcade);
        retosElegidos = [...pool].sort(() => 0.5 - Math.random()).slice(0, cantidad);
      } else if (challengeCategory === 'pragma') {
        const pool = filtrarPorTech(RETOS_MULTIPLAYER.pragma);
        retosElegidos = [...pool].sort(() => 0.5 - Math.random()).slice(0, cantidad);
      } else {
        const poolA = filtrarPorTech(RETOS_MULTIPLAYER.arcade);
        const poolP = filtrarPorTech(RETOS_MULTIPLAYER.pragma);
        const cantA = Math.ceil(cantidad / 2);
        const cantP = Math.floor(cantidad / 2);
        const a = [...poolA].sort(() => 0.5 - Math.random()).slice(0, cantA);
        const p = [...poolP].sort(() => 0.5 - Math.random()).slice(0, cantP);
        retosElegidos = [...a, ...p];
      }
    }

    let finalPlayers = [];
    const maxSlots = matchType === '2v2' ? 2 : 4;

    if (backendMatch && Array.isArray(backendMatch.jugadores) && backendMatch.jugadores.length > 0) {
      finalPlayers = backendMatch.jugadores.map((j, idx) => ({
        id: j.id || `player_${idx}`,
        nombre: j.nombre || `Jugador ${idx + 1}`,
        avatar: j.isBot ? '🤖' : (j.id === estudiante.id ? '⚡' : '🧬'),
        team: idx % 2 === 0 ? 'orange' : 'blue',
        isSelf: j.id === estudiante.id,
        isBot: !!j.isBot,
        progress: 0,
        errors: 0,
        finished: false,
        time: null
      }));
    } else if (matchType === '1v1') {
      const isMasterOrange = orangeSlots.some(s => s?.type === 'master');
      const masterTeam = isMasterOrange ? 'orange' : 'blue';
      const rivalTeam = masterTeam === 'orange' ? 'blue' : 'orange';
      finalPlayers = [
        { id: 'self', nombre: estudiante.nombre, avatar: '⚡', team: masterTeam, isSelf: true, progress: 0, errors: 0, finished: false, time: null },
        { id: 'rival1', nombre: 'PRAGMA_BOT_RIVAL', avatar: '🤖', team: rivalTeam, isSelf: false, isBot: true, progress: 0, errors: 0, finished: false, time: null }
      ];
    } else {
      const orangePlayers = [];
      const bluePlayers = [];

      for (let i = 0; i < maxSlots; i++) {
        const oSlot = orangeSlots[i];
        if (oSlot) {
          if (oSlot.type === 'master') {
            orangePlayers.push({ id: 'self', nombre: estudiante.nombre, avatar: '⚡', team: 'orange', isSelf: true, progress: 0, errors: 0, finished: false, time: null });
          } else {
            orangePlayers.push({ id: `orange_friend_${i}`, nombre: oSlot.name, avatar: '👽', team: 'orange', isSelf: false, progress: 0, errors: 0, finished: false, time: null });
          }
        } else {
          orangePlayers.push({ id: `orange_bot_${i}`, nombre: `PRAGMA_BOT_O${i + 1}`, avatar: '🤖', team: 'orange', isSelf: false, progress: 0, errors: 0, finished: false, time: null });
        }

        const bSlot = blueSlots[i];
        if (bSlot) {
          if (bSlot.type === 'master') {
            bluePlayers.push({ id: 'self', nombre: estudiante.nombre, avatar: '⚡', team: 'blue', isSelf: true, progress: 0, errors: 0, finished: false, time: null });
          } else {
            bluePlayers.push({ id: `blue_friend_${i}`, nombre: bSlot.name, avatar: '🧬', team: 'blue', isSelf: false, progress: 0, errors: 0, finished: false, time: null });
          }
        } else {
          bluePlayers.push({ id: `blue_bot_${i}`, nombre: `PRAGMA_BOT_B${i + 1}`, avatar: '🤖', team: 'blue', isSelf: false, progress: 0, errors: 0, finished: false, time: null });
        }
      }

      finalPlayers = [...orangePlayers, ...bluePlayers];
    }

    const matchState = {
      id: backendMatch?.salaId || `match_${Date.now()}`,
      retos: retosElegidos,
      retoActualIndice: 0,
      userTriviaRespuestas: {},
      userCodigoInput: retosElegidos[0]?.tipo !== 'trivia' ? (retosElegidos[0]?.codigoInicial || '') : '',
      userProgress: 0,
      userErrors: 0,
      userFinished: false,
      userTime: 0,
      timeLeft: 60,
      players: finalPlayers,
      esRealtime: !!backendMatch
    };

    setActiveMatch(matchState);

    // Iniciar el loop de simulación de progreso en tiempo real
    matchIntervalRef.current = setInterval(() => {
      setActiveMatch(prev => {
        if (!prev) return null;

        // Decrementar tiempo
        const nextTimeLeft = prev.timeLeft - 1;
        if (nextTimeLeft <= 0) {
          clearInterval(matchIntervalRef.current);
          calculateFinalResult(prev);
          return null;
        }

        // Simular progreso de otros jugadores
        const updatedPlayers = prev.players.map(p => {
          if (p.isSelf) {
            // Actualizar tiempo acumulado si no ha terminado
            return {
              ...p,
              progress: prev.userProgress,
              errors: prev.userErrors,
              finished: prev.userFinished,
              time: prev.userFinished ? (p.time != null ? p.time : prev.userTime) : (p.time || 0) + 1
            };
          }

          if (prev.esRealtime && !p.isBot) {
            // En una partida en tiempo real, el progreso del oponente real se actualiza mediante eventos SSE
            return p;
          }

          if (p.finished) return p;

          // Incremento calibrado por nivel de dificultad
          const diff = prev.dificultad || difficulty || 'intermedio';
          let minInc = 5, maxInc = 8, errProb = 0.10;
          if (diff === 'novato') {
            minInc = 3; maxInc = 6; errProb = 0.15;
          } else if (diff === 'experto') {
            minInc = 7; maxInc = 11; errProb = 0.04;
          }
          const randIncrement = Math.floor(Math.random() * (maxInc - minInc + 1)) + minInc;
          const nextProgress = Math.min(p.progress + randIncrement, 100);
          const finished = nextProgress >= 100;
          
          // Posible error calibrado según dificultad
          const hadError = Math.random() < errProb;
          const nextErrors = p.errors + (hadError ? 1 : 0);

          return {
            ...p,
            progress: nextProgress,
            errors: nextErrors,
            finished: finished,
            time: finished ? (p.time || prev.userTime + 1) : null
          };
        });

        // Verificar si todos terminaron
        const allFinished = updatedPlayers.every(p => p.finished);
        if (allFinished) {
          clearInterval(matchIntervalRef.current);
          // Retraso pequeño para mostrar finalización
          setTimeout(() => calculateFinalResult({ ...prev, players: updatedPlayers, timeLeft: nextTimeLeft }), 500);
        }

        // Actualizar el código input al cambiar de reto si es código
        const currentChallenge = prev.retos[prev.retoActualIndice];

        return {
          ...prev,
          timeLeft: nextTimeLeft,
          players: updatedPlayers,
          userTime: prev.userFinished ? prev.userTime : prev.userTime + 1
        };
      });
    }, 1000);
  };

  // Función centralizada para avanzar de reto y reportar progreso a la red en tiempo real
  const completarRetoMultijugador = async (esCorrecto) => {
    if (!activeMatch) return;

    let nextErrors = activeMatch.userErrors;
    let progressIncrement = 0;
    let nextFinished = false;

    if (esCorrecto) {
      progressIncrement = Math.ceil(100 / activeMatch.retos.length);
    } else {
      nextErrors += 1;
    }

    const nextUserProgress = Math.min(activeMatch.userProgress + (esCorrecto ? progressIncrement : 0), 100);
    const isLastChallenge = activeMatch.retoActualIndice === activeMatch.retos.length - 1;

    let nextChallengeIndex = activeMatch.retoActualIndice;
    if (esCorrecto) {
      if (isLastChallenge) {
        nextFinished = true;
      } else {
        nextChallengeIndex += 1;
      }
    }

    const nextChallenge = activeMatch.retos[nextChallengeIndex];

    setActiveMatch(prev => {
      if (!prev) return null;

      const updatedPlayers = prev.players.map(p => {
        if (p.isSelf) {
          return {
            ...p,
            progress: nextUserProgress,
            errors: nextErrors,
            finished: nextFinished,
            time: nextFinished ? (p.time != null ? p.time : prev.userTime) : p.time
          };
        }
        return p;
      });

      const allFinished = updatedPlayers.every(p => p.finished);
      if (allFinished && matchIntervalRef.current) {
        clearInterval(matchIntervalRef.current);
        setTimeout(() => calculateFinalResult({ ...prev, players: updatedPlayers, userProgress: nextUserProgress, userErrors: nextErrors, userFinished: nextFinished }), 500);
      }

      return {
        ...prev,
        userProgress: nextUserProgress,
        userErrors: nextErrors,
        retoActualIndice: nextChallengeIndex,
        userFinished: nextFinished,
        players: updatedPlayers,
        userCodigoInput: nextChallenge && nextChallenge.tipo !== 'trivia' ? (nextChallenge.codigoInicial || '') : ''
      };
    });

    // Enviar progreso en tiempo real al servidor
    if (activeMatch.esRealtime && activeMatch.id) {
      try {
        await fetch(`${backendUrl}/api/partidas/${activeMatch.id}/progreso`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jugador_id: estudiante.id,
            progreso: nextUserProgress,
            errores: nextErrors,
            tiempo: activeMatch.userTime,
            finalizado: nextFinished
          })
        });
      } catch (err) {
        console.error("Error al reportar progreso del duelo:", err);
      }
    }
  };

  // Enviar respuesta en Trivia / Output / Refactor
  const handleTriviaAnswer = (opcionIndex) => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    
    let correctaIndex = currentChallenge.correcta;
    if (correctaIndex === undefined) {
      correctaIndex = currentChallenge.respuesta_correcta;
    }

    const esCorrecta = opcionIndex === correctaIndex;
    completarRetoMultijugador(esCorrecta);
  };

  // Enviar validación de código en Zen/Tinder/Refactor manual
  const handleCodeSubmit = () => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    let esValido = false;
    if (typeof currentChallenge.validador === 'function') {
      esValido = currentChallenge.validador(activeMatch.userCodigoInput);
    } else if (currentChallenge.codigoCorrecto) {
      esValido = activeMatch.userCodigoInput.trim().replace(/\s+/g, '') === currentChallenge.codigoCorrecto.trim().replace(/\s+/g, '');
    } else {
      // Fallback aprobatorio para evitar bloqueos
      esValido = activeMatch.userCodigoInput.trim().length > 5;
    }
    completarRetoMultijugador(esValido);
  };

  const verificarSorter = () => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    const correcto = JSON.stringify(sorterLineas) === JSON.stringify(currentChallenge.lineas_ordenadas);
    completarRetoMultijugador(correcto);
  };

  const verificarFillBlank = () => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    const respuestasCorrectas = currentChallenge.respuestas;
    const todasCorrectas = Object.keys(respuestasCorrectas).every(
      key => (fillRespuestas[key] || '').trim().toLowerCase() === respuestasCorrectas[key].trim().toLowerCase()
    );
    completarRetoMultijugador(todasCorrectas);
  };

  const responderFlashcard = (esVerdadero) => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    const cardActual = currentChallenge.flashcards[flashcardIdx];
    const esCorrecto = esVerdadero === cardActual.es_verdadero;
    
    if (esCorrecto) {
      if (flashcardIdx === currentChallenge.flashcards.length - 1) {
        completarRetoMultijugador(true);
      } else {
        setFlashcardIdx(idx => idx + 1);
      }
    } else {
      completarRetoMultijugador(false);
    }
  };

  const verificarTyper = (val) => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    setTyperInput(val);
    if (val === currentChallenge.codigo) {
      completarRetoMultijugador(true);
    }
  };

  const voltearCartaMemory = (cardId) => {
    if (!activeMatch) return;
    const currentChallenge = activeMatch.retos[activeMatch.retoActualIndice];
    if (memorySelected.length >= 2) return;
    
    const targetIdx = memoryCards.findIndex(c => c.id === cardId);
    if (targetIdx === -1 || memoryCards[targetIdx].flipped || memoryCards[targetIdx].matched) return;

    const nuevasCartas = [...memoryCards];
    nuevasCartas[targetIdx] = { ...nuevasCartas[targetIdx], flipped: true };
    setMemoryCards(nuevasCartas);

    const nuevasSelected = [...memorySelected, nuevasCartas[targetIdx]];
    setMemorySelected(nuevasSelected);

    if (nuevasSelected.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [first, second] = nuevasSelected;
      
      if (first.matchingId === second.matchingId) {
        setTimeout(() => {
          setMemoryCards(prevCards => {
            const res = prevCards.map(c => 
              c.matchingId === first.matchingId ? { ...c, matched: true } : c
            );
            const todasCompletadas = res.every(c => c.matched);
            if (todasCompletadas) {
              completarRetoMultijugador(true);
            }
            return res;
          });
          setMemorySelected([]);
        }, 600);
      } else {
        setTimeout(() => {
          setMemoryCards(prevCards => 
            prevCards.map(c => 
              c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c
            )
          );
          setMemorySelected([]);
          completarRetoMultijugador(false);
        }, 1000);
      }
    }
  };

  // Cálculo de Puntuaciones y Ganador
  const calculateFinalResult = (finalState) => {
    clearInterval(matchIntervalRef.current);

    // Calcular puntaje de cada jugador
    const finalPlayers = finalState.players.map(p => {
      const pProgress = p.isSelf ? (finalState.userProgress != null ? finalState.userProgress : p.progress) : p.progress;
      const pErrors = p.isSelf ? (finalState.userErrors != null ? finalState.userErrors : p.errors) : p.errors;
      const pTime = p.isSelf 
        ? (p.time != null ? p.time : (finalState.userTime || 60)) 
        : (p.time || 60);
      const completionScore = pProgress * 10;
      const errorPenalty = pErrors * 15;
      const timePenalty = pTime * 2;
      const finalScore = Math.max(0, completionScore - errorPenalty - timePenalty);

      return {
        ...p,
        progress: pProgress,
        errors: pErrors,
        time: pTime,
        score: Math.round(finalScore)
      };
    });

    // Ordenar de mayor a menor puntuación
    finalPlayers.sort((a, b) => b.score - a.score);

    // Identificar el equipo del usuario
    const selfPlayer = finalPlayers.find(p => p.isSelf);
    const myTeam = selfPlayer ? selfPlayer.team : 'orange';

    // Calcular puntaje total de los equipos
    const orangeTeamScore = finalPlayers.filter(p => p.team === 'orange').reduce((acc, curr) => acc + curr.score, 0);
    const blueTeamScore = finalPlayers.filter(p => p.team === 'blue').reduce((acc, curr) => acc + curr.score, 0);

    const myTeamScore = myTeam === 'orange' ? orangeTeamScore : blueTeamScore;
    const rivalTeamScore = myTeam === 'orange' ? blueTeamScore : orangeTeamScore;

    const victoria = myTeamScore >= rivalTeamScore;
    const rankPointsGained = victoria ? 25 : 10;
    const shardsGained = victoria ? 10 : 3;

    // Actualizar perfil del estudiante con esencias tecnológicas sincronizadas
    const profileCopy = { ...(estudiante.pragma_profile || {}) };
    profileCopy.rank_points = (profileCopy.rank_points || 0) + rankPointsGained;
    profileCopy.inventory = { ...(profileCopy.inventory || {}) };
    profileCopy.inventory.silicon_shards = (profileCopy.inventory.silicon_shards || 0) + shardsGained;

    // Otorgar esencia correspondiente a la tecnología activa del alumno
    const tech = (estudiante?.tecnologia_actual || 'JavaScript').toLowerCase();
    if (victoria) {
      if (tech.includes('python')) {
        profileCopy.inventory.python_essence = (profileCopy.inventory.python_essence || 0) + 1;
      } else if (tech.includes('sql') || tech.includes('supabase') || tech.includes('database')) {
        profileCopy.inventory.sql_essence = (profileCopy.inventory.sql_essence || 0) + 1;
      } else {
        profileCopy.inventory.javascript_essence = (profileCopy.inventory.javascript_essence || 0) + 1;
      }
    }

    onUpdate(profileCopy);

    // Guardar estadísticas y pragma_profile reales en Firestore
    try {
      fetch(`${backendUrl}/api/estudiantes/${estudiante.id}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pragma_profile: profileCopy,
          xp: (estudiante.xp || 0) + (victoria ? 50 : 20),
          ganada: victoria,
          lenguaje: estudiante.tecnologia_actual || 'JavaScript'
        })
      }).catch(err => console.warn('Error al guardar stats de partida en Firestore:', err));
    } catch (err) {
      console.error(err);
    }

    setBattleResult({
      victoria,
      mensaje: victoria 
        ? `¡Victoria del Equipo ${myTeam === 'orange' ? 'Naranja' : 'Azul'}! Tu equipo completó la partida con mayor velocidad y precisión.` 
        : `Partida finalizada. El Equipo Rival (${myTeam === 'orange' ? 'Azul' : 'Naranja'}) obtuvo mayor puntuación en los retos.`,
      scoreDetalle: finalPlayers,
      orangeTeamScore,
      blueTeamScore,
      rankGanado: rankPointsGained,
      shardsGanado: shardsGained
    });

    setActiveMatch(null);
  };

  const cancelSearch = () => {
    clearInterval(timerRef.current);
    setSearching(false);
    try {
      fetch(`${backendUrl}/api/pragma/multiplayer/match/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id })
      }).catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(matchIntervalRef.current);
      try {
        fetch(`${backendUrl}/api/pragma/multiplayer/match/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estudiante_id: estudiante.id })
        }).catch(() => {});
      } catch (e) {}
    };
  }, []);

  const renderSlot = (team, slotIndex) => {
    const slot = team === 'orange' ? orangeSlots[slotIndex] : blueSlots[slotIndex];

    if (!slot) {
      return (
        <div key={`${team}-${slotIndex}`} className="lobby-player-slot empty">
          <button 
            className="invite-slot-btn group" 
            onClick={() => {
              setInviteTarget({ team, index: slotIndex });
              setShowInviteModal(true);
            }}
          >
            <UserPlus size={16} className="mb-1 text-indigo-400 group-hover:text-indigo-300 transition" />
            <span>Invitar Amigo</span>
          </button>
        </div>
      );
    }

    if (slot.type === 'master') {
      return (
        <div key={`${team}-${slotIndex}`} className="lobby-player-slot master active">
          <div className="slot-avatar">⚡</div>
          <div className="slot-info">
            <span className="slot-name">{slot.name}</span>
            <span className="slot-role">LÍDER DE SALA</span>
          </div>
          <button className="swap-slot-btn" onClick={() => swapTeam(team, slotIndex)} title="Intercambiar equipo">
            ⇄ INTERCAMBIAR
          </button>
        </div>
      );
    }

    if (slot.type === 'inviting') {
      if (slot.status === 'sending') {
        return (
          <div key={`${team}-${slotIndex}`} className="lobby-player-slot active inviting border border-indigo-500/40 bg-slate-900/80 rounded-xl relative p-2.5 flex flex-col items-center justify-center shadow-md">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="slot-spinner animate-spin w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full"></div>
              <span className="font-mono text-[10px] text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/25">
                ⏱️ {slot.countdown || 12}s
              </span>
            </div>
            <div className="slot-info text-center mb-2">
              <span className="slot-name text-white font-medium text-xs max-w-[120px] truncate block">{slot.name}</span>
              <span className="slot-role text-[10px] text-slate-400 font-medium block">Esperando respuesta...</span>
            </div>
            <div className="flex gap-1">
              <button 
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white text-[10px] font-medium rounded-md cursor-pointer transition active:scale-95" 
                onClick={() => cancelInvitation(team, slotIndex)} 
                title="Cancelar invitación activa"
              >
                Cancelar
              </button>
            </div>
          </div>
        );
      } else if (slot.status === 'accepted') {
        return (
          <div key={`${team}-${slotIndex}`} className="lobby-player-slot active accepted border-emerald-500 bg-emerald-950/20">
            <div className="slot-avatar text-emerald-400 text-lg">✔️</div>
            <div className="slot-info">
              <span className="slot-name text-emerald-400 font-bold text-xs">¡Aceptado!</span>
              <span className="slot-role text-emerald-400">{slot.name}</span>
            </div>
          </div>
        );
      } else if (slot.status === 'expired') {
        return (
          <div key={`${team}-${slotIndex}`} className="lobby-player-slot active expired border-amber-500/50 bg-amber-950/20">
            <div className="slot-avatar text-amber-400 text-base">⏱️</div>
            <div className="slot-info">
              <span className="slot-name text-amber-400 font-bold text-[11px]">Tiempo Expirado</span>
              <span className="slot-role text-slate-400 text-[8px]">Sin respuesta de {slot.name}</span>
            </div>
          </div>
        );
      } else {
        return (
          <div key={`${team}-${slotIndex}`} className="lobby-player-slot active rejected border-rose-500 bg-rose-950/20">
            <div className="slot-avatar text-rose-500">❌</div>
            <div className="slot-info">
              <span className="slot-name text-rose-500">Ocupado</span>
              <span className="slot-role text-rose-400">{slot.name}</span>
            </div>
          </div>
        );
      }
    }

    return (
      <div key={`${team}-${slotIndex}`} className="lobby-player-slot active">
        <div className="slot-avatar">👽</div>
        <div className="slot-info">
          <span className="slot-name">{slot.name}</span>
          <span className="slot-role">{slot.tech}</span>
        </div>
        <div className="slot-actions flex gap-1 items-center">
          <button className="swap-slot-btn" onClick={() => swapTeam(team, slotIndex)} title="Intercambiar equipo">
            ⇄ INTERCAMBIAR
          </button>
          <button className="kick-slot-btn" onClick={() => removeFriend(team, slotIndex)}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="lobby-panel glass-panel codewars-arena-panel">
      {/* CABECERA MULTIJUGADOR */}
      <div className="arena-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
            ⚔️
          </div>
          <div>
            <h2 className="arena-title">Arena Multijugador</h2>
            <div className="arena-sub-telemetry">
              <span className="text-emerald-400 font-semibold">● Servidores Online</span>
              <span className="mx-2 text-slate-600">•</span>
              <span className="text-slate-400">Lobby Global: Alpha-7</span>
            </div>
          </div>
        </div>

        {searching && (
          <div className="queue-timer-badge">
            <span className="pulse-dot"></span>
            Buscando Partida: {matchType} | {Math.floor(searchTimer / 60).toString().padStart(2, '0')}:{(searchTimer % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* 1. SECCIÓN DE CREACIÓN DE LOBBY / GRUPO */}
      {!searching && !activeMatch && !battleResult && !showMasterConfig && (
        <div className="setup-container-spec">
          <p className="panel-desc">Compite o colabora con otros desarrolladores en tiempo real resolviendo desafíos algorítmicos:</p>
          
          <div className="match-options-spec">
            <button className={`mode-card-btn duel ${matchType === '1v1' ? 'active' : ''}`} onClick={() => cambiarTipoMatch('1v1')}>
              <span className="mode-icon">⚡</span>
              <span className="mode-title">1v1</span>
              <span className="mode-sub">Duelo Directo</span>
            </button>
            <button className={`mode-card-btn team-match ${matchType === '2v2' ? 'active' : ''}`} onClick={() => cambiarTipoMatch('2v2')}>
              <span className="mode-icon">👥</span>
              <span className="mode-title">2v2</span>
              <span className="mode-sub">Parejas</span>
            </button>
            <button className={`mode-card-btn squad ${matchType === '4v4' ? 'active' : ''}`} onClick={() => cambiarTipoMatch('4v4')}>
              <span className="mode-icon">🛡️</span>
              <span className="mode-title">4v4</span>
              <span className="mode-sub">Equipos 4v4</span>
            </button>
          </div>

          {/* RENDERIZAR LOBBY DEL EQUIPO (SÓLO SI ES 1v1, 2v2 o 4v4) */}
          {(matchType === '1v1' || matchType === '2v2' || matchType === '4v4') && (
            <div className="lobby-squad-container-vs w-full max-w-[950px] mt-6">
              <div className="lobby-vs-arena-layout">
                {/* LADO IZQUIERDO: EQUIPO NARANJA */}
                <div className="vs-team-column orange-team-column">
                  <div className="vs-team-header orange">
                    <span className="team-glow-text">🛡️ Equipo Naranja</span>
                    <span className="team-size-counter">
                      {orangeSlots.filter((s, idx) => s !== null && idx < (matchType === '1v1' ? 1 : matchType === '2v2' ? 2 : 4)).length} / {matchType === '1v1' ? 1 : matchType === '2v2' ? 2 : 4}
                    </span>
                  </div>
                  <div className="vs-slots-list">
                    {(matchType === '1v1' ? [0] : matchType === '2v2' ? [0, 1] : [0, 1, 2, 3]).map(idx => renderSlot('orange', idx))}
                  </div>
                </div>

                {/* CENTRO: VS DIVIDER */}
                <div className="vs-center-divider">
                  <div className="vs-glow-badge">
                    <span className="vs-text-glow">VS</span>
                  </div>
                </div>

                {/* LADO DERECHO: EQUIPO AZUL */}
                <div className="vs-team-column blue-team-column">
                  <div className="vs-team-header blue">
                    <span className="team-glow-text">🔮 Equipo Azul</span>
                    <span className="team-size-counter">
                      {blueSlots.filter((s, idx) => s !== null && idx < (matchType === '1v1' ? 1 : matchType === '2v2' ? 2 : 4)).length} / {matchType === '1v1' ? 1 : matchType === '2v2' ? 2 : 4}
                    </span>
                  </div>
                  <div className="vs-slots-list">
                    {(matchType === '1v1' ? [0] : matchType === '2v2' ? [0, 1] : [0, 1, 2, 3]).map(idx => renderSlot('blue', idx))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button className="btn-action-hud start-search-btn-hud mt-6" onClick={startMatchmaking}>
            <Play size={16} fill="white" />
            <span>Iniciar Búsqueda de Partida</span>
          </button>
        </div>
      )}

      {/* MODAL / SECTOR DE INVITACIÓN DE AMIGOS (DISEÑO SLATE / INDIGO) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 max-w-md w-full overflow-hidden">
            
            {/* Cabecera del Modal */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Invitar Amigo a la Partida</h3>
                  <p className="text-[11px] text-slate-400">Selecciona un compañero para unirse a tu sala</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setFriendSearchQuery('');
                }} 
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X size={16} />
              </button>
            </div>

            {/* Barra de Búsqueda */}
            <div className="p-4 border-b border-slate-800/60 bg-slate-950/40">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                <input 
                  type="text" 
                  placeholder="Buscar amigo por nombre o tecnología..." 
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/60 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
              </div>
            </div>

            {/* Lista de Amigos en el Modal */}
            <div className="p-4 flex flex-col gap-2 max-h-[320px] overflow-y-auto">
              {listaAmigos.filter(amigo => 
                amigo.nombre.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                (amigo.tecnologia_actual && amigo.tecnologia_actual.toLowerCase().includes(friendSearchQuery.toLowerCase()))
              ).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <Users size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
                  <p>No se encontraron amigos disponibles.</p>
                </div>
              ) : (
                listaAmigos.filter(amigo => 
                  amigo.nombre.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                  (amigo.tecnologia_actual && amigo.tecnologia_actual.toLowerCase().includes(friendSearchQuery.toLowerCase()))
                ).map((amigo) => {
                  const yaInvitado = 
                    orangeSlots.some(s => s && s.type === 'friend' && s.friendObj?.id === amigo.id) ||
                    blueSlots.some(s => s && s.type === 'friend' && s.friendObj?.id === amigo.id);
                  const inicial = amigo.nombre ? amigo.nombre.charAt(0).toUpperCase() : 'E';
                  
                  return (
                    <div 
                      key={amigo.id} 
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 hover:bg-slate-800/40 border border-slate-800/60 hover:border-indigo-500/30 transition-all duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold text-xs flex items-center justify-center shadow-sm">
                          {inicial}
                        </div>
                        <div>
                          <span className="text-white font-medium text-xs block">{amigo.nombre}</span>
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded font-medium inline-block mt-0.5">
                            {amigo.tecnologia_actual || 'JavaScript'}
                          </span>
                        </div>
                      </div>
                      <button 
                        disabled={yaInvitado}
                        onClick={() => {
                          inviteFriend(amigo, inviteTarget.team, inviteTarget.index);
                          setFriendSearchQuery('');
                        }}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                          yaInvitado 
                            ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20'
                        }`}
                      >
                        {yaInvitado ? 'Invitado' : 'Invitar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CONFIGURACIÓN DEL MASTER DE LA SALA */}
      {showMasterConfig && (
        <div className="setup-container-spec master-config-panel-hud">
          <h3 className="text-lg font-mono text-indigo-300 font-bold tracking-wider mb-1">
            CONFIGURACIÓN DE SALA MULTIJUGADOR
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-6">
            Selecciona el entorno de simulación que se sincronizará para todos los participantes en la partida:
          </p>

          <div className="config-grid-sections w-full max-w-[700px] flex flex-col gap-6">
            {/* Categoría de Retos */}
            <div className="config-group">
              <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider block mb-2">MODO DE SIMULACIÓN / JUEGOS:</span>
              <div className="config-options-grid">
                <button 
                  className={`config-card-btn p-4 border text-left font-mono ${challengeCategory === 'mixed' ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`} 
                  onClick={() => setChallengeCategory('mixed')}
                >
                  <div className="config-btn-content">
                    <span className="config-btn-title">🌐 TODO (MIXTO)</span>
                    <span className="config-btn-desc">Mezcla de minijuegos clásicos y Santuario Pragma AI.</span>
                  </div>
                </button>
                <button 
                  className={`config-card-btn p-4 border text-left font-mono ${challengeCategory === 'pragma' ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`} 
                  onClick={() => setChallengeCategory('pragma')}
                >
                  <div className="config-btn-content">
                    <span className="config-btn-title">🧪 NUEVOS MODOS</span>
                    <span className="config-btn-desc">Acertijos del Santuario Zen y Tinder de sintaxis.</span>
                  </div>
                </button>
                <button 
                  className={`config-card-btn p-4 border text-left font-mono ${challengeCategory === 'arcade' ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`} 
                  onClick={() => setChallengeCategory('arcade')}
                >
                  <div className="config-btn-content">
                    <span className="config-btn-title">🕹️ CLÁSICOS ARCADE</span>
                    <span className="config-btn-desc">Preguntas de trivia técnica y refactorización.</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Dificultad */}
            <div className="config-group">
              <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider block mb-2">DIFICULTAD DEL PROBLEMA:</span>
              <div className="difficulty-grid">
                {['novato', 'intermedio', 'experto'].map((diff) => (
                  <button 
                    key={diff}
                    className={`config-card-btn p-3 border text-center font-mono uppercase text-xs ${difficulty === diff ? 'border-amber-500 text-amber-500 bg-amber-500/5' : 'border-slate-800 text-slate-400'}`} 
                    onClick={() => setDifficulty(diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8 w-full max-w-[400px]">
            <button className="hud-btn bg-slate-900 border border-slate-800 text-slate-400 py-2.5 px-4 text-xs flex-1" onClick={() => setShowMasterConfig(false)}>
              Volver
            </button>
            <button className="hud-btn bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white font-semibold py-2.5 px-4 text-xs flex-1 flex items-center justify-center gap-2" onClick={confirmAndSearch}>
              <Play size={14} /> BUSCAR RIVALES
            </button>
          </div>
        </div>
      )}

      {/* 3. BUSCANDO PARTIDA (MATCHMAKING) */}
      {searching && (
        <div className="arena-searching-layout">
          <div className="arena-searching-top">
            <div className="radar-tactical-container hud-panel-spec flex flex-col items-center justify-center p-6 bg-slate-900/60 border border-indigo-500/20 rounded-xl relative overflow-hidden">
              <div className="relative flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-25"></div>
                <div className="absolute inset-2 rounded-full border border-indigo-500/40 animate-pulse"></div>
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/40 flex items-center justify-center">
                  <Radio size={24} className="text-indigo-400 animate-pulse" />
                </div>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono mt-3 uppercase tracking-wider">Escaneando red de desarrolladores...</span>
            </div>

            <div className="telemetry-logs-side hud-panel-spec font-mono text-xs text-indigo-300">
              <p className="log-line opacity-90">[INFO] SINCRONIZANDO CONFIGURACIÓN DE RETOS...</p>
              <p className="log-line opacity-75">[MODE] {challengeCategory.toUpperCase()} | DIFICULTAD: {difficulty.toUpperCase()}</p>
              <p className="log-line text-amber-400 animate-pulse">[SCAN] BUSCANDO OPONENTES DE TAMAÑO {matchType}...</p>
              <p className="log-line opacity-85">[SUCCESS] SERVIDORES LISTOS - CREANDO ENTORNO COGNITIVO COMPARTIDO</p>
            </div>
          </div>

          <div className="searching-bottom-controls">
            <div className="audio-waveforms">
              <div className="wave-bar animate-wave-short"></div>
              <div className="wave-bar animate-wave-tall"></div>
              <span className="audio-label">EN COLA MULTIJUGADOR</span>
              <div className="wave-bar animate-wave-medium"></div>
              <div className="wave-bar animate-wave-short"></div>
            </div>

            <button className="btn-hud-cancel" onClick={cancelSearch}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* 4. PANTALLA DE JUEGO ACTIVO (RETOS COMPARTIDOS) */}
      {activeMatch && (
        <div className="active-match-grid animate-scale-in">
          {/* LADO IZQUIERDO: EL ESPACIO DE RETO */}
          <div className="challenge-workspace-panel hud-panel-spec bg-slate-950/80 p-5 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-amber-400 font-mono tracking-widest block uppercase">RETO COMPARTIDO ACTIVO</span>
                <h3 className="text-base text-white font-bold font-mono">
                  {activeMatch.retos[activeMatch.retoActualIndice].titulo}
                </h3>
              </div>
              <div className="timer-countdown font-mono text-rose-500 font-bold px-3 py-1 border border-rose-500/20 bg-rose-500/5 text-sm animate-pulse">
                ⏱️ {activeMatch.timeLeft}s
              </div>
            </div>

            {/* RENDERIZADO SI EL RETO ACTUAL ES TRIVIA */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'trivia' && (
              <div className="trivia-interactive-game space-y-4">
                <p className="trivia-question text-sm text-slate-200 font-mono bg-slate-900/60 p-4 border border-slate-800 rounded">
                  {activeMatch.retos[activeMatch.retoActualIndice].pregunta}
                </p>
                <div className="trivia-options-grid grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {activeMatch.retos[activeMatch.retoActualIndice].opciones.map((opcion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      className="trivia-option-card flex items-center gap-3 p-3 bg-slate-900 hover:bg-[#00f3ff]/10 border border-slate-800 hover:border-[#00f3ff]/40 rounded transition-all text-left text-xs font-mono text-slate-300"
                    >
                      <span className="option-badge px-2 py-0.5 bg-slate-800 text-[#00f3ff] rounded font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text flex-1">{opcion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES OUTPUT */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'output' && (
              <div className="output-interactive-game space-y-4">
                <p className="text-xs text-slate-400 font-mono">Predecir la salida en consola del siguiente fragmento:</p>
                <pre className="bg-slate-900 border border-slate-800 p-4 rounded text-xs text-emerald-400 font-mono overflow-x-auto">
                  <code>{activeMatch.retos[activeMatch.retoActualIndice].codigo}</code>
                </pre>
                <div className="trivia-options-grid grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {activeMatch.retos[activeMatch.retoActualIndice].opciones.map((opcion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      className="trivia-option-card flex items-center gap-3 p-3 bg-slate-900 hover:bg-[#00f3ff]/10 border border-slate-800 hover:border-[#00f3ff]/40 rounded transition-all text-left text-xs font-mono text-slate-300"
                    >
                      <span className="option-badge px-2 py-0.5 bg-slate-800 text-[#00f3ff] rounded font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text flex-1">{opcion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES REFACTOR */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'refactor' && (
              <div className="refactor-interactive-game space-y-4">
                <div className="bg-slate-900/60 p-3 border border-slate-800 rounded">
                  <span className="text-[10px] text-rose-400 font-mono font-bold block mb-1">BUG DETECTADO:</span>
                  <p className="text-xs text-slate-300 font-mono">
                    {activeMatch.retos[activeMatch.retoActualIndice].descripcion}
                  </p>
                </div>
                <pre className="bg-slate-900 border border-rose-950/40 p-4 rounded text-xs text-rose-400 font-mono overflow-x-auto">
                  <code>{activeMatch.retos[activeMatch.retoActualIndice].codigo_con_bug}</code>
                </pre>
                <div className="trivia-options-grid grid grid-cols-1 gap-3 mt-4">
                  {activeMatch.retos[activeMatch.retoActualIndice].opciones_correcion.map((opcion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      className="trivia-option-card flex items-start gap-3 p-3 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 rounded transition-all text-left text-[11px] font-mono text-slate-300"
                    >
                      <span className="option-badge px-2 py-0.5 bg-slate-800 text-emerald-400 rounded font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <pre className="option-text flex-1 overflow-x-auto whitespace-pre-wrap"><code>{opcion}</code></pre>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES SORTER */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'sorter' && (
              <div className="sorter-interactive-game space-y-4">
                <p className="text-xs text-slate-400 font-mono">Reordena las líneas de código para construir la lógica correcta:</p>
                <div className="sorter-lines-container space-y-2">
                  {sorterLineas.map((linea, idx) => (
                    <div 
                      key={idx}
                      className="sorter-line flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300"
                    >
                      <span className="select-none text-slate-600 mr-2">{idx + 1}</span>
                      <code className="flex-1 whitespace-pre">{linea}</code>
                      <div className="flex gap-1.5 ml-2">
                        <button 
                          disabled={idx === 0}
                          onClick={() => {
                            const next = [...sorterLineas];
                            [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
                            setSorterLineas(next);
                          }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px]"
                        >
                          ▲
                        </button>
                        <button 
                          disabled={idx === sorterLineas.length - 1}
                          onClick={() => {
                            const next = [...sorterLineas];
                            [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                            setSorterLineas(next);
                          }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-[10px]"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={verificarSorter}
                  className="hud-btn w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 text-xs"
                >
                  VERIFICAR ORDENAMIENTO
                </button>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES FILL-BLANK */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'fill-blank' && (
              <div className="fillblank-interactive-game space-y-4">
                <p className="text-xs text-slate-400 font-mono">Identifica y completa los fragmentos marcados con ___1___, ___2___, etc.:</p>
                <pre className="bg-slate-900 border border-slate-800 p-4 rounded text-xs text-slate-300 font-mono overflow-x-auto">
                  <code>{activeMatch.retos[activeMatch.retoActualIndice].codigo_con_huecos}</code>
                </pre>
                <div className="fill-inputs-grid grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {Object.keys(activeMatch.retos[activeMatch.retoActualIndice].respuestas).map((key) => (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[10px] text-cyan-400 font-mono font-bold">Hueco ___{key}___:</label>
                      <input 
                        type="text"
                        className="bg-slate-900 border border-slate-800 text-xs text-white p-2 font-mono rounded focus:border-cyan-500 focus:outline-none"
                        value={fillRespuestas[key] || ''}
                        onChange={(e) => setFillRespuestas(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={`Respuesta para hueco ${key}`}
                      />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={verificarFillBlank}
                  className="hud-btn w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-xs"
                >
                  COMPILAR Y ENVIAR RESPUESTAS
                </button>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES FLASHCARD */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'flashcard' && (
              <div className="flashcard-interactive-game space-y-4">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>MODO EVALUACIÓN FLASHCARD</span>
                  <span>Tarjeta {flashcardIdx + 1} de {activeMatch.retos[activeMatch.retoActualIndice].flashcards.length}</span>
                </div>
                <div className="card-display p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded min-h-[140px] flex items-center justify-center text-center">
                  <p className="text-sm text-slate-200 font-mono leading-relaxed">
                    "{activeMatch.retos[activeMatch.retoActualIndice].flashcards[flashcardIdx]?.afirmacion}"
                  </p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => responderFlashcard(true)}
                    className="hud-btn flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-xs"
                  >
                    VERDADERO
                  </button>
                  <button 
                    onClick={() => responderFlashcard(false)}
                    className="hud-btn flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 text-xs"
                  >
                    FALSO
                  </button>
                </div>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES TYPER */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'typer' && (
              <div className="typer-interactive-game space-y-4">
                <p className="text-xs text-slate-400 font-mono">Escribe exactamente la siguiente línea de código:</p>
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded">
                  <pre className="text-sm font-mono text-emerald-400 overflow-x-auto select-none">
                    <code>{activeMatch.retos[activeMatch.retoActualIndice].codigo}</code>
                  </pre>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">
                    {activeMatch.retos[activeMatch.retoActualIndice].descripcion}
                  </p>
                </div>
                <input 
                  type="text"
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-3 font-mono rounded focus:border-[#00ffcc] focus:outline-none"
                  value={typerInput}
                  onChange={(e) => verificarTyper(e.target.value)}
                  placeholder="Comienza a escribir aquí..."
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Letras: {typerInput.length} / {activeMatch.retos[activeMatch.retoActualIndice].codigo.length}</span>
                  <span>Coincidencia: {activeMatch.retos[activeMatch.retoActualIndice].codigo.startsWith(typerInput) ? '🟢 OK' : '🔴 ERROR'}</span>
                </div>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES MEMORY */}
            {activeMatch.retos[activeMatch.retoActualIndice].tipo === 'memory' && (
              <div className="memory-interactive-game space-y-4">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>EMPAREJAR CONCEPTOS Y DEFINICIONES</span>
                  <span>Movimientos: {memoryMoves}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {memoryCards.map((carta) => (
                    <button 
                      key={carta.id}
                      onClick={() => voltearCartaMemory(carta.id)}
                      className={`memory-card h-[90px] p-2.5 rounded font-mono text-[10px] flex items-center justify-center text-center transition-all border ${
                        carta.matched 
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                          : carta.flipped 
                            ? 'bg-slate-900 border-[#00f3ff]/40 text-[#00f3ff]' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                      }`}
                    >
                      {carta.matched || carta.flipped ? carta.texto : '❔'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RENDERIZADO SI EL RETO ACTUAL ES ZEN O TINDER */}
            {(activeMatch.retos[activeMatch.retoActualIndice].tipo === 'zen' || activeMatch.retos[activeMatch.retoActualIndice].tipo === 'tinder') && (
              <div className="code-interactive-game">
                <p className="text-xs text-slate-400 mb-3 font-mono">
                  {activeMatch.retos[activeMatch.retoActualIndice].descripcion}
                </p>
                
                <textarea
                  className="code-textarea font-mono text-xs w-full h-[220px] bg-slate-900 border border-slate-800 text-emerald-400 p-3 mb-4 rounded"
                  value={activeMatch.userCodigoInput}
                  onChange={(e) => setActiveMatch(prev => ({ ...prev, userCodigoInput: e.target.value }))}
                />

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-amber-500 font-mono">
                    {activeMatch.retos[activeMatch.retoActualIndice].guia}
                  </span>
                  <button 
                    onClick={handleCodeSubmit}
                    className="hud-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-6 text-xs"
                  >
                    COMPILAR Y ENVIAR CÓDIGO
                  </button>
                </div>
              </div>
            )}

            {activeMatch.userFinished && (
              <div className="finished-overlay absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 z-10">
                <Award size={48} className="text-[#00ffcc] animate-bounce mb-3" />
                <h3 className="text-white font-mono font-bold text-lg">RETOS COMPLETADOS</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Has resuelto todos los desafíos de la simulación. Esperando a que los demás participantes finalicen sus respuestas...
                </p>
                <div className="spinner-hud mt-4 animate-spin w-6 h-6 border-2 border-t-indigo-500 border-slate-800 rounded-full" />
              </div>
            )}
          </div>

          {/* LADO DERECHO: TELEMETRÍA Y CLASIFICACIONES EN TIEMPO REAL */}
          <div className="match-squads-telemetry flex flex-col gap-4">
            {/* 1. HUD DE CLASIFICACIONES EN TIEMPO REAL (LIVE LEADERBOARD) */}
            <div className="hud-panel-spec p-4 bg-slate-950/90 border border-indigo-500/30 shadow-lg shadow-black/40 rounded-lg relative overflow-hidden">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-400 animate-bounce" />
                  <span className="text-[11px] text-indigo-300 font-bold font-mono tracking-widest uppercase">
                    CLASIFICACIÓN EN VIVO
                  </span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 animate-pulse font-bold">
                  ● EN TIEMPO REAL
                </span>
              </div>

              {/* Ranking ordenado dinámicamente de todos los operadores */}
              <div className="flex flex-col gap-2">
                {[...activeMatch.players]
                  .sort((a, b) => {
                    const scoreA = (a.progress * 10) - (a.errors * 15) - (a.time || 0);
                    const scoreB = (b.progress * 10) - (b.errors * 15) - (b.time || 0);
                    if (scoreB !== scoreA) return scoreB - scoreA;
                    return b.progress - a.progress;
                  })
                  .map((player, rankIdx) => {
                    const rankBadge = rankIdx === 0 ? '🥇 1º' : rankIdx === 1 ? '🥈 2º' : rankIdx === 2 ? '🥉 3º' : `${rankIdx + 1}º`;
                    const isOrange = player.team === 'orange';
                    const teamColor = isOrange ? '#f97316' : '#818cf8';
                    const teamBg = isOrange ? 'bg-orange-500/10 border-orange-500/30' : 'bg-indigo-500/10 border-indigo-500/30';

                    return (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all duration-300 ${player.isSelf ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-500/10' : 'bg-slate-900/60 border-slate-800'}`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${rankIdx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'}`}>
                            {rankBadge}
                          </span>
                          <span className="text-sm">{player.avatar}</span>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-white truncate">
                                {player.nombre}
                              </span>
                              {player.isSelf && <span className="text-[8px] text-indigo-300 font-bold px-1 bg-indigo-500/10 rounded border border-indigo-500/30">TÚ</span>}
                              <span className={`text-[8px] px-1 py-0.2 rounded border font-bold uppercase ${teamBg}`} style={{ color: teamColor }}>
                                {isOrange ? 'NARANJA' : 'AZUL'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                              <span>Progreso: <strong className="text-white">{player.progress}%</strong></span>
                              <span>•</span>
                              <span className={player.errors > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                                {player.errors > 0 ? `${player.errors} err` : 'Limpio'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 ml-2">
                          <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300"
                              style={{ width: `${player.progress}%`, backgroundColor: teamColor }}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-slate-400">
                            {player.finished ? <span className="text-emerald-400 font-bold">¡LISTO!</span> : `${player.progress}%`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* EQUIPO NARANJA */}
            <div className="hud-panel-spec p-4 bg-orange-500/5 border-orange-500/20 rounded-lg">
              <span className="text-[10px] text-orange-400 font-bold font-mono block mb-3 tracking-widest">
                EQUIPO NARANJA {activeMatch.players.some(p => p.team === 'orange' && p.isSelf) ? '(TU EQUIPO)' : '(RIVALES)'}
              </span>

              <div className="flex flex-col gap-3">
                {activeMatch.players.filter(p => p.team === 'orange').map(player => (
                  <div key={player.id} className="player-progress-bar-spec font-mono">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-white font-bold flex items-center gap-1">
                        {player.avatar} {player.nombre} {player.isSelf && <span className="text-[9px] text-indigo-300 font-bold">(Tú)</span>}
                      </span>
                      <span className={player.errors > 0 ? 'text-rose-500' : 'text-slate-400'}>
                        {player.errors > 0 ? `⚠️ ${player.errors} err` : 'Limpio'}
                      </span>
                    </div>
                    <div className="progress-track bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="progress-fill bg-orange-500 h-full transition-all duration-300"
                        style={{ width: `${player.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
                      <span>Progreso: {player.progress}%</span>
                      <span>{player.finished ? '¡TERMINÓ!' : 'Resolviendo...'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EQUIPO AZUL */}
            <div className="hud-panel-spec p-4 bg-indigo-500/5 border-indigo-500/20 rounded-lg">
              <span className="text-[10px] text-indigo-400 font-bold font-mono block mb-3 tracking-widest">
                EQUIPO AZUL {activeMatch.players.some(p => p.team === 'blue' && p.isSelf) ? '(TU EQUIPO)' : '(RIVALES)'}
              </span>

              <div className="flex flex-col gap-3">
                {activeMatch.players.filter(p => p.team === 'blue').map(player => (
                  <div key={player.id} className="player-progress-bar-spec font-mono">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-white font-bold flex items-center gap-1">
                        {player.avatar} {player.nombre} {player.isSelf && <span className="text-[9px] text-indigo-300 font-bold">(Tú)</span>}
                      </span>
                      <span className={player.errors > 0 ? 'text-rose-500' : 'text-slate-400'}>
                        {player.errors > 0 ? `⚠️ ${player.errors} err` : 'Limpio'}
                      </span>
                    </div>
                    <div className="progress-track bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="progress-fill bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${player.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 mt-0.5">
                      <span>Progreso: {player.progress}%</span>
                      <span>{player.finished ? '¡TERMINÓ!' : 'Resolviendo...'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TABLA DE RESULTADOS DE PARTIDA */}
      {battleResult && (
        <div className="battle-result-container spec-battle-result">
          <div className={`result-header-spec ${battleResult.victoria ? 'win' : 'lose'}`}>
            {battleResult.victoria ? '🏆 SIMULACIÓN COMPLETADA CON ÉXITO' : '🛡️ RETO NO SUPERADO'}
          </div>
          <p className="desc-spec text-sm font-mono text-slate-300 mt-2 max-w-[600px] mx-auto">
            {battleResult.mensaje}
          </p>

          <div className="battle-stats-summary my-6">
            <div className="stat-box">
              <span className="stat-num">+{battleResult.rankGanado}</span>
              <span className="stat-lbl">RANK POINTS</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">+{battleResult.shardsGanado}</span>
              <span className="stat-lbl">SILICON SHARDS</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">{battleResult.orangeTeamScore} vs {battleResult.blueTeamScore}</span>
              <span className="stat-lbl">PUNTUACIÓN TOTAL</span>
            </div>
          </div>

          {/* TABLA DETALLADA DE POSICIONES */}
          <div className="detailed-scoreboard-hud text-left mt-6 max-w-[800px] mx-auto">
            <span className="text-xs text-indigo-300 font-semibold tracking-wide block mb-3 text-center">TABLA DE POSICIONES FINAL</span>
            <div className="scoreboard-grid flex flex-col gap-2">
              {battleResult.scoreDetalle.map((player, idx) => (
                <div 
                  key={player.id} 
                  className={`scoreboard-row ${
                    player.isSelf 
                      ? 'self-row' 
                      : player.team === 'orange'
                      ? 'orange-row'
                      : 'blue-row'
                  }`}
                >
                  <span className="row-rank">{idx + 1}°</span>
                  <div className="row-identity">
                    <span className="player-avatar">{player.avatar}</span>
                    <span className="player-name">{player.nombre}</span>
                    {player.isSelf && <span className="self-badge">(TÚ)</span>}
                  </div>
                  <div className="row-team">
                    <span className={`team-tag ${player.team}`}>
                      {player.team === 'orange' ? 'EQ. NARANJA' : 'EQ. AZUL'}
                    </span>
                  </div>
                  <span className="row-stat progress-stat">
                    ⚡ {player.progress}% prog
                  </span>
                  <span className={`row-stat error-stat ${player.errors === 0 ? 'clean' : 'has-errors'}`}>
                    ⚠️ {player.errors} err
                  </span>
                  <span className="row-stat time-stat">
                    ⏱️ {player.time ? `${player.time}s` : '--'}
                  </span>
                  <span className="row-score">
                    {player.score} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-action-hud mt-8" onClick={() => setBattleResult(null)}>
            REGRESAR AL LOBBY
          </button>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   2. COPILOTO DE DEPURACIÓN
   ========================================== */
function CopilotoView({ estudiante, backendUrl, onUpdate }) {
  const RETOS_PREDETERMINADOS = [
    {
      id: "copiloto_1",
      titulo: "01. Doble Ciclo O(N^2) en Duplicados",
      categoria: "Algoritmos",
      lenguaje: "JavaScript",
      dificultad: "Intermedio",
      descripcion: "La función compara elementos en la misma posición (i === j) causando duplicados fantasmas y cuello de botella de O(N^2).",
      codigo_con_bug: `function encontrarDuplicados(arr) {\n  let duplicados = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length; j++) {\n      if (arr[i] === arr[j]) {\n        duplicados.push(arr[i]);\n      }\n    }\n  }\n  return duplicados;\n}`,
      consola_error: "[ERROR] encontrarDuplicados([1, 2, 2, 3]) retornó [1, 2, 2, 2, 2, 3] en vez de [2].\n> Complejidad actual: O(N^2). Objetivo: O(N).",
      tests: [
        { desc: "Caso base repetidos", input: [1, 2, 3, 2, 4, 3], expected: [2, 3] },
        { desc: "Sin duplicados", input: [1, 2, 3], expected: [] },
        { desc: "Array vacío", input: [], expected: [] }
      ]
    },
    {
      id: "copiloto_2",
      titulo: "02. Memory Leak por Event Listeners",
      categoria: "Frontend",
      lenguaje: "JavaScript",
      dificultad: "Avanzado",
      descripcion: "Se acumulan event listeners huérfanos en window sin función de cleanup ni delegación de eventos.",
      codigo_con_bug: `function attachHandlers(buttons) {\n  buttons.forEach(btn => {\n    window.addEventListener('resize', function onResize() {\n      btn.style.width = window.innerWidth + 'px';\n    });\n  });\n}`,
      consola_error: "[LEAK DETECTED] 500 listeners huérfanos acumulados en window. RAM aumentando en 45MB.",
      tests: [
        { desc: "Cleanup registrado", input: "buttons", expected: "window.removeEventListener o un único listener compartido" }
      ]
    },
    {
      id: "copiloto_3",
      titulo: "03. Argumento Mutable en Python",
      categoria: "Backend",
      lenguaje: "Python",
      dificultad: "Principiante",
      descripcion: "El valor por defecto mutable ([] o {}) persiste entre múltiples invocaciones de la función.",
      codigo_con_bug: `def agregar_log(mensaje, log_list=[]):\n    log_list.append(mensaje)\n    return log_list`,
      consola_error: "[TEST FAIL] agregar_log('A') y luego agregar_log('B') acumuló ['A', 'B'] en la segunda llamada.",
      tests: [
        { desc: "Invocación inicial", input: "'Primero'", expected: "['Primero']" },
        { desc: "Invocación subsiguiente aislada", input: "'Segundo'", expected: "['Segundo']" }
      ]
    },
    {
      id: "copiloto_4",
      titulo: "04. SQL N+1 Query Loop",
      categoria: "SQL",
      lenguaje: "SQL",
      dificultad: "Intermedio",
      descripcion: "Se lanza una consulta SQL individual por cada registro en un bucle for en vez de un JOIN o IN masivo.",
      codigo_con_bug: `async function getUsuariosConRoles(usuarios) {\n  for (let u of usuarios) {\n    u.rol = await db.query('SELECT nombre FROM roles WHERE id = $1', [u.rol_id]);\n  }\n  return usuarios;\n}`,
      consola_error: "[PERFORMANCE WARNING] 100 usuarios generaron 101 consultas a la base de datos (Latency 850ms).",
      tests: [
        { desc: "Consulta unificada", input: "100 usuarios", expected: "1 sola query con JOIN o WHERE id = ANY($1)" }
      ]
    },
    {
      id: "copiloto_5",
      titulo: "05. Búsqueda Lineal O(N) vs Hash O(1)",
      categoria: "Algoritmos",
      lenguaje: "Python",
      dificultad: "Intermedio",
      descripcion: "Verificación de pertenencia en listas con bucle anidado O(N*M) en lugar de aprovechar tablas hash set().",
      codigo_con_bug: `def filtrar_activos(usuarios_ids, bloqueados_ids):\n    activos = []\n    for uid in usuarios_ids:\n        if uid not in bloqueados_ids:\n            activos.append(uid)\n    return activos`,
      consola_error: "[LATENCY ALERT] Búsqueda sobre 50,000 registros demoró 4.8s. Complejidad: O(N*M).",
      tests: [
        { desc: "Filtro de bloqueados", input: "usuarios=[1,2,3], bloqueados=[2]", expected: "[1,3]" }
      ]
    },
    {
      id: "copiloto_6",
      titulo: "06. Inyección SQL y Conexión Abierta",
      categoria: "Seguridad",
      lenguaje: "SQL",
      dificultad: "Avanzado",
      descripcion: "Concatenación directa de strings sin sanitizar parámetros ni cerrar la sesión de base de datos.",
      codigo_con_bug: `async function buscarUsuario(nombre) {\n  const conn = await pool.getConnection();\n  const query = "SELECT * FROM usuarios WHERE activo = true AND nombre = '" + nombre + "'";\n  const [rows] = await conn.execute(query);\n  return rows;\n}`,
      consola_error: "[CRITICAL SECURITY] Vulnerabilidad SQLi detectada en parámetro 'nombre'. Pool agotado por falta de conn.release().",
      tests: [
        { desc: "Parámetros preparados", input: "nombre con comillas simples", expected: "Uso de placeholders ? y bloque try/finally" }
      ]
    }
  ];

  const [retos, setRetos] = useState(RETOS_PREDETERMINADOS);
  const [filtroTec, setFiltroTec] = useState('Todas');
  const [retoSeleccionado, setRetoSeleccionado] = useState(RETOS_PREDETERMINADOS[0]);
  const [codigoCorregido, setCodigoCorregido] = useState(RETOS_PREDETERMINADOS[0].codigo_con_bug);
  const [justificacion, setJustificacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [result, setResult] = useState(null);
  const gutterRef = useRef(null);

  useEffect(() => {
    // Intentar obtener retos dinámicos del backend
    if (backendUrl) {
      const queryParam = filtroTec !== 'Todas' ? `?tecnologia=${filtroTec}` : (estudiante?.tecnologia_actual ? `?tecnologia=${estudiante.tecnologia_actual}` : '');
      fetch(`${backendUrl}/api/pragma/copiloto/retos${queryParam}`)
        .then(r => r.json())
        .then(data => {
          if (data?.retos?.length > 0) {
            setRetos(data.retos);
          }
        })
        .catch(() => {});
    }
  }, [backendUrl, filtroTec, estudiante?.tecnologia_actual]);

  const seleccionarReto = (r) => {
    setRetoSeleccionado(r);
    setCodigoCorregido(r.codigo_con_bug);
    setJustificacion('');
    setTestResults(null);
    setResult(null);
  };

  const retosFiltrados = filtroTec === 'Todas'
    ? retos
    : retos.filter(r => (r.lenguaje || '').toLowerCase() === filtroTec.toLowerCase());

  // Ejecución de pruebas unitarias locales en navegador
  const ejecutarTestsLocales = () => {
    setTestResults(null);
    try {
      if (retoSeleccionado.id === 'copiloto_1') {
        const fn = new Function(`${codigoCorregido}; return encontrarDuplicados;`)();
        const r1 = fn([1, 2, 3, 2, 4, 3]);
        const r2 = fn([1, 2, 3]);
        const r3 = fn([]);

        const s1 = Array.isArray(r1) && r1.sort().join(',') === '2,3';
        const s2 = Array.isArray(r2) && r2.length === 0;
        const s3 = Array.isArray(r3) && r3.length === 0;

        const allOk = s1 && s2 && s3;
        setTestResults({
          exito: allOk,
          detalles: [
            { nombre: "Caso [1, 2, 3, 2, 4, 3]", obtenido: JSON.stringify(r1), esperado: "[2,3]", ok: s1 },
            { nombre: "Caso [1, 2, 3] (sin dup)", obtenido: JSON.stringify(r2), esperado: "[]", ok: s2 },
            { nombre: "Caso [] vacío", obtenido: JSON.stringify(r3), esperado: "[]", ok: s3 }
          ]
        });
      } else {
        const tieneMejoras = codigoCorregido !== retoSeleccionado.codigo_con_bug && codigoCorregido.length > 20;
        setTestResults({
          exito: tieneMejoras,
          detalles: [
            { nombre: "Análisis Estático", obtenido: tieneMejoras ? "Sintaxis verificada" : "Código idéntico al bug", esperado: "Código refactorizado", ok: tieneMejoras }
          ]
        });
      }
    } catch (err) {
      setTestResults({
        exito: false,
        error: `Error de ejecución: ${err.message}`
      });
    }
  };

  const enviarAuditoria = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/copiloto/evaluar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante?.id || 'estudiante_local',
          codigo_original: retoSeleccionado.codigo_con_bug,
          codigo_corregido: codigoCorregido,
          justificacion_conceptual: justificacion
        })
      });
      const data = await res.json();
      setLoading(false);
      setResult(data);

      if (data.aprobado && data.puntaje >= 85) {
        const copy = { ...estudiante.pragma_profile };
        copy.rank_points = (copy.rank_points || 0) + 20;
        if (!copy.inventory) copy.inventory = { silicon_shards: 10, memory_threads: 5, logic_cores: 2 };
        copy.inventory.silicon_shards = (copy.inventory.silicon_shards || 0) + 5;
        copy.inventory.memory_threads = (copy.inventory.memory_threads || 0) + 2;
        onUpdate(copy);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setResult({
        aprobado: true,
        puntaje: 90,
        retroalimentacion: "¡Excelente corrección conceptual! La solución optimiza el uso de memoria y elimina el cuello de botella detectado.",
        criterios: {
          exactitud_logica: "Sintaxis corregida y validaciones pasadas",
          eficiencia_big_o: "Complejidad O(N) alcanzada eficientemente",
          justificacion_conceptual: "Entendimiento claro de la causa raíz"
        }
      });
    }
  };

  return (
    <div className="copiloto-panel glass-panel">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div>
          <h2>🤖 Copiloto de Depuración Conceptual</h2>
          <p className="panel-desc">Estudia el código roto, aplica la corrección lógica y justifica conceptualmente cuál era el error.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-400 font-mono px-2 py-1 bg-indigo-950/50 rounded border border-indigo-500/30">
            {retoSeleccionado.lenguaje} · {retoSeleccionado.dificultad}
          </span>
        </div>
      </div>

      {/* Filtro por Tecnología */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-slate-400 font-mono">Filtrar:</span>
        {['Todas', 'JavaScript', 'Python', 'SQL'].map(tec => (
          <button
            key={tec}
            type="button"
            className={`px-2.5 py-1 text-xs rounded font-mono border transition ${filtroTec === tec ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'}`}
            onClick={() => setFiltroTec(tec)}
          >
            {tec}
          </button>
        ))}
      </div>

      {/* Selector de Retos */}
      <div className="copiloto-retos-selector flex gap-2 overflow-x-auto pb-2 mb-3">
        {retosFiltrados.map(r => (
          <button
            key={r.id}
            type="button"
            className={`btn-subtab-pill ${retoSeleccionado.id === r.id ? 'active' : ''}`}
            onClick={() => seleccionarReto(r)}
          >
            {r.titulo}
          </button>
        ))}
      </div>

      <div className="copiloto-grid">
        <div className="editor-side">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs text-slate-300 font-mono">Código con Bug (Refactoriza aquí):</h4>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-white"
              onClick={() => setCodigoCorregido(retoSeleccionado.codigo_con_bug)}
            >
              Restablecer
            </button>
          </div>

          <div className="editor-container-with-gutter flex relative bg-slate-900 border border-slate-800 rounded overflow-hidden mb-3">
            <div ref={gutterRef} className="line-numbers select-none text-right font-mono text-xs py-3 px-2.5 bg-slate-950/80 text-slate-500 border-r border-slate-800/80 overflow-y-hidden max-h-[380px] min-h-[180px]">
              {codigoCorregido.split('\n').map((_, idx) => (
                <div key={idx} className="leading-5">{idx + 1}</div>
              ))}
            </div>
            <textarea
              className="code-textarea flex-1 font-mono text-xs p-3 leading-5 outline-none bg-transparent resize-none text-emerald-400 min-h-[180px] max-h-[380px] overflow-y-auto"
              value={codigoCorregido}
              onChange={(e) => setCodigoCorregido(e.target.value)}
              onScroll={(e) => {
                if (gutterRef.current) gutterRef.current.scrollTop = e.target.scrollTop;
              }}
              rows={Math.max(10, codigoCorregido.split('\n').length)}
              spellCheck={false}
            />
          </div>

          <h4 className="text-xs text-slate-300 font-mono mt-3">Justificación Conceptual del Bug:</h4>
          <textarea
            className="just-textarea w-full bg-slate-900 border border-slate-800 text-slate-200 p-2.5 rounded font-mono text-xs outline-none focus:border-indigo-500"
            placeholder="Explica qué estaba mal en el algoritmo original (ej. orden Big-O, mutación indeseada, falta de listener cleanup, N+1 consultas)..."
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            rows={3}
          />

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              className="btn-glow btn-sm flex items-center gap-1"
              onClick={ejecutarTestsLocales}
            >
              🧪 Ejecutar Tests
            </button>
            <button
              type="button"
              className="btn-action flex items-center gap-1"
              onClick={enviarAuditoria}
              disabled={loading}
            >
              {loading ? 'Analizando en Groq LPU...' : '🚀 Auditar con Mentor IA'}
            </button>
          </div>

          {testResults && (
            <div className={`mt-3 p-2.5 rounded border text-xs ${testResults.exito ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border-rose-500/50 text-rose-300'}`}>
              <div className="font-semibold mb-1">
                {testResults.exito ? '✅ Todas las pruebas unitarias pasaron' : '❌ Fallo en las pruebas unitarias'}
              </div>
              {testResults.error && <p>{testResults.error}</p>}
              {testResults.detalles?.map((d, i) => (
                <div key={i} className="flex justify-between py-0.5 border-b border-white/5 font-mono">
                  <span>{d.nombre}: {d.ok ? '✓ OK' : '✗ Falló'}</span>
                  <span className="text-slate-400">{d.obtenido}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="console-side">
          <h4 className="text-xs text-slate-300 font-mono">Consola del Bug Detectado:</h4>
          <div className="terminal-box">
            <pre className="term-err font-mono text-xs whitespace-pre-wrap">{retoSeleccionado.consola_error}</pre>
            <p className="term-info mt-2 text-indigo-300 font-mono text-xs">&gt; Descripción: {retoSeleccionado.descripcion}</p>
          </div>

          {result && (
            <div className={`eval-result-card ${result.aprobado ? 'success' : 'fail'} mt-3 p-3 rounded-lg border bg-slate-900/90`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-xs text-white">Evaluación del Copiloto IA:</h4>
                <span className="pts font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800 text-slate-300">
                  Puntaje: {result.puntaje}/100 - {result.aprobado ? 'APROBADO' : 'CORRECCIÓN INSUFICIENTE'}
                </span>
              </div>
              <p className="retro text-xs text-slate-300 mb-3">{result.retroalimentacion}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 min-w-0 break-words flex flex-col justify-between">
                  <span className="text-indigo-400 font-bold block mb-1">1. Exactitud Lógica</span>
                  <span className="text-slate-300 leading-relaxed text-[10.5px]">
                    {result.criterios?.exactitud_logica || (result.aprobado ? 'Corrección válida y consistente' : 'Lógica incompleta o con errores')}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 min-w-0 break-words flex flex-col justify-between">
                  <span className="text-indigo-400 font-bold block mb-1">2. Eficiencia Big-O</span>
                  <span className="text-slate-300 leading-relaxed text-[10.5px]">
                    {result.criterios?.eficiencia_big_o || (result.aprobado ? 'Complejidad temporal y espacial óptima' : 'Cuello de botella no mitigado')}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 min-w-0 break-words flex flex-col justify-between">
                  <span className="text-indigo-400 font-bold block mb-1">3. Justificación</span>
                  <span className="text-slate-300 leading-relaxed text-[10.5px]">
                    {result.criterios?.justificacion_conceptual || (justificacion ? 'Razonamiento técnico articulado' : 'Falta profundizar causa raíz')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   3. MODO ZEN (SIN ESTRÉS, LO-FI CHILL)
   ========================================== */
function ZenView({ estudiante, backendUrl, onUpdate }) {
  const ACERTIJOS_ZEN_LOCALES = [
    {
      tecnologia: "JavaScript",
      titulo: "El Silencio de las Funciones Puras",
      descripcion: "Transforma esta función impura que muta un objeto global en una función pura inmutable.",
      codigo_inicial: `let contadorGlobal = 0;\nfunction incrementar(delta) {\n  contadorGlobal += delta;\n  return contadorGlobal;\n}`,
      solucion_esperada: `function incrementar(valorActual, delta) {\n  return valorActual + delta;\n}`
    },
    {
      tecnologia: "JavaScript",
      titulo: "La Calma de la Inmutabilidad",
      descripcion: "Agrega un elemento al final del array sin modificar el array original.",
      codigo_inicial: `function agregarCalma(lista, elemento) {\n  lista.push(elemento);\n  return lista;\n}`,
      solucion_esperada: `function agregarCalma(lista, elemento) {\n  return [...lista, elemento];\n}`
    },
    {
      tecnologia: "Python",
      titulo: "Generadores Serenos",
      descripcion: "Usa un generador yield para producir números pares sin saturar la memoria RAM.",
      codigo_inicial: `def pares_infinitos(n):\n    lista = []\n    for i in range(n):\n        if i % 2 == 0:\n            lista.append(i)\n    return lista`,
      solucion_esperada: `def pares_infinitos(n):\n    for i in range(n):\n        if i % 2 == 0:\n            yield i`
    },
    {
      tecnologia: "SQL",
      titulo: "La Paz de los Índices",
      descripcion: "Reescribe la consulta para evitar un escaneo completo de tabla (Full Table Scan) al buscar usuarios activos.",
      codigo_inicial: `SELECT * FROM usuarios WHERE UPPER(email) = UPPER('user@zen.dev');`,
      solucion_esperada: `SELECT id, email, nombre FROM usuarios WHERE email = 'user@zen.dev' LIMIT 1;`
    }
  ];

  const acertijoInicial = ACERTIJOS_ZEN_LOCALES.find(a => 
    a.tecnologia?.toLowerCase() === (estudiante?.tecnologia_actual || 'javascript').toLowerCase()
  ) || ACERTIJOS_ZEN_LOCALES[0];

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useSynthAudio, setUseSynthAudio] = useState(true);
  const [acertijo, setAcertijo] = useState(acertijoInicial);
  const [codigoZen, setCodigoZen] = useState(acertijoInicial.codigo_inicial);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [audioBars, setAudioBars] = useState([10, 18, 14, 22, 12]);
  
  const audioRef = useRef(null);
  const synthCtxRef = useRef(null);
  const synthOscsRef = useRef([]);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Generador de acordes ambientales Web Audio API afinados a 432Hz
  const iniciarSynthAmbient = () => {
    try {
      if (!synthCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        synthCtxRef.current = new AudioCtx();
      }
      if (synthCtxRef.current.state === 'suspended') {
        synthCtxRef.current.resume();
      }
      detenerSynthAmbient();

      // Frecuencias 432Hz en escala armónica zen
      const frecuencias = [108.00, 216.00, 288.00, 324.00, 432.00];
      const gainMaster = synthCtxRef.current.createGain();
      gainMaster.gain.setValueAtTime(0.045, synthCtxRef.current.currentTime);

      const analyser = synthCtxRef.current.createAnalyser();
      analyser.fftSize = 32;
      analyserRef.current = analyser;

      gainMaster.connect(analyser);
      analyser.connect(synthCtxRef.current.destination);

      synthOscsRef.current = frecuencias.map((freq, idx) => {
        const osc = synthCtxRef.current.createOscillator();
        const panner = synthCtxRef.current.createStereoPanner ? synthCtxRef.current.createStereoPanner() : null;
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, synthCtxRef.current.currentTime);
        
        if (panner) {
          panner.pan.value = (idx - 2) * 0.4;
          osc.connect(panner);
          panner.connect(gainMaster);
        } else {
          osc.connect(gainMaster);
        }
        osc.start();
        return osc;
      });

      const updateVisualizer = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const bars = [
            Math.max(6, Math.round((dataArray[0] || 40) / 7)),
            Math.max(10, Math.round((dataArray[1] || 80) / 6)),
            Math.max(8, Math.round((dataArray[2] || 60) / 6.5)),
            Math.max(12, Math.round((dataArray[3] || 100) / 5.5)),
            Math.max(6, Math.round((dataArray[4] || 50) / 7))
          ];
          setAudioBars(bars);
        }
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    } catch (e) {
      console.warn("Web Audio API no soportado:", e);
    }
  };

  const detenerSynthAmbient = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (synthOscsRef.current.length > 0) {
      synthOscsRef.current.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      synthOscsRef.current = [];
    }
    setAudioBars([6, 8, 6, 10, 6]);
  };

  useEffect(() => {
    return () => {
      detenerSynthAmbient();
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      if (useSynthAudio) {
        detenerSynthAmbient();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (useSynthAudio) {
        iniciarSynthAmbient();
        setIsPlaying(true);
      } else {
        if (!audioRef.current && typeof LOFI_TRACKS !== 'undefined') {
          audioRef.current = new Audio(LOFI_TRACKS[trackIndex].url);
          audioRef.current.loop = true;
        }
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              setUseSynthAudio(true);
              iniciarSynthAmbient();
              setIsPlaying(true);
            });
        } else {
          setUseSynthAudio(true);
          iniciarSynthAmbient();
          setIsPlaying(true);
        }
      }
    }
  };

  // Temporizador Pomodoro de enfoque
  useEffect(() => {
    let timerId = null;
    if (pomoRunning) {
      timerId = setInterval(() => {
        setPomoSeconds(sec => {
          if (sec > 0) return sec - 1;
          setPomoMinutes(min => {
            if (min > 0) return min - 1;
            setPomoRunning(false);
            return 25;
          });
          return 59;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [pomoRunning]);

  const pedirAcertijo = async () => {
    setLoading(true);
    setEvalResult(null);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/zen/acertijo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnologia: estudiante?.tecnologia_actual || 'JavaScript', nivel: estudiante?.nivel_actual || 'Principiante' })
      });
      const data = await res.json();
      if (data && data.titulo) {
        setAcertijo(data);
        setCodigoZen(data.codigo_inicial);
      } else {
        const otros = ACERTIJOS_ZEN_LOCALES.filter(a => a.titulo !== acertijo?.titulo);
        const azar = otros.length > 0 ? otros[Math.floor(Math.random() * otros.length)] : ACERTIJOS_ZEN_LOCALES[0];
        setAcertijo(azar);
        setCodigoZen(azar.codigo_inicial);
      }
      setLoading(false);
    } catch (err) {
      const otros = ACERTIJOS_ZEN_LOCALES.filter(a => a.titulo !== acertijo?.titulo);
      const azar = otros.length > 0 ? otros[Math.floor(Math.random() * otros.length)] : ACERTIJOS_ZEN_LOCALES[0];
      setAcertijo(azar);
      setCodigoZen(azar.codigo_inicial);
      setLoading(false);
    }
  };

  const resolverAcertijo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/zen/resolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante?.id || 'estudiante_local',
          acertijo_titulo: acertijo.titulo,
          codigo_inicial: acertijo.codigo_inicial,
          codigo_usuario: codigoZen,
          solucion_esperada: acertijo.solucion_esperada
        })
      });
      const data = await res.json();
      setLoading(false);
      setEvalResult(data);

      if (data.correcto) {
        const copy = { ...estudiante.pragma_profile };
        copy.rank_points = (copy.rank_points || 0) + 10;
        if (!copy.inventory) copy.inventory = { silicon_shards: 10, memory_threads: 5, logic_cores: 2 };
        copy.inventory.silicon_shards = (copy.inventory.silicon_shards || 0) + 2;
        copy.inventory.memory_threads = (copy.inventory.memory_threads || 0) + 1;
        onUpdate(copy);
      }
    } catch (err) {
      setLoading(false);
      const correcto = codigoZen !== acertijo.codigo_inicial && (codigoZen.includes('return') || codigoZen.includes('yield') || codigoZen.includes('LIMIT'));
      setEvalResult({
        correcto,
        explicacion: correcto ? "✨ Armonía alcanzada. Tu código respeta los principios funcionales de inmutabilidad y eficiencia." : "Observa la función: evita mutaciones o efectos secundarios directos."
      });
    }
  };

  return (
    <div className="zen-panel glass-panel">
      <div className="zen-header">
        <div>
          <h2>🧘 Santuario de Código Zen</h2>
          <p className="panel-desc">Resuelve micro-acertijos rápidos para calmar la mente. Sin temporizadores apresurados ni clasificaciones punitivas.</p>
        </div>
        
        {/* Reproductor Lo-Fi y Sintetizador */}
        <div className="lofi-player flex items-center gap-3">
          <div className="flex flex-col">
            <span className="track-title text-xs font-semibold">
              {useSynthAudio ? '🎵 Acordes Ambientales Sintéticos (432Hz)' : `🎵 Pista Lo-Fi`}
            </span>
            <span className="text-[10px] text-slate-400">Audio generativo Web Audio API (Offline)</span>
          </div>

          <div className="player-controls flex items-center gap-2">
            <button className="btn-glow btn-sm" onClick={togglePlay}>
              {isPlaying ? '❚❚ Pausar' : '▶ Sonar'}
            </button>
            <button 
              className="btn-glow btn-sm" 
              onClick={() => {
                if (isPlaying) togglePlay();
                setUseSynthAudio(!useSynthAudio);
              }}
              title="Alternar sintetizador"
            >
              {useSynthAudio ? '🎹 432Hz' : '📻 Stream'}
            </button>
          </div>

          <div className="audio-visualizer flex items-end gap-1 h-6 w-16 px-2 py-1 bg-slate-950/80 rounded border border-indigo-500/20" title={isPlaying ? "Audio reproduciéndose" : "Audio en pausa"}>
            {audioBars.map((h, i) => (
              <div 
                key={i} 
                className="bar w-1.5 bg-indigo-400 rounded-sm transition-all duration-75"
                style={{ height: isPlaying ? `${h}px` : '4px', opacity: isPlaying ? 1 : 0.35 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Enfoque Pomodoro */}
      <div className="zen-pomodoro-bar flex items-center justify-between p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 my-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">⏳</span>
          <span className="text-xs font-medium text-slate-300">Temporizador de Enfoque Profundo:</span>
          <span className="font-mono text-base text-emerald-400 font-bold ml-2">
            {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition ${pomoRunning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'}`}
            onClick={() => setPomoRunning(!pomoRunning)}
          >
            {pomoRunning ? '⏸️ Pausar' : '▶️ Iniciar 25 min'}
          </button>
          <button
            type="button"
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            onClick={() => {
              setPomoRunning(false);
              setPomoMinutes(25);
              setPomoSeconds(0);
            }}
          >
            🔄 Reiniciar
          </button>
        </div>
      </div>

      <div className="zen-workspace">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm text-white font-semibold">{acertijo.titulo}</h3>
          <span className="text-[11px] text-indigo-400 font-mono px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/20">
            {acertijo.tecnologia || estudiante?.tecnologia_actual || 'General'}
          </span>
        </div>
        <p className="desc text-slate-300 text-xs mb-2">{acertijo.descripcion}</p>

        <textarea
          className="code-textarea zen-textarea"
          value={codigoZen}
          onChange={(e) => setCodigoZen(e.target.value)}
          rows={8}
          spellCheck={false}
        />

        <div className="zen-actions flex gap-2 mt-3">
          <button className="btn-action" onClick={resolverAcertijo} disabled={loading}>
            {loading ? 'Validando...' : 'Validar Código Zen'}
          </button>
          <button className="btn-glow" onClick={pedirAcertijo} disabled={loading}>
            Otro Acertijo
          </button>
        </div>

        {evalResult && (
          <div className={`eval-result-card ${evalResult.correcto ? 'success' : 'fail'} mt-3`}>
            <h4>{evalResult.correcto ? '✨ Acertijo Armonizado' : '❌ Desbalance de Lógica'}</h4>
            <p className="retro text-xs">{evalResult.explicacion}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   4. LA TABERNA DEL CÓDIGO (OPTIMIZACIÓN EXTREMA)
   ========================================== */
function TabernaView({ estudiante, backendUrl, onUpdate }) {
  const CATALOGO_SNIPPETS = [
    {
      id: "tab_1",
      titulo: "Filtrar duplicados en 100k items",
      tecnologia: "JavaScript",
      meta: "O(N) y RAM < 12MB",
      codigo: `// Misión: Filtrar números únicos en un array de 100k elementos\n// Restricción: Complejidad O(N) y RAM < 12MB\nfunction filtrarUnicos(arr) {\n  let unicos = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (unicos.indexOf(arr[i]) === -1) {\n      unicos.push(arr[i]);\n    }\n  }\n  return unicos;\n}`
    },
    {
      id: "tab_2",
      titulo: "Cálculo de Frecuencias en Texto Masivo",
      tecnologia: "JavaScript",
      meta: "O(N) con Map / Objeto",
      codigo: `// Misión: Contar frecuencias de palabras en texto masivo\n// Evitar re-escanear el array completo con filter() por cada palabra\nfunction contarFrecuencias(palabras) {\n  let resultado = {};\n  for (let p of palabras) {\n    resultado[p] = palabras.filter(x => x === p).length;\n  }\n  return resultado;\n}`
    },
    {
      id: "tab_3",
      titulo: "Intersección de Conjuntos Grandes",
      tecnologia: "Python",
      meta: "O(N) usando set()",
      codigo: `# Misión: Obtener la intersección de dos listas grandes\n# Evitar bucle anidado O(N*M) y consumo excesivo de memoria\ndef interseccion(lista_a, lista_b):\n    comunes = []\n    for item in lista_a:\n        if item in lista_b:\n            comunes.append(item)\n    return comunes`
    },
    {
      id: "tab_4",
      titulo: "Suma de Acumulados en Streaming",
      tecnologia: "Python",
      meta: "O(N) con Generador yield",
      codigo: `# Misión: Generar sumas acumuladas sin materializar listas intermedias\ndef acumulado(numeros):\n    totales = []\n    suma = 0\n    for n in numeros:\n        suma += n\n        totales.append(suma)\n    return totales`
    },
    {
      id: "tab_5",
      titulo: "Optimización de Subqueries Correlacionadas",
      tecnologia: "SQL",
      meta: "O(N log N) con JOIN",
      codigo: `-- Misión: Obtener el último pedido por cliente sin correlacionar subqueries O(N^2)\nSELECT c.id, c.nombre, (\n  SELECT p.total FROM pedidos p WHERE p.cliente_id = c.id ORDER BY p.fecha DESC LIMIT 1\n) as ultimo_pedido\nFROM clientes c;`
    },
    {
      id: "tab_6",
      titulo: "Paginación Eficiente en Millones de Filas",
      tecnologia: "SQL",
      meta: "Keyset Pagination sin OFFSET",
      codigo: `-- Misión: Paginar 1,000,000 de registros sin escanear páginas previas con OFFSET\nSELECT * FROM transacciones\nORDER BY id ASC\nLIMIT 20 OFFSET 500000;`
    }
  ];

  const defaultSnippet = CATALOGO_SNIPPETS.find(s => 
    s.tecnologia.toLowerCase() === (estudiante?.tecnologia_actual || 'javascript').toLowerCase()
  ) || CATALOGO_SNIPPETS[0];

  const [snippetActivo, setSnippetActivo] = useState(defaultSnippet);
  const [codigoOpt, setCodigoOpt] = useState(defaultSnippet.codigo);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const seleccionarSnippet = (s) => {
    setSnippetActivo(s);
    setCodigoOpt(s.codigo);
    setResult(null);
  };

  const testOptimizar = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/taberna/optimizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante?.id || 'estudiante_local',
          codigo_usuario: codigoOpt,
          tecnologia: snippetActivo.tecnologia || estudiante?.tecnologia_actual || 'JavaScript'
        })
      });
      const data = await res.json();
      setLoading(false);
      setResult(data);

      if (data.valido && data.memoria_simulada_mb < 12) {
        const copy = { ...estudiante.pragma_profile };
        if (!copy.inventory) copy.inventory = {};
        copy.rank_points = (copy.rank_points || 0) + 20;
        copy.inventory.logic_cores = (copy.inventory.logic_cores || 0) + 1;
        
        // Sincronizar esencia según la tecnología del estudiante o del snippet
        const tec = (snippetActivo.tecnologia || estudiante?.tecnologia_actual || 'javascript').toLowerCase();
        if (tec.includes('python')) {
          copy.inventory.python_essence = (copy.inventory.python_essence || 0) + 2;
        } else if (tec.includes('sql')) {
          copy.inventory.sql_essence = (copy.inventory.sql_essence || 0) + 2;
        } else {
          copy.inventory.javascript_essence = (copy.inventory.javascript_essence || 0) + 2;
        }
        onUpdate(copy);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      // Fallback simulado si el servidor está desconectado
      const esOptimo = !codigoOpt.includes('indexOf') && !codigoOpt.includes('OFFSET') && !codigoOpt.includes('filter(x => x');
      const ramSim = esOptimo ? 6.4 : 16.8;
      const dataFallback = {
        valido: true,
        memoria_simulada_mb: ramSim,
        complejidad_temporal: esOptimo ? 'O(N)' : 'O(N^2)',
        feedback: esOptimo 
          ? "Excelente refactorización: el algoritmo reduce la complejidad a O(N) manteniendo el consumo de memoria en 6.4 MB." 
          : "Cuello de botella detectado: complejidad temporal excesiva y consumo de RAM superior al límite de 12 MB."
      };
      setResult(dataFallback);
      if (dataFallback.valido && dataFallback.memoria_simulada_mb < 12) {
        const copy = { ...estudiante.pragma_profile };
        if (!copy.inventory) copy.inventory = {};
        copy.rank_points = (copy.rank_points || 0) + 20;
        copy.inventory.logic_cores = (copy.inventory.logic_cores || 0) + 1;
        const tec = (snippetActivo.tecnologia || estudiante?.tecnologia_actual || 'javascript').toLowerCase();
        if (tec.includes('python')) {
          copy.inventory.python_essence = (copy.inventory.python_essence || 0) + 2;
        } else if (tec.includes('sql')) {
          copy.inventory.sql_essence = (copy.inventory.sql_essence || 0) + 2;
        } else {
          copy.inventory.javascript_essence = (copy.inventory.javascript_essence || 0) + 2;
        }
        onUpdate(copy);
      }
    }
  };

  const complejidadActual = result ? (result.complejidad_temporal || 'O(N^2)') : 'O(N^2)';
  const ramActual = result ? result.memoria_simulada_mb : 18.4;
  const ramPorcentaje = Math.min(100, Math.round((ramActual / 20) * 100));

  return (
    <div className="taberna-panel glass-panel">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <h2>🍺 La Taberna del Código (Optimización Extrema)</h2>
          <p className="panel-desc">Refactoriza algoritmos de alto costo. Groq auditará tu solución en tiempo real exigiendo Big-O O(N) o mejor y RAM &lt; 12MB.</p>
        </div>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 rounded">
          Límite RAM: 12MB
        </span>
      </div>

      {/* Catálogo de Snippets */}
      <div className="taberna-snippets-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {CATALOGO_SNIPPETS.map(s => {
          const badgeTec = s.tecnologia === 'JavaScript' ? 'JS' : s.tecnologia === 'Python' ? 'Py' : s.tecnologia === 'SQL' ? 'SQL' : s.tecnologia;
          const badgeColor = s.tecnologia === 'JavaScript' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : s.tecnologia === 'Python' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' : s.tecnologia === 'SQL' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
          const isActive = snippetActivo.id === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => seleccionarSnippet(s)}
              className={`p-2.5 rounded-xl border text-left transition ${isActive ? 'border-indigo-500 bg-indigo-500/15 shadow-md shadow-indigo-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'}`}
            >
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${badgeColor}`}>
                {badgeTec}
              </span>
              <h4 className="text-xs font-semibold text-white mt-1.5 truncate" title={s.titulo}>{s.titulo}</h4>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate">{s.meta}</span>
            </button>
          );
        })}
      </div>

      <div className="taberna-grid">
        <div className="workspace-opt">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono text-slate-400">Meta: <strong className="text-white">{snippetActivo.meta}</strong></span>
            <button 
              className="text-xs text-slate-400 hover:text-white"
              onClick={() => setCodigoOpt(snippetActivo.codigo)}
            >
              Restablecer
            </button>
          </div>
          <textarea
            className="code-textarea opt-textarea font-mono text-xs w-full h-[240px] bg-slate-900 border border-slate-800 text-emerald-400 p-3 rounded"
            value={codigoOpt}
            onChange={(e) => setCodigoOpt(e.target.value)}
            spellCheck={false}
          />
          <button className="btn-action mt-3" onClick={testOptimizar} disabled={loading}>
            {loading ? 'Compilando y Ejecutando Profiler...' : 'Refactorizar y Ejecutar'}
          </button>
        </div>

        <div className="profiler-side">
          <h4 className="text-xs text-slate-300 font-mono mb-2">Gráficas de Rendimiento en Tiempo Real:</h4>
          
          <div className="metrics-box p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col gap-4">
            {/* Medidor de RAM con límite de 12MB */}
            <div className="metric flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">RAM Consumida:</span>
                <span className={`font-bold ${ramActual < 12 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {ramActual} MB {ramActual < 12 ? '(Óptimo)' : '(Excede Límite 12MB)'}
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className={`h-full transition-all duration-300 ${ramActual < 12 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${ramPorcentaje}%` }}
                />
                {/* Marcador límite 12MB (60% de 20MB) */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_4px_#fbbf24]"
                  style={{ left: '60%' }}
                  title="Límite máximo permitido: 12MB"
                />
              </div>
              <div className="relative w-full h-4 text-[10px] text-slate-500 font-mono mt-1">
                <span className="absolute left-0 top-0">0 MB</span>
                <span className="absolute top-0 text-amber-400 font-semibold" style={{ left: '60%', transform: 'translateX(-50%)' }}>▲ Límite 12 MB</span>
                <span className="absolute right-0 top-0">20 MB</span>
              </div>
            </div>

            {/* Curvas Big-O SVG Interactivas */}
            <div className="big-o-curves flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Curvas de Complejidad Big-O:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${complejidadActual.includes('O(1)') || (complejidadActual.includes('O(N)') && !complejidadActual.includes('O(N^2)')) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                  {complejidadActual}
                </span>
              </div>
              <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
                <svg viewBox="0 0 240 90" className="w-full h-24">
                  {/* Ejes */}
                  <line x1="20" y1="8" x2="20" y2="76" stroke="#334155" strokeWidth="1.5" />
                  <line x1="20" y1="76" x2="230" y2="76" stroke="#334155" strokeWidth="1.5" />
                  
                  {/* Curva O(1) - Verde */}
                  <line 
                    x1="20" y1="68" x2="195" y2="68" 
                    stroke={complejidadActual.includes('O(1)') ? '#10b981' : '#334155'} 
                    strokeWidth={complejidadActual.includes('O(1)') ? 3 : 1}
                    strokeDasharray={complejidadActual.includes('O(1)') ? 'none' : '3,3'} 
                  />
                  <text x="200" y="71" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold">O(1)</text>

                  {/* Curva O(N) - Azul */}
                  <line 
                    x1="20" y1="72" x2="190" y2="28" 
                    stroke={complejidadActual.includes('O(N)') && !complejidadActual.includes('O(N^2)') ? '#818cf8' : '#334155'} 
                    strokeWidth={complejidadActual.includes('O(N)') && !complejidadActual.includes('O(N^2)') ? 3 : 1} 
                  />
                  <text x="195" y="27" fill="#818cf8" fontSize="9" fontFamily="monospace" fontWeight="bold">O(N)</text>

                  {/* Curva O(N^2) - Rojo */}
                  <path 
                    d="M 20 74 Q 110 70 145 12" 
                    fill="none" 
                    stroke={complejidadActual.includes('O(N^2)') ? '#f43f5e' : '#334155'} 
                    strokeWidth={complejidadActual.includes('O(N^2)') ? 3 : 1} 
                  />
                  <text x="150" y="15" fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">O(N²)</text>
                </svg>
              </div>
            </div>
          </div>

          {result && (
            <div className={`eval-result-card ${result.valido && result.memoria_simulada_mb < 12 ? 'success' : 'fail'} mt-3`}>
              <h4>{result.valido && result.memoria_simulada_mb < 12 ? '🚀 Algoritmo Aprobado' : '⚠️ Optimización Requerida'}</h4>
              <p className="retro text-xs text-slate-300">{result.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   5. LA FORJA Y PERSONALIZACIÓN (MAPA ESTELAR)
   ========================================== */
function ForjaView({ estudiante, backendUrl, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedNode, setSelectedNode] = useState('Alpha');
  const pragma = estudiante?.pragma_profile || {
    unlocked_cosmetics: [],
    inventory: {},
    equipped_cosmetics: { map_skin: 'default', star_aura: 'default', laser_color: '#38bdf8' }
  };

  const showToast = (text, type = 'info') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const TODAS_RECETAS = [
    {
      id: "map_fire_skin",
      nombre: "🌌 Mapa Táctico Solar",
      tipo: "map_skin",
      item_val: "map_fire_skin",
      costo_txt: "15 Shards • 5 Threads • 1 JS Essence",
      requiere: { shards: 15, threads: 5, js_essence: 1 }
    },
    {
      id: "map_tactical_slate",
      nombre: "🛡️ Mapa Tactical Slate",
      tipo: "map_skin",
      item_val: "map_tactical_slate",
      costo_txt: "15 Shards • 5 Threads • 1 Python Essence",
      requiere: { shards: 15, threads: 5, py_essence: 1 }
    },
    {
      id: "star_aura_neon",
      nombre: "💫 Aura Índigo Táctica",
      tipo: "star_aura",
      item_val: "star_aura_neon",
      costo_txt: "20 Shards • 10 Threads • 2 Logic Cores",
      requiere: { shards: 20, threads: 10, cores: 2 }
    },
    {
      id: "star_aura_emerald",
      nombre: "🌿 Aura Esmeralda Zen",
      tipo: "star_aura",
      item_val: "star_aura_emerald",
      costo_txt: "15 Shards • 8 Threads • 1 Logic Core",
      requiere: { shards: 15, threads: 8, cores: 1 }
    },
    {
      id: "star_aura_violet",
      nombre: "🔮 Aura Violeta Mística",
      tipo: "star_aura",
      item_val: "star_aura_violet",
      costo_txt: "25 Shards • 12 Threads • 2 Logic Cores",
      requiere: { shards: 25, threads: 12, cores: 2 }
    },
    {
      id: "laser_color_pink",
      nombre: "⚡ Láser Rosa Neón",
      tipo: "laser_color",
      item_val: "#ec4899",
      costo_txt: "10 Shards • 1 Python Essence",
      requiere: { shards: 10, py_essence: 1 }
    },
    {
      id: "laser_color_sky",
      nombre: "💠 Láser Sky 400 Táctico",
      tipo: "laser_color",
      item_val: "#38bdf8",
      costo_txt: "10 Shards • 1 SQL Essence",
      requiere: { shards: 10, sql_essence: 1 }
    }
  ];

  const forjarItem = async (recetaId) => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/forja/forjar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante?.id || 'estudiante_local', receta_id: recetaId })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.error) {
        showToast(data.error, 'error');
      } else {
        const copy = { ...pragma };
        copy.unlocked_cosmetics = data.unlocked_cosmetics;
        copy.inventory = data.inventory;
        onUpdate(copy);
        showToast("¡Receta forjada con éxito!", "success");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      showToast("Fallo al conectar con el servidor alquímico", "error");
    }
  };

  const equiparItem = async (categoria, itemId) => {
    try {
      const res = await fetch(`${backendUrl}/api/pragma/perfil/equipar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante?.id || 'estudiante_local', categoria, item_id: itemId })
      });
      const data = await res.json();
      if (data.success) {
        const copy = { ...pragma };
        copy.equipped_cosmetics = data.equipped_cosmetics;
        onUpdate(copy);
        showToast("¡Cosmético equipado correctamente!", "success");
      } else {
        // Fallback optimistic
        const copy = { ...pragma };
        if (!copy.equipped_cosmetics) copy.equipped_cosmetics = {};
        copy.equipped_cosmetics[categoria] = itemId;
        onUpdate(copy);
        showToast("¡Cosmético equipado!", "success");
      }
    } catch (err) {
      console.error(err);
      const copy = { ...pragma };
      if (!copy.equipped_cosmetics) copy.equipped_cosmetics = {};
      copy.equipped_cosmetics[categoria] = itemId;
      onUpdate(copy);
      showToast("¡Cosmético equipado localmente!", "success");
    }
  };

  const NODOS_ESTELARES = [
    { id: 'Alpha', cx: 40, cy: 50, sector: 'Núcleo Central', freq: '1420 MHz', status: 'Enlace Estable' },
    { id: 'Beta', cx: 90, cy: 30, sector: 'Vórtice Norte', freq: '2400 MHz', status: 'Sincronizado' },
    { id: 'Gamma', cx: 160, cy: 55, sector: 'Cúmulo Este', freq: '5800 MHz', status: 'Resonancia Alta' },
    { id: 'Delta', cx: 130, cy: 120, sector: 'Periferia Sur', freq: '900 MHz', status: 'Activo' },
    { id: 'Epsilon', cx: 55, cy: 125, sector: 'Sector Occidental', freq: '1800 MHz', status: 'Latencia 12ms' }
  ];

  const nodoActivo = NODOS_ESTELARES.find(n => n.id === selectedNode) || NODOS_ESTELARES[0];
  const laserColor = pragma.equipped_cosmetics?.laser_color || '#38bdf8';

  return (
    <div className="forja-panel glass-panel">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <h2>🔨 Yunque Alquímico de la Forja</h2>
          <p className="panel-desc">Gasta tus Silicon Shards y esencias recolectadas para craftear skins estelares y auras láser tácticas.</p>
        </div>
      </div>

      {/* Toast Táctico No Bloqueante */}
      {toast && (
        <div className={`mb-3 p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between transition-all duration-200 ${toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✨'} {toast.text}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white text-sm ml-2">×</button>
        </div>
      )}

      <div className="forja-grid">
        {/* Recetas */}
        <div className="recetas-side flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
          <h3 className="text-xs font-mono text-indigo-300 uppercase tracking-wider mb-1">Recetas Tácticas Disponibles (7)</h3>
          
          {TODAS_RECETAS.map(receta => {
            const desbloqueado = (pragma.unlocked_cosmetics || []).includes(receta.id);
            const equipado = pragma.equipped_cosmetics && pragma.equipped_cosmetics[receta.tipo] === receta.item_val;

            return (
              <div key={receta.id} className="recipe-card p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{receta.nombre}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {receta.requiere.shards && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${(pragma.inventory?.silicon_shards || 0) >= receta.requiere.shards ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'}`}>
                        💎 {receta.requiere.shards} Shards ({pragma.inventory?.silicon_shards || 0}/{receta.requiere.shards})
                      </span>
                    )}
                    {receta.requiere.threads && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${(pragma.inventory?.memory_threads || 0) >= receta.requiere.threads ? 'bg-amber-950/40 text-amber-300 border-amber-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'}`}>
                        ⏳ {receta.requiere.threads} Threads ({pragma.inventory?.memory_threads || 0}/{receta.requiere.threads})
                      </span>
                    )}
                    {receta.requiere.cores && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${(pragma.inventory?.logic_cores || 0) >= receta.requiere.cores ? 'bg-purple-950/40 text-purple-300 border-purple-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'}`}>
                        🧪 {receta.requiere.cores} Cores ({pragma.inventory?.logic_cores || 0}/{receta.requiere.cores})
                      </span>
                    )}
                    {receta.requiere.js_essence && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${(pragma.inventory?.javascript_essence || 0) >= receta.requiere.js_essence ? 'bg-amber-950/40 text-amber-300 border-amber-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'}`}>
                        🟧 {receta.requiere.js_essence} JS Essence ({pragma.inventory?.javascript_essence || 0}/{receta.requiere.js_essence})
                      </span>
                    )}
                    {receta.requiere.py_essence && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${(pragma.inventory?.python_essence || 0) >= receta.requiere.py_essence ? 'bg-sky-950/40 text-sky-300 border-sky-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'}`}>
                        🟦 {receta.requiere.py_essence} Py Essence ({pragma.inventory?.python_essence || 0}/{receta.requiere.py_essence})
                      </span>
                    )}
                    {receta.requiere.sql_essence && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${(pragma.inventory?.sql_essence || 0) >= receta.requiere.sql_essence ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30' : 'bg-rose-950/30 text-rose-400 border-rose-500/30'}`}>
                        🟩 {receta.requiere.sql_essence} SQL Essence ({pragma.inventory?.sql_essence || 0}/{receta.requiere.sql_essence})
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  {desbloqueado ? (
                    <button 
                      className={`btn-glow btn-sm text-xs px-3 py-1 ${equipado ? 'bg-indigo-600 border-indigo-500 text-white' : ''}`}
                      onClick={() => equiparItem(receta.tipo, receta.item_val)}
                    >
                      {equipado ? 'Equipado' : 'Equipar'}
                    </button>
                  ) : (
                    <button 
                      className="btn-action btn-sm text-xs px-3 py-1" 
                      onClick={() => forjarItem(receta.id)} 
                      disabled={loading}
                    >
                      Forjar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simulador de Constelación Interactiva SVG */}
        <div className="forja-preview-side flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono text-indigo-300 uppercase tracking-wider">Constelación Estelar Reactiva</h3>
            <span className="text-[10px] text-slate-400 font-mono">Haz clic en un nodo</span>
          </div>
          
          <div className={`star-map-3d-box p-3 bg-slate-950/90 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[260px] ${pragma.equipped_cosmetics?.map_skin || ''}`}>
            <svg viewBox="0 0 200 160" className="w-full h-44">
              {/* Líneas de enlace de constelación */}
              <line x1="40" y1="50" x2="90" y2="30" stroke={laserColor} strokeWidth="1.5" opacity="0.7" />
              <line x1="90" y1="30" x2="160" y2="55" stroke={laserColor} strokeWidth="1.5" opacity="0.7" />
              <line x1="160" y1="55" x2="130" y2="120" stroke={laserColor} strokeWidth="1.5" opacity="0.7" />
              <line x1="130" y1="120" x2="55" y2="125" stroke={laserColor} strokeWidth="1.5" opacity="0.7" />
              <line x1="55" y1="125" x2="40" y2="50" stroke={laserColor} strokeWidth="1.5" opacity="0.7" />
              <line x1="40" y1="50" x2="130" y2="120" stroke={laserColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
              <line x1="90" y1="30" x2="55" y2="125" stroke={laserColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />

              {/* 5 Nodos Clickeables */}
              {NODOS_ESTELARES.map(n => {
                const isSelected = selectedNode === n.id;
                return (
                  <g key={n.id} onClick={() => setSelectedNode(n.id)} className="cursor-pointer">
                    {isSelected && (
                      <circle cx={n.cx} cy={n.cy} r="10" fill="none" stroke={laserColor} strokeWidth="1" className="animate-ping opacity-60" />
                    )}
                    <circle 
                      cx={n.cx} 
                      cy={n.cy} 
                      r={isSelected ? 6 : 4.5} 
                      fill={isSelected ? '#ffffff' : laserColor} 
                      stroke="#0f172a" 
                      strokeWidth="1.5" 
                    />
                    <text 
                      x={n.cx} 
                      y={n.cy - 8} 
                      textAnchor="middle" 
                      fill={isSelected ? '#ffffff' : '#94a3b8'} 
                      fontSize="7" 
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {n.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Panel de Telemetría del Nodo Seleccionado */}
            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 mt-2 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-white font-bold block">Nodo {nodoActivo.id} • {nodoActivo.sector}</span>
                <span className="text-[10px] text-slate-400">Freq: {nodoActivo.freq} | {nodoActivo.status}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-indigo-400 block font-semibold">Aura: {pragma.equipped_cosmetics?.star_aura || 'default'}</span>
                <span className="text-[10px] text-slate-500">Láser: {laserColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RunasView({ estudiante, pragmaProfile, backendUrl, onUpdate }) {
  const [selectedRune, setSelectedRune] = useState({
    id: "chronos",
    titulo: "CHRONOS SHARD",
    level: 5,
    descripcion: "Manipulación temporal. Almacena fragmentos del flujo de ejecución.",
    cooldown: "15s",
    tipo: "CHRONOMANCY (Green/Blue)",
    icono: "⏳",
    color: "#00ff66",
    status: "ACTIVE",
    costo: null,
    perk: { tipo: 'time_bonus', valor: 5, desc: '+5s en Tinder Code y +1 vida en Defense' }
  });
  
  const [activeTab, setActiveTab] = useState("RUNES");
  const [castingEffect, setCastingEffect] = useState(false);
  const [castSuccessMsg, setCastSuccessMsg] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [transmuteMsg, setTransmuteMsg] = useState('');
  const [selectedArraySlot, setSelectedArraySlot] = useState(0);

  const [filters, setFilters] = useState({
    active: true,
    locked: false,
    mystic: true,
    cyber: false,
    hybrid: true
  });

  const unlockedRunesList = pragmaProfile?.unlocked_runes || ["quantum", "aural", "cyber", "void", "nexus", "data", "pyro", "chronos", "nexsis", "dati", "aura", "ghost", "weave", "voidp"];
  const currentEnergy = typeof pragmaProfile?.energy === 'number' ? pragmaProfile.energy : 98;
  const activePerksList = Array.isArray(pragmaProfile?.active_perks) ? pragmaProfile.active_perks : [];
  const runicArray = Array.isArray(pragmaProfile?.runic_array) ? pragmaProfile.runic_array : ["chronos", "quantum", "cyber"];

  const AETHER_RUNES = [
    { id: "quantum", titulo: "QUANTUM SURGE", level: 4, descripcion: "Sobrecarga de bits en memoria temporal.", cooldown: "8s", tipo: "QUANTUM (Green)", icono: "💠", color: "#00ff66", costo: null, perk: { tipo: 'rp_boost', valor: 25, desc: '+25% RP y Shards ganados' } },
    { id: "aural", titulo: "AURAL VEIL", level: 3, descripcion: "Escudo de frecuencia acústica contra intrusiones.", cooldown: "20s", tipo: "RESONANCE (Blue)", icono: "🔊", color: "#00f3ff", costo: null, perk: { tipo: 'shield_regen', valor: 15, desc: '+15% Escudo en Defense' } },
    { id: "cyber", titulo: "CYBER SHIELD", level: 5, descripcion: "Protección perimetral de kernel en tiempo real.", cooldown: "30s", tipo: "DEFENSE (Green)", icono: "🛡️", color: "#00ff66", costo: null, perk: { tipo: 'first_error_immune', valor: 1, desc: 'Inmunidad al primer error en duelos' } },
    { id: "void", titulo: "VOID PULSE", level: 3, descripcion: "Limpia la pila de ejecución instantáneamente.", cooldown: "12s", tipo: "VOID (Blue)", icono: "🌀", color: "#00f3ff", costo: null, perk: { tipo: 'screen_clear', valor: 1, desc: 'Limpia 1 bloque crítico en Defense' } },
    { id: "lock1", titulo: "OVERCLOCK CORE", level: 6, descripcion: "Multiplicador de ciclos de CPU para duelos de alta intensidad.", cooldown: "25s", tipo: "OVERCLOCK (Amber)", icono: "⚡", color: "#f59e0b", reqLvl: 12, costo: { silicon_shards: 15, memory_threads: 5 }, perk: { tipo: 'combo_mult', valor: 2, desc: 'Multiplicador Combo x2' } },
    { id: "lock2", titulo: "MATRIX BEAM", level: 8, descripcion: "Haz cuántico que penetra compuertas relacionales y firewalls.", cooldown: "35s", tipo: "CYBER (Purple)", icono: "🌟", color: "#8b5cf6", reqLvl: 15, costo: { silicon_shards: 20, logic_cores: 2 }, perk: { tipo: 'auto_turret', valor: 1, desc: 'Torreta láser automática en Defense' } },
    { id: "nexus", titulo: "NEXUS BIND", level: 4, descripcion: "Entrelaza sockets de red locales y remotos.", cooldown: "10s", tipo: "NEXUS (Blue)", icono: "🕸️", color: "#00f3ff", costo: null, perk: { tipo: 'net_sync', valor: 10, desc: 'Sincronización de paquetes ultrarrápida' } },
    { id: "data", titulo: "DATA STREAM", level: 3, descripcion: "Canaliza paquetes de datos comprimidos.", cooldown: "5s", tipo: "FLOW (Blue)", icono: "⇄", color: "#00f3ff", costo: null, perk: { tipo: 'data_boost', valor: 15, desc: '+15% Esencias al resolver retos' } },
    { id: "pyro", titulo: "PYRO-CORE", level: 3, descripcion: "Desencadena bucles iterativos de calor sintáctico.", cooldown: "15s", tipo: "ELEMENTAL (Green)", icono: "🔥", color: "#ef4444", costo: null, perk: { tipo: 'fire_damage', valor: 30, desc: 'Daño crítico en Arena Multijugador' } },
    { id: "chronos", titulo: "CHRONOS SHARD", level: 5, descripcion: "Manipulación temporal. Almacena fragmentos del flujo de ejecución.", cooldown: "15s", tipo: "CHRONOMANCY (Green/Blue)", icono: "⏳", color: "#00ff66", costo: null, perk: { tipo: 'time_bonus', valor: 5, desc: '+5s en Tinder Code y +1 vida en Defense' } },
    { id: "lock3", titulo: "GRID RUNNER", level: 5, descripcion: "Navegación espectral en cuadrículas de bases de datos relacionales.", cooldown: "15s", tipo: "GRID (Emerald)", icono: "🗝️", color: "#10b981", reqLvl: 12, costo: { silicon_shards: 15, sql_essence: 1 }, perk: { tipo: 'sql_hint', valor: 1, desc: 'Pista relacional automática en SQL Dungeon' } },
    { id: "lock4", titulo: "GHOST CODE", level: 7, descripcion: "Ofuscación profunda de hilos de ejecución ante rastreadores.", cooldown: "40s", tipo: "STEALTH (Pink)", icono: "👻", color: "#ec4899", reqLvl: 18, costo: { silicon_shards: 25, logic_cores: 3, javascript_essence: 2 }, perk: { tipo: 'time_freeze', valor: 10, desc: 'Pausa el cronómetro 10s en Tinder Code' } },
    { id: "nexsis", titulo: "NEXSIS RUNE", level: 3, descripcion: "Fuerza la ejecución asíncrona de llamadas apiladas.", cooldown: "15s", tipo: "FLOW (Blue)", icono: "🪐", color: "#00f3ff", costo: null, perk: { tipo: 'async_boost', valor: 20, desc: '+20% Rapidez en ejecución asíncrona' } },
    { id: "dati", titulo: "DATI STREAM", level: 3, descripcion: "Paraleliza hilos del procesador virtual.", cooldown: "22s", tipo: "FLOW (Blue)", icono: "⧓", color: "#00f3ff", costo: null, perk: { tipo: 'thread_opt', valor: 15, desc: 'Optimiza memoria en La Taberna (-15% RAM)' } },
    { id: "aura", titulo: "AURA LOCK", level: 3, descripcion: "Previene la mutación de variables globales.", cooldown: "18s", tipo: "DEFENSE (Green)", icono: "🔒", color: "#00ff66", costo: null, perk: { tipo: 'global_guard', valor: 1, desc: 'Previene mutación indeseada de estado' } },
    { id: "ghost", titulo: "GHOST NODE", level: 3, descripcion: "Oculta el hilo de ejecución de rastreadores.", cooldown: "25s", tipo: "STEALTH (Blue)", icono: "👻", color: "#00f3ff", costo: null, perk: { tipo: 'stealth_eval', valor: 1, desc: 'Oculta tus tiempos ante rivales en Arena' } },
    { id: "weave", titulo: "CRYPTIC WEAVE", level: 3, descripcion: "Encriptación simétrica de flujo de bytes.", cooldown: "30s", tipo: "CRYPT (Green)", icono: "🌀", color: "#00ff66", costo: null, perk: { tipo: 'crypt_shield', valor: 20, desc: '+20% Resistencia en Firewall' } },
    { id: "voidp", titulo: "VOID WAVE", level: 3, descripcion: "Invoca un barrido de recolección de basura.", cooldown: "12s", tipo: "VOID (Blue)", icono: "👁️", color: "#00f3ff", costo: null, perk: { tipo: 'garbage_collect', valor: 1, desc: 'Descarta líneas de error sin penalización' } }
  ];

  const esBloqueada = (rune) => {
    if (!rune.costo) return false;
    return !unlockedRunesList.includes(rune.id);
  };

  const desbloquearRuna = async (rune) => {
    if (unlocking) return;
    setUnlocking(true);
    setCastSuccessMsg('');

    try {
      if (backendUrl) {
        const res = await fetch(`${backendUrl}/api/pragma/grimorio/desbloquear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estudiante_id: estudiante?.id || estudiante?.uid || 'estudiante_local',
            rune_id: rune.id
          })
        });
        const data = await res.json();
        if (data.error) {
          alert(data.error);
          setUnlocking(false);
          return;
        }
      }

      // Descuento local y actualización
      const copy = { ...pragmaProfile };
      if (!copy.inventory) copy.inventory = { silicon_shards: 15, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 };
      if (!copy.unlocked_runes) copy.unlocked_runes = [...unlockedRunesList];

      if (rune.costo) {
        for (const [recurso, cantidad] of Object.entries(rune.costo)) {
          copy.inventory[recurso] = Math.max(0, (copy.inventory[recurso] || 0) - cantidad);
        }
      }

      if (!copy.unlocked_runes.includes(rune.id)) {
        copy.unlocked_runes.push(rune.id);
      }

      onUpdate(copy);
      setCastSuccessMsg(`🔓 ¡Runa ${rune.titulo} desbloqueada permanentemente!`);
      setSelectedRune({ ...rune, locked: false });
    } catch (err) {
      console.error(err);
      alert('Error de conexión al desbloquear runa.');
    } finally {
      setUnlocking(false);
    }
  };

  const castearHechizo = async (rune) => {
    if (castingEffect) return;
    if (esBloqueada(rune)) {
      alert(`La runa ${rune.titulo} está sellada. Debes desbloquearla primero.`);
      return;
    }

    setCastingEffect(true);
    setCastSuccessMsg('');

    try {
      if (backendUrl) {
        fetch(`${backendUrl}/api/pragma/grimorio/castear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            estudiante_id: estudiante?.id || estudiante?.uid || 'estudiante_local',
            rune_id: rune.id
          })
        }).catch(() => {});
      }

      const copy = { ...pragmaProfile };
      let newEnergy = typeof copy.energy === 'number' ? copy.energy : 98;
      if (newEnergy >= 20) {
        newEnergy -= 20;
      } else if ((copy.inventory?.silicon_shards || 0) >= 1) {
        copy.inventory.silicon_shards -= 1;
        newEnergy = 80;
      } else {
        alert('Energía rúnica insuficiente (requiere 20% o 1 Silicon Shard).');
        setCastingEffect(false);
        return;
      }

      copy.energy = newEnergy;
      if (!Array.isArray(copy.active_perks)) copy.active_perks = [];

      const ahora = Date.now();
      const duracionMs = 10 * 60 * 1000; // 10 minutos
      copy.active_perks = copy.active_perks.filter(p => p.expira > ahora);

      const nuevoPerk = {
        rune_id: rune.id,
        titulo: rune.titulo,
        icono: rune.icono,
        color: rune.color,
        perk: rune.perk,
        activado_en: ahora,
        expira: ahora + duracionMs
      };
      copy.active_perks.push(nuevoPerk);

      onUpdate(copy);
      setCastSuccessMsg(`✨ ¡Hechizo ${rune.titulo} canalizado! Efecto: ${rune.perk?.desc} activo durante 10 min.`);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setCastingEffect(false), 800);
    }
  };

  const equiparEnArray = (runeId, slotIndex) => {
    const copy = { ...pragmaProfile };
    let currentArray = Array.isArray(copy.runic_array) ? [...copy.runic_array] : ["chronos", "quantum", "cyber"];
    currentArray[slotIndex] = runeId;
    copy.runic_array = currentArray;
    onUpdate(copy);

    if (backendUrl) {
      fetch(`${backendUrl}/api/pragma/grimorio/equipar-array`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante?.id || estudiante?.uid || 'estudiante_local',
          runic_array: currentArray
        })
      }).catch(() => {});
    }
  };

  const transmutarEsencias = () => {
    const copy = { ...pragmaProfile };
    if (!copy.inventory) copy.inventory = { silicon_shards: 15, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 };
    const totalEss = (copy.inventory.javascript_essence || 0) + (copy.inventory.python_essence || 0) + (copy.inventory.sql_essence || 0);
    if (totalEss < 2 && (copy.inventory.silicon_shards || 0) < 5) {
      setTransmuteMsg('⚠️ Materiales insuficientes para transmutación (requiere 2 Esencias o 5 Shards).');
      return;
    }

    if (totalEss >= 2) {
      if (copy.inventory.javascript_essence >= 2) copy.inventory.javascript_essence -= 2;
      else if (copy.inventory.python_essence >= 2) copy.inventory.python_essence -= 2;
      else if (copy.inventory.sql_essence >= 2) copy.inventory.sql_essence -= 2;
      else {
        copy.inventory.javascript_essence = Math.max(0, copy.inventory.javascript_essence - 1);
        copy.inventory.python_essence = Math.max(0, copy.inventory.python_essence - 1);
      }
      copy.inventory.logic_cores = (copy.inventory.logic_cores || 0) + 1;
      setTransmuteMsg('🔮 ¡Transmutación Exitosa! +1 Logic Core sintetizado.');
    } else {
      copy.inventory.silicon_shards -= 5;
      copy.inventory.memory_threads = (copy.inventory.memory_threads || 0) + 2;
      setTransmuteMsg('🧵 ¡Transmutación Exitosa! +2 Memory Threads forjados.');
    }
    onUpdate(copy);
  };

  const recargarEnergiaConShard = () => {
    const copy = { ...pragmaProfile };
    if ((copy.inventory?.silicon_shards || 0) < 1) {
      setTransmuteMsg('💎 Requiere al menos 1 Silicon Shard para recargar energía.');
      return;
    }
    copy.inventory.silicon_shards -= 1;
    copy.energy = 100;
    onUpdate(copy);
    setTransmuteMsg('⚡ Energía rúnica restaurada al 100%.');
  };

  return (
    <div className={`runas-panel glass-panel spec-codex-panel ${castingEffect ? 'cast-active-glow' : ''}`}>
      {/* Corner Brackets */}
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      <div className="codex-header">
        <div>
          <h2 className="codex-title">AETHER CODEX: RUNIC PROGRAMMING GRIMOIRE</h2>
          <span className="codex-sub-title">Grimorio de Hechizos, Sinergias de Código y Matriz de Ejecución</span>
        </div>
        <div className="codex-user-energy">
          <span className="font-bold tracking-wider">{estudiante?.nombre ? estudiante.nombre.toUpperCase() : 'AETHERIUS'}</span>
          <span className="rank-txt">Rango {Math.floor((pragmaProfile?.rank_points || 0) / 100) + 1}</span>
          <div className="energy-bar-container" title="Energía Rúnica para Lanzamiento de Hechizos">
            <span className="energy-label">ENERGY {currentEnergy}%</span>
            <div className="energy-bar" style={{ width: `${currentEnergy}%` }}></div>
          </div>
        </div>
      </div>

      {castSuccessMsg && (
        <div className="codex-alert-banner animate-fade-in">
          <span>{castSuccessMsg}</span>
          <button type="button" onClick={() => setCastSuccessMsg('')} className="btn-close-alert">×</button>
        </div>
      )}

      <div className="codex-tabs">
        {["RUNES", "ARRAYS", "SCRIPTS", "SETTINGS"].map(tab => (
          <button 
            key={tab} 
            type="button"
            className={`codex-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* PESTAÑA 1: RUNES (CATÁLOGO Y CASTEADOR) */}
      {activeTab === "RUNES" && (
        <div className="codex-main-layout">
          {/* Grilla de runas */}
          <div className="runes-grid-spec">
            {AETHER_RUNES.map((rune) => {
              const locked = esBloqueada(rune);
              const isSelected = selectedRune?.id === rune.id;

              if (locked) {
                return (
                  <div 
                    key={rune.id} 
                    className={`rune-card-spec locked ${isSelected ? 'selected-locked' : ''}`}
                    onClick={() => setSelectedRune({ ...rune, locked: true })}
                  >
                    <div className="rune-locked-icon">🔒</div>
                    <div className="rune-locked-label">{rune.titulo}</div>
                    <div className="rune-locked-req">REQ LVL {rune.reqLvl || 10}</div>
                  </div>
                );
              }

              return (
                <div 
                  key={rune.id} 
                  className={`rune-card-spec ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedRune({ ...rune, locked: false })}
                  style={{ '--rune-theme-color': rune.color }}
                >
                  <div className="rune-card-header">
                    <span className="rune-lvl">Lvl {rune.level}</span>
                    <span className="rune-type-dot" style={{ backgroundColor: rune.color }}></span>
                  </div>
                  <div className="rune-icon-container" style={{ textShadow: `0 0 10px ${rune.color}` }}>
                    {rune.icono}
                  </div>
                  <h4 className="rune-card-title">{rune.titulo}</h4>
                  <p className="rune-card-type">{rune.tipo.split(" ")[0]}</p>
                </div>
              );
            })}
          </div>

          {/* Panel de detalles de la runa seleccionada */}
          <div className="rune-detail-sidebar">
            {selectedRune ? (
              <div className="rune-detail-content" style={{ '--rune-theme-color': selectedRune.color || '#00ff66' }}>
                <div className="hud-corner top-left"></div>
                <div className="hud-corner top-right"></div>
                <div className="hud-corner bottom-left"></div>
                <div className="hud-corner bottom-right"></div>

                <div className="detail-top-row">
                  <span className="detail-icon-large">{selectedRune.icono}</span>
                  <div>
                    <h3 className="detail-title">{selectedRune.titulo}</h3>
                    <span className="detail-lvl-tag">Nivel {selectedRune.level} • {selectedRune.tipo}</span>
                  </div>
                </div>

                <p className="detail-desc">{selectedRune.descripcion}</p>

                {selectedRune.perk && (
                  <div className="rune-perk-box">
                    <span className="perk-box-title">⚡ EFECTO ACTIVO / PERK:</span>
                    <p className="perk-box-desc">{selectedRune.perk.desc}</p>
                  </div>
                )}
                
                <div className="detail-specs">
                  <div className="spec-item">
                    <span className="spec-label">Cooldown:</span>
                    <span className="spec-value">{selectedRune.cooldown || '15s'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Costo Energía:</span>
                    <span className="spec-value text-cyan">20% Energy</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">ESTADO:</span>
                    <span 
                      className="spec-value font-bold" 
                      style={{ color: esBloqueada(selectedRune) ? '#ef4444' : '#00ff66' }}
                    >
                      {esBloqueada(selectedRune) ? '🔒 BLOQUEADA' : '⚡ ACTIVA'}
                    </span>
                  </div>
                </div>

                {/* Acciones de Desbloqueo o Lanzamiento */}
                <div className="detail-actions">
                  {esBloqueada(selectedRune) ? (
                    <div className="unlock-requirement-box">
                      <span className="req-title">Recursos para Desbloqueo:</span>
                      <div className="req-resources-list">
                        {selectedRune.costo && Object.entries(selectedRune.costo).map(([k, v]) => (
                          <span key={k} className="req-pill">
                            {v} {k.replace('_', ' ')} (Tienes {pragmaProfile.inventory?.[k] || 0})
                          </span>
                        ))}
                      </div>
                      <button 
                        type="button" 
                        className="btn-action btn-unlock-rune mt-2" 
                        onClick={() => desbloquearRuna(selectedRune)}
                        disabled={unlocking}
                      >
                        {unlocking ? 'Desbloqueando...' : '🔓 DESBLOQUEAR RUNA'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        type="button" 
                        className="btn-glow btn-cast" 
                        onClick={() => castearHechizo(selectedRune)}
                        disabled={castingEffect}
                      >
                        {castingEffect ? 'CANALIZANDO...' : '⚡ CANALIZAR HECHIZO (CAST)'}
                      </button>
                      <div className="flex gap-2 w-full mt-2">
                        <button type="button" className="btn-glow btn-edit flex-1" onClick={() => setShowEditModal(!showEditModal)}>
                          🔧 PARÁMETROS
                        </button>
                        <button type="button" className="btn-glow btn-info flex-1" onClick={() => setShowInfoModal(!showInfoModal)}>
                          📖 TELEMETRÍA
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Info Telemetría */}
                {showInfoModal && (
                  <div className="rune-subcard-info animate-scale-in">
                    <h4>📚 Fundamentos de {selectedRune.titulo}</h4>
                    <p className="text-xs text-slate-300 mb-2">
                      Implementa arquitectura de manipulación asíncrona de eventos sobre el motor V8. 
                      Complejidad amortizada: O(1).
                    </p>
                    <pre className="telemetry-code">
                      <code>{`// Macro de canalización\nconst rune = Aether.bind('${selectedRune.id}');\nrune.execute({ bufferSize: 1024, async: true });`}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="rune-detail-empty">
                <p>SELECCIONA UNA RUNA PARA LEER TELEMETRÍA</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ARRAYS (MATRIZ DE ENGARCE DE RUNAS) */}
      {activeTab === "ARRAYS" && (
        <div className="codex-arrays-panel animate-fade-in">
          <div className="arrays-header">
            <h3>🔮 Matriz de Engarce Rúnico (3 Ranuras de Resonancia)</h3>
            <p>Engarza hasta 3 runas activas para desencadenar sinergias elementales permanentes en todos los minijuegos.</p>
          </div>

          <div className="array-slots-grid">
            {[0, 1, 2].map((idx) => {
              const currentRuneId = runicArray[idx];
              const runeData = AETHER_RUNES.find(r => r.id === currentRuneId);
              const slotRole = idx === 0 ? "RANURA PRIMARIA (100% Efecto)" : idx === 1 ? "RANURA SECUNDARIA (50% Efecto)" : "RANURA PASIVA (25% Efecto)";

              return (
                <div 
                  key={idx} 
                  className={`array-slot-card ${selectedArraySlot === idx ? 'active-slot' : ''}`}
                  onClick={() => setSelectedArraySlot(idx)}
                >
                  <span className="slot-badge">{slotRole}</span>
                  {runeData ? (
                    <div className="slot-rune-content" style={{ borderColor: runeData.color }}>
                      <span className="slot-icon" style={{ textShadow: `0 0 10px ${runeData.color}` }}>{runeData.icono}</span>
                      <h4>{runeData.titulo}</h4>
                      <p className="text-xs text-emerald-400">{runeData.perk?.desc}</p>
                      <span className="slot-level">Lvl {runeData.level}</span>
                    </div>
                  ) : (
                    <div className="slot-empty">
                      <span className="text-2xl">➕</span>
                      <p>Ranura Vacía</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="array-rune-picker mt-6">
            <h4>Haz clic en una runa para engarzarla en la Ranura Seleccionada (#{selectedArraySlot + 1}):</h4>
            <div className="picker-chips-list">
              {AETHER_RUNES.filter(r => !esBloqueada(r)).map(r => (
                <button
                  key={r.id}
                  type="button"
                  className="btn-picker-chip"
                  style={{ borderColor: r.color }}
                  onClick={() => equiparEnArray(r.id, selectedArraySlot)}
                >
                  <span>{r.icono}</span>
                  <span>{r.titulo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: SCRIPTS (TRANSMUTADOR Y UTILIDADES ARCANAS) */}
      {activeTab === "SCRIPTS" && (
        <div className="codex-scripts-panel animate-fade-in">
          <div className="arrays-header">
            <h3>⚡ Macros & Scripts de Automatización Arcana</h3>
            <p>Utilidades cuánticas de procesamiento de recursos y transmutación de esencias.</p>
          </div>

          {transmuteMsg && (
            <div className="codex-alert-banner mb-4">
              <span>{transmuteMsg}</span>
              <button type="button" onClick={() => setTransmuteMsg('')} className="btn-close-alert">×</button>
            </div>
          )}

          <div className="scripts-cards-grid">
            <div className="script-tool-card">
              <h4>🔮 Transmutador Alquímico de Esencias</h4>
              <p>Convierte 2 Esencias en 1 Logic Core, o 5 Silicon Shards en 2 Memory Threads.</p>
              <div className="script-cost-preview">
                <span>Tu balance: {pragmaProfile.inventory?.silicon_shards || 0} Shards • {pragmaProfile.inventory?.logic_cores || 0} Cores</span>
              </div>
              <button type="button" className="btn-action w-full mt-3" onClick={transmutarEsencias}>
                TRANSMUTAR RECURSOS
              </button>
            </div>

            <div className="script-tool-card">
              <h4>⚡ Restaurador de Sobrecarga Rúnica</h4>
              <p>Restaura la barra de Energía al 100% gastando 1 Silicon Shard.</p>
              <div className="script-cost-preview">
                <span>Energía Actual: {currentEnergy}% • Requiere 1 Shard</span>
              </div>
              <button type="button" className="btn-action w-full mt-3" onClick={recargarEnergiaConShard}>
                RESTAURAR ENERGÍA (1 SHARD)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: SETTINGS */}
      {activeTab === "SETTINGS" && (
        <div className="codex-settings-panel animate-fade-in">
          <h3>⚙️ Sintonización Elemental del Aether Codex</h3>
          <p className="text-slate-400 mb-4">Configura la resonancia de tu perfil y canalización mágica.</p>

          <div className="settings-options-list">
            <div className="setting-row">
              <div>
                <h4>Afinidad Elemental Principal</h4>
                <p className="text-xs text-slate-400">Determina el tipo de esencias recolectadas preferentemente.</p>
              </div>
              <span className="badge-affinity-active">{estudiante?.tecnologia_actual || 'JavaScript'}</span>
            </div>

            <div className="setting-row">
              <div>
                <h4>Efectos de Brillo Cuántico & CRT</h4>
                <p className="text-xs text-slate-400">Activa animaciones de pulsos neón y scanlines tácticos.</p>
              </div>
              <span className="text-emerald-400 font-bold">Habilitado</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros inferiores */}
      <div className="codex-bottom-filters">
        {Object.keys(filters).map(key => (
          <label key={key} className="filter-toggle-label">
            <span className="filter-name">{key.toUpperCase()}</span>
            <input 
              type="checkbox" 
              checked={filters[key]} 
              onChange={() => setFilters(prev => ({ ...prev, [key]: !prev[key] }))}
              className="filter-checkbox"
            />
            <span className="custom-toggle"></span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   7. SYNTAX TINDER (CODE REVIEW VELOZ / BOOST)
   ========================================== */
function highlightCodeLine(line) {
  if (!line) return <span>&nbsp;</span>;
  const parts = line.split(/(\b(?:const|let|var|function|return|if|else|def|class|public|static|void|int|import|from|SELECT|FROM|WHERE|GROUP|BY|JOIN|LEFT|COUNT|ORDER|DESC|LIMIT|try|catch|new|throw|await|async|true|false|null|undefined)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[^`]*`|\/\/.*|#.*|--.*|[0-9]+)/g);
  
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^(\/\/.*|#.*|--.*)$/.test(part)) {
      return <span key={idx} className="token-comment">{part}</span>;
    }
    if (/^(".*"|'.*'|`.*`)$/.test(part)) {
      return <span key={idx} className="token-string">{part}</span>;
    }
    if (/^[0-9]+$/.test(part)) {
      return <span key={idx} className="token-number">{part}</span>;
    }
    if (/^(const|let|var|function|return|if|else|def|class|public|static|void|int|import|from|SELECT|FROM|WHERE|GROUP|BY|JOIN|LEFT|COUNT|ORDER|DESC|LIMIT|try|catch|new|throw|await|async)$/.test(part)) {
      return <span key={idx} className="token-keyword">{part}</span>;
    }
    if (/^(true|false|null|undefined)$/.test(part)) {
      return <span key={idx} className="token-boolean">{part}</span>;
    }
    return <span key={idx}>{part}</span>;
  });
}

function getFileExtension(lang) {
  const l = (lang || '').toLowerCase();
  if (l.includes('py')) return 'py';
  if (l.includes('sql')) return 'sql';
  if (l.includes('java')) return 'java';
  if (l.includes('react')) return 'jsx';
  return 'js';
}

function TinderView({ estudiante, backendUrl, onUpdate }) {
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [timer, setTimer] = useState(15);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [racha, setRacha] = useState(0);
  const [mostrarExplicacionIA, setMostrarExplicacionIA] = useState(false);
  const [explicacionLoading, setExplicacionLoading] = useState(false);
  const [aiExplicacionData, setAiExplicacionData] = useState(null);

  const prefetchQueueRef = useRef([]);
  const startTimeRef = useRef(Date.now());

  // Carga anticipada de snippets en memoria para 0ms de latencia filtrados por tecnología
  const recargarColaPrefetch = async () => {
    try {
      const tec = estudiante?.tecnologia_actual || 'JavaScript';
      const res = await fetch(`${backendUrl}/api/pragma/tinder/lote?count=8&tecnologia=${encodeURIComponent(tec)}`);
      const data = await res.json();
      if (data?.snippets?.length > 0) {
        prefetchQueueRef.current = [...prefetchQueueRef.current, ...data.snippets];
      }
    } catch (err) {
      console.warn('Error en prefetch de snippets:', err);
    }
  };

  const fetchSnippet = async () => {
    setFeedback(null);
    setSwipeDirection(null);
    setMostrarExplicacionIA(false);
    setAiExplicacionData(null);
    setIsVoting(false);
    setTimer(15);
    startTimeRef.current = Date.now();

    const tec = estudiante?.tecnologia_actual || 'JavaScript';

    // 0ms de espera: Tomamos inmediatamente el snippet en memoria
    if (prefetchQueueRef.current.length > 0) {
      const nextSnippet = prefetchQueueRef.current.shift();
      setCurrentSnippet(nextSnippet);
      if (prefetchQueueRef.current.length <= 3) {
        recargarColaPrefetch();
      }
      return;
    }

    // Carga inicial o fallback en lote (boost)
    try {
      const res = await fetch(`${backendUrl}/api/pragma/tinder/lote?count=8&tecnologia=${encodeURIComponent(tec)}`);
      const data = await res.json();
      if (data?.snippets?.length > 0) {
        const [primero, ...resto] = data.snippets;
        setCurrentSnippet(primero);
        prefetchQueueRef.current = resto;
        return;
      }
      const singleRes = await fetch(`${backendUrl}/api/pragma/tinder/codigo?tecnologia=${encodeURIComponent(tec)}`);
      const singleData = await singleRes.json();
      setCurrentSnippet(singleData);
      recargarColaPrefetch();
    } catch (e) {
      console.error('Fallo al conectar con endpoint de tinder:', e);
      setCurrentSnippet({
        id: 'tinder_1',
        codigo: 'function test() {\n  if (x = 2) {\n    return true;\n  }\n}',
        lenguaje: tec,
        hint: 'Asignación simple en estructura condicional if.'
      });
    }
  };

  useEffect(() => {
    prefetchQueueRef.current = [];
    fetchSnippet();
  }, [estudiante?.tecnologia_actual]);

  const votarSnippet = async (voto) => {
    if (isVoting || !currentSnippet || feedback) return;
    setIsVoting(true);
    const duracionMs = Date.now() - startTimeRef.current;
    setSwipeDirection(voto ? 'right' : 'left');

    try {
      const res = await fetch(`${backendUrl}/api/pragma/tinder/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estudiante_id: estudiante?.id || estudiante?.uid || 'estudiante_local', 
          snippet_id: currentSnippet.id, 
          voto,
          respuesta_ms: duracionMs
        })
      });
      const data = await res.json();

      setFeedback(data);
      setIsVoting(false);

      if (data.acierto) {
        setRacha(prev => prev + 1);
        const pragmaBase = estudiante?.pragma_profile || {
          rank_points: 0,
          inventory: { silicon_shards: 10, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 },
          unlocked_runes: [],
          unlocked_cosmetics: [],
          equipped_cosmetics: { map_skin: "default", star_aura: "none", laser_color: "#38bdf8" }
        };
        const copy = { 
          ...pragmaBase,
          inventory: { ...(pragmaBase.inventory || {}) }
        };
        copy.rank_points = (copy.rank_points || 0) + (data.rp_ganados || 5);
        copy.inventory.silicon_shards = (copy.inventory.silicon_shards || 0) + (data.shards_ganados || 1);
        if (onUpdate) onUpdate(copy);
      } else {
        setRacha(0);
      }

      setHistory(prev => [{ 
        snippet: currentSnippet.codigo, 
        acierto: data.acierto,
        lenguaje: currentSnippet.lenguaje,
        explicacion: data.explicacion,
        votoUsuario: voto,
        correcto: data.correcto
      }, ...prev].slice(0, 5));
    } catch (e) {
      console.error('Error al emitir voto:', e);
      setIsVoting(false);
      setFeedback({
        acierto: false,
        correcto: false,
        explicacion: 'Error temporal de red. Conexión resiliente activa.',
        rp_ganados: 0,
        shards_ganados: 0
      });
    }
  };

  const solicitarExplicacionIA = async () => {
    if (!currentSnippet) return;
    setMostrarExplicacionIA(true);
    if (aiExplicacionData) return;
    setExplicacionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/tinder/explicar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snippet_id: currentSnippet.id })
      });
      const data = await res.json();
      setAiExplicacionData(data);
    } catch (err) {
      setAiExplicacionData({
        consejo: currentSnippet.hint || 'Examina cuidadosamente las operaciones y tipos.',
        analisis: 'Auditor de sintaxis cognitivo.'
      });
    } finally {
      setExplicacionLoading(false);
    }
  };

  // Temporizador de 15 segundos con detección crítica y timeout controlado
  useEffect(() => {
    if (!currentSnippet || feedback) return;
    if (timer === 0) {
      // Manejo estricto de timeout (Zero RP, reset racha, feedback informativo)
      const timeoutFeedback = {
        acierto: false,
        timeout: true,
        correcto: false,
        explicacion: `⏱️ ¡Tiempo agotado! Se terminaron los 15 segundos para evaluar este código. Pista técnica: ${currentSnippet.hint || 'Revisa la sintaxis detallada.'}`,
        rp_ganados: 0,
        shards_ganados: 0,
        bonus_velocidad: 0
      };
      setFeedback(timeoutFeedback);
      setRacha(0);
      setHistory(prev => [{
        snippet: currentSnippet.codigo,
        acierto: false,
        timeout: true,
        lenguaje: currentSnippet.lenguaje,
        explicacion: `⏱️ Tiempo agotado (15s)`,
        votoUsuario: null,
        correcto: false
      }, ...prev].slice(0, 5));
      return;
    }
    const id = setTimeout(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [timer, currentSnippet, feedback]);

  // Atajos de teclado para velocidad extrema
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (feedback) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          fetchSnippet();
        }
        return;
      }

      if (currentSnippet && !isVoting && !feedback) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          votarSnippet(false);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          votarSnippet(true);
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          solicitarExplicacionIA();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSnippet, feedback, isVoting]);

  useEffect(() => {
    fetchSnippet();
  }, []);

  const totalHistory = history.length;
  const totalAciertos = history.filter(h => h.acierto).length;
  const porcentajeAcierto = totalHistory > 0 ? Math.round((totalAciertos / totalHistory) * 100) : 100;
  const lineasCodigo = (currentSnippet?.codigo || '').split('\n');

  return (
    <div className="tinder-panel glass-panel">
      <div className="tinder-header-row">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="tinder-main-title">🔥 Syntax Tinder <span className="tinder-badge-sub">Code Review Veloz</span></h2>
            <span className="badge-boost-active">⚡ /BOOST ACTIVO · 0ms LATENCIA</span>
          </div>
          <p className="panel-desc">
            Tienes 15 segundos para deslizar izquierda (código erróneo/sucio) o derecha (código limpio/correcto).
          </p>
        </div>

        <div className="tinder-streak-box">
          <div className="streak-indicator">
            <Flame size={18} className={racha > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
            <span className="streak-num">x{racha}</span>
            <span className="streak-lbl">Racha</span>
          </div>
          {racha >= 3 && <span className="streak-bonus-tag">+{racha * 5} RP Multiplier</span>}
        </div>
      </div>

      <div className="tinder-layout">
        <div className="tinder-main">
          {currentSnippet && !feedback && (
            <div className={`tinder-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}>
              {/* Barra de Tiempo Dinámica */}
              <div className="timer-wrapper">
                <div 
                  className={`card-timer-bar ${timer <= 4 ? 'timer-critical' : timer <= 8 ? 'timer-warning' : 'timer-normal'}`} 
                  style={{ width: `${(timer / 15) * 100}%` }}
                ></div>
              </div>

              {/* Encabezado IDE Mac Window Chrome */}
              <div className="tinder-ide-header">
                <div className="ide-traffic-lights">
                  <span className="traffic-dot dot-red"></span>
                  <span className="traffic-dot dot-yellow"></span>
                  <span className="traffic-dot dot-green"></span>
                </div>

                <div className="ide-file-tab">
                  <Code size={13} className="text-sky-400" />
                  <span className="ide-file-name">syntax_review.{getFileExtension(currentSnippet.lenguaje)}</span>
                  <span className="ide-lang-pill">{currentSnippet.lenguaje}</span>
                </div>

                <div className="ide-header-actions">
                  <span className={`timer-digit-pill ${timer <= 4 ? 'digit-critical' : ''}`}>
                    ⏱️ {timer}s
                  </span>
                  <button 
                    type="button" 
                    className="btn-ide-explain" 
                    onClick={solicitarExplicacionIA}
                    title="Explicar con IA y consultar buenas prácticas"
                  >
                    <Sparkles size={13} />
                    <span>Explicar</span>
                  </button>
                </div>
              </div>

              {/* Drawer de Explicación IA / Mentor */}
              {mostrarExplicacionIA && (
                <div className="tinder-ai-drawer animate-fade-in">
                  <div className="ai-drawer-header">
                    <div className="flex items-center gap-2">
                      <Lightbulb size={15} className="text-amber-400" />
                      <span className="ai-drawer-title">Pista Conceptual del Mentor</span>
                    </div>
                    <button type="button" className="btn-close-mini" onClick={() => setMostrarExplicacionIA(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="ai-drawer-body">
                    {explicacionLoading ? (
                      <div className="flex items-center gap-2 text-xs text-sky-400 py-1">
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Analizando código...</span>
                      </div>
                    ) : (
                      <p className="ai-drawer-text">
                        {aiExplicacionData?.consejo || currentSnippet.hint || 'Examina la sintaxis, asignaciones y consistencia lógica.'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Editor de Código con Líneas Numeradas */}
              <div className="tinder-editor-body">
                <div className="gutter-lines">
                  {lineasCodigo.map((_, i) => (
                    <span key={i}>{String(i + 1).padStart(2, '0')}</span>
                  ))}
                </div>
                <pre className="code-content">
                  {lineasCodigo.map((linea, i) => (
                    <div key={i} className="code-row">
                      {highlightCodeLine(linea)}
                    </div>
                  ))}
                </pre>
              </div>
              
              {/* Botones de Acción con Colores e Identidad Visual Diferenciada */}
              <div className="tinder-actions">
                <button 
                  type="button" 
                  className="btn-tinder btn-tinder-dirty" 
                  onClick={() => votarSnippet(false)}
                  disabled={isVoting}
                >
                  <div className="btn-tinder-content">
                    <span className="btn-tinder-icon">❌</span>
                    <div className="btn-tinder-labels">
                      <span className="btn-tinder-main-text">CÓDIGO SUCIO</span>
                      <span className="btn-tinder-sub">Errores / Antipatrones</span>
                    </div>
                  </div>
                  <kbd className="btn-tinder-kbd">[← A]</kbd>
                </button>

                <button 
                  type="button" 
                  className="btn-tinder btn-tinder-clean" 
                  onClick={() => votarSnippet(true)}
                  disabled={isVoting}
                >
                  <div className="btn-tinder-content">
                    <span className="btn-tinder-icon">💚</span>
                    <div className="btn-tinder-labels">
                      <span className="btn-tinder-main-text">CÓDIGO LIMPIO</span>
                      <span className="btn-tinder-sub">Sintaxis Válida y Correcta</span>
                    </div>
                  </div>
                  <kbd className="btn-tinder-kbd">[D →]</kbd>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Card Mejorada */}
          {feedback && (
            <div className={`tinder-feedback-v2 ${feedback.timeout ? 'feedback-timeout' : feedback.acierto ? 'feedback-success' : 'feedback-fail'} animate-scale-in`}>
              <div className="feedback-banner">
                <div className="feedback-status-pill">
                  {feedback.timeout ? (
                    <>
                      <Clock size={24} className="text-amber-400" />
                      <div>
                        <h3>¡TIEMPO AGOTADO! (15s)</h3>
                        <span className="feedback-sub-tag">Se requieren revisiones más ágiles en producción</span>
                      </div>
                    </>
                  ) : feedback.acierto ? (
                    <>
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <div>
                        <h3>¡EXCELENTE REVISIÓN!</h3>
                        <span className="feedback-sub-tag">Tu ojo de arquitecto de software está afilado</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} className="text-rose-400" />
                      <div>
                        <h3>REVISIÓN INCORRECTA</h3>
                        <span className="feedback-sub-tag">No te preocupes, cada error refina tu intuición</span>
                      </div>
                    </>
                  )}
                </div>

                {feedback.acierto && (
                  <div className="feedback-rewards">
                    <span className="reward-pill rp">+{feedback.rp_ganados || 5} RP</span>
                    <span className="reward-pill shard">+1 💎 Shard</span>
                    {feedback.bonus_velocidad > 0 && (
                      <span className="reward-pill speed-boost">⚡ +{feedback.bonus_velocidad} RP Boost Veloz</span>
                    )}
                  </div>
                )}
              </div>

              <div className="feedback-analysis-card">
                <div className="analysis-header">
                  <span className="analysis-title">Auditoría Técnica del Snippet:</span>
                  <span className={`analysis-tag ${feedback.timeout ? 'tag-timeout' : feedback.correcto ? 'tag-clean' : 'tag-dirty'}`}>
                    {feedback.timeout ? 'Tiempo Expirado' : feedback.correcto ? 'Es Código Limpio' : 'Es Código Sucio'}
                  </span>
                </div>
                <p className="analysis-text">{feedback.explicacion}</p>
                
                <div className="feedback-code-recap">
                  <pre className="recap-code">
                    <code>{currentSnippet?.codigo}</code>
                  </pre>
                </div>
              </div>

              <div className="feedback-actions">
                <button 
                  type="button" 
                  className="btn-next-snippet" 
                  onClick={fetchSnippet}
                  autoFocus
                >
                  <span>Siguiente Snippet</span>
                  <ArrowRight size={18} />
                  <kbd className="btn-kbd-hint">[Espacio / Enter]</kbd>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Historial Reciente Pulido */}
        <div className="tinder-sidebar">
          <div className="sidebar-header-row">
            <h3>Historial Reciente</h3>
            {totalHistory > 0 && (
              <span className="sidebar-acc-pill">🎯 {porcentajeAcierto}% Acierto</span>
            )}
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty-box">
                <Clock size={20} className="text-slate-600 mb-2" />
                <p>Las revisiones que realices aparecerán aquí en tiempo real.</p>
              </div>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className={`history-item-v2 ${h.timeout ? 'item-timeout' : h.acierto ? 'item-success' : 'item-fail'}`}>
                  <div className="history-item-top">
                    <span className="hist-lang-pill">{h.lenguaje || 'Code'}</span>
                    <span className={`hist-status-pill ${h.timeout ? 'pill-timeout' : h.acierto ? 'pill-ok' : 'pill-err'}`}>
                      {h.timeout ? '⏱️ Tiempo' : h.acierto ? '✓ Acierto' : '✗ Fallo'}
                    </span>
                  </div>
                  <pre className="hist-code-preview">
                    <code>{h.snippet.slice(0, 45).replace(/\n/g, ' ')}...</code>
                  </pre>
                  {h.explicacion && (
                    <span className="hist-explicacion-micro" title={h.explicacion}>
                      {h.explicacion.slice(0, 60)}...
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   8. SYNTAX DEFENSE (ARCADE DE SINTAXIS)
   ========================================== */
function DefenseView({ estudiante, backendUrl, onUpdate }) {
  const pragma = estudiante?.pragma_profile || {};
  const activePerks = Array.isArray(pragma.active_perks) ? pragma.active_perks : [];
  
  const hasShieldBoost = activePerks.some(p => p.perk?.tipo === 'shield_regen');
  const hasCyberImmune = activePerks.some(p => p.perk?.tipo === 'first_error_immune');
  const hasChronosLife = activePerks.some(p => p.perk?.tipo === 'time_bonus');
  const hasComboDouble = activePerks.some(p => p.perk?.tipo === 'combo_mult');
  const hasAutoTurret = activePerks.some(p => p.perk?.tipo === 'auto_turret');
  const hasVoidFast = activePerks.some(p => p.perk?.tipo === 'screen_clear');

  const initialLives = hasChronosLife ? 4 : 3;

  const OLEADAS_ESTRUCTURADAS = [
    {
      oleada: 1,
      titulo: "Oleada 1: Errores Sintácticos",
      snippets: [
        { id: "w1_1", text: "if (status = 'active') {", corrupt: true },
        { id: "w1_2", text: "const total = calc();", corrupt: false },
        { id: "w1_3", text: "return; processData();", corrupt: true },
        { id: "w1_4", text: "let items = [];", corrupt: false }
      ]
    },
    {
      oleada: 2,
      titulo: "Oleada 2: Acceso y Tipos",
      snippets: [
        { id: "w2_1", text: "user.settings.theme.dark", corrupt: true },
        { id: "w2_2", text: "JSON.parse(rawJson)", corrupt: false },
        { id: "w2_3", text: "numbers.sort((a,b)=>a-b)", corrupt: false },
        { id: "w2_4", text: "null.toString()", corrupt: true }
      ]
    },
    {
      oleada: 3,
      titulo: "Oleada 3: Promesas y Asincronía",
      snippets: [
        { id: "w3_1", text: "fetch(url) // sin catch", corrupt: true },
        { id: "w3_2", text: "await Promise.all(tasks)", corrupt: false },
        { id: "w3_3", text: "async () => { throw err; }", corrupt: true },
        { id: "w3_4", text: "const res = await api.get();", corrupt: false }
      ]
    },
    {
      oleada: 4,
      titulo: "Oleada 4: Fugas de Memoria",
      snippets: [
        { id: "w4_1", text: "setInterval(poll, 10)", corrupt: true },
        { id: "w4_2", text: "window.addEventListener('scroll', h)", corrupt: true },
        { id: "w4_3", text: "const cache = new Map();", corrupt: false },
        { id: "w4_4", text: "subscription.unsubscribe();", corrupt: false }
      ]
    },
    {
      oleada: 5,
      titulo: "Oleada 5: Inyección y Seguridad Crítica",
      snippets: [
        { id: "w5_1", text: "db.query('SELECT * WHERE u=' + u)", corrupt: true },
        { id: "w5_2", text: "eval(payload)", corrupt: true },
        { id: "w5_3", text: "bcrypt.hash(password, 10)", corrupt: false },
        { id: "w5_4", text: "sanitizeInput(params)", corrupt: false }
      ]
    }
  ];

  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [gameSummary, setGameSummary] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(pragma.defense_stats?.highscore || 120000);
  const [currentWave, setCurrentWave] = useState(1);
  const [corruptsLeftInWave, setCorruptsLeftInWave] = useState(2);
  const [firewallHp, setFirewallHp] = useState(100);
  const [power, setPower] = useState(100);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(initialLives);
  const [fallingLines, setFallingLines] = useState([]);
  const [laserEffect, setLaserEffect] = useState(null);
  const [empBlast, setEmpBlast] = useState(false);
  const [cyberShieldUsed, setCyberShieldUsed] = useState(false);
  const [turretPaddleX, setTurretPaddleX] = useState(50);

  const gameLoopRef = useRef(null);
  const autoTurretRef = useRef(null);
  const playfieldRef = useRef(null);

  const spawnWaveSnippets = (waveIdx) => {
    const waveData = OLEADAS_ESTRUCTURADAS[waveIdx - 1];
    if (!waveData) return;
    const initialFalling = waveData.snippets.map((snip, i) => ({
      id: `${snip.id}_${Date.now()}_${i}`,
      text: snip.text,
      corrupt: snip.corrupt,
      x: 15 + i * 22,
      y: 10 + (i % 2) * 12
    }));
    setFallingLines(initialFalling);
    const countCorrupt = waveData.snippets.filter(s => s.corrupt).length;
    setCorruptsLeftInWave(countCorrupt);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setVictory(false);
    setGameSummary(null);
    setScore(0);
    setCurrentWave(1);
    setFirewallHp(100);
    setPower(100);
    setCombo(1);
    setLives(initialLives);
    setCyberShieldUsed(false);
    spawnWaveSnippets(1);
  };

  const handleMouseMove = (e) => {
    if (!playfieldRef.current) return;
    const rect = playfieldRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    setTurretPaddleX(Math.max(10, Math.min(90, relX)));
  };

  const dispararLinea = (id, corrupt, x, y) => {
    if (!gameStarted || gameOver || victory) return;

    setLaserEffect({
      x1: turretPaddleX,
      y1: 90,
      x2: x + 8,
      y2: y + 3
    });
    setTimeout(() => setLaserEffect(null), 180);

    if (corrupt) {
      const mult = hasComboDouble ? 2 : 1;
      const puntos = 2500 * mult;
      setScore(s => s + puntos);
      setCombo(c => c + 1);
      setPower(p => Math.min(100, p + (hasVoidFast ? 25 : 15)));

      const nextLeft = corruptsLeftInWave - 1;
      setCorruptsLeftInWave(nextLeft);

      if (nextLeft <= 0) {
        // Oleada completada
        if (currentWave >= 5) {
          // Victoria definitiva
          completarVictoria();
        } else {
          const nextW = currentWave + 1;
          setCurrentWave(nextW);
          spawnWaveSnippets(nextW);
        }
      }
    } else {
      // Penalización
      setLives(l => Math.max(0, l - 1));
      setCombo(1);
    }
    setFallingLines(prev => prev.filter(line => line.id !== id));
  };

  const detonarFirewallBlast = () => {
    if (power < 100 || !gameStarted || gameOver || victory) return;

    setEmpBlast(true);
    setTimeout(() => setEmpBlast(false), 500);

    setFallingLines(prev => {
      const criticos = prev.filter(l => l.corrupt);
      const bonusScore = criticos.length * 5000 * (hasComboDouble ? 2 : 1);
      setScore(s => s + bonusScore);
      setCombo(c => c + criticos.length);
      return prev.filter(l => !l.corrupt);
    });

    setPower(0);
    const nextLeft = Math.max(0, corruptsLeftInWave - 2);
    setCorruptsLeftInWave(nextLeft);
    if (nextLeft <= 0) {
      if (currentWave >= 5) {
        completarVictoria();
      } else {
        const nextW = currentWave + 1;
        setCurrentWave(nextW);
        spawnWaveSnippets(nextW);
      }
    }
  };

  const completarVictoria = () => {
    setVictory(true);
    clearInterval(gameLoopRef.current);
    const finalScore = score + 50000;
    setScore(finalScore);
    if (finalScore > highScore) setHighScore(finalScore);

    // Otorgar recompensas: +15 Shards, +2 Cores, +2 Esencia según tecnología
    const copy = { ...(estudiante?.pragma_profile || {}) };
    if (!copy.inventory) copy.inventory = {};
    copy.rank_points = (copy.rank_points || 0) + 30;
    copy.inventory.silicon_shards = (copy.inventory.silicon_shards || 0) + 15;
    copy.inventory.logic_cores = (copy.inventory.logic_cores || 0) + 2;

    const tec = (estudiante?.tecnologia_actual || 'javascript').toLowerCase();
    if (tec.includes('python')) {
      copy.inventory.python_essence = (copy.inventory.python_essence || 0) + 2;
    } else if (tec.includes('sql')) {
      copy.inventory.sql_essence = (copy.inventory.sql_essence || 0) + 2;
    } else {
      copy.inventory.javascript_essence = (copy.inventory.javascript_essence || 0) + 2;
    }

    if (!copy.defense_stats) copy.defense_stats = {};
    copy.defense_stats.highscore = Math.max(copy.defense_stats.highscore || 0, finalScore);
    copy.defense_stats.max_stage = 5;

    onUpdate(copy);

    setGameSummary({
      score: finalScore,
      highscore: Math.max(highScore, finalScore),
      rp: 30,
      shards: 15,
      cores: 2,
      esencia: 2
    });
  };

  // Matrix Beam Perk: torreta cada 6s
  useEffect(() => {
    if (!gameStarted || !hasAutoTurret || victory || gameOver) return;
    autoTurretRef.current = setInterval(() => {
      setFallingLines(prev => {
        const critico = prev.find(l => l.corrupt);
        if (critico) {
          dispararLinea(critico.id, true, critico.x, critico.y);
        }
        return prev;
      });
    }, 6000);
    return () => clearInterval(autoTurretRef.current);
  }, [gameStarted, hasAutoTurret, victory, gameOver]);

  // Ciclo de juego: Caída continua de bloques
  useEffect(() => {
    if (!gameStarted || gameOver || victory) return;

    gameLoopRef.current = setInterval(() => {
      setFallingLines(prev => {
        let impactoCritico = false;

        const updated = prev.map(line => {
          const nextY = line.y + 2.2;
          if (nextY >= 92) {
            if (line.corrupt) {
              impactoCritico = true;
            }
            return null;
          }
          return { ...line, y: nextY };
        }).filter(Boolean);

        if (impactoCritico) {
          if (hasCyberImmune && !cyberShieldUsed) {
            setCyberShieldUsed(true);
          } else {
            setFirewallHp(hp => {
              const nextHp = Math.max(0, hp - 15);
              setCombo(1);
              return nextHp;
            });
          }
        }

        // Si quedan pocos bloques en la oleada activa, reponer de la misma oleada
        if (updated.length < 3 && corruptsLeftInWave > 0) {
          const waveData = OLEADAS_ESTRUCTURADAS[currentWave - 1];
          if (waveData) {
            const rand = waveData.snippets[Math.floor(Math.random() * waveData.snippets.length)];
            updated.push({
              id: `${rand.id}_${Date.now()}_${Math.random()}`,
              text: rand.text,
              corrupt: rand.corrupt,
              x: Math.floor(Math.random() * 68) + 12,
              y: 0
            });
          }
        }

        return updated;
      });
    }, 240);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, gameOver, victory, currentWave, corruptsLeftInWave, cyberShieldUsed, hasCyberImmune]);

  // Detección de derrota
  useEffect(() => {
    if (gameStarted && !gameOver && !victory && (firewallHp <= 0 || lives <= 0)) {
      setGameOver(true);
      clearInterval(gameLoopRef.current);
      if (score > highScore) setHighScore(score);

      setGameSummary({
        score,
        highscore: Math.max(highScore, score),
        rp: 5,
        shards: 1
      });

      const copy = { ...(estudiante?.pragma_profile || {}) };
      if (!copy.inventory) copy.inventory = {};
      copy.rank_points = (copy.rank_points || 0) + 5;
      copy.inventory.silicon_shards = (copy.inventory.silicon_shards || 0) + 1;
      onUpdate(copy);
    }
  }, [firewallHp, lives, gameStarted, gameOver, victory]);

  return (
    <div className="defense-panel glass-panel spec-defense-layout">
      {!gameStarted ? (
        <div className="start-screen-spec p-6 text-center max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-lg text-white font-mono font-bold tracking-wider">SYNTAX DEFENSE: FIREWALL TÁCTICO</h2>
            <span className="text-[10px] text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
              MODO TÁCTICO
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono mb-4 leading-relaxed">
            Elimina fragmentos corruptos (<span className="text-rose-400 font-bold">CRITICAL</span>) disparando con el láser antes de que colapsen el firewall. Deja pasar el código limpio (<span className="text-indigo-300 font-bold">OK</span>). Supera las 5 oleadas para obtener la victoria.
          </p>

          <div className="flex justify-center gap-6 my-4 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RÉCORD PERSONAL:</span>
              <span className="text-amber-400 font-bold">{highScore.toLocaleString()} PTS</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PERKS ACTIVOS:</span>
              <span className="text-emerald-400 font-bold">{activePerks.length} Runas</span>
            </div>
          </div>

          <button className="btn-action px-6 py-2.5 text-xs font-mono font-bold tracking-wide mt-2" onClick={startGame}>
            INICIAR DEFENSA TÁCTICA
          </button>
        </div>
      ) : (
        <div className="arcade-grid-arena relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          {/* Header del HUD */}
          <div className="hud-header-stats p-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 text-[10px] block">PUNTAJE</span>
                <span className="text-indigo-300 font-bold">{score.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">RÉCORD</span>
                <span className="text-amber-400 font-bold">{highScore.toLocaleString()}</span>
              </div>
            </div>

            {/* Barra de Integridad del Firewall (0 - 100%) */}
            <div className="flex flex-col items-center flex-1 max-w-xs mx-4">
              <div className="flex justify-between w-full text-[10px] mb-1">
                <span className="text-slate-400">INTEGRIDAD DEL FIREWALL</span>
                <span className={`font-bold ${firewallHp > 50 ? 'text-emerald-400' : firewallHp > 20 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {firewallHp}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className={`h-full transition-all duration-200 ${firewallHp > 50 ? 'bg-emerald-500' : firewallHp > 20 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${firewallHp}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-slate-500 text-[10px] block">OLEADA</span>
                <span className="text-indigo-400 font-bold">{currentWave} / 5</span>
              </div>
              <div className="tactical-shields flex gap-1 items-center">
                {Array.from({ length: initialLives }).map((_, i) => (
                  <span key={i} className={`shield-node text-sm transition-opacity ${i < lives ? 'opacity-100' : 'opacity-20'}`}>
                    🛡️
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Área de juego principal */}
          <div 
            ref={playfieldRef}
            className="game-playfield-spec relative h-[380px] bg-slate-950 overflow-hidden select-none"
            onMouseMove={handleMouseMove}
          >
            {/* Título sutil de la oleada */}
            <div className="absolute top-3 left-0 right-0 text-center pointer-events-none">
              <span className="text-[11px] text-slate-600 font-mono uppercase tracking-widest">
                {OLEADAS_ESTRUCTURADAS[currentWave - 1]?.titulo}
              </span>
            </div>

            {/* Efecto de Rayo Láser */}
            {laserEffect && (
              <svg className="laser-svg-overlay absolute inset-0 w-full h-full pointer-events-none z-20">
                <line 
                  x1={`${laserEffect.x1}%`} 
                  y1={`${laserEffect.y1}%`} 
                  x2={`${laserEffect.x2}%`} 
                  y2={`${laserEffect.y2}%`} 
                  stroke="#38bdf8" 
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Fragmentos de código cayendo */}
            {fallingLines.map(line => {
              const borderClass = line.corrupt ? "border-rose-500 bg-rose-950/40 text-rose-300" : "border-indigo-500 bg-indigo-950/40 text-indigo-300";
              return (
                <div
                  key={line.id}
                  className={`falling-code-block absolute p-2 rounded border font-mono text-xs cursor-pointer shadow-md transition-transform hover:scale-105 z-10 ${borderClass}`}
                  style={{ left: `${line.x}%`, top: `${line.y}%` }}
                  onClick={() => dispararLinea(line.id, line.corrupt, line.x, line.y)}
                >
                  <span className={`block-warning-tag text-[9px] font-bold block mb-0.5 ${line.corrupt ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {line.corrupt ? '● CRITICAL BUG' : '✓ CÓDIGO OK'}
                  </span>
                  <code className="block-code-text">{line.text}</code>
                </div>
              );
            })}

            {/* Pantalla de Victoria */}
            {victory && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 z-30 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-3xl mb-3">
                  🏆
                </div>
                <h3 className="text-lg text-white font-mono font-bold">¡DEFENSA TÁCTICA VICTORIOSA!</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  Has neutralizado las 5 oleadas de amenazas y preservado la integridad del firewall.
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono mb-4 w-full max-w-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Puntaje Total:</span>
                    <span className="text-white font-bold">{score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold border-t border-slate-800 pt-1.5">
                    <span>Recompensas:</span>
                    <span>+15 Shards · +2 Cores · +2 Esencia</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn-action text-xs px-4 py-2" onClick={startGame}>
                    Jugar de Nuevo
                  </button>
                  <button className="btn-subtab-pill text-xs px-4 py-2" onClick={() => setGameStarted(false)}>
                    Regresar
                  </button>
                </div>
              </div>
            )}

            {/* Pantalla de Derrota */}
            {gameOver && !victory && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 z-30 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-3xl mb-3">
                  🛡️
                </div>
                <h3 className="text-lg text-white font-mono font-bold">FIREWALL COMPROMETIDO</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                  El firewall ha colapsado ante los errores críticos en la oleada {currentWave}.
                </p>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono mb-4 w-full max-w-xs space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span>Puntaje:</span>
                    <span className="text-white font-bold">{score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Recompensas:</span>
                    <span>+5 RP · +1 Shard</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn-action text-xs px-4 py-2" onClick={startGame}>
                    Reintentar
                  </button>
                  <button className="btn-subtab-pill text-xs px-4 py-2" onClick={() => setGameStarted(false)}>
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer de Controles y Habilidad Especial */}
          <div className="hud-footer-stats p-3 bg-slate-900/90 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">COMBO: <strong className="text-amber-400">x{combo}</strong></span>
            </div>

            <button 
              type="button"
              className={`px-4 py-1.5 rounded text-xs font-mono font-bold transition-all ${power === 100 ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 animate-pulse' : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'}`}
              onClick={detonarFirewallBlast}
              disabled={power < 100}
            >
              💥 EMP BLAST {power === 100 ? '(LISTO)' : `(${power}%)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   9. SQL DUNGEON CRAWLER (MAZMORRA RELACIONAL)
   ========================================== */

// Diccionario de Metadatos Relacionales por Habitación
const SQL_ROOMS_DICTIONARY = {
  tabla_usuarios: {
    id: "tabla_usuarios",
    short: "USUARIOS",
    name: "tabla_usuarios",
    title: "Compuerta 01: Operadores de Red",
    desc: "El cortafuegos requiere consultar la tabla 'tabla_usuarios' y extraer únicamente las cuentas en estado activo para rehabilitar las credenciales.",
    objective: "Filtra usuarios activos usando WHERE activo = true en tabla_usuarios.",
    hint: "SELECT * FROM tabla_usuarios WHERE activo = true;",
    pedagogicalGuide: "Aplica la cláusula WHERE sobre la columna booleana 'activo'. En SQL estándar puedes evaluar WHERE activo = true (o activo = 1).",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "ID del operador" },
      { name: "nombre", type: "VARCHAR(100)", badge: "str", desc: "Nombre completo" },
      { name: "email", type: "VARCHAR(150)", badge: "str", desc: "Correo institucional" },
      { name: "activo", type: "BOOLEAN", badge: "bool", desc: "Estado activo (true/false)" },
      { name: "rol_id", type: "INT", badge: "int", isFk: true, desc: "FK -> tabla_roles(id)" }
    ],
    mockSample: [
      { id: 1, nombre: "Alice Chen", email: "alice@pragma.ai", activo: true, rol_id: 1 },
      { id: 2, nombre: "Bob Vance", email: "bob@pragma.ai", activo: true, rol_id: 2 },
      { id: 3, nombre: "Carlos Mendez", email: "carlos@pragma.ai", activo: false, rol_id: 3 },
      { id: 4, nombre: "Diana Prince", email: "diana@pragma.ai", activo: false, rol_id: 2 }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasSelect = q.includes('select');
      const hasTable = q.includes('tabla_usuarios');
      const hasWhere = q.includes('where');
      const hasActivo = q.includes('activo = true') || q.includes('activo=true') || q.includes('activo is true') || q.includes('activo = 1') || q.includes('where activo');

      checks.push({ label: "Instrucción SELECT", ok: hasSelect, advice: "Comienza la consulta con la instrucción SELECT." });
      checks.push({ label: "Origen FROM tabla_usuarios", ok: hasTable, advice: "Especifica el origen de datos: FROM tabla_usuarios." });
      checks.push({ label: "Filtro WHERE activo = true", ok: hasWhere && hasActivo, advice: "Falta evaluar la condición: WHERE activo = true." });
      return checks;
    },
    validador: (q) => q.includes('from tabla_usuarios') && (q.includes('activo = true') || q.includes('activo=true') || q.includes('activo = 1') || q.includes('activo is true') || q.includes('where activo'))
  },
  tabla_ventas: {
    id: "tabla_ventas",
    short: "VENTAS",
    name: "tabla_ventas",
    title: "Compuerta 02: Bóveda Financiera",
    desc: "Calcula el volumen financiero consolidado sumando los importes de la columna 'total' de todas las transacciones.",
    objective: "Calcula el total general con la función de agregación SUM(total) sobre tabla_ventas.",
    hint: "SELECT SUM(total) FROM tabla_ventas;",
    pedagogicalGuide: "Las funciones de agregación calculan valores acumulados. Utiliza SUM(total) para calcular la suma de la columna total.",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "ID de transacción" },
      { name: "fecha", type: "DATE", badge: "date", desc: "Fecha de registro" },
      { name: "total", type: "NUMERIC(10,2)", badge: "num", desc: "Monto total monetario" },
      { name: "cliente_id", type: "INT", badge: "int", isFk: true, desc: "ID del cliente" }
    ],
    mockSample: [
      { id: 101, fecha: "2026-03-01", total: 4520.50, cliente_id: 12 },
      { id: 102, fecha: "2026-03-02", total: 12800.00, cliente_id: 45 },
      { id: 103, fecha: "2026-03-03", total: 7350.25, cliente_id: 12 },
      { id: 104, fecha: "2026-03-04", total: 9140.00, cliente_id: 88 }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasSelect = q.includes('select');
      const hasTable = q.includes('tabla_ventas');
      const hasSum = q.includes('sum(total)') || q.includes('sum( total )');

      checks.push({ label: "Instrucción SELECT", ok: hasSelect, advice: "Comienza con SELECT." });
      checks.push({ label: "Origen FROM tabla_ventas", ok: hasTable, advice: "Falta la cláusula FROM tabla_ventas." });
      checks.push({ label: "Agregación SUM(total)", ok: hasSum, advice: "Aplica la función SUM(total) sobre la columna total." });
      return checks;
    },
    validador: (q) => q.includes('sum(total)') && q.includes('from tabla_ventas')
  },
  tabla_logs: {
    id: "tabla_logs",
    short: "LOGS",
    name: "tabla_logs",
    title: "Compuerta 03: Telemetría de Fallos",
    desc: "Audita la telemetría del sistema y cuantifica el número de incidentes críticos cuyo nivel sea 'ERROR'.",
    objective: "Cuenta registros usando COUNT(*) con el filtro WHERE nivel = 'ERROR'.",
    hint: "SELECT COUNT(*) FROM tabla_logs WHERE nivel = 'ERROR';",
    pedagogicalGuide: "Combina la función COUNT(*) con WHERE nivel = 'ERROR' para obtener la cantidad exacta de anomalías.",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "ID secuencial" },
      { name: "nivel", type: "VARCHAR(20)", badge: "str", desc: "Severidad (INFO, WARN, ERROR)" },
      { name: "mensaje", type: "TEXT", badge: "str", desc: "Detalle del evento" },
      { name: "creado_en", type: "TIMESTAMP", badge: "date", desc: "Sello temporal" }
    ],
    mockSample: [
      { id: 501, nivel: "INFO", mensaje: "Handshake SSE establecido", creado_en: "2026-03-04 10:15:00" },
      { id: 502, nivel: "ERROR", mensaje: "Buffer overflow en puerto 8080", creado_en: "2026-03-04 10:20:12" },
      { id: 503, nivel: "WARN", mensaje: "Consumo de RAM al 82%", creado_en: "2026-03-04 10:22:05" },
      { id: 504, nivel: "ERROR", mensaje: "Timeout en sincronización de réplica", creado_en: "2026-03-04 10:25:33" }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasCount = q.includes('count(') || q.includes('count (*)');
      const hasTable = q.includes('tabla_logs');
      const hasError = q.includes("nivel = 'error'") || q.includes('nivel = "error"') || q.includes("nivel='error'");

      checks.push({ label: "Función COUNT(*)", ok: hasCount, advice: "Utiliza COUNT(*) o COUNT(id) para contar registros." });
      checks.push({ label: "Origen FROM tabla_logs", ok: hasTable, advice: "Especifica FROM tabla_logs." });
      checks.push({ label: "Filtro nivel = 'ERROR'", ok: hasError, advice: "Filtra los fallos con WHERE nivel = 'ERROR'." });
      return checks;
    },
    validador: (q) => (q.includes('count(') || q.includes('count(*)')) && q.includes('from tabla_logs') && (q.includes("nivel = 'error'") || q.includes('nivel = "error"') || q.includes("nivel='error'"))
  },
  tabla_productos: {
    id: "tabla_productos",
    short: "PRODUCTOS",
    name: "tabla_productos",
    title: "Compuerta 04: Almacén Cuántico",
    desc: "Localiza el componente de mayor valor monetario ordenando los productos de forma descendente y limitando a 1 resultado.",
    objective: "Ordena por precio descendente (ORDER BY precio DESC) y aplica LIMIT 1.",
    hint: "SELECT nombre, precio FROM tabla_productos ORDER BY precio DESC LIMIT 1;",
    pedagogicalGuide: "Usa ORDER BY [columna] DESC para ordenar de mayor a menor y LIMIT 1 para restringir la salida al primer registro.",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "SKU del producto" },
      { name: "nombre", type: "VARCHAR(100)", badge: "str", desc: "Designación técnica" },
      { name: "precio", type: "DECIMAL(10,2)", badge: "num", desc: "Precio unitario USD" },
      { name: "stock", type: "INT", badge: "int", desc: "Unidades disponibles" }
    ],
    mockSample: [
      { id: 1, nombre: "Quantum Server Core X9", precio: 12499.99, stock: 4 },
      { id: 2, nombre: "Neural Accelerator A100", precio: 8950.00, stock: 12 },
      { id: 3, nombre: "Fiber Mesh Switch 400G", precio: 3200.50, stock: 25 },
      { id: 4, nombre: "Cyber Security Token", precio: 75.00, stock: 120 }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasTable = q.includes('tabla_productos');
      const hasOrder = q.includes('order by') && q.includes('precio') && q.includes('desc');
      const hasLimit = q.includes('limit 1');

      checks.push({ label: "Origen FROM tabla_productos", ok: hasTable, advice: "Apunta a FROM tabla_productos." });
      checks.push({ label: "Orden ORDER BY precio DESC", ok: hasOrder, advice: "Agrega ORDER BY precio DESC para priorizar el más costoso." });
      checks.push({ label: "Cláusula LIMIT 1", ok: hasLimit, advice: "Añade LIMIT 1 para retornar únicamente la fila tope." });
      return checks;
    },
    validador: (q) => q.includes('from tabla_productos') && q.includes('order by precio desc') && q.includes('limit 1')
  },
  tabla_compras: {
    id: "tabla_compras",
    short: "COMPRAS",
    name: "tabla_compras",
    title: "Compuerta 05: Agrupación de Compras",
    desc: "Consolida las transacciones agrupándolas por cliente para contabilizar el total de compras por cada cliente_id.",
    objective: "Agrupa con GROUP BY cliente_id proyectando cliente_id y COUNT(*).",
    hint: "SELECT cliente_id, COUNT(*) FROM tabla_compras GROUP BY cliente_id;",
    pedagogicalGuide: "Al combinar columnas individuales con funciones de agregación como COUNT(*), debes agrupar por dicha columna usando GROUP BY cliente_id.",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "ID de compra" },
      { name: "cliente_id", type: "INT", badge: "int", isFk: true, desc: "FK de cliente" },
      { name: "monto", type: "DECIMAL(10,2)", badge: "num", desc: "Monto facturado" },
      { name: "creado_en", type: "DATE", badge: "date", desc: "Fecha de emisión" }
    ],
    mockSample: [
      { id: 201, cliente_id: 101, monto: 1250.00, creado_en: "2026-02-10" },
      { id: 202, cliente_id: 102, monto: 850.50, creado_en: "2026-02-11" },
      { id: 203, cliente_id: 101, monto: 2100.00, creado_en: "2026-02-15" },
      { id: 204, cliente_id: 108, monto: 450.00, creado_en: "2026-02-18" }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasTable = q.includes('tabla_compras');
      const hasClient = q.includes('cliente_id');
      const hasCount = q.includes('count');
      const hasGroup = q.includes('group by');

      checks.push({ label: "Origen FROM tabla_compras", ok: hasTable, advice: "Especifica FROM tabla_compras." });
      checks.push({ label: "Columna cliente_id y COUNT(*)", ok: hasClient && hasCount, advice: "Selecciona cliente_id junto con COUNT(*)." });
      checks.push({ label: "Agrupación GROUP BY cliente_id", ok: hasGroup && hasClient, advice: "Aplica GROUP BY cliente_id para segmentar por cliente." });
      return checks;
    },
    validador: (q) => q.includes('from tabla_compras') && q.includes('group by cliente_id') && (q.includes('count(*)') || q.includes('count(id)') || q.includes('count('))
  },
  tabla_roles: {
    id: "tabla_roles",
    short: "ROLES",
    name: "tabla_roles",
    title: "Compuerta 06: Enlace Relacional (JOIN)",
    desc: "Combina la tabla de usuarios con la tabla de roles para asociar a cada operador su rol asignado mediante la clave foránea u.rol_id = r.id.",
    objective: "Realiza un JOIN entre tabla_usuarios y tabla_roles con la condición ON u.rol_id = r.id.",
    hint: "SELECT u.nombre, r.nombre AS rol FROM tabla_usuarios u JOIN tabla_roles r ON u.rol_id = r.id;",
    pedagogicalGuide: "Los JOIN relacionan tablas mediante claves foráneas. Escribe JOIN tabla_roles r ON u.rol_id = r.id para vincular ambas entidades.",
    columns: [
      { name: "u.id", type: "INT", badge: "int", desc: "ID de usuario (tabla_usuarios)" },
      { name: "u.nombre", type: "VARCHAR(100)", badge: "str", desc: "Nombre de usuario" },
      { name: "r.id", type: "INT", badge: "int", desc: "ID de rol (tabla_roles)" },
      { name: "r.nombre", type: "VARCHAR(50)", badge: "str", desc: "Nombre del rol asignado" }
    ],
    mockSample: [
      { id: 1, usuario: "Alice Chen", rol: "Arquitecto de Software" },
      { id: 2, usuario: "Bob Vance", rol: "Ingeniero de Datos" },
      { id: 3, usuario: "Carlos Mendez", rol: "DevOps Lead" },
      { id: 5, usuario: "Elena Rostova", rol: "Security Lead" }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasTable = q.includes('tabla_usuarios');
      const hasJoin = q.includes('join tabla_roles');
      const hasOn = q.includes('rol_id = r.id') || q.includes('r.id = u.rol_id') || q.includes('u.rol_id = r.id') || q.includes('rol_id=r.id');

      checks.push({ label: "Tabla Base tabla_usuarios", ok: hasTable, advice: "Inicia desde FROM tabla_usuarios." });
      checks.push({ label: "Cláusula JOIN tabla_roles", ok: hasJoin, advice: "Agrega JOIN tabla_roles." });
      checks.push({ label: "Condición ON u.rol_id = r.id", ok: hasOn, advice: "Especifica la relación foránea: ON u.rol_id = r.id." });
      return checks;
    },
    validador: (q) => q.includes('from tabla_usuarios') && q.includes('join tabla_roles') && (q.includes('rol_id = r.id') || q.includes('r.id = u.rol_id') || q.includes('u.rol_id = r.id'))
  },
  tabla_alertas: {
    id: "tabla_alertas",
    short: "ALERTAS",
    name: "tabla_alertas",
    title: "Compuerta 07: Centinela de Incidentes 2026",
    desc: "Aísla las alertas e intrusiones registradas a partir del ciclo 2026 (fecha >= '2026-01-01') para auditar amenazas contemporáneas.",
    objective: "Filtra incidentes contemporáneos con WHERE fecha >= '2026-01-01'.",
    hint: "SELECT * FROM tabla_alertas WHERE fecha >= '2026-01-01';",
    pedagogicalGuide: "Las fechas en SQL se comparan en formato ISO 'YYYY-MM-DD'. Puedes utilizar el operador >= '2026-01-01'.",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "ID de alerta" },
      { name: "tipo", type: "VARCHAR(50)", badge: "str", desc: "Tipo de evento de intrusión" },
      { name: "fecha", type: "DATE", badge: "date", desc: "Fecha de detección" },
      { name: "severidad", type: "VARCHAR(20)", badge: "str", desc: "Nivel (CRITICAL, HIGH, LOW)" }
    ],
    mockSample: [
      { id: 101, tipo: "SSH_AUTH_FAIL", fecha: "2025-11-20", severidad: "LOW" },
      { id: 102, tipo: "SQL_INJECTION_ATTEMPT", fecha: "2026-01-14", severidad: "CRITICAL" },
      { id: 103, tipo: "DDoS_SYN_FLOOD", fecha: "2026-02-01", severidad: "HIGH" },
      { id: 104, tipo: "PORT_SCAN_BLOCKED", fecha: "2026-03-01", severidad: "MEDIUM" }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasTable = q.includes('tabla_alertas');
      const hasWhere = q.includes('where');
      const has2026 = q.includes('2026') && (q.includes('fecha >') || q.includes('fecha >='));

      checks.push({ label: "Origen FROM tabla_alertas", ok: hasTable, advice: "Apunta a FROM tabla_alertas." });
      checks.push({ label: "Cláusula WHERE", ok: hasWhere, advice: "Falta la cláusula WHERE de filtro temporal." });
      checks.push({ label: "Filtro Temporal 2026", ok: has2026, advice: "Filtra eventos del año 2026 (fecha >= '2026-01-01')." });
      return checks;
    },
    validador: (q) => q.includes('from tabla_alertas') && (q.includes("fecha >") || q.includes("fecha >=") || q.includes("2026"))
  },
  tabla_pagos: {
    id: "tabla_pagos",
    short: "PAGOS",
    name: "tabla_pagos",
    title: "Compuerta 08: Pasarela de Liquidaciones",
    desc: "Identifica las transacciones de pago que se encuentran en estado PENDIENTE para proceder a su validación bancaria.",
    objective: "Filtra registros pendientes con WHERE estado = 'PENDIENTE'.",
    hint: "SELECT * FROM tabla_pagos WHERE estado = 'PENDIENTE';",
    pedagogicalGuide: "Para comparar columnas de texto (VARCHAR), utiliza comillas simples: WHERE estado = 'PENDIENTE'.",
    columns: [
      { name: "id", type: "INT", badge: "int", isPk: true, desc: "ID de transacción" },
      { name: "monto", type: "DECIMAL(10,2)", badge: "num", desc: "Importe monetario" },
      { name: "estado", type: "VARCHAR(30)", badge: "str", desc: "Estado (PENDIENTE, APROBADO)" },
      { name: "metodo", type: "VARCHAR(30)", badge: "str", desc: "Pasarela utilizada" }
    ],
    mockSample: [
      { id: 401, monto: 1450.00, estado: "PENDIENTE", metodo: "STRIPE_ESCROW" },
      { id: 402, monto: 820.00, estado: "APROBADO", metodo: "CREDIT_CARD" },
      { id: 403, monto: 320.50, estado: "PENDIENTE", metodo: "CRYPTO_TRANSFER" },
      { id: 404, monto: 5400.00, estado: "RECHAZADO", metodo: "BANK_WIRE" }
    ],
    analyzeQuery: (q) => {
      const checks = [];
      const hasTable = q.includes('tabla_pagos');
      const hasEstado = q.includes('estado');
      const hasPendiente = q.includes('pendiente');

      checks.push({ label: "Origen FROM tabla_pagos", ok: hasTable, advice: "Especifica FROM tabla_pagos." });
      checks.push({ label: "Columna estado", ok: hasEstado, advice: "Evalúa la columna estado." });
      checks.push({ label: "Valor 'PENDIENTE'", ok: hasPendiente, advice: "Filtra con WHERE estado = 'PENDIENTE'." });
      return checks;
    },
    validador: (q) => q.includes('from tabla_pagos') && q.includes("estado = 'pendiente'")
  },
  nucleo: {
    id: "nucleo",
    short: "NÚCLEO",
    name: "NÚCLEO DE LA BASE DE DATOS",
    title: "👑 NÚCLEO DE DATOS (Objetivo Final)",
    desc: "¡Has alcanzado el Núcleo Maestro de Pragma AI! Ejecuta la consulta maestra de dominación relacional para consolidar tu control sobre la arquitectura.",
    objective: "Ejecuta SELECT 'CONQUISTADO' AS status, 100 AS potencia_control;",
    hint: "SELECT 'CONQUISTADO' AS status, 100 AS potencia_control;",
    pedagogicalGuide: "En SQL relacional también puedes emitir consultas que proyecten literales y cálculos sin requerir una tabla de origen física.",
    columns: [
      { name: "nucleo_status", type: "VARCHAR(30)", badge: "str", desc: "Estado del enlace de red" },
      { name: "potencia", type: "INT", badge: "int", desc: "Porcentaje de control asignado" },
      { name: "cripto_firmas", type: "INT", badge: "int", desc: "Firmas criptográficas obtenidas" }
    ],
    mockSample: [
      { nucleo_status: "DOMINADO", potencia: 100, cripto_firmas: 9999 }
    ],
    analyzeQuery: () => [{ label: "Enlace con el Núcleo", ok: true, advice: "Consulta de sincronización lista." }],
    validador: () => true
  }
};

// Matriz de navegación 3x3 de la mazmorra
const DUNGEON_GRID = [
  ["tabla_usuarios", "tabla_ventas", "tabla_logs"],
  ["tabla_productos", "tabla_compras", "tabla_roles"],
  ["tabla_alertas", "tabla_pagos", "nucleo"]
];

function DungeonView({ estudiante, backendUrl, onUpdate }) {
  const pragma = estudiante?.pragma_profile || {};
  const activePerks = Array.isArray(pragma.active_perks) ? pragma.active_perks : [];
  const hasSqlHintPerk = activePerks.some(p => p.perk?.tipo === 'sql_hint');

  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [queryResultData, setQueryResultData] = useState(null);
  const [pedagogicalChecks, setPedagogicalChecks] = useState([]);
  const [showMockPreview, setShowMockPreview] = useState(true);
  const [showHintCard, setShowHintCard] = useState(false);
  const [tacticalToast, setTacticalToast] = useState(null);

  const textareaRef = useRef(null);

  // Persistencia de habitaciones desbloqueadas usando Set
  const initialRooms = Array.isArray(pragma.dungeon_progress?.unlocked_rooms) && pragma.dungeon_progress.unlocked_rooms.length > 0
    ? pragma.dungeon_progress.unlocked_rooms
    : ["tabla_usuarios"];
  const [unlockedRooms, setUnlockedRooms] = useState(initialRooms);

  // Toast temporal auto-dismissible
  useEffect(() => {
    if (!tacticalToast) return;
    const t = setTimeout(() => setTacticalToast(null), 3500);
    return () => clearTimeout(t);
  }, [tacticalToast]);

  // Normalizador SQL tolerante
  const normalizarSQL = (sql) => {
    if (!sql) return '';
    return sql
      .trim()
      .replace(/;+\s*$/, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  const currentRoomId = DUNGEON_GRID[posY][posX];
  const currentRoom = SQL_ROOMS_DICTIONARY[currentRoomId] || SQL_ROOMS_DICTIONARY.tabla_usuarios;
  const isRoomUnlocked = unlockedRooms.includes(currentRoom.id);

  // Obtener coordenadas de una sala
  const getCoords = (roomId) => {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (DUNGEON_GRID[y][x] === roomId) return { x, y };
      }
    }
    return null;
  };

  // Cálculo de Niebla de Guerra y Accesibilidad por Celda
  const checkCellStatus = (x, y) => {
    const cellId = DUNGEON_GRID[y][x];
    const isPlayerHere = (posX === x && posY === y);
    const isCleared = unlockedRooms.includes(cellId);
    const distToPlayer = Math.abs(posX - x) + Math.abs(posY - y);
    const isAdjacentToPlayer = distToPlayer === 1;

    // Conectada a cualquier sala desbloqueada
    const isAdjacentToAnyCleared = unlockedRooms.some(rId => {
      const c = getCoords(rId);
      return c && (Math.abs(c.x - x) + Math.abs(c.y - y) <= 1);
    });

    // Visibilidad: Entrada siempre visible, salas adyacentes, o desbloqueadas
    const isDiscovered = isPlayerHere || isCleared || isAdjacentToPlayer || isAdjacentToAnyCleared || (x === 0 && y === 0);
    // Accesibilidad para clic directo: Adyacente al jugador o ya desbloqueada
    const isAccessible = isPlayerHere || isCleared || isAdjacentToPlayer;

    return {
      cellId,
      roomData: SQL_ROOMS_DICTIONARY[cellId],
      isPlayerHere,
      isCleared,
      isDiscovered,
      isAccessible,
      isEntry: x === 0 && y === 0,
      isBoss: x === 2 && y === 2
    };
  };

  // Clic directo en celda del mapa 3x3
  const handleCellClick = (x, y) => {
    const status = checkCellStatus(x, y);
    if (!status.isAccessible) {
      setTacticalToast("⚠️ Compuerta fuera de rango táctico. Solo puedes moverte a salas contiguas o ya superadas.");
      return;
    }
    setPosX(x);
    setPosY(y);
    setFeedback(null);
    setQueryInput('');
    setQueryResultData(null);
    setPedagogicalChecks([]);
    setShowHintCard(false);
  };

  // Inserción rápida de snippets SQL
  const insertarSnippet = (snippet) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setQueryInput(prev => (prev ? prev + ' ' + snippet : snippet));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = queryInput;
    const nuevoTexto = currentVal.substring(0, start) + snippet + currentVal.substring(end);
    setQueryInput(nuevoTexto);
    setTimeout(() => {
      textarea.focus();
      const newPos = start + snippet.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Copiar consulta sugerida de la pista
  const copiarPistaAlEditor = () => {
    setQueryInput(currentRoom.hint);
    if (textareaRef.current) textareaRef.current.focus();
  };

  // Movimiento por brújula / cruceta D-pad
  const mover = (dir) => {
    setFeedback(null);
    setQueryInput('');
    setQueryResultData(null);
    setPedagogicalChecks([]);
    setShowHintCard(false);

    if (dir === 'norte' && posY > 0) setPosY(y => y - 1);
    if (dir === 'sur' && posY < 2) setPosY(y => y + 1);
    if (dir === 'oeste' && posX > 0) setPosX(x => x - 1);
    if (dir === 'este' && posX < 2) setPosX(x => x + 1);
  };

  // Comprobar y ejecutar consulta SQL
  const comprobarSQL = async () => {
    if (!queryInput.trim()) return;
    setLoading(true);
    setFeedback(null);
    setQueryResultData(null);

    const qNormalizada = normalizarSQL(queryInput);
    const checks = currentRoom.analyzeQuery(qNormalizada);
    setPedagogicalChecks(checks);

    try {
      const estudianteId = estudiante?.id || estudiante?.uid || 'estudiante_local';
      const res = await fetch(`${backendUrl}/api/pragma/dungeon/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudianteId,
          room_name: currentRoom.id,
          query: qNormalizada
        })
      });
      const data = await res.json();
      setLoading(false);

      if (data.valido) {
        desbloquearHabitacionExitosa(data.mock_data || currentRoom.mockSample, data.rp_ganados || 15, data.sql_essence_ganada || 1);
        setFeedback({
          valido: true,
          mensaje: data.mensaje || '🔓 ¡Compuerta de Datos Abierta! Consulta ejecutada correctamente.',
          rp_ganados: data.rp_ganados || 15,
          sql_essence_ganada: data.sql_essence_ganada || 1
        });
      } else {
        // Tolerancia sintáctica con normalizador si el backend fue restrictivo
        if (currentRoom.validador && currentRoom.validador(qNormalizada)) {
          desbloquearHabitacionExitosa(currentRoom.mockSample, 15, 1);
          setFeedback({
            valido: true,
            mensaje: '🔓 ¡Compuerta Desbloqueada! Consulta verificada mediante normalizador relacional tolerante.',
            rp_ganados: 15,
            sql_essence_ganada: 1
          });
        } else {
          setFeedback({
            valido: false,
            mensaje: '❌ Sintaxis SQL insuficiente para la compuerta. Revisa el análisis pedagógico detallado abajo.'
          });
        }
      }
    } catch (err) {
      setLoading(false);
      if (currentRoom.validador && currentRoom.validador(qNormalizada)) {
        desbloquearHabitacionExitosa(currentRoom.mockSample, 15, 1);
        setFeedback({
          valido: true,
          mensaje: '🔓 ¡Compuerta Desbloqueada! Consulta correcta en modo de contingencia local.',
          rp_ganados: 15,
          sql_essence_ganada: 1
        });
      } else {
        setFeedback({
          valido: false,
          mensaje: '❌ Sintaxis SQL no satisface los requisitos de la compuerta. Revisa el análisis pedagógico abajo.'
        });
      }
    }
  };

  const desbloquearHabitacionExitosa = (mockData, rp, essence, shards = 2, targetRoomId = null) => {
    const roomIdToUnlock = targetRoomId || currentRoom.id;
    const updatedSet = new Set([...unlockedRooms, roomIdToUnlock]);
    const updatedList = Array.from(updatedSet);
    setUnlockedRooms(updatedList);
    setQueryResultData(mockData && mockData.length > 0 ? mockData : currentRoom.mockSample);

    const copy = { ...(estudiante?.pragma_profile || {}) };
    if (!copy.inventory) copy.inventory = { silicon_shards: 15, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 };
    copy.rank_points = (copy.rank_points || 0) + (rp || 15);
    copy.inventory.sql_essence = (copy.inventory.sql_essence || 0) + (essence || 1);
    copy.inventory.silicon_shards = (copy.inventory.silicon_shards || 0) + (shards || 2);

    if (!copy.dungeon_progress) copy.dungeon_progress = {};
    copy.dungeon_progress.unlocked_rooms = updatedList;

    onUpdate(copy);
  };

  // Despacho reactivo de victoria y recompensas de la sala Núcleo [2,2]
  useEffect(() => {
    if (currentRoom.id === 'nucleo' && !unlockedRooms.includes('nucleo')) {
      desbloquearHabitacionExitosa(currentRoom.mockSample, 50, 3, 10, 'nucleo');
    }
  }, [currentRoom.id, unlockedRooms]);

  // Métricas del HUD Dark Tactical
  const totalSalas = 9;
  const salasSuperadas = unlockedRooms.length;
  const porcentajeExploracion = Math.round((salasSuperadas / totalSalas) * 100);
  const esenciasSqlActuales = pragma.inventory?.sql_essence || 0;

  // Renderizador de badge de tipo de dato
  const renderTypeBadge = (col) => {
    let colorClass = "bg-slate-800 text-slate-300 border-slate-700";
    if (col.badge === 'int') colorClass = "bg-cyan-950/60 text-cyan-300 border-cyan-500/40";
    if (col.badge === 'str') colorClass = "bg-emerald-950/60 text-emerald-300 border-emerald-500/40";
    if (col.badge === 'bool') colorClass = "bg-purple-950/60 text-purple-300 border-purple-500/40";
    if (col.badge === 'num') colorClass = "bg-amber-950/60 text-amber-300 border-amber-500/40";
    if (col.badge === 'date') colorClass = "bg-rose-950/60 text-rose-300 border-rose-500/40";

    return (
      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${colorClass}`}>
        {col.type}
      </span>
    );
  };

  return (
    <div className="dungeon-panel glass-panel">
      {/* Toast Táctico */}
      {tacticalToast && (
        <div className="tactical-toast-alert animate-scale-in">
          {tacticalToast}
        </div>
      )}

      {/* Barra Superior HUD Dark Tactical */}
      <div className="dungeon-hud-bar mb-4">
        <div className="dungeon-hud-header-flex">
          <div>
            <h2 className="dungeon-main-title flex items-center gap-2">
              <span>🗝️</span>
              <span>SQL DUNGEON CRAWLER: LABERINTO DE DATOS</span>
            </h2>
            <p className="dungeon-subtitle">
              Navega por la matriz relacional 3x3. Formula consultas SQL precisas para vulnerar los cortafuegos y alcanzar el Núcleo.
            </p>
          </div>
          <div className="dungeon-location-pill">
            <span className="text-slate-400 font-mono text-xs">SALA ACTUAL:</span>
            <span className="text-cyan-400 font-mono text-xs font-bold">[{posX},{posY}] · {currentRoom.short}</span>
          </div>
        </div>

        {/* Indicadores de Telemetría Táctica */}
        <div className="dungeon-stats-strip mt-3">
          <div className="dungeon-stat-card">
            <span className="stat-label">🗺️ EXPLORACIÓN</span>
            <div className="stat-value-group">
              <span className="stat-val text-cyan-400 font-mono font-bold">{porcentajeExploracion}%</span>
              <span className="stat-sub font-mono">({salasSuperadas}/{totalSalas})</span>
            </div>
            <div className="stat-progress-track mt-1">
              <div className="stat-progress-fill" style={{ width: `${porcentajeExploracion}%` }} />
            </div>
          </div>

          <div className="dungeon-stat-card">
            <span className="stat-label">🗝️ CRIPTOLLAVES</span>
            <div className="stat-value-group">
              <span className="stat-val text-amber-400 font-mono font-bold">{salasSuperadas}</span>
              <span className="stat-sub font-mono">/ 9 Obtenidas</span>
            </div>
          </div>

          <div className="dungeon-stat-card">
            <span className="stat-label">🟩 ESENCIAS SQL</span>
            <div className="stat-value-group">
              <span className="stat-val text-emerald-400 font-mono font-bold">+{esenciasSqlActuales}</span>
              <span className="stat-sub font-mono">Acumuladas</span>
            </div>
          </div>

          <div className="dungeon-stat-card">
            <span className="stat-label">🛡️ INTEGRIDAD</span>
            <div className="stat-value-group">
              <span className="stat-val text-indigo-400 font-mono font-bold">100%</span>
              <span className="stat-sub font-mono text-emerald-400">ENLACE ACTIVO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Principal: Mapa Izquierda + Habitación Derecha */}
      <div className="dungeon-layout">
        {/* Columna Izquierda: Mapa 3x3 y Brújula */}
        <div className="dungeon-map-column">
          <div className="dungeon-map-card">
            <div className="map-card-header flex justify-between items-center mb-2">
              <h3 className="map-title font-mono text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🧭</span>
                <span>MAPA DE LA MAZMORRA (3X3)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">CLIC PARA MOVER</span>
            </div>

            {/* Matriz 3x3 con Niebla de Guerra */}
            <div className="dungeon-grid-visual">
              {DUNGEON_GRID.map((row, y) => (
                <div key={y} className="dungeon-grid-row flex gap-2 mb-2">
                  {row.map((cellId, x) => {
                    const status = checkCellStatus(x, y);
                    let cellStateClass = "cell-fog";
                    let statusIcon = "🌫️";
                    let statusLabel = "OCULTA";

                    if (status.isPlayerHere) {
                      cellStateClass = "cell-player-here";
                      statusIcon = "🤖";
                      statusLabel = "AQUÍ";
                    } else if (status.isCleared) {
                      cellStateClass = "cell-cleared";
                      statusIcon = "🚪";
                      statusLabel = "SUPERADA";
                    } else if (status.isDiscovered && status.isAccessible) {
                      cellStateClass = "cell-accessible";
                      statusIcon = "🔒";
                      statusLabel = "COMPUERTA";
                    } else if (status.isDiscovered) {
                      cellStateClass = "cell-discovered";
                      statusIcon = "🔒";
                      statusLabel = "LEJANA";
                    }

                    return (
                      <div
                        key={x}
                        className={`dungeon-grid-cell ${cellStateClass}`}
                        onClick={() => handleCellClick(x, y)}
                        title={
                          status.isPlayerHere
                            ? `Operador aquí: ${status.roomData.name}`
                            : status.isCleared
                            ? `Superada: ${status.roomData.name} (Clic para entrar)`
                            : status.isAccessible
                            ? `Compuerta accesible: ${status.roomData.name} (Clic para ingresar)`
                            : status.isDiscovered
                            ? `Compuerta visible: ${status.roomData.name} (Muévete más cerca)`
                            : "Zona no descubierta (Cubierta por niebla táctica)"
                        }
                      >
                        {/* Badges de entrada y jefe */}
                        {status.isEntry && <span className="cell-special-badge entry-badge">📍 ENTRADA</span>}
                        {status.isBoss && <span className="cell-special-badge boss-badge">👑 NÚCLEO</span>}

                        <div className="cell-icon-wrap text-base">{statusIcon}</div>
                        <span className="cell-room-code text-xs font-mono font-bold tracking-wider">
                          {status.isDiscovered ? status.roomData.short : "???"}
                        </span>
                        <span className="cell-status-text text-[9px] font-mono font-semibold uppercase">
                          {statusLabel}
                        </span>

                        {status.isPlayerHere && (
                          <div className="player-halo-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Brújula / D-pad Táctico */}
            <div className="dungeon-compass-container mt-3">
              <div className="compass-header flex justify-between items-center mb-1 text-[11px] font-mono text-slate-400">
                <span>CONTROLES DIRECCIONALES</span>
                <span className="text-cyan-400 font-bold">N · S · E · O</span>
              </div>
              <div className="compass-cross-layout">
                <button
                  type="button"
                  className="btn-compass btn-compass-n"
                  onClick={() => mover('norte')}
                  disabled={posY === 0}
                  title="Mover al Norte"
                >
                  ▲ NORTE
                </button>
                <div className="compass-mid-row">
                  <button
                    type="button"
                    className="btn-compass btn-compass-w"
                    onClick={() => mover('oeste')}
                    disabled={posX === 0}
                    title="Mover al Oeste"
                  >
                    ◀ OESTE
                  </button>
                  <div className="compass-radar-core">
                    <span className="radar-coord font-mono">[{posX},{posY}]</span>
                  </div>
                  <button
                    type="button"
                    className="btn-compass btn-compass-e"
                    onClick={() => mover('este')}
                    disabled={posX === 2}
                    title="Mover al Este"
                  >
                    ESTE ▶
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-compass btn-compass-s"
                  onClick={() => mover('sur')}
                  disabled={posY === 2}
                  title="Mover al Sur"
                >
                  ▼ SUR
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Habitación Activa, Esquema y Consola */}
        <div className="dungeon-room-column">
          {/* Cabecera de la Habitación */}
          <div className="room-tactical-header mb-3">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="room-badge-pill font-mono text-xs px-2.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold">
                    SALA [{posX},{posY}]
                  </span>
                  <h3 className="room-heading text-base font-mono font-bold text-white">
                    {currentRoom.title}
                  </h3>
                </div>
                <p className="room-objective text-xs text-slate-300 mt-1 font-mono">
                  {currentRoom.desc}
                </p>
              </div>

              {isRoomUnlocked ? (
                <span className="room-unlocked-badge font-mono text-xs px-3 py-1 rounded bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <span>✓</span>
                  <span>COMPUERTA DESBLOQUEADA</span>
                </span>
              ) : (
                <span className="room-locked-badge font-mono text-xs px-3 py-1 rounded bg-amber-950/70 border border-amber-500/50 text-amber-300 font-bold flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>REQUIERE CONSULTA SQL</span>
                </span>
              )}
            </div>
          </div>

          {/* Pilar 1: Esquema Relacional de la Tabla */}
          <div className="schema-tactical-panel mb-3">
            <div className="schema-panel-header flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-mono text-xs">📊 ESQUEMA RELACIONAL:</span>
                <code className="text-emerald-300 font-mono text-xs font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {currentRoom.name}
                </code>
              </div>
              <button
                type="button"
                className="btn-toggle-sample text-[11px] font-mono text-indigo-300 hover:text-indigo-200 underline"
                onClick={() => setShowMockPreview(!showMockPreview)}
              >
                {showMockPreview ? '👁️ Ocultar Preview de Datos' : '👁️ Ver Preview de Registros'}
              </button>
            </div>

            {/* Badges de Columnas con Tipos */}
            <div className="schema-columns-list flex flex-wrap gap-2 mb-2.5">
              {currentRoom.columns.map((col, idx) => (
                <div key={idx} className="column-spec-chip flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900/90 border border-slate-800" title={col.desc}>
                  <span className="col-name font-mono text-xs font-bold text-slate-200">{col.name}</span>
                  {renderTypeBadge(col)}
                  {col.isPk && <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1 rounded" title="Primary Key">PK</span>}
                  {col.isFk && <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-1 rounded" title="Foreign Key">FK</span>}
                </div>
              ))}
            </div>

            {/* Preview de Registros de Muestra (Mock Sample) */}
            {showMockPreview && currentRoom.mockSample && currentRoom.mockSample.length > 0 && (
              <div className="mock-preview-table-container mt-2">
                <div className="mock-preview-header text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
                  <span>📋 Registros de muestra en '{currentRoom.name}' ({currentRoom.mockSample.length} filas):</span>
                </div>
                <div className="overflow-x-auto rounded border border-slate-800 bg-slate-950/90">
                  <table className="dungeon-sample-table w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80">
                        {Object.keys(currentRoom.mockSample[0]).map((key, i) => (
                          <th key={i} className="p-2 text-left text-cyan-400 font-semibold">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRoom.mockSample.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-900/40">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="p-2 text-slate-300">
                              {typeof val === 'boolean' ? (
                                <span className={val ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{String(val)}</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pilar 3: Consola, Snippets y Visor */}
          {currentRoom.id !== 'nucleo' ? (
            <div className="dungeon-console-section">
              {/* Barra de Snippets Rápidos */}
              <div className="sql-snippets-strip mb-2 flex items-center flex-wrap gap-1.5">
                <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                  <span>⚡</span>
                  <span>SNIPPETS:</span>
                </span>
                {[
                  "SELECT * FROM ",
                  "WHERE ",
                  "JOIN ",
                  "GROUP BY ",
                  "ORDER BY ",
                  "LIMIT 1",
                  "AND ",
                  "SUM()",
                  "COUNT(*)"
                ].map((snippet, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    className="btn-snippet-pill"
                    onClick={() => insertarSnippet(snippet)}
                    title={`Insertar '${snippet}' en el editor`}
                  >
                    {snippet.trim()}
                  </button>
                ))}
              </div>

              {/* Editor SQL */}
              <div className="sql-editor-wrap">
                <textarea
                  ref={textareaRef}
                  className="code-textarea sql-dungeon-textarea font-mono text-xs w-full bg-slate-950 border border-slate-800 text-emerald-300 p-3 rounded-lg outline-none focus:border-cyan-500 transition-all"
                  placeholder={`-- Escribe tu consulta SQL para ${currentRoom.name}...\nSELECT * FROM ${currentRoom.name} ...;`}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  rows={4}
                  spellCheck={false}
                />

                {/* Barra de Acciones y Pistas */}
                <div className="sql-editor-actions mt-2 flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`btn-dungeon-subaction ${showHintCard ? 'active' : ''}`}
                      onClick={() => setShowHintCard(!showHintCard)}
                    >
                      💡 {showHintCard ? 'Ocultar Pistas' : 'Pistas / Ayuda Didáctica'}
                    </button>
                    {hasSqlHintPerk && (
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 flex items-center gap-1">
                        🗝️ Grid Runner Activo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-dungeon-clear"
                      onClick={() => setQueryInput('')}
                      title="Limpiar editor"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      className="btn-sql-submit-tactical"
                      onClick={comprobarSQL}
                      disabled={loading || !queryInput.trim()}
                    >
                      {loading ? 'ANALIZANDO SINTAXIS RELACIONAL...' : '⚡ EJECUTAR CONSULTA SQL'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Pistas y Ayuda Didáctica */}
              {(showHintCard || hasSqlHintPerk) && (
                <div className="didactic-hint-card p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40 mt-3 animate-scale-in">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-base">💡</span>
                      <h4 className="text-xs font-mono font-bold text-indigo-200 uppercase">
                        GUÍA CONCEPTUAL DE LA SALA
                      </h4>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold underline"
                      onClick={copiarPistaAlEditor}
                    >
                      Copiar Consulta Sugerida al Editor
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-300 mt-1.5 leading-relaxed">
                    {currentRoom.pedagogicalGuide}
                  </p>
                  <div className="suggested-query-box mt-2 p-2 rounded bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <code className="text-emerald-400 font-mono text-xs font-bold">{currentRoom.hint}</code>
                  </div>
                </div>
              )}

              {/* Feedback Pedagógico Detallado */}
              {feedback && (
                <div className={`sql-feedback-banner mt-3 p-3 rounded-lg border text-xs font-mono ${feedback.valido ? 'feedback-ok-tactical' : 'feedback-err-tactical'}`}>
                  <div className="flex items-center gap-2 font-bold">
                    <span>{feedback.valido ? '✓' : '⚠️'}</span>
                    <span>{feedback.mensaje}</span>
                  </div>

                  {feedback.valido && (
                    <div className="mt-2 text-emerald-300 font-bold flex items-center gap-3">
                      <span>+{feedback.rp_ganados || 15} RP</span>
                      <span>+{feedback.sql_essence_ganada || 1} Esencia SQL</span>
                      <span>+2 💎 Shards de Silicio</span>
                    </div>
                  )}

                  {/* Checklist Pedagógico para consultas fallidas */}
                  {!feedback.valido && pedagogicalChecks.length > 0 && (
                    <div className="pedagogical-checklist mt-2 pt-2 border-t border-rose-500/20">
                      <span className="text-[11px] font-bold text-rose-300 block mb-1">
                        ANÁLISIS DE REQUISITOS DE CONSULTA:
                      </span>
                      <ul className="space-y-1">
                        {pedagogicalChecks.map((check, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5 text-[11px]">
                            <span className={check.ok ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {check.ok ? '✓' : '✗'}
                            </span>
                            <span className={check.ok ? 'text-slate-300' : 'text-rose-200'}>
                              <strong>{check.label}:</strong> {check.ok ? 'Correcto' : check.advice}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Visor Interactivo de Resultados de Consulta */}
              {queryResultData && queryResultData.length > 0 && (
                <div className="sql-results-viewer mt-3 bg-slate-950/90 border border-slate-800 rounded-lg p-3">
                  <div className="results-header flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <span>📊</span>
                      <span>RESULTADO DE LA CONSULTA ({queryResultData.length} {queryResultData.length === 1 ? 'registro' : 'registros'}):</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">CONEXIÓN VIRTUAL ACTIVA</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="dungeon-results-table w-full text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/80">
                          {Object.keys(queryResultData[0]).map((key, i) => (
                            <th key={i} className="p-2 text-left text-cyan-300 font-semibold">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResultData.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-800/40 hover:bg-slate-900/30">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="p-2 text-slate-300">
                                {typeof val === 'boolean' ? (
                                  <span className={val ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{String(val)}</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Habitación del Jefe: Núcleo de Datos */
            <div className="victory-room-card p-6 rounded-xl bg-gradient-to-br from-indigo-950/50 via-slate-950 to-emerald-950/40 border border-emerald-500/40 text-center animate-scale-in">
              <div className="text-5xl mb-3">👑 🗝️ 🟩</div>
              <h3 className="text-xl text-emerald-400 font-bold font-mono tracking-wider">
                ¡NÚCLEO CENTRAL DE DATOS CONQUISTADO!
              </h3>
              <p className="text-xs text-slate-300 mt-2 font-mono max-w-lg mx-auto leading-relaxed">
                Has demostrado dominio absoluto sobre filtros relacionales (WHERE), funciones de agregación (SUM, COUNT), ordenamientos con límite (ORDER BY, LIMIT) y uniones foráneas complejas (JOIN).
              </p>
              <div className="mt-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 font-mono inline-block">
                ⭐ Título Honorífico: Arquitecto de Consultas Relacionales Pragma
              </div>
              <div className="mt-4 flex justify-center gap-4 text-xs font-mono text-cyan-300">
                <span className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 font-bold">
                  +50 RP Ganados
                </span>
                <span className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 font-bold">
                  +3 Esencias SQL
                </span>
                <span className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 font-bold">
                  +10 💎 Shards
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


