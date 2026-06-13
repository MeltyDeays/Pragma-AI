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
  const intervalRef = useRef(null);
  const pollingRef = useRef(null);

  const startSearch = async () => {
    setSearching(true);
    setSearchTimer(0);
    setBattleResult(null);

    try {
      // Registrar ticket de matchmaking en el backend
      await fetch(`${backendUrl}/api/pragma/multiplayer/match/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estudiante_id: estudiante.id, tipo_match: matchType })
      });

      // Temporizador visual
      intervalRef.current = setInterval(() => {
        setSearchTimer(prev => prev + 1);
      }, 1000);

      // Polling de estado cada 1.5s
      pollingRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${backendUrl}/api/pragma/multiplayer/match/status/${estudiante.id}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'completado') {
            clearInterval(intervalRef.current);
            clearInterval(pollingRef.current);
            setSearching(false);
            setBattleResult(statusData.matchResult);

            // Actualizar datos del estudiante según resultado
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
          console.error("Error al consultar estado del match:", e);
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      setSearching(false);
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
      console.error("Error al cancelar ticket de matchmaking:", err);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="lobby-panel glass-panel">
      <h2>⚔️ Terminal de Combate Multijugador</h2>
      <p className="panel-desc">Empareja tu código con oponentes del servidor en retos rápidos. Soporte 1v1, 2v2, 4v4 y Todos contra Todos.</p>

      {!searching && !battleResult && (
        <div className="setup-container">
          <div className="match-options">
            <button className={matchType === '1v1' ? 'btn-glow active' : 'btn-glow'} onClick={() => setMatchType('1v1')}>1v1 Duelo</button>
            <button className={matchType === '2v2' ? 'btn-glow active' : 'btn-glow'} onClick={() => setMatchType('2v2')}>2v2 Hack-team</button>
            <button className={matchType === '4v4' ? 'btn-glow active' : 'btn-glow'} onClick={() => setMatchType('4v4')}>4v4 Raid</button>
            <button className={matchType === 'todos_vs_todos' ? 'btn-glow active' : 'btn-glow'} onClick={() => setMatchType('todos_vs_todos')}>Todos vs Todos</button>
          </div>
          <button className="btn-action start-match-btn" onClick={startSearch}>Inicializar Matchmaking</button>
        </div>
      )}

      {searching && (
        <div className="searching-container">
          <div className="radar-scanner"></div>
          <h3>Buscando oponentes en la red cyberpunk...</h3>
          <p className="timer">Tiempo transcurrido: {searchTimer}s</p>
          <button className="btn-action btn-cancel-search" style={{ marginTop: '20px', background: '#ff0055', borderColor: '#ff0055' }} onClick={cancelSearch}>
            ❌ Cancelar Búsqueda
          </button>
        </div>
      )}

      {battleResult && (
        <div className="battle-result-container">
          <div className={`result-header ${battleResult.victoria ? 'win' : 'lose'}`}>
            {battleResult.victoria ? '🏆 ¡VICTORIA EN RED!' : '💀 DERROTA CONCEPTUAL'}
          </div>
          <p className="desc">{battleResult.mensaje}</p>

          <div className="lobby-players-grid">
            {battleResult.jugadores?.map((p, idx) => (
              <div key={idx} className={`player-card ${p.isBot ? 'bot-card' : 'user-card'}`} style={{ borderLeft: `4px solid ${p.laser_color}` }}>
                <span className="card-badge">{p.isBot ? 'BOT' : 'TÚ'}</span>
                <h4>{p.nombre}</h4>
                <p className="pts">{p.rank_points} RP</p>
              </div>
            ))}
          </div>

          <div className="rewards-card">
            <h4>Recompensas del Combate:</h4>
            <p className="rewards-text">
              {battleResult.victoria ? `+${battleResult.rankGanado} RP • +3 Silicon Shards • +${battleResult.xpGanada} XP` : `+10 RP de Consolación • +3 Silicon Shards`}
            </p>
          </div>

          <button className="btn-glow" onClick={() => setBattleResult(null)}>Regresar al Lobby</button>
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
  return (
    <div className="runas-panel glass-panel">
      <h2>📖 Grimorio Ciberpunk de Runas</h2>
      <p className="panel-desc">Visualiza tus hitos de programación. Cada fragmento de código que resolviste con puntuación mayor a 95 se almacena aquí como una runa de poder.</p>

      {pragmaProfile.unlocked_runes?.length === 0 ? (
        <div className="empty-runes">
          <div className="grimoire-icon">📖</div>
          <h3>Tu grimorio de código está vacío</h3>
          <p>Supera auditorías en el Copiloto de Depuración con un puntaje de 95+ para grabar tu primera runa.</p>
        </div>
      ) : (
        <div className="runes-grid">
          {pragmaProfile.unlocked_runes?.map((runa, idx) => (
            <div key={idx} className="rune-card">
              <div className="rune-glow-effect"></div>
              <h4>✨ {runa.titulo}</h4>
              <p className="date">{runa.fecha}</p>
              <pre className="rune-code"><code>{runa.codigo}</code></pre>
            </div>
          ))}
        </div>
      )}
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
  const [score, setScore] = useState(0);
  const [firewallHp, setFirewallHp] = useState(100);
  const [fallingLines, setFallingLines] = useState([]);
  const gameLoopRef = useRef(null);

  const SNIPPETS_CORRUPTOS = [
    { text: "if (x = 2) {", corrupt: true },
    { text: "const a = 10", corrupt: false },
    { text: "def saludar()", corrupt: true },
    { text: "let array = [1, 2", corrupt: true },
    { text: "for (let i=0; i<5; i++)", corrupt: false },
    { text: "return sum(a,b);", corrupt: false }
  ];

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setFirewallHp(100);
    setFallingLines([]);
  };

  useEffect(() => {
    if (!gameStarted) return;

    gameLoopRef.current = setInterval(() => {
      // Avanzar líneas existentes
      setFallingLines(prev => {
        let hitFirewall = false;
        const updated = prev.map(line => {
          const nextY = line.y + 4;
          if (nextY >= 100) {
            if (line.corrupt) hitFirewall = true;
            return null;
          }
          return { ...line, y: nextY };
        }).filter(Boolean);

        if (hitFirewall) {
          setFirewallHp(hp => Math.max(0, hp - 20));
        }

        // Generar nueva línea
        if (Math.random() < 0.25 && updated.length < 5) {
          const randomBase = SNIPPETS_CORRUPTOS[Math.floor(Math.random() * SNIPPETS_CORRUPTOS.length)];
          updated.push({
            id: Math.random().toString(),
            text: randomBase.text,
            corrupt: randomBase.corrupt,
            x: Math.floor(Math.random() * 70) + 5, // posición X
            y: 0
          });
        }

        return updated;
      });
    }, 200);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted]);

  useEffect(() => {
    if (firewallHp <= 0) {
      clearInterval(gameLoopRef.current);
      setGameStarted(false);
      
      // Entregar recompensa final
      const copy = { ...estudiante.pragma_profile };
      copy.rank_points += Math.floor(score / 10);
      copy.inventory.silicon_shards += Math.floor(score / 20);
      onUpdate(copy);

      alert(`¡Firewall de Base de Datos Comprometido! Puntaje final: ${score}`);
    }
  }, [firewallHp]);

  const dispararLinea = (id, corrupt) => {
    if (corrupt) {
      setScore(s => s + 10);
    } else {
      setFirewallHp(hp => Math.max(0, hp - 10)); // Castigo por disparar a código limpio
    }
    setFallingLines(prev => prev.filter(line => line.id !== id));
  };

  return (
    <div className="defense-panel glass-panel">
      <h2>🛡️ Syntax Defense: Firewall de Base de Datos</h2>
      <p className="panel-desc">¡Destruye los fragmentos de código corruptos que caen de la red antes de que comprometan el Firewall!</p>

      {!gameStarted ? (
        <div className="start-screen">
          <button className="btn-action start-game-btn" onClick={startGame}>Iniciar Protocolo de Defensa</button>
        </div>
      ) : (
        <div className="defense-field">
          {/* Info HUD */}
          <div className="hud">
            <span>Score: {score}</span>
            <span>Firewall Escudo: {firewallHp}%</span>
          </div>

          {/* Área del juego */}
          <div className="game-area">
            {fallingLines.map(line => (
              <div
                key={line.id}
                className="falling-code"
                style={{ left: `${line.x}%`, top: `${line.y}%` }}
                onClick={() => dispararLinea(line.id, line.corrupt)}
              >
                {line.text}
              </div>
            ))}
          </div>

          {/* Firewall Visual */}
          <div className="firewall-bar" style={{ borderColor: firewallHp > 40 ? '#00ffcc' : '#ff0055' }}>
            🔒 FIREWALL DE DATOS ACTIVO
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
