const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, collection, query, where } = require('firebase/firestore');
const { client, firestoreDb, ejecutarGroqConReintentos, parsearJSONGroq } = require('../db.cjs');

const FORJA_RECETAS = {
  'map_fire_skin': {
    nombre: "Cartografía Estelar Ígnea",
    tipo: "map_skin",
    costo: { silicon_shards: 15, memory_threads: 5, javascript_essence: 1 }
  },
  'map_tactical_slate': {
    nombre: "Matriz Táctica Slate",
    tipo: "map_skin",
    costo: { silicon_shards: 15, memory_threads: 5, sql_essence: 1 }
  },
  'star_aura_neon': {
    nombre: "Aura Táctica Índigo",
    tipo: "star_aura",
    costo: { silicon_shards: 20, memory_threads: 10, logic_cores: 2 }
  },
  'star_aura_emerald': {
    nombre: "Escudo Algorítmico Esmeralda",
    tipo: "star_aura",
    costo: { silicon_shards: 25, memory_threads: 12, logic_cores: 2, javascript_essence: 1 }
  },
  'star_aura_violet': {
    nombre: "Vórtice Cuántico Violeta",
    tipo: "star_aura",
    costo: { silicon_shards: 30, memory_threads: 15, logic_cores: 3, python_essence: 1 }
  },
  'laser_color_pink': {
    nombre: "Foco Táctico Ámbar (#f59e0b)",
    tipo: "laser_color",
    costo: { silicon_shards: 10, python_essence: 1 }
  },
  'laser_color_sky': {
    nombre: "Haz Cuántico Sky (#38bdf8)",
    tipo: "laser_color",
    costo: { silicon_shards: 10, sql_essence: 1 }
  }
};

const SYNTAX_TINDER_SNIPPETS = [
  {
    id: "tinder_1",
    codigo: "const suma = (a, b) => a + b;",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "syntax",
    hint: "Arrow function con retorno implícito.",
    explicacion: "Arrow function limpia y sintácticamente correcta con retorno implícito."
  },
  {
    id: "tinder_2",
    codigo: "function test() {\n  if (x = 2) {\n    return true;\n  }\n}",
    correcto: false,
    lenguaje: "JavaScript",
    categoria: "bugs",
    hint: "Revisa los operadores lógicos en la condición.",
    explicacion: "Usa '=' de asignación en lugar del operador de comparación estricta '===' dentro del condicional."
  },
  {
    id: "tinder_3",
    codigo: "def sumar_lista(numeros):\n    return sum(numeros)",
    correcto: true,
    lenguaje: "Python",
    categoria: "clean_code",
    hint: "Uso idiomático de funciones nativas.",
    explicacion: "Definición válida y pythónica usando la función nativa sum()."
  },
  {
    id: "tinder_4",
    codigo: "def saludar(nombre)\nprint('Hola ' + nombre)",
    correcto: false,
    lenguaje: "Python",
    categoria: "syntax",
    hint: "Observa los signos de puntuación y la indentación de bloques.",
    explicacion: "Error de sintaxis: falta ':' al final de def y la línea del print carece de indentación de 4 espacios."
  },
  {
    id: "tinder_5",
    codigo: "const items = [1, 2, 3];\nconst dobles = items.map(item => item * 2);",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "functional",
    hint: "Transformación inmutable de arreglos.",
    explicacion: "Uso limpio y puro de Array.prototype.map() sin mutar el array original."
  },
  {
    id: "tinder_6",
    codigo: "let name = 'Eliab';\nconst name = 'Otro';",
    correcto: false,
    lenguaje: "JavaScript",
    categoria: "scope",
    hint: "Declaración múltiple en el mismo ámbito léxico.",
    explicacion: "Identifier 'name' has already been declared. No se puede redeclarar una variable en el mismo ámbito."
  },
  {
    id: "tinder_7",
    codigo: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}",
    correcto: true,
    lenguaje: "Java",
    categoria: "syntax",
    hint: "Firma estándar del punto de entrada en Java.",
    explicacion: "Clase de entrada de Java perfectamente válida, estructurada y formateada."
  },
  {
    id: "tinder_8",
    codigo: "int[] nums = {1, 2, 3};\nSystem.out.println(nums[3]);",
    correcto: false,
    lenguaje: "Java",
    categoria: "runtime",
    hint: "Los índices de arreglos son 0-indexed.",
    explicacion: "ArrayIndexOutOfBoundsException. El arreglo tiene longitud 3 con índices válidos 0, 1 y 2."
  },
  {
    id: "tinder_9",
    codigo: "SELECT u.id, u.nombre, COUNT(o.id) \nFROM usuarios u \nLEFT JOIN ordenes o ON u.id = o.usuario_id \nGROUP BY u.id, u.nombre;",
    correcto: true,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Consulta relacional con función de agregación agrupada.",
    explicacion: "Consulta relacional limpia con JOIN y GROUP BY correcto para todas las columnas proyectadas sin agregar."
  },
  {
    id: "tinder_10",
    codigo: "SELECT * FROM usuarios WHERE edad > 18 GROUP BY id;",
    correcto: false,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Agrupación con proyección de todas las columnas.",
    explicacion: "Consulta inválida en SQL estándar: no se puede agrupar con 'SELECT *' sin aplicar agregaciones al resto de columnas."
  },
  {
    id: "tinder_11",
    codigo: "const users = await fetch('/api/users');\nconst data = await users.json();",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "async",
    hint: "Consumo de API moderna con Promesas encadenadas.",
    explicacion: "Manejo asíncrono limpio esperando la respuesta HTTP y la serialización JSON secuencial."
  },
  {
    id: "tinder_12",
    codigo: "function calculateDiscount(price, discount = 0) {\n  return price - (price * discount);\n}",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "clean_code",
    hint: "Parámetros predeterminados en funciones.",
    explicacion: "Código limpio y defensivo que asigna valor por defecto al parámetro de descuento."
  },
  {
    id: "tinder_13",
    codigo: "const user = null;\nconsole.log(user.profile.name);",
    correcto: false,
    lenguaje: "JavaScript",
    categoria: "runtime",
    hint: "Acceso a propiedad de valor nulo.",
    explicacion: "TypeError: Cannot read properties of null. Debería usar optional chaining (?.)."
  },
  {
    id: "tinder_14",
    codigo: "def filtrar_pares(lista):\n    return [x for x in lista if x % 2 == 0]",
    correcto: true,
    lenguaje: "Python",
    categoria: "comprehension",
    hint: "List comprehension idiomática.",
    explicacion: "List comprehension concisa, declarativa y de alto rendimiento para filtrado."
  },
  {
    id: "tinder_15",
    codigo: "def append_item(val, lista=[]):\n    lista.append(val)\n    return lista",
    correcto: false,
    lenguaje: "Python",
    categoria: "pitfall",
    hint: "Cuidado con valores por defecto mutables en Python.",
    explicacion: "Antipatrón clásico de Python: usar lista mutable como valor predeterminado comparte estado entre llamadas."
  },
  {
    id: "tinder_16",
    codigo: "try {\n  JSON.parse(rawInput);\n} catch (e) {\n  console.warn('JSON inválido:', e.message);\n}",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "resilience",
    hint: "Control estructurado de excepciones al parsear.",
    explicacion: "Manejo robusto con bloque try-catch previniendo caída de la aplicación por datos malformados."
  },
  {
    id: "tinder_17",
    codigo: "SELECT id, email FROM clientes WHERE email IS NULL;",
    correcto: true,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Comparación de valores nulos en bases de datos.",
    explicacion: "Uso correcto de 'IS NULL' en SQL en lugar del erróneo '= NULL'."
  },
  {
    id: "tinder_18",
    codigo: "SELECT * FROM productos WHERE precio = NULL;",
    correcto: false,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Los valores NULL no se comparan con igualdad ordinaria.",
    explicacion: "En SQL cualquier comparación con '= NULL' evalúa a UNKNOWN. Debe utilizarse 'IS NULL'."
  },
  {
    id: "tinder_19",
    codigo: "const [count, setCount] = useState(0);\nuseEffect(() => {\n  setCount(count + 1);\n});",
    correcto: false,
    lenguaje: "React",
    categoria: "hooks",
    hint: "Efecto secundario sin arreglo de dependencias.",
    explicacion: "Bucle infinito de renders: useEffect sin segundo argumento se ejecuta en cada ciclo de actualización."
  },
  {
    id: "tinder_20",
    codigo: "const total = precios.reduce((acc, curr) => acc + curr, 0);",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "functional",
    hint: "Acumulación funcional con valor inicial.",
    explicacion: "Uso ejemplar de Array.reduce() con valor inicial explícito 0 evitando errores con listas vacías."
  },
  {
    id: "tinder_21",
    codigo: "datos = {'clave': 'valor'}\nres = datos.get('inexistente', 'defecto')",
    correcto: true,
    lenguaje: "Python",
    categoria: "clean_code",
    hint: "Acceso seguro con valor por defecto.",
    explicacion: "El método dict.get() evita KeyError retornando el valor alternativo provisto."
  },
  {
    id: "tinder_22",
    codigo: "for i in range(5):\nx = i * 2",
    correcto: false,
    lenguaje: "Python",
    categoria: "syntax",
    hint: "Error de indentación en bloque for.",
    explicacion: "IndentationError: el cuerpo del bucle for en Python requiere indentación explícita de 4 espacios."
  },
  {
    id: "tinder_23",
    codigo: "nombre = 'Ana'\nmsg = f'Hola {nombre}, bienvenido'",
    correcto: true,
    lenguaje: "Python",
    categoria: "syntax",
    hint: "Interpolación moderna de cadenas con f-strings.",
    explicacion: "Uso canónico de f-strings en Python 3.6+ para formato limpio y eficiente de texto."
  },
  {
    id: "tinder_24",
    codigo: "def dividir(a, b):\n    return a / b\nres = dividir(10, 0)",
    correcto: false,
    lenguaje: "Python",
    categoria: "runtime",
    hint: "División entre cero sin validación previa ni excepción.",
    explicacion: "ZeroDivisionError inminente: se debe validar el divisor o capturar con try-except."
  },
  {
    id: "tinder_25",
    codigo: "SELECT DISTINCT categoria FROM productos WHERE stock > 0;",
    correcto: true,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Deduplicación de resultados relacionales con DISTINCT.",
    explicacion: "Consulta SQL perfectamente válida y optimizada para listar categorías únicas activas."
  },
  {
    id: "tinder_26",
    codigo: "UPDATE empleados SET salario = salario * 1.10;",
    correcto: false,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Mutación masiva no intencionada por ausencia de WHERE.",
    explicacion: "Peligro crítico: UPDATE sin cláusula WHERE sobrescribe todas las filas de la tabla empleados."
  },
  {
    id: "tinder_27",
    codigo: "SELECT d.nombre, COUNT(e.id) AS total\nFROM departamentos d\nJOIN empleados e ON d.id = e.depto_id\nGROUP BY d.nombre;",
    correcto: true,
    lenguaje: "SQL",
    categoria: "queries",
    hint: "Agregación relacional estándar con JOIN y GROUP BY.",
    explicacion: "Uso canónico de JOIN y GROUP BY agrupando por todas las columnas no agregadas."
  },
  {
    id: "tinder_28",
    codigo: "SELECT id FROM transacciones WHERE YEAR(fecha) = 2026;",
    correcto: false,
    lenguaje: "SQL",
    categoria: "performance",
    hint: "Función aplicada a columna indexada imposibilita el uso de índices.",
    explicacion: "Antipatrón SQL: aplicar funciones sobre columnas en WHERE anula el uso de índices B-Tree (full scan)."
  },
  {
    id: "tinder_29",
    codigo: "const tema = usuario?.preferencias?.tema ?? 'oscuro';",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "syntax",
    hint: "Encadenamiento opcional y coalescencia nula.",
    explicacion: "Sintaxis moderna ECMAScript ultra defensiva contra nulos o indefinidos."
  },
  {
    id: "tinder_30",
    codigo: "function Perfil(props) {\n  props.usuario.nombre = 'Modificado';\n  return <div>{props.usuario.nombre}</div>;\n}",
    correcto: false,
    lenguaje: "React",
    categoria: "react",
    hint: "Violación del principio de inmutabilidad en props de React.",
    explicacion: "Las props en React son de solo lectura y nunca deben ser mutadas directamente."
  },
  {
    id: "tinder_31",
    codigo: "const [u, p] = await Promise.all([fetchUser(), fetchPosts()]);",
    correcto: true,
    lenguaje: "JavaScript",
    categoria: "async",
    hint: "Concurrencia asíncrona no bloqueante.",
    explicacion: "Patrón óptimo para ejecutar múltiples promesas independientes en paralelo."
  },
  {
    id: "tinder_32",
    codigo: "if ([] == 0) {\n  console.log('Son iguales');\n}",
    correcto: false,
    lenguaje: "JavaScript",
    categoria: "pitfall",
    hint: "Coerción de tipos implícita y comparación débil peligrosa.",
    explicacion: "Antipatrón de JavaScript: el uso de '==' produce coerción confusa. Debe emplearse '===' estricto."
  }
];

// Caché en memoria para perfiles Pragma (Zero-Latency / BOOST)
const pragmaProfileCache = new Map();

function createDefaultPragmaProfile() {
  return {
    rank_points: 0,
    energy: 100,
    cognitive_profile: { strengths: [], weaknesses: [], last_analysis_timestamp: new Date().toISOString() },
    inventory: { silicon_shards: 15, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 },
    unlocked_runes: ["quantum", "aural", "cyber", "void", "nexus", "data", "pyro", "chronos", "nexsis", "dati", "aura", "ghost", "weave", "voidp"],
    active_perks: [],
    runic_array: ["chronos", "quantum", "cyber"],
    unlocked_cosmetics: [],
    equipped_cosmetics: { map_skin: "default", star_aura: "none", laser_color: "#38bdf8" },
    defense_stats: { highscore: 0, max_stage: 1 },
    dungeon_progress: { unlocked_rooms: ["0,0"] }
  };
}

async function obtenerPragmaProfile(estudianteId) {
  if (!estudianteId) {
    return createDefaultPragmaProfile();
  }
  if (pragmaProfileCache.has(estudianteId)) {
    return pragmaProfileCache.get(estudianteId);
  }
  try {
    const docRef = doc(firestoreDb, 'profesor_estudiantes', String(estudianteId));
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const defaultProfile = createDefaultPragmaProfile();
      pragmaProfileCache.set(estudianteId, defaultProfile);
      return defaultProfile;
    }
    const data = docSnap.data();
    let pragma = data.pragma_profile;
    if (pragma) {
      if (typeof pragma === 'string') {
        try { pragma = JSON.parse(pragma); } catch (e) { pragma = createDefaultPragmaProfile(); }
      }
    } else {
      pragma = createDefaultPragmaProfile();
    }
    pragmaProfileCache.set(estudianteId, pragma);
    return pragma;
  } catch (err) {
    console.warn('Fallback a perfil en memoria por error en Firestore:', err.message);
    const defaultProfile = createDefaultPragmaProfile();
    pragmaProfileCache.set(estudianteId, defaultProfile);
    return defaultProfile;
  }
}

async function guardarPragmaProfile(estudianteId, pragmaProfile) {
  if (!estudianteId) return;
  // 1. Escritura instantánea en memoria (0ms)
  pragmaProfileCache.set(estudianteId, pragmaProfile);
  // 2. Persistencia asíncrona hacia Firestore en segundo plano (Zero-Wait)
  try {
    const docRef = doc(firestoreDb, 'profesor_estudiantes', String(estudianteId));
    setDoc(docRef, { pragma_profile: pragmaProfile }, { merge: true }).catch(err => {
      console.warn('Persistencia en background hacia Firestore diferida:', err.message);
    });
  } catch (err) {
    console.warn('Error al iniciar persistencia en Firestore:', err.message);
  }
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
      "retroalimentacion": "explicación clara del bug y evaluación del alumno",
      "criterios": {
        "exactitud_logica": "evaluación de la corrección sintáctica y lógica",
        "eficiencia_big_o": "análisis de complejidad temporal y espacial",
        "justificacion_conceptual": "evaluación técnica del entendimiento conceptual del alumno"
      }
    }
    `;

    const completion = await ejecutarGroqConReintentos(
      [{ role: 'user', content: prompt }],
      'openai/gpt-oss-20b',
      { type: 'json_object' }
    );

    const respuesta = parsearJSONGroq(completion.choices[0].message.content);
    
    if (respuesta.aprobado && respuesta.puntaje >= 90) {
      const pragma = await obtenerPragmaProfile(estudiante_id);
      
      pragma.rank_points = (pragma.rank_points || 0) + 15;
      if (!pragma.inventory) pragma.inventory = { silicon_shards: 15, memory_threads: 5, logic_cores: 2 };
      pragma.inventory.silicon_shards = (pragma.inventory.silicon_shards || 0) + 5;
      pragma.inventory.memory_threads = (pragma.inventory.memory_threads || 0) + 2;
      
      if (respuesta.puntaje >= 95) {
        if (!pragma.copiloto_logros) pragma.copiloto_logros = [];
        pragma.copiloto_logros.push({
          id: crypto.randomUUID(),
          titulo: "Depuración Copiloto Sobresaliente",
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
      'openai/gpt-oss-20b',
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
      'openai/gpt-oss-20b',
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
      'openai/gpt-oss-20b',
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

// 6. SYNTAX TINDER (Optimizado con filtrado por tecnología y prefetch en lote)
router.get('/api/pragma/tinder/codigo', (req, res) => {
  const tech = (req.query.tecnologia || req.query.lenguaje || '').toLowerCase();
  let pool = SYNTAX_TINDER_SNIPPETS;
  if (tech) {
    const filtered = SYNTAX_TINDER_SNIPPETS.filter(s => {
      const lang = s.lenguaje.toLowerCase();
      if (tech.includes('python')) return lang === 'python';
      if (tech.includes('sql')) return lang === 'sql';
      if (tech.includes('javascript') || tech.includes('js')) return lang === 'javascript' || lang === 'react';
      return lang === tech;
    });
    if (filtered.length > 0) pool = filtered;
  }
  const randomSnippet = pool[Math.floor(Math.random() * pool.length)];
  res.json({
    id: randomSnippet.id,
    codigo: randomSnippet.codigo,
    lenguaje: randomSnippet.lenguaje,
    categoria: randomSnippet.categoria || 'syntax',
    hint: randomSnippet.hint || 'Observa cuidadosamente la sintaxis y operadores.'
  });
});

// Endpoint /boost de lote para prefetching en memoria del frontend (0ms lag)
router.get('/api/pragma/tinder/lote', (req, res) => {
  const count = Math.min(Math.max(parseInt(req.query.count) || 5, 1), 10);
  const tech = (req.query.tecnologia || req.query.lenguaje || '').toLowerCase();
  let pool = SYNTAX_TINDER_SNIPPETS;
  if (tech) {
    const filtered = SYNTAX_TINDER_SNIPPETS.filter(s => {
      const lang = s.lenguaje.toLowerCase();
      if (tech.includes('python')) return lang === 'python';
      if (tech.includes('sql')) return lang === 'sql';
      if (tech.includes('javascript') || tech.includes('js')) return lang === 'javascript' || lang === 'react';
      return lang === tech;
    });
    if (filtered.length > 0) pool = filtered;
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  let batch = shuffled.slice(0, count);
  while (batch.length < count && pool.length > 0) {
    batch.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  const result = batch.map(s => ({
    id: s.id,
    codigo: s.codigo,
    lenguaje: s.lenguaje,
    categoria: s.categoria || 'syntax',
    hint: s.hint || 'Observa cuidadosamente la sintaxis y operadores.'
  }));
  res.json({ snippets: result, boost_activo: true, tecnologia: tech || 'todas' });
});

router.post('/api/pragma/tinder/votar', async (req, res) => {
  const { estudiante_id, snippet_id, voto, respuesta_ms } = req.body;
  const snippet = SYNTAX_TINDER_SNIPPETS.find(s => s.id === snippet_id);
  if (!snippet) return res.status(404).json({ error: 'Snippet no encontrado' });

  const acierto = snippet.correcto === voto;

  try {
    let rp_ganados = 0;
    let shards_ganados = 0;
    let bonus_velocidad = 0;

    if (acierto) {
      rp_ganados = 5;
      shards_ganados = 1;

      // /BOOST: Bono por respuesta rápida (< 5 segundos)
      if (typeof respuesta_ms === 'number' && respuesta_ms > 0 && respuesta_ms <= 5000) {
        bonus_velocidad = 3;
        rp_ganados += bonus_velocidad;
      }

      const pragma = await obtenerPragmaProfile(estudiante_id);
      pragma.rank_points = (pragma.rank_points || 0) + rp_ganados;
      if (!pragma.inventory) {
        pragma.inventory = { silicon_shards: 10, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 };
      }
      pragma.inventory.silicon_shards = (pragma.inventory.silicon_shards || 0) + shards_ganados;
      await guardarPragmaProfile(estudiante_id, pragma);
    }

    // Respuesta instantánea con perfil y datos de recompensa
    res.json({
      acierto,
      correcto: snippet.correcto,
      explicacion: snippet.explicacion,
      rp_ganados,
      shards_ganados,
      bonus_velocidad,
      boost_activo: true
    });
  } catch (error) {
    console.error('Error al votar en tinder:', error);
    res.status(500).json({ error: 'Fallo al procesar voto' });
  }
});

// Endpoint "✨ Explicar con IA" (Deep Dive / Mentor de Sintaxis)
router.post('/api/pragma/tinder/explicar', async (req, res) => {
  const { snippet_id } = req.body;
  const snippet = SYNTAX_TINDER_SNIPPETS.find(s => s.id === snippet_id);
  if (!snippet) return res.status(404).json({ error: 'Snippet no encontrado' });

  res.json({
    id: snippet.id,
    lenguaje: snippet.lenguaje,
    estado_esperado: snippet.correcto ? 'Código Limpio' : 'Código Sucio',
    analisis: snippet.explicacion,
    consejo: snippet.hint || 'Verifica la documentación oficial y buenas prácticas del lenguaje.',
    categoria: snippet.categoria || 'syntax'
  });
});

// ==========================================
// 7. GRIMORIO DE RUNAS & HECHIZOS INTERACTIVOS (AETHER CODEX)
// ==========================================
const GRIMORIO_RUNAS_CATALOG = {
  'chronos': { id: 'chronos', titulo: 'CHRONOS SHARD', level: 5, tipo: 'CHRONOMANCY', icono: '⏳', color: '#00ff66', descripcion: 'Manipulación temporal. Almacena fragmentos del flujo de ejecución.', cooldown: '15s', costo: null, perk: { tipo: 'time_bonus', valor: 5, desc: '+5s en Tinder Code y +1 vida en Defense' } },
  'quantum': { id: 'quantum', titulo: 'QUANTUM SURGE', level: 4, tipo: 'QUANTUM', icono: '💠', color: '#00ff66', descripcion: 'Sobrecarga de bits en memoria temporal.', cooldown: '8s', costo: null, perk: { tipo: 'rp_boost', valor: 25, desc: '+25% RP y Shards ganados' } },
  'aural': { id: 'aural', titulo: 'AURAL VEIL', level: 3, tipo: 'RESONANCE', icono: '🔊', color: '#00f3ff', descripcion: 'Escudo de frecuencia acústica contra intrusiones.', cooldown: '20s', costo: null, perk: { tipo: 'shield_regen', valor: 15, desc: '+15% Escudo en Defense' } },
  'cyber': { id: 'cyber', titulo: 'CYBER SHIELD', level: 5, tipo: 'DEFENSE', icono: '🛡️', color: '#00ff66', descripcion: 'Protección perimetral de kernel en tiempo real.', cooldown: '30s', costo: null, perk: { tipo: 'first_error_immune', valor: 1, desc: 'Inmunidad al primer error en duelos' } },
  'void': { id: 'void', titulo: 'VOID PULSE', level: 3, tipo: 'VOID', icono: '🌀', color: '#00f3ff', descripcion: 'Limpia la pila de ejecución instantáneamente.', cooldown: '12s', costo: null, perk: { tipo: 'screen_clear', valor: 1, desc: 'Limpia 1 bloque crítico en Defense' } },
  'nexus': { id: 'nexus', titulo: 'NEXUS BIND', level: 4, tipo: 'NEXUS', icono: '🕸️', color: '#00f3ff', descripcion: 'Entrelaza sockets de red locales y remotos.', cooldown: '10s', costo: null, perk: { tipo: 'net_sync', valor: 10, desc: 'Sincronización de paquetes ultrarrápida' } },
  'data': { id: 'data', titulo: 'DATA STREAM', level: 3, tipo: 'FLOW', icono: '⇄', color: '#00f3ff', descripcion: 'Canaliza paquetes de datos comprimidos.', cooldown: '5s', costo: null, perk: { tipo: 'data_boost', valor: 15, desc: '+15% Esencias al resolver retos' } },
  'pyro': { id: 'pyro', titulo: 'PYRO-CORE', level: 3, tipo: 'ELEMENTAL', icono: '🔥', color: '#ef4444', descripcion: 'Desencadena bucles iterativos de calor sintáctico.', cooldown: '15s', costo: null, perk: { tipo: 'fire_damage', valor: 30, desc: 'Daño crítico en Arena Multijugador' } },
  'nexsis': { id: 'nexsis', titulo: 'NEXSIS RUNE', level: 3, tipo: 'FLOW', icono: '🪐', color: '#00f3ff', descripcion: 'Fuerza la ejecución asíncrona de llamadas apiladas.', cooldown: '15s', costo: null, perk: { tipo: 'async_boost', valor: 20, desc: '+20% Rapidez en ejecución asíncrona' } },
  'dati': { id: 'dati', titulo: 'DATI STREAM', level: 3, tipo: 'FLOW', icono: '⧓', color: '#00f3ff', descripcion: 'Paraleliza hilos del procesador virtual.', cooldown: '22s', costo: null, perk: { tipo: 'thread_opt', valor: 15, desc: 'Optimiza memoria en La Taberna (-15% RAM)' } },
  'aura': { id: 'aura', titulo: 'AURA LOCK', level: 3, tipo: 'DEFENSE', icono: '🔒', color: '#00ff66', descripcion: 'Previene la mutación de variables globales.', cooldown: '18s', costo: null, perk: { tipo: 'global_guard', valor: 1, desc: 'Previene mutación indeseada de estado' } },
  'ghost': { id: 'ghost', titulo: 'GHOST NODE', level: 3, tipo: 'STEALTH', icono: '👻', color: '#00f3ff', descripcion: 'Oculta el hilo de ejecución de rastreadores.', cooldown: '25s', costo: null, perk: { tipo: 'stealth_eval', valor: 1, desc: 'Oculta tus tiempos ante rivales en Arena' } },
  'weave': { id: 'weave', titulo: 'CRYPTIC WEAVE', level: 3, tipo: 'CRYPT', icono: '🌀', color: '#00ff66', descripcion: 'Encriptación simétrica de flujo de bytes.', cooldown: '30s', costo: null, perk: { tipo: 'crypt_shield', valor: 20, desc: '+20% Resistencia en Firewall' } },
  'voidp': { id: 'voidp', titulo: 'VOID WAVE', level: 3, tipo: 'VOID', icono: '👁️', color: '#00f3ff', descripcion: 'Invoca un barrido de recolección de basura.', cooldown: '12s', costo: null, perk: { tipo: 'garbage_collect', valor: 1, desc: 'Descarta líneas de error sin penalización' } },
  'lock1': { id: 'lock1', titulo: 'OVERCLOCK CORE', level: 6, tipo: 'OVERCLOCK', icono: '⚡', color: '#f59e0b', descripcion: 'Multiplicador de ciclos de CPU para duelos de alta intensidad.', cooldown: '25s', costo: { silicon_shards: 15, memory_threads: 5 }, perk: { tipo: 'combo_mult', valor: 2, desc: 'Multiplicador Combo x2' }, reqLvl: 12 },
  'lock2': { id: 'lock2', titulo: 'MATRIX BEAM', level: 8, tipo: 'CYBER', icono: '🌟', color: '#8b5cf6', descripcion: 'Haz cuántico que penetra compuertas relacionales y firewalls.', cooldown: '35s', costo: { silicon_shards: 20, logic_cores: 2 }, perk: { tipo: 'auto_turret', valor: 1, desc: 'Torreta láser automática en Defense' }, reqLvl: 15 },
  'lock3': { id: 'lock3', titulo: 'GRID RUNNER', level: 5, tipo: 'GRID', icono: '🗝️', color: '#10b981', descripcion: 'Navegación espectral en cuadrículas de bases de datos.', cooldown: '15s', costo: { silicon_shards: 15, sql_essence: 1 }, perk: { tipo: 'sql_hint', valor: 1, desc: 'Pista relacional automática en SQL Dungeon' }, reqLvl: 12 },
  'lock4': { id: 'lock4', titulo: 'GHOST CODE', level: 7, tipo: 'STEALTH', icono: '👻', color: '#ec4899', descripcion: 'Ofuscación profunda de hilos de ejecución.', cooldown: '40s', costo: { silicon_shards: 25, logic_cores: 3, javascript_essence: 2 }, perk: { tipo: 'time_freeze', valor: 10, desc: 'Pausa el cronómetro 10s' }, reqLvl: 18 }
};

// Desbloquear runa consumiendo recursos
router.post('/api/pragma/grimorio/desbloquear', async (req, res) => {
  const { estudiante_id, rune_id } = req.body;
  const rune = GRIMORIO_RUNAS_CATALOG[rune_id];
  if (!rune) return res.status(404).json({ error: 'Runa no catalogada' });
  if (!rune.costo) return res.json({ success: true, message: 'Runa básica ya desbloqueada' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    if (!pragma.unlocked_runes) pragma.unlocked_runes = [];
    if (pragma.unlocked_runes.includes(rune_id)) {
      return res.json({ success: true, message: 'Runa ya desbloqueada previamente', pragma });
    }

    for (const [recurso, cantidad] of Object.entries(rune.costo)) {
      if ((pragma.inventory[recurso] || 0) < cantidad) {
        return res.status(400).json({ error: `Recursos insuficientes. Requiere ${cantidad} de ${recurso}.` });
      }
    }

    for (const [recurso, cantidad] of Object.entries(rune.costo)) {
      pragma.inventory[recurso] -= cantidad;
    }

    pragma.unlocked_runes.push(rune_id);
    await guardarPragmaProfile(estudiante_id, pragma);
    res.json({
      success: true,
      mensaje: `¡Runa ${rune.titulo} desbloqueada con éxito!`,
      unlocked_runes: pragma.unlocked_runes,
      inventory: pragma.inventory
    });
  } catch (err) {
    console.error('Error al desbloquear runa:', err);
    res.status(500).json({ error: 'Error interno al desbloquear runa' });
  }
});

// Castear hechizo de runa interactivo
router.post('/api/pragma/grimorio/castear', async (req, res) => {
  const { estudiante_id, rune_id } = req.body;
  const rune = GRIMORIO_RUNAS_CATALOG[rune_id];
  if (!rune) return res.status(404).json({ error: 'Runa no catalogada' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    if (!pragma.unlocked_runes) {
      pragma.unlocked_runes = ["quantum", "aural", "cyber", "void", "nexus", "data", "pyro", "chronos", "nexsis", "dati", "aura", "ghost", "weave", "voidp"];
    }

    if (rune.costo && !pragma.unlocked_runes.includes(rune_id)) {
      return res.status(400).json({ error: 'Debes desbloquear esta runa antes de poder castearla.' });
    }

    let energia = typeof pragma.energy === 'number' ? pragma.energy : 100;
    const costoEnergia = 20;

    if (energia < costoEnergia) {
      if ((pragma.inventory?.silicon_shards || 0) >= 1) {
        pragma.inventory.silicon_shards -= 1;
        energia = 100;
      } else {
        return res.status(400).json({ error: 'Energía insuficiente (mínimo 20%). Espera recarga o usa 1 Shard.' });
      }
    } else {
      energia -= costoEnergia;
    }
    pragma.energy = energia;

    if (!Array.isArray(pragma.active_perks)) pragma.active_perks = [];
    const ahora = Date.now();
    pragma.active_perks = pragma.active_perks.filter(p => p.expira > ahora);

    const duracionMs = 10 * 60 * 1000; // 10 minutos de efecto activo
    const nuevoPerk = {
      rune_id: rune.id,
      titulo: rune.titulo,
      icono: rune.icono,
      color: rune.color,
      perk: rune.perk,
      activado_en: ahora,
      expira: ahora + duracionMs
    };
    pragma.active_perks.push(nuevoPerk);

    await guardarPragmaProfile(estudiante_id, pragma);
    res.json({
      success: true,
      mensaje: `✨ Hechizo ${rune.titulo} canalizado exitosamente! Efecto: ${rune.perk.desc}`,
      perk: nuevoPerk,
      active_perks: pragma.active_perks,
      energy: pragma.energy,
      inventory: pragma.inventory
    });
  } catch (err) {
    console.error('Error al castear runa:', err);
    res.status(500).json({ error: 'Error al canalizar el hechizo' });
  }
});

// Configurar Runic Array (Matriz de Engarce)
router.post('/api/pragma/grimorio/equipar-array', async (req, res) => {
  const { estudiante_id, runic_array } = req.body;
  if (!Array.isArray(runic_array)) return res.status(400).json({ error: 'Array inválido' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    pragma.runic_array = runic_array.slice(0, 3);
    await guardarPragmaProfile(estudiante_id, pragma);
    res.json({ success: true, runic_array: pragma.runic_array });
  } catch (err) {
    console.error('Error al equipar runic array:', err);
    res.status(500).json({ error: 'Error al guardar matriz rúnica' });
  }
});

// ==========================================
// 8. SQL DUNGEON CRAWLER - ENGINE RELACIONAL
// ==========================================
const SQL_DUNGEON_DATA = {
  "tabla_usuarios": {
    name: "tabla_usuarios",
    desc: "Filtra usuarios activos.",
    columns: ["id (INT)", "nombre (VARCHAR)", "email (VARCHAR)", "activo (BOOLEAN)", "rol_id (INT)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('tabla_usuarios') && (c.includes('activo = true') || c.includes('activo=true') || c.includes('activo is true') || c.includes('activo = 1') || c.includes('where activo'));
    },
    mockRows: [
      { id: 1, nombre: 'Alice Chen', email: 'alice@pragma.ai', activo: true, rol_id: 1 },
      { id: 2, nombre: 'Bob Vance', email: 'bob@pragma.ai', activo: true, rol_id: 2 },
      { id: 5, nombre: 'Elena Rostova', email: 'elena@pragma.ai', activo: true, rol_id: 1 }
    ]
  },
  "tabla_ventas": {
    name: "tabla_ventas",
    desc: "Calcula el total de ventas sumado.",
    columns: ["id (INT)", "fecha (DATE)", "total (NUMERIC)", "cliente_id (INT)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('sum(total)') && c.includes('tabla_ventas');
    },
    mockRows: [{ sum: 184520.75 }]
  },
  "tabla_logs": {
    name: "tabla_logs",
    desc: "Cuenta logs con nivel de ERROR.",
    columns: ["id (INT)", "nivel (VARCHAR)", "mensaje (TEXT)", "creado_en (TIMESTAMP)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('count(') && c.includes('tabla_logs') && (c.includes("nivel = 'error'") || c.includes('nivel = "error"') || c.includes("nivel='error'"));
    },
    mockRows: [{ count: 14 }]
  },
  "tabla_productos": {
    name: "tabla_productos",
    desc: "Obtén el producto más caro.",
    columns: ["id (INT)", "nombre (VARCHAR)", "precio (DECIMAL)", "stock (INT)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('tabla_productos') && c.includes('order by precio desc') && c.includes('limit 1');
    },
    mockRows: [{ id: 8, nombre: 'Quantum Server Core X9', precio: 12499.99, stock: 4 }]
  },
  "tabla_compras": {
    name: "tabla_compras",
    desc: "Cuenta compras agrupadas por cliente.",
    columns: ["id (INT)", "cliente_id (INT)", "monto (DECIMAL)", "creado_en (DATE)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('cliente_id') && c.includes('count(') && c.includes('tabla_compras') && c.includes('group by cliente_id');
    },
    mockRows: [
      { cliente_id: 101, count: 12 },
      { cliente_id: 102, count: 8 },
      { cliente_id: 108, count: 24 }
    ]
  },
  "tabla_roles": {
    name: "tabla_roles",
    desc: "Relaciona usuarios con sus roles.",
    columns: ["u.id", "u.nombre", "r.id", "r.nombre AS rol"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('tabla_usuarios') && c.includes('join tabla_roles') && (c.includes('rol_id = r.id') || c.includes('r.id = u.rol_id'));
    },
    mockRows: [
      { nombre: 'Alice Chen', rol: 'Arquitecto de Software' },
      { nombre: 'Bob Vance', rol: 'Ingeniero de Datos' },
      { nombre: 'Elena Rostova', rol: 'Security Lead' }
    ]
  },
  "tabla_alertas": {
    name: "tabla_alertas",
    desc: "Lista alertas creadas a partir del 2026.",
    columns: ["id (INT)", "tipo (VARCHAR)", "fecha (DATE)", "severidad (VARCHAR)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('tabla_alertas') && c.includes('fecha >') && c.includes('2026');
    },
    mockRows: [
      { id: 104, tipo: 'SQL_INJECTION_ATTEMPT', fecha: '2026-02-14', severidad: 'CRITICAL' },
      { id: 109, tipo: 'PORT_SCAN_BLOCKED', fecha: '2026-03-01', severidad: 'HIGH' }
    ]
  },
  "tabla_pagos": {
    name: "tabla_pagos",
    desc: "Busca pagos con estado PENDIENTE.",
    columns: ["id (INT)", "monto (DECIMAL)", "estado (VARCHAR)", "metodo (VARCHAR)"],
    validador: (q) => {
      const c = q.toLowerCase();
      return c.includes('select') && c.includes('tabla_pagos') && (c.includes("estado = 'pendiente'") || c.includes('estado = "pendiente"'));
    },
    mockRows: [
      { id: 501, monto: 1450.00, estado: 'PENDIENTE', metodo: 'STRIPE_ESCROW' },
      { id: 504, monto: 320.50, estado: 'PENDIENTE', metodo: 'CRYPTO_TRANSFER' }
    ]
  },
  "nucleo": {
    name: "NÚCLEO DE LA BASE DE DATOS",
    desc: "¡Has conquistado el núcleo de datos!",
    columns: ["nucleo_status (VARCHAR)", "potencia (INT)", "cripto_firmas (INT)"],
    validador: () => true,
    mockRows: [{ nucleo_status: 'DOMINADO', potencia: 100, cripto_firmas: 9999 }]
  }
};

router.post('/api/pragma/dungeon/validar', async (req, res) => {
  const { estudiante_id, room_name, query } = req.body;
  if (!room_name || !query) return res.status(400).json({ error: 'Faltan parámetros' });

  const room = SQL_DUNGEON_DATA[room_name];
  if (!room) return res.status(404).json({ error: 'Habitación no encontrada' });

  const cleanQuery = query.trim().replace(/;+$/, '').trim();
  const valido = room.validador(cleanQuery);

  if (valido) {
    try {
      const isNucleo = room_name === 'nucleo';
      const rpEarned = isNucleo ? 50 : 15;
      const essenceEarned = isNucleo ? 3 : 1;
      const shardsEarned = isNucleo ? 10 : 2;

      const pragma = await obtenerPragmaProfile(estudiante_id);
      pragma.rank_points = (pragma.rank_points || 0) + rpEarned;
      if (!pragma.inventory) pragma.inventory = { silicon_shards: 10, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 };
      pragma.inventory.sql_essence = (pragma.inventory.sql_essence || 0) + essenceEarned;
      pragma.inventory.silicon_shards = (pragma.inventory.silicon_shards || 0) + shardsEarned;

      if (!pragma.dungeon_progress) pragma.dungeon_progress = { unlocked_rooms: [] };
      if (!pragma.dungeon_progress.unlocked_rooms.includes(room_name)) {
        pragma.dungeon_progress.unlocked_rooms.push(room_name);
      }

      await guardarPragmaProfile(estudiante_id, pragma);
      return res.json({
        valido: true,
        mensaje: isNucleo ? '👑 ¡Núcleo Central de Datos Conquistado! Recompensas legendarias acreditadas.' : '🔓 ¡Compuerta de Datos Abierta! Consulta ejecutada correctamente.',
        mock_data: room.mockRows,
        columns: room.columns,
        rp_ganados: rpEarned,
        sql_essence_ganada: essenceEarned,
        shards_ganados: shardsEarned,
        unlocked_rooms: pragma.dungeon_progress.unlocked_rooms
      });
    } catch (e) {
      console.error(e);
      return res.json({
        valido: true,
        mensaje: '🔓 ¡Compuerta de Datos Abierta!',
        mock_data: room.mockRows,
        columns: room.columns
      });
    }
  }

  res.json({
    valido: false,
    mensaje: '❌ Error de Sintaxis SQL o filtrado insuficiente. Verifica cláusulas WHERE, JOIN y agregaciones.',
    columns: room.columns
  });
});

// ==========================================
// 9. COPILOTO RETOS DINÁMICOS
// ==========================================
const COPILOTO_RETOS_BANCO = [
  {
    id: "copiloto_1",
    titulo: "Doble Ciclo Ineficiente y Comparación Incorrecta",
    categoria: "Algoritmos",
    lenguaje: "JavaScript",
    dificultad: "Intermedio",
    descripcion: "La función compara elementos en la misma posición (i === j) causando falsos duplicados y lentitud O(N^2).",
    codigo_con_bug: `function encontrarDuplicados(arr) {\n  let duplicados = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length; j++) {\n      if (arr[i] === arr[j]) {\n        duplicados.push(arr[i]);\n      }\n    }\n  }\n  return duplicados;\n}`,
    codigo_solucion: `function encontrarDuplicados(arr) {\n  const vistos = new Set();\n  const duplicados = new Set();\n  for (const num of arr) {\n    if (vistos.has(num)) {\n      duplicados.add(num);\n    } else {\n      vistos.add(num);\n    }\n  }\n  return Array.from(duplicados);\n}`,
    consola_error: "[ERROR] encontrarDuplicados([1, 2, 2, 3]) retornó [1, 2, 2, 2, 2, 3] en vez de [2].\n> Complejidad actual: O(N^2). Objetivo: O(N).",
    tests: [
      { input: "[1, 2, 3, 2, 4, 3]", esperado: "[2, 3]" },
      { input: "[1, 2, 3]", esperado: "[]" },
      { input: "[]", esperado: "[]" }
    ]
  },
  {
    id: "copiloto_2",
    titulo: "Memory Leak por Clausuras y Event Listeners",
    categoria: "Frontend",
    lenguaje: "JavaScript",
    dificultad: "Avanzado",
    descripcion: "Registra listeners repetitivos en el DOM sin limpiar la referencia.",
    codigo_con_bug: `function attachHandlers(buttons) {\n  buttons.forEach(btn => {\n    window.addEventListener('resize', function onResize() {\n      btn.style.width = window.innerWidth + 'px';\n    });\n  });\n}`,
    codigo_solucion: `function attachHandlers(buttons) {\n  const handleResize = () => {\n    const w = window.innerWidth + 'px';\n    buttons.forEach(btn => { btn.style.width = w; });\n  };\n  window.addEventListener('resize', handleResize);\n  return () => window.removeEventListener('resize', handleResize);\n}`,
    consola_error: "[LEAK DETECTED] 500 listeners huérfanos acumulados en window. RAM aumentando en 45MB.",
    tests: [
      { input: "3 buttons", esperado: "1 single shared event listener con cleanup" }
    ]
  },
  {
    id: "copiloto_3",
    titulo: "Mutación No Intencional de Argumento Mutable",
    categoria: "Backend",
    lenguaje: "Python",
    dificultad: "Principiante",
    descripcion: "Uso de default argument mutable o asignación por referencia directa en python.",
    codigo_con_bug: `def agregar_log(mensaje, log_list=[]):\n    log_list.append(mensaje)\n    return log_list`,
    codigo_solucion: `def agregar_log(mensaje, log_list=None):\n    if log_list is None:\n        log_list = []\n    log_list.append(mensaje)\n    return log_list`,
    consola_error: "[TEST FAIL] agregar_log('A') y luego agregar_log('B') acumuló ['A', 'B'] en la segunda llamada.",
    tests: [
      { input: "agregar_log('Primero')", esperado: "['Primero']" },
      { input: "agregar_log('Segundo')", esperado: "['Segundo']" }
    ]
  },
  {
    id: "copiloto_4",
    titulo: "SQL N+1 Query Problem en Bucle",
    categoria: "Base de Datos",
    lenguaje: "SQL",
    dificultad: "Intermedio",
    descripcion: "Ejecuta una consulta SQL individual por cada usuario en vez de una sola consulta con JOIN o IN.",
    codigo_con_bug: `async function getUsuariosConRoles(usuarios) {\n  for (let u of usuarios) {\n    u.rol = await db.query('SELECT nombre FROM roles WHERE id = $1', [u.rol_id]);\n  }\n  return usuarios;\n}`,
    codigo_solucion: `async function getUsuariosConRoles(usuarios) {\n  const ids = usuarios.map(u => u.rol_id).filter(Boolean);\n  const roles = await db.query('SELECT id, nombre FROM roles WHERE id = ANY($1)', [ids]);\n  const roleMap = new Map(roles.rows.map(r => [r.id, r.nombre]));\n  return usuarios.map(u => ({ ...u, rol: roleMap.get(u.rol_id) || null }));\n}`,
    consola_error: "[PERFORMANCE WARNING] 100 usuarios generaron 101 consultas a la base de datos (Latency 850ms).",
    tests: [
      { input: "100 usuarios", esperado: "1 query unificada (Latency < 25ms)" }
    ]
  },
  {
    id: "copiloto_5",
    titulo: "Reasignación Cuadrática de Strings",
    categoria: "Backend",
    lenguaje: "Python",
    dificultad: "Intermedio",
    descripcion: "Concatenación con += dentro de un bucle genera reasignación y copia O(N^2) de memoria inmutable.",
    codigo_con_bug: `def ensamblar_payload(fragmentos):\n    resultado = ""\n    for f in fragmentos:\n        resultado += f + "\\n"\n    return resultado`,
    codigo_solucion: `def ensamblar_payload(fragmentos):\n    return "\\n".join(fragmentos) + "\\n"`,
    consola_error: "[PERFORMANCE] Concatenación de 50k fragmentos tardó 4.8s por copia inmutable repetitiva.",
    tests: [
      { input: "50k strings", esperado: "join en O(N) completado en 12ms" }
    ]
  },
  {
    id: "copiloto_6",
    titulo: "Subconsulta Correlacionada Ineficiente",
    categoria: "Base de Datos",
    lenguaje: "SQL",
    dificultad: "Avanzado",
    descripcion: "Filtro con subconsulta correlacionada por fila en vez de EXISTS o JOIN indexado.",
    codigo_con_bug: `SELECT id, total \nFROM ordenes o \nWHERE o.id IN (\n  SELECT orden_id FROM pagos p WHERE p.estado = 'COMPLETADO'\n);`,
    codigo_solucion: `SELECT o.id, o.total \nFROM ordenes o \nJOIN pagos p ON o.id = p.orden_id \nWHERE p.estado = 'COMPLETADO';`,
    consola_error: "[QUERY PLAN] Full table scan en subquery repetido 100,000 veces. Costo de ejecución: 14,200.",
    tests: [
      { input: "100k filas", esperado: "Index Scan O(N log N) con costo < 150" }
    ]
  }
];

router.get('/api/pragma/copiloto/retos', (req, res) => {
  const tech = (req.query.tecnologia || req.query.lenguaje || '').toLowerCase();
  let retos = COPILOTO_RETOS_BANCO;
  if (tech) {
    const filtered = COPILOTO_RETOS_BANCO.filter(r => {
      const lang = r.lenguaje.toLowerCase();
      if (tech.includes('python')) return lang === 'python';
      if (tech.includes('sql')) return lang === 'sql' || r.categoria.toLowerCase().includes('sql') || r.categoria.toLowerCase().includes('base de datos');
      if (tech.includes('javascript') || tech.includes('js')) return lang === 'javascript';
      return lang === tech;
    });
    if (filtered.length > 0) retos = filtered;
  }
  res.json({ retos });
});

// Guardar Score de Defense Arcade
router.post('/api/pragma/defense/score', async (req, res) => {
  const { estudiante_id, score, stage, waves_cleared } = req.body;
  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    if (!pragma.defense_stats) pragma.defense_stats = { highscore: 0, max_stage: 1 };
    if (score > (pragma.defense_stats.highscore || 0)) {
      pragma.defense_stats.highscore = score;
    }
    if (stage > (pragma.defense_stats.max_stage || 1)) {
      pragma.defense_stats.max_stage = stage;
    }
    const shardsGain = Math.floor(score / 250000) + Math.floor((waves_cleared || 0) / 2);
    const rpGain = Math.floor(score / 100000);
    pragma.rank_points = (pragma.rank_points || 0) + rpGain;
    if (!pragma.inventory) pragma.inventory = { silicon_shards: 10, memory_threads: 5, logic_cores: 2, javascript_essence: 0, python_essence: 0, java_essence: 0, sql_essence: 0 };
    pragma.inventory.silicon_shards = (pragma.inventory.silicon_shards || 0) + shardsGain;

    await guardarPragmaProfile(estudiante_id, pragma);
    res.json({
      success: true,
      highscore: pragma.defense_stats.highscore,
      rp_ganados: rpGain,
      shards_ganados: shardsGain
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar score' });
  }
});

const BOTS_NOMBRES = [
  'CYBER_PUNK', 'NEO_CODER', 'NULL_POINTER', 'SYNTAX_VIPER', 
  'QUANTUM_DEV', 'ALGO_WARRIOR', 'BYTE_RUNNER', 'ZERO_DAY', 
  'BINARY_SHADOW', 'PRAGMA_CORE', 'ZeroCool', 'Hackerman', 
  'L33tGamer', 'AcidBurn', 'CrashOverride', 'Plague', 'CerealKiller'
];

function getCanonicalType(tipo) {
  if (!tipo) return 'trivia';
  const t = tipo.toLowerCase();
  if (t === 'refactor' || t === 'bug_hunter' || t === 'bughunter') return 'bug_hunter';
  if (t === 'sorter' || t === 'code_sorter' || t === 'codesorter') return 'code_sorter';
  if (t === 'fill-blank' || t === 'fill_code' || t === 'fill_the_code' || t === 'fill') return 'fill_code';
  if (t === 'output' || t === 'output_predictor' || t === 'outputpredictor') return 'output_predictor';
  if (t === 'typer' || t === 'code_typer' || t === 'codetyper') return 'code_typer';
  if (t === 'memory' || t === 'memory_match' || t === 'memorymatch') return 'memory_match';
  if (t === 'flashcard' || t === 'flashcard_battle') return 'flashcard';
  return 'trivia';
}

const POOL_RETOS_MULTIJUGADOR = [
  // ==========================================
  // 1. TRIVIA TÉCNICA (trivia)
  // ==========================================
  // Novato
  {
    id: 'trivia_nov_1',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Declaración de Variables',
    pregunta: '¿Qué palabra reservada se usa en JavaScript para declarar una variable cuyo valor puede cambiar?',
    opciones: ['let', 'const', 'static', 'fixed'],
    correcta: 0,
    explicacion: 'let permite declarar variables reasignables con ámbito de bloque.'
  },
  {
    id: 'trivia_nov_2',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Tipos de Datos Booleanos',
    pregunta: '¿Qué tipo de dato representa exclusivamente un valor de verdadero o falso (true / false)?',
    opciones: ['Boolean', 'String', 'Number', 'Undefined'],
    correcta: 0,
    explicacion: 'El tipo Boolean contiene únicamente dos valores lógicos: true o false.'
  },
  {
    id: 'trivia_nov_3',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Salida de Datos en Consola',
    pregunta: '¿Qué instrucción se utiliza para mostrar un mensaje o valor en la consola del navegador?',
    opciones: ['console.log("Hola")', 'print.screen("Hola")', 'terminal.write("Hola")', 'display.show("Hola")'],
    correcta: 0,
    explicacion: 'console.log() imprime datos en la consola de depuración del entorno.'
  },
  {
    id: 'trivia_nov_4',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Identificación de Texto (String)',
    pregunta: '¿Cuál de las siguientes opciones representa un texto (String) escrito de forma válida?',
    opciones: ['"Hola Mundo"', 'Hola Mundo', '[Hola Mundo]', '<Hola Mundo>'],
    correcta: 0,
    explicacion: 'Los textos o cadenas (String) deben estar delimitados por comillas simples o dobles.'
  },
  // Intermedio
  {
    id: 'trivia_int_1',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Transformación de Arrays con Map',
    pregunta: '¿Qué método de Array se utiliza para transformar cada elemento y retornar un nuevo array sin mutar el original?',
    opciones: ['map()', 'forEach()', 'filter()', 'push()'],
    correcta: 0,
    explicacion: 'map() aplica una función a cada elemento y genera un nuevo array resultante.'
  },
  {
    id: 'trivia_int_2',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Template Literals',
    pregunta: '¿Qué sintaxis permite incrustar variables dentro de una cadena de texto usando comillas invertidas?',
    opciones: ['Template Literals (${variable})', 'Concatenación Estricta', 'Interpolación Regex', 'Macro String'],
    correcta: 0,
    explicacion: 'Los Template Literals con acentos graves permiten evaluar expresiones con ${...}.'
  },
  // Experto
  {
    id: 'trivia_exp_1',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Event Loop & Microtareas',
    pregunta: '¿En qué orden procesa el Event Loop las Microtareas (Promise.then) frente a las Macrotareas (setTimeout)?',
    opciones: [
      'Las microtareas tienen prioridad y se vacían antes de la siguiente macrotarea',
      'Las macrotareas se ejecutan primero en cada ciclo',
      'Se procesan en hilos paralelos independientes',
      'El motor alterna aleatoriamente según la carga de CPU'
    ],
    correcta: 0,
    explicacion: 'La cola de microtareas se vacía por completo antes de despachar la siguiente macrotarea.'
  },
  {
    id: 'trivia_exp_2',
    tipo: 'trivia',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Complejidad Hash en V8',
    pregunta: '¿Cuál es la complejidad temporal promedio de búsqueda por clave en un Map/Set en el motor V8?',
    opciones: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correcta: 0,
    explicacion: 'Las tablas Hash permiten acceso O(1) en promedio.'
  },

  // ==========================================
  // 2. BUG HUNTER (bug_hunter / refactor)
  // ==========================================
  // Novato
  {
    id: 'bug_nov_1',
    tipo: 'bug_hunter',
    tipo_alias: 'refactor',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Tipografía en Declaración de Variable',
    descripcion: 'Una variable fue declarada como "lett" en lugar de "let". Identifica la línea y selecciona la corrección.',
    linea_bug: 2,
    codigo_con_bug: 'let precio = 25;\nlett descuento = 5;\nlet total = precio - descuento;',
    opciones_correccion: [
      'let descuento = 5;',
      'const descuento == 5;',
      'delete descuento;'
    ],
    correcta: 0
  },
  {
    id: 'bug_nov_2',
    tipo: 'bug_hunter',
    tipo_alias: 'refactor',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Comillas de Texto Sin Cerrar',
    descripcion: 'La cadena de texto no tiene comilla de cierre en la línea 2, causando un error de sintaxis.',
    linea_bug: 2,
    codigo_con_bug: 'let saludo = "Hola";\nlet nombre = "Eliab;\nconsole.log(saludo + " " + nombre);',
    opciones_correccion: [
      'let nombre = "Eliab";',
      'let nombre = Eliab;',
      'let nombre = \'Eliab";'
    ],
    correcta: 0
  },
  {
    id: 'bug_nov_3',
    tipo: 'bug_hunter',
    tipo_alias: 'refactor',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Operador Incorrecto en Suma',
    descripcion: 'La función sumar está restando los parámetros en lugar de sumarlos.',
    linea_bug: 2,
    codigo_con_bug: 'function sumar(a, b) {\n  let resultado = a - b;\n  return resultado;\n}',
    opciones_correccion: [
      'let resultado = a + b;',
      'let resultado = a * b;',
      'return a;'
    ],
    correcta: 0
  },
  // Intermedio
  {
    id: 'bug_int_1',
    tipo: 'bug_hunter',
    tipo_alias: 'refactor',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Límite de Array Excedido (Off-by-One)',
    descripcion: 'El bucle usa <= en lugar de < y accede a un índice indefinido al final del array.',
    linea_bug: 2,
    codigo_con_bug: 'function mostrarItems(items) {\n  for (let i = 0; i <= items.length; i++) {\n    console.log(items[i]);\n  }\n}',
    opciones_correccion: [
      'for (let i = 0; i < items.length; i++) {',
      'for (let i = 1; i <= items.length; i++) {',
      'for (let i = items.length; i > 0; i++) {'
    ],
    correcta: 0
  },
  // Experto
  {
    id: 'bug_exp_1',
    tipo: 'bug_hunter',
    tipo_alias: 'refactor',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Mutación Directa de Estado Reactivo',
    descripcion: 'Identifica la línea con la mutación directa prohibida y aplica la actualización inmutable correcta.',
    linea_bug: 2,
    codigo_con_bug: 'function agregarItem(estado, nuevoItem) {\n  estado.items.push(nuevoItem);\n  return estado;\n}',
    opciones_correccion: [
      'return { ...estado, items: [...estado.items, nuevoItem] };',
      'estado.items = estado.items.push(nuevoItem); return estado;',
      'delete estado.items; return estado;'
    ],
    correcta: 0
  },

  // ==========================================
  // 3. CODE SORTER (code_sorter / sorter)
  // ==========================================
  // Novato (3 líneas simples y directas)
  {
    id: 'sorter_nov_1',
    tipo: 'code_sorter',
    tipo_alias: 'sorter',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Declarar Variable, Saludar y Mostrar',
    lineas: ['console.log(saludo);', 'let saludo = "Hola, " + nombre;', 'let nombre = "Eliab";'],
    lineas_ordenadas: ['let nombre = "Eliab";', 'let saludo = "Hola, " + nombre;', 'console.log(saludo);']
  },
  {
    id: 'sorter_nov_2',
    tipo: 'code_sorter',
    tipo_alias: 'sorter',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Función Simple de Suma',
    lineas: ['  return a + b;', 'function sumar(a, b) {', '}'],
    lineas_ordenadas: ['function sumar(a, b) {', '  return a + b;', '}']
  },
  {
    id: 'sorter_nov_3',
    tipo: 'code_sorter',
    tipo_alias: 'sorter',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Condicional Mayor de Edad',
    lineas: ['  console.log("Mayor de edad");', 'if (edad >= 18) {', '}'],
    lineas_ordenadas: ['if (edad >= 18) {', '  console.log("Mayor de edad");', '}']
  },
  // Intermedio (4 líneas)
  {
    id: 'sorter_int_1',
    tipo: 'code_sorter',
    tipo_alias: 'sorter',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Pipeline de Números Pares Duplicados',
    lineas: ['  .map(n => n * 2);', 'return numeros', '  .filter(n => n % 2 === 0);'],
    lineas_ordenadas: ['return numeros', '  .filter(n => n % 2 === 0);', '  .map(n => n * 2);']
  },
  // Experto (5 líneas)
  {
    id: 'sorter_exp_1',
    tipo: 'code_sorter',
    tipo_alias: 'sorter',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Reintentos Exponenciales Asíncronos',
    lineas: [
      '    await sleep(2 ** intento * 100);',
      'for (let intento = 0; intento < 3; intento++) {',
      '  try { return await fetch(url); } catch (e) {',
      '  }',
      '} throw new Error("Fallo final");'
    ],
    lineas_ordenadas: [
      'for (let intento = 0; intento < 3; intento++) {',
      '  try { return await fetch(url); } catch (e) {',
      '    await sleep(2 ** intento * 100);',
      '  }',
      '} throw new Error("Fallo final");'
    ]
  },

  // ==========================================
  // 4. FILL THE CODE (fill_code / fill-blank)
  // ==========================================
  // Novato (1 o 2 huecos básicos)
  {
    id: 'fill_nov_1',
    tipo: 'fill_code',
    tipo_alias: 'fill-blank',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Condicional If Básico',
    codigo_con_huecos: 'let edad = 18;\n___1___ (edad >= 18) {\n  console.log("Acceso permitido");\n}',
    respuestas: { '1': 'if' },
    sugerencias: ['if', 'while', 'for', 'else'],
    opciones_tokens: ['if', 'while', 'for', 'else']
  },
  {
    id: 'fill_nov_2',
    tipo: 'fill_code',
    tipo_alias: 'fill-blank',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Retornar Resultado de Función',
    codigo_con_huecos: 'function multiplicar(x, y) {\n  ___1___ x * y;\n}',
    respuestas: { '1': 'return' },
    sugerencias: ['return', 'send', 'output', 'give'],
    opciones_tokens: ['return', 'send', 'output', 'give']
  },
  {
    id: 'fill_nov_3',
    tipo: 'fill_code',
    tipo_alias: 'fill-blank',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Declaración y Uso de Variable',
    codigo_con_huecos: '___1___ puntos = 50;\nconsole.log(___2___);',
    respuestas: { '1': 'let', '2': 'puntos' },
    sugerencias: ['let', 'puntos', 'function', 'class'],
    opciones_tokens: ['let', 'puntos', 'function', 'class']
  },
  // Intermedio
  {
    id: 'fill_int_1',
    tipo: 'fill_code',
    tipo_alias: 'fill-blank',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Transformación con Map y Flecha',
    codigo_con_huecos: 'const dobles = numeros.___1___(n => n ___2___ 2);',
    respuestas: { '1': 'map', '2': '*' },
    sugerencias: ['map', '*', 'filter', '+', 'reduce'],
    opciones_tokens: ['map', '*', 'filter', '+', 'reduce']
  },
  // Experto
  {
    id: 'fill_exp_1',
    tipo: 'fill_code',
    tipo_alias: 'fill-blank',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Consumo Asíncrono de APIs con Await',
    codigo_con_huecos: 'const response = ___1___ fetch("/api/datos");\nconst payload = ___2___ response.json();',
    respuestas: { '1': 'await', '2': 'await' },
    sugerencias: ['await', 'async', 'then', 'yield'],
    opciones_tokens: ['await', 'async', 'then', 'yield']
  },

  // ==========================================
  // 5. OUTPUT PREDICTOR (output_predictor / output)
  // ==========================================
  // Novato
  {
    id: 'output_nov_1',
    tipo: 'output_predictor',
    tipo_alias: 'output',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Suma de Dos Números',
    codigo: 'let a = 10;\nlet b = 5;\nconsole.log(a + b);',
    opciones: ['15', '105', '5', 'undefined'],
    correcta: 0,
    explicacion: '10 + 5 da como resultado numérico 15.'
  },
  {
    id: 'output_nov_2',
    tipo: 'output_predictor',
    tipo_alias: 'output',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Incremento de Puntos',
    codigo: 'let puntos = 20;\npuntos = puntos + 10;\nconsole.log(puntos);',
    opciones: ['30', '20', '2010', '10'],
    correcta: 0,
    explicacion: '20 + 10 se evalúa a 30 y se almacena en la variable puntos.'
  },
  {
    id: 'output_nov_3',
    tipo: 'output_predictor',
    tipo_alias: 'output',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Unión de Textos (Concatenación)',
    codigo: 'let nombre = "Ana";\nconsole.log("Hola " + nombre);',
    opciones: ['"Hola Ana"', '"Hola nombre"', '"Ana"', 'undefined'],
    correcta: 0,
    explicacion: 'El operador + une "Hola " con "Ana", produciendo "Hola Ana".'
  },
  // Intermedio
  {
    id: 'output_int_1',
    tipo: 'output_predictor',
    tipo_alias: 'output',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Longitud de un Array',
    codigo: 'let frutas = ["manzana", "pera", "uva"];\nconsole.log(frutas.length);',
    opciones: ['3', '2', '4', 'undefined'],
    correcta: 0,
    explicacion: 'La propiedad length devuelve la cantidad de elementos en el array (3).'
  },
  // Experto
  {
    id: 'output_exp_1',
    tipo: 'output_predictor',
    tipo_alias: 'output',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Coerción Unaria Implícita',
    codigo: 'console.log(1 + +"2" + "2");',
    opciones: ['"32"', '"122"', 'NaN', '3'],
    correcta: 0,
    explicacion: 'El operador unario +"2" convierte a 2; 1 + 2 = 3; luego 3 + "2" resulta en "32".'
  },

  // ==========================================
  // 6. FLASHCARD BATTLE (flashcard)
  // ==========================================
  // Novato
  {
    id: 'flashcard_nov_1',
    tipo: 'flashcard',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Fundamentos Iniciales de Programación',
    flashcards: [
      { afirmacion: 'Una variable declarada con let puede cambiar de valor a lo largo del programa.', es_verdadero: true },
      { afirmacion: 'El tipo de dato Boolean solo puede ser true (verdadero) o false (falso).', es_verdadero: true },
      { afirmacion: 'La instrucción console.log() se usa para mostrar mensajes en la consola.', es_verdadero: true },
      { afirmacion: 'Un número como 25 debe escribirse siempre obligatoriamente entre comillas.', es_verdadero: false }
    ]
  },
  // Intermedio
  {
    id: 'flashcard_int_1',
    tipo: 'flashcard',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Arrays e Inmutabilidad',
    flashcards: [
      { afirmacion: 'Array.prototype.map retorna un nuevo array sin mutar el array original.', es_verdadero: true },
      { afirmacion: 'Una constante const impide modificar las propiedades internas de un objeto.', es_verdadero: false },
      { afirmacion: 'El operador === compara valor y tipo de dato sin conversiones implícitas.', es_verdadero: true }
    ]
  },
  // Experto
  {
    id: 'flashcard_exp_1',
    tipo: 'flashcard',
    categoria: 'arcade',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Runtime Web & Event Loop',
    flashcards: [
      { afirmacion: 'Las microtareas (Promise.then) tienen prioridad sobre las macrotareas (setTimeout).', es_verdadero: true },
      { afirmacion: 'Un Closure permite a una función recordar el ámbito léxico donde fue creada.', es_verdadero: true },
      { afirmacion: 'Object.freeze() realiza automáticamente una congelación profunda recursiva de sub-objetos.', es_verdadero: false }
    ]
  },

  // ==========================================
  // 7. CODE TYPER (code_typer / typer)
  // ==========================================
  // Novato (Sintaxis elemental, 16 a 24 caracteres)
  {
    id: 'typer_nov_1',
    tipo: 'code_typer',
    tipo_alias: 'typer',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Variable de Texto',
    codigo: 'let nombre = "Eliab";',
    descripcion: 'Escribe la variable con su valor de texto exacto.'
  },
  {
    id: 'typer_nov_2',
    tipo: 'code_typer',
    tipo_alias: 'typer',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Imprimir en Consola',
    codigo: 'console.log("Hola Mundo");',
    descripcion: 'Escribe la instrucción de consola respetando comillas y paréntesis.'
  },
  {
    id: 'typer_nov_3',
    tipo: 'code_typer',
    tipo_alias: 'typer',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'novato',
    titulo: 'Variable de Puntuación',
    codigo: 'let puntuacion = 100;',
    descripcion: 'Escribe la asignación numérica.'
  },
  // Intermedio (30 a 45 caracteres)
  {
    id: 'typer_int_1',
    tipo: 'code_typer',
    tipo_alias: 'typer',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'intermedio',
    titulo: 'Función Flecha Duplicadora',
    codigo: 'const duplicar = n => n * 2;',
    descripcion: 'Escribe la función flecha con precisión.'
  },
  // Experto (50+ caracteres)
  {
    id: 'typer_exp_1',
    tipo: 'code_typer',
    tipo_alias: 'typer',
    categoria: 'pragma',
    lenguaje: 'JavaScript',
    dificultad: 'experto',
    titulo: 'Hook de Estado en React',
    codigo: 'const [operador, setOperador] = useState(null);',
    descripcion: 'Escribe la desestructuración del hook React.'
  },

  // ==========================================
  // 8. MEMORY MATCH (memory_match / memory)
  // ==========================================
  // Novato (3 parejas = 6 cartas, conceptos elementales)
  {
    id: 'memory_nov_1',
    tipo: 'memory_match',
    tipo_alias: 'memory',
    categoria: 'arcade',
    lenguaje: 'General',
    dificultad: 'novato',
    titulo: 'Conceptos Iniciales de Programación',
    cartas: [
      { id: 'm1', matchingId: 'p1', texto: 'Variable', flipped: false, matched: false },
      { id: 'm2', matchingId: 'p1', texto: 'Guarda un dato en memoria', flipped: false, matched: false },
      { id: 'm3', matchingId: 'p2', texto: 'String', flipped: false, matched: false },
      { id: 'm4', matchingId: 'p2', texto: 'Texto entre comillas', flipped: false, matched: false },
      { id: 'm5', matchingId: 'p3', texto: 'Boolean', flipped: false, matched: false },
      { id: 'm6', matchingId: 'p3', texto: 'Valor true o false', flipped: false, matched: false }
    ]
  },
  // Intermedio (4 parejas = 8 cartas)
  {
    id: 'memory_int_1',
    tipo: 'memory_match',
    tipo_alias: 'memory',
    categoria: 'arcade',
    lenguaje: 'General',
    dificultad: 'intermedio',
    titulo: 'Estructuras y Métodos en JavaScript',
    cartas: [
      { id: 'mi1', matchingId: 'pi1', texto: 'Array', flipped: false, matched: false },
      { id: 'mi2', matchingId: 'pi1', texto: 'Lista ordenada de elementos', flipped: false, matched: false },
      { id: 'mi3', matchingId: 'pi2', texto: 'Objeto', flipped: false, matched: false },
      { id: 'mi4', matchingId: 'pi2', texto: 'Colección de clave y valor', flipped: false, matched: false },
      { id: 'mi5', matchingId: 'pi3', texto: 'Array.map', flipped: false, matched: false },
      { id: 'mi6', matchingId: 'pi3', texto: 'Transforma cada elemento', flipped: false, matched: false },
      { id: 'mi7', matchingId: 'pi4', texto: 'Función Flecha', flipped: false, matched: false },
      { id: 'mi8', matchingId: 'pi4', texto: 'Sintaxis corta () => {}', flipped: false, matched: false }
    ]
  },
  // Experto (4 parejas = 8 cartas)
  {
    id: 'memory_exp_1',
    tipo: 'memory_match',
    tipo_alias: 'memory',
    categoria: 'arcade',
    lenguaje: 'General',
    dificultad: 'experto',
    titulo: 'Paradigmas y Patrones Avanzados',
    cartas: [
      { id: 'me1', matchingId: 'pe1', texto: 'Closure', flipped: false, matched: false },
      { id: 'me2', matchingId: 'pe1', texto: 'Ámbito léxico recordado', flipped: false, matched: false },
      { id: 'me3', matchingId: 'pe2', texto: 'Idempotencia', flipped: false, matched: false },
      { id: 'me4', matchingId: 'pe2', texto: 'Mismo resultado siempre', flipped: false, matched: false },
      { id: 'me5', matchingId: 'pe3', texto: 'Polimorfismo', flipped: false, matched: false },
      { id: 'me6', matchingId: 'pe3', texto: 'Múltiples formas de acción', flipped: false, matched: false },
      { id: 'me7', matchingId: 'pe4', texto: 'Inmutabilidad', flipped: false, matched: false },
      { id: 'me8', matchingId: 'pe4', texto: 'Estado que no puede alterarse', flipped: false, matched: false }
    ]
  }
];

function generarRetosMultijugador(categoria = 'mixed', dificultad = 'intermedio', lenguaje = 'JavaScript') {
  const pool = [...POOL_RETOS_MULTIJUGADOR];

  // 1. Filtrado por tecnología
  const langQuery = (lenguaje || 'JavaScript').trim().toLowerCase();
  const poolFiltradoLenguaje = pool.filter(r => {
    const rLang = (r.lenguaje || 'General').toLowerCase();
    if (rLang === 'general') return true;
    if (rLang === langQuery) return true;
    if (langQuery.includes('react') && (rLang === 'react' || rLang === 'javascript')) return true;
    if (langQuery.includes('node') && (rLang === 'javascript' || rLang === 'general')) return true;
    return false;
  });

  const poolBase = poolFiltradoLenguaje.length >= 4 ? poolFiltradoLenguaje : pool;

  // 2. Filtrado estricto por dificultad
  const difQuery = (dificultad || 'intermedio').trim().toLowerCase();
  let poolDificultad = poolBase.filter(r => {
    const rDif = (r.dificultad || 'intermedio').toLowerCase();
    if (difQuery === 'novato' || difQuery === 'principiante') {
      return rDif === 'novato';
    }
    if (difQuery === 'experto') {
      return rDif === 'experto';
    }
    return rDif === 'intermedio';
  });

  // Si no hay suficientes en poolBase con el lenguaje, buscar en el pool global pero estrictamente en esa dificultad
  if (poolDificultad.length < 3) {
    poolDificultad = pool.filter(r => {
      const rDif = (r.dificultad || 'intermedio').toLowerCase();
      if (difQuery === 'novato' || difQuery === 'principiante') return rDif === 'novato';
      if (difQuery === 'experto') return rDif === 'experto';
      return rDif === 'intermedio';
    });
  }

  // 3. Cantidad de retos de la partida según dificultad (Escalonamiento real)
  const count = (difQuery === 'novato' || difQuery === 'principiante') ? 3 : difQuery === 'experto' ? 5 : 4;

  // 4. Selección diversa garantizando variedad de modos oficiales
  const modosOficiales = ['trivia', 'bug_hunter', 'code_sorter', 'fill_code', 'output_predictor', 'flashcard', 'code_typer', 'memory_match'];
  const shuffledModos = [...modosOficiales].sort(() => 0.5 - Math.random());

  const seleccionados = [];
  const idsSeleccionados = new Set();

  for (const modo of shuffledModos) {
    if (seleccionados.length >= count) break;
    const candidatos = poolDificultad.filter(r => {
      const canonical = getCanonicalType(r.tipo);
      return canonical === modo && !idsSeleccionados.has(r.id);
    });

    if (candidatos.length > 0) {
      const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
      const canonicalType = getCanonicalType(elegido.tipo);
      const tokens = elegido.opciones_tokens || elegido.sugerencias || [];
      const correcciones = elegido.opciones_correccion || elegido.opciones_correcion || elegido.opciones || [];
      seleccionados.push({
        ...elegido,
        tipo: canonicalType,
        tipo_legacy: elegido.tipo_alias || elegido.tipo,
        opciones_tokens: tokens,
        sugerencias: tokens,
        opciones_correccion: correcciones,
        opciones_correcion: correcciones
      });
      idsSeleccionados.add(elegido.id);
    }
  }

  // Si aún faltan para llegar a count, completar del poolDificultad estricto
  if (seleccionados.length < count) {
    const restantes = poolDificultad.filter(r => !idsSeleccionados.has(r.id));
    for (const r of restantes) {
      if (seleccionados.length >= count) break;
      const canonicalType = getCanonicalType(r.tipo);
      const tokens = r.opciones_tokens || r.sugerencias || [];
      const correcciones = r.opciones_correccion || r.opciones_correcion || r.opciones || [];
      seleccionados.push({
        ...r,
        tipo: canonicalType,
        tipo_legacy: r.tipo_alias || r.tipo,
        opciones_tokens: tokens,
        sugerencias: tokens,
        opciones_correccion: correcciones,
        opciones_correcion: correcciones
      });
      idsSeleccionados.add(r.id);
    }
  }

  return seleccionados;
}



// 7. LOBBY MULTIJUGADOR COMPETITIVO
router.post('/api/pragma/multiplayer/match/join', async (req, res) => {
  const { estudiante_id, tipo_match, categoria, dificultad, lenguaje } = req.body;
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
      lenguaje: lenguaje || pragma.tecnologia_actual || "JavaScript",
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
      const retosSincronizados = generarRetosMultijugador(ticket.categoria, ticket.dificultad, ticket.lenguaje || 'JavaScript');
      
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
    const permitirBots = ticket.permitir_bots === true || req.query.allow_bots === 'true';

    // Generar partida con bots únicamente si el usuario otorgó su consentimiento explícito
    if (tiempoEsperaSegundos >= 6 && permitirBots) {
      const salaId = `sala_${crypto.randomUUID()}`;
      const oponentesBots = [];
      const totalBots = totalOponentesRealesNecesarios;
      const retosSincronizados = generarRetosMultijugador(ticket.categoria, ticket.dificultad, ticket.lenguaje || 'JavaScript');

      for (let i = 0; i < totalBots; i++) {
        const botNombre = BOTS_NOMBRES[Math.floor(Math.random() * BOTS_NOMBRES.length)] + ` #${Math.floor(Math.random()*900 + 100)}`;
        oponentesBots.push({
          id: `bot_${crypto.randomUUID()}`,
          nombre: botNombre,
          rank_points: Math.max(0, (ticket.rank_points || 0) + Math.floor(Math.random() * 200 - 100)),
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
        mensaje: "Simulación táctica contra agentes bot adaptados inicializada.",
        victoria: null,
        rankGanado: 25,
        shardsGanado: 10
      };

      const partidaDocRef = doc(firestoreDb, 'pragma_partidas', salaId);
      await setDoc(partidaDocRef, {
        salaId,
        participantes: [estudiante_id],
        retos: retosSincronizados,
        creado_en: new Date().toISOString()
      });

      await setDoc(docRef, { ...ticket, status: 'completado', matchResult });

      return res.json({ status: 'completado', matchResult });
    }

    // Si pasaron 6 segundos y no se han encontrado rivales humanos ni se ha aceptado bots, notificar pausa para confirmación
    if (tiempoEsperaSegundos >= 6) {
      return res.json({ 
        status: 'sin_rivales',
        mensaje: 'No se encontraron rivales humanos en la cola de matchmaking en este momento.',
        tiempoEspera: Math.round(tiempoEsperaSegundos)
      });
    }

    return res.json({ status: 'esperando', tiempoEspera: Math.round(tiempoEsperaSegundos) });
  } catch (error) {
    console.error('Error al consultar estado de matchmaking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint explícito para reanudar búsqueda de rivales humanos reseteando la ventana de espera
router.post('/api/pragma/multiplayer/match/resume', async (req, res) => {
  const { estudiante_id } = req.body;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await setDoc(docRef, {
        ...docSnap.data(),
        status: 'buscando',
        permitir_bots: false,
        fecha_creacion: new Date().toISOString()
      });
    }
    return res.json({ ok: true, mensaje: 'Búsqueda de matchmaking reanudada.' });
  } catch (error) {
    console.error('Error al reanudar matchmaking:', error);
    return res.status(500).json({ error: 'Error interno del servidor al reanudar' });
  }
});

// Endpoint explícito para proceder vs Bots tras confirmación del usuario
router.post('/api/pragma/multiplayer/match/proceed-bots', async (req, res) => {
  const { estudiante_id } = req.body;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    const docSnap = await getDoc(docRef);
    const ticketData = docSnap.exists() ? docSnap.data() : {};
    const ticket = {
      estudiante_id,
      nombre: ticketData.nombre || "Tú",
      tipo_match: ticketData.tipo_match || req.body.tipo_match || "1v1",
      categoria: ticketData.categoria || req.body.categoria || "mixed",
      dificultad: ticketData.dificultad || req.body.dificultad || "intermedio",
      lenguaje: ticketData.lenguaje || req.body.lenguaje || "JavaScript",
      rank_points: ticketData.rank_points || 0
    };

    let totalOponentesRealesNecesarios = 1;
    if (ticket.tipo_match === "2v2") totalOponentesRealesNecesarios = 3;
    if (ticket.tipo_match === "4v4") totalOponentesRealesNecesarios = 7;
    if (ticket.tipo_match === "todos_vs_todos") totalOponentesRealesNecesarios = 4;

    const salaId = `sala_${crypto.randomUUID()}`;
    const oponentesBots = [];
    const retosSincronizados = generarRetosMultijugador(ticket.categoria, ticket.dificultad, ticket.lenguaje || 'JavaScript');

    for (let i = 0; i < totalOponentesRealesNecesarios; i++) {
      const botNombre = BOTS_NOMBRES[Math.floor(Math.random() * BOTS_NOMBRES.length)] + ` #${Math.floor(Math.random()*900 + 100)}`;
      oponentesBots.push({
        id: `bot_${crypto.randomUUID()}`,
        nombre: botNombre,
        rank_points: Math.max(0, (ticket.rank_points || 0) + Math.floor(Math.random() * 200 - 100)),
        laser_color: ["#ff0055", "#00ff66", "#ffff00", "#ff00ff"][Math.floor(Math.random() * 4)],
        map_skin: "neon_cyber",
        isBot: true
      });
    }

    const jugadores = [
      { id: estudiante_id, nombre: ticket.nombre || "Tú", rank_points: ticket.rank_points || 0, laser_color: ticket.laser_color || "#00ffcc", map_skin: ticket.map_skin || "default", isBot: false },
      ...oponentesBots
    ];

    const matchResult = {
      salaId,
      tipo_match: ticket.tipo_match,
      jugadores,
      retos: retosSincronizados,
      mensaje: "Simulación táctica contra bots adaptados inicializada tras confirmación.",
      victoria: null,
      rankGanado: 25,
      shardsGanado: 10
    };

    const partidaDocRef = doc(firestoreDb, 'pragma_partidas', salaId);
    await setDoc(partidaDocRef, {
      salaId,
      participantes: [estudiante_id],
      retos: retosSincronizados,
      creado_en: new Date().toISOString()
    });

    if (docSnap.exists()) {
      await setDoc(docRef, { ...ticket, status: 'completado', permitir_bots: true, matchResult });
    }

    return res.json({ status: 'completado', matchResult });
  } catch (error) {
    console.error('Error al inicializar partida contra bots:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear bots' });
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


