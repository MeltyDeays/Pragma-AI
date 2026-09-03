const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, collection, query, where } = require('firebase/firestore');
const { client, firestoreDb, ejecutarGroqConReintentos, parsearJSONGroq } = require('../db.cjs');

const FORJA_RECETAS = {
  'map_fire_skin': {
    nombre: "Mapa Estelar de Fuego",
    tipo: "map_skin",
    costo: { silicon_shards: 15, memory_threads: 5, javascript_essence: 1 }
  },
  'star_aura_neon': {
    nombre: "Aura Estelar Neón",
    tipo: "star_aura",
    costo: { silicon_shards: 20, memory_threads: 10, logic_cores: 2 }
  },
  'laser_color_pink': {
    nombre: "Láser Cyber Rosa",
    tipo: "laser_color",
    costo: { silicon_shards: 10, python_essence: 1 }
  }
};

const SYNTAX_TINDER_SNIPPETS = [
  {
    id: "tinder_1",
    codigo: "const suma = (a, b) => a + b;",
    correcto: true,
    lenguaje: "JavaScript",
    explicacion: "Arrow function limpia y sintácticamente correcta."
  },
  {
    id: "tinder_2",
    codigo: "function test() {\n  if (x = 2) {\n    return true;\n  }\n}",
    correcto: false,
    lenguaje: "JavaScript",
    explicacion: "Usa '=' de asignación en lugar de '===' o '==' dentro de la condición."
  },
  {
    id: "tinder_3",
    codigo: "def sumar_lista(numeros):\n    return sum(numeros)",
    correcto: true,
    lenguaje: "Python",
    explicacion: "Definición válida y limpia usando el método builtin sum."
  },
  {
    id: "tinder_4",
    codigo: "def saludar(nombre)\nprint('Hola ' + nombre)",
    correcto: false,
    lenguaje: "Python",
    explicacion: "Faltan los dos puntos ':' al final de def y la indentación de print."
  },
  {
    id: "tinder_5",
    codigo: "const items = [1, 2, 3];\nconst dobles = items.map(item => item * 2);",
    correcto: true,
    lenguaje: "JavaScript",
    explicacion: "Uso limpio y correcto de Array.prototype.map()."
  },
  {
    id: "tinder_6",
    codigo: "let name = 'Eliab';\nconst name = 'Otro';",
    correcto: false,
    lenguaje: "JavaScript",
    explicacion: "Redeclaración de una constante/variable 'name' en el mismo scope."
  },
  {
    id: "tinder_7",
    codigo: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}",
    correcto: true,
    lenguaje: "Java",
    explicacion: "Clase de entrada de Java perfectamente válida y formateada."
  },
  {
    id: "tinder_8",
    codigo: "int[] nums = {1, 2, 3};\nSystem.out.println(nums[3]);",
    correcto: false,
    lenguaje: "Java",
    explicacion: "Error de índice fuera de rango. nums tiene índices 0, 1 y 2."
  },
  {
    id: "tinder_9",
    codigo: "SELECT u.id, u.nombre, COUNT(o.id) \nFROM usuarios u \nLEFT JOIN ordenes o ON u.id = o.usuario_id \nGROUP BY u.id, u.nombre;",
    correcto: true,
    lenguaje: "SQL",
    explicacion: "Consulta relacional limpia con JOIN y GROUP BY correcto."
  },
  {
    id: "tinder_10",
    codigo: "SELECT * FROM usuarios WHERE edad > 18 GROUP BY id;",
    correcto: false,
    lenguaje: "SQL",
    explicacion: "GROUP BY inválido con SELECT * sin agregadores."
  }
];

async function obtenerPragmaProfile(estudianteId) {
  const docRef = doc(firestoreDb, 'profesor_estudiantes', estudianteId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error('Estudiante no encontrado');
  }
  const data = docSnap.data();
  const defaultPragmaProfile = {
    rank_points: 0,
    cognitive_profile: { strengths: [], weaknesses: [], last_analysis_timestamp: new Date().toISOString() },
    inventory: { silicon_shards: 10, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 },
    unlocked_runes: [],
    unlocked_cosmetics: [],
    equipped_cosmetics: { map_skin: "default", star_aura: "none", laser_color: "#00ffcc" }
  };
  
  let pragma = data.pragma_profile;
  if (pragma) {
    if (typeof pragma === 'string') {
      try { pragma = JSON.parse(pragma); } catch (e) { pragma = defaultPragmaProfile; }
    }
  } else {
    pragma = defaultPragmaProfile;
  }
  return pragma;
}

async function guardarPragmaProfile(estudianteId, pragmaProfile) {
  const docRef = doc(firestoreDb, 'profesor_estudiantes', estudianteId);
  await updateDoc(docRef, { pragma_profile: pragmaProfile });
}

// 1. COPILOTO DE DEPURACIÓN - EVALUACIÓN
router.post('/api/pragma/copiloto/evaluar', async (req, res) => {
  const { estudiante_id, codigo_original, codigo_corregido, justificacion_conceptual } = req.body;
  if (!estudiante_id || !codigo_original || !codigo_corregido || !justificacion_conceptual) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const prompt = `
    Analiza el siguiente código erróneo, su corrección realizada por un alumno de programación, y su justificación conceptual del error.
    Determina si la corrección es lógicamente válida y si la justificación conceptual demuestra entendimiento real del bug.
    
    CÓDIGO ORIGINAL:
    ${codigo_original}
    
    CÓDIGO CORREGIDO:
    ${codigo_corregido}
    
    JUSTIFICACIÓN CONCEPTUAL:
    ${justificacion_conceptual}
    
    Devuelve estrictamente un JSON válido con la siguiente estructura (no agregues texto fuera del JSON):
    {
      "aprobado": true o false,
      "puntaje": número entre 0 y 100,
      "retroalimentacion": "explicación clara del bug y evaluación del alumno"
    }
    `;

    const completion = await ejecutarGroqConReintentos(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      { type: 'json_object' }
    );

    const respuesta = parsearJSONGroq(completion.choices[0].message.content);
    
    if (respuesta.aprobado && respuesta.puntaje >= 90) {
      const pragma = await obtenerPragmaProfile(estudiante_id);
      
      pragma.rank_points += 15;
      pragma.inventory.silicon_shards += 5;
      pragma.inventory.memory_threads += 2;
      
      if (respuesta.puntaje >= 95) {
        pragma.unlocked_runes.push({
          id: crypto.randomUUID(),
          titulo: "Depuración Copiloto",
          codigo: codigo_corregido,
          fecha: new Date().toISOString()
        });
      }
      
      await guardarPragmaProfile(estudiante_id, pragma);
    }

    res.json(respuesta);
  } catch (error) {
    console.error('Error en copiloto evaluar:', error);
    res.status(500).json({ error: 'Fallo al procesar evaluación de copiloto' });
  }
});

// 2. MODO ZEN - MICRO-ACERTIJOS
router.post('/api/pragma/zen/acertijo', async (req, res) => {
  const { tecnologia, nivel } = req.body;
  const tech = tecnologia || 'JavaScript';
  const lvl = nivel || 'Novato';

  try {
    const prompt = `
    Genera un micro-acertijo de programación en ${tech} para nivel ${lvl}.
    Debe ser de baja complejidad cognitiva (Modo Zen). El alumno debe completar o arreglar una parte sumamente pequeña de código.
    Devuelve estrictamente un objeto JSON con este formato:
    {
      "titulo": "Título corto del acertijo",
      "descripcion": "Descripción concisa de qué hacer",
      "codigo_inicial": "código incompleto o con un pequeño error para editar",
      "solucion_esperada": "código completo corregido"
    }
    `;

    const completion = await ejecutarGroqConReintentos(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      { type: 'json_object' }
    );

    const acertijo = parsearJSONGroq(completion.choices[0].message.content);
    res.json(acertijo);
  } catch (error) {
    console.error('Error al generar acertijo zen:', error);
    res.status(500).json({ error: 'No se pudo generar el acertijo zen' });
  }
});

router.post('/api/pragma/zen/resolver', async (req, res) => {
  const { estudiante_id, acertijo_titulo, codigo_inicial, codigo_usuario, solucion_esperada } = req.body;
  if (!estudiante_id || !codigo_usuario) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const prompt = `
    Evalúa si el código enviado por el alumno soluciona correctamente el micro-acertijo de programación.
    El acertijo es: "${acertijo_titulo}".
    Código inicial: ${codigo_inicial}
    Solución esperada aproximada: ${solucion_esperada}
    Código enviado por el alumno: ${codigo_usuario}
    
    Devuelve estrictamente un objeto JSON:
    {
      "correcto": true o false,
      "explicacion": "Explicación muy corta e instructiva"
    }
    `;

    const completion = await ejecutarGroqConReintentos(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      { type: 'json_object' }
    );

    const evaluacion = parsearJSONGroq(completion.choices[0].message.content);

    if (evaluacion.correcto) {
      const pragma = await obtenerPragmaProfile(estudiante_id);
      pragma.rank_points += 5;
      pragma.inventory.silicon_shards += 2;
      pragma.inventory.memory_threads += 1;
      await guardarPragmaProfile(estudiante_id, pragma);
    }

    res.json(evaluacion);
  } catch (error) {
    console.error('Error al resolver acertijo zen:', error);
    res.status(500).json({ error: 'Fallo al evaluar la solución zen' });
  }
});

// 3. LA TABERNA DEL CÓDIGO - OPTIMIZACIÓN EXTREMA
router.post('/api/pragma/taberna/optimizar', async (req, res) => {
  const { estudiante_id, codigo_usuario, tecnologia } = req.body;
  if (!estudiante_id || !codigo_usuario) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const prompt = `
    Evalúa si el siguiente código cumple con requisitos de alta eficiencia y optimización extrema.
    Queremos una complejidad temporal O(N) o mejor (como O(1) o O(log N)) y un uso simulado de memoria RAM ultra bajo (<12MB).
    Analiza el código y proporciona métricas simuladas exactas.
    
    CÓDIGO:
    ${codigo_usuario}
    
    Devuelve estrictamente un objeto JSON:
    {
      "valido": true o false,
      "complejidad_temporal": "O(N) o similar encontrado",
      "memoria_simulada_mb": número de RAM consumida (entre 1.0 y 20.0),
      "feedback": "retroalimentación ultra corta sobre la performance y Big-O"
    }
    `;

    const completion = await ejecutarGroqConReintentos(
      [{ role: 'user', content: prompt }],
      'llama-3.1-8b-instant',
      { type: 'json_object' }
    );

    const evaluacion = parsearJSONGroq(completion.choices[0].message.content);

    if (evaluacion.valido && evaluacion.memoria_simulada_mb < 12.0) {
      const pragma = await obtenerPragmaProfile(estudiante_id);
      
      pragma.rank_points += 20;
      pragma.inventory.logic_cores += 1;
      
      const techKey = (tecnologia || 'JavaScript').toLowerCase();
      if (techKey.includes('javascript') || techKey.includes('react') || techKey.includes('node')) {
        pragma.inventory.javascript_essence += 2;
      } else if (techKey.includes('python')) {
        pragma.inventory.python_essence += 2;
      } else if (techKey.includes('java')) {
        pragma.inventory.java_essence += 2;
      } else if (techKey.includes('sql') || techKey.includes('supabase')) {
        pragma.inventory.sql_essence += 2;
      } else {
        pragma.inventory.silicon_shards += 5;
      }

      await guardarPragmaProfile(estudiante_id, pragma);
    }

    res.json(evaluacion);
  } catch (error) {
    console.error('Error en taberna optimizar:', error);
    res.status(500).json({ error: 'Fallo al validar optimización' });
  }
});

// 4. LA FORJA - RECETAS Y COSMÉTICOS
router.post('/api/pragma/forja/forjar', async (req, res) => {
  const { estudiante_id, receta_id } = req.body;
  const receta = FORJA_RECETAS[receta_id];
  if (!receta) return res.status(400).json({ error: 'Receta no válida' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    
    for (const [recurso, cantidad] of Object.entries(receta.costo)) {
      if ((pragma.inventory[recurso] || 0) < cantidad) {
        return res.status(400).json({ error: `Materiales insuficientes. Falta ${recurso}.` });
      }
    }

    for (const [recurso, cantidad] of Object.entries(receta.costo)) {
      pragma.inventory[recurso] -= cantidad;
    }

    if (!pragma.unlocked_cosmetics.includes(receta_id)) {
      pragma.unlocked_cosmetics.push(receta_id);
    }

    await guardarPragmaProfile(estudiante_id, pragma);
    res.json({ success: true, unlocked_cosmetics: pragma.unlocked_cosmetics, inventory: pragma.inventory });
  } catch (error) {
    console.error('Error al forjar:', error);
    res.status(500).json({ error: 'Fallo al procesar crafteo' });
  }
});

// 5. EQUIPAR COSMÉTICOS
router.post('/api/pragma/perfil/equipar', async (req, res) => {
  const { estudiante_id, categoria, item_id } = req.body;
  if (!estudiante_id || !categoria || !item_id) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    
    if (item_id !== 'default' && item_id !== 'none' && !pragma.unlocked_cosmetics.includes(item_id)) {
      return res.status(400).json({ error: 'Este cosmético está bloqueado.' });
    }

    pragma.equipped_cosmetics[categoria] = item_id;
    await guardarPragmaProfile(estudiante_id, pragma);
    res.json({ success: true, equipped_cosmetics: pragma.equipped_cosmetics });
  } catch (error) {
    console.error('Error al equipar cosmético:', error);
    res.status(500).json({ error: 'Fallo al equipar cosmético' });
  }
});

// 6. SYNTAX TINDER
router.get('/api/pragma/tinder/codigo', (req, res) => {
  const randomSnippet = SYNTAX_TINDER_SNIPPETS[Math.floor(Math.random() * SYNTAX_TINDER_SNIPPETS.length)];
  res.json(randomSnippet);
});

router.post('/api/pragma/tinder/votar', async (req, res) => {
  const { estudiante_id, snippet_id, voto } = req.body;
  const snippet = SYNTAX_TINDER_SNIPPETS.find(s => s.id === snippet_id);
  if (!snippet) return res.status(404).json({ error: 'Snippet no encontrado' });

  const acierto = snippet.correcto === voto;

  try {
    if (acierto) {
      const pragma = await obtenerPragmaProfile(estudiante_id);
      pragma.rank_points += 5;
      pragma.inventory.silicon_shards += 1;
      await guardarPragmaProfile(estudiante_id, pragma);
    }
    res.json({ acierto, explicacion: snippet.explicacion });
  } catch (error) {
    console.error('Error al votar en tinder:', error);
    res.status(500).json({ error: 'Fallo al procesar voto' });
  }
});

const BOTS_NOMBRES = [
  'CYBER_PUNK', 'NEO_CODER', 'NULL_POINTER', 'SYNTAX_VIPER', 
  'QUANTUM_DEV', 'ALGO_WARRIOR', 'BYTE_RUNNER', 'ZERO_DAY', 
  'BINARY_SHADOW', 'PRAGMA_CORE', 'ZeroCool', 'Hackerman', 
  'L33tGamer', 'AcidBurn', 'CrashOverride', 'Plague', 'CerealKiller'
];

const POOL_RETOS_MULTIJUGADOR = [
  {
    id: 'trivia_1',
    tipo: 'trivia',
    categoria: 'arcade',
    titulo: 'Complejidad Computacional',
    pregunta: '¿Cuál es la complejidad temporal promedio de búsqueda en un Map/Set bien balanceado en JavaScript/V8?',
    opciones: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
    correcta: 2,
    explicacion: 'Las tablas Hash permiten acceso en O(1) promedio gracias a su función de hashing.'
  },
  {
    id: 'trivia_2',
    tipo: 'trivia',
    categoria: 'arcade',
    titulo: 'React Hooks y Memorización',
    pregunta: '¿Qué Hook de React se utiliza para memorizar la definición de una función y evitar recrearla en cada render?',
    opciones: ['useMemo', 'useCallback', 'useRef', 'useEffect'],
    correcta: 1,
    explicacion: 'useCallback memoriza una instancia de función en lugar de su resultado evaluado.'
  },
  {
    id: 'trivia_3',
    tipo: 'trivia',
    categoria: 'arcade',
    titulo: 'Event Loop & Concurrencia',
    pregunta: '¿En qué orden se procesan las Microtareas (Promise.then) frente a Macrotareas (setTimeout)?',
    opciones: [
      'Se ejecutan después de todas las macrotareas',
      'Tienen prioridad y se procesan antes del siguiente ciclo de macrotareas',
      'Se ejecutan en paralelo en subprocesos aislados',
      'El motor elige aleatoriamente según carga'
    ],
    correcta: 1,
    explicacion: 'La cola de microtareas se vacía por completo antes de continuar con la siguiente macrotarea.'
  },
  {
    id: 'output_1',
    tipo: 'output',
    categoria: 'arcade',
    titulo: 'Predicción de Salida: Coerción',
    codigo: 'console.log(1 + +"2" + "2");',
    opciones: ['"32"', '"122"', 'NaN', '3'],
    correcta: 0,
    explicacion: 'El operador unario +"2" convierte a número 2; 1 + 2 = 3; luego 3 + "2" resulta en "32".'
  },
  {
    id: 'output_2',
    tipo: 'output',
    categoria: 'arcade',
    titulo: 'Predicción de Salida: Scoping & Hoisting',
    codigo: 'let a = 10;\n(() => {\n  let a = 20;\n  a += 5;\n})();\nconsole.log(a);',
    opciones: ['25', '10', 'undefined', 'ReferenceError'],
    correcta: 1,
    explicacion: 'La variable a dentro de la IIFE está en su propio ámbito léxico; la variable externa permanece en 10.'
  },
  {
    id: 'refactor_1',
    tipo: 'refactor',
    categoria: 'arcade',
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
  {
    id: 'sorter_1',
    tipo: 'sorter',
    categoria: 'pragma',
    titulo: 'Pipeline Funcional de Arrays',
    lineas: ['  .map(n => n * 2);', 'return numeros', '  .filter(n => n % 2 === 0)'],
    lineas_ordenadas: ['return numeros', '  .filter(n => n % 2 === 0)', '  .map(n => n * 2);']
  },
  {
    id: 'sorter_2',
    tipo: 'sorter',
    categoria: 'pragma',
    titulo: 'Estructura Asíncrona con Try/Catch',
    lineas: ['  } catch (err) {', '  try {', '    const res = await fetch(url);', '    console.error(err);', '  }'],
    lineas_ordenadas: ['  try {', '    const res = await fetch(url);', '  } catch (err) {', '    console.error(err);', '  }']
  },
  {
    id: 'fill_1',
    tipo: 'fill-blank',
    categoria: 'pragma',
    titulo: 'Consumo Asíncrono de APIs',
    codigo_con_huecos: 'const response = ___1___ fetch("/api/datos");\nconst payload = ___2___ response.json();',
    respuestas: {
      '1': 'await',
      '2': 'await'
    }
  },
  {
    id: 'flashcard_1',
    tipo: 'flashcard',
    categoria: 'arcade',
    titulo: 'Fundamentos de Motor Web & JS',
    flashcards: [
      { afirmacion: 'Las promesas no resueltas bloquean el hilo principal de Node.js indefinidamente.', es_verdadero: false },
      { afirmacion: 'Array.prototype.map retorna un nuevo array sin mutar el original.', es_verdadero: true },
      { afirmacion: 'const en JavaScript hace inmutables las propiedades internas de un objeto.', es_verdadero: false }
    ]
  },
  {
    id: 'typer_1',
    tipo: 'typer',
    categoria: 'pragma',
    titulo: 'Speedrun: Estado Reactivo',
    codigo: 'const [operador, setOperador] = useState(null);',
    descripcion: 'Escribe la declaración del estado de React a máxima velocidad sin errores.'
  },
  {
    id: 'memory_1',
    tipo: 'memory',
    categoria: 'arcade',
    titulo: 'Matriz de Conceptos de Software',
    cartas: [
      { id: 'm1', matchingId: 'p1', texto: 'Closure', flipped: false, matched: false },
      { id: 'm2', matchingId: 'p1', texto: 'Ámbito Léxico Recordado', flipped: false, matched: false },
      { id: 'm3', matchingId: 'p2', texto: 'Idempotencia', flipped: false, matched: false },
      { id: 'm4', matchingId: 'p2', texto: 'Mismo Resultado Siempre', flipped: false, matched: false }
    ]
  },
  {
    id: 'zen_1',
    tipo: 'zen',
    categoria: 'pragma',
    titulo: 'Recursión Segura',
    descripcion: 'Completa la línea de control del caso base recursivo para evitar un Stack Overflow.',
    codigoInicial: 'function factorial(n) {\n  if (______) return 1;\n  return n * factorial(n - 1);\n}',
    codigoCorrecto: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
    guia: 'Ejemplo: n <= 1'
  },
  {
    id: 'tinder_1',
    tipo: 'tinder',
    categoria: 'pragma',
    titulo: 'Alineación de Flexbox',
    descripcion: 'Escribe la propiedad CSS correcta para centrar verticalmente en flex-direction: column.',
    codigoInicial: '.cyber-container {\n  display: flex;\n  flex-direction: column;\n  justify-content: ______;\n}',
    codigoCorrecto: '.cyber-container {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n}',
    guia: 'Ejemplo: center'
  }
];

function generarRetosMultijugador(categoria = 'mixed', dificultad = 'intermedio') {
  let pool = [...POOL_RETOS_MULTIJUGADOR];
  if (categoria === 'arcade') {
    pool = pool.filter(r => r.categoria === 'arcade');
  } else if (categoria === 'pragma') {
    pool = pool.filter(r => r.categoria === 'pragma');
  }

  // Barajar pool aleatoriamente
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const count = dificultad === 'novato' ? 3 : dificultad === 'experto' ? 5 : 4;
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 7. LOBBY MULTIJUGADOR COMPETITIVO
router.post('/api/pragma/multiplayer/match/join', async (req, res) => {
  const { estudiante_id, tipo_match, categoria, dificultad } = req.body;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    await setDoc(docRef, {
      estudiante_id,
      nombre: pragma.username || "Tú",
      tipo_match: tipo_match || "1v1",
      categoria: categoria || "mixed",
      dificultad: dificultad || "intermedio",
      rank_points: pragma.rank_points || 0,
      laser_color: pragma.equipped_cosmetics?.laser_color || "#00ffcc",
      map_skin: pragma.equipped_cosmetics?.map_skin || "default",
      status: "esperando",
      fecha_creacion: new Date().toISOString()
    });

    res.json({ success: true, mensaje: "Registrado en cola de matchmaking con éxito." });
  } catch (error) {
    console.error('Error al unirse a matchmaking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/api/pragma/multiplayer/match/status/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.json({ status: 'cancelado' });
    }

    const ticket = docSnap.data();

    if (ticket.status === 'completado') {
      return res.json({ status: 'completado', matchResult: ticket.matchResult });
    }

    const q = query(
      collection(firestoreDb, 'pragma_matchmaking'),
      where('tipo_match', '==', ticket.tipo_match),
      where('status', '==', 'esperando')
    );
    
    const querySnapshot = await getDocs(q);
    const candidatos = [];
    querySnapshot.forEach((d) => {
      const data = d.data();
      if (data.estudiante_id !== estudiante_id) {
        candidatos.push(data);
      }
    });

    let totalOponentesRealesNecesarios = 1;
    if (ticket.tipo_match === "2v2") totalOponentesRealesNecesarios = 3;
    if (ticket.tipo_match === "4v4") totalOponentesRealesNecesarios = 7;
    if (ticket.tipo_match === "todos_vs_todos") totalOponentesRealesNecesarios = 4;

    if (candidatos.length >= totalOponentesRealesNecesarios) {
      const oponentes = candidatos.slice(0, totalOponentesRealesNecesarios);
      const salaId = `sala_${crypto.randomUUID()}`;
      const retosSincronizados = generarRetosMultijugador(ticket.categoria, ticket.dificultad);
      
      const jugadores = [
        { id: estudiante_id, nombre: ticket.nombre, rank_points: ticket.rank_points, laser_color: ticket.laser_color, map_skin: ticket.map_skin, isBot: false },
        ...oponentes.map(o => ({ id: o.estudiante_id, nombre: o.nombre, rank_points: o.rank_points, laser_color: o.laser_color, map_skin: o.map_skin, isBot: false }))
      ];

      // Registrar partida activa en Firestore para sincronización de telemetría SSE
      const partidaDocRef = doc(firestoreDb, 'pragma_partidas', salaId);
      await setDoc(partidaDocRef, {
        salaId,
        participantes: [estudiante_id, ...oponentes.map(o => o.estudiante_id)],
        retos: retosSincronizados,
        creado_en: new Date().toISOString()
      });

      const matchResult = {
        salaId,
        tipo_match: ticket.tipo_match,
        jugadores,
        retos: retosSincronizados,
        mensaje: "¡Oponentes reales encontrados en red! Combate inicializado.",
        victoria: null,
        rankGanado: 25,
        shardsGanado: 10
      };

      await setDoc(docRef, { ...ticket, status: 'completado', matchResult });

      for (const op of oponentes) {
        const opDocRef = doc(firestoreDb, 'pragma_matchmaking', op.estudiante_id);
        await setDoc(opDocRef, { ...op, status: 'completado', matchResult });
      }

      return res.json({ status: 'completado', matchResult });
    }

    const inicio = new Date(ticket.fecha_creacion).getTime();
    const ahora = new Date().getTime();
    const tiempoEsperaSegundos = (ahora - inicio) / 1000;

    if (tiempoEsperaSegundos >= 5) {
      const salaId = `sala_${crypto.randomUUID()}`;
      const oponentesBots = [];
      const totalBots = totalOponentesRealesNecesarios;
      const retosSincronizados = generarRetosMultijugador(ticket.categoria, ticket.dificultad);

      for (let i = 0; i < totalBots; i++) {
        const botNombre = BOTS_NOMBRES[Math.floor(Math.random() * BOTS_NOMBRES.length)] + ` #${Math.floor(Math.random()*900 + 100)}`;
        oponentesBots.push({
          id: `bot_${crypto.randomUUID()}`,
          nombre: botNombre,
          rank_points: Math.max(0, ticket.rank_points + Math.floor(Math.random() * 200 - 100)),
          laser_color: ["#ff0055", "#00ff66", "#ffff00", "#ff00ff"][Math.floor(Math.random() * 4)],
          map_skin: "neon_cyber",
          isBot: true
        });
      }

      const jugadores = [
        { id: estudiante_id, nombre: ticket.nombre, rank_points: ticket.rank_points, laser_color: ticket.laser_color, map_skin: ticket.map_skin, isBot: false },
        ...oponentesBots
      ];

      const matchResult = {
        salaId,
        tipo_match: ticket.tipo_match,
        jugadores,
        retos: retosSincronizados,
        mensaje: "No se detectaron operadores adicionales en cola. Simulación táctica con agentes bot inicializada.",
        victoria: null,
        rankGanado: 25,
        shardsGanado: 10
      };

      await setDoc(docRef, { ...ticket, status: 'completado', matchResult });

      return res.json({ status: 'completado', matchResult });
    }

    return res.json({ status: 'esperando' });
  } catch (error) {
    console.error('Error al consultar estado de matchmaking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/api/pragma/multiplayer/match/cancel', async (req, res) => {
  const { estudiante_id } = req.body;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    await deleteDoc(docRef);
    res.json({ success: true, mensaje: "Búsqueda de partida cancelada con éxito." });
  } catch (error) {
    console.error('Error al cancelar matchmaking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 8. TELEMETRÍA DE PROGRESO DE PARTIDAS EN TIEMPO REAL (SSE RELAY)
router.post('/api/partidas/:id/progreso', async (req, res) => {
  const { id } = req.params;
  const { jugador_id, progreso, errores, tiempo, finalizado } = req.body;

  if (!jugador_id) {
    return res.status(400).json({ error: 'Falta jugador_id' });
  }

  try {
    const docRef = doc(firestoreDb, 'pragma_partidas', id);
    const snap = await getDoc(docRef);
    let partida = snap.exists() ? snap.data() : { id, participantes: [], jugadores: {} };
    partida.jugadores = partida.jugadores || {};
    partida.jugadores[jugador_id] = {
      progreso,
      errores,
      tiempo,
      finalizado,
      actualizado_en: new Date().toISOString()
    };
    await setDoc(docRef, partida, { merge: true });

    // Notificar al rival si es un duelo social
    const dueloRef = doc(firestoreDb, 'profesor_duelos', id);
    const dueloSnap = await getDoc(dueloRef);
    if (dueloSnap.exists()) {
      const dueloData = dueloSnap.data();
      const rivalId = dueloData.retador_id === jugador_id ? dueloData.retado_id : dueloData.retador_id;
      if (global.enviarNotificacionSSE) {
        global.enviarNotificacionSSE(rivalId, 'duelo_progreso', {
          partida_id: id,
          jugador_id,
          progreso,
          errores,
          tiempo,
          finalizado
        });
      }
    } else if (partida.participantes && Array.isArray(partida.participantes)) {
      // Si es sala multijugador de matchmaking, retransmitir a los demás participantes
      for (const pId of partida.participantes) {
        if (pId !== jugador_id && global.enviarNotificacionSSE) {
          global.enviarNotificacionSSE(pId, 'duelo_progreso', {
            partida_id: id,
            jugador_id,
            progreso,
            errores,
            tiempo,
            finalizado
          });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al registrar progreso de partida:', error);
    res.status(500).json({ error: 'Error interno al registrar telemetría' });
  }
});

router.generarRetosMultijugador = generarRetosMultijugador;

module.exports = router;


