import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Trash2, ShieldAlert, Check, X, 
  Settings, Gamepad2, Award, Zap, Code, Shield, HelpCircle, Swords, Play, Trophy
} from 'lucide-react';
import './PragmaGames.css';

// Audios Lo-Fi públicos libres de copyright
const LOFI_TRACKS = [
  { title: "Cyber Sunset Chill", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Neon Rain Whispers", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Binary Lullaby", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function PragmaGames({ estudiante, onUpdateEstudiante, backendUrl, listaAmigos }) {
  const [selectedSubTab, setSelectedSubTab] = useState('lobby'); // lobby, copiloto, runas, zen, taberna, forja, tinder, defense, dungeon
  const pragmaProfile = estudiante?.pragma_profile || {
    rank_points: 0,
    inventory: { silicon_shards: 10, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 },
    unlocked_runes: [],
    unlocked_cosmetics: [],
    equipped_cosmetics: { map_skin: "default", star_aura: "none", laser_color: "#00ffcc" }
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
      {/* Encabezado del Perfil Pragma */}
      <div className="pragma-header-panel">
        <div className="pragma-user-badge">
          <div className="avatar-glowing" style={{ borderColor: pragmaProfile.equipped_cosmetics.laser_color }}>
            <span className="avatar-txt">⚡</span>
          </div>
          <div>
            <h3>{estudiante.nombre} <span className="rank-badge">Rango {Math.floor(pragmaProfile.rank_points / 100) + 1}</span></h3>
            <p className="rank-pts">{pragmaProfile.rank_points} RP • Cosmético: {pragmaProfile.equipped_cosmetics.map_skin}</p>
          </div>
        </div>
        
        {/* Inventario Rápido */}
        <div className="pragma-inventory-strip">
          <div className="inv-item" title="Silicon Shards">💎 {pragmaProfile.inventory.silicon_shards} Shards</div>
          <div className="inv-item" title="Memory Threads">🧵 {pragmaProfile.inventory.memory_threads} Threads</div>
          <div className="inv-item" title="Logic Cores">🔮 {pragmaProfile.inventory.logic_cores} Cores</div>
          <div className="inv-item" title="JS Essence">🟨 {pragmaProfile.inventory.javascript_essence || 0} JS</div>
          <div className="inv-item" title="Python Essence">🟦 {pragmaProfile.inventory.python_essence || 0} Py</div>
          <div className="inv-item" title="SQL Essence">🟩 {pragmaProfile.inventory.sql_essence || 0} SQL</div>
        </div>
      </div>

      {/* Sub-Navegación Ciberpunk */}
      <div className="pragma-nav-strip">
        <button className={selectedSubTab === 'lobby' ? 'active' : ''} onClick={() => setSelectedSubTab('lobby')}>⚔️ Multijugador</button>
        <button className={selectedSubTab === 'copiloto' ? 'active' : ''} onClick={() => setSelectedSubTab('copiloto')}>🤖 Copiloto</button>
        <button className={selectedSubTab === 'zen' ? 'active' : ''} onClick={() => setSelectedSubTab('zen')}>🧘 Modo Zen</button>
        <button className={selectedSubTab === 'taberna' ? 'active' : ''} onClick={() => setSelectedSubTab('taberna')}>🍺 La Taberna</button>
        <button className={selectedSubTab === 'forja' ? 'active' : ''} onClick={() => setSelectedSubTab('forja')}>🔨 La Forja</button>
        <button className={selectedSubTab === 'runas' ? 'active' : ''} onClick={() => setSelectedSubTab('runas')}>📖 Grimorio</button>
        <button className={selectedSubTab === 'tinder' ? 'active' : ''} onClick={() => setSelectedSubTab('tinder')}>🔥 Tinder Code</button>
        <button className={selectedSubTab === 'defense' ? 'active' : ''} onClick={() => setSelectedSubTab('defense')}>🛡️ Defense</button>
        <button className={selectedSubTab === 'dungeon' ? 'active' : ''} onClick={() => setSelectedSubTab('dungeon')}>🗝️ SQL Dungeon</button>
      </div>

      {/* Pantalla Activa */}
      <div className="pragma-game-screen">
        {selectedSubTab === 'lobby' && <LobbyView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} listaAmigos={listaAmigos} />}
        {selectedSubTab === 'copiloto' && <CopilotoView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'zen' && <ZenView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'taberna' && <TabernaView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'forja' && <ForjaView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
        {selectedSubTab === 'runas' && <RunasView pragmaProfile={pragmaProfile} />}
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
function LobbyView({ estudiante, backendUrl, onUpdate, listaAmigos = [] }) {
  const [matchType, setMatchType] = useState('1v1');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  
  // Slots estáticos para Naranja y Azul (4 slots cada uno por defecto)
  const [orangeSlots, setOrangeSlots] = useState([
    { type: 'master', name: estudiante.nombre },
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

  // Referencias para timers
  const timerRef = useRef(null);
  const matchIntervalRef = useRef(null);

  // Retos disponibles en la simulación
  const RETOS_MULTIPLAYER = {
    arcade: [
      {
        id: 'trivia_1',
        tipo: 'trivia',
        titulo: 'Complejidad Computacional',
        pregunta: '¿Cuál es la complejidad temporal promedio de búsqueda en un Map/Set bien balanceado?',
        opciones: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
        correcta: 2,
        explicacion: 'Las tablas Hash permiten acceso en O(1) promedio gracias a su función hash.'
      },
      {
        id: 'trivia_2',
        tipo: 'trivia',
        titulo: 'React Hooks',
        pregunta: '¿Qué Hook de React se utiliza para memorizar una función costosa y evitar recrearla en cada render?',
        opciones: ['useMemo', 'useCallback', 'useRef', 'useEffect'],
        correcta: 1,
        explicacion: 'useCallback memoriza una función en lugar de su valor de retorno.'
      },
      {
        id: 'trivia_3',
        tipo: 'trivia',
        titulo: 'Event Loop',
        pregunta: '¿En qué orden se procesan las Microtareas (promesas) en comparación con las Macrotareas (setTimeout) en JS?',
        opciones: [
          'Se ejecutan después de las macrotareas',
          'Tienen prioridad y se ejecutan antes del siguiente ciclo de macrotareas',
          'Se ejecutan en paralelo en diferentes hilos',
          'El navegador decide aleatoriamente'
        ],
        correcta: 1,
        explicacion: 'La cola de microtareas se vacía por completo antes de ejecutar la siguiente macrotarea.'
      }
    ],
    pragma: [
      {
        id: 'zen_1',
        tipo: 'zen',
        titulo: 'Recursión Segura',
        descripcion: 'Completa la línea de control del caso base recursivo para evitar que un número negativo cause un Stack Overflow.',
        codigoInicial: `function factorial(n) {
  // Escribe aquí la validación correcta del parámetro n (n <= 0 o similar)
  if (______) return 1;
  return n * factorial(n - 1);
}`,
        validador: (codigo) => codigo.includes('n <= 0') || codigo.includes('n < 1') || codigo.includes('n <= 1'),
        guia: 'Ejemplo de entrada: n <= 0'
      },
      {
        id: 'tinder_1',
        tipo: 'tinder',
        titulo: 'Centrado Flexible',
        descripcion: 'Escribe la propiedad CSS correcta para centrar verticalmente elementos dentro de un contenedor flexible con dirección de columna.',
        codigoInicial: `.cyber-container {
  display: flex;
  flex-direction: column;
  /* Centrar verticalmente en flex-direction: column */
  justify-content: ______;
}`,
        validador: (codigo) => codigo.includes('center') && codigo.includes('justify-content'),
        guia: 'Ejemplo de entrada: justify-content: center;'
      }
    ]
  };

  const inviteFriend = (friend, team, slotIndex) => {
    setShowInviteModal(false);
    const setSlots = team === 'orange' ? setOrangeSlots : setBlueSlots;
    
    // Cambiar estado del slot a enviando
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = { type: 'inviting', status: 'sending', name: friend.nombre };
      return next;
    });

    setTimeout(() => {
      // 80% de probabilidad de aceptar
      const acepta = Math.random() < 0.80;
      
      setSlots(prev => {
        const next = [...prev];
        if (next[slotIndex] && next[slotIndex].type === 'inviting') {
          next[slotIndex] = { 
            type: 'inviting',
            status: acepta ? 'accepted' : 'rejected', 
            name: friend.nombre 
          };
        }
        return next;
      });

      if (acepta) {
        setTimeout(() => {
          setSlots(prev => {
            const next = [...prev];
            next[slotIndex] = { 
              type: 'friend', 
              name: friend.nombre, 
              tech: friend.tecnologia_actual || 'JavaScript',
              friendObj: friend 
            };
            return next;
          });
        }, 1200);
      } else {
        setTimeout(() => {
          setSlots(prev => {
            const next = [...prev];
            next[slotIndex] = null;
            return next;
          });
        }, 2200);
      }
    }, 1800);
  };

  const removeFriend = (team, slotIndex) => {
    const setSlots = team === 'orange' ? setOrangeSlots : setBlueSlots;
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const startMatchmaking = () => {
    setShowMasterConfig(true);
  };

  const confirmAndSearch = () => {
    setShowMasterConfig(false);
    setSearching(true);
    setSearchTimer(0);
    setBattleResult(null);

    let sec = 0;
    timerRef.current = setInterval(() => {
      sec++;
      setSearchTimer(sec);

      // Encontrar partida después de 4 segundos
      if (sec >= 4) {
        clearInterval(timerRef.current);
        setSearching(false);
        initiateActiveMatch();
      }
    }, 1000);
  };

  const initiateActiveMatch = () => {
    // Escoger los retos según la configuración del Master
    let retosElegidos = [];
    if (challengeCategory === 'arcade') {
      retosElegidos = [...RETOS_MULTIPLAYER.arcade];
    } else if (challengeCategory === 'pragma') {
      retosElegidos = [...RETOS_MULTIPLAYER.pragma];
    } else {
      retosElegidos = [...RETOS_MULTIPLAYER.arcade.slice(0, 2), RETOS_MULTIPLAYER.pragma[0]];
    }

    let finalPlayers = [];
    const maxSlots = matchType === '2v2' ? 2 : 4;

    if (matchType === '1v1') {
      const isMasterOrange = orangeSlots.some(s => s?.type === 'master');
      const masterTeam = isMasterOrange ? 'orange' : 'blue';
      const rivalTeam = masterTeam === 'orange' ? 'blue' : 'orange';
      finalPlayers = [
        { id: 'self', nombre: estudiante.nombre, avatar: '⚡', team: masterTeam, isSelf: true, progress: 0, errors: 0, finished: false, time: null },
        { id: 'rival1', nombre: 'CYBER_PUNK', avatar: '🕶️', team: rivalTeam, isSelf: false, progress: 0, errors: 0, finished: false, time: null }
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
      retos: retosElegidos,
      retoActualIndice: 0,
      userTriviaRespuestas: {},
      userCodigoInput: retosElegidos[0].tipo !== 'trivia' ? retosElegidos[0].codigoInicial : '',
      userProgress: 0,
      userErrors: 0,
      userFinished: false,
      userTime: 0,
      timeLeft: 60,
      players: finalPlayers
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
              time: prev.userFinished ? p.time : (p.time || 0) + 1
            };
          }

          if (p.finished) return p;

          // Incremento aleatorio de progreso
          const randIncrement = Math.floor(Math.random() * 8) + 4;
          const nextProgress = Math.min(p.progress + randIncrement, 100);
          const finished = nextProgress >= 100;
          
          // Posible error aleatorio (10% de probabilidad por segundo)
          const hadError = Math.random() < 0.1;
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

  // Enviar respuesta en Trivia
  const handleTriviaAnswer = (opcionIndex) => {
    setActiveMatch(prev => {
      if (!prev) return null;
      const currentChallenge = prev.retos[prev.retoActualIndice];
      const esCorrecta = opcionIndex === currentChallenge.correcta;

      let nextErrors = prev.userErrors;
      let progressIncrement = 0;
      let nextFinished = false;

      if (esCorrecta) {
        progressIncrement = Math.ceil(100 / prev.retos.length);
      } else {
        nextErrors += 1;
      }

      const nextUserProgress = Math.min(prev.userProgress + (esCorrecta ? progressIncrement : 0), 100);
      const isLastChallenge = prev.retoActualIndice === prev.retos.length - 1;

      // Si es correcta avanzamos de reto
      let nextChallengeIndex = prev.retoActualIndice;
      if (esCorrecta) {
        if (isLastChallenge) {
          nextFinished = true;
        } else {
          nextChallengeIndex += 1;
        }
      }

      const nextChallenge = prev.retos[nextChallengeIndex];

      return {
        ...prev,
        userProgress: nextUserProgress,
        userErrors: nextErrors,
        retoActualIndice: nextChallengeIndex,
        userFinished: nextFinished,
        userCodigoInput: nextChallenge && nextChallenge.tipo !== 'trivia' ? nextChallenge.codigoInicial : ''
      };
    });
  };

  // Enviar validación de código en Zen/Tinder
  const handleCodeSubmit = () => {
    setActiveMatch(prev => {
      if (!prev) return null;
      const currentChallenge = prev.retos[prev.retoActualIndice];
      const esValido = currentChallenge.validador(prev.userCodigoInput);

      let nextErrors = prev.userErrors;
      let progressIncrement = 0;
      let nextFinished = false;

      if (esValido) {
        progressIncrement = Math.ceil(100 / prev.retos.length);
      } else {
        nextErrors += 1;
      }

      const nextUserProgress = Math.min(prev.userProgress + (esValido ? progressIncrement : 0), 100);
      const isLastChallenge = prev.retoActualIndice === prev.retos.length - 1;

      let nextChallengeIndex = prev.retoActualIndice;
      if (esValido) {
        if (isLastChallenge) {
          nextFinished = true;
        } else {
          nextChallengeIndex += 1;
        }
      }

      const nextChallenge = prev.retos[nextChallengeIndex];

      return {
        ...prev,
        userProgress: nextUserProgress,
        userErrors: nextErrors,
        retoActualIndice: nextChallengeIndex,
        userFinished: nextFinished,
        userCodigoInput: nextChallenge && nextChallenge.tipo !== 'trivia' ? nextChallenge.codigoInicial : ''
      };
    });
  };

  // Cálculo de Puntuaciones y Ganador
  const calculateFinalResult = (finalState) => {
    clearInterval(matchIntervalRef.current);

    // Calcular puntaje de cada jugador
    const finalPlayers = finalState.players.map(p => {
      const completionScore = p.progress * 10;
      const errorPenalty = p.errors * 15;
      const timePenalty = (p.time || 60) * 2;
      const finalScore = Math.max(0, completionScore - errorPenalty - timePenalty);

      return {
        ...p,
        score: Math.round(finalScore)
      };
    });

    // Ordenar de mayor a menor puntuación
    finalPlayers.sort((a, b) => b.score - a.score);

    // Calcular puntaje total del equipo
    const orangeTeamScore = finalPlayers.filter(p => p.team === 'orange').reduce((acc, curr) => acc + curr.score, 0);
    const blueTeamScore = finalPlayers.filter(p => p.team === 'blue').reduce((acc, curr) => acc + curr.score, 0);

    const victoria = orangeTeamScore >= blueTeamScore;
    const rankPointsGained = victoria ? 25 : 10;
    const shardsGained = victoria ? 10 : 3;

    // Actualizar perfil del estudiante
    const profileCopy = { ...estudiante.pragma_profile };
    profileCopy.rank_points = (profileCopy.rank_points || 0) + rankPointsGained;
    profileCopy.inventory = profileCopy.inventory || {};
    profileCopy.inventory.silicon_shards = (profileCopy.inventory.silicon_shards || 0) + shardsGained;
    onUpdate(profileCopy);

    // Guardar estadísticas globales en Firestore
    try {
      fetch(`${backendUrl}/api/estudiantes/${estudiante.id}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ganada: victoria,
          lenguaje: estudiante.tecnologia_actual || 'JavaScript'
        })
      });
    } catch (err) {
      console.error(err);
    }

    setBattleResult({
      victoria,
      mensaje: victoria 
        ? `¡Victoria del Equipo Naranja! Tu escuadrón dominó la simulación por velocidad y limpieza de código.` 
        : `Derrota. El Escuadrón Azul resolvió los retos de forma más óptima y limpia.`,
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
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(matchIntervalRef.current);
    };
  }, []);

  const renderSlot = (team, slotIndex) => {
    const slot = team === 'orange' ? orangeSlots[slotIndex] : blueSlots[slotIndex];

    if (!slot) {
      return (
        <div key={`${team}-${slotIndex}`} className="lobby-player-slot empty">
          <button 
            className="invite-slot-btn" 
            onClick={() => {
              setInviteTarget({ team, index: slotIndex });
              setShowInviteModal(true);
            }}
          >
            <UserPlus size={16} className="mb-1 text-[#00ffcc]" />
            <span>INVITAR AMIGO</span>
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
          <div key={`${team}-${slotIndex}`} className="lobby-player-slot active inviting border-cyan-500 bg-cyan-950/20">
            <div className="slot-spinner animate-spin w-5 h-5 border-2 border-[#00ffcc] border-t-transparent rounded-full mb-2"></div>
            <div className="slot-info">
              <span className="slot-name text-slate-400">Enviando enlace...</span>
              <span className="slot-role text-[9px] text-[#00ffcc] animate-pulse">{slot.name}</span>
            </div>
            <button className="swap-slot-btn" onClick={() => swapTeam(team, slotIndex)} title="Intercambiar equipo">
              ⇄ INTERCAMBIAR
            </button>
          </div>
        );
      } else if (slot.status === 'accepted') {
        return (
          <div key={`${team}-${slotIndex}`} className="lobby-player-slot active accepted border-emerald-500 bg-emerald-950/20">
            <div className="slot-avatar text-emerald-400">✔️</div>
            <div className="slot-info">
              <span className="slot-name text-emerald-400">¡Aceptado!</span>
              <span className="slot-role text-emerald-400">{slot.name}</span>
            </div>
            <button className="swap-slot-btn" onClick={() => swapTeam(team, slotIndex)} title="Intercambiar equipo">
              ⇄ INTERCAMBIAR
            </button>
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
            <button className="swap-slot-btn" onClick={() => swapTeam(team, slotIndex)} title="Intercambiar equipo">
              ⇄ INTERCAMBIAR
            </button>
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
    <div className="lobby-panel glass-panel codewars-arena-panel crt-overlay">
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      {/* CABECERA MULTIJUGADOR */}
      <div className="arena-header">
        <div>
          <h2 className="arena-title">CODEWARS: MULTIPLAYER ARENA</h2>
          <div className="arena-sub-telemetry">
            <span>STATUS: <span className="text-green text-glow">ONLINE</span></span>
            <span style={{ marginLeft: '15px' }}>LOBBY: <span className="text-cyan text-glow">ALPHA-7</span></span>
          </div>
        </div>

        {searching && (
          <div className="queue-timer-badge">
            <span className="pulse-dot"></span>
            COLA ACTIVA: {matchType} | {Math.floor(searchTimer / 60).toString().padStart(2, '0')}:{(searchTimer % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* 1. SECCIÓN DE CREACIÓN DE LOBBY / GRUPO */}
      {!searching && !activeMatch && !battleResult && !showMasterConfig && (
        <div className="setup-container-spec">
          <p className="panel-desc">Empareja tu código con oponentes en tiempo real. Configura el modo de simulación táctica:</p>
          
          <div className="match-options-spec">
            <button className={`mode-card-btn duel ${matchType === '1v1' ? 'active' : ''}`} onClick={() => setMatchType('1v1')}>
              <span className="mode-title">1v1</span>
              <span className="mode-sub">DUEL</span>
            </button>
            <button className={`mode-card-btn team-match ${matchType === '2v2' ? 'active' : ''}`} onClick={() => setMatchType('2v2')}>
              <span className="mode-title">2v2</span>
              <span className="mode-sub">TEAM MATCH</span>
            </button>
            <button className={`mode-card-btn squad ${matchType === '4v4' ? 'active' : ''}`} onClick={() => setMatchType('4v4')}>
              <span className="mode-title">4v4</span>
              <span className="mode-sub">SQUAD BATTLE</span>
            </button>
          </div>

          {/* RENDERIZAR LOBBY DEL EQUIPO (SÓLO SI ES 2v2 o 4v4) */}
          {(matchType === '2v2' || matchType === '4v4') && (
            <div className="lobby-squad-container-vs w-full max-w-[950px] mt-6">
              <div className="lobby-vs-arena-layout">
                {/* LADO IZQUIERDO: EQUIPO NARANJA */}
                <div className="vs-team-column orange-team-column">
                  <div className="vs-team-header orange">
                    <span className="team-glow-text">🛡️ ESCUADRÓN NARANJA</span>
                    <span className="team-size-counter font-mono">
                      {orangeSlots.filter((s, idx) => s !== null && idx < (matchType === '2v2' ? 2 : 4)).length} / {matchType === '2v2' ? 2 : 4}
                    </span>
                  </div>
                  <div className="vs-slots-list">
                    {(matchType === '2v2' ? [0, 1] : [0, 1, 2, 3]).map(idx => renderSlot('orange', idx))}
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
                    <span className="team-glow-text text-cyan">🔮 ESCUADRÓN AZUL</span>
                    <span className="team-size-counter font-mono">
                      {blueSlots.filter((s, idx) => s !== null && idx < (matchType === '2v2' ? 2 : 4)).length} / {matchType === '2v2' ? 2 : 4}
                    </span>
                  </div>
                  <div className="vs-slots-list">
                    {(matchType === '2v2' ? [0, 1] : [0, 1, 2, 3]).map(idx => renderSlot('blue', idx))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <button className="btn-action-hud start-search-btn-hud mt-6" onClick={startMatchmaking}>
            INICIALIZAR MATCHMAKING
          </button>
        </div>
      )}

      {/* MODAL / SECTOR DE INVITACIÓN DE AMIGOS */}
      {showInviteModal && (
        <div className="cyber-modal-overlay">
          <div className="cyber-modal hud-panel-spec">
            <div className="panel-header-spec justify-between flex items-center mb-3">
              <h3 className="text-[#00ffcc] font-mono font-bold text-xs tracking-wider">🌐 PROTOCOLO DE CONEXIÓN SOCIAL</h3>
              <button 
                onClick={() => {
                  setShowInviteModal(false);
                  setFriendSearchQuery('');
                }} 
                className="text-rose-500 hover:text-rose-400 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {/* BARRA DE BÚSQUEDA CYBERPUNK */}
            <div className="search-bar-container mb-4">
              <input 
                type="text" 
                placeholder="BUSCAR OPERADOR SOCIAL POR NOMBRE O TECNOLOGÍA..." 
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                className="cyber-input font-mono text-xs w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white focus:border-[#00ffcc] outline-none"
              />
            </div>

            <div className="modal-friends-list flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {listaAmigos.filter(amigo => 
                amigo.nombre.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                (amigo.tecnologia_actual && amigo.tecnologia_actual.toLowerCase().includes(friendSearchQuery.toLowerCase()))
              ).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8 font-mono">No se encontraron operadores disponibles.</p>
              ) : (
                listaAmigos.filter(amigo => 
                  amigo.nombre.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
                  (amigo.tecnologia_actual && amigo.tecnologia_actual.toLowerCase().includes(friendSearchQuery.toLowerCase()))
                ).map((amigo) => {
                  const yaInvitado = 
                    orangeSlots.some(s => s && s.type === 'friend' && s.friendObj?.id === amigo.id) ||
                    blueSlots.some(s => s && s.type === 'friend' && s.friendObj?.id === amigo.id);
                  const inicial = amigo.nombre.charAt(0).toUpperCase();
                  
                  return (
                    <div key={amigo.id} className="friend-invite-row flex justify-between items-center p-3 rounded">
                      <div className="flex items-center gap-3">
                        <div className="friend-avatar-circle">
                          {inicial}
                        </div>
                        <div className="friend-details">
                          <span className="friend-name-text">{amigo.nombre}</span>
                          <span className="friend-tech-badge">
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
                        className={`hud-btn-action accept p-1.5 px-4 text-[10px] rounded font-mono font-bold uppercase transition ${
                          yaInvitado ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        {yaInvitado ? 'INVITADO' : 'INVITAR'}
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
          <h3 className="text-lg font-mono text-[#00ffcc] tracking-widest text-shadow mb-1">
            CONFIGURACIÓN DEL LÍDER DE ESCUADRÓN
          </h3>
          <p className="text-xs text-slate-400 font-mono mb-6">
            Selecciona el entorno de simulación que se sincronizará para todos los operadores en la partida:
          </p>

          <div className="config-grid-sections w-full max-w-[700px] flex flex-col gap-6">
            {/* Categoría de Retos */}
            <div className="config-group">
              <span className="text-[10px] text-[#00ffcc] font-mono font-bold tracking-wider block mb-2">MODO DE SIMULACIÓN / JUEGOS:</span>
              <div className="config-options-grid">
                <button 
                  className={`config-card-btn p-4 border text-left font-mono ${challengeCategory === 'mixed' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-slate-800 text-slate-400'}`} 
                  onClick={() => setChallengeCategory('mixed')}
                >
                  <div className="config-btn-content">
                    <span className="config-btn-title">🌐 TODO (MIXTO)</span>
                    <span className="config-btn-desc">Mezcla de minijuegos clásicos y Santuario Pragma AI.</span>
                  </div>
                </button>
                <button 
                  className={`config-card-btn p-4 border text-left font-mono ${challengeCategory === 'pragma' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-slate-800 text-slate-400'}`} 
                  onClick={() => setChallengeCategory('pragma')}
                >
                  <div className="config-btn-content">
                    <span className="config-btn-title">🧪 NUEVOS MODOS</span>
                    <span className="config-btn-desc">Acertijos del Santuario Zen y Tinder de CSS.</span>
                  </div>
                </button>
                <button 
                  className={`config-card-btn p-4 border text-left font-mono ${challengeCategory === 'arcade' ? 'border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/5' : 'border-slate-800 text-slate-400'}`} 
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
              <span className="text-[10px] text-[#00ffcc] font-mono font-bold tracking-wider block mb-2">DIFICULTAD DEL PROBLEMA:</span>
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
            <button className="hud-btn bg-[#00ffcc] border border-[#00ffcc] text-slate-950 font-bold py-2.5 px-4 text-xs flex-1 flex items-center justify-center gap-2" onClick={confirmAndSearch}>
              <Play size={14} /> BUSCAR RIVALES
            </button>
          </div>
        </div>
      )}

      {/* 3. BUSCANDO PARTIDA (MATCHMAKING) */}
      {searching && (
        <div className="arena-searching-layout">
          <div className="arena-searching-top">
            <div className="radar-tactical-container hud-panel-spec">
              <svg className="radar-vectorial animate-spin" style={{ animationDuration: '5s' }} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0, 243, 255, 0.25)" strokeWidth="1" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="1" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="1" />
                <path d="M100,100 L100,10 A90,90 0 0,1 190,100 Z" fill="url(#radar-gradient-spec)" opacity="0.35" />
                <defs>
                  <linearGradient id="radar-gradient-spec" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="radar-ping-dot animate-ping" />
            </div>

            <div className="telemetry-logs-side hud-panel-spec font-mono text-xs text-cyan-400">
              <p className="log-line opacity-90">[INFO] SINCRONIZANDO CONFIGURACIÓN DE RETOS...</p>
              <p className="log-line opacity-75">[MODE] {challengeCategory.toUpperCase()} | DIFICULTAD: {difficulty.toUpperCase()}</p>
              <p className="log-line text-amber-400 animate-pulse">[SCAN] BUSCANDO OPONENTES DE TAMAÑO {matchType}...</p>
              <p className="log-line opacity-85">[SUCCESS] SERVIDORES LISTOS - CREANDO ESCENARIO COGNITIVO COMPARTIDO</p>
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
              <div className="trivia-interactive-game">
                <p className="trivia-question">
                  {activeMatch.retos[activeMatch.retoActualIndice].pregunta}
                </p>
                <div className="trivia-options-grid">
                  {activeMatch.retos[activeMatch.retoActualIndice].opciones.map((opcion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      className="trivia-option-card"
                    >
                      <span className="option-badge">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text">{opcion}</span>
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
                  Has resuelto todos los desafíos de la simulación. Esperando a que el resto de los escuadrones finalicen sus respuestas...
                </p>
                <div className="spinner-hud mt-4 animate-spin w-6 h-6 border-2 border-t-[#00ffcc] border-slate-800 rounded-full" />
              </div>
            )}
          </div>

          {/* LADO DERECHO: TELEMETRÍA Y PROGRESO DE LOS ESCUADRONES EN TIEMPO REAL */}
          <div className="match-squads-telemetry flex flex-col gap-4">
            {/* ESCUADRÓN NARANJA (TU EQUIPO) */}
            <div className="hud-panel-spec p-4 bg-[#ff9900]/5 border-[#ff9900]/20 rounded-lg">
              <span className="text-[10px] text-[#ff9900] font-bold font-mono block mb-3 tracking-widest">
                ESCUADRÓN NARANJA (ALIADOS)
              </span>

              <div className="flex flex-col gap-3">
                {activeMatch.players.filter(p => p.team === 'orange').map(player => (
                  <div key={player.id} className="player-progress-bar-spec font-mono">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-white font-bold flex items-center gap-1">
                        {player.avatar} {player.nombre} {player.isSelf && <span className="text-[9px] text-[#00ffcc]">(Tú)</span>}
                      </span>
                      <span className={player.errors > 0 ? 'text-rose-500' : 'text-slate-400'}>
                        {player.errors > 0 ? `⚠️ ${player.errors} err` : 'Limpio'}
                      </span>
                    </div>
                    <div className="progress-track bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="progress-fill bg-[#ff9900] h-full transition-all duration-300"
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

            {/* ESCUADRÓN AZUL (ENEMIGOS) */}
            <div className="hud-panel-spec p-4 bg-[#00f3ff]/5 border-[#00f3ff]/20 rounded-lg">
              <span className="text-[10px] text-[#00f3ff] font-bold font-mono block mb-3 tracking-widest">
                ESCUADRÓN AZUL (RIVALES)
              </span>

              <div className="flex flex-col gap-3">
                {activeMatch.players.filter(p => p.team === 'blue').map(player => (
                  <div key={player.id} className="player-progress-bar-spec font-mono">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-white font-bold">
                        {player.avatar} {player.nombre}
                      </span>
                      <span className={player.errors > 0 ? 'text-rose-500' : 'text-slate-400'}>
                        {player.errors > 0 ? `⚠️ ${player.errors} err` : 'Limpio'}
                      </span>
                    </div>
                    <div className="progress-track bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div 
                        className="progress-fill bg-[#00f3ff] h-full transition-all duration-300"
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

      {/* 5. TABLA DE RESULTADOS DE BATTLE DE ESCUADRONES */}
      {battleResult && (
        <div className="battle-result-container spec-battle-result">
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>

          <div className={`result-header-spec ${battleResult.victoria ? 'win' : 'lose'}`}>
            {battleResult.victoria ? '🏆 SIMULACIÓN COMPLETADA CON ÉXITO' : '💀 FALLO EN EL FIREWALL'}
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
            <span className="text-[10px] text-[#00ffcc] font-mono tracking-widest block mb-3 text-center">TABLA TÁCTICA DE OPERADORES</span>
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
                      {player.team === 'orange' ? 'ESC. NARANJA' : 'ESC. AZUL'}
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
  const [codigoCorregido, setCodigoCorregido] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Problema estático inicial a resolver
  const bugOriginal = `function encontrarDuplicados(arr) {\n  let duplicados = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length; j++) {\n      if (arr[i] === arr[j]) {\n        duplicados.push(arr[i]);\n      }\n    }\n  }\n  return duplicados;\n}`;

  useEffect(() => {
    setCodigoCorregido(bugOriginal);
  }, []);

  const enviarAuditoria = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/copiloto/evaluar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          codigo_original: bugOriginal,
          codigo_corregido: codigoCorregido,
          justificacion_conceptual: justificacion
        })
      });
      const data = await res.json();
      setLoading(false);
      setResult(data);

      if (data.aprobado && data.puntaje >= 90) {
        const copy = { ...estudiante.pragma_profile };
        copy.rank_points += 15;
        copy.inventory.silicon_shards += 5;
        copy.inventory.memory_threads += 2;
        if (data.puntaje >= 95) {
          copy.unlocked_runes.push({
            id: Math.random().toString(),
            titulo: "Filtro Duplicados O(N)",
            codigo: codigoCorregido,
            fecha: new Date().toLocaleDateString()
          });
        }
        onUpdate(copy);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="copiloto-panel glass-panel">
      <h2>🤖 Copiloto de Depuración Conceptual</h2>
      <p className="panel-desc">Estudia el código roto, aplica la corrección lógica y justifica conceptualmente cuál era el error.</p>

      <div className="copiloto-grid">
        <div className="editor-side">
          <h4>Código con Bug (Editable):</h4>
          <textarea
            className="code-textarea"
            value={codigoCorregido}
            onChange={(e) => setCodigoCorregido(e.target.value)}
          />

          <h4>Justificación Conceptual del Bug:</h4>
          <textarea
            className="just-textarea"
            placeholder="Explica qué estaba mal en el algoritmo original (ej. bucle incorrecto, asignaciones erróneas, leaks de memoria)..."
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
          />

          <button className="btn-action" onClick={enviarAuditoria} disabled={loading}>
            {loading ? 'Analizando en Groq LPU...' : 'Auditar y Enviar'}
          </button>
        </div>

        <div className="console-side">
          <h4>Consola de Bug Simulada:</h4>
          <div className="terminal-box">
            <p className="term-err">[ERROR] encontrarDuplicados([1, 2, 2, 3]) retornó [1, 2, 2, 2, 2, 3] en lugar de [2].</p>
            <p className="term-info">&gt; Error lógico: Doble ciclo anidado compara elementos en la misma posición (i === j).</p>
            <p className="term-info">&gt; Severidad: Alta. Complejidad temporal O(N^2).</p>
          </div>
          {result && (
            <div className={`eval-result-card ${result.aprobado ? 'success' : 'fail'}`}>
              <h4>Evaluación del Copiloto:</h4>
              <p className="pts">Puntaje: {result.puntaje}/100 - {result.aprobado ? 'APROBADO' : 'CORRECCIÓN INSUFICIENTE'}</p>
              <p className="retro">{result.retroalimentacion}</p>
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
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [acertijo, setAcertijo] = useState(null);
  const [codigoZen, setCodigoZen] = useState('');
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(LOFI_TRACKS[trackIndex].url);
    audioRef.current.loop = true;
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [trackIndex]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Permiso de audio requerido"));
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    audioRef.current.pause();
    setTrackIndex((trackIndex + 1) % LOFI_TRACKS.length);
    setIsPlaying(false);
  };

  const pedirAcertijo = async () => {
    setLoading(true);
    setEvalResult(null);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/zen/acertijo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnologia: estudiante.tecnologia_actual, nivel: estudiante.nivel_actual })
      });
      const data = await res.json();
      setAcertijo(data);
      setCodigoZen(data.codigo_inicial);
      setLoading(false);
    } catch (err) {
      console.error(err);
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
          estudiante_id: estudiante.id,
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
        copy.rank_points += 5;
        copy.inventory.silicon_shards += 2;
        copy.inventory.memory_threads += 1;
        onUpdate(copy);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="zen-panel glass-panel">
      <div className="zen-header">
        <h2>🧘 Santuario de Código Zen</h2>
        
        {/* Reproductor Lo-Fi */}
        <div className="lofi-player">
          <span className="track-title">🎵 {LOFI_TRACKS[trackIndex].title}</span>
          <div className="player-controls">
            <button className="btn-glow btn-sm" onClick={togglePlay}>{isPlaying ? '❚❚ Pause' : '▶ Play'}</button>
            <button className="btn-glow btn-sm" onClick={nextTrack}>🔀 Siguiente</button>
          </div>
          {isPlaying && (
            <div className="audio-visualizer">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          )}
        </div>
      </div>

      <p className="panel-desc">Resuelve micro-acertijos rápidos para calmar la mente. Sin temporizadores, sin clasificaciones complejas. Inyecta shards y threads al inventario.</p>

      {!acertijo ? (
        <button className="btn-action" onClick={pedirAcertijo} disabled={loading}>
          {loading ? 'Generando paz digital...' : 'Obtener Micro-Acertijo Zen'}
        </button>
      ) : (
        <div className="zen-workspace">
          <h3>{acertijo.titulo}</h3>
          <p className="desc">{acertijo.descripcion}</p>

          <textarea
            className="code-textarea zen-textarea"
            value={codigoZen}
            onChange={(e) => setCodigoZen(e.target.value)}
          />

          <div className="zen-actions">
            <button className="btn-action" onClick={resolverAcertijo} disabled={loading}>Validar Código Zen</button>
            <button className="btn-glow" onClick={() => setAcertijo(null)}>Otro Acertijo</button>
          </div>

          {evalResult && (
            <div className={`eval-result-card ${evalResult.correcto ? 'success' : 'fail'}`}>
              <h4>{evalResult.correcto ? '✨ Acertijo Armonizado' : '❌ Desbalance de Lógica'}</h4>
              <p className="retro">{evalResult.explicacion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   4. LA TABERNA DEL CÓDIGO (OPTIMIZACIÓN EXTREMA)
   ========================================== */
function TabernaView({ estudiante, backendUrl, onUpdate }) {
  const [codigoOpt, setCodigoOpt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const scriptIneficiente = `// Misión: Filtrar números únicos en un array de 100k elementos\n// Restricción: Complejidad O(N) y RAM < 12MB\nfunction filtrarUnicos(arr) {\n  let unicos = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (unicos.indexOf(arr[i]) === -1) {\n      unicos.push(arr[i]);\n    }\n  }\n  return unicos;\n}`;

  useEffect(() => {
    setCodigoOpt(scriptIneficiente);
  }, []);

  const testOptimizar = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/taberna/optimizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: estudiante.id,
          codigo_usuario: codigoOpt,
          tecnologia: estudiante.tecnologia_actual
        })
      });
      const data = await res.json();
      setLoading(false);
      setResult(data);

      if (data.valido && data.memoria_simulada_mb < 12) {
        const copy = { ...estudiante.pragma_profile };
        copy.rank_points += 20;
        copy.inventory.logic_cores += 1;
        copy.inventory.javascript_essence = (copy.inventory.javascript_essence || 0) + 2;
        onUpdate(copy);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="taberna-panel glass-panel">
      <h2>🍺 La Taberna del Código (Optimización Extrema)</h2>
      <p className="panel-desc">Refactoriza scripts lentos y pesados. Groq auditará tu algoritmo y simulará la memoria y CPU en tiempo real. Exige Big-O O(N) o mejor.</p>

      <div className="taberna-grid">
        <div className="workspace-opt">
          <textarea
            className="code-textarea opt-textarea"
            value={codigoOpt}
            onChange={(e) => setCodigoOpt(e.target.value)}
          />
          <button className="btn-action" onClick={testOptimizar} disabled={loading}>
            {loading ? 'Compilando y Ejecutando Profiler...' : 'Refactorizar y Ejecutar'}
          </button>
        </div>

        <div className="profiler-side">
          <h4>Gráficas de Rendimiento en Tiempo Real:</h4>
          
          <div className="metrics-box">
            <div className="metric">
              <span>RAM Consumida:</span>
              <div className="progress-bar-container">
                <div className="bar-fill" style={{ width: result ? `${(result.memoria_simulada_mb / 20) * 100}%` : '85%', backgroundColor: result?.memoria_simulada_mb < 12 ? '#00ff66' : '#ff0055' }}></div>
              </div>
              <span className="metric-val">{result ? `${result.memoria_simulada_mb} MB` : '18.4 MB (Alto)'}</span>
            </div>

            <div className="metric">
              <span>Complejidad Big-O:</span>
              <span className="metric-val font-neon">{result ? result.complejidad_temporal : 'O(N^2) (Malo)'}</span>
            </div>
          </div>

          {result && (
            <div className={`eval-result-card ${result.valido && result.memoria_simulada_mb < 12 ? 'success' : 'fail'}`}>
              <h4>{result.valido && result.memoria_simulada_mb < 12 ? '🚀 Algoritmo Aprobado' : '⚠️ Sobrecarga de Servidor'}</h4>
              <p className="retro">{result.feedback}</p>
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
  const [eqStatus, setEqStatus] = useState('');
  const pragma = estudiante.pragma_profile;

  const forjarItem = async (recetaId) => {
    setLoading(true);
    setEqStatus('');
    try {
      const res = await fetch(`${backendUrl}/api/pragma/forja/forjar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, receta_id: recetaId })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.error) {
        alert(data.error);
      } else {
        const copy = { ...pragma };
        copy.unlocked_cosmetics = data.unlocked_cosmetics;
        copy.inventory = data.inventory;
        onUpdate(copy);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const equiparItem = async (categoria, itemId) => {
    setEqStatus('Equipando...');
    try {
      const res = await fetch(`${backendUrl}/api/pragma/perfil/equipar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, categoria, item_id: itemId })
      });
      const data = await res.json();
      if (data.success) {
        const copy = { ...pragma };
        copy.equipped_cosmetics = data.equipped_cosmetics;
        onUpdate(copy);
        setEqStatus('¡Cosmético equipado!');
      }
    } catch (err) {
      console.error(err);
      setEqStatus('Fallo al equipar');
    }
  };

  return (
    <div className="forja-panel glass-panel">
      <h2>🔨 Yunque Alquímico de la Forja</h2>
      <p className="panel-desc">Gasta tus Silicon Shards y esencias recolectadas para craftear skins estelares y auras láser personalizadas.</p>

      <div className="forja-grid">
        {/* Recetas */}
        <div className="recetas-side">
          <h3>Recetas de Crafteo</h3>
          
          <div className="recipe-card">
            <h4>🌌 Mapa Estelar de Fuego</h4>
            <p className="cost">Costo: 15 Shards • 5 Threads • 1 JS Essence</p>
            {pragma.unlocked_cosmetics.includes('map_fire_skin') ? (
              <button className="btn-glow btn-sm" onClick={() => equiparItem('map_skin', 'map_fire_skin')}>
                {pragma.equipped_cosmetics.map_skin === 'map_fire_skin' ? 'Equipado' : 'Equipar'}
              </button>
            ) : (
              <button className="btn-action btn-sm" onClick={() => forjarItem('map_fire_skin')} disabled={loading}>Forjar</button>
            )}
          </div>

          <div className="recipe-card">
            <h4>💫 Aura Estelar Neón</h4>
            <p className="cost">Costo: 20 Shards • 10 Threads • 2 Logic Cores</p>
            {pragma.unlocked_cosmetics.includes('star_aura_neon') ? (
              <button className="btn-glow btn-sm" onClick={() => equiparItem('star_aura', 'star_aura_neon')}>
                {pragma.equipped_cosmetics.star_aura === 'star_aura_neon' ? 'Equipado' : 'Equipar'}
              </button>
            ) : (
              <button className="btn-action btn-sm" onClick={() => forjarItem('star_aura_neon')} disabled={loading}>Forjar</button>
            )}
          </div>

          <div className="recipe-card">
            <h4>⚡ Láser Cyber Rosa</h4>
            <p className="cost">Costo: 10 Shards • 1 Python Essence</p>
            {pragma.unlocked_cosmetics.includes('laser_color_pink') ? (
              <button className="btn-glow btn-sm" onClick={() => equiparItem('laser_color', '#ff0055')}>
                {pragma.equipped_cosmetics.laser_color === '#ff0055' ? 'Equipado' : 'Equipar'}
              </button>
            ) : (
              <button className="btn-action btn-sm" onClick={() => forjarItem('laser_color_pink')} disabled={loading}>Forjar</button>
            )}
          </div>
          {eqStatus && <p className="eq-notif">{eqStatus}</p>}
        </div>

        {/* Simulador de Vista de Mapa 3D */}
        <div className="forja-preview-side">
          <h3>Simulador de Mapa Estelar</h3>
          
          <div className={`star-map-3d-box ${pragma.equipped_cosmetics.map_skin}`}>
            <div className="particles-overlay"></div>
            <div className="star-point star-a"></div>
            <div className="star-point star-b"></div>
            <div className="star-point star-c"></div>
            <svg className="connections-svg">
              <line x1="20%" y1="20%" x2="80%" y2="50%" stroke={pragma.equipped_cosmetics.laser_color} strokeWidth="2" strokeDasharray="5,5" />
              <line x1="80%" y1="50%" x2="50%" y2="80%" stroke={pragma.equipped_cosmetics.laser_color} strokeWidth="2" />
            </svg>
            <p className="preview-label">Aura Activa: {pragma.equipped_cosmetics.star_aura}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   6. GRIMORIO DE RUNAS (ÁLBUM DE CÓDIGO)
   ========================================== */
function RunasView({ pragmaProfile }) {
  const [selectedRune, setSelectedRune] = useState({
    id: "chronos",
    titulo: "CHRONOS SHARD",
    level: 5,
    descripcion: "Manipulación temporal. Almacena fragmentos del flujo de ejecución.",
    cooldown: "15s",
    tipo: "CHRONOMANCY (Green/Blue)",
    icono: "⏳",
    color: "#00ff66",
    status: "ACTIVE"
  });
  
  const [activeTab, setActiveTab] = useState("RUNES");
  const [filters, setFilters] = useState({
    active: true,
    locked: false,
    mystic: true,
    cyber: false,
    hybrid: true
  });

  const AETHER_RUNES = [
    { id: "quantum", titulo: "QUANTUM SURGE", level: 4, descripcion: "Sobrecarga de bits en memoria temporal.", cooldown: "8s", tipo: "QUANTUM (Green)", icono: "💠", color: "#00ff66", locked: false },
    { id: "aural", titulo: "AURAL VEIL", level: 3, descripcion: "Escudo de frecuencia acústica contra intrusiones.", cooldown: "20s", tipo: "RESONANCE (Blue)", icono: "🔊", color: "#00f3ff", locked: false },
    { id: "cyber", titulo: "CYBER SHIELD", level: 5, descripcion: "Protección perimetral de kernel en tiempo real.", cooldown: "30s", tipo: "DEFENSE (Green)", icono: "🛡️", color: "#00ff66", locked: false },
    { id: "void", titulo: "VOID PULSE", level: 3, descripcion: "Limpia la pila de ejecución instantáneamente.", cooldown: "12s", tipo: "VOID (Blue)", icono: "🌀", color: "#00f3ff", locked: false },
    { id: "lock1", titulo: "OVERCLOCK CORE", level: 6, locked: true, reqLvl: 12 },
    { id: "lock2", titulo: "MATRIX BEAM", level: 8, locked: true, reqLvl: 15 },
    { id: "nexus", titulo: "NEXUS BIND", level: 4, descripcion: "Entrelaza sockets de red locales y remotos.", cooldown: "10s", tipo: "NEXUS (Blue)", icono: "🕸️", color: "#00f3ff", locked: false },
    { id: "data", titulo: "DATA STREAM", level: 3, descripcion: "Canaliza paquetes de datos comprimidos.", cooldown: "5s", tipo: "FLOW (Blue)", icono: "⇄", color: "#00f3ff", locked: false },
    { id: "pyro", titulo: "PYRO-CORE", level: 3, descripcion: "Desencadena bucles iterativos de calor sintáctico.", cooldown: "15s", tipo: "ELEMENTAL (Green)", icono: "🔥", color: "#00ff66", locked: false },
    { id: "chronos", titulo: "CHRONOS SHARD", level: 5, descripcion: "Manipulación temporal. Almacena fragmentos del flujo de ejecución.", cooldown: "15s", tipo: "CHRONOMANCY (Green/Blue)", icono: "⏳", color: "#00ff66", locked: false },
    { id: "lock3", titulo: "GRID RUNNER", level: 5, locked: true, reqLvl: 12 },
    { id: "lock4", titulo: "GHOST CODE", level: 7, locked: true, reqLvl: 18 },
    { id: "nexsis", titulo: "NEXSIS RUNE", level: 3, descripcion: "Fuerza la ejecución asíncrona de llamadas apiladas.", cooldown: "15s", tipo: "FLOW (Blue)", icono: "🪐", color: "#00f3ff", locked: false },
    { id: "dati", titulo: "DATI STREAM", level: 3, descripcion: "Paraleliza hilos del procesador virtual.", cooldown: "22s", tipo: "FLOW (Blue)", icono: "⧓", color: "#00f3ff", locked: false },
    { id: "aura", titulo: "AURA LOCK", level: 3, descripcion: "Previene la mutación de variables globales.", cooldown: "18s", tipo: "DEFENSE (Green)", icono: "🔒", color: "#00ff66", locked: false },
    { id: "ghost", titulo: "GHOST NODE", level: 3, descripcion: "Oculta el hilo de ejecución de rastreadores.", cooldown: "25s", tipo: "STEALTH (Blue)", icono: "👻", color: "#00f3ff", locked: false },
    { id: "weave", titulo: "CRYPTIC WEAVE", level: 3, descripcion: "Encriptación simétrica de flujo de bytes.", cooldown: "30s", tipo: "CRYPT (Green)", icono: "🌀", color: "#00ff66", locked: false },
    { id: "voidp", titulo: "VOID WAVE", level: 3, descripcion: "Invoca un barrido de recolección de basura.", cooldown: "12s", tipo: "VOID (Blue)", icono: "👁️", color: "#00f3ff", locked: false }
  ];

  return (
    <div className="runas-panel glass-panel spec-codex-panel">
      {/* Corner Brackets */}
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      <div className="codex-header">
        <h2 className="codex-title">AETHER CODEX: RUNIC PROGRAMMING GRIMOIRE</h2>
        <div className="codex-user-energy">
          <span>AETHERIUS</span>
          <span className="rank-txt">Rank 14</span>
          <div className="energy-bar-container">
            <span className="energy-label">ENERGY 98%</span>
            <div className="energy-bar" style={{ width: '98%' }}></div>
          </div>
        </div>
      </div>

      <div className="codex-tabs">
        {["RUNES", "ARRAYS", "SCRIPTS", "SETTINGS"].map(tab => (
          <button 
            key={tab} 
            className={`codex-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="codex-main-layout">
        {/* Grilla de runas */}
        <div className="runes-grid-spec">
          {AETHER_RUNES.map((rune, idx) => {
            if (rune.locked) {
              return (
                <div key={rune.id || idx} className="rune-card-spec locked">
                  <div className="rune-locked-icon">🔒</div>
                  <div className="rune-locked-label">LOCKED</div>
                  <div className="rune-locked-req">(LVL {rune.reqLvl} REQ)</div>
                </div>
              );
            }

            const isSelected = selectedRune?.id === rune.id;
            return (
              <div 
                key={rune.id} 
                className={`rune-card-spec ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedRune(rune)}
                style={{ '--rune-theme-color': rune.color }}
              >
                <div className="rune-card-header">
                  <span className="rune-lvl">Lvl {rune.level}</span>
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
            <div className="rune-detail-content" style={{ '--rune-theme-color': selectedRune.color }}>
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>

              <h3 className="detail-title">{selectedRune.titulo}</h3>
              <p className="detail-desc">{selectedRune.descripcion}</p>
              
              <div className="detail-specs">
                <div className="spec-item">
                  <span className="spec-label">Cooldown:</span>
                  <span className="spec-value">{selectedRune.cooldown}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Type:</span>
                  <span className="spec-value" style={{ color: selectedRune.color }}>{selectedRune.tipo}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">STATUS:</span>
                  <span className="spec-value text-green" style={{ color: '#00ff66', textShadow: '0 0 5px #00ff66' }}>ACTIVE</span>
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn-glow btn-cast">CAST</button>
                <button className="btn-glow btn-edit">EDIT</button>
                <button className="btn-glow btn-info">INFO</button>
              </div>
            </div>
          ) : (
            <div className="rune-detail-empty">
              <p>SELECCIONA UNA RUNA PARA LEER TELEMETRÍA</p>
            </div>
          )}
        </div>
      </div>

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
   7. SYNTAX TINDER
   ========================================== */
function TinderView({ estudiante, backendUrl, onUpdate }) {
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [timer, setTimer] = useState(15);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const fetchSnippet = async () => {
    setFeedback(null);
    setTimer(15);
    try {
      const res = await fetch(`${backendUrl}/api/pragma/tinder/codigo`);
      const data = await res.json();
      setCurrentSnippet(data);
    } catch (e) {
      console.error(e);
    }
  };

  const votarSnippet = async (voto) => {
    try {
      const res = await fetch(`${backendUrl}/api/pragma/tinder/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, snippet_id: currentSnippet.id, voto })
      });
      const data = await res.json();
      setFeedback(data);
      setHistory(prev => [{ snippet: currentSnippet.codigo, acierto: data.acierto }, ...prev].slice(0, 5));

      if (data.acierto) {
        const copy = { ...estudiante.pragma_profile };
        copy.rank_points += 5;
        copy.inventory.silicon_shards += 1;
        onUpdate(copy);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Timer loop
  useEffect(() => {
    if (!currentSnippet || feedback) return;
    if (timer === 0) {
      votarSnippet(false); // Falla al acabarse el tiempo
      return;
    }
    const id = setTimeout(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [timer, currentSnippet, feedback]);

  useEffect(() => {
    fetchSnippet();
  }, []);

  return (
    <div className="tinder-panel glass-panel">
      <h2>🔥 Syntax Tinder (Code Review Veloz)</h2>
      <p className="panel-desc">Tienes 15 segundos para deslizar izquierda (código erróneo/sucio) o derecha (código limpio/correcto).</p>

      <div className="tinder-layout">
        <div className="tinder-main">
          {currentSnippet && !feedback && (
            <div className="tinder-card">
              <div className="card-timer-bar" style={{ width: `${(timer / 15) * 100}%` }}></div>
              <span className="lang-tag">{currentSnippet.lenguaje}</span>
              <pre className="card-code"><code>{currentSnippet.codigo}</code></pre>
              
              <div className="tinder-actions">
                <button className="btn-action tinder-left" onClick={() => votarSnippet(false)}>❌ Código Sucio</button>
                <button className="btn-action tinder-right" onClick={() => votarSnippet(true)}>💚 Código Limpio</button>
              </div>
            </div>
          )}

          {feedback && (
            <div className={`tinder-feedback ${feedback.acierto ? 'success' : 'fail'}`}>
              <h3>{feedback.acierto ? '🎉 ¡Correcto!' : '💥 Incorrecto'}</h3>
              <p className="explicacion">{feedback.explicacion}</p>
              <button className="btn-glow" onClick={fetchSnippet}>Siguiente Snippet</button>
            </div>
          )}
        </div>

        <div className="tinder-sidebar">
          <h3>Historial Reciente</h3>
          <div className="history-list">
            {history.map((h, idx) => (
              <div key={idx} className={`history-item ${h.acierto ? 'success' : 'fail'}`}>
                <pre><code>{h.snippet.slice(0, 30)}...</code></pre>
                <span>{h.acierto ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   8. SYNTAX DEFENSE (ARCADE DE SINTAXIS)
   ========================================== */
function DefenseView({ estudiante, onUpdate }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(1458920); // Valor de inicio similar a la Imagen 1
  const [highScore, setHighScore] = useState(2750000);
  const [firewallHp, setFirewallHp] = useState(88); // 88% como la Imagen 1
  const [fallingLines, setFallingLines] = useState([]);
  const [shake, setShake] = useState(false);
  const [combo, setCombo] = useState(24);
  const [lives, setLives] = useState(3);
  const [laserEffect, setLaserEffect] = useState(null); // { x1, y1, x2, y2 }
  const gameLoopRef = useRef(null);

  const SNIPPETS_CORRUPTOS = [
    { text: "CRITICAL_ERROR: {void_syntax}", corrupt: true },
    { text: "function_nullify(0xDF2)", corrupt: false },
    { text: "var broken = [bad];", corrupt: true },
    { text: "undefined_ref();", corrupt: true },
    { text: "memory_leak.cpp", corrupt: true },
    { text: "const active = true;", corrupt: false }
  ];

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(1458920);
    setFirewallHp(88);
    setCombo(24);
    setLives(3);
    setFallingLines([]);
    setShake(false);
  };

  useEffect(() => {
    if (!gameStarted) return;

    gameLoopRef.current = setInterval(() => {
      setFallingLines(prev => {
        let hitFirewall = false;
        const updated = prev.map(line => {
          const nextY = line.y + 3;
          if (nextY >= 95) {
            if (line.corrupt) hitFirewall = true;
            return null;
          }
          return { ...line, y: nextY };
        }).filter(Boolean);

        if (hitFirewall) {
          setFirewallHp(hp => {
            const nextHp = Math.max(0, hp - 12);
            setCombo(1);
            triggerShake();
            return nextHp;
          });
        }

        // Generar nueva línea
        if (Math.random() < 0.3 && updated.length < 5) {
          const randomBase = SNIPPETS_CORRUPTOS[Math.floor(Math.random() * SNIPPCOS_len(SNIPPETS_CORRUPTOS))];
          updated.push({
            id: Math.random().toString(),
            text: randomBase.text,
            corrupt: randomBase.corrupt,
            x: Math.floor(Math.random() * 60) + 10,
            y: 0
          });
        }

        return updated;
      });
    }, 250);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted]);

  const SNIPPCOS_len = (arr) => arr.length;

  useEffect(() => {
    if (firewallHp <= 0 || lives <= 0) {
      clearInterval(gameLoopRef.current);
      setGameStarted(false);
      
      const copy = { ...estudiante.pragma_profile };
      copy.rank_points += Math.floor(score / 50000);
      copy.inventory.silicon_shards += 5;
      onUpdate(copy);

      alert(`¡Firewall de Base de Datos Comprometido! Puntaje final: ${score}`);
    }
  }, [firewallHp, lives]);

  const dispararLinea = (id, corrupt, x, y) => {
    // Definir efecto de rayo láser desde una torreta inferior hacia el fragmento
    const turretIndex = Math.floor(Math.random() * 4); // 4 torretas en el HUD inferior
    const turretX = 20 + turretIndex * 20; // 20%, 40%, 60%, 80%
    setLaserEffect({
      x1: turretX,
      y1: 90,
      x2: x + 10,
      y2: y + 2
    });

    setTimeout(() => {
      setLaserEffect(null);
    }, 200);

    if (corrupt) {
      setScore(s => s + 2480);
      setCombo(c => c + 1);
    } else {
      setLives(l => Math.max(0, l - 1));
      setCombo(1);
      triggerShake();
    }
    setFallingLines(prev => prev.filter(line => line.id !== id));
  };

  return (
    <div className="defense-panel glass-panel spec-defense-layout">
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      {!gameStarted ? (
        <div className="start-screen-spec">
          <h2 className="arcade-title-main">SYNTAX DEFENSE: DATABASE FIREWALL</h2>
          <p className="panel-desc-spec">Arcade táctico militar de detección de errores de sintaxis a velocidad de caída de bloques.</p>
          <button className="btn-action-hud" onClick={startGame}>INICIAR PROTOCOLO DE DEFENSA</button>
        </div>
      ) : (
        <div className={`arcade-grid-arena crt-overlay ${shake ? 'animate-shake-glitch' : ''}`}>
          {/* Header del HUD */}
          <div className="hud-header-stats">
            <div className="stats-group-left">
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">SCORE:</span>
                <span className="hud-stat-val cyan-glow">{score.toLocaleString()}</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">HIGHSCORE:</span>
                <span className="hud-stat-val gold-glow">{highScore.toLocaleString()}</span>
              </div>
            </div>

            <div className="stats-group-right">
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">STAGE:</span>
                <span className="hud-stat-val">07</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">WAVE:</span>
                <span className="hud-stat-val text-red">14/20</span>
              </div>
            </div>
          </div>

          {/* Área de juego principal de caída de bloques */}
          <div className="game-playfield-spec">
            {/* Grid Lines */}
            <div className="playfield-grid-overlay"></div>

            {/* Marcador de Agua Central */}
            <div className="watermark-db-firewall">DATABASE FIREWALL</div>

            {/* Efecto de Rayo Láser */}
            {laserEffect && (
              <svg className="laser-svg-overlay">
                <line 
                  x1={`${laserEffect.x1}%`} 
                  y1={`${laserEffect.y1}%`} 
                  x2={`${laserEffect.x2}%`} 
                  y2={`${laserEffect.y2}%`} 
                  stroke="var(--neon-cyan)" 
                  strokeWidth="3"
                  className="laser-line-glow"
                />
              </svg>
            )}

            {/* Fragmentos de código cayendo */}
            {fallingLines.map(line => {
              const borderClass = line.corrupt ? "border-red" : "border-cyan";
              return (
                <div
                  key={line.id}
                  className={`falling-code-block ${borderClass}`}
                  style={{ left: `${line.x}%`, top: `${line.y}%` }}
                  onClick={() => dispararLinea(line.id, line.corrupt, line.x, line.y)}
                >
                  <span className="block-warning-tag">{line.corrupt ? "CRITICAL" : "OK"}</span>
                  <code className="block-code-text">{line.text}</code>
                </div>
              );
            })}
          </div>

          {/* Controles y Status Inferior */}
          <div className="hud-footer-stats">
            <div className="stats-group-left">
              <div className="hud-stat-item flex-align">
                <span className="hud-stat-lbl">LIVES:</span>
                <div className="glowing-skulls">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={`skull-ico ${i < lives ? 'active' : 'dead'}`}>💀</span>
                  ))}
                  <span className="shield-ico">🛡️</span>
                </div>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">SHIELD:</span>
                <span className="hud-stat-val text-cyan">{firewallHp}%</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">COMBO:</span>
                <span className="hud-stat-val text-gold">x{combo}</span>
              </div>
            </div>

            {/* Torretas visuales */}
            <div className="turret-defense-strip">
              <div className="turret-node"></div>
              <div className="turret-node active"></div>
              <div className="turret-center-core"></div>
              <div className="turret-node active"></div>
              <div className="turret-node"></div>
            </div>

            <div className="stats-group-right">
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">POWER:</span>
                <span className="hud-stat-val text-cyan">100%</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">SPECIAL:</span>
                <span className="hud-stat-val text-gold">[FIREWALL BLAST]</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-lbl">DATA INTEGRITY:</span>
                <span className="hud-stat-val text-green">[{firewallHp}%]</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   9. SQL DUNGEON CRAWLER (MAZMORRA RELACIONAL)
   ========================================== */
function DungeonView({ estudiante, onUpdate }) {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [queryInput, setQueryInput] = useState('');
  const [doorLocked, setDoorLocked] = useState(true);
  const [feedback, setFeedback] = useState('');

  // Cuadrícula 3x3 simple de tablas de base de datos
  const dungeonMap = [
    [
      { name: "tabla_usuarios", requirement: "SELECT * FROM tabla_usuarios WHERE activo = true;", desc: "Filtra usuarios activos." },
      { name: "tabla_ventas", requirement: "SELECT SUM(total) FROM tabla_ventas;", desc: "Calcula el total de ventas sumado." },
      { name: "tabla_logs", requirement: "SELECT COUNT(*) FROM tabla_logs WHERE nivel = 'ERROR';", desc: "Cuenta logs con nivel de ERROR." }
    ],
    [
      { name: "tabla_productos", requirement: "SELECT nombre FROM tabla_productos ORDER BY precio DESC LIMIT 1;", desc: "Obtén el producto más caro." },
      { name: "tabla_compras", requirement: "SELECT cliente_id, COUNT(*) FROM tabla_compras GROUP BY cliente_id;", desc: "Cuenta compras agrupadas por cliente." },
      { name: "tabla_roles", requirement: "SELECT u.nombre, r.nombre FROM tabla_usuarios u JOIN tabla_roles r ON u.rol_id = r.id;", desc: "Relaciona usuarios con sus roles." }
    ],
    [
      { name: "tabla_alertas", requirement: "SELECT * FROM tabla_alertas WHERE fecha > '2026-01-01';", desc: "Lista alertas creadas a partir del 2026." },
      { name: "tabla_pagos", requirement: "SELECT * FROM tabla_pagos WHERE estado = 'PENDIENTE';", desc: "Busca pagos con estado PENDIENTE." },
      { name: "NÚCLEO DE LA BASE DE DATOS", requirement: "SQL_COMPLETADO", desc: "¡Has conquistado el núcleo de datos!" }
    ]
  ];

  const currentRoom = dungeonMap[posY][posX];

  const comprobarSQL = () => {
    const formatInput = queryInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const formatReq = currentRoom.requirement.trim().toLowerCase().replace(/\s+/g, ' ');

    if (formatInput === formatReq) {
      setDoorLocked(false);
      setFeedback('🔓 ¡Compuerta de Datos Abierta! Ya puedes avanzar.');
      
      const copy = { ...estudiante.pragma_profile };
      copy.rank_points += 10;
      copy.inventory.sql_essence = (copy.inventory.sql_essence || 0) + 1;
      onUpdate(copy);
    } else {
      setFeedback('❌ Error de Sintaxis SQL o consulta errónea. La compuerta sigue bloqueada.');
    }
  };

  const mover = (dir) => {
    if (doorLocked && currentRoom.requirement !== 'SQL_COMPLETADO') {
      alert("Debes resolver la consulta SQL para abrir la puerta de esta habitación primero.");
      return;
    }

    setFeedback('');
    setQueryInput('');
    setDoorLocked(true);

    if (dir === 'derecha' && posX < 2) setPosX(x => x + 1);
    if (dir === 'abajo' && posY < 2) setPosY(y => y + 1);
    if (dir === 'izquierda' && posX > 0) setPosX(x => x - 1);
    if (dir === 'arriba' && posY > 0) setPosY(y => y - 1);
  };

  return (
    <div className="dungeon-panel glass-panel">
      <h2>🗝️ SQL Dungeon Crawler: Laberinto de Datos</h2>
      <p className="panel-desc">Avanza en la cuadrícula de base de datos. Cada habitación requiere una consulta SQL relacional correcta para abrir sus puertas.</p>

      <div className="dungeon-layout">
        {/* Mapa 2D */}
        <div className="map-view">
          <h3>Mapa de la Mazmorra (Cuadrícula 3x3)</h3>
          <div className="dungeon-grid-visual">
            {dungeonMap.map((row, y) => (
              <div key={y} className="grid-row">
                {row.map((cell, x) => (
                  <div key={x} className={`grid-cell ${posX === x && posY === y ? 'player-here' : ''}`}>
                    {cell.name.slice(6, 12)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="dungeon-controls">
            <button className="btn-glow btn-sm" onClick={() => mover('arriba')}>▲ Arriba</button>
            <div className="horizontal-moves">
              <button className="btn-glow btn-sm" onClick={() => mover('izquierda')}>◀ Izquierda</button>
              <button className="btn-glow btn-sm" onClick={() => mover('derecha')}>Derecha ▶</button>
            </div>
            <button className="btn-glow btn-sm" onClick={() => mover('abajo')}>▼ Abajo</button>
          </div>
        </div>

        {/* Habitación Activa */}
        <div className="room-workspace">
          <h3>Habitación Actual: <span className="font-neon">{currentRoom.name}</span></h3>
          <p className="desc">{currentRoom.desc}</p>

          {currentRoom.requirement !== 'SQL_COMPLETADO' ? (
            <>
              <div className="sql-box">
                <textarea
                  className="code-textarea sql-textarea"
                  placeholder="Escribe tu consulta SQL relacional..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                />
                <button className="btn-action" onClick={comprobarSQL}>Comprobar Consulta SQL</button>
              </div>
              {feedback && <p className="sql-feedback">{feedback}</p>}
            </>
          ) : (
            <div className="victory-room">
              <h3>🎉 ¡Felicidades!</h3>
              <p>Has conquistado el núcleo de datos del laberinto SQL.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
