const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, collection, query, where, orderBy, increment } = require('firebase/firestore');
const crypto = require('crypto');
const { Groq } = require('groq-sdk');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Sistema de caché inteligente para minijuegos (Groq LLM caching)
const gameCachePool = new Map();
const GAME_CACHE_TTL = 15 * 60 * 1000; // 15 minutos

function getCachedGameItem(key) {
  const items = gameCachePool.get(key);
  if (items && items.length > 0) {
    const validItems = items.filter(item => Date.now() - item.timestamp < GAME_CACHE_TTL);
    if (validItems.length > 0) {
      const idx = Math.floor(Math.random() * validItems.length);
      return validItems[idx].data;
    }
  }
  return null;
}

function addCachedGameItem(key, data) {
  if (!gameCachePool.has(key)) {
    gameCachePool.set(key, []);
  }
  const items = gameCachePool.get(key);
  items.push({ data, timestamp: Date.now() });
  if (items.length > 5) {
    items.shift();
  }
}

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBtHYxIRZOGERjCROnqjmmxbP1sI3Jc7yQ",
  authDomain: "ia-profesor.firebaseapp.com",
  projectId: "ia-profesor",
  storageBucket: "ia-profesor.firebasestorage.app",
  messagingSenderId: "767957470205",
  appId: "1:767957470205:web:e1e1b61d9e4f970159a794"
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);
console.log('Base de datos Firebase Firestore conectada de forma exitosa.');

// Adaptador compatible con firmas SQL de pg
const client = {
  query: async (sql, params = []) => {
    try {
      const queryClean = sql.trim().replace(/\s+/g, ' ');

      // --- 1. SELECT * FROM profesor_estudiantes WHERE id = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_estudiantes WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_estudiantes', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 2. SELECT * FROM profesor_estudiantes WHERE nombre = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_estudiantes WHERE nombre = \$1/i)) {
        const nombre = params[0];
        const q = query(collection(firestoreDb, 'profesor_estudiantes'), where('nombre', '==', nombre));
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        return { rows };
      }

      // --- 2b. SELECT nombre FROM profesor_estudiantes WHERE id = $1 ---
      if (queryClean.match(/SELECT nombre FROM profesor_estudiantes WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_estudiantes', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [{ nombre: docSnap.data().nombre }] : [] };
      }

      // --- 2c. SELECT id, nombre, nivel_actual, tecnologia_actual, tema_indice, ultima_conexion FROM profesor_estudiantes WHERE id = ANY($1) ---
      if (queryClean.match(/SELECT .* FROM profesor_estudiantes WHERE id = ANY\(\$1\)/i)) {
        const idsArray = params[0];
        const rows = [];
        if (idsArray && idsArray.length > 0) {
          const docSnaps = await Promise.all(
            idsArray.map(id => getDoc(doc(firestoreDb, 'profesor_estudiantes', id)))
          );
          docSnaps.forEach(docSnap => {
            if (docSnap.exists()) {
              const d = docSnap.data();
              rows.push({
                id: d.id,
                nombre: d.nombre,
                nivel_actual: d.nivel_actual,
                tecnologia_actual: d.tecnologia_actual,
                tema_indice: d.tema_indice,
                ultima_conexion: d.ultima_conexion || null
              });
            }
          });
        }
        return { rows };
      }

      // --- 3. SELECT * FROM profesor_tareas WHERE estudiante_id = $1 ORDER BY creado_en DESC ---
      if (queryClean.match(/SELECT \* FROM profesor_tareas WHERE estudiante_id = \$1 ORDER BY creado_en DESC/i)) {
        const estudiante_id = params[0];
        const q = query(
          collection(firestoreDb, 'profesor_tareas'),
          where('estudiante_id', '==', estudiante_id)
        );
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        rows.sort((a, b) => {
          const tA = a.creado_en || '';
          const tB = b.creado_en || '';
          return tB.localeCompare(tA);
        });
        return { rows };
      }

      // --- 3b. SELECT * FROM profesor_tareas WHERE word_url = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_tareas WHERE word_url = \$1/i)) {
        const word_url = params[0];
        const q = query(
          collection(firestoreDb, 'profesor_tareas'),
          where('word_url', '==', word_url)
        );
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        return { rows };
      }

      // --- 4. SELECT * FROM profesor_tareas WHERE id = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_tareas WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_tareas', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 4b. SELECT * FROM profesor_entregas WHERE tarea_id = ANY($1) ORDER BY fecha_entrega DESC ---
      if (queryClean.match(/SELECT \* FROM profesor_entregas WHERE tarea_id = ANY\(\$1\) ORDER BY fecha_entrega DESC/i)) {
        const idsArray = params[0];
        const rows = [];
        if (idsArray && idsArray.length > 0) {
          for (const tareaId of idsArray) {
            const q = query(
              collection(firestoreDb, 'profesor_entregas'),
              where('tarea_id', '==', tareaId)
            );
            const snap = await getDocs(q);
            snap.forEach(d => rows.push(d.data()));
          }
          rows.sort((a, b) => (b.fecha_entrega || '').localeCompare(a.fecha_entrega || ''));
        }
        return { rows };
      }

      // --- 5. SELECT * FROM profesor_entregas WHERE tarea_id = $1 ORDER BY fecha_entrega DESC ---
      if (queryClean.match(/SELECT \* FROM profesor_entregas WHERE tarea_id = \$1 ORDER BY fecha_entrega DESC/i)) {
        const tarea_id = params[0];
        const q = query(
          collection(firestoreDb, 'profesor_entregas'),
          where('tarea_id', '==', tarea_id)
        );
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        rows.sort((a, b) => {
          const tA = a.fecha_entrega || '';
          const tB = b.fecha_entrega || '';
          return tB.localeCompare(tA);
        });
        return { rows };
      }

      // --- 6. SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC ---
      if (queryClean.match(/SELECT \* FROM profesor_mentor_planes WHERE estudiante_id = \$1 ORDER BY creado_en DESC/i)) {
        const estudiante_id = params[0];
        const q = query(
          collection(firestoreDb, 'profesor_mentor_planes'),
          where('estudiante_id', '==', estudiante_id)
        );
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        rows.sort((a, b) => {
          const tA = a.creado_en || '';
          const tB = b.creado_en || '';
          return tB.localeCompare(tA);
        });
        return { rows };
      }

      // --- 7. SELECT * FROM profesor_mentor_planes WHERE id = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_mentor_planes WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_mentor_planes', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 8. SELECT * FROM profesor_mentor_documentos_ayuda WHERE plan_id = $1 ORDER BY creado_en DESC ---
      if (queryClean.match(/SELECT \* FROM profesor_mentor_documentos_ayuda WHERE plan_id = \$1 ORDER BY creado_en DESC/i)) {
        const plan_id = params[0];
        const q = query(
          collection(firestoreDb, 'profesor_mentor_documentos_ayuda'),
          where('plan_id', '==', plan_id)
        );
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        rows.sort((a, b) => {
          const tA = a.creado_en || '';
          const tB = b.creado_en || '';
          return tB.localeCompare(tA);
        });
        return { rows };
      }

      // --- 9. SELECT * FROM profesor_mentor_documentos_ayuda WHERE id = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_mentor_documentos_ayuda WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_mentor_documentos_ayuda', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 10. SELECT logro_id, desbloqueado_at FROM profesor_logros WHERE estudiante_id = $1 ---
      if (queryClean.match(/SELECT logro_id,\s*desbloqueado_at FROM profesor_logros WHERE estudiante_id = \$1/i)) {
        const estudiante_id = params[0];
        const q = query(
          collection(firestoreDb, 'profesor_logros'),
          where('estudiante_id', '==', estudiante_id)
        );
        const querySnapshot = await getDocs(q);
        const rows = [];
        querySnapshot.forEach(doc => rows.push(doc.data()));
        return { rows };
      }

      // --- 11. SELECT id FROM profesor_logros WHERE estudiante_id = $1 AND logro_id = $2 ---
      if (queryClean.match(/SELECT id FROM profesor_logros WHERE estudiante_id = \$1 AND logro_id = \$2/i)) {
        const estudiante_id = params[0];
        const logro_id = params[1];
        const docId = `${estudiante_id}_${logro_id}`;
        const docRef = doc(firestoreDb, 'profesor_logros', docId);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 12. SELECT nivel_actual, tema_indice FROM profesor_estudiante_progreso WHERE estudiante_id = $1 AND tecnologia = $2 ---
      if (queryClean.match(/SELECT nivel_actual,\s*tema_indice FROM profesor_estudiante_progreso WHERE estudiante_id = \$1 AND tecnologia = \$2/i)) {
        const estudiante_id = params[0];
        const tecnologia = params[1];
        const docId = `${estudiante_id}_tecnologia`; // Nota: en original es `${estudiante_id}_${tecnologia}` o `${estudiante_id}_tecnologia`. Sincronizado a `${estudiante_id}_${tecnologia}`
        const docRef = doc(firestoreDb, 'profesor_estudiante_progreso', `${estudiante_id}_${tecnologia}`);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 13. SELECT t.* FROM profesor_tareas (LEFT JOIN) ---
      if (queryClean.match(/SELECT t\.\* FROM profesor_tareas/i)) {
        const estudiante_id = params[0];
        const tecnologia = params[1];

        const qTareas = query(
          collection(firestoreDb, 'profesor_tareas'),
          where('estudiante_id', '==', estudiante_id),
          where('tecnologia', '==', tecnologia)
        );
        const snapTareas = await getDocs(qTareas);
        const tareas = [];
        snapTareas.forEach(doc => tareas.push(doc.data()));

        const activeTasks = [];
        for (const tarea of tareas) {
          const qEntregas = query(
            collection(firestoreDb, 'profesor_entregas'),
            where('tarea_id', '==', tarea.id)
          );
          const snapEntregas = await getDocs(qEntregas);
          let maxScore = 0;
          let hasDeliveries = false;
          snapEntregas.forEach(dDoc => {
            hasDeliveries = true;
            const puntaje = dDoc.data().puntaje;
            if (puntaje > maxScore) maxScore = puntaje;
          });

          if (!hasDeliveries || maxScore < 90) {
            activeTasks.push(tarea);
          }
        }
        return { rows: activeTasks };
      }

      // --- 14. SELECT * FROM profesor_entregas WHERE id = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_entregas WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_entregas', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 15. INSERT INTO profesor_estudiantes (id, nombre, nivel_actual, tecnologia_actual, tema_indice) VALUES ($1, $2, 'Novato', $3, 1) ---
      if (queryClean.match(/INSERT INTO profesor_estudiantes/i)) {
        const [id, nombre, tecnologia_actual] = params;
        const defaultPragmaProfile = {
          rank_points: 0,
          cognitive_profile: {
            strengths: [],
            weaknesses: [],
            last_analysis_timestamp: new Date().toISOString()
          },
          inventory: {
            silicon_shards: 10,
            memory_threads: 5,
            logic_cores: 2,
            javascript_essence: 0,
            python_essence: 0,
            java_essence: 0,
            sql_essence: 0
          },
          unlocked_runes: [],
          unlocked_cosmetics: [],
          equipped_cosmetics: {
            map_skin: "default",
            star_aura: "none",
            laser_color: "#00ffcc"
          }
        };
        const docData = {
          id,
          nombre,
          nivel_actual: 'Novato',
          tecnologia_actual,
          tema_indice: 1,
          creado_en: new Date().toISOString(),
          perfil_cognitivo: null,
          xp: 0,
          pragma_profile: defaultPragmaProfile
        };
        await setDoc(doc(firestoreDb, 'profesor_estudiantes', id), docData);
        return { rows: [] };
      }

      // --- 16. INSERT INTO profesor_logros (estudiante_id, logro_id, desbloqueado_at) VALUES ($1, $2, $3) ---
      if (queryClean.match(/INSERT INTO profesor_logros/i)) {
        const [estudiante_id, logro_id, desbloqueado_at] = params;
        const docId = `${estudiante_id}_${logro_id}`;
        const docData = {
          estudiante_id,
          logro_id,
          desbloqueado_at: desbloqueado_at || new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profesor_logros', docId), docData);
        return { rows: [] };
      }

      // --- 17. INSERT INTO profesor_mentor_documentos_ayuda (id, plan_id, mensaje_estudiante, respuesta_mentor, documento_markdown, word_url) VALUES ($1, $2, $3, $4, $5, $6) ---
      if (queryClean.match(/INSERT INTO profesor_mentor_documentos_ayuda/i)) {
        const [id, plan_id, mensaje_estudiante, respuesta_mentor, documento_markdown, word_url] = params;
        const docData = {
          id,
          plan_id,
          mensaje_estudiante,
          respuesta_mentor,
          documento_markdown,
          word_url: word_url || null,
          creado_en: new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profesor_mentor_documentos_ayuda', id), docData);
        return { rows: [] };
      }

      // --- 18. INSERT INTO profesor_estudiante_progreso ON CONFLICT ---
      if (queryClean.match(/INSERT INTO profesor_estudiante_progreso/i)) {
        const [, estudiante_id, tecnologia, nivel_actual, tema_indice] = params;
        const docId = `${estudiante_id}_${tecnologia}`;
        const docData = {
          estudiante_id,
          tecnologia,
          nivel_actual,
          tema_indice: Number(tema_indice),
          creado_en: new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profesor_estudiante_progreso', docId), docData, { merge: true });
        return { rows: [] };
      }

      // --- 19. INSERT INTO profesor_tareas ---
      if (queryClean.match(/INSERT INTO profesor_tareas/i)) {
        const [id, estudiante_id, titulo, tema, nivel, descripcion, conceptos_clave, tecnologia, word_url, estado] = params;
        let conceptos = conceptos_clave;
        if (conceptos && typeof conceptos === 'string') {
          try { conceptos = JSON.parse(conceptos); } catch (e) { /* ignore */ }
        }
        const docData = {
          id,
          estudiante_id,
          titulo,
          tema,
          nivel,
          descripcion,
          conceptos_clave: conceptos || conceptos_clave,
          tecnologia: tecnologia || null,
          word_url: word_url || null,
          estado: estado || 'Pendiente',
          creado_en: new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profesor_tareas', id), docData);
        return { rows: [] };
      }

      // --- 20. INSERT INTO profesor_mentor_planes ---
      if (queryClean.match(/INSERT INTO profesor_mentor_planes/i)) {
        const [id, estudiante_id, titulo, idea_proyecto, github_url, plan_markdown, word_url, mensajes] = params;
        let msgList = mensajes;
        if (msgList && typeof msgList === 'string') {
          try { msgList = JSON.parse(msgList); } catch (e) { /* ignore */ }
        }
        const docData = {
          id,
          estudiante_id,
          titulo,
          idea_proyecto,
          github_url: github_url || null,
          plan_markdown,
          word_url: word_url || null,
          mensajes: msgList || [],
          creado_en: new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profesor_mentor_planes', id), docData);
        return { rows: [] };
      }

      // --- 21. INSERT INTO profesor_entregas ---
      if (queryClean.match(/INSERT INTO profesor_entregas/i)) {
        const [id, tarea_id, github_url, puntaje, observaciones, recomendaciones] = params;
        const docData = {
          id,
          tarea_id,
          github_url,
          puntaje: Number(puntaje) || 0,
          observaciones: observaciones || '',
          recomendaciones: recomendaciones || '',
          fecha_entrega: new Date().toISOString()
        };
        await setDoc(doc(firestoreDb, 'profesor_entregas', id), docData);
        return { rows: [] };
      }

      // --- 22. UPDATE profesor_estudiantes SET perfil_cognitivo = $1, nivel_actual = $2 WHERE id = $3 ---
      if (queryClean.match(/UPDATE profesor_estudiantes SET perfil_cognitivo = \$1, nivel_actual = \$2 WHERE id = \$3/i)) {
        let perfil = params[0];
        if (perfil && typeof perfil === 'string') {
          try { perfil = JSON.parse(perfil); } catch (e) { /* ignore */ }
        }
        const nivel_actual = params[1];
        const id = params[2];
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), {
          perfil_cognitivo: perfil,
          nivel_actual
        });
        return { rows: [] };
      }

      // --- 23. UPDATE profesor_estudiantes SET nivel_actual = $1 WHERE id = $2 ---
      if (queryClean.match(/UPDATE profesor_estudiantes SET nivel_actual = \$1 WHERE id = \$2/i)) {
        const nivel_actual = params[0];
        const id = params[1];
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), { nivel_actual });
        return { rows: [] };
      }

      // --- 24. UPDATE profesor_estudiantes SET tema_indice = $1, nivel_actual = $2 WHERE id = $3 ---
      if (queryClean.match(/UPDATE profesor_estudiantes SET tema_indice = \$1, nivel_actual = \$2 WHERE id = \$3/i)) {
        const tema_indice = Number(params[0]);
        const nivel_actual = params[1];
        const id = params[2];
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), { tema_indice, nivel_actual });
        return { rows: [] };
      }

      // --- 25. UPDATE profesor_estudiantes SET perfil_cognitivo = $1 WHERE id = $2 ---
      if (queryClean.match(/UPDATE profesor_estudiantes SET perfil_cognitivo = \$1 WHERE id = \$2/i)) {
        let perfil = params[0];
        if (perfil && typeof perfil === 'string') {
          try { perfil = JSON.parse(perfil); } catch (e) { /* ignore */ }
        }
        const id = params[1];
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), { perfil_cognitivo: perfil });
        return { rows: [] };
      }

      // --- 26. UPDATE profesor_estudiantes SET xp = xp + $1 WHERE id = $2 ---
      if (queryClean.match(/UPDATE profesor_estudiantes SET xp = xp \+ \$1 WHERE id = \$2/i)) {
        const xp_gain = Number(params[0]);
        const id = params[1];
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), {
          xp: increment(xp_gain)
        });
        return { rows: [] };
      }

      // --- 27. UPDATE profesor_estudiantes SET tecnologia_actual = $1, nivel_actual = $2, tema_indice = $3 WHERE id = $4 ---
      if (queryClean.match(/UPDATE profesor_estudiantes.*SET tecnologia_actual = \$1/i)) {
        const [tecnologia_actual, nivel_actual, tema_indice, id] = params;
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), {
          tecnologia_actual,
          nivel_actual,
          tema_indice: Number(tema_indice)
        });
        return { rows: [] };
      }

      // --- 28. UPDATE profesor_tareas SET estado = $1 WHERE id = $2 ---
      if (queryClean.match(/UPDATE profesor_tareas SET estado = \$1 WHERE id = \$2/i)) {
        const estado = params[0];
        const id = params[1];
        await updateDoc(doc(firestoreDb, 'profesor_tareas', id), { estado });
        return { rows: [] };
      }

      // --- 29. UPDATE profesor_tareas SET estado = 'Aprobado' WHERE id = $1 ---
      if (queryClean.match(/UPDATE profesor_tareas SET estado = 'Aprobado' WHERE id = \$1/i)) {
        const id = params[0];
        await updateDoc(doc(firestoreDb, 'profesor_tareas', id), { estado: 'Aprobado' });
        return { rows: [] };
      }

      // --- 30. UPDATE profesor_tareas SET titulo = $1, descripcion = $2, conceptos_clave = $3, word_url = $4 WHERE id = $5 ---
      if (queryClean.match(/UPDATE profesor_tareas.*SET titulo = \$1/i)) {
        const [titulo, descripcion, conceptos_clave, word_url, id] = params;
        let conceptos = conceptos_clave;
        if (conceptos && typeof conceptos === 'string') {
          try { conceptos = JSON.parse(conceptos); } catch (e) { /* ignore */ }
        }
        await updateDoc(doc(firestoreDb, 'profesor_tareas', id), {
          titulo,
          descripcion,
          conceptos_clave: conceptos || conceptos_clave,
          word_url
        });
        return { rows: [] };
      }

      // --- 31. UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2 ---
      if (queryClean.match(/UPDATE profesor_mentor_planes SET mensajes = \$1 WHERE id = \$2/i)) {
        let mensajes = params[0];
        if (mensajes && typeof mensajes === 'string') {
          try { mensajes = JSON.parse(mensajes); } catch (e) { /* ignore */ }
        }
        const id = params[1];
        await updateDoc(doc(firestoreDb, 'profesor_mentor_planes', id), { mensajes });
        return { rows: [] };
      }

      // --- 32. UPDATE profesor_mentor_documentos_ayuda SET respuesta_mentor = $1, documento_markdown = $2, word_url = $3 WHERE id = $4 ---
      if (queryClean.match(/UPDATE profesor_mentor_documentos_ayuda/i)) {
        const [respuesta_mentor, documento_markdown, word_url, id] = params;
        await updateDoc(doc(firestoreDb, 'profesor_mentor_documentos_ayuda', id), {
          respuesta_mentor,
          documento_markdown,
          word_url
        });
        return { rows: [] };
      }

      // --- 33. UPDATE profesor_estudiantes SET ultima_conexion = $1 WHERE id = $2 ---
      if (queryClean.match(/UPDATE profesor_estudiantes.*SET ultima_conexion = \$1/i)) {
        const [ultima_conexion, id] = params;
        await updateDoc(doc(firestoreDb, 'profesor_estudiantes', id), { ultima_conexion });
        return { rows: [] };
      }

      console.warn('Consulta SQL no controlada en Firestore Adapter:', sql, params);
      throw new Error(`Consulta SQL no mapeada: ${sql}`);
    } catch (err) {
      console.error('Error en Firestore Adapter:', err, 'SQL:', sql, 'Params:', params);
      throw err;
    }
  }
};

// Inicializar Groq SDK
const API_KEYS_STR = process.env.GROQ_API_KEYS || process.env.VITE_GROQ_API_KEY || '';
const API_KEYS = API_KEYS_STR.split(',').map(k => k.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
const groqClients = API_KEYS.map(key => new Groq({ apiKey: key }));
let currentClientIndex = 0;

function parsearJSONGroq(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        const extracted = cleaned.substring(startIdx, endIdx + 1);
        return JSON.parse(extracted);
      } catch (innerError) {
        throw new Error('Estructura JSON inválida en la respuesta de la IA');
      }
    }
    throw error;
  }
}

async function ejecutarGroqConReintentos(messages, model = 'llama-3.3-70b-versatile', responseFormat = null, maxReintentos = 6) {
  let delay = 1000;
  if (groqClients.length === 0) {
    throw new Error('No hay claves API de Groq configuradas en el pool.');
  }

  for (let intento = 1; intento <= maxReintentos; intento++) {
    const activeIndex = currentClientIndex;
    const activeClient = groqClients[activeIndex];

    try {
      const params = { messages, model };
      if (responseFormat) {
        params.response_format = responseFormat;
      }
      const completion = await activeClient.chat.completions.create(params);
      const content = completion.choices[0].message.content;

      if (responseFormat && responseFormat.type === 'json_object') {
        try {
          parsearJSONGroq(content);
        } catch (jsonErr) {
          if (intento === maxReintentos) throw jsonErr;
          console.warn(`[Groq Resiliencia] Intento ${intento} falló al parsear JSON. Reintentando...`);
          await new Promise(res => setTimeout(res, 500));
          continue;
        }
      }
      return completion;
    } catch (error) {
      currentClientIndex = (currentClientIndex + 1) % groqClients.length;
      const isRateLimit = error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Rate limit'));
      console.warn(`[Groq Resiliencia] Intento ${intento} falló usando clave índice ${activeIndex}. Error: ${error.message || error}. Rotando a clave índice ${currentClientIndex}...`);

      if (intento === maxReintentos) {
        throw error;
      }
      const waitTime = isRateLimit ? delay * 1.5 : delay;
      await new Promise(res => setTimeout(res, waitTime));
      delay *= 1.5;
    }
  }
}

// Función de Machine Learning Cognitivo: Actualización incremental del perfil del estudiante
async function actualizarPerfilCognitivo(estudianteId, nuevoMensajeEstudiante, respuestaMentor) {
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudianteId]);
    if (estRes.rows.length === 0) return;
    const estudiante = estRes.rows[0];

    const planesRes = await client.query(
      'SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC',
      [estudianteId]
    );
    const planActivo = planesRes.rows[0];
    const planMarkdownStr = planActivo ? planActivo.plan_markdown : 'No hay plan activo registrado.';

    let perfilPrevio = {
      conceptos_dominados: [],
      conceptos_en_progreso: [],
      vacios_de_conocimiento: [],
      dudas_recurrentes: [],
      errores_frecuentes: [],
      fortalezas: [],
      nivel_real_detectado: estudiante.nivel_actual || 'Novato',
      observaciones_pedagogicas: 'Perfil inicializado.'
    };

    if (estudiante.perfil_cognitivo) {
      try {
        const parseado = typeof estudiante.perfil_cognitivo === 'string'
          ? JSON.parse(estudiante.perfil_cognitivo)
          : estudiante.perfil_cognitivo;
        perfilPrevio = { ...perfilPrevio, ...parseado };
      } catch (e) {
        console.error('Error al parsear perfil cognitivo guardado:', e);
      }
    }

    const systemPrompt = `
      Eres un Analista Cognitivo y Evaluador de Rendimiento Académico de IA especializado en Machine Learning de Aprendizaje Adaptativo.
      Tu única tarea es analizar la interacción del estudiante con su mentor técnico y actualizar su perfil de aprendizaje de forma incremental y sumamente rigurosa.

      Plan de Implementación del Proyecto de Referencia del Estudiante:
      ${planMarkdownStr}

      Perfil Cognitivo Anterior:
      ${JSON.stringify(perfilPrevio, null, 2)}

      Último Mensaje Estudiante:
      "${nuevoMensajeEstudiante}"

      Última Respuesta del Mentor:
      "${respuestaMentor}"

      INSTRUCCIONES DE CRITERIO ML COGNITIVO RIGUROSO:
      1. CRITERIO DE DOMINIO ESTRICTO: Preguntar una o dos veces sobre un tema o mencionarlo NO significa dominarlo.
         - Clasifica un tema in "conceptos_en_progreso" cuando el estudiante apenas esté preguntando, explorando o implementándolo de forma básica o asistida.
         - Mueve un concepto a "conceptos_dominados" ÚNICAMENTE cuando el estudiante demuestre de manera inequívoca que sabe resolver problemas complejos, escribe código funcional óptimo libre de errores sobre ese tema, o explica con precisión y autonomía su funcionamiento interno.
      2. DETECCIÓN DE VACÍOS (LO QUE NO SABE): Identifica en "vacios_de_conocimiento" conceptos fundamentales de ingeniería (ej: control de concurrencia, sanitización, pruebas unitarias, indexación avanzada, etc.) que el estudiante omita, ignore, pregunte de forma muy básica o donde cometa errores obvios.
      3. DUDAS Y ERRORES: Registra en "dudas_recurrentes" las consultas repetitivas y en "errores_frecuentes" los fallos conceptuales persistentes expuestos en sus consultas o código.
      4. EVOLUCIÓN: Si un concepto se clasifica como "conceptos_dominados", elimínalo de "conceptos_en_progreso" y de "vacios_de_conocimiento".
      5. NIVEL REAL: Novato, Intermedio o Experto según el rigor real demostrado.

      REGLA CRÍTICA DE RESOLUCIÓN DE CONCEPTOS GENERALES (PROHIBIDO GUARDAR GENERALIZACIONES LITERALES):
      - Si el estudiante hace referencia a términos generales o agregados tales como "Fase 1", "Fase 2 del proyecto", "Hito 1", "el paso 1", o frases similares como "no entendí la fase 1", queda TERMINANTEMENTE PROHIBIDO guardar literalmente el término "Fase 1 del proyecto", "fase 1" o análogos en el perfil de aprendizaje (conceptos_en_progreso, vacios_de_conocimiento, dudas_recurrentes).
      - En su lugar, debes cruzar esa referencia con el "Plan de Implementación del Proyecto de Referencia" arriba provisto y extraer los temas conceptuales reales y específicos contenidos en esa sección (por ejemplo: "inicialización del proyecto con npm", "configuración de Webpack", "creación de la estructura de carpetas", etc.) y registrarlos de forma individualizada.
      - Si el Plan de Referencia no detalla esa sección, analiza la última respuesta del Mentor y las tecnologías involucradas para inferir los temas técnicos concretos y registrarlos en su lugar.

      Debes responder estrictamente en formato JSON con la siguiente estructura:
      {
        "conceptos_dominados": ["lista", "de", "conceptos", "dominados", "con", "evidencia", "robusta"],
        "conceptos_en_progreso": ["lista", "de", "conceptos", "en", "proceso", "de", "aprendizaje"],
        "vacios_de_conocimiento": ["conceptos", "que", "el", "estudiante", "desconoce", "o", "necesita", "aprender"],
        "dudas_recurrentes": ["dudas", "recurrentes"],
        "errores_frecuentes": ["errores", "frecuentes"],
        "fortalezas": ["fortalezas", "reales"],
        "nivel_real_detectado": "Novato/Intermedio/Experto",
        "observaciones_pedagogicas": "Resumen retrospectivo corto de su avance cognitivo actual"
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const nuevoPerfil = parsearJSONGroq(chatCompletion.choices[0].message.content);

    await client.query(
      'UPDATE profesor_estudiantes SET perfil_cognitivo = $1, nivel_actual = $2 WHERE id = $3',
      [JSON.stringify(nuevoPerfil), nuevoPerfil.nivel_real_detectado, estudianteId]
    );
    console.log(`[Cognitive ML] Perfil de aprendizaje de ${estudiante.nombre} actualizado con éxito.`);
  } catch (error) {
    console.error('Error al actualizar perfil cognitivo:', error);
  }
}

// Función de Machine Learning Cognitivo: Actualización incremental del perfil del estudiante basada en evaluación de tareas
async function actualizarPerfilCognitivoConEvaluacion(estudianteId, tareaTitulo, tareaNivel, puntaje, observaciones, recomendaciones) {
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudianteId]);
    if (estRes.rows.length === 0) return;
    const estudiante = estRes.rows[0];

    let perfilPrevio = {
      conceptos_dominados: [],
      conceptos_en_progreso: [],
      vacios_de_conocimiento: [],
      dudas_recurrentes: [],
      errores_frecuentes: [],
      fortalezas: [],
      nivel_real_detectado: estudiante.nivel_actual || 'Novato',
      observaciones_pedagogicas: 'Perfil inicializado.'
    };

    if (estudiante.perfil_cognitivo) {
      try {
        const parseado = typeof estudiante.perfil_cognitivo === 'string'
          ? JSON.parse(estudiante.perfil_cognitivo)
          : estudiante.perfil_cognitivo;
        perfilPrevio = { ...perfilPrevio, ...parseado };
      } catch (e) {
        console.error('Error al parsear perfil cognitivo guardado:', e);
      }
    }

    const systemPrompt = `
      Eres un Analista Cognitivo y Evaluador de Rendimiento Académico de IA especializado en Machine Learning de Aprendizaje Adaptativo.
      Tu única tarea es analizar el resultado de una Tarea Evaluada/Entregada por el estudiante y actualizar su perfil de aprendizaje de forma incremental y sumamente rigurosa.

      Perfil Cognitivo Anterior:
      ${JSON.stringify(perfilPrevio, null, 2)}

      Datos de la Tarea Evaluada:
      - Título de la Tarea: "${tareaTitulo}"
      - Nivel de Dificultad: "${tareaNivel}"
      - Puntaje Obtenido: ${puntaje} / 100
      - Observaciones del Evaluador: "${observaciones}"
      - Recomendaciones de Mejora: "${recomendaciones}"

      INSTRUCCIONES DE CRITERIO ML COGNITIVO RIGUROSO:
      1. CRITERIO DE DOMINIO ESTRICTO:
         - Si el puntaje obtenido es mayor o igual a 85/100, se considera que el estudiante ha demostrado dominio práctico de los conceptos centrales de la tarea. Agrégalos a "conceptos_dominados".
         - Si el puntaje es menor a 85/100, el concepto de la tarea debe permanecer o agregarse a "conceptos_en_progreso", no a "conceptos_dominados".
         - Si el puntaje es críticamente bajo (menor a 60/100), identifica los conceptos de la tarea y agrégalos a "vacios_de_conocimiento".
      2. DETECCIÓN DE ERRORES FRECUENTES:
         - A partir de las Observaciones y Recomendaciones, extrae los fallos técnicos o malas prácticas de código concretos y agrégalos a "errores_frecuentes".
      3. EVOLUCIÓN:
         - Si un concepto se mueve a "conceptos_dominados", elimínalo de "conceptos_en_progreso" y de "vacios_de_conocimiento".
      4. NIVEL REAL: Ajusta el campo "nivel_real_detectado" (Novato, Intermedio, Experto) según el desempeño en la tarea en relación a su nivel.

      Debes responder estrictamente en formato JSON con la siguiente estructura:
      {
        "conceptos_dominados": ["lista", "de", "conceptos", "dominados"],
        "conceptos_en_progreso": ["lista", "de", "conceptos", "en", "proceso"],
        "vacios_de_conocimiento": ["conceptos", "que", "el", "estudiante", "necesita", "reforzar"],
        "dudas_recurrentes": ["dudas", "recurrentes"],
        "errores_frecuentes": ["errores", "técnicos", "cometidos"],
        "fortalezas": ["fortalezas", "demostradas"],
        "nivel_real_detectado": "Novato/Intermedio/Experto",
        "observaciones_pedagogicas": "Retrospectiva corta sobre el desempeño del estudiante en esta tarea evaluada."
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const nuevoPerfil = parsearJSONGroq(chatCompletion.choices[0].message.content);

    await client.query(
      'UPDATE profesor_estudiantes SET perfil_cognitivo = $1, nivel_actual = $2 WHERE id = $3',
      [JSON.stringify(nuevoPerfil), nuevoPerfil.nivel_real_detectado, estudianteId]
    );

    console.log(`[Cognitive ML - Evaluación] Perfil de aprendizaje de ${estudiante.nombre} actualizado con éxito tras calificar la tarea: ${tareaTitulo}.`);
  } catch (error) {
    console.error('Error al actualizar perfil cognitivo con evaluación:', error);
  }
}

function obtenerNivelPorIndice(temaIndice) {
  if (temaIndice <= 44) return 'Novato';
  if (temaIndice <= 77) return 'Intermedio';
  return 'Avanzado';
}

async function guardarProgreso(estudianteId, tecnologia, nivel, temaIndice) {
  const uuid = crypto.randomUUID();
  const query = `
    INSERT INTO profesor_estudiante_progreso (id, estudiante_id, tecnologia, nivel_actual, tema_indice)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (estudiante_id, tecnologia)
    DO UPDATE SET nivel_actual = EXCLUDED.nivel_actual, tema_indice = EXCLUDED.tema_indice, creado_en = CURRENT_TIMESTAMP
  `;
  await client.query(query, [uuid, estudianteId, tecnologia, nivel, temaIndice]);
}

async function obtenerProgreso(estudianteId, tecnologia) {
  const query = `
    SELECT nivel_actual, tema_indice FROM profesor_estudiante_progreso
    WHERE estudiante_id = $1 AND tecnologia = $2
  `;
  const res = await client.query(query, [estudianteId, tecnologia]);
  if (res.rows.length > 0) {
    return res.rows[0];
  }
  return { nivel_actual: 'Novato', tema_indice: 1 };
}

module.exports = {
  client,
  firestoreDb,
  ejecutarGroqConReintentos,
  parsearJSONGroq,
  getCachedGameItem,
  addCachedGameItem,
  actualizarPerfilCognitivo,
  actualizarPerfilCognitivoConEvaluacion,
  obtenerNivelPorIndice,
  guardarProgreso,
  obtenerProgreso
};

