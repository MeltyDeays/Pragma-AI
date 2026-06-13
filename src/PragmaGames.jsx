import React, { useState, useEffect, useRef } from 'react';
import './PragmaGames.css';

// Audios Lo-Fi públicos libres de copyright
const LOFI_TRACKS = [
  { title: "Cyber Sunset Chill", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Neon Rain Whispers", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Binary Lullaby", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function PragmaGames({ estudiante, onUpdateEstudiante, backendUrl }) {
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
        {selectedSubTab === 'lobby' && <LobbyView estudiante={estudiante} backendUrl={backendUrl} onUpdate={syncProfile} />}
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
function LobbyView({ estudiante, backendUrl, onUpdate }) {
  const [matchType, setMatchType] = useState('1v1');
  const [searching, setSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [battleResult, setBattleResult] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const intervalRef = useRef(null);
  const pollingRef = useRef(null);

  // Jugadores simulados para llenar el lobby como la Imagen 5
  const ORANGE_TEAM_MOCK = [
    { nombre: "K1NET1C", rank: "S", level: 92, avatar: "🛸", color: "#ff9900" },
    { nombre: "DR3ADBLADE", rank: "A+", level: 78, avatar: "💀", color: "#ff0055" },
    { nombre: "SHADOW_FX", rank: "A", level: 64, avatar: "👤", color: "#ffaa00" },
    { nombre: "VOID_RUNNER", rank: "B+", level: 50, avatar: "🏃", color: "#ff5500" }
  ];

  const BLUE_TEAM_MOCK = [
    { nombre: "CYBER_PUNK", rank: "S", level: 95, avatar: "🕶️", color: "#00f3ff" },
    { nombre: "NIGHT_OWL", rank: "A+", level: 82, avatar: "🦉", color: "#00aaff" },
    { nombre: "NEON_HACK", rank: "A", level: 68, avatar: "💻", color: "#00ffaa" },
    { nombre: "MATRIX_01", rank: "B+", level: 45, avatar: "🤖", color: "#00ff66" }
  ];

  const startSearch = async () => {
    setSearching(true);
    setSearchTimer(0);
    setBattleResult(null);
    setLobbyPlayers([]);

    // Simular que los jugadores se unen a la cola uno a uno
    let step = 0;
    const intervalPlayers = setInterval(() => {
      step++;
      if (step === 1) {
        setLobbyPlayers([{ ...ORANGE_TEAM_MOCK[0], team: 'orange' }]);
      } else if (step === 2) {
        setLobbyPlayers(prev => [...prev, { ...BLUE_TEAM_MOCK[0], team: 'blue' }]);
      } else if (step === 3) {
        setLobbyPlayers(prev => [...prev, { ...ORANGE_TEAM_MOCK[1], team: 'orange' }, { ...BLUE_TEAM_MOCK[1], team: 'blue' }]);
      } else if (step === 4) {
        setLobbyPlayers(prev => [...prev, { ...ORANGE_TEAM_MOCK[2], team: 'orange' }, { ...BLUE_TEAM_MOCK[2], team: 'blue' }]);
      } else if (step === 5) {
        setLobbyPlayers(prev => [...prev, { ...ORANGE_TEAM_MOCK[3], team: 'orange' }, { ...BLUE_TEAM_MOCK[3], team: 'blue' }]);
        clearInterval(intervalPlayers);
      }
    }, 800);

    try {
      await fetch(`${backendUrl}/api/pragma/multiplayer/match/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, tipo_match: matchType })
      });

      intervalRef.current = setInterval(() => {
        setSearchTimer(prev => prev + 1);
      }, 1000);

      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${backendUrl}/api/pragma/multiplayer/match/status/${estudiante.id}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'completado') {
            clearInterval(intervalRef.current);
            clearInterval(pollingRef.current);
            clearInterval(intervalPlayers);
            setSearching(false);
            setBattleResult(statusData.matchResult);

            const res = statusData.matchResult;
            const profileCopy = { ...estudiante.pragma_profile };
            if (res.victoria) {
              profileCopy.rank_points += res.rankGanado || 15;
              profileCopy.inventory.silicon_shards += 3;
            } else {
              profileCopy.rank_points += 10;
              profileCopy.inventory.silicon_shards += 3;
            }
            onUpdate(profileCopy);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setSearching(false);
      clearInterval(intervalPlayers);
    }
  };

  const cancelSearch = async () => {
    clearInterval(intervalRef.current);
    clearInterval(pollingRef.current);
    setSearching(false);
    try {
      await fetch(`${backendUrl}/api/pragma/multiplayer/match/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id })
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="lobby-panel glass-panel codewars-arena-panel">
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

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
            MATCHMAKING QUEUE: Active - {matchType} | {Math.floor(searchTimer / 60).toString().padStart(2, '0')}:{(searchTimer % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {!searching && !battleResult && (
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
          <button className="btn-action-hud start-search-btn-hud" onClick={startSearch}>INICIALIZAR MATCHMAKING</button>
        </div>
      )}

      {searching && (
        <div className="arena-searching-layout">
          {/* Fila superior de telemetría y radar */}
          <div className="arena-searching-top">
            <div className="radar-tactical-container">
              <svg className="radar-vectorial animate-spin" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0, 243, 255, 0.15)" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0, 243, 255, 0.3)" strokeWidth="1" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(0, 243, 255, 0.2)" strokeWidth="1" />
                <path d="M100,100 L100,10 A90,90 0 0,1 190,100 Z" fill="url(#radar-glow)" opacity="0.45" />
                <defs>
                  <linearGradient id="radar-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--neon-cyan)" stopOpacity="1" />
                    <stop offset="100%" stopColor="var(--neon-cyan)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="radar-ping-dot" />
            </div>

            <div className="telemetry-logs-side">
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>
              <p className="log-line green">[OK] CAPA COGNITIVA ACTIVA</p>
              <p className="log-line cyan">[SCAN] ANALIZANDO PUERTOS DE CONEXIÓN EN MÓDULO 1...</p>
              <p className="log-line gold">[WARN] LATENCIA DE ENRUTAMIENTO: 14MS</p>
              <p className="log-line cyan">[SCAN] BUSCANDO OPONENTES DE SIMILAR RANGO (NOVATO)...</p>
              <p className="log-line green">[SUCCESS] {lobbyPlayers.length} NODOS DE COMBATE ENCONTRADOS</p>
            </div>
          </div>

          {/* Grilla de dos equipos (Naranja vs Azul) */}
          <div className="matchmaking-teams-view">
            <div className="team-column orange">
              <h3 className="team-title orange-text">ORANGE TEAM</h3>
              <div className="team-cards-grid">
                {ORANGE_TEAM_MOCK.map((player, idx) => {
                  const isActive = lobbyPlayers.some(p => p.nombre === player.nombre);
                  return (
                    <div key={idx} className={`player-card-spec orange-theme ${isActive ? 'active' : 'placeholder'}`}>
                      <div className="avatar-glitch">{isActive ? player.avatar : "❓"}</div>
                      <div className="player-info-spec">
                        <span className="player-name">{isActive ? player.nombre : "BUSCANDO..."}</span>
                        <span className="player-rank">Rank {isActive ? player.rank : "--"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="team-divider-vs">
              <span className="vs-badge">VS</span>
            </div>

            <div className="team-column blue">
              <h3 className="team-title blue-text">BLUE TEAM</h3>
              <div className="team-cards-grid">
                {BLUE_TEAM_MOCK.map((player, idx) => {
                  const isActive = lobbyPlayers.some(p => p.nombre === player.nombre);
                  return (
                    <div key={idx} className={`player-card-spec blue-theme ${isActive ? 'active' : 'placeholder'}`}>
                      <div className="avatar-glitch">{isActive ? player.avatar : "❓"}</div>
                      <div className="player-info-spec">
                        <span className="player-name">{isActive ? player.nombre : "BUSCANDO..."}</span>
                        <span className="player-rank">Rank {isActive ? player.rank : "--"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Barra de estado inferior y ondas sonoras */}
          <div className="searching-bottom-controls">
            <div className="audio-waveforms">
              <div className="wave-bar animate-wave-short"></div>
              <div className="wave-bar animate-wave-tall"></div>
              <div className="wave-bar animate-wave-medium"></div>
              <div className="wave-bar animate-wave-short"></div>
              <div className="wave-bar animate-wave-tall"></div>
              <span className="audio-label">QUEUE ACTIVE</span>
              <div className="wave-bar animate-wave-short"></div>
              <div className="wave-bar animate-wave-medium"></div>
              <div className="wave-bar animate-wave-tall"></div>
              <div className="wave-bar animate-wave-short"></div>
            </div>

            <button className="btn-hud-cancel" onClick={cancelSearch}>LEAVE QUEUE</button>
          </div>
        </div>
      )}

      {battleResult && (
        <div className="battle-result-container spec-battle-result">
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>

          <div className={`result-header-spec ${battleResult.victoria ? 'win' : 'lose'}`}>
            {battleResult.victoria ? '🏆 DECRIPCIÓN EXITOSA' : '💀 FALLO EN EL FIREWALL'}
          </div>
          <p className="desc-spec">{battleResult.mensaje}</p>

          <div className="battle-stats-summary">
            <div className="stat-box">
              <span className="stat-num">{battleResult.victoria ? `+${battleResult.rankGanado || 15}` : '+10'}</span>
              <span className="stat-lbl">RANK POINTS</span>
            </div>
            <div className="stat-box">
              <span className="stat-num">+3</span>
              <span className="stat-lbl">SILICON SHARDS</span>
            </div>
            {battleResult.victoria && (
              <div className="stat-box">
                <span className="stat-num">+{battleResult.xpGanada || 20}</span>
                <span className="stat-lbl">XP COGNITIVA</span>
              </div>
            )}
          </div>

          <button className="btn-action-hud" style={{ marginTop: '20px' }} onClick={() => setBattleResult(null)}>REGRESAR AL LOBBY</button>
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
