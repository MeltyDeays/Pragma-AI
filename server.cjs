const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, collection, query, where, orderBy, increment } = require('firebase/firestore');
const crypto = require('crypto');
const { Groq } = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const docx = require('docx');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(cors());
app.use(express.json());

// Cabeceras de seguridad esenciales (Seguridad de Nivel de Producción)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Directorio público para tareas descargables
const tareasPublicDir = path.join(__dirname, 'public', 'tareas');
fs.mkdirSync(tareasPublicDir, { recursive: true });
app.use('/descargas', express.static(tareasPublicDir));

// Configuración de Firebase provista por el usuario
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

// Wrapper compatible con la firma de pg (para evitar modificar todas las rutas del server)
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

      // --- 4. SELECT * FROM profesor_tareas WHERE id = $1 ---
      if (queryClean.match(/SELECT \* FROM profesor_tareas WHERE id = \$1/i)) {
        const id = params[0];
        const docRef = doc(firestoreDb, 'profesor_tareas', id);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
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
        const docId = `${estudiante_id}_${tecnologia}`;
        const docRef = doc(firestoreDb, 'profesor_estudiante_progreso', docId);
        const docSnap = await getDoc(docRef);
        return { rows: docSnap.exists() ? [docSnap.data()] : [] };
      }

      // --- 13. SELECT t.* FROM profesor_tareas (LEFT JOIN de tareas pendientes con puntaje < 90) ---
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

      console.warn('Consulta SQL no controlada en Firestore Adapter:', sql, params);
      throw new Error(`Consulta SQL no mapeada: ${sql}`);
    } catch (err) {
      console.error('Error en Firestore Adapter:', err, 'SQL:', sql, 'Params:', params);
      throw err;
    }
  }
};

// Inicializar Groq SDK con pool rotativo
const API_KEYS_STR = process.env.GROQ_API_KEYS || process.env.VITE_GROQ_API_KEY || '';
const API_KEYS = API_KEYS_STR.split(',').map(k => k.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

console.log(`[Groq Pool] Inicializando con ${API_KEYS.length} claves API.`);

const groqClients = API_KEYS.map(key => new Groq({ apiKey: key }));
let currentClientIndex = 0;

// Limpiador y parseador robusto de JSON para respuestas de LLM
function parsearJSONGroq(rawText) {
  let cleaned = rawText.trim();
  // Eliminar bloques de markdown si están presentes
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
    // Si falla el parseo directo, intentar extraer por bloques de llaves
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

// Función para realizar llamadas a Groq con reintentos, backoff exponencial, rotación circular de API keys y validación de JSON
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
      // Rotar al siguiente cliente de forma circular ante cualquier fallo
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

    // Recuperar el plan de implementación más reciente del estudiante
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
         - Clasifica un tema en "conceptos_en_progreso" cuando el estudiante apenas esté preguntando, explorando o implementándolo de forma básica o asistida.
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

    // Guardar en la base de datos
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

    // Guardar en la base de datos
    await client.query(
      'UPDATE profesor_estudiantes SET perfil_cognitivo = $1, nivel_actual = $2 WHERE id = $3',
      [JSON.stringify(nuevoPerfil), nuevoPerfil.nivel_real_detectado, estudianteId]
    );

    console.log(`[Cognitive ML - Evaluación] Perfil de aprendizaje de ${estudiante.nombre} actualizado con éxito tras calificar la tarea: ${tareaTitulo}.`);
  } catch (error) {
    console.error('Error al actualizar perfil cognitivo con evaluación:', error);
  }
}

// DICCIONARIOS DE TEMARIOS SECUENCIALES (Ruta de Aprendizaje)
const TEMARIOS = {
  "JavaScript": [
    "Introducción a la programación: ¿Qué es el código, la computadora y cómo se ejecutan las instrucciones?",
    "Introducción a JavaScript: Historia, el motor V8, qué es JS y su rol en el navegador",
    "Configuración del entorno: Navegador, Chrome DevTools y tu primer console.log()",
    "Hola Mundo en JavaScript: Creación de scripts, sintaxis básica, comentarios y bloques",
    "Variables en JavaScript: Concepto de caja de almacenamiento y declaración básica",
    "Tipos de datos primitivos I: Números y cadenas de texto (Strings) en detalle",
    "Tipos de datos primitivos II: Booleanos, Undefined y Null",
    "Operadores aritméticos simples: Sumar, restar, multiplicar, dividir y residuo",
    "Operadores de comparación básicos: Igualdad, desigualdad, mayor y menor que",
    "Operadores lógicos elementales: AND, OR y NOT en decisiones cotidianas",
    "Estructuras condicionales I: Sentencia if para tomar decisiones simples",
    "Estructuras condicionales II: Sentencias else y else if para caminos múltiples",
    "Estructuras condicionales III: La sentencia switch para opciones predefinidas",
    "Ciclos y bucles simples I: El ciclo while y la repetición controlada",
    "Ciclos y bucles simples II: El ciclo for clásico y conteos numéricos",
    "Funciones básicas I: ¿Qué es una función? Declaración e invocación básica",
    "Funciones básicas II: Parámetros y argumentos sencillos en funciones",
    "Funciones básicas III: Retorno de valores con return",
    "Introducción a objetos básicos: Creación de objetos literales simples y propiedades",
    "Introducción a arrays básicos: Creación de listas simples y acceso por índice",
    "Variables y Ciclo de Vida: Ámbitos (Scope: Global, Function, Block, Module), Contexto de Ejecución, Lexical Environment y Temporal Dead Zone",
    "Motor V8 e Hilos: Call Stack, Memory Heap, Garbage Collector, y Mecanismos de Optimización JIT",
    "Coerción de Tipos en Detalle: Conversiones Explícitas e Implícitas, Algoritmo Abstract Equality y Comparadores",
    "Closures en Profundidad: Concepto, Casos de uso de Fábricas de Funciones, Datos Privados y Gestión de Fugas de Memoria",
    "Funciones en JavaScript: Declarations vs Expressions, Arrow Functions, Parámetros por Defecto, Rest y Destructuring avanzado",
    "Contexto y Enlace (This): Enlace por Defecto, Implícito, Explícito (call, apply, bind) y Enlace New",
    "Programación Funcional Fundacional: Funciones Puras, Inmutabilidad, Composición de Funciones y Currying",
    "Métodos Avanzados de Arrays: Map, Filter, Reduce, FlatMap, Some, Every y su Optimización de Rendimiento",
    "Asincronía Core: Event Loop, Microtask Queue (Promises, queueMicrotask) y Macrotask Queue (setTimeout, I/O)",
    "Promesas Avanzadas: Ciclo de Vida, Métodos Estáticos (Promise.all, allSettled, race, any) e Implementaciones Personalizadas",
    "Async/Await en Profundidad: Sintaxis, Manejo Complejo de Errores con Try-Catch, Concurrencia Asíncrona y Flujos Paralelos",
    "Iteradores y Generadores: El Protocolo Iterador, Generadores Síncronos y Asíncronos (yield, yield*, async generator)",
    "Programación Orientada a Objetos: Prototipos (prototype, __proto__), Herencia Prototípica y Cadena de Prototipos",
    "Clases en JS Moderno: Sintaxis de Clase, Constructores, Campos Privados (#), Getters/Setters, Herencia y Static Members",
    "Patrones de Diseño Modernos en JS: Singleton, Factory, Module, Observer, Mediator y Decorator",
    "Manipulación del DOM y APIs del Navegador: Estructura DOM, Virtual DOM vs Real DOM, Event Bubbling, Event Capturing y Event Delegation",
    "Optimización del DOM y Renderizado: Repaint y Reflow, DocumentFragments, requestAnimationFrame, requestIdleCallback",
    "Fetch API y Protocolos HTTP: Cabeceras, CORS (Preflight, Simple Requests), AbortController, Autenticación y Streams",
    "Web Storage y Persistencia: Cookies (Secure, HttpOnly, SameSite), LocalStorage, SessionStorage e IndexedDB",
    "Módulos Modernos: ESM (import/export) vs CommonJS (require/module.exports), Módulos Dinámicos y Tree Shaking",
    "Web APIs Avanzadas I: WebSockets para comunicación bidireccional y Servidores de Eventos Enviados por el Servidor (SSE)",
    "Web APIs Avanzadas II: Service Workers (Caché, Offline support) y Push Notifications",
    "Procesamiento en Segundo Plano: Web Workers, Shared Workers e Intercambio de Mensajes Estructurados (Structured Clone Algorithm)",
    "API Web Avanzada III: MutationObserver, IntersectionObserver, ResizeObserver y PerformanceObserver",
    "Introducción a TypeScript: Tipos Básicos, Tipos de Unión/Intersección, Interfaces, Aliases y Compilación Básica",
    "TypeScript Avanzado: Genéricos (Generics), Clases Genéricas, Utility Types (Partial, Required, Readonly, Record, Pick, Omit)",
    "TypeScript Avanzado II: Type Guards Personalizados, Mapped Types, Conditional Types y Template Literal Types",
    "Pruebas Unitarias Robustas: Configuración de Entornos de Test con Jest o Vitest, Cobertura, Asserts y Mocks",
    "Pruebas de Integración y Mocks Avanzados: Modificar llamadas externas, spyOn, y simulación de timers y retardos",
    "Optimización de Performance en JS: Memory Leaks, Perfiles en Chrome DevTools, Debounce, Throttle y Profiling de CPU",
    "Formularios y FormData API en JS Puro: Eventos de formulario, FormData API, validación de restricciones HTML5 y patrones de expresión regular",
    "Gestión de Estado y UI Reactiva en Formularios: Manejo de errores visuales en tiempo real, deshabilitación de envíos concurrentes y experiencia de usuario optimista (Optimistic UI)",
    "Geolocalización en Frontend: API de Geolocation de HTML5, renderizado de coordenadas GPS y cálculo de distancias básicas",
    "Procesamiento de Archivos de Texto en Cliente: Generación dinámica y descarga de archivos de texto plano, CSV y formateo básico",
    "Procesamiento de Archivos Binarios en Cliente: Generación de hojas de cálculo (Excel) y PDF interactivos directamente desde JS",
    "Ciclo de Notificaciones Toast: Creación de componentes web autogestionados de notificaciones toast visuales y dinámicas",
    "Diseño de Interfaces Limpias y Espacios: Cálculo dinámico de paddings, margins y proporciones tipográficas con variables CSS controladas por JS",
    "Prevención de Fugas de Memoria en Formularios: Event Listeners activos, remoción en la desconexión del DOM y limpieza de referencias circulares",
    "Sanitización de Datos en Entrada: Prevención de inyecciones de código y ataques XSS mediante limpieza de inputs del usuario",
    "Arquitectura de Aplicación Frontend: Separación lógica-presentación en aplicaciones sin frameworks usando módulos estructurados",
    "Patrones de Creación Avanzados: Builder, Prototype y Singleton distribuidos para componentes reutilizables",
    "Manejo Avanzado de Errores Asíncronos: Gestión centralizada, reintentos dinámicos en peticiones y fallback visual",
    "Optimización de Renderizado en Listas: Renderizado perezoso (Lazy Loading) de elementos DOM pesados sin librerías externas",
    "Manejo de Ciclos de Vida en Componentes Custom: Ciclo de vida completo usando Custom Elements nativos",
    "Seguridad y Secretos en Frontend: Almacenamiento seguro de tokens de sesión, cookies seguras y cabeceras CSP",
    "IndexedDB Avanzado: Gestión transaccional y consultas de almacenamiento local complejo",
    "Service Workers y PWA Fundamentos: Instalación, activación y ciclo de vida para soporte offline básico",
    "Performance Profiling en Chrome: Análisis detallado de CPU, hilos de ejecución y optimización del hilo de UI",
    "TypeScript Avanzado III: Decoradores, metadatos y tipado estricto en patrones de diseño",
    "Testing Unitario Avanzado: Pruebas unitarias de manipulación del DOM y eventos de interacción del usuario",
    "Desarrollo Integral de un CRUD con Bases de Datos en la Nube: Operaciones asíncronas de inserción, actualización, eliminación y lectura",
    "Geolocalización y Mapas Interactivos: Integración de mapas dinámicos usando la API de Leaflet o Mapbox y coordenadas en tiempo real",
    "Exportación de Reportes Empresariales: Generación de reportes detallados en formatos Excel (exceljs) y Word estructurados dinámicamente",
    "Creación de Dashboards Estadísticos: Cálculo de métricas agregadas y resúmenes estadísticos en memoria sobre arrays complejos",
    "Visualización de Datos Gráficos: Renderizado dinámico de gráficos estadísticos (barras, líneas, áreas) utilizando SVG manipulado por JS",
    "Notificaciones Push e In-App: Configuración del ciclo completo de notificaciones para comunicación proactiva al usuario",
    "Autenticación Avanzada en CRUDs: Restricciones de operaciones de inserción y modificación de datos según el rol del usuario",
    "Sincronización Offline-Online: Persistencia temporal en IndexedDB y sincronización automática al recuperar la conectividad de red",
    "Limpieza y Mantenimiento de Datos: Algoritmos de eliminación de duplicados, corrección de registros huérfanos y formateo de datos en cliente",
    "Pruebas de Integración de Extremo a Extremo (E2E): Validación del ciclo completo del CRUD y mapas usando herramientas automatizadas",
    "Integración de APIs de IA en JS: Consumo estructurado de modelos de lenguaje (OpenAI/Groq), prompts específicos y manejo de respuestas JSON",
    "Orquestación de Chatbots Conversacionales: Flujo dinámico de mensajes, control del contexto del chatbot y renderizado en streaming",
    "Generación Sintética de Datos con IA: Scripts avanzados de generación automatizada de inventarios y datos estadísticos de prueba mediante LLMs",
    "Integración con Apps de Mensajería: Automatización de envío de alertas a WhatsApp (Twilio API) y Telegram Bots en tiempo real",
    "Inyección de Dependencias Avanzada: Patrones de desacoplamiento de servicios y conectores API externos (Dependency Injection)",
    "Colas de Trabajo y Mensajería Local: Procesamiento por lotes en segundo plano de peticiones de correo y exportación mediante streams",
    "Arquitectura en Capas en Frontend: Separación estricta de controladores, servicios de datos, adaptadores de red y componentes visuales",
    "Optimización Extrema de Bundles y Carga: Tree shaking avanzado, imports dinámicos en caliente, carga asíncrona y optimización de Web Vitals",
    "Internacionalización (i18n) en JS Puro: Gestión de diccionarios multiidioma, traducción en caliente y formateo regionalizado de monedas y fechas",
    "Accesibilidad (A11y) Dinámica: Roles ARIA, navegación accesible y control por voz básico de la interfaz",
    "Agentes de IA Autónomos en JS: Implementación de function calling y tool usage para toma de decisiones dinámicas basadas en la intención del usuario",
    "IA asíncrona de fondo en cliente: Integración de modelos predictivos y enriquecimiento de datos sintéticos sin bloquear el renderizado",
    "Procesamiento en Segundo Plano de Modelos: Ejecución local de modelos ONNX Runtime o Transformers.js en hilos Web Workers",
    "Mapas e Interfaces de Alto Rendimiento en WebGL: Renderizado fluido de millones de coordenadas GPS en capas interactivas con Deck.gl",
    "Criptografía y Firmas Digitales en Navegador: Encriptación asimétrica/simétrica con Web Crypto API y firma digital de reportes exportados",
    "Algoritmos de Optimización de Rutas y Redes: Resolución del problema del viajante (TSP) en el navegador para rutas logísticas GPS",
    "Virtualización de Listas y DOM Masivo: Renderizado eficiente de millones de registros de stock en tablas y rejillas visuales",
    "Seguridad Crítica contra Ingeniería Inversa: Ofuscación avanzada de código, protección de secretos y sanitización de llamadas de red",
    "Sistemas de Tolerancia a Fallos en Cliente: Reintentos con retroceso exponencial, cortacircuitos (Circuit Breakers) y almacenamiento en caliente",
    "Orquestación de Procesos Complejos: Flujos de automatización integrados con semáforos lógicos y control estricto de concurrencia de red"
  ],
  "Python": [
    "Introducción a la computación con Python: Origen, filosofía Zen y su utilidad actual",
    "Instalación de Python y configuración del IDE: VS Code, terminal y ejecución de scripts (.py)",
    "Tu primer Hola Mundo en Python: La función print() y sintaxis limpia básica",
    "Variables en Python: Creación de variables, asignación dinámica y nombres válidos",
    "Tipos de datos básicos I: Cadenas de texto (str) y conversión con str()",
    "Tipos de datos básicos II: Enteros (int) y flotantes (float)",
    "Entrada de datos básica: Captura con input() y conversión de tipos",
    "Operadores aritméticos elementales: Operaciones matemáticas y división entera (//, %)",
    "Operadores de comparación: Evaluaciones de igualdad, diferencia y magnitud",
    "Operadores lógicos en Python: and, or y not",
    "Condicionales I: Estructura if para decisiones básicas en Python",
    "Condicionales II: Estructura else y elif en Python",
    "Bucles condicionales: El ciclo while en Python y bucles infinitos",
    "Bucles definidos: El ciclo for en Python y la función range()",
    "Control de ciclos: Declaraciones break y continue básicas",
    "Funciones en Python I: Definición de funciones básicas con def e invocación",
    "Funciones en Python II: Argumentos posicionales básicos y por defecto",
    "Funciones en Python III: Retorno de valores con return y múltiples retornos",
    "Estructuras de datos básicas I: Listas de Python, creación y acceso por índice",
    "Estructuras de datos básicas II: Diccionarios de Python (clave-valor) y accesos básicos",
    "Fundamentos e Historia: Filosofía de Python, Zen de Python, y diferencias entre CPython, Jython, PyPy e IronPython",
    "Variables, Tipos Dinámicos y Sistema de Memoria: Identidad (id), Tipo (type), Mutabilidad vs Inmutabilidad y Contador de Referencias",
    "Estructuras de Datos Nativas: Listas, Tuplas, Sets, Diccionarios, y optimizaciones internas (Hashing, Dict Resize)",
    "Colecciones Avanzadas: Módulo collections (namedtuple, deque, Counter, defaultdict, OrderedDict)",
    "Comprensión de Estructuras (Comprehensions): List, Dict, Set y Generator Expressions de Alta Velocidad",
    "Protocolo Iterador e Iteradores: Iteración Personalizada, Función next(), e Iterables customizados",
    "Generadores y Corrutinas: Generación Perezosa (Lazy Evaluation), Yield, Yield From, y Co-rutinas básicas",
    "Funciones en Python: Argumentos posicionales, nombrados, /, *, *args, **kwargs, ámbito LEGB, y closures",
    "Programación Funcional: Librerías itertools, functools (partial, lru_cache, wraps, reduce) y lambdas",
    "Programación Orientada a Objetos I: Clases, Instancias, Métodos de Instancia, Clase (@classmethod) y Estáticos (@staticmethod)",
    "POO II: Encapsulación, Herencia Simple y Múltiple, Orden de Resolución de Métodos (MRO) y Algoritmo C3 Linearization",
    "Métodos Mágicos (Dunder Methods): Personalización de Comportamiento (__init__, __str__, __repr__, __eq__, __len__, __call__)",
    "Metaprogramación I: Creación de Decoradores de Funciones, Decoradores con Parámetros y Decoradores de Clases",
    "Metaprogramación II: Descriptores de Acceso a Propiedades (__get__, __set__, __delete__), Propiedades (@property) y Metaclases",
    "Manejo del Sistema de Archivos: Context Managers, buffers de archivo y uso avanzado de pathlib",
    "Gestión de Excepciones: Try/Except/Else/Finally, jerarquía de excepciones y creación de excepciones personalizadas de nivel producción",
    "Concurrencia y Paralelismo I: El bloqueo global del intérprete (GIL), sus limitaciones y soluciones",
    "Concurrencia II: Módulo threading, condiciones de carrera, exclusión mutua (Lock) y semáforos",
    "Paralelismo III: Módulo multiprocessing, comunicación entre procesos (Pipes, Queues) y memoria compartida",
    "Programación Asíncrona I: Filosofía de Asyncio, Event Loop, Corrutinas y ejecución concurrente de Tareas",
    "Asincronía II: Async Context Managers, Async Generators y control de concurrencia avanzada en Asyncio",
    "Tipado Estático en Python: Type Hints, configuración de Mypy, y uso avanzado de la librería typing (Union, Optional, Generic, Protocol)",
    "Conexión a Base de Datos I: Consultas SQL parametrizadas a bases de datos relacionales usando drivers nativos (psycopg2, sqlite3)",
    "Conexión a Base de Datos II: ORM SQLAlchemy, mapeo declarativo, relaciones y optimización de consultas (Eager vs Lazy Loading)",
    "Migración de Base de Datos: Alembic, control de versiones de bases de datos, generación automática y aplicación de migraciones",
    "APIs REST Rápidas: FastAPI, ruteo dinámico, validación estricta de DTOs con Pydantic y manejo de CORS",
    "Seguridad en APIs: Autenticación OAuth2 con JWT, Hashing de Contraseñas (bcrypt) y control de accesos basados en roles",
    "Automatización y Web Scraping: BeautifulSoup, requests, control automatizado de navegadores con Playwright o Selenium",
    "Pruebas Unitarias Robustas: Pytest, inyección de dependencias mediante Fixtures, parametrización de tests y uso de Mocks",
    "Despliegue y Distribución: Creación de entornos virtuales (venv, poetry), Dockerización de aplicaciones de Python y buenas prácticas de PEP 8",
    "Exportación de Archivos Corporativos: Generación de reportes detallados en Excel (openpyxl) y Word (python-docx)",
    "Geocodificación y Geolocalización: Uso de geopy y cálculo de distancias geodésicas a partir de coordenadas",
    "Envío de Emails Transaccionales: Configuración de SMTP con smtplib, renderizado de plantillas HTML y envío de adjuntos",
    "Cálculo Estadístico y Agregación: Cálculos matemáticos y descriptivos avanzados sobre colecciones de inventario",
    "Validación Avanzada de Formularios: Validación estricta con Pydantic y manejo dinámico de errores de entrada",
    "Estructura de CRUD con Base de Datos Externa: Implementación limpia de operaciones CRUD en PostgreSQL",
    "Limpieza y Sanitización de Datos: Filtrado de datos corruptos, formateo de campos de texto y eliminación de huérfanos",
    "Optimización del Linter y Estilo: Formateo estricto del código bajo estándares PEP 8 usando Black e ISort",
    "Manejo de Excepciones del Servidor: Middleware de captura de excepciones en FastAPI y logging de errores",
    "Persistencia Local y Caché Ligero: Implementación de almacenamiento intermedio local usando diccionarios serializados",
    "Diseño de Base de Datos PostgreSQL: Estructura relacional óptima, claves y restricciones de integridad",
    "Triggers en PostgreSQL con Python: Automatización de auditoría y cálculo de stock mediante triggers de base de datos",
    "Políticas de Seguridad en Base de Datos: Seguridad RLS (Row Level Security) e integración con roles de backend",
    "Optimizaciones de Consultas de Base de Datos: Indexación, uso de índices GIN/GiST y análisis de planes de ejecución",
    "Conexión Segura con Supabase: Cliente Supabase-py, consultas directas e integración con APIs de FastAPI",
    "Manejo de Tipos Complejos en BD: Almacenamiento e indexación de tipos JSONB para datos semiestructurados",
    "Webhooks de Base de Datos: Configuración de webhooks para enviar actualizaciones de la base de datos a servicios externos",
    "Manejo de Conexiones de Base de Datos: Configuración del pool de conexiones para alta disponibilidad y concurrencia",
    "Migraciones de BD en Caliente: Estrategias de actualización de esquemas sin caída del servicio",
    "Pruebas de Integración con Base de Datos: Uso de bases de datos temporales (test containers) para validación de lógica",
    "Desarrollo de CRUD Empresarial Multitenant: Aislamiento completo de datos por organización en base de datos externa",
    "Geolocalización en Backend con PostGIS: Almacenamiento y consulta de coordenadas GPS utilizando extensiones espaciales",
    "Procesamiento por Streams de Reportes: Generación y exportación de archivos pesados utilizando flujos de datos optimizados en memoria",
    "Dashboards Estadísticos Avanzados: Implementación de endpoints de agregación rápida para gráficos e inventario",
    "Sistemas de Alertas Automatizadas: Envío de correos automáticos ante eventos críticos del negocio",
    "Colas de Notificaciones Asíncronas: Procesamiento diferido de correos utilizando colas de trabajo simples",
    "Control de Acceso en Formularios de Backend: Autorización estricta por rol de usuario en inserción y actualización",
    "Sincronización de Datos offline: Cola de reintentos para operaciones de red fallidas y persistencia local",
    "Auditoría y Mantenimiento de Esquemas: Triggers automáticos que registran las modificaciones de tablas",
    "Pruebas del CRUD y Reportes: Pruebas unitarias integrales de controladores, servicios de datos y lógica de reportes",
    "Integración de APIs de IA en Python: Integración estructurada con modelos de Groq/OpenAI y control de salida en JSON",
    "Orquestación de Chatbots e Historial: Manejo de contextos extensos de conversación y almacenamiento estructurado de chats",
    "Generación de Datos con IA: Scripts avanzados de simulación de inventarios y datos realistas usando LLMs",
    "Integración con Mensajería Externa: Automatización de envío de notificaciones mediante WhatsApp API (Twilio) y Telegram Bots",
    "Inyección de Dependencias y Arquitectura Hexagonal: Desacoplamiento de conectores externos mediante patrones avanzados de DI",
    "Colas de Trabajo Celery y Redis: Configuración de procesamiento asíncrono robusto en segundo plano",
    "Arquitectura Limpia en FastAPI: Separación estricta de routers, lógica de dominio, persistencia de datos y adaptadores",
    "Optimización de Rendimiento en Backend: Análisis de cuellos de botella de CPU, optimizaciones de memoria y profiling",
    "Seguridad y Secretos en Python: Manejo seguro de variables de entorno y encriptación de credenciales",
    "Logging Avanzado: Logging estructurado en producción con JSON para agregadores centralizados (ELK)",
    "Agentes de IA Autónomos y Multi-Agentes: Orquestación compleja de agentes usando CrewAI o LangChain con uso de herramientas",
    "IA de Fondo asíncrona: Tareas en segundo plano para categorización y enriquecimiento de stock de inventario mediante IA",
    "Procesamiento Local de Modelos de IA: Integración de inferencia local usando ONNX Runtime o Transformers en backend",
    "Procesamiento GIS Geoespacial Avanzado: Análisis geoespacial masivo de coordenadas GPS con GeoPandas",
    "Optimización de CPU con Extensiones C: Compilación JIT con Numba e interoperabilidad de bajo nivel",
    "Criptografía y Firmas Digitales en Python: Cifrado asimétrico robusto y firmado de archivos Word/Excel exportados",
    "Sistemas Tolerantes a Fallos y Circuit Breakers: Integración de resiliencia ante caídas de bases de datos externas",
    "Pruebas de Carga y Concurrencia de APIs: Simulación de alta concurrencia mediante herramientas de benchmarking",
    "Orquestación Serverless: Configuración de lógica backend en funciones serverless y Edge Functions",
    "Automatización Extrema de Infraestructura (IaC): Definición y aprovisionamiento automático de recursos de base de datos"
  ],
  "Java": [
    "Introducción a Java: Qué es la JVM, el JRE y el JDK y cómo funciona la compilación",
    "Instalación del JDK y configuración de Apache NetBeans, VS Code y el entorno de terminal",
    "Primer Hola Mundo en Java: Estructura de la clase principal, main y System.out.println",
    "Variables y constantes en Java: Declaración, inicialización y el uso de final",
    "Tipos de datos primitivos I: byte, short, int, long para enteros",
    "Tipos de datos primitivos II: float, double, char y boolean",
    "Cadenas de texto básicas: La clase String y métodos elementales de concatenación",
    "Operadores aritméticos en Java: Sumas, restas, divisiones y residuos",
    "Entrada de datos por consola: Introducción básica a la clase Scanner",
    "Operadores condicionales y de comparación: ==, !=, <, >, <=, >=",
    "Estructuras condicionales I: Sentencias if, else if y else en Java",
    "Estructuras condicionales II: La sentencia switch clásica para menús",
    "Bucles repetitivos I: El ciclo while y do-while controlados por centinelas",
    "Bucles repetitivos II: El ciclo for clásico para iteraciones determinadas",
    "Funciones y métodos estáticos I: Definición de métodos simples sin retorno (void)",
    "Funciones y métodos estáticos II: Parámetros simples y retorno de tipos primitivos",
    "Introducción a arreglos unidimensionales: Declaración, tamaño y acceso de arrays simples",
    "Introducción a la Programación Orientada a Objetos Básica en NetBeans: Clases, instancias y depuración visual",
    "Atributos y métodos de clase: Definición de variables de instancia y comportamiento",
    "Constructores básicos: Inicialización de objetos y el uso de new",
    "Arquitectura de Java: La Máquina Virtual de Java (JVM), Compilador (javac), Java Runtime Environment (JRE) y Java Development Kit (JDK)",
    "Sistema de Tipos de Java: Tipos Primitivos, Tipos de Referencia, Autoboxing/Unboxing y Promoción de Tipos",
    "Fundamentos de POO en Java: Clases, Objetos, Encapsulamiento, Herencia, Polimorfismo y Abstracción",
    "Diseño Orientado a Interfaces: Interfaces, Interfaces Funcionales, Métodos por Defecto (default) y Estáticos",
    "Clases Abstractas vs Interfaces, Clases Internas (Inner), Clases Anidadas Estáticas y Clases Anónimas",
    "Java Moderno I: Registros (Records), Clases Selladas (Sealed Classes/Interfaces) y Pattern Matching para Switch e InstanceOf",
    "Gestión de Memoria en Java: El Garbage Collector (G1, ZGC), Stack vs Heap, y fugas de memoria por referencias obsoletas",
    "Estructuras de Datos (Collections Framework): List, ArrayList, LinkedList, Set, HashSet, TreeSet, Map, HashMap, TreeMap y Queue",
    "Programación Genérica (Generics): Tipos Genéricos, Borrado de Tipos (Type Erasure), Comodines (Wildcards) y Restricciones",
    "Comparación y Clasificación: Implementación de Comparable, Comparator, y algoritmos de búsqueda y ordenación interna",
    "Programación Funcional en Java: Lambdas, Interfaces Funcionales Nativas (Predicate, Consumer, Function, Supplier)",
    "Procesamiento de Flujos de Datos: API de Streams, Operaciones Intermedias (filter, map, flatMap) y Terminales (collect, reduce)",
    "Manipulación Eficiente de Valores Nulos: Clase Optional, mejores prácticas y prevención de NullPointerException",
    "Gestión de Excepciones: Checked vs Unchecked Exceptions, Bloque Try-Catch-Finally, Try-with-resources y excepciones customizadas",
    "Entrada/Salida Tradicional (I/O): Flujos de Bytes (InputStream/OutputStream), Flujos de Caracteres (Reader/Writer) y Serialización",
    "Entrada/Salida Moderna (NIO.2): Path, Files, Buffers, Channels, WatchService y manipulación asíncrona de archivos",
    "Concurrencia Básica: Creación de Hilos (Thread, Runnable), Ciclo de Vida del Hilo, Sincronización y monitores de bloqueo",
    "Concurrencia Intermedia: Evitar condiciones de carrera, variables volátiles, bloques synchronized y API de Locks (ReentrantLock)",
    "Concurrencia Avanzada: Colecciones Concurrentes (ConcurrentHashMap, CopyOnWriteArrayList) y variables atómicas (AtomicInteger)",
    "Coordinación y Sincronizadores: CountDownLatch, CyclicBarrier, Semaphore y variables de condición",
    "Framework de Ejecutores: ExecutorService, ThreadPools personalizados, Future, Callable e Hilos Virtuales (Project Loom)",
    "Programación Asíncrona Reactiva: CompletableFuture, encadenamiento de tareas, y manejo asíncrono de excepciones",
    "Desarrollo de Interfaces Gráficas (GUI): Diseño visual de formularios de escritorio Swing con el GUI Builder de NetBeans",
    "Conexión a Base de Datos con JDBC: DriverManager, Connection, PreparedStatement, Pools de Conexión y Patrón DAO",
    "Mapeo Objeto-Relacional (ORM): JPA API, Hibernate ORM, mapeo de entidades, relaciones (OneToOne, OneToMany, ManyToMany)",
    "JPA Avanzado: Gestión del Contexto de Persistencia, ciclos de vida de entidades, consultas JPQL, Criteria API e inyecciones SQL",
    "Spring Boot Core: Inyección de Dependencias, Contenedor IoC (Inversion of Control), Beans de Spring y anotaciones clave",
    "Desarrollo de Microservicios Backend: Spring Boot Web MVC, controladores REST, DTOs y validación de datos con Jakarta Validation",
    "Seguridad en Spring Boot: Fundamentos de Spring Security, filtros de seguridad, encriptación y autenticación JWT",
    "Pruebas en Java Enterprise: JUnit 5, pruebas unitarias integradas, Mockito para mocking de dependencias y pruebas de integración con @SpringBootTest",
    "Exportación y Reportería Corporativa: Generación de hojas de cálculo de Excel y archivos de Word usando Apache POI",
    "Servicios de Localización y GPS: Parsing de formatos GPX, cálculo de distancias y algoritmos espaciales con coordenadas",
    "Envío de Correos Transaccionales: Integración de Spring Mail, diseño de plantillas HTML y colas básicas de envío",
    "Programación Orientada a Estadísticas: Algoritmos de optimización de stock de inventario y cálculo de métricas agregadas",
    "Arquitectura de Formularios y Validación: Jakarta Bean Validation (Hibernate Validator) y DTOs estructurados",
    "Aplicación CRUD con Base de Datos Externa: MVC en capas (Controller, Service, Repository) y manejo seguro de transacciones",
    "Refactorización Estructural: Aplicación de principios SOLID y refactorización de código legado (Code Smells)",
    "Sincronización Offline en Java: Mecanismos de persistencia local temporal para operaciones CRUD fallidas",
    "Limpieza y Mantenimiento de Datos: Algoritmos eficientes de validación y limpieza de campos huérfanos",
    "Pruebas Unitarias de Servicios de Datos: Mockito avanzado y aserciones de flujos transaccionales",
    "Diseño de Esquemas Relacionales en Java: Mapeo avanzado de entidades complejas y llaves compuestas en JPA",
    "Triggers y Procedimientos en Java: Invocación de procedimientos de base de datos desde JPA y Spring Data",
    "Políticas de Seguridad en Base de Datos: Gestión de roles y esquemas de base de datos integrados con Spring Security",
    "Optimización de JPA e Hibernate: Caching de nivel 2, optimización de consultas N+1 y planes de ejecución SQL",
    "Conexión con Supabase y Postgres: Configuración de la persistencia de datos JDBC hacia Supabase en la nube",
    "Persistencia de Datos Semi-Estructurados: Mapeo de columnas JSONB en PostgreSQL usando JPA e Hibernate",
    "Webhooks y Eventos de Base de Datos: Configuración de listeners de cambios de base de datos en Spring Boot",
    "Gestión del Pools de Conexión: Ajuste del pool HikariCP para alta disponibilidad de base de datos",
    "Migraciones de BD Zero-Downtime: Estrategias de versionamiento de base de datos usando Flyway o Liquibase",
    "Pruebas de Integración de BD: Configuración de bases de datos embebidas o Testcontainers en pruebas unitarias",
    "Desarrollo de CRUD Empresarial Multitenant: Aislamiento completo de base de datos por tenant usando JPA dinámico",
    "Servicios Geoespacial con PostGIS: Almacenamiento e indexación de coordenadas GPS en PostgreSQL",
    "Exportación de Reportes Masivos: Procesamiento en streaming para la generación de archivos Excel pesados",
    "Dashboards Estadísticos Avanzados: Endpoints de alto rendimiento para cálculo de métricas agregadas de negocio",
    "Envío de Notificaciones Transaccionales Masivas: Colas básicas de reintentos asíncronos de correo",
    "Ciclo de Notificaciones Push In-App: Integración de servicios push de notificaciones en el backend Java",
    "Seguridad y Roles en Formularios: Anotaciones @PreAuthorize y validaciones dinámicas basadas en JWT",
    "Sincronización en Segundo Plano: Tareas programadas (@Scheduled) para sincronización con servicios externos",
    "Auditoría Automática de Entidades: Uso de Spring Data JPA Auditing para registrar la creación y modificación",
    "Pruebas de Extremo a Extremo (E2E) de la API: Pruebas unitarias de controladores y flujos de datos integrados",
    "Integración de Spring AI: Conexión estructurada con modelos de lenguaje (OpenAI/Groq) y parsing de respuestas",
    "Chatbots Empresariales con Estado: Almacenamiento estructurado del historial de chat y recuperación de contexto",
    "Generación y Simulación de Datos con IA: Pipelines de simulación de stock y transacciones para testing",
    "Integración con Mensajería Externa: Conectores a la API de WhatsApp y notificaciones a Slack a través de Webhooks",
    "Inyección de Dependencias Avanzada: Scopes de Beans, inicialización condicional y modularidad en Spring Boot",
    "Sistemas de Mensajería Kafka/RabbitMQ: Configuración de colas distribuidas para encolar notificaciones asíncronas",
    "Arquitectura Limpia en Spring Boot: Estructuración del proyecto en capas desacopladas e interfaces",
    "Optimización de la JVM: Análisis de volcados de memoria (Heap Dumps) y optimización de JIT Compiler",
    "Seguridad Avanzada en Java: Firma de documentos XMLDSig y encriptación simétrica robusta",
    "Logging Centralizado: Configuración de Logback y Morgan con salida formateada para agregadores de logs",
    "Agentes de IA Autónomos y LangChain4j: Configuración de agentes de IA con function calling y herramientas locales",
    "IA de Fondo en Servidor: Tareas en segundo plano para enriquecimiento e IA predictiva usando TensorFlow Java",
    "Procesamiento en streaming de XML/JSON de Gigabytes: Parsers StAX y Jackson Streaming para optimización de memoria",
    "Algoritmos de Búsqueda Geoespacial: Estructuras R-Tree en memoria para consultas de proximidad GPS rápidas",
    "Ajuste fino de Garbage Collection: Optimización de tiempos de pausa y uso de memoria en ZGC/G1GC en producción",
    "Tolerancia a Fallos y Circuit Breaker: Resilience4j para políticas de reintento, rate limiting y cortacircuitos",
    "Sistemas Distribuidos y Saga Pattern: Coordinación de transacciones distribuidas y consistencia eventual",
    "GraalVM y Compilación Nativa: Compilación a binario nativo en Java para inicio rápido y mínimo uso de memoria",
    "Auditoría y Trazabilidad Forense: Trazabilidad de peticiones distribuidas (Sleuth/Zipkin) en microservicios",
    "Orquestación de Infraestructura y Despliegues: CI/CD multirregión y monitorización de Kubernetes con Grafana"
  ],
  "React": [
    "Introducción al desarrollo SPA: Concepto de React, historia y arquitectura orientada a componentes",
    "Configuración del entorno: Node.js, npm, npx y creación de apps con Vite",
    "Estructura de un proyecto React creado con Vite: src, public, index.html y main.jsx",
    "Introducción a JSX: Sintaxis de marcado mixta, incrustar variables y expresiones de JS",
    "Tu primer componente en React: Declaración de componentes de función simples",
    "Estilos básicos en React: Clases CSS (className) y estilos en línea (style={})",
    "Props de React I: Pasar datos a componentes hijos de forma unidireccional",
    "Props de React II: Acceder y desestructurar props simples",
    "Renderizado condicional básico: Operadores lógicos (&&) y ternarios simples en JSX",
    "Renderizado de listas básico: Uso del método map para iterar y mostrar arrays de datos",
    "La propiedad key en listas: Por qué es obligatoria y cómo React optimiza el renderizado",
    "Manejo de eventos básicos: Atributo onClick, onChange y declaración de funciones manejadoras",
    "Introducción al estado (State): ¿Qué es la reactividad y por qué las variables de JS normales no actualizan la UI?",
    "El hook useState I: Sintaxis básica, inicialización y lectura del estado",
    "El hook useState II: Actualización de estado simple y mutabilidad",
    "Formularios controlados básicos: Enlace de inputs con variables de estado en React",
    "Composición de componentes básica: Crear componentes pequeños y anidarlos",
    "Introducción a los Hooks: Reglas básicas de los hooks y nomenclatura",
    "El Hook useEffect básico: Ejecución de código secundario tras el montaje (array de dependencias vacío)",
    "Limpieza y Desmontaje en useEffect: Retorno de funciones de limpieza elementales",
    "Anatomía y Arquitectura: El Compilador de JSX/TSX, React Elements vs Componentes, Reconciliación y Algoritmo Fiber",
    "Ciclo de Vida en Componentes Funcionales: Fases de Renderizado y Commit, Re-renders y el papel de la Key en listas",
    "Estado Local Avanzado: Hooks useState y useRef, persistencia de variables mutables, y actualización asíncrona de estados",
    "Efectos Secundarios (useEffect): Ciclo de vida asíncrono, dependencias estrictas, limpieza de eventos y timers",
    "Optimización de Render: useMemo, useCallback, React.memo y técnicas de profiling en React DevTools",
    "Estado Complejo Estructurado: Hook useReducer, estructuración de acciones y despachos de estado predecibles",
    "Context API: Inyección de Estado Global, modularidad de proveedores, y mitigación de problemas de re-renderización excesiva",
    "Estado Global Avanzado: Zustand para estado global optimizado, inmutabilidad y selectores de rendimiento",
    "Custom Hooks: Abstracción de lógica de negocio, composición de hooks nativos y encapsulación",
    "Patrones de Diseño Avanzados: Compound Components, Render Props, HOCs (High-Order Components) y Portales",
    "Enrutamiento Dinámico: React Router v6, Lazy Loading de rutas, Suspense, Guards de seguridad y rutas anidadas (Outlets)",
    "Formularios de Producción I: Componentes controlados vs no controlados, manejo de estado e inputs complejos",
    "Formularios de Producción II: React Hook Form, rendimiento de entradas, registros y envío asíncrono",
    "Validación de Formularios Corporativos: Integración de Zod con React Hook Form para validaciones estrictas del lado del cliente",
    "Estilado en React: CSS Modules, Tailwind CSS, styled-components e HSL dinámicos",
    "Gestión de APIs y Datos Remotos: TanStack Query (React Query) para caché, reintentos automáticos, mutaciones e invalidación",
    "TanStack Query Avanzado: Optimistic Updates, Paginación, Infinite Scroll y Prefetching de Datos",
    "Server-Side Rendering (SSR) y Static Site Generation (SSG): Principios de renderizado híbrido y optimización SEO",
    "React Server Components (RSC): Server Components vs Client Components, arquitectura híbrida de Next.js App Router",
    "Server Actions en React: Envío directo de datos desde el cliente al servidor PostgreSQL sin endpoints API tradicionales",
    "Pruebas Unitarias de Componentes: Configuración de Vitest/Jest, renderizado y aserciones básicas",
    "Pruebas de Interfaz Avanzadas: React Testing Library, simulación de interacciones con user-event y mocks de hooks",
    "Mocking de APIs de Red: Configuración de MSW (Mock Service Worker) para interceptar peticiones de red en tests de integración",
    "Control de Errores Visuales: Componentes Error Boundary, fallback components elegantes y registro de excepciones",
    "APIs Concurrentes de React: useTransition y useDeferredValue para priorización de interfaces pesadas",
    "Referencias Cruzadas Avanzadas: forwardRef, useImperativeHandle y exposición controlada de APIs de componentes",
    "Ciclos de Vida Avanzados: useLayoutEffect, useInsertionEffect y sincronización con el DOM real",
    "Internacionalización (i18n): Localización de componentes, soporte multiidioma y formateo de fechas/monedas",
    "Accesibilidad (A11y) en React: Roles ARIA, navegación por teclado nativa y lectores de pantalla en componentes dinámicos",
    "Optimización de Rendimiento Extremo: Web Vitals, optimización de imágenes responsivas y profiling en producción",
    "Formularios Dinámicos con Validaciones Complejas: Formularios de múltiples pasos, inputs dinámicos en listas y validación con Zod",
    "Geolocalización en React: Integración de la API del navegador en hooks de React y visualización de mapas",
    "Exportación desde el Frontend: Implementación de descarga de reportes Excel (exceljs), PDF (jspdf) y texto directamente de la UI",
    "Estadísticas y Agregaciones Visuales: Renderizado de datos financieros e inventario estructurado en tablas dinámicas",
    "Diseño Visual Premium y Espacios: Configuración de variables HSL y transiciones fluidas de micro-interacciones",
    "CRUD Directo en Supabase desde React: Configuración del cliente Supabase, consultas directas e integración con hooks",
    "Limpieza y Mantenimiento de Estados: Remoción de fugas de memoria en hooks, listeners activos y timers",
    "Linter y Buenas Prácticas React: Configuración de ESLint y reglas específicas de hooks para código limpio",
    "Manejo de Estados de Carga Visuales: Skeletons adaptables y spinners integrados con transiciones fluidas",
    "Persistencia y offline en React: Persistencia del estado local de formularios y sincronización asíncrona",
    "Seguridad y RLS en Supabase desde React: Políticas RLS aplicadas a las operaciones de inserción y modificación de datos",
    "Autenticación en Frontend React: Flujos de sesión, login con proveedores OAuth y tokens JWT",
    "Integración con Almacenamiento en Nube: Carga de archivos a buckets de Supabase y obtención de URLs firmadas",
    "Suscripciones Realtime de Base de Datos: Escucha en caliente de inserciones y modificaciones en el frontend React",
    "Funciones en Servidor (Edge Functions) desde React: Invocación de funciones Deno para orquestación de datos",
    "Manejo de Errores de Base de Datos: Visualización elegante de restricciones e infracciones de políticas de base de datos",
    "Optimizaciones de Consultas de Base de Datos: Paginación en cliente y consultas filtradas por base de datos",
    "Manejo de Variables de Entorno en React: Configuración segura de secretos y variables de entorno de producción",
    "Pruebas Unitarias de Componentes con Supabase: Mocking del cliente Supabase en tests de integración",
    "Testing E2E de Flujos de Datos: Configuración de Playwright para validación completa del CRUD en React",
    "Desarrollo de CRUD Empresarial Completo: Implementación del CRUD dinámico integrado con base de datos en la nube",
    "Mapas interactivos con Leaflet: Renderizado de marcadores dinámicos GPS y trazado de rutas geográficas",
    "Exportación de Reportes Masivos desde la UI: Generación y combinación de archivos Excel/PDF en segundo plano",
    "Visualización Gráfica Interactiva: Renderizado de gráficos sofisticados de estadísticas y rendimiento con Recharts",
    "Ciclo de Notificaciones Toast Dinámicas: Notificaciones toast dinámicas integradas con estados de red y API",
    "Notificaciones Push en React: Service workers para notificaciones push en segundo plano",
    "Diseño UI Premium y Manejo de Espacios Avanzado: Layouts fluidos clamp() y esquemas oscuro/claro",
    "Sincronización Offline-Online de la App: Estado offline temporal y sincronización de fondo automática",
    "Mantenimiento de Esquemas de Estado: Migración segura del estado persistido localmente",
    "Pruebas Visuales de Regresión: Automatización de capturas de pantalla de la UI para evitar desviaciones visuales",
    "Integración de Chatbots e Interfaces de Conversación: Renders dinámicos de streams y widgets de chat flotantes",
    "Generación de Datos Dinámicos con IA: Sugerencias en formularios y autocompletado inteligente usando modelos de IA",
    "Gestión de Dependencias y Bundle Size: Análisis de bundles, optimización de importaciones y modularización",
    "Integración de APIs de Mensajería: Configuración de notificaciones directas a apps externas desde eventos de React",
    "Inyección de Dependencias y Abstracción: Patrones de desacoplamiento de conectores de servicios en hooks",
    "useTransition y useDeferredValue Avanzado: Priorización de la interfaz en cálculos interactivos complejos",
    "Microfrontends y Module Federation: Modularización de aplicaciones React grandes e interoperabilidad",
    "forwardRef y APIs Imperativas Complejas: Exposición controlada de interfaces de componentes reutilizables",
    "useLayoutEffect y DOM Síncrono: Ajustes geométricos de componentes y sincronización visual",
    "Accesibilidad Avanzada y Roles ARIA: Navegación de teclado completa y compatibilidad con lectores de pantalla",
    "Agentes de IA Interactivos en el Frontend: Interfaces dinámicas autogeneradas según las directrices del agente de IA",
    "Modelos de IA Locales en Navegador: Transformers.js y ONNX Runtime Web integrados en React con WebGPU",
    "Deck.gl y Mapas WebGL de Alto Rendimiento: Renderizado de millones de coordenadas GPS en capas interactivas",
    "Criptografía y Web Crypto API en React: Encriptación en el navegador y firmado digital de documentos",
    "Algoritmos de Optimización en React: Resolución de problemas de rutas y logística en mapas interactivos",
    "Progressive Web Apps (PWA) de Grado Empresarial: Sincronización en segundo plano y almacenamiento offline local",
    "Custom Renderers de React: Creación de un renderizador personalizado para interfaces gráficas interactivas no basadas en DOM",
    "Pruebas Visuales E2E a Gran Escala: Simulación de latencia de red y mocks globales en pipelines de CI/CD",
    "Automatización de Micro-Interacciones: Micro-animaciones HSL dinámicas controladas por JS y Web Animations API",
    "Arquitectura de UI Tolerante a Fallos: Gestión de caídas de servicios y recuperación asíncrona de datos en la UI"
  ],
  "Node.js": [
    "Introducción a Node.js: Qué es el entorno de ejecución Chrome V8 fuera del navegador y su arquitectura",
    "Instalación de Node.js y npm, y verificación de versiones por consola",
    "Ejecución de archivos JS locales: Uso del comando node y tu primer script en el servidor",
    "Gestión de paquetes con npm: npm init, creación del package.json y scripts de inicio",
    "Instalación de módulos de terceros: Dependencias normales y de desarrollo",
    "Sistema de módulos en Node.js I: Sintaxis CommonJS (require y module.exports)",
    "Sistema de módulos en Node.js II: Introducción a ES Modules (import y export)",
    "El objeto global process: Argumentos de línea de comandos (process.argv) y variables de entorno",
    "Módulo nativo Path: Resolución, unión y normalización de rutas de archivos",
    "Módulo nativo fs (File System) I: Lectura sincrónica y asincrónica de archivos",
    "Módulo nativo fs (File System) II: Escritura y modificación de archivos de texto",
    "Introducción al Event Loop en Node.js: Fases básicas y flujo de control asíncrono",
    "Módulo de eventos (EventEmitter): Emisión y escucha de eventos personalizados simples",
    "Introducción a la programación asíncrona en Node: Callbacks vs Promesas",
    "Servidor HTTP básico nativo: Uso del módulo http para responder texto simple",
    "Análisis de solicitudes HTTP: Lectura de métodos (GET, POST) y URLs en el servidor",
    "Introducción a los frameworks web: ¿Por qué usar Express vs código HTTP nativo?",
    "Tu primera app con Express: Instalación, servidor básico de hola mundo y puerto",
    "Manejo de rutas básicas en Express: Endpoints GET sencillos y respuestas JSON",
    "Parámetros de ruta y consulta: Acceso a req.params y req.query básicos",
    "Arquitectura de Node.js: El Motor V8, la biblioteca Libuv, el bucle de eventos (Event Loop) y las 6 fases del ciclo de ejecución",
    "Módulos en Node: CommonJS (require) vs ES Modules (import), interoperabilidad y ciclo de vida de resolución",
    "Módulos Core Básicos: API de path, os, url, util, y de sistema",
    "Programación Basada en Eventos: La clase EventEmitter en profundidad, prevención de memory leaks de listeners",
    "Buffers y Binarios: Manipulación de datos binarios, codificaciones de strings, asignación segura y allocUnsafe",
    "Sistema de Archivos Asíncrono: Módulo fs/promises, streams de lectura/escritura, y locking de archivos",
    "Streams en Node.js I: Readable y Writable Streams, control de contrapresión (backpressure) y buffers de flujo",
    "Streams en Node.js II: Duplex y Transform Streams, y canalización de flujos con el método pipeline",
    "Redes en Node.js: Creación de Servidores TCP y HTTP Nativos sin librerías externas",
    "Express.js Básico: Estructura del servidor, ruteo dinámico, parámetros de consulta y cuerpo de la petición",
    "Express.js Intermedio: Middlewares integrados, de terceros y personalizados, control de flujo del ciclo de vida (req, res, next)",
    "Manejo Centralizado de Errores: Creación de clases de error personalizadas y middleware de Express de captura de excepciones",
    "Validación y Saneamiento de Datos: Validaciones robustas de DTOs utilizando la librería Joi o Zod en middlewares",
    "Autenticación I: Hashing seguro de contraseñas con bcrypt y generación de tokens JWT con cabeceras firmadas",
    "Autenticación II: Cookies seguras (HttpOnly, SameSite), sesiones Express y estrategias de refresh tokens",
    "Seguridad en Producción: Configuración de cabeceras HTTP con Helmet, rate limiting y protección CORS",
    "Conexión de Bases de Datos I: Acceso a bases de datos relacionales con Pool de conexiones (pg), y consultas crudas",
    "Conexión de Bases de Datos II: Transacciones SQL seguras, niveles de aislamiento y prevención estricta de Inyecciones SQL",
    "WebSockets en Node.js: Comunicación bidireccional y tiempo real mediante Socket.io, salas y middleware de sockets",
    "Multiprocesamiento I: Módulo child_process (exec, spawn, fork), y ejecución de subprocesos del sistema operativo",
    "Multiprocesamiento II: Hilos de ejecución adicionales con Worker Threads, comunicación mediante MessagePort y memoria compartida",
    "Depuración de Aplicaciones: Inspección en caliente, uso de Node Inspector, mapeos de origen (source maps) y depuración en IDEs",
    "Testing de Endpoints: Pruebas unitarias e integración en Express con Jest y Supertest, mocking de bases de datos",
    "Cobertura de Código: Configuración de métricas de cobertura (Istanbul/nyc), aserciones asíncronas y reportes",
    "Logging Avanzado: Configuración de Winston, transportes de logs dinámicos, Winston-Daily-Rotate-File y Morgan",
    "Monitoreo y Diagnóstico: Monitoreo de memoria (heapdumps) en producción, detección de memory leaks y uso de CPU",
    "Gestión de Procesos con PM2: Configuración de ecosistemas de PM2, modo Clúster (escalamiento horizontal) y reinicios automáticos",
    "Dockerización de Aplicaciones Node.js: Creación de imágenes Docker seguras (Multi-stage builds) y buenas prácticas de usuario no root",
    "Microservicios: Arquitectura orientada a servicios, comunicación asíncrona mediante mensajería (RabbitMQ) y gRPC",
    "Despliegue de Servidores: Configuración de variables de entorno seguras, proxies inversos (Nginx), balanceadores de carga y CI/CD",
    "Procesamiento de Carga de Archivos Multipartes: Configuración de multer y almacenamiento de archivos en Node.js",
    "Procesamiento por Streams de Archivos Corporativos: Generación de reportes Excel (exceljs) y Word (docx) en segundo plano",
    "APIs de Geolocalización y PostGIS: Consulta y almacenamiento de coordenadas GPS utilizando drivers SQL",
    "Agregaciones Estadísticas en Backend: Endpoints de cálculo y resúmenes de datos financieros en Node.js",
    "Notificaciones Transaccionales por Correo: Configuración de plantillas HTML y envío de emails con Resend/Nodemailer",
    "Arquitectura de CRUD con Base de Datos Externa: Implementación de rutas y controladores seguros en Express",
    "Limpieza y Sanitización de Registros: Algoritmos de corrección de registros huérfanos y mantenimiento de BD",
    "Optimizaciones de Linter de Node: Reglas ESLint para backend, imports organizados y manejo del Event Loop",
    "Middleware de Gestión de Errores: Middleware personalizado de Express para capturar errores de base de datos",
    "Colas de Trabajo y BullMQ: Configuración de Redis para el procesamiento asíncrono de tareas y reintentos",
    "Diseño de BD Relacional con Node.js: Mapeo de tablas de inventario y restricciones en PostgreSQL",
    "Triggers en PostgreSQL desde Express: Auditoría de stock automática mediante triggers de base de datos",
    "Políticas de Seguridad en RLS Supabase: Configuración de políticas e integración en el cliente pg",
    "Optimización de Queries en Node.js: Indexación, uso de índices GIN/GiST y análisis EXPLAIN",
    "Conectividad Nativa con Supabase: Cliente Supabase JS en backend Node.js y consultas directas",
    "Manejo de Datos Semi-Estructurados JSONB: Consultas rápidas y agregación de tipos JSONB en PostgreSQL",
    "Webhooks de Base de Datos en Node.js: Endpoints dedicados para recibir e-mails y notificaciones en tiempo real",
    "Gestión del Pool de Conexiones: Optimización de conexiones con PgBouncer y pooling en caliente",
    "Migraciones de Base de Datos en Producción: Uso de herramientas de migración para cambios zero-downtime",
    "Pruebas Unitarias de Base de Datos: Mocking del cliente Postgres y pruebas de integración transaccionales",
    "Desarrollo de CRUD Multitenant en Node.js: Aislamiento completo de esquemas por tenant en PostgreSQL",
    "Geolocalización en Servidor con PostGIS: Almacenamiento y cálculo de geocercas utilizando consultas SQL",
    "Generación y Streaming de Reportes de Gigabytes: Generación de archivos pesados con mínimo uso de memoria",
    "Dashboards Estadísticos Avanzados: Optimización de endpoints de agregación y caching con Redis",
    "Sistemas de Alertas Automatizadas de Correo: Colas de reintentos y plantillas HTML para avisos del sistema",
    "Ciclo de Notificaciones Push Backend: Configuración de Web Push y envío de notificaciones push",
    "Seguridad y Autorización en APIs: Restricciones basadas en JWT y scopes de usuario en endpoints Express",
    "Sincronización en Segundo Plano de APIs: Sincronización automática con APIs de mensajería externa",
    "Auditoría y Trazabilidad del Servidor: Middleware de Express para registrar la trazabilidad de operaciones",
    "Testing E2E de APIs de Producción: Pruebas automatizadas de APIs con Supertest y bases de datos reales",
    "Integración de APIs de IA en Node.js: Consumo estructurado de modelos de lenguaje (OpenAI/Groq) y parsing JSON",
    "Orquestación de Chatbots e Historial: Flujo de conversación, gestión del contexto del chatbot y stream de salida",
    "Generación Sintética de Datos con IA: Scripts automatizados de simulación de inventarios y datos realistas",
    "Integración con Mensajería Externa: Conectores a la API de WhatsApp y bots de Telegram en tiempo real",
    "Inyección de Dependencias y Clean Architecture: Separación stricta de servicios y desacoplamiento de conectores externos",
    "Colas de Trabajo Celery/Redis en Node: Integración avanzada con colas distribuidas para notificaciones",
    "Microservicios con gRPC y Protocol Buffers: Configuración de microservicios rápidos y tipados",
    "Optimización del Event Loop y Concurrencia: Profiling de Event Loop bloqueado y cuellos de botella",
    "Criptografía y Cifrado a Nivel de Servidor: Algoritmos de encriptación de datos sensibles en tránsito y reposo",
    "Winston y Daily Rotate File: Configuración robusta de logs y rotación en producción",
    "Agentes de IA Autónomos en Backend: Configuración de function calling y herramientas locales para toma de decisiones",
    "IA de Fondo Asíncrona: Tareas de enriquecimiento predictivo de stock y categorización mediante IA",
    "Procesamiento de PDF e Imágenes en Servidor: Edición dinámica de imágenes (sharp) y compilación de PDF complejos",
    "Extensiones C++ en Node.js (Node Addons): Escritura de cálculo estadístico pesado integrado en Node.js mediante N-API",
    "Deno y Edge Functions Serverless: Migración de lógica Express a Edge runtimes alternativos rápidos",
    "Algoritmos de Enrutamiento y Logística GPS: Optimización de rutas de transporte y geocercas en el servidor",
    "Artillery para Pruebas de Carga Extremas: Simulación de miles de usuarios concurrentes y optimización de rendimiento",
    "Resiliencia y Circuit Breakers en APIs: Configuración de cortacircuitos y reintentos ante caídas de bases de datos",
    "Monitoreo y Diagnóstico Heap: Detección forense de fugas de memoria y volcados de heap en producción",
    "Automatización de Pipelines de Despliegue: CI/CD multirregión y monitorización de Kubernetes con Grafana"
  ],
  "Supabase": [
    "Introducción a Backend-as-a-Service (BaaS) y qué es Supabase",
    "Creación de cuenta en Supabase y tu primer proyecto en la nube",
    "Introducción a PostgreSQL: Relación entre Supabase y la base de datos SQL subyacente",
    "El editor de tablas de Supabase: Crear tablas, columnas y tipos de datos visualmente",
    "Llaves primarias y foráneas: Conceptos básicos de integridad referencial",
    "Inserción manual de registros: Uso de la interfaz gráfica para poblar la base de datos",
    "El editor SQL de Supabase: Consultas SELECT básicas sobre tus tablas",
    "Introducción a las políticas de seguridad RLS (Row Level Security): Por qué se bloquea el acceso por defecto",
    "Configuración de políticas RLS iniciales: Permitir lecturas públicas anónimas",
    "Conexión desde el frontend: Obtener la URL del proyecto y la API Key (anon key)",
    "Instalación del cliente de Supabase: npm install @supabase/supabase-js",
    "Inicialización del cliente: supabaseClient en tu aplicación",
    "Consultas básicas con el cliente I: SELECT simple con filtros elementales (.eq)",
    "Consultas básicas con el cliente II: INSERT de registros individuales desde el cliente",
    "Consultas básicas con el cliente III: UPDATE y DELETE de registros condicionados",
    "Manejo de errores del cliente de Supabase: Interpretación del objeto error en respuestas",
    "Introducción al sistema de Autenticación de Supabase: Registro y login sencillos",
    "Supabase Auth en el Cliente: Registro de usuarios con email y contraseña",
    "Inicio de sesión y gestión de sesión activa: Obtener el usuario actual (.getUser)",
    "Introducción a Supabase Storage: Creación de buckets públicos para archivos",
    "Arquitectura de Supabase: Componentes del ecosistema, Postgres nativo, GoTrue para Auth, PostgREST para API RPC y Storage",
    "Inicialización de Proyectos: Configuración local de Supabase mediante CLI, contenedores Docker locales y SDK de cliente",
    "Normalización Relacional: Formas Normales (1NF, 2NF, 3NF), integridad referencial y definición correcta de llaves",
    "Lenguaje de Consultas SQL I: Operaciones DQL, filtros avanzados, cláusulas de ordenación y paginación",
    "SQL II: Joins avanzados (Inner, Left, Right, Full Outer Join), joins múltiples y subconsultas complejas",
    "SQL III: Funciones de agregación, agrupamiento con Group By y Having, y Window Functions (ROW_NUMBER, PARTITION BY)",
    "Optimización de PostgreSQL I: Creación de índices eficientes (B-Tree, GIN para JSONB, GiST para datos espaciales)",
    "Optimización II: Análisis detallado de planes de ejecución (EXPLAIN ANALYZE), optimización de queries y Vacuuming",
    "Vistas en PostgreSQL: Creación de Vistas (Views) para simplificación de reportes y Vistas Materializadas para consultas pesadas",
    "Procedimientos en Servidor: Funciones y procedimientos almacenados con lenguaje PL/pgSQL y su invocación",
    "Triggers de Base de Datos: Triggers condicionales, auditoría automática de tablas, y sincronización dinámica de datos",
    "Seguridad a Nivel de Fila (RLS) I: Concepto de RLS, políticas de seguridad implícitas y roles nativos de PostgreSQL",
    "RLS II: Políticas dinámicas avanzadas basadas en tokens JWT y variables de sesión (auth.uid(), auth.role())",
    "Autenticación en Supabase: Flujos de inicio de sesión clásicos (Email/Password), recuperación de contraseña y OTP por SMS",
    "Autenticación Avanzada: Proveedores OAuth externos (Google, GitHub), Multi-Factor Authentication (MFA) y hooks de autenticación",
    "Triggers de Autenticación: Automatización de perfiles mediante triggers en la tabla auth.users hacia el esquema public",
    "Almacenamiento en Supabase (Storage) I: Buckets públicos y privados, políticas RLS aplicadas a archivos y carpetas",
    "Almacenamiento II: Carga y descarga programática de archivos grandes, generación de URLs firmadas temporales y CDN",
    "Base de Datos en Tiempo Real (Realtime): Suscripción a cambios de base de datos, filtros de eventos y presencia en tiempo real",
    "Edge Functions de Supabase I: Inicialización del entorno de Deno, TypeScript en Edge Functions y variables de entorno seguras",
    "Edge Functions II: Despliegue de funciones serverless, integración con APIs externas y control de permisos RLS",
    "RPC (Remote Procedure Call): Exposición segura de funciones PostgreSQL al SDK de Supabase JS y tipado TypeScript",
    "Migraciones de Base de Datos: Creación y aplicación de archivos de migración locales, control de versiones y rollback",
    "Sincronización Remota: Empuje y pull de migraciones entre bases de datos locales de desarrollo y producción en Supabase",
    "Extensiones de PostgreSQL: Activación de extensiones útiles (pgcrypto para hashing, uuid-ossp, pg_stat_statements)",
    "Respaldos y Recuperación: Políticas de respaldo automático de Supabase, backups manuales y restauración de bases de datos",
    "Monitoreo de Base de Datos: Panel de performance de Supabase, análisis de logs de Postgres y optimización de bloqueos (Locks)",
    "Integración con Frontend: Tipado estricto del SDK de Supabase a partir del esquema de base de datos con la CLI",
    "Conexiones Directas: Acceso seguro a la base de datos Supabase mediante cadenas de conexión nativas (Pool y Direct Connection)",
    "Escalabilidad en Producción: Optimización de conexiones con PgBouncer, escalado de recursos y mejores prácticas de DBA",
    "Gestión de Inventarios a Nivel de Base de Datos: Diseño de esquemas relacionales óptimos para control de stock, triggers de validación de existencias y llaves compuestas",
    "Extensiones Geográficas y GPS: Activación y uso de PostGIS para almacenamiento de puntos GPS, cálculo de distancias por query y geocercas (Geofencing)",
    "Envío de Correos y Notificaciones desde la BD: Integración del servicio de email nativo de Supabase, triggers para envío automático de notificaciones de stock",
    "Autenticación en Formularios del Cliente: Restricciones de seguridad RLS específicas para la inserción y modificación de registros provenientes de formularios públicos y privados",
    "Limpieza de Datos y Mantenimiento de Esquemas: Programación de tareas de limpieza de datos huérfanos con pg_cron y scripts de migración reversibles",
    "Desarrollo de Aplicación CRUD Multitenant: Aislamiento completo de datos por organización utilizando políticas RLS dinámicas",
    "Búsqueda Semántica Vectorial con pgvector: Configuración y uso de la extensión pgvector en Supabase para almacenar embeddings de texto e imágenes",
    "Chatbots y Contexto de Base de Datos: Diseño de tablas para almacenar el historial de chats y emparejamiento semántico de preguntas con documentos",
    "Automatización con Edge Functions: Inicialización y despliegue de funciones Deno para orquestación de llamadas a APIs de IA y mensajería externa",
    "Webhooks y Ciclos de Notificación: Configuración de webhooks de base de datos para notificar a servidores externos (ej. Node.js) sobre cambios en tiempo real",
    "Integración con Storage y CDN: Gestión de buckets, políticas de acceso RLS para archivos binarios y distribución global mediante CDNs",
    "Migración en Producción Zero-Downtime: Estrategias de migración estructural en caliente, renombrado de columnas y triggers de sincronización",
    "IA de Fondo y Agentes con Funciones SQL: Creación de funciones PL/pgSQL que invocan Edge Functions de IA para catalogación autónoma",
    "Alta Disponibilidad y Réplicas de Lectura: Configuración de esquemas distribuidos, balanceo de conexiones y resiliencia ante caídas de servidor",
    "Optimización Extrema del Optimizador de Consultas: Análisis de ejecuciones, creación de índices parciales, índices cubiertos y estadísticas",
    "Auditoría y Cumplimiento Normativo de Esquemas: Triggers de sistema que registran cada alteración de datos (histórico de cambios de inventario)",
    "Particionamiento de Tablas Gigantes: Dividir físicamente tablas de millones de registros (ej. reportes históricos, localizaciones GPS) por rango o hash",
    "Extensiones Personalizadas de PostgreSQL: Escritura y compilación de extensiones en C/Rust para optimizaciones específicas de base de datos",
    "Triggers en PostgreSQL desde Express: Auditoría de stock automática mediante triggers de base de datos",
    "Manejo de Errores de Base de Datos: Visualización elegante de restricciones e infracciones de políticas de base de datos",
    "Búsqueda Vectorial HNSW en pgvector: Configuración de índices de búsqueda semántica de alta velocidad para chatbots",
    "Triggers Automáticos de Embeddings: Generación automática de embeddings llamando a Edge Functions desde base de datos",
    "Integración SQL de Mensajería Externa: Envío automático de notificaciones a WhatsApp/Telegram desde triggers SQL",
    "Seguridad RPC y API PostgREST: Restricciones de seguridad y tipado estricto en funciones expuestas",
    "RLS Avanzado para Esquemas Complejos: Políticas de seguridad basadas en jerarquías y roles compuestos",
    "Postgres JSONB Optimizations: Indexación avanzada y búsqueda por atributos en columnas JSONB de inventario",
    "Triggers de Validación Cruzada: Restricciones de integridad lógica entre múltiples tablas relacionales",
    "Auditoría Forense de Cambios de Base de Datos: Histórico inmutable de cada alteración de datos con tracking del usuario",
    "Respaldos de Base de Datos e PITR: Configuración de copias de seguridad incrementales y recuperación en el tiempo",
    "Escalado Automático de Base de Datos: Monitoreo de recursos y escalado automático de instancias Postgres",
    "Replicación Lógica PostgreSQL: Configuración de réplicas de lectura de base de datos distribuidas",
    "Monitoreo de Bloqueos (pg_locks): Diagnóstico forense de transacciones bloqueadas y optimización de performance",
    "Pool de Conexiones con PgBouncer en Supabase: Configuración avanzada del pool de conexiones para miles de clientes",
    "RLS Basado en Organización y Sucursales: Políticas dinámicas complejas para control de acceso multitenant",
    "Triggers de Sincronización Temporal: Sincronización automática de datos históricos hacia almacenamiento de solo lectura",
    "Auditoría de Cumplimiento Normativo (GDPR/HIPAA): Políticas RLS y encriptación de datos sensibles (pgcrypto)",
    "Pruebas de Integración con Supabase Local: Configuración de Docker CLI para pipelines de CI/CD locales",
    "Migraciones Estructurales Automáticas: Generación y despliegue automático de scripts de migración basados en cambios locales",
    "Optimización de Índices GIN de Texto Completo: Búsqueda rápida de inventario por texto parcial en PostgreSQL",
    "Escalabilidad en Producción: Optimización de conexiones con PgBouncer, escalado de recursos y mejores prácticas de DBA",
    "Agentes de IA Autonomous en PostgreSQL: Invocación directa de Edge Functions desde PL/pgSQL para toma de decisiones",
    "Optimización Extrema de PostGIS: Consultas espaciales de millones de coordenadas GPS a nivel de milisegundos",
    "Particionamiento Dinámico por Rango y Hash: Dividir físicamente tablas de millones de registros históricos",
    "Alta Disponibilidad y Failover Automático: Configuración de réplicas distribuidas tolerantes a fallos",
    "Extensiones en C/Rust compiladas para Postgres: Desarrollo y carga de extensiones de cálculo estadístico pesado",
    "Triggers de Auditoría Forense de Esquemas: Auditoría de cambios DDL en caliente en Supabase",
    "Pipelines de CI/CD para SQL y RLS: Automatización completa de pruebas unitarias SQL y políticas RLS",
    "Optimización de Búsqueda Semántica de Millones de Datos: Índices vectoriales y balanceador en PostgREST",
    "Tolerancia a Particiones de Red en Realtime: Resiliencia de canales realtime y límites de transmisión de eventos",
    "Recuperación de Desastres Multirregión: Sincronización asíncrona de base de datos entre múltiples regiones geográficas"
  ],
  "HTML": [
    "Introducción al desarrollo web y la estructura de la web: ¿Qué es HTML?",
    "Sintaxis de etiquetas HTML: Elementos de apertura, cierre, contenido y atributos",
    "Estructura básica de un documento HTML5: doctype, html, head y body",
    "Etiquetas de metadatos básicas: Title y meta charset",
    "Encabezados en HTML: Jerarquía visual de h1 a h6 y su relevancia en el SEO",
    "Párrafos y formato de texto simple: Etiquetas p, strong, em, br y hr",
    "Listas en HTML: Creación de listas ordenadas (ol), desordenadas (ul) y sus elementos (li)",
    "Enlaces hipertexto (Links): Etiqueta a, atributo href y target para navegación externa",
    "Imágenes en la web: Etiqueta img, atributos src, alt para accesibilidad y responsive básico",
    "Estructura semántica de HTML5 I: header, nav, main, footer",
    "Estructura semántica de HTML5 II: section, article, aside",
    "Contenedores genéricos de bloque y en línea: Bloques div y spans",
    "Tablas sencillas en HTML: Etiquetas table, tr, th, td y estructuración de datos",
    "Formularios en la web I: Etiqueta form, campos de entrada de texto e inputs",
    "Formularios en la web II: Botones de envío, checkboxes y radio buttons básicos",
    "Formularios en la web III: Etiquetas label, placeholders y el atributo name",
    "Multimedia básica: Etiquetas de audio y video nativas con controles",
    "Atributos globales importantes: id, class, title y style",
    "Rutas de archivos en HTML: Rutas relativas vs rutas absolutas para assets",
    "Validación HTML básica: Validación semántica y sintaxis limpia recomendada por W3C",
    "Fundamentos de la Web: El protocolo HTTP, cómo viajan los documentos HTML, y el proceso de parseo de un navegador",
    "Anatomía de un Elemento: Etiquetas, atributos globales, valores booleanos y estructura anidada correcta",
    "Estructura de Documento: Declaración <!DOCTYPE html>, etiquetas <html>, <head>, <body> y su semántica",
    "Configuración del Head: Metadatos (charset, viewport, robots), importaciones de estilos, fuentes y scripts asíncronos (defer/async)",
    "Estructuración Semántica I: Etiquetas estructurales (header, nav, main, footer) y su beneficio para el SEO y accesibilidad",
    "Semántica II: Articulación de contenidos (section, article, aside, address) y reglas de jerarquía de títulos (h1-h6)",
    "Enlaces y Navegación: Hipervínculos (a), rutas absolutas, relativas, anclas de página, atributos target y rel (noopener, noreferrer)",
    "Listas Estructuradas: Listas desordenadas (ul), ordenadas (ol), de descripción (dl, dt, dd) y anidamiento válido",
    "Formateo Semántico de Texto: Acentuación de importancia (strong, em), marcado físico vs lógico, y etiquetas de código (code, pre)",
    "Multimedia I: Inserción de imágenes (img), formatos de compresión web moderna (WebP, AVIF) y optimizaciones de carga (lazy loading)",
    "Multimedia II: Etiquetas nativas de audio y video con controles personalizados, pistas de subtítulos (track) e implicaciones de accesibilidad",
    "Imágenes Adaptativas: Uso del elemento <picture>, atributos srcset y sizes para diseño responsivo sin CSS",
    "Tablas Estructuradas I: Estructuras básicas (table, tr, td, th), títulos y agrupaciones",
    "Tablas II: Agrupamiento estructurado avanzado (thead, tbody, tfoot), fusión de celdas (colspan, rowspan) y accesibilidad de datos",
    "Formularios I: Elemento <form>, atributos action y method, campos de texto básicos, contraseñas, etiquetas asociadas (label)",
    "Formularios II: Inputs numéricos, fechas, colores, selectores (select, option), listas de sugerencias (datalist) y áreas de texto (textarea)",
    "Formularios III: Validaciones nativas (required, pattern, minlength, maxlength), mensajes de error de navegador y manejo de envío",
    "Marcos Embebidos (Iframes): Inserción de páginas externas, atributos de seguridad sandbox y políticas de características (Feature Policy)",
    "Gráficos Vectoriales y Canvas: Integración de SVG inline frente a imágenes y el lienzo bidimensional dinámico con <canvas>",
    "Elemento Dialog: Detalles desplegables (details, summary), cuadros de diálogo modales nativos (dialog) y su control con JS",
    "Web Components I: Introducción al estándar, plantillas de HTML (<template>, <slot>) y definición de Custom Elements",
    "Web Components II: El Shadow DOM, aislamiento de estilos CSS y encapsulado semántico avanzado",
    "Accesibilidad Web (A11y) I: Directrices de Accesibilidad para el Contenido Web (WCAG) y semántica implícita",
    "Accesibilidad II: Atributos ARIA (Roles, Estados y Propiedades) para elementos dinámicos",
    "SEO On-Page: Marcado estructurado Open Graph, Twitter Cards, jerarquía de etiquetas h1 y estructuración para motores de búsqueda",
    "Microdatos e Integración Semántica: Schema.org, marcado de microdatos e integración de JSON-LD en la cabecera",
    "APIs Core del Navegador I: Geolocalización nativa, almacenamiento Web Storage y drag and drop nativo",
    "APIs Core del Navegador II: API de Historial del Navegador, manipulación del portapapeles y notificaciones de escritorio",
    "Seguridad Web en HTML: Cabeceras CSP (Content Security Policy), protección contra XSS mediante escape de HTML y sanitización",
    "Optimización de Carga: Precarga de recursos (preload, prefetch, dns-prefetch), buenas prácticas de carga del DOM y rendimiento",
    "Formularios y Captura de Datos Avanzada: Uso de datalist, validaciones de expresiones regulares nativas, atributos de accesibilidad y campos semánticos modernos",
    "Geolocalización y Multimedia en HTML: API de Geolocation nativa, APIs de audio/video y elementos canvas para el renderizado dinámico de mapas",
    "Estructuración Semántica de Dashboards e Inventarios: Uso de elementos table, thead, tbody, tfoot, y estructuración de secciones de reportes para SEO y accesibilidad",
    "Exportación de Contenido HTML: Preparación de plantillas HTML optimizadas para ser convertidas a PDF o Word en procesos cliente-servidor",
    "Accesibilidad y Diseño de Formularios Inclusivos: Pautas WCAG aplicadas a etiquetas de formulario, navegación por teclado y etiquetas de error legibles",
    "Limpieza y Validación de Sintaxis: Buenas prácticas de anidamiento, remoción de etiquetas obsoletas, uso de validadores HTML y marcado semántico impecable",
    "Shadow DOM y Encapsulamiento de Estilos: Aislamiento completo de CSS en componentes personalizados y comportamiento de ranuras (slots)",
    "SEO Avanzado para Catálogos: Estructura de documentos HTML para posicionamiento SEO optimizado de colecciones de inventario",
    "Canvas Bidimensional Interactivo: Renderizado de figuras geométricas dinámicas y animaciones básicas controladas por JS",
    "Web Components Reutilizables: Creación de componentes web nativos desacoplados y empaquetados para múltiples vistas",
    "Offscreen Canvas e Interfaces Desacopladas: Renderizado de gráficos en hilos Web Workers secundarios sin bloquear el renderizado principal",
    "File System Access API en HTML: APIs del navegador para lectura y escritura directa de archivos en el disco del usuario",
    "Integridad de Subrecursos (SRI): Seguridad de importaciones HTML de scripts mediante hashes criptográficos en el marcado",
    "Optimización de Ruta Crítica de Renderizado: Carga diferida y precarga (preload/prefetch) de recursos HTML pesados",
    "Atributos Open Graph Dinámicos: Inserción de metadatos dinámicos en la cabecera para mejorar la representación social de reportes",
    "Accesibilidad Dinámica Avanzada: Configuración de focos lógicos y comportamiento dinámico de lectores de pantalla en CRUDs",
    "Canvas con Soporte Multihilo: Dibujo en Canvas desde Web Workers para renderizado ultra rápido de datos masivos",
    "WebXR en HTML5: Conceptos de realidad virtual y aumentada embebidos directamente en etiquetas HTML5",
    "Persistent Storage API en HTML: Control programático del espacio de almacenamiento asignado al navegador",
    "APIs de Sensores del Navegador: Conectividad y lectura de sensores físicos (orientación, movimiento) a través de HTML",
    "Web Components con Shadow DOM Dinámico: Creación de componentes complejos autogestionados y dinámicos",
    "Seguridad en Formularios contra XSS: Técnicas avanzadas de escape de cadenas y prevención de inyecciones en el DOM",
    "Plantillas Reutilizables en HTML5: Uso de la etiqueta template para renderizado interactivo desde JS",
    "Maquetación Semántica Multitenant: Estructuración HTML adaptable para diferentes organizaciones",
    "HTML en Correos Transaccionales: Diseño de plantillas de correo robustas compatibles con clientes clásicos de email",
    "Optimización de Renderizado del DOM: Técnicas para minimizar el tiempo de parseo del DOM en páginas de reportes masivos",
    "Accesibilidad Web en Dashboards: Estructuración semántica de gráficos y reportes para lectores de pantalla avanzados",
    "APIs de Voz Nativas en HTML: Integración de la Web Speech API para lectura de textos y comandos de voz sencillos",
    "APIs de Conectividad en Navegador: API Network Information para adaptar la carga de recursos según la velocidad de red",
    "Maquetación Semántica de Tablas de Inventario: Estructuración accesible de tablas con miles de registros",
    "HTML Atómico con Web Components: Creación de un sistema de diseño utilizando componentes web nativos desacoplados",
    "APIs de Conectividad Offline: Service Workers y archivos manifest para soporte offline de aplicaciones HTML",
    "Configuración Avanzada de CSP: Cabeceras de seguridad estrictas escritas en meta-tags para evitar robo de información",
    "SEO Semántico de Microdatos: Schema.org e integración de JSON-LD estructurado en la cabecera del documento",
    "Canvas de Alto Rendimiento: Dibujo optimizado y manipulación de píxeles para visualización dinámica de datos",
    "HTML Adaptativo para Dispositivos Especiales: Maquetación semántica adaptada a lectores de pantalla y terminales de voz",
    "Optimización de Imágenes Web: Formatos responsivos y compresión adaptada según la resolución y el ancho de banda",
    "Micro-formatos HTML: Enriquecimiento semántico de datos de contacto y direcciones físicas",
    "Automatización de Plantillas de Correo HTML: Compilación de layouts dinámicos basados en datos JSON",
    "Análisis Automatizado de Accesibilidad: Integración de validadores automáticos WCAG en pipelines de desarrollo",
    "Motores de Renderizado HTML Dinámicos: Creación de un motor básico en JS para compilar plantillas HTML",
    "Visualización Geoespacial Interactiva: Canvas y SVG nativos manipulados por JS para renderizado de mapas complejos",
    "APIs de Comunicación con Dispositivos: WebUSB y WebSerial API para interacción directa con dispositivos hardware locales",
    "Realidad Virtual Inmersiva con WebXR: Escenas interactivas tridimensionales embebidas en HTML5 y renderizado WebGL",
    "Firmas Criptográficas en el Marcado: Integración de firmas digitales de autenticidad en documentos HTML exportados",
    "Virtualización del DOM en Tablas Masivas: Renderizado de filas dinámico para evitar el colapso del DOM",
    "Automatización de Marcado Semántico: Generación dinámica de elementos HTML estructurados basados en datos de IA",
    "Tests de Regresión Visual de Accesibilidad: Pruebas automatizadas en CI/CD para detectar errores de contraste y lectura",
    "APIs de Rendimiento del Navegador: Performance API para telemetría en tiempo real de la carga del documento HTML",
    "Optimización de Interfaces Críticas: Técnicas extremas de minimización de layouts para terminales móviles y de bajo rendimiento"
  ],
  "CSS": [
    "Introducción a CSS: Qué son las hojas de estilo y cómo se enlazan con HTML",
    "Formas de aplicar estilos CSS: En línea, interno y en archivos externos (.css)",
    "Sintaxis básica de reglas CSS: Selectores, propiedades y valores",
    "Selectores CSS elementales: Selectores de etiqueta, clase (.) e identificador (#)",
    "Selectores CSS compuestos: Selectores de descendientes y selectores múltiples",
    "El modelo de caja en CSS (Box Model) I: Contenido, Padding, Border y Margin",
    "El modelo de caja en CSS (Box Model) II: La propiedad box-sizing y border-box",
    "Colores en CSS: Representaciones con nombres de color, Hexadecimal y formato rgb()",
    "Unidades de medida CSS: Tamaños absolutos (px) vs tamaños relativos (em, rem, %)",
    "Tipografía en CSS: Propiedades font-family, font-size, font-weight y text-align",
    "Posicionamiento básico: Flujo normal de HTML, bloques vs elementos en línea",
    "Propiedades de visualización: Bloque (block), en línea (inline) y bloque en línea (inline-block)",
    "Introducción a Flexbox I: El contenedor flexible (display: flex) y dirección de ejes",
    "Introducción a Flexbox II: Alineación de elementos con justify-content y align-items",
    "Bordes y sombras sutiles: border-radius para esquinas curvas y box-shadow básico",
    "Fondos en CSS: Background-color, background-image y background-size",
    "Pseudoclases básicas: El estado hover (:hover) y active (:active) para interactividad",
    "Transiciones simples: La propiedad transition para suavizar cambios de color y tamaño",
    "Introducción al diseño adaptativo: Concepto de Mobile First y Media Queries básicas",
    "Variables de CSS básicas: Declaración en :root y uso básico con var()",
    "Introducción al Estilado: Anatomía de una regla CSS, formas de importación y selectores básicos (Etiqueta, Clase, ID)",
    "Cascada y Especificidad: El algoritmo de la cascada, cálculo de especificidad de selectores, herencia y uso de !important",
    "Modelo de Caja I: Margen, Borde, Relleno, Contenido, Box-Sizing (content-box vs border-box) y colapso de márgenes",
    "Modelo de Caja II: Límites de tamaño (min-width/max-width), overflow (scroll, hidden, auto) y manipulación de display",
    "Tipografía Web: Fuentes del sistema, importación de Google Fonts locales y CDN, tamaño, altura de línea, peso y alineación",
    "Unidades de Medida: Unidades absolutas (px) vs relativas (em, rem, %, vw, vh, ch, ex) y su uso óptimo en diseño responsivo",
    "Colores y Espacios de Color: Hexadecimal, RGB, HSL, RGBA, HSLA y espacios modernos como OKLCH y LCH para contrastes de accesibilidad",
    "Fondos y Bordes: Degradados lineales y radiales, imágenes de fondo avanzadas (cover, contain), bordes redondeados y efectos",
    "Flexbox I: Eje principal y cruzado, propiedades del contenedor flex (flex-direction, flex-wrap, justify-content, align-items)",
    "Flexbox II: Propiedades de los elementos hijos (flex-grow, flex-shrink, flex-basis, align-self) y espaciados automáticos",
    "CSS Grid I: Conceptos clave (Grids, Rows, Columns, Tracks), definición de grillas bidimensionales (grid-template-columns/rows)",
    "CSS Grid II: Líneas de grid, áreas con nombre (grid-template-areas), y comportamiento de grillas dinámicas con auto-fill y auto-fit",
    "Posicionamiento: Static, Relative, Absolute, Fixed y Sticky, y control de contextos de apilamiento con z-index",
    "Transiciones CSS: Suavizado de cambios de estado, propiedades animables, duración, retrasos y funciones de tiempo (Bezier)",
    "Animaciones CSS: Definición de fotogramas clave (@keyframes), iteraciones, direcciones, estados de llenado (animation-fill-mode)",
    "Transformaciones: Transformaciones en dos dimensiones y espaciales en 3D (rotar, escalar, trasladar, sesgar, perspectiva y GPU)",
    "Filtros y Modos de Fusión: Filtros de imagen (blur, contrast, grayscale), glassmorphism (backdrop-filter) y modos de mezcla de capas",
    "Variables CSS (Custom Properties): Declaración local y global de variables, alcance dinámico e integración con JavaScript en tiempo real",
    "Diseño Adaptativo (Media Queries): Media queries clásicos basados en tamaño de pantalla, modo oscuro (prefers-color-scheme) y accesibilidad",
    "Container Queries Modernos: Estilado adaptable basado en las dimensiones físicas del elemento contenedor y no de la pantalla completa",
    "Metodología BEM: Arquitectura de nombres (Block, Element, Modifier) para modularidad y legibilidad del CSS",
    "Preprocesadores I: SASS/SCSS, anidamientos de selectores, variables internas, mixins y funciones matemáticas",
    "Preprocesadores II: Arquitectura SASS (patrón 7-1), compilación en tiempo real y optimización del CSS compilado",
    "Frameworks de CSS: Fundamentos de desarrollo ágil con Tailwind CSS, directivas y configuración de compilación de purga de CSS",
    "CSS-in-JS: Concepto de estilado en componentes, Styled Components en React y scoping de estilos",
    "Propiedades de Visualización Avanzadas: Control de renderizado (content-visibility), contención de estilos y propiedades de layout",
    "Accesibilidad en CSS: Contraste de colores adecuado (WCAG), visibilidad de focos de teclado personalizados e inhabilitación de animaciones",
    "Soporte de Navegadores: Uso de consultas de características (@supports) y prefijos de navegadores",
    "Optimización de CSS: Reducción de selectores complejos, evitar reflows de diseño costosos, eliminación de CSS no utilizado y minificación",
    "Rendimiento y will-change: Gestión del rendimiento gráfico utilizando la propiedad will-change y optimización de animaciones 3D",
    "Diseño Visual Premium HSL: Configuración de variables HSL para temas oscuros y claros con paletas coherentes y accesibles",
    "Estilado de Formularios y Feedback: CSS para estados de foco, invalidez y validación visual interactiva de formularios",
    "Maquetación de Dashboards con Grid: Paneles de inventario sofisticados utilizando layouts CSS Grid bidimensionales responsivos",
    "Tipografía Líquida clamp(): Fórmulas matemáticas en CSS para un escalamiento tipográfico perfecto y adaptable",
    "Transiciones y Micro-Interacciones: Animaciones dinámicas de hover, loaders dinámicos y loaders en botones de acción CRUD",
    "Refactorización y Limpieza de Hojas de Estilo: Buenas prácticas de arquitectura de CSS para evitar la redundancia y especificidades altas",
    "Container Queries Aplicados a Componentes: Diseño elástico de widgets que se adaptan a las dimensiones físicas de su contenedor",
    "Variables CSS Dinámicas por JS: Modificación de variables de estilos CSS en caliente basadas en eventos de interacción del usuario",
    "Estilado CSS para Impresión y PDF: Reglas de impresión y saltos de página optimizados para exportación de reportes corporativos",
    "CSS Feature Queries (@supports): Detección en caliente del soporte de navegadores para implementar mejoras progresivas seguras",
    "Animaciones 3D e Interactividad: Creación de perspectivas y entornos tridimensionales fluidos en CSS",
    "CSS Houdini Paint API: Personalización del renderizado del navegador mediante JavaScript de bajo nivel",
    "Tematización Automatizada: Esquemas de color dinámicos que se adaptan automáticamente a las preferencias del sistema",
    "Scroll-Driven Animations: Animaciones controladas estrictamente por el desplazamiento de la página",
    "CSS Containment para Rendimiento: Uso de la propiedad contain para aislar áreas del DOM y evitar recálculos",
    "Stylelint y Análisis Estático: Configuración de herramientas de compilación para garantizar CSS libre de errores",
    "Estilos Aislados en Microfrontends: Estrategias de scoping y encapsulamiento de CSS en aplicaciones grandes",
    "Accesibilidad de Contraste con OKLCH: Espacios de color modernos para calcular contrastes visuales de alta precisión",
    "Filtros de Fusión Avanzados: Efectos visuales de mezcla complejos y transiciones dinámicas de fondo",
    "Optimización de Repaint y Reflow: Técnicas avanzadas de optimización de rendimiento en renderizados complejos",
    "Temas Dinámicos Multitenant: Estilos y variables CSS dinámicas basadas en la marca del cliente",
    "Optimización de Layouts de Impresión Física: CSS específico para reportes en papel con paginación controlada",
    "Estilado de Chatbots Flotantes: Interfaces dinámicas y layouts de conversación responsivos con Flexbox/Grid",
    "Animaciones de Carga y Loaders: Animaciones complejas e interactivas de loaders de carga y spinners",
    "Sombras Realistas de Alto Nivel: Configuración de sombras multidimensionales sofisticadas para glassmorphism",
    "Multi-column Layouts en CSS: Layouts avanzados para visualización de textos y reportes en columnas",
    "Responsive Design sin Breakpoints: Uso de flex-wrap y grid con auto-fit/minmax para evitar media queries",
    "Sistemas de Estilos Atómicos: Organización y construcción de componentes visuales con clases atómicas",
    "Transiciones de Página Fluidas: Animaciones de transición completas en el cambio de vistas de la aplicación",
    "CSS Scoping y Shadow DOM: Aislamiento estricto de estilos en componentes personalizados de la UI",
    "Sistemas de Diseño Modulares en CSS: Arquitectura de hojas de estilos a gran escala con metodologías ITCSS/SMACSS",
    "Container Queries Avanzados: Layouts elásticos adaptados a elementos flotantes y componentes dinámicos",
    "Variables de Estilo Controladas en Caliente: Modificación y renderizado de colores y tipografía reactiva desde JS",
    "Houdini Layout API: Creación de algoritmos de posicionamiento personalizados para grillas y dashboards",
    "Optimización de Animaciones a 60fps: Aceleración por hardware y uso eficiente de propiedades transform/opacity",
    "Aislamiento de CSS en Arquitecturas Complejas: Gestión de namespaces y prevención de colisiones de selectores",
    "Accesibilidad Visual y Contraste Automático: Variables CSS adaptativas basadas en preferencias de accesibilidad del usuario",
    "Maquetación de Componentes Visuales Atómicos: Clases y componentes desacoplados con variables de diseño",
    "Automatización de Compilación SASS: Pipelines de build de SASS/Tailwind integrados con minificación y autoprefix",
    "Tests de Regresión Visual de CSS: Automatización de pruebas de capturas de pantalla para evitar cambios visuales",
    "Entornos Virtuales 3D en puro CSS: Creación de perspectivas y layouts tridimensionales interactivos complejos",
    "Houdini APIs y Typed OM: Acceso directo de bajo nivel a los tipos de datos internos de CSS mediante JS",
    "Esquemas de Contraste Automáticos por Accesibilidad: Estilos CSS que se adaptan a las directrices de accesibilidad",
    "Scroll-Driven Animations Complejas: Animaciones interactivas basadas en scroll y scroll timeline",
    "contain: layout para Aislamiento de Renderizado: Optimización del DOM para pantallas de reportes con miles de nodos",
    "Stylelint Personalizado para Equipos: Reglas y linters a medida para evitar la alta especificidad y código duplicado",
    "Maquetación Adaptativa Extrema: Layouts que responden a múltiples orientaciones, tamaños y tipos de dispositivos",
    "Optimización de Especificidad en Proyectos Gigantes: Refactorización y eliminación de código CSS muerto (PurgeCSS)",
    "Animaciones de Carga Basadas en Estados: Transiciones dinámicas controladas por el estado de carga del backend",
    "Automatización de Auditoría de Rendimiento de Estilos: Telemetría de renders y perfiles en pipelines de CI/CD"
  ],
  "C++": [
    "Introducción a C++: Historia, características de lenguaje compilado y rendimiento de bajo nivel",
    "Configuración de herramientas en C++: Compilador GCC/G++, MinGW (Windows) y editores de código",
    "Primer Hola Mundo en C++: Estructura del código, función main y flujo iostream (std::cout)",
    "Sintaxis básica en C++: Comentarios, uso del punto y coma y la instrucción return 0",
    "Variables y asignación: Declaración de variables, tipos y asignación dinámica básica",
    "Tipos de datos básicos I: Enteros (int), caracteres (char) y booleanos (bool)",
    "Tipos de datos básicos II: Flotantes (float) y de doble precisión (double)",
    "Entrada de datos por consola: Lectura de datos usando std::cin y flujo de entrada",
    "Operadores matemáticos en C++: Suma, resta, multiplicación, división y operador módulo",
    "Operadores condicionales y de comparación: ==, !=, <, >, <=, >=",
    "Operadores lógicos elementales: AND (&&), OR (||) y NOT (!)",
    "Condicionales I: Sentencia condicional if para bifurcaciones simples",
    "Condicionales II: Estructuras combinadas else y else if en C++",
    "Condicionales III: La sentencia switch para opciones enteras y caracteres",
    "Bucles y ciclos interactivos I: Bucle while para repeticiones condicionadas",
    "Bucles y ciclos interactivos II: Bucle do-while y su ejecución garantizada de una vez",
    "Bucles y ciclos interactivos III: Bucle for clásico para rangos numéricos",
    "Funciones simples I: Declaración de funciones sin retorno (void) e invocación",
    "Funciones simples II: Parámetros por valor y el retorno de tipos básicos",
    "Introducción a arreglos estáticos: Declaración de arrays de tamaño fijo y accesos por índice",
    "Arquitectura y Compilación: Historia de C++, el proceso de compilación (Preprocesador, Compilador, Enlazador), y configuración de GCC/Clang",
    "Sistema de Tipos Nativos: Tipos de datos fundamentales, modificadores de tamaño y signo, variables, constantes (const, constexpr) y casting",
    "Operadores y Expresiones: Operadores aritméticos, lógicos, relacionales, a nivel de bits (Bitwise), y evaluación de cortocircuito",
    "Control de Flujo: Estructuras condicionales (if, else, switch), bucles optimizados (for, while, do-while), y bucles basados en rangos",
    "Funciones y modularidad: Declaración frente a definición, firmas de funciones, prototipos, pasaje de argumentos y pila de llamadas (Stack)",
    "Pasaje de Parámetros Complejo: Pasaje por valor, por referencia y por puntero, modificador const en parámetros y funciones inline",
    "Sobrecarga de Funciones y Argumentos por Defecto: Reglas de resolución de sobrecarga de funciones y valores por defecto en firmas",
    "Punteros y Direccionamiento: Operador de dirección (&), operador de desreferencia (*), aritmética de punteros, punteros constantes y arrays",
    "Referencias en C++: Declaración de alias de memoria, inicialización obligatoria, y diferencias detalladas con punteros",
    "Gestión Dinámica de Memoria I: Uso de los operadores de reserva new y liberación delete para objetos simples y arrays dinámicos",
    "Fugas de Memoria (Memory Leaks): Diagnóstico de fugas de recursos, uso de herramientas de depuración (Valgrind) y punteros colgantes",
    "Estructuras de Datos Básicas: Definición de Structs clásicos, enumeraciones tradicionales y modernas (enum class), y Uniones",
    "POO I: Conceptos de clase y objeto, especificadores de acceso (public, private), métodos de clase y definición fuera de la clase",
    "POO II: Constructores, constructores por defecto, constructores con lista de inicialización de miembros, y Destructores",
    "POO III: Constructor por copia, constructor por movimiento, operador de asignación por copia y de asignación por movimiento",
    "Herencia y Composición: Clases derivadas, tipo de herencia (public, protected, private), llamadas a constructores de la clase base",
    "Polimorfismo y Enlace Dinámico: Funciones virtuales (virtual), destructor virtual, clases abstractas puras y tablas virtuales (vtable)",
    "Sobrecarga de Operadores: Sobrecarga de operadores matemáticos, de asignación, de indexación ([]), y operadores de entrada y salida (<<, >>)",
    "Amistad en C++ (Friendship): Funciones amigas (friend function) y clases amigas (friend class), y sus implicaciones en la encapsulación",
    "Plantillas (Templates) I: Funciones plantilla, inferencia de tipos de plantillas, y clases plantilla genéricas",
    "Plantillas II: Metaprogramación con plantillas, especialización de plantillas, y conceptos modernos de restricción (concepts en C++20)",
    "Manejo de Excepciones: Try, Catch, Throw, jerarquía estándar de excepciones, y especificación noexcept",
    "STL I (Biblioteca Estándar): Flujos de entrada/salida de archivos (ifstream, ofstream, fstream), modos de apertura y serialización binaria",
    "STL II (Contenedores): Vectores dinámicos (std::vector), listas doblemente enlazadas (std::list), y arrays de tamaño fijo (std::array)",
    "STL III (Asociativos): Mapas asociativos (std::map), conjuntos (std::set) y rendimiento",
    "STL IV (Algoritmos e Iteradores): Iteradores de contenedores, algoritmos incorporados (sort, find, transform, accumulate)",
    "Gestión de Memoria Moderna (RAII): Principio RAII y uso de Smart Pointers de C++11 (std::unique_ptr, std::shared_ptr, std::weak_ptr)",
    "Programación Concurrente I: Creación de hilos dinámicos (std::thread), paso de argumentos a hilos y sincronización con join",
    "Concurrencia II: Protección de secciones críticas mediante std::mutex, bloqueos RAII (std::lock_guard, std::unique_lock) y semáforos",
    "C++ Moderno Avanzado: Deducción de tipos (auto, decltype), referencias rvalue, semántica de movimiento (std::move) y expresiones lambda",
    "Estructuras de Datos Eficientes para Inventarios: Implementación manual de tablas hash, árboles AVL y mapas ordenados para la búsqueda rápida",
    "Serialización y Exportación Multiformato: Escritura directa y parsing de formatos estructurados como CSV, archivos binarios y generación de XML/JSON",
    "Algoritmos Geográficos y GPS: Procesamiento de tramas NMEA procedentes de dispositivos GPS y cálculo de distancias geodésicas",
    "Estructuración Limpia de Memoria y Prevención de Fugas: Gestión manual estricta usando RAII, análisis estático y dinámico de memoria para evitar leaks",
    "Diseño de Interfaces por Consola: Manejo de menús jerárquicos limpios, separación de capas lógica-interfaz en aplicaciones de consola",
    "CRUD de Inventario basado en Archivos: Sistema de base de datos indexado por archivos planos/binarios con soporte de transacciones",
    "Metaprogramación Avanzada (SFINAE): Sustitución no es un error (SFINAE) y técnicas de sobrecarga condicional de plantillas",
    "Custom Allocators de Memoria: Construcción de asignadores personalizados para optimizar la creación rápida de miles de objetos",
    "Programación Concurrente Lock-Free: Algoritmos libres de bloqueos y variables atómicas complejas para concurrencia masiva",
    "DLLs y Bibliotecas Compartidas: Creación de DLLs y Shared Libraries multiplataforma con interfaces C estables (ABI)",
    "Optimización Cache-Friendly: Programación orientada a la caché L1/L2, alineación de estructuras y localidad de datos",
    "Conectividad Serial GPS y Filtrado: Comunicación serial UART/SPI en tiempo real con chips GPS y filtrado de datos (Filtro de Kalman)",
    "Compilador JIT Dinámico Básico: Generación de código de máquina en tiempo de ejecución para cálculos matemáticos optimizados",
    "Algoritmos Geoespaciales y Rutas: Algoritmos A* y Dijkstra aplicados a la búsqueda de rutas óptimas sobre mapas GPS",
    "Flujos SIMD en Paralelo: Procesamiento paralelo a nivel de hardware utilizando instrucciones de registro SIMD",
    "Criptografía por Hardware AES-NI: Cifrado y descifrado veloz utilizando instrucciones nativas de la CPU",
    "Motores de Renderizado Nativos: Introducción a la visualización dinámica 3D usando APIs gráficas como OpenGL o Vulkan",
    "Auditoría y Linter en C++: Configuración de Clang-Tidy, Clang-Format y herramientas de análisis estático",
    "Asincronía con std::future: Programación asíncrona mediante promesas y futuros de la biblioteca estándar de C++",
    "Patrones de Diseño Concurrentes: Productores-Consumidores, Thread Pool y Active Object en C++",
    "Arquitectura C++ en Capas: Separación modular de lógica de negocio, servicios de datos y controladores",
    "Inyección de Dependencias en C++: Patrones de desacoplamiento de clases y conectores de hardware mediante plantillas",
    "Patrones Creacionales y Estructurales: Singleton, Factory, Adapter y Proxy adaptados a arquitecturas de alto rendimiento",
    "Testing Unitario con Google Test: Configuración de pruebas unitarias exhaustivas e integración de Asserts",
    "Mocking con Google Mock: Simulación de clases colaboradoras y dependencias de red en pruebas de integración",
    "Depuración Avanzada con GDB: Inspección de volcados de memoria, puntos de interrupción condicionales y depuración asíncrona",
    "AddressSanitizer y Memory Sanitizer: Diagnóstico en tiempo de ejecución de desbordamientos de búfer y accesos inválidos",
    "Optimización del Tiempo de Compilación: Uso de cabeceras precompiladas (PCH) y módulos de C++20",
    "CMake para Proyectos Grandes: Automatización de compilaciones multiplataforma, dependencias externas y empaquetado",
    "CI/CD para C++: Automatización de compilación y pruebas unitarias de software C++ en pipelines de integración continua",
    "Diseño de APIs Multiplataforma Estables: Buenas prácticas para evitar cambios de ABI en actualizaciones de bibliotecas",
    "Thread Pools Personalizados: Implementación eficiente de colas de tareas multihilo con balanceo de carga",
    "Programación Reactiva en C++: Uso de flujos de datos asíncronos y programación orientada a eventos reactivos",
    "Sistemas de Mensajería Integrados: Envío de notificaciones y serialización de mensajes a través de redes locales",
    "Resiliencia y Tolerancia a Fallos: Gestión de caídas de conexión de sensores y reintentos automatizados en caliente",
    "Procesamiento Masivo de Archivos: Streams de entrada/salida concurrentes para lectura de archivos de gigabytes",
    "Concurrencia sin Bloqueos Avanzada: Implementación de colas y estructuras de datos atómicas complejas sin mutex",
    "Logging Asíncrono de Alto Rendimiento: Escritura de bitácoras de sistema sin bloquear los hilos principales",
    "Monitoreo de CPU y Memory Profiling: Perfiles de ejecución mediante herramientas de hardware (Perf/Valgrind)",
    "Contenedores Optimizados Personalizados: Creación de estructuras de datos en memoria personalizadas para velocidad extrema",
    "Motores JIT de Producción: Compilación de funciones en tiempo de ejecución utilizando LLVM o ensamblador directo",
    "Procesamiento Geoespacial Satelital: Algoritmos de geolocalización masiva de coordenadas GPS sobre mapas satelitales",
    "Procesamiento SIMD Masivo: Paralelización con intrínsecos de CPU para cálculo de matrices y promedios",
    "Criptografía Post-Cuántica en C++: Implementación de algoritmos de cifrado resistentes a ataques cuánticos",
    "Renderizado 3D de Mapas Complejos: Motores de renderizado nativos para visualización gráfica e interactiva de rutas GPS",
    "Automatización de Pruebas de Seguridad: Pruebas fuzzing e inyección de fallos automáticos para auditoría de memoria",
    "Auditoría Forense de Memory Dumps: Análisis de fallos graves (Segmentation Faults) mediante volcados de pila",
    "Optimización Extrema de Rutas TSP: Implementación de algoritmos heurísticos para rutas logísticas complejas",
    "Virtualización de Datos en Memoria: Gestión de memoria virtual personalizada para bases de datos embebidas",
    "Resiliencia de Red Distribuida en C++: Protocolos de comunicación tolerantes a particiones de red y fallos de hardware"
  ],
  "Multilenguaje": [
    "Conceptos fundamentales de programación: Qué es un algoritmo, un compilador y un intérprete",
    "Paradigmas de programación: Programación estructurada, imperativa, funcional y orientada a objetos",
    "Comparativa de sintaxis básica: Cómo se declara una variable en JS, Python y Java",
    "Comparativa de impresión en pantalla: console.log vs print vs System.out.println",
    "El entorno de ejecución: Navegador vs Intérprete local vs Máquina Virtual",
    "Estructura del código en diversos lenguajes: El rol de las llaves, la indentación y el punto y coma",
    "Sistemas de tipado: Tipado dinámico (JS/Python) vs Tipado estático (Java/C++)",
    "Conversión de tipos de datos en la práctica: Casting en lenguajes estáticos vs coerción en dinámicos",
    "Operadores lógicos y booleanos comunes: Tablas de verdad de operadores en JS, Python y Java",
    "Estructuras condicionales en paralelo: Sintaxis comparada de sentencias condicionales if-else",
    "El bucle while en los distintos lenguajes: Similitudes y diferencias en su control",
    "El bucle for en los distintos lenguajes: Iteradores clásicos vs rangos dinámicos",
    "Funciones y modularidad comparada: Definición de funciones, paso de parámetros y retornos",
    "Manejo de colecciones de datos elementales: Listas, arreglos y diccionarios comparados",
    "Errores de compilación vs Errores de ejecución: Cuándo falla el código según el lenguaje",
    "Introducción al diseño de interfaces de programación: APIs y protocolos de comunicación simples",
    "Formatos de intercambio de datos comunes: JSON, XML y texto plano en la transmisión de datos",
    "Introducción al control de versiones: Por qué usar Git en cualquier proyecto de software",
    "Sistemas de bases de datos: Relacionales vs No Relacionales en el almacenamiento de datos",
    "Elección del stack tecnológico: Cuándo usar cada lenguaje según el dominio del problema",
    "Fundamentos de Compilación Mixta: Ciclo de compilación y enlazado de lenguajes compilados (C/C++) frente a interpretados (Python/JS)",
    "Pasaje de Tipos de Datos Primitivos: Correspondencia de enteros, flotantes y booleanos entre sistemas de tipos nativos y virtuales",
    "Enlace de Funciones C en C++: Uso de la directiva extern \"C\" para prevenir la decoración de nombres (Name Mangling) del compilador C++",
    "Introducción a Compiladores Cruzados: Configuración y uso de Toolchains (GCC, Clang) para generación de binarios multiplataforma",
    "ABI (Application Binary Interface): Reglas de bajo nivel para la representación de tipos y alineación de memoria en hardware",
    "Estructuración de Cabeceras C/C++: Diseño de headers limpios con guardas de inclusión (#ifndef, #pragma once) para exportación nativa",
    "Convenciones de Llamadas (Calling Conventions): Análisis técnico del manejo de pila de llamadas en cdecl, stdcall y fastcall",
    "Compilación Estática vs Dinámica: Creación y enlazado de librerías estáticas (.lib/.a) frente a dinámicas (.dll/.so) y carga en tiempo de ejecución",
    "Enlazado Básico de Librerías Nativas: Configuración de flags de enlazador (-l, -L) y rutas de búsqueda de librerías en sistemas operativos",
    "Manipulación de Bytes Crudos: Lectura y formateo de datos binarios inter-lenguaje mediante manipulación de punteros char* y void*",
    "Enlace C/C++ en Node.js I: Creación de Addons elementales usando N-API primitiva para pasaje de números y booleanos",
    "Interoperabilidad Node-Python I: Comunicación IPC bidireccional por flujos estándar (stdio) utilizando child_process.spawn",
    "Serialización Inter-lenguaje I: Formateo y validación de esquemas JSON compartidos entre aplicaciones interpretadas y compiladas",
    "Llamadas por CLI Inter-lenguaje: Pasaje estructurado de parámetros por línea de comandos y procesamiento de códigos de salida (Exit Codes)",
    "Variables de Entorno Compartidas: Lectura y modificación en caliente de variables del entorno (Process Environment Variables) cruzadas",
    "Llamadas al Sistema Operativo Compartidas: Ejecución coordinada de comandos del sistema operativo y control de hilos de ejecución secundarios",
    "Lectura Concurrente de Archivos Planos: Bloqueos de archivos a nivel de sistema operativo (flock/lockf) para acceso seguro multilingüe",
    "Conversión de Cadenas inter-lenguaje: Codificación, decodificación y transformación de strings UTF-8, UTF-16, ASCII y wchar_t",
    "Manejo de Codificaciones de Bytes: Identificación de problemas de orden de bytes (Endianness: Big-Endian vs Little-Endian) en red",
    "Control de Flujo Inter-procesos Básico: Sincronización primitiva mediante temporizadores y señales de sistema (SIGINT, SIGTERM, SIGKILL)",
    "JNI Clásico en Java: Configuración de Java Native Interface, generación de cabeceras .h con javac -h, y carga de librerías nativas con System.loadLibrary",
    "JNI Avanzado en Java: Manipulación de tipos complejos de Java (String, Arrays, Objetos) y gestión de referencias globales, locales y débiles en C++",
    "Bindings en Python con ctypes: Carga dinámica de librerías compartidas (.dll/.so), especificación de argtypes y restype, y paso de punteros por referencia",
    "Mapeo de Estructuras C (C-Structs): Empaquetado y alineación de datos estructurados en Python/ctypes y Node.js para coincidencia exacta con struct de C",
    "Memoria Compartida I (Shared Memory): Creación y mapeo de segmentos de memoria compartida inter-procesos usando shmget y shmat en POSIX",
    "Sincronización por Semáforos POSIX: Coordinación de acceso a recursos compartidos entre procesos independientes escritos en diferentes lenguajes",
    "Sockets TCP Locales (Loopback): Implementación de servidores y clientes locales TCP para mensajería de alta fiabilidad entre Node.js, Python y C++",
    "Empaquetado de Librerías Nativas: Creación de instaladores y bundles multiplataforma que incluyan binarios compilados específicos para cada arquitectura",
    "Depuración de Segmentation Faults: Rastreo de volcados de memoria (Core Dumps) y depuración combinada FFI mediante GDB y LLDB",
    "Mapeo de Tipos Complejos FFI: Técnicas de serialización para paso de estructuras anidadas, punteros dobles y arrays de longitud dinámica",
    "WebAssembly Core: Compilación de código C/C++ a WebAssembly (.wasm) utilizando Emscripten, y carga de módulos WASM en JavaScript",
    "Memoria Compartida en WebAssembly: Manipulación directa de WebAssembly.Memory, pasaje de strings y arrays mediante buffers de memoria",
    "Native Addons en Node.js II: Desarrollo de Addons asíncronos y robustos con node-addon-api (C++) y enlazado con Nan (Native Abstractions)",
    "Hilos Asíncronos Libuv en Addons: Integración de llamadas nativas asíncronas en Node.js que no bloquean el Event Loop usando uv_queue_work",
    "Bindings en Python con SWIG: Automatización de la generación de código de interfaz para librerías C++ complejas usando archivos de interfaz .i",
    "Asincronía Cruzada (JS-C++): Ejecución y retorno de Promesas de JS desde llamadas y callbacks ejecutados en subprocesos nativos de C++",
    "Serialización Compacta con MessagePack: Empaquetamiento y desempaquetamiento binario inter-lenguaje de alta velocidad como alternativa a JSON",
    "Interoperabilidad Java-Python I: Configuración y uso de Jython para ejecutar scripts Python y evaluar expresiones simples directamente dentro de la JVM",
    "Enlace Java-Python por Procesos: Ejecución interactiva de intérpretes de Python usando ProcessBuilder de Java, controlando stdio de forma asíncrona",
    "Optimización de Búferes sin Copia (Zero-Copy): Uso de Node.js Buffer y memory views de Python para lectura y escritura directa de memoria de C/C++",
    "Integración de pybind11 I: Creación de bindings de C++ para Python limpios, mapeo de tipos automáticos de STL (vector, map, string)",
    "Integración de pybind11 II: Exposición de clases C++, herencia polimórfica, sobrecarga de operadores y gestión del GIL (Global Interpreter Lock)",
    "Interoperabilidad Java-Python por Sockets: Conectividad bidireccional y llamadas remotas dinámicas entre la JVM y Python usando el framework Py4J",
    "Memoria Compartida con Mmap: Mapeo de archivos de disco a memoria RAM virtual para sincronización ultrarrápida entre Python, Node.js y C++",
    "Unix Domain Sockets: Implementación de sockets de dominio UNIX (AF_UNIX) para comunicación IPC local de latencia inferior al microsegundo",
    "Intercambio de Datos JVM-Python con Arrow: Compartición de datasets tabulares masivos en memoria mediante Apache Arrow sin costo de serialización",
    "Bindings con Rust en Node.js (Neon): Desarrollo de Addons nativos de alto rendimiento y seguridad de memoria usando el framework Neon de Rust",
    "Bindings con Rust en Python (PyO3): Integración de librerías de Rust nativas expuestas como módulos de Python de velocidad extrema",
    "Depuración Concurrente Multiproceso: Uso de herramientas de tracing avanzadas para depurar llamadas cruzadas complejas (ej. Node.js -> C++ -> Python)",
    "Perfilado de Memoria FFI: Uso de Valgrind, LeakSanitizer y Chrome DevTools para detectar y solucionar fugas de memoria en la frontera de lenguajes",
    "Conexión Relacional Compartida en Supabase: Orquestación de accesos concurrentes a la base de datos Supabase desde hilos C++ y scripts Node.js",
    "Mapeo de Estructuras JSONB de PostgreSQL: Compartición y procesamiento estructurado de tipos de datos JSONB dinámicos de Supabase en backends políglotas",
    "Orquestación de Agentes de IA en Python: Invocación interactiva de pipelines de IA (Transformers/LLMs) en Python desde servidores Express.js",
    "Mensajería gRPC y Protocol Buffers I: Definición de esquemas de servicios .proto, generación de código estático y llamadas RPC políglotas",
    "gRPC Bidireccional de Ultra-baja Latencia: Implementación de Streams gRPC bidireccionales en tiempo real entre microservicios C++, Node.js y Python",
    "Triggers y Webhooks de Supabase Políglotas: Captura y distribución de eventos de base de datos a servicios nativos escritos en diferentes lenguajes",
    "Seguridad RLS y Tokens JWT Compartidos: Propagación y validación de tokens JWT de Supabase a través de llamadas FFI y servicios políglotas",
    "Caching Híbrido Distribuido en Redis: Almacenamiento en caché en memoria accesible y compartido por microservicios políglotas y bases de datos Supabase",
    "Transacciones Distribuidas (Saga Pattern): Coordinación y control de consistencia transaccional ACID en sistemas persistentes de lenguajes mixtos",
    "Control de Excepciones Transaccionales en BD: Manejo unificado de errores y rollbacks ante desconexiones de bases de datos externas en APIs híbridas",
    "Arquitectura de Microservicios Políglotas: Coordinación y comunicación asíncrona de servicios utilizando colas de mensajería (RabbitMQ/Apache Kafka)",
    "Inyección de Dependencias Modular FFI: Diseño de un contenedor de dependencias (IoC Container) compatible con servicios nativos dinámicos",
    "Auditoría Dinámica de Fugas FFI: Implementación de herramientas de análisis estático y dinámico para verificar el ciclo de vida de objetos cruzados",
    "Frameworks de APIs Políglotas: Construcción de una puerta de enlace (API Gateway) unificada que enruta llamadas nativas y HTTP a microservicios",
    "Seguridad de Datos e IPC Cifrado: Implementación de cifrado simétrico (AES-GCM) y firmas digitales en comunicaciones IPC y canales de red",
    "Logging Centralizado Asíncrono: Orquestación de sistemas de logs estructurados (Winston/Structlog) consolidados en una única pila asíncrona",
    "Monitoreo Distribuido y Métricas Unificadas: Integración de Prometheus y OpenTelemetry para trazar la latencia a través de la frontera de lenguajes",
    "Resiliencia en FFI (Circuit Breakers): Implementación de aisladores y disyuntores de llamadas nativas para evitar caídas de servidor por fallos C++",
    "Automatización de Builds CMake Políglotas: Configuración avanzada de CMake para la compilación, testeo y empaquetamiento automático de proyectos mixtos",
    "Mapeo Cero-Copia de Gran Escala: Gestión de buffers anillados de memoria compartida para transferencia de flujos de video/audio en tiempo real",
    "Orquestación de Agentes Multi-Lenguaje Autónomos: Agentes de IA autónomos que invocan dinámicamente API nativas (Function Calling en C++/Python/JS)",
    "Procesamiento SIMD Paralelo Compartido: Paralelización mediante instrucciones vectoriales (AVX2/AVX-512) invocables directamente desde entornos JS/Python",
    "Criptografía Cuántica e Interoperabilidad Hardware: Integración de algoritmos de cifrado post-cuántico (Kyber/Dilithium) en librerías C++ y Python",
    "Optimización Numérica Extrema y Renderizado: Motores C++ para cálculo de rutas en paralelo acoplados con pipelines de renderizado gráfico de alta fidelidad",
    "Motores GraalVM y Ejecución Políglota: Configuración de entornos GraalVM para la ejecución inter-lenguaje óptima y compartición directa del Heap de memoria",
    "Tolerancia Extrema a Fallos Nativos: Aislamiento de subprocesos nativos e inyección de fallos controlados para certificar la autorrecuperación del servidor",
    "CI/CD Complejo para Librerías Nativas: Configuración de pipelines GitHub Actions/GitLab CI para la compilación cruzada automatizada y pruebas FFI",
    "Gestión de Recolectores de Basura Híbridos: Coordinación manual del recolector de basura de JS/Python con la gestión de memoria RAII de C++/Rust",
    "Virtualización de Datos Compartidos en Red: Implementación de sistemas de archivos virtuales distribuidos en memoria para acceso ultrarrápido multilingüe",
    "Resiliencia Distribuida y Consenso Políglota: Protocolos de consenso (Raft/Paxos) para la coordinación y consistencia de datos de servidores de misión crítica"
  ],
  "Videojuegos": [
    "Introducción al desarrollo de videojuegos: Historia, motores de juego y lógica del bucle de juego",
    "Arquitectura básica de un videojuego: Bucle de juego (Game Loop), Entrada, Actualización y Render",
    "Coordenadas en 2D: Sistemas cartesianos en pantallas y posicionamiento de píxeles",
    "Configuración de un lienzo de juego: Introducción al elemento Canvas de HTML5",
    "Dibujo básico en Canvas: Rectángulos, círculos y líneas con contextos 2D",
    "Tu primer personaje interactivo: Dibujar y mover un bloque simple por pantalla",
    "Control de entrada de usuario I: Detección de eventos del teclado (keydown, keyup)",
    "Control de entrada de usuario II: Lectura de coordenadas del ratón (mouse events)",
    "Física básica en videojuegos: Velocidad, aceleración y fricción de movimiento simples",
    "Detección de colisiones elementales: Colisiones entre rectángulos alineados por ejes (AABB)",
    "Animación por fotogramas: Renderizado secuencial de sprites y control de frames",
    "El tiempo en videojuegos: Manejo de FPS (cuadros por segundo) y retardo de tiempo delta",
    "Estructuras de datos para videojuegos: Colecciones de entidades de juego y arreglos de proyectiles",
    "Introducción al diseño de niveles: Mapeo de pantallas mediante matrices de celdas simples",
    "Sonidos en videojuegos: Reproducción básica de efectos de audio con Web Audio API",
    "Estados del juego: Menú de inicio, pantalla de juego activo, pausa y game over",
    "Puntajes y persistencia: Creación de marcadores numéricos y almacenamiento del High Score",
    "Optimización de rendering básico: Limpieza de canvas (clearRect) y requestAnimationFrame",
    "Introducción a motores de juego modernos: Qué ofrecen Unity, Godot y Unreal Engine",
    "Estructura de escenas y nodos en motores de juego: Organización jerárquica de elementos",
    "Matemáticas Esenciales 2D I: Representación de vectores 2D, suma, resta, normalización y cálculo de distancias euclidianas",
    "Matemáticas Esenciales 2D II: Producto punto (Dot Product) para ángulos de visibilidad y producto cruz (Cross Product) para orientación",
    "Trigonometría Aplicada a Videojuegos: Funciones trigonométricas (sin, cos, atan2) para rotaciones, movimiento circular y trayectorias parabólicas",
    "Bucle de Juego Básico (Game Loop): Estructuración del ciclo clásico de eventos: Procesar Entrada, Actualizar Lógica de Juego y Renderizar Escena",
    "Ciclo de Renderizado e Hilos: Sincronización del bucle con los refrescos de pantalla mediante requestAnimationFrame y prevención de Screen Tearing",
    "Canvas HTML5 y Dibujado Primitivo: Renderizado eficiente de formas geométricas simples (rectángulos, círculos, líneas) y manipulación de píxeles",
    "Sistemas de Coordenadas de Pantalla: Conversión entre coordenadas del mundo (World Space) y coordenadas de visualización en pantalla (Screen Space)",
    "Estructuración Básica de una Escena: Concepto de Grafo de Escena (Scene Graph) elemental, jerarquía de nodos padres e hijos y transformaciones",
    "Carga de Recursos y Sprites: Técnicas de precarga de imágenes asíncronas, almacenamiento en memoria y renderizado de porciones de imágenes",
    "Persistencia del Estado del Juego: Guardado y lectura de puntuaciones (High Scores) y progreso del jugador utilizando persistencia local estructurada",
    "Detección de Colisiones Básica I: Algoritmos de intersección círculo-círculo y cajas de colisión delimitadoras alineadas con los ejes (AABB 2D)",
    "Animación por Spritesheets: Animación de sprites mediante el recorte secuencial y temporizado de texturas compuestas de múltiples frames",
    "Máquinas de Estado Finito (FSM): Implementación del patrón State para regular los comportamientos del personaje (Quiet, Corriendo, Saltando, Cayendo)",
    "Manejo de Audio y Efectos Sonoros: Uso de Web Audio API e integración de canales de efectos de sonido (SFX) y música de fondo con loops",
    "Temporizadores y Delta Time: Implementación del factor Delta Time (dt) en los cálculos de velocidad física para asegurar movimiento uniforme a cualquier FPS",
    "Introducción a Pygame en Python: Inicialización del motor Pygame, manejo del bucle de eventos, dibujo en pantalla y control de frames por segundo",
    "Interfaces y HUDs Responsivos: Creación y maquetación de pantallas de Heads-Up Display (HUD) responsivas para barras de salud y barras de energía",
    "Sistemas de Partículas Elementales: Generación y simulación física de partículas con ciclo de vida dinámico para efectos de humo, chispas y fuego",
    "Interfaces Gráficas para Menús: Maquetación de pantallas de menú de juego interactivas con estados de botón (Hover, Activo, Deshabilitado)",
    "Persistencia de Partidas Guardadas: Serialización estructurada de variables del estado del mundo y del jugador para guardado y restauración de partidas",
    "Matemáticas 3D Avanzadas I: Representación y multiplicación de matrices de transformación (Escala, Rotación, Traslación) en espacios afines",
    "Matemáticas 3D Avanzadas II: Proyecciones en perspectiva y ortográficas, y definición de la matriz de cámara (View Matrix)",
    "Cuaterniones y Rotaciones 3D: Rotación tridimensional sin bloqueos de cardán (Gimbal Lock) usando cuaterniones e interpolación esférica (SLERP)",
    "Modelado de Mapas por Mosaicos (Tiled): Diseño e importación de mapas basados en cuadrículas (Tilemaps) y capas de colisiones desde Tiled",
    "Controladores Gamepad API: Integración de gamepads físicos en el navegador, mapeo de botones, gatillos analógicos y joysticks de dirección",
    "Introducción a Godot Engine (GDScript): Estructura de escenas y nodos en Godot, desarrollo de scripts básicos en GDScript y ciclo de vida de nodos",
    "Importación de Modelos 3D y Texturas: Carga e integración de meshes tridimensionales (.obj/.gltf) y mapeo UV de texturas en tiempo real",
    "Iluminación Básica en 3D: Implementación del modelo de sombreado Phong (Luz ambiental, difusa y especular) y cálculo de normales de superficie",
    "Cámaras Interactivas 3D: Programación de cámaras en primera persona (cámara libre/FPS) y tercera persona con seguimiento suave del personaje",
    "Colisiones en Entornos 3D: Algoritmos de colisión 3D elementales (Esfera vs Esfera, AABB 3D vs AABB 3D, y Raycasting contra planos)",
    "Física de Cuerpos Rígidos: Simulación de fuerzas, masa, gravedad, aceleración, fricción y velocidad en cuerpos rígidos (Rigidbodies)",
    "Colisiones Elásticas Complejas: Resolución matemática de colisiones físicas dinámicas con transferencia de momento lineal y rebotes angulares",
    "Sistemas de Partículas Avanzados: Partículas dinámicas afectadas por fuerzas del entorno (gravedad local, campos de fuerza y colisiones con el suelo)",
    "Algoritmos de Búsqueda de Caminos: Implementación de Pathfinding A* (A-Estrella) optimizado para la navegación de enemigos sobre rejillas 2D",
    "Inteligencia Artificial para Enemigos: Máquinas de estados jerárquicas y sistemas de percepción sencillos (conos de visión y escucha)",
    "Serialización de Mapas JSON Dinámicos: Parseo de datos estructurados de niveles y spawners de enemigos para carga progresiva de escenarios",
    "Exportación de Puntuaciones Corporativas: Generación de reportes dinámicos de torneos y clasificaciones de jugadores en archivos Excel/Word",
    "Persistencia de Partidas en la Nube: Sincronización segura de perfiles de jugadores e inventarios en bases de datos externas de Supabase",
    "Webhooks y Alertas para Records Globales: Configuración de alertas automáticas en canales de comunicación externa cuando un récord es superado",
    "Chatbots Conversacionales con NPCs: Integración de APIs de Inteligencia Artificial para dotar a personajes no jugables (NPCs) de diálogo adaptativo",
    "Programación de Shaders Gráficos I: Arquitectura del pipeline gráfico, vertex shaders y fragment shaders en lenguajes GLSL o HLSL",
    "Programación de Shaders Gráficos II: Efectos de post-procesamiento (Blur, Vignette, Bloom, corrección gamma) operados en la GPU",
    "Optimización mediante Texture Atlases: Agrupación de múltiples texturas en una sola imagen de gran tamaño para optimizar accesos de memoria gráfica",
    "GPU Batching y Reducción de Draw Calls: Agrupamiento dinámico y estático de geometría para minimizar llamadas de dibujado de la CPU a la GPU",
    "Árboles de Comportamiento (Behavior Trees): Implementación de árboles de comportamiento modulares y reutilizables para IAs complejas de combate",
    "Notificaciones Masivas WhatsApp del Juego: Integración de mensajería asíncrona para notificar a los jugadores de desafíos activos",
    "Inyección de Dependencias en Motores: Patrones de estructuración desacoplada en Unity y Godot para inyectar configuraciones globales de red",
    "Predicción de Trayectorias por IA: Algoritmos predictivos entrenados y ejecutados en segundo plano para cálculo de intercepciones y puntería de enemigos",
    "Simulación Dinámica de Economías: Algoritmos de flujo para regular precios, stocks y recompensas dinámicas basadas en las acciones del jugador",
    "Pruebas Automatizadas de Rendimiento: Implementación de agentes robóticos autónomos de control para testear la estabilidad y rendimiento del juego",
    "Redes en Videojuegos I: Protocolos de comunicación en red optimizados (UDP frente a TCP) para el intercambio de estado del juego",
    "Arquitectura Cliente-Servidor para Juegos: División del bucle de juego en simulación autoritativa en el servidor y renderizado en el cliente",
    "Sincronización de Estado y Predicción: Implementación de la predicción de movimientos del lado del cliente para eliminar el lag percibido",
    "Interpolación y Compensación de Latencia: Suavizado del movimiento de jugadores remotos por interpolación y rebobinado de colisiones en el servidor",
    "Base de Datos Supabase para Emparejamientos: Implementación de colas de emparejamiento (Matchmaking) y salas de juego activas en tiempo real",
    "RLS y Seguridad de Datos del Jugador: Políticas estrictas de Row Level Security para evitar que los jugadores manipulen puntuaciones de otros",
    "Persistencia de Inventarios y Transacciones: Almacenamiento transaccional robusto en base de datos externa de la compra/venta de ítems del jugador",
    "Triggers SQL Anti-Cheat: Implementación de triggers en base de datos para detectar inconsistencias físicas de teletransporte o velocidad",
    "Optimización de Base de Datos Concurrente: Diseño de índices y consultas PostgreSQL optimizadas para la lectura e inserción rápida de datos de red",
    "Profiling del Rendimiento de CPU/GPU: Uso de analizadores de rendimiento (Unity Profiler, RenderDoc) para identificar cuellos de botella de hardware",
    "Arquitectura ECS (Entity Component System) I: Diseño de juegos orientados a datos frente a orientados a objetos, desacoplamiento absoluto de datos",
    "Arquitectura ECS (Entity Component System) II: Creación de sistemas de procesamiento masivo de datos con alineación en memoria cache-friendly",
    "Físicas Paralelizadas Multihilo: Diseño de un motor de física personalizado paralelizado mediante tareas y distribución en hilos de CPU",
    "Orquestación de Servidores de Juego: Despliegue, escalado dinámico y balanceo de carga de instancias de servidores de juego autoritativos en red",
    "Resiliencia de Conexión en Red: Reconexión en caliente y restauración del estado del juego tras cortes de red temporales (failover de red)",
    "Procesamiento de Mapas Masivos Dinámicos: Algoritmos de carga y descarga dinámica de porciones de mapa (Streaming de mundos) basados en la posición",
    "Concurrencia en Colas de Entrada de Comandos: Manejo de búferes de entrada y resolución de órdenes concurrentes en servidores de juegos multijugador",
    "Logging Asíncrono y Monitorización: Sistemas de logging optimizados para servidores en caliente y recolección de telemetría de jugadores",
    "Automatización de Builds Multiplataforma: Pipelines de CMake/Gradle para compilar y empaquetar de forma automatizada versiones de escritorio y móviles",
    "Virtualización de Listas de Inventario: Técnicas de pooling de elementos de interfaz para soportar inventarios de miles de objetos sin degradar FPS",
    "Programación Gráfica de Bajo Nivel I: Conceptos clave del funcionamiento de Vulkan y DirectX 12, gestión de memoria gráfica manual",
    "Programación Gráfica de Bajo Nivel II: Creación de colas de renderizado, búferes de comandos de GPU y pasaje directo de datos a la tarjeta gráfica",
    "Trazado de Rayos (Ray Tracing) Nativo: Integración de algoritmos de sombreado por trazado de rayos por hardware en pipelines personalizados",
    "Simulación Física Paralelizada en GPU: Motores físicos personalizados para fluidos, telas y destrucciones de terreno utilizando GPGPU (Compute Shaders)",
    "Agentes de IA Autónomos en el Servidor: Personajes no jugables guiados por modelos locales de lenguaje integrados de forma asíncrona",
    "Criptografía y Seguridad de Memoria: Algoritmos de protección de memoria RAM del juego contra software de inyección y lectura de punteros",
    "Virtualización e Infinity Terrain: Algoritmos de generación procedimental infinita de terrenos tridimensionales con streaming a nivel de GPU",
    "Testing de Regresión Visual Automático: Pipelines automatizados de ejecución de pruebas mediante visión artificial para certificar bugs gráficos",
    "Automatización de Despliegues en Nube: Pipelines para aprovisionar y actualizar de forma automatizada servidores de juego en múltiples regiones",
    "Resiliencia Distribuida y Servidores Masivos: Arquitecturas de red distribuidas con tolerancia a fallos de hardware en servidores masivos multijugador (MMO)"
  ],
  "IA": [
    "Introducción a la Inteligencia Artificial: Historia, conceptos clave y diferencias con la programación tradicional",
    "Ramas de la Inteligencia Artificial: Aprendizaje automático, procesamiento del lenguaje y visión artificial",
    "El flujo de datos en IA: Captura, preprocesamiento y etiquetado de datos elementales",
    "Concepto de modelo y entrenamiento: Cómo aprende una computadora mediante ejemplos",
    "Instalación de entornos científicos: Introducción a Google Colab, Jupyter Notebooks y Python científico",
    "Bibliotecas básicas de datos: Uso simple de NumPy para matrices y arreglos numéricos",
    "Manipulación de tablas de datos: Introducción a Pandas para leer archivos CSV",
    "Visualización de datos básica: Creación de gráficos sencillos con Matplotlib",
    "Introducción a la regresión lineal: Predecir un valor continuo a partir de datos históricos",
    "Introducción a la clasificación simple: Clasificar correos en spam/no-spam",
    "Métricas de evaluación básicas: Precisión (Accuracy) y errores en modelos predictivos",
    "Introducción a las redes neuronales: Inspiración biológica y neuronas artificiales simples",
    "Concepto de pesos y sesgos: Ajustes numéricos de las neuronas artificiales",
    "Funciones de activación básicas: Umbrales lógicos y no-linealidad simple",
    "Procesamiento de Lenguaje Natural (PLN): Conceptos de tokens y análisis de texto básico",
    "Uso de APIs de Inteligencia Artificial: Conexión con modelos de lenguaje de OpenAI o Groq",
    "Prompts de sistema y de usuario: Estructuración básica de instrucciones para IA",
    "Modelos de generación de imágenes: Conceptos iniciales de difusión y generación de prompts",
    "Ética en Inteligencia Artificial: Sesgos en los datos de entrenamiento y uso responsable",
    "El futuro de la IA: Agentes inteligentes y automatización cognitiva básica",
    "Fundamentos de Machine Learning: Aprendizaje Supervisado, No Supervisado y por Refuerzo, y flujo de trabajo en ciencia de datos",
    "Regresión Lineal y Logística: Bases matemáticas del modelado predictivo, funciones de costo y estimación de parámetros",
    "Álgebra Lineal para IA: Representación de tensores, multiplicación de matrices de alta dimensión y operaciones vectoriales óptimas",
    "Introducción a Redes Neuronales: Concepto del perceptrón unitario, combinaciones lineales y funciones de umbral",
    "Frameworks Core (TensorFlow): Instalación, estructura de grafos de cómputo y definición de modelos secuenciales básicos",
    "Frameworks Core (PyTorch): Inicialización de tensores, autograd y diseño de tensores dinámicos en PyTorch",
    "APIs de LLMs Comerciales: Conexión nativa con APIs de OpenAI y Anthropic, y gestión de límites de consumo y cuotas de red",
    "APIs de LLMs Libres (Groq): Integración del SDK de Groq, configuraciones de variables de entorno y llamadas REST de alto rendimiento",
    "Embeddings de Texto Conceptuales: Transformación de texto libre a vectores densos mediante modelos de embeddings livianos",
    "Procesamiento de Lenguaje Natural (NLP): Limpieza de texto, tokenización, remoción de stop words y análisis de frecuencias",
    "Redes Neuronales Multicapa (MLP): Arquitectura de capas ocultas densas, propagación hacia adelante (Forward Propagation) y backpropagation",
    "Funciones de Activación en Detalle: Comportamiento matemático e impacto en el gradiente de ReLU, Sigmoidea, Tanh y Softmax",
    "Optimización de Descenso de Gradiente: Descenso de gradiente estocástico (SGD), momentum y algoritmos adaptativos (Adam/RMSprop)",
    "Embeddings de Texto II: Generación programática de vectores densos usando modelos preentrenados y APIs de embeddings de Supabase",
    "Clasificación Multiclase: Diseño de capas de salida para clasificación excluyente y no excluyente, y métricas de precisión",
    "Métricas de Evaluación de Modelos: Cálculo e interpretación de precisión, recall, F1-score, matrices de confusión y curvas ROC",
    "Regularización en Redes Neuronales: Técnicas para evitar el sobreajuste (Overfitting) mediante Dropout y penalizaciones L1/L2",
    "Normalización de Datos en IA: Escalado MinMax, estandarización Z-score y Batch Normalization para acelerar el entrenamiento",
    "Manipulación de Datasets de Texto: Preparación, división de conjuntos de entrenamiento/validación/prueba y limpieza de caracteres especiales",
    "Procesamiento de Secuencias con N-gramas: Modelado de lenguaje tradicional basado en probabilidades y cadenas de Markov de texto",
    "Redes Convolucionales (CNN) I: Operaciones de convolución 2D, pooling (Max/Average) y extracción de características en imágenes",
    "Redes Convolucionales (CNN) II: Arquitecturas clásicas (LeNet, AlexNet) y su aplicación para clasificación de imágenes",
    "Redes Recurrentes (RNN): Procesamiento de secuencias de longitud variable, bucles recurrentes y el problema del desvanecimiento del gradiente",
    "LSTMs y GRUs: Arquitectura de celdas recurrentes con compuertas de memoria para retener información a largo plazo en texto",
    "PyTorch Dataset y DataLoader: Creación de pipelines de carga de datos dinámicos con procesamiento por lotes (batching) y barajado",
    "Embeddings Vectoriales en Supabase: Configuración de la extensión pgvector y creación de tablas vectoriales para almacenamiento persistente",
    "Búsqueda Semántica Vectorial: Queries SQL de similitud de coseno y distancia Euclidiana sobre pgvector en bases de datos Supabase",
    "Transfer Learning en Visión Computacional: Uso de modelos preentrenados (ResNet) y ajuste de capas finales para tareas específicas",
    "Preparación de Datos Geoespaciales para IA: Procesamiento estadístico de coordenadas GPS e índices espaciales para modelos predictivos",
    "Detección de Anomalías Estadística: Algoritmos no supervisados básicos (Isolation Forest, One-Class SVM) para detección de datos corruptos",
    "Arquitectura de Transformers I: Mecanismo de auto-atención (Self-Attention) y codificación de posición (Positional Encoding)",
    "Arquitectura de Transformers II: Estructura Encoder-Decoder, y evolución a modelos decoder-only (GPT) y encoder-only (BERT)",
    "Fine-Tuning de Modelos Pequeños (SLMs): Ajuste de parámetros de modelos locales (como Llama 3B/Phi-3) mediante técnicas PEFT y LoRA",
    "Estructuración de Prompts Avanzada: Prompting de pocos ejemplos (Few-Shot), cadena de pensamiento (Chain of Thought) y system instructions",
    "Streaming de Respuestas de LLMs: Consumo y procesamiento dinámico de tokens en streaming mediante Server-Sent Events en Node.js y Python",
    "Bases de Datos Vectoriales Dedicadas: Integración de APIs de bases de datos vectoriales comerciales (Pinecone) e híbridas (ChromaDB)",
    "Indexación HNSW en pgvector: Optimización de búsquedas vectoriales a gran escala mediante la creación de índices HNSW y optimización de IVFFlat",
    "Generación Sintética de Datos con IA: Algoritmos y prompts para la creación estructurada de catálogos y registros lógicos simulados",
    "Reconocimiento de Voz y Transcripción: Integración de APIs de conversión de voz a texto y procesamiento de audio local mediante modelos Whisper",
    "Procesamiento de Datos en Lotes para LLMs: Inferencia masiva en lote optimizada y colas asíncronas de peticiones de IA",
    "RAG Avanzado (Retrieval-Augmented Generation): Técnicas de fragmentación (chunking), re-ranking de resultados y recuperación híbrida",
    "Agentes de IA Conversacionales: Construcción de chatbots interactivos con gestión dinámica del historial de conversación en base de datos",
    "Memoria de Agente Persistente: Implementación de memoria de contexto a largo plazo acoplada con bases de datos relacionales y vectoriales",
    "LangChain en Producción: Uso de cadenas (Chains), cargadores de documentos, prompts dinámicos y agentes autónomos en LangChain",
    "LlamaIndex para RAG Empresarial: Orquestación de índices de documentos complejos y conectores de datos estructurados y no estructurados",
    "Function Calling Nativo: Configuración de esquemas JSON Schema de herramientas ejecutables por el modelo de IA de forma autónoma",
    "Agentes de IA Coordinadores de APIs: Flujos donde el modelo decide dinámicamente llamar a APIs HTTP externas e integrar los datos",
    "Clasificación y Catalogación Autónoma: Agentes de IA en segundo plano que leen registros de bases de datos y los auto-categorizan",
    "Depuración y Evaluación de Prompts: Uso de frameworks de evaluación (Ragas) para medir la fidelidad y relevancia de respuestas generadas",
    "Optimización de Costos en APIs de IA: Estrategias de caching de prompts, compresión de contexto y selección dinámica de modelos",
    "Sistemas Multi-Agente con CrewAI: Configuración de tareas, roles de agentes, delegación de subtareas e integración en flujos secuenciales",
    "Sistemas Multi-Agente con AutoGen: Programación de conversaciones complejas y resolución cooperativa de problemas entre múltiples LLMs",
    "IA Predictiva de Fondo en Servidor: Integración de modelos scikit-learn entrenados en lote para predicción de demandas de stock en tiempo real",
    "Inferencia Predictiva Asíncrona: Consumo de colas de tareas (BullMQ) para calcular estimaciones de inventario y guardar resultados en Supabase",
    "APIs de Visión Computacional: Integración de modelos de detección de objetos en tiempo real (YOLO) a través de APIs de backend",
    "Streaming de Tokens de Audio Complejo: Pipelines de conversión texto a voz (TTS) en streaming asíncrono para interfaces interactivas",
    "Orquestación de Pipelines de Inferencia: Coordinación de llamadas a múltiples modelos de IA de forma paralela y mezcla de resultados",
    "Preprocesamiento de Big Data para IA: Optimización de pipelines de datos masivos (Pandas, Dask) para alimentación de algoritmos predictivos",
    "Modelos Híbridos (Clásicos + LLMs): Integración de predictores numéricos estadísticos como herramientas de entrada para agentes conversacionales",
    "Pruebas de Estrés en Inferencia de LLMs: Simulación de alta concurrencia de llamadas concurrentes a APIs de IA y control de cuellos de botella",
    "LLMs Locales con Ollama: Despliegue de modelos de lenguaje en servidores locales, configuración de Modelfiles y llamadas HTTP locales",
    "LLMs Locales con Llama.cpp: Compilación nativa, cuantización de modelos a formato GGUF y optimización del uso de CPU y GPU locales",
    "Modelos de IA Locales en Frontend: Carga y ejecución de modelos cuantizados ONNX Runtime Web en el navegador mediante WebGL y WebGPU",
    "Escalabilidad de Servidores de Inferencia: Despliegue distribuido de APIs de modelos locales utilizando balanceadores de carga y colas de inferencia",
    "Auditoría y Trazabilidad de Prompts: Registro estructurado de cada prompt enviado y token recibido para auditorías de seguridad y costos",
    "Privacidad y Anonimización de Datos: Algoritmos de enmascaramiento y anonimización de datos sensibles antes de enviarlos a APIs de IA externas",
    "Logging Centralizado de Inferencia: Pila de logs optimizada para rastreo de latencias de modelos, tiempos de primer token y cuellos de botella",
    "Resiliencia en Servicios de IA (Failover): Rutas alternativas dinámicas que redirigen la petición a modelos locales si la API externa falla",
    "Seguridad contra Inyección de Prompts: Técnicas de validación y sanitización de inputs del usuario para evitar desvíos del comportamiento del LLM",
    "Monitoreo de Deriva de Modelos (Drift): Seguimiento de métricas de rendimiento en producción para identificar la degradación del predictor clásico",
    "Aprendizaje por Refuerzo a Escala: Algoritmos de optimización de políticas de recompensa aplicados a control logístico complejo",
    "Compilación de Modelos con TensorRT: Optimización de redes neuronales profundas para máxima velocidad de inferencia en hardware específico Nvidia",
    "Criptografía en Privacidad de Datos IA: Implementación de cifrado homomórfico básico y privacidad diferencial para entrenamiento de modelos",
    "Resiliencia y Tolerancia a Fallos: Diseño de arquitecturas event-driven de IA tolerantes a cortes prolongados de APIs en la nube",
    "Compilación Dinámica JIT de Modelos: Optimización en caliente de grafos de ejecución de PyTorch para despliegues en servidores embebidos",
    "Modelos Multi-Modal locales a escala: Pipelines locales para procesamiento combinado de imágenes, audio y texto en tiempo real",
    "CI/CD Automatizado para Pipelines de IA: Automatización del re-entrenamiento de modelos y despliegue automático en la nube al detectar drift",
    "Optimización de Consumo de GPU en Inferencia: Asignación dinámica de memoria VRAM y técnicas de paralelización tensor en servidores locales",
    "Sistemas de Consenso para Decisiones de IA: Redes de agentes que votan y evalúan respuestas múltiples para garantizar exactitud formal",
    "Orquestación de Flujos de IA de Tiempo Real: Pipelines de ultra-baja latencia para agentes conversacionales con control de voz interactivo completo"
  ],
  "Logica": [
    "Introducción a la lógica de programación: ¿Qué es pensar como programador?",
    "Algoritmos en la vida cotidiana: Descomposición de tareas en pasos finitos y ordenados",
    "Representación de algoritmos: Diagramas de flujo e introducción al pseudocódigo",
    "Estructuras secuenciales: Ejecución secuencial paso a paso de instrucciones",
    "Variables e identificación de datos: Constantes, entradas, salidas y cálculos intermedios",
    "Operadores matemáticos y expresiones: Prioridad de operadores en cálculos aritméticos",
    "Proposiciones lógicas y tablas de verdad: Verdadero, falso y operadores AND, OR, NOT",
    "Decisiones simples: Caminos lógicos de bifurcación única (si, entonces)",
    "Decisiones complejas: Bifurcaciones dobles y múltiples (si-no, switch)",
    "Ciclos repetitivos lógicos I: Bucle mientras (while) con condiciones de parada",
    "Ciclos repetitivos lógicos II: Bucle repetir (do-while) y bucle para (for)",
    "Contadores y acumuladores: Uso de variables para contar eventos y sumar totales",
    "Lógica de validación de datos: Evitar entradas incorrectas en los algoritmos",
    "Funciones y subprocesos lógicos: División de problemas en tareas pequeñas independientes",
    "Estructuras de datos lógicas: Uso abstracto de listas y arreglos unidimensionales",
    "Algoritmos de búsqueda simples: Buscar un elemento en una lista desordenada",
    "Algoritmos de ordenamiento simples: Ordenar una lista mediante el método de burbuja",
    "Lógica de persistencia de datos: Concepto de guardar y recuperar información",
    "Depuración de algoritmos: Pruebas de escritorio manuales con papel y lápiz",
    "Traducir lógica a código: Pasar de pseudocódigo a tu primer lenguaje de programación",
    "Pensamiento Algorítmico Fundacional: Desglose de problemas complejos en pasos atómicos ordenados de forma lógica",
    "Pseudocódigo y Diagramas de Flujo: Representación visual y semántica de algoritmos independientes de la sintaxis del lenguaje",
    "Tipos de Datos Abstractos: Concepto de variables, constantes y estructuras básicas de representación de información",
    "Operadores Lógicos y Tablas de Verdad: Operaciones booleanas complejas (AND, OR, NOT, XOR) y simplificación de expresiones de control",
    "Condicionales Simples y Anidados: Estructuras de decisión lógica (if, else, switch) y optimización de ramas de ejecución",
    "Bucles Definidos e Indefinidos: Lógica de ciclos repetitivos (for, while, do-while), condiciones de parada y prevención de bucles infinitos",
    "Traza de Ejecución de Algoritmos: Seguimiento manual y depuración paso a paso del estado de las variables en la memoria",
    "Recursión Primitiva I: Concepto de llamada recursiva, caso base y caso inductivo mediante cálculo de factoriales",
    "Recursión Primitiva II: Optimización lógica de secuencias recursivas complejas y análisis visual del árbol de llamadas recursivo",
    "Depuración de Errores Lógicos: Identificación y corrección de comportamientos inesperados que no producen errores sintácticos",
    "Estructuras de Datos Lineales Estáticas: Concepto de array y almacenamiento contiguo en memoria de datos homogéneos",
    "Matrices y Tablas Bidimensionales: Manipulación de estructuras de datos bidimensionales e indexación doble para coordenadas cartesianas",
    "Búsqueda Lineal y Binaria Elemental: Algoritmo de búsqueda secuencial y algoritmo de búsqueda binaria sobre arreglos ordenados",
    "Ordenamiento Clásico (Burbuja): Algoritmo Bubble Sort, funcionamiento interno mediante pasadas repetidas y análisis de intercambios",
    "Ordenamiento Clásico (Selección): Algoritmo Selection Sort, búsqueda iterativa del elemento mínimo y su intercambio posicional",
    "Ordenamiento Clásico (Inserción): Algoritmo Insertion Sort, inserción ordenada en sublistas y optimización de desplazamientos",
    "Manipulación de Cadenas por Índices: Algoritmos para inversión de strings, verificación de palíndromos y manipulación de subcadenas",
    "Pilas Primitivas (Stack): Concepto LIFO (Last In, First Out), operaciones Push y Pop, y uso del stack de llamadas del procesador",
    "Colas Primitivas (Queue): Concepto FIFO (First In, First Out), operaciones Enqueue y Dequeue, e implementación con arrays fijos",
    "Estructuras de Control Avanzadas: Optimización de anidamientos lógicos complejos y descomposición de funciones de control redundantes",
    "Recursión Avanzada I: Algoritmos Divide y Vencerás (Divide and Conquer), lógica de partición y resolución recursiva",
    "Recursión Avanzada II: Algoritmos de Backtracking para exploración de espacio de soluciones y resolución del problema de las N Reinas",
    "Ordenamiento Eficiente (QuickSort): Algoritmo de ordenamiento rápido por pivote y particiones dinámicas",
    "Ordenamiento Eficiente (MergeSort): Algoritmo de ordenamiento por mezcla, división recursiva y fusión ordenada de subarrays",
    "Listas Enlazadas Simples: Estructura de nodos con punteros de dirección única, inserción, eliminación y recorrido de nodos dinámicos",
    "Listas Enlazadas Dobles y Circulares: Estructuras de nodos bidireccionales y listas circulares sin fin, y sus casos de uso en memoria",
    "Árboles Binarios de Búsqueda (BST) I: Estructura de nodo de árbol con dos hijos, reglas de orden y algoritmos de inserción",
    "Recorridos de Árboles Binarios: Algoritmos de recorrido Inorder, Preorder y Postorder implementados de forma recursiva",
    "Teoría de Grafos Elemental: Representación de redes mediante vértices y aristas utilizando matrices de adyacencia",
    "Listas de Adyacencia en Grafos: Representación optimizada de grafos dispersos mediante listas dinámicas de nodos adyacentes",
    "Búsqueda en Grafos (BFS): Algoritmo Breadth-First Search para búsqueda en anchura utilizando colas auxiliares",
    "Búsqueda en Grafos (DFS): Algoritmo Depth-First Search para búsqueda en profundidad utilizando pilas o recursión",
    "Algoritmo de Dijkstra: Búsqueda del camino más corto en grafos valorados con pesos no negativos",
    "Complejidad Temporal Big O: Notación asintótica para describir la eficiencia de algoritmos en el peor caso temporal (O(1), O(N), O(log N))",
    "Complejidad Espacial Big O: Análisis del consumo de memoria adicional requerido por algoritmos durante su ejecución",
    "Árboles Auto-balanceables (AVL): Reglas de balanceo de altura por rotaciones simples y dobles ante inserciones",
    "Árboles Rojo-Negro: Estructura de árbol balanceado autocompensado mediante coloreado de nodos y rotaciones lógicas",
    "Estructuras Hash I: Concepto de función hash para direccionamiento directo y mapeo clave-valor en tiempo constante",
    "Resolución de Colisiones Hash: Algoritmos de encadenamiento (Chaining) y direccionamiento abierto (Open Addressing)",
    "Algoritmo de Búsqueda de Subcadenas: Comparaciones de patrones lineales y algoritmos primitivos de búsqueda de texto",
    "Algoritmos Ávidos (Greedy): Lógica de toma de decisiones óptimas locales para alcanzar óptimos globales, y sus limitaciones",
    "Programación Dinámica I: Concepto de Memorización (Memoization) y almacenamiento de subproblemas ya resueltos",
    "Programación Dinámica II: Enfoque de Tabulación (Tabulation) ascendente (Bottom-up) para resolución de problemas iterativos complejos",
    "Grafos Dirigidos Acíclicos (DAG): Ordenamiento topológico de dependencias de tareas lineales y análisis de caminos críticos",
    "Algoritmo de Búsqueda de Texto KMP: Algoritmo Knuth-Morris-Pratt para coincidencia de subcadenas evitando comparaciones redundantes",
    "Algoritmo de Búsqueda Rabin-Karp: Búsqueda de texto mediante funciones de hash rodante (Rolling Hash) para comparaciones rápidas",
    "Colas de Prioridad (Priority Queues): Estructuras de datos de colas ordenadas por prioridad e implementaciones lógicas",
    "Montículos Binarios (Heaps): Estructuras Max-Heap y Min-Heap, algoritmos de inserción, extracción de extremos y HeapSort",
    "Algoritmos de Flujo Máximo I: Conceptos de redes de flujo y algoritmos primitivos para hallar la capacidad máxima de transferencia",
    "Estructuración Dinámica de Memoria: Algoritmos de recolección y compactación lógica de fragmentos de memoria virtuales",
    "Algoritmos Genéticos: Concepto de poblaciones, selección, cruce, mutación y evaluación de aptitud (Fitness) para optimización",
    "Algoritmo de Enfriamiento Simulado: Metaheurística de recocido simulado (Simulated Annealing) para búsqueda de óptimos globales",
    "Problema del Viajante (TSP): Algoritmos heurísticos y aproximados para la resolución óptima de rutas logísticas de vehículos",
    "Árboles de Sufijos (Suffix Trees): Estructuración y optimización de búsquedas de patrones de texto complejas en bases de datos de texto",
    "Algoritmo de Flujo Ford-Fulkerson: Resolución formal de problemas de flujo máximo en redes dirigidas complejas",
    "Optimización Espacial Geométrica: Algoritmos de particionamiento del espacio (Quadtrees, Octrees) para búsquedas de vecindad rápidas",
    "Estructuras de Datos Geográficas: Índices R-Tree para consultas espaciales aceleradas sobre bases de datos de coordenadas GPS",
    "Algoritmos de Agrupamiento (Clustering): Algoritmo K-Means conceptual y su implementación lógica para clasificación no supervisada",
    "Reducción de Problemas NP-Completos: Conceptos de reducibilidad algorítmica y aproximaciones computacionales aceptables",
    "Algoritmos de Compresión Lógicos: Algoritmo de codificación Huffman para compresión sin pérdida basada en frecuencias de caracteres",
    "Estructuras de Datos Distribuidas: Lógica de tablas hash distribuidas (DHT) y particionamiento de datos en red",
    "Consistencia Eventual en Sistemas: Teorías de replicación lógica y resolución de conflictos lógicos de datos concurrentes",
    "Árboles B y B+: Estructuración y lógica interna de índices de bases de datos masivas relacionales de alto rendimiento",
    "Algoritmos Lock-Free en Memoria: Programación concurrente sin bloqueos utilizando operaciones de comparación e intercambio (CAS)",
    "Algoritmos Tolerantes a Particiones: Lógica y estrategias ante fallos de red en el modelo CAP (Teorema de Brewer)",
    "Optimización del Uso de la Caché L1/L2: Algoritmos cache-friendly estructurados para maximizar el hit-rate del procesador",
    "Algoritmos de Enrutamiento de Red: Protocolos de enrutamiento de paquetes óptimos basados en algoritmos de caminos mínimos",
    "Optimización Numérica no Lineal: Algoritmos de optimización de funciones complejas mediante descenso de gradiente conjugado",
    "Estructuras de Datos en Disco: Lógica de organización física de datos en memoria secundaria para reducir operaciones de I/O",
    "Sistemas Event-Driven a Gran Escala: Lógica de procesamiento de eventos concurrentes asíncronos sin pérdida de orden",
    "Algoritmos Probabilísticos Avanzados: Estructuras aproximadas como filtros de Bloom para verificación de pertenencia ultra veloz",
    "Estructuras de Conteo HyperLogLog: Estimación de cardinalidades de conjuntos masivos en memoria de tamaño constante",
    "Algoritmos Criptográficos Asimétricos: Fundamentos matemáticos de RSA y curvas elípticas (ECC) para generación de llaves de cifrado",
    "Protocolos de Consenso Raft: Lógica de elección de líder, replicación de registros y consistencia en sistemas distribuidos",
    "Protocolos de Consenso Paxos: Algoritmo matemático para consenso distribuido tolerante a fallos y particiones de red",
    "Optimización Matemática Lineal Entera: Algoritmos Simplex y de ramificación y acotación (Branch and Bound) para problemas de logística",
    "Análisis Formal de Algoritmos Críticos: Métodos matemáticos formales para demostrar la corrección y robustez de algoritmos de tiempo real",
    "Algoritmos de Encriptación Homomórfica: Operaciones lógicas y matemáticas sobre datos encriptados sin revelar el contenido original",
    "Algoritmos de Privacidad Diferencial: Adición matemática de ruido controlado para proteger datos individuales en datasets estadísticos",
    "Orquestación Algorítmica en Redes Complejas: Coordinación de flujos de ejecución en redes tolerantes a particiones físicas de hardware"
  ],
  "Optimizacion": [
    "Introducción a la eficiencia en el desarrollo de software: Por qué importa la velocidad y el consumo",
    "Recursos del sistema: CPU, Memoria RAM, Almacenamiento en Disco y Ancho de Banda de Red",
    "Identificación de cuellos de botella: Qué ralentiza una aplicación en la práctica",
    "Introducción a la complejidad algorítmica: Concepto intuitivo del rendimiento del código",
    "Medición de tiempo de ejecución básica: Uso de temporizadores en consola para comparar funciones",
    "Optimización de bucles básicos: Evitar cálculos repetitivos dentro de ciclos repetitivos",
    "Uso de memoria eficiente: Creación de objetos y variables estrictamente necesarias",
    "Optimización de almacenamiento de texto: Manipulación y concatenación eficiente de strings",
    "Acceso a bases de datos eficiente: Consultar solo las columnas necesarias (evitar SELECT *)",
    "Optimización de transferencias de red: Reducción del tamaño de los payloads JSON",
    "Concepto de Caché: Almacenamiento temporal de datos costosos para evitar re-cálculos",
    "Caché en el navegador: LocalStorage vs variables en memoria para datos repetidos",
    "Optimización de imágenes en la web: Compresión, formatos modernos (WebP) y resolución",
    "Optimización de carga web: Retardo en la carga de recursos pesados (Lazy Loading)",
    "Minificación de archivos: Reducción del tamaño de JS y CSS para descargas más veloces",
    "Optimización de consultas SQL básicas: El rol de los índices en búsquedas de tablas",
    "Procesamiento concurrente básico: Conceptos de tareas simultáneas vs procesamiento secuencial",
    "Detección de fugas de memoria básicas: Variables globales accidentales y listeners huérfanos",
    "Herramientas de análisis de rendimiento: Introducción a la pestaña Network y Performance de DevTools",
    "Prácticas de código limpio orientadas al rendimiento: Legibilidad vs velocidad del procesador",
    "Gestión de Variables y Memoria: Ciclo de vida de asignaciones, y diferencia básica de consumo entre stacks primitivos y heaps",
    "Perfilado de Ejecución Simple: Uso de herramientas integradas (console.time / console.timeEnd) para medición de tiempos de respuesta",
    "Identificación de Bloqueos de Interfaz: Análisis y prevención de bucles mal estructurados que congelan el hilo principal de ejecución",
    "Consumo de Recursos en Red: Medición elemental de bytes transferidos e impacto de peticiones HTTP redundantes en el rendimiento",
    "Compresión Básica de Assets: Reducción de peso de recursos estáticos (imágenes comprimidas, CSS/JS minificado) para carga inicial",
    "Ciclos de Ejecución Síncronos: Concepto de ejecución bloqueante y su impacto negativo en el rendimiento de la aplicación",
    "Asignación Innecesaria de Memoria: Evitar la creación redundante de objetos dentro de bucles o funciones de alta frecuencia",
    "Limpieza de Variables Temporales: Liberación explícita de referencias a objetos grandes mediante asignación a null",
    "Peticiones HTTP Secuenciales: Lógica de optimización combinando peticiones individuales en llamadas por lotes (batching)",
    "Optimización de Estructuras Condicionales: Ordenamiento de condicionales evaluando primero las opciones más probables",
    "Acceso Eficiente a Variables: Rendimiento comparativo del acceso a variables locales frente a llamadas de scope global",
    "Lazy Loading de Componentes: Carga diferida de código y recursos multimedia para mejorar el tiempo de primera interacción",
    "Minimización de Consultas a Disco: Implementación de cachés de lectura primitivas para evitar accesos repetidos a bases de datos",
    "Optimización de Selectores del DOM: Evitar consultas costosas al DOM mediante el almacenamiento en caché de elementos seleccionados",
    "Asincronía Preventiva: Uso de temporizadores y microtareas para fragmentar procesos largos y no bloquear el hilo de ejecución",
    "Debouncing y Throttling: Control de frecuencia de ejecución de funciones asociadas a eventos repetitivos (Scroll, Resize, Keypress)",
    "Reducción de Carga de Red (Payloads): Envío y recepción de datos estrictamente requeridos eliminando campos de base de datos extraños",
    "Optimización de Bucles (Loop Unrolling): Técnicas de estructuración lógica para reducir el costo de control de ciclos repetitivos",
    "Uso de Estructuras de Datos Compactas: Selección de arrays planos sobre objetos complejos para almacenamiento temporal de datos",
    "Pre-fetching de Recursos Críticos: Carga silenciosa en segundo plano de recursos que el usuario probablemente requerirá después",
    "Gestión de Heap y Stack en Detalle: Análisis del comportamiento del recolector de basura ante asignaciones de heap frecuentes",
    "Identificación de Memory Leaks: Rastreo de referencias huérfanas en memoria (EventListeners no removidos, referencias circulares)",
    "Profiling de CPU en Navegador: Uso de la pestaña Performance de Chrome DevTools para identificar funciones costosas (Hotspots)",
    "Profiling de GPU en Navegador: Monitoreo de tasa de refresco (FPS), capas de renderizado (layers) y renderizados costosos del navegador",
    "Optimización de Índices SQL: Creación y análisis de impacto de índices B-Tree en consultas concurrentes de base de datos relacionales",
    "Compresión de Transferencia GZIP/Brotli: Configuración de compresión en el servidor para reducir drásticamente el peso de datos de red",
    "Memoización de Funciones Costosas: Caching de resultados de funciones matemáticas o algorítmicas pesadas basadas en argumentos de entrada",
    "Estructuras de Datos Indexadas en Memoria: Optimización de búsquedas usando Maps y Sets en lugar de arrays iterados secuencialmente",
    "Reducción de Reflows y Repaints: Escritura de estilos y manipulación del DOM evitando recálculos de diseño geométrico en cascada",
    "Optimización de Conexiones TCP: Reutilización de sockets abiertos mediante configuraciones de Keep-Alive para reducir latencias de handshake",
    "Pools de Conexiones de Base de Datos: Configuración óptima de tamaño de pools de conexiones y reutilización dinámica de sockets relacionales",
    "IndexedDB para Caching Local: Almacenamiento masivo de datos transaccionales en el navegador del cliente para acceso offline veloz",
    "Service Workers y Cache Storage API: Configuración de estrategias de caché (Network First, Cache First) para carga instantánea de la aplicación",
    "Propiedad will-change en CSS: Optimización del pipeline gráfico del navegador forzando la creación de capas de composición en GPU",
    "Critical Rendering Path: Técnicas para optimizar la secuencia de pasos que el navegador realiza para convertir HTML/CSS/JS en píxeles",
    "Pre-renderizado de Páginas (Prerendering): Generación estática o en servidor de vistas complejas para despliegue inmediato en cliente",
    "Optimización de Cargas Útiles JSON: Eliminación de metadatos redundantes y compactación de nombres de atributos en la serialización",
    "Uso de Web Workers en Navegador: Delegación de cómputos pesados a hilos de ejecución secundarios para no congelar la UI principal",
    "Análisis de Consumo de Memoria de Base de Datos: Diagnóstico de buffers de lectura en bases de datos PostgreSQL externas (Supabase)",
    "Paginación y Limitación de Consultas: Evitar volcados de datos masivos implementando paginación eficiente de registros a nivel SQL",
    "Redis como Caché de Alto Rendimiento: Integración de almacenamiento clave-valor en memoria RAM para caching de respuestas de APIs y consultas SQL",
    "Invalidación de Caché en Redis: Estrategias avanzadas de expiración de caché (TTL, invalidación por eventos) para evitar datos inconsistentes",
    "Optimización del Event Loop en Node.js: Técnicas de programación asíncrona para evitar el bloqueo del bucle de eventos principal",
    "Uso de setImmediate y process.nextTick: Lógica fina de secuenciación de callbacks en las diferentes fases del Event Loop en Node.js",
    "Análisis de Heap Snapshots: Uso de volcados de memoria para comparar instantáneas del heap y encontrar fugas de objetos persistentes",
    "Asignadores de Memoria Personalizados: Concepto de asignadores eficientes de memoria (Custom Allocators) en entornos nativos y embebidos",
    "Profiling de Memoria Nativa con Valgrind: Identificación de accesos no válidos a memoria y fugas en librerías nativas usando Memcheck",
    "Pools de Objetos en Memoria (Object Pooling): Reutilización de objetos en memoria para evitar instanciaciones y recolecciones frecuentes",
    "Optimización de Compresión de Imágenes en Vuelo: Pipelines automáticos en servidor para redimensionado y compresión de multimedia",
    "Artillery para Pruebas de Carga Extremas: Simulación de alta concurrencia de peticiones HTTP para identificar límites de rendimiento de APIs",
    "Procesamiento por Streams en Node.js: Lectura y escritura de archivos y sockets por flujos asíncronos para consumo mínimo de memoria RAM",
    "Procesamiento por Streams en Java: Uso de streams reactivos para procesar transacciones sin almacenar colecciones gigantes en el heap",
    "Optimización SQL con EXPLAIN ANALYZE: Diagnóstico detallado del optimizador de consultas PostgreSQL para refactorización de JOINS",
    "Tuning del Garbage Collector en la JVM: Configuración de flags del GC (G1GC, ZGC) para minimizar los tiempos de pausa (Stop-the-World)",
    "Compilación Nativa con GraalVM: Compilación anticipada (AOT) de código Java a binarios nativos independientes para inicio instantáneo",
    "Tuning del Garbage Collector de V8: Configuración y análisis del comportamiento del recolector de basura de JavaScript en backend",
    "Optimización de Serialización Binaria: Implementación de serializadores binarios ultrarrápidos alternativos a JSON para IPC",
    "Compresión de Transferencia a Escala de Base de Datos: Configuración de compresión de flujos de red de base de datos relacionales",
    "Algoritmos de Caching en Memoria Compartida: Implementación de cachés de lectura compartida sin contención de bloqueos",
    "Optimización del Rendimiento en Alta Concurrencia: Ajustes de límites del sistema operativo (u-limit) y configuración de sockets abiertos",
    "Balanceo de Carga y Proxies Inversos: Configuración de Nginx/HAProxy para distribución eficiente de tráfico concurrente",
    "Federación de Módulos (Module Federation): Microfrontends con carga bajo demanda reduciendo drásticamente el peso inicial de bundles",
    "Colas de Tareas Asíncronas (BullMQ): Diferir tareas de procesamiento pesado a workers independientes usando colas respaldadas por Redis",
    "Caching de Nivel 2 (L2 Cache) en Hibernate: Configuración de almacenamiento en caché de entidades para reducir llamadas SQL redundantes",
    "Virtualización de Listas Dinámicas Masivas: Renderizado dinámico de elementos visibles en viewport, soportando millones de ítems en UI",
    "Optimización de Redes de Entrega de Contenido (CDN): Configuración de cachés en el borde (Edge Caching) para servir datos geográficamente",
    "Estrategias de Sharding de Bases de Datos: Particionamiento horizontal de datos para distribuir la carga de almacenamiento y lecturas",
    "Optimización del Tamaño de Bundles: Técnicas avanzadas de Tree Shaking y segmentación de código (Code Splitting) en Vite/Webpack",
    "Monitoreo con OpenTelemetry: Rastreo de latencias extremas a través de múltiples microservicios concurrentes y bases de datos",
    "Resiliencia y Circuit Breakers de Red: Aislamiento automático de servicios degradados para prevenir la saturación de recursos de red",
    "Alineación de Memoria Cache-Friendly: Estructuración lógica de datos orientada a cachés L1/L2 para evitar fallos de caché (Cache Misses)",
    "Paralelización Masiva con Instrucciones SIMD: Uso de intrínsecos de CPU para cálculo vectorial en paralelo y promedios matemáticos veloces",
    "Cifrado Acelerado por Hardware (AES-NI): Configuración de algoritmos criptográficos que utilizan coprocesadores dedicados de CPU",
    "Streaming de Binarios de Gigabytes: Transferencia y filtrado de datos masivos sin almacenamiento intermedio en memoria RAM virtual",
    "Failover Automático de Balanceadores: Arquitectura distribuida con tolerancia a caídas críticas de proxies y balanceadores de red",
    "Optimización Extrema de Buffers de Red: Ajuste fino de buffers TCP/IP del sistema operativo para rendimiento en baja latencia",
    "Compilación AOT en Servidores de Producción: Compilación e inyección dinámica de código máquina optimizado para CPU específica",
    "Arquitecturas de Memoria Cero-Copia (Zero-Copy): Uso de llamadas al sistema sendfile para transferencia directa entre sockets y disco",
    "Sistemas de Consenso Distribuido en Memoria RAM: Replicación de bases de datos clave-valor sin uso de almacenamiento de disco",
    "Monitoreo y Recuperación ante Caídas de Memoria: Algoritmos de reinicio automático y failover instantáneo ante fallos de falta de memoria (OOM)"
  ],
  "MejoraCodigo": [
    "Introducción a la calidad de software: ¿Qué es el código limpio y por qué es rentable a largo plazo?",
    "La legibilidad del código: El uso de nombres descriptivos para variables, funciones y clases",
    "Comentarios en el código: Cuándo son necesarios y cuándo delatan código mal estructurado",
    "Principios de formateo de código: Indentación, espaciado y consistencia de estilo",
    "Funciones de propósito único: El principio de que cada función debe hacer una sola cosa bien",
    "Evitar la duplicación de código: Introducción al principio DRY (Don't Repeat Yourself)",
    "Refactorización básica de código: Modificar la estructura interna sin alterar el comportamiento",
    "Manejo de errores limpio: Uso correcto de try-catch y evitar el silencio de excepciones",
    "Evitar variables globales: Promover el encapsulamiento y paso de parámetros limpio",
    "Control de versiones en la calidad: Commits descriptivos y ordenados con Git",
    "Introducción a la revisión de código (Code Review): El beneficio del feedback de pares",
    "Herramientas de estilo estático: Linter y formateadores automáticos (ESLint, Prettier)",
    "Introducción a las pruebas automatizadas: Por qué los tests garantizan la calidad del código",
    "Principios SOLID básicos: Concepto intuitivo de diseño robusto y mantenible",
    "Manejo de constantes mágicas: Uso de variables configurables en lugar de valores hardcodeados",
    "Complejidad cognitiva básica: Evitar condicionales profundamente aninados (anidamiento excesivo)",
    "Modularización de código: Organización de carpetas y separación de archivos por responsabilidades",
    "Sustitución de condicionales por polimorfismo o diccionarios: Simplificación de estructuras de control",
    "Uso de patrones de diseño comunes: Introducción al patrón de diseño Singleton y Factory",
    "Mantenibilidad a largo plazo: Deuda técnica, obsolescencia y documentación esencial",
    "Principios de Clean Code I: Nombres descriptivos y significativos para variables, funciones, clases y módulos de código",
    "Principios de Clean Code II: Funciones de propósito único, modularización de tareas y longitud óptima de bloques de código",
    "Formateadores de Código Dinámicos: Configuración y uso de herramientas automáticas como Prettier para unificación de estilos visuales",
    "Analizadores de Código Estáticos (Linters): Integración de ESLint/Black para identificación temprana de malas prácticas de sintaxis",
    "Eliminación de Código Muerto: Limpieza de importaciones huérfanas, variables sin utilizar y funciones inalcanzables en producción",
    "Refactorización de Condicionales Complejos: Simplificación de lógica booleana utilizando guards clauses y asignaciones directas",
    "Documentación de Código Semántica: Buenas prácticas de redacción de comentarios explicativos de lógicas arcanas y docstrings",
    "Control de Versiones Limpio: Creación de commits atómicos, mensajes de confirmación semánticos y flujo básico de ramas en Git",
    "Identificación de Código Duplicado: Técnicas básicas para detectar patrones repetitivos y abstraerlos en funciones auxiliares",
    "Pruebas Unitarias Introductorias: Redacción de aserciones lógicas básicas para verificar el comportamiento de funciones simples",
    "Principio DRY (Don't Repeat Yourself): Abstracción y reutilización lógica para evitar la duplicación de código en el proyecto",
    "Desacoplamiento de Funciones: Separación de la lógica de procesamiento de datos de la lógica de presentación o renderizado visual",
    "Control de Errores Estructurado: Uso correcto de try/catch evitando bloques vacíos y capturando excepciones de forma específica",
    "Modularización de Archivos Gigantes: Descomposición de scripts masivos en múltiples submódulos ordenados por responsabilidades",
    "Pruebas Unitarias Estructuradas: Redacción de casos de prueba que cubren flujos exitosos y flujos alternativos de error",
    "Refactorización de Código Espagueti: Técnicas para desenredar flujos secuenciales anidados y transformarlos en llamadas modulares",
    "Uso de Tipado Estático Básico: Tipado de variables y retornos para evitar inconsistencias de tipos en tiempo de ejecución",
    "Sanitización de Entradas en Funciones: Validación de argumentos de entrada para prevenir inconsistencias de ejecución lógicas",
    "Uso de Constantes Globales Unificadas: Evitar el uso de números mágicos y cadenas de texto planas quemadas en el código",
    "Gestión de Dependencias Básica: Limpieza e instalación de paquetes npm/pip estrictamente requeridos eliminando dependencias obsoletas",
    "Principio de Responsabilidad Única (SOLID): Una clase o módulo debe tener una sola razón para cambiar en todo el sistema",
    "Principio Abierto/Cerrado (SOLID): Estructuras de código abiertas para la extensión pero cerradas para la modificación directa",
    "Principio de Sustitución de Liskov (SOLID): Las subclases deben ser sustituibles por sus clases base sin alterar el comportamiento",
    "Principio de Segregación de Interfaces (SOLID): Definición de contratos específicos para evitar interfaces masivas innecesarias",
    "Principio de Inversión de Dependencias (SOLID): Depender de abstracciones y no de implementaciones concretas en la arquitectura",
    "Refactorización de Herencia a Composición: Diseño de relaciones de objetos flexibles prefiriendo composición frente a herencia rígida",
    "Patrón Singleton y Factory: Casos de uso de instanciación única y creación centralizada de objetos en la arquitectura de software",
    "Patrón Observer y Strategy: Implementación de comportamientos reactivos y algoritmos dinámicos intercambiables en tiempo de ejecución",
    "Inyección de Dependencias Simple: Pasaje explícito de servicios requeridos a través de constructores para facilitar la testabilidad",
    "Análisis de Deuda Técnica: Identificación de malas prácticas arquitectónicas y estimación del costo de su refactorización",
    "Arquitectura de Tres Capas (MVC): Organización estructurada del código en capa de Vista, capa de Controlador y capa de Modelo relacional",
    "Clean Architecture Introductoria: Separación estricta de la lógica de negocio (Casos de Uso) de las interfaces externas de red",
    "Mocks y Spies en Pruebas Unitarias: Simulación de llamadas de red y verificación de invocaciones a servicios de terceros en testing",
    "Control de Cobertura de Pruebas (Coverage): Configuración de umbrales mínimos de cobertura de código para certificar compilaciones seguras",
    "Patrones de Comportamiento en UI: Manejo de interfaces complejas mediante la abstracción de estados de carga, error y éxito",
    "Refactorización Estructural Automatizada: Uso de herramientas dinámicas de refactorización integradas en el IDE para renombrados seguros",
    "TypeScript Avanzado para Calidad de Código: Tipos genéricos avanzados y utility types para tipar interfaces dinámicas de red",
    "Manejo de Errores Centralizado: Middleware de Express o manejadores globales de Spring Boot para control unificado de fallos",
    "Auditorías de Dependencias de Seguridad: Ejecución de comandos de auditoría (npm audit, pip-audit) y actualización de parches de seguridad",
    "Refactorización de Consultas SQL a ORM: Migración de queries raw complejas a llamadas estructuradas a través de ORMs (Prisma, SQLAlchemy)",
    "Refactorización de Esquemas de Base de Datos: Migraciones en caliente de tablas, normalización relacional y renombrado de columnas",
    "Inyección de Dependencias con Contenedores IoC: Uso de librerías para resolución automática de dependencias complejas (InversifyJS, Spring)",
    "Diseño de APIs Consistentes: Principios de diseño RESTful, códigos de estado unificados y estructuración de respuestas de error JSON",
    "Auditoría de Vulnerabilidades en Código: Análisis estático de seguridad de código (SAST) para identificar inyecciones SQL y fallos de lógica",
    "Patrones de Diseño Creacionales en Backend: Abstract Factory, Builder y Prototype aplicados a la construcción de objetos complejos",
    "Patrones de Diseño Estructurales en Backend: Adapter, Decorator, Facade y Proxy para simplificar interfaces y accesos a memoria",
    "Pruebas de Integración con Bases de Datos locales: Pruebas automatizadas contra bases de datos en memoria para certificar transacciones SQL",
    "Refactorización de Código Legacy: Estrategias de estrangulamiento y reescritura gradual de módulos antiguos sin detener producción",
    "Configuración de Reglas Personalizadas de Linter: Personalización de reglas estáticas adaptadas a los estándares de desarrollo del equipo",
    "Monitoreo Dinámico de Calidad en Producción: Integración de herramientas de telemetría para capturar fallos no controlados en tiempo real",
    "Arquitectura Hexagonal (Ports & Adapters): Aislamiento absoluto del dominio y lógica de negocio mediante puertos lógicos y adaptadores",
    "Domain-Driven Design (DDD) I: Conceptos de Ubiquitous Language, Bounded Contexts y separación de entidades y objetos de valor (Value Objects)",
    "Domain-Driven Design (DDD) II: Definición de agregados, raíces de agregados, repositorios de persistencia y eventos de dominio",
    "Pruebas de Integración con Testcontainers: Configuración de contenedores Docker dinámicos en tests para ejecutar bases de datos reales",
    "Mocking Dinámico de APIs Externas: Configuración de servidores mock locales (MSW, WireMock) para pruebas de integración asíncronas",
    "Automatización de Formateo mediante Hooks de Git: Configuración de hooks (Husky, lint-staged) para validar código antes del commit",
    "Refactorización de Monolito a Servicios: Estrategias de diseño para separar componentes internos en librerías o módulos desacoplados",
    "Manejo de Transacciones y Consistencia en DDD: Lógica de persistencia de agregados garantizando consistencia a nivel de base de datos",
    "Auditoría de Calidad en Pipelines de CI/CD: Configuración de SonarQube para evaluar la mantenibilidad y calidad antes del merge",
    "Refactorización de Lógica de Negocio en SQL a Backend: Migración de lógica compleja de triggers a casos de uso estructurados en backend",
    "Desacoplamiento a Microservicios: Migración física de módulos a servicios independientes con comunicación de red mediante HTTP/gRPC",
    "Patrones de Diseño Distribuidos: Implementación de consistencia eventual, patrones Saga y segregación de consultas CQRS",
    "Logging Estructurado y Trazabilidad: Configuración de identificadores de correlación (Correlation IDs) para rastrear flujos de logs",
    "Mantenibilidad en Alta Concurrencia: Refactorización de algoritmos bloqueantes a estructuras asíncronas tolerantes a cargas masivas",
    "Análisis Forense de Deuda Técnica: Auditorías profundas de arquitectura utilizando mapas de calor de archivos con mayor frecuencia de fallos",
    "Configuración de Linters Arquitectónicos: Reglas de análisis estático que impiden importaciones no deseadas entre capas (ej. de UI a Dominio)",
    "Seguridad y Cumplimiento de Normativas: Refactorización de código para cumplir con estándares de cifrado y protección de datos (GDPR/HIPAA)",
    "Manejo de Estado Distribuido: Refactorización de servicios de persistencia de sesión a almacenamiento distribuido y seguro en Redis",
    "Pruebas E2E de Flujos Críticos: Configuración de pruebas automatizadas del sistema completo utilizando herramientas de simulación",
    "Optimización del Ciclo de Vida del Software: Integración de análisis dinámico de deudas y estimación automática del costo de mantenimiento",
    "Refactorización a Bajo Nivel Seguro: Sustitución de punteros clásicos por Smart Pointers y bloques de memoria con límites seguros en C++",
    "Métodos Formales de Verificación: Pruebas matemáticas formales para demostrar la ausencia de desbordamientos de memoria en código crítico",
    "Auditorías Automatizadas de Performance en CI/CD: Pruebas de regresión de rendimiento que bloquean compilaciones si se detectan ralentizaciones",
    "Mitigación Extrema de Dependencias: Eliminación y reescritura nativa de librerías de terceros propensas a fallos de seguridad o mantenimiento",
    "Resiliencia y Aislamiento de Código Legacy: Creación de capas de aislamiento mediante microservicios sandboxed para librerías inestables",
    "Refactorización de Protocolos de Comunicación: Migración de llamadas síncronas HTTP a colas de eventos asíncronas para desacoplamiento",
    "Automatización Forense de Memory Dumps: Herramientas para parsear automáticamente volcados de pila ante fallos de segmentación",
    "Optimización de Estructuras Cache-Friendly: Reorganización lógica de atributos de clases para optimizar accesos y evitar cache-misses",
    "Implementación de Motores JIT Seguros: Compilación al vuelo de reglas de negocio dinámicas garantizando la seguridad en caliente",
    "Resiliencia Distribuida ante Particiones de Red: Refactorización de sistemas concurrentes usando algoritmos tolerantes a cortes lógicos"
  ]
};;

function obtenerNivelPorIndice(temaIndice) {
  if (temaIndice <= 15) return 'Novato';
  if (temaIndice <= 30) return 'Principiante';
  if (temaIndice <= 45) return 'Intermedio';
  if (temaIndice <= 60) return 'Avanzado';
  if (temaIndice <= 70) return 'Experto';
  if (temaIndice <= 80) return 'Master';
  if (temaIndice <= 90) return 'Arquitecto';
  return 'Leyenda';
}

// Funciones auxiliares para gestionar el progreso por tecnología
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

// RUTA: Registrar / obtener estudiante por nombre
app.post('/api/estudiantes', async (req, res) => {
  const { nombre, tecnologia } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

  const techValida = TEMARIOS[tecnologia] ? tecnologia : 'JavaScript';

  try {
    let query = 'SELECT * FROM profesor_estudiantes WHERE nombre = $1';
    let result = await client.query(query, [nombre]);

    if (result.rows.length > 0) {
      const estudiante = result.rows[0];
      
      // Guardar progreso de la tecnología anterior del estudiante antes de cambiar
      await guardarProgreso(estudiante.id, estudiante.tecnologia_actual, estudiante.nivel_actual, estudiante.tema_indice);
      
      // Obtener el progreso de la nueva tecnología seleccionada
      const prog = await obtenerProgreso(estudiante.id, techValida);
      
      // Actualizar la tabla principal con la nueva tecnología y su respectivo progreso
      const updateQuery = `
        UPDATE profesor_estudiantes 
        SET tecnologia_actual = $1, nivel_actual = $2, tema_indice = $3
        WHERE id = $4
      `;
      await client.query(updateQuery, [techValida, prog.nivel_actual, prog.tema_indice, estudiante.id]);
      
      const selectQuery = 'SELECT * FROM profesor_estudiantes WHERE id = $1';
      const updatedStudent = await client.query(selectQuery, [estudiante.id]);
      return res.json(updatedStudent.rows[0]);
    }

    // Crear nuevo estudiante con UUID generado localmente
    const uuid = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO profesor_estudiantes (id, nombre, nivel_actual, tecnologia_actual, tema_indice)
      VALUES ($1, $2, 'Novato', $3, 1)
    `;
    await client.query(insertQuery, [uuid, nombre, techValida]);

    const selectQuery = 'SELECT * FROM profesor_estudiantes WHERE id = $1';
    const newStudentRes = await client.query(selectQuery, [uuid]);
    const newStudent = newStudentRes.rows[0];
    
    // Inicializar el progreso de la tecnología elegida
    await guardarProgreso(newStudent.id, techValida, 'Novato', 1);
    
    res.json(newStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al gestionar estudiante' });
  }
});

// RUTA: Obtener estado actual de tareas del estudiante
app.get('/api/estudiantes/:id/estado', async (req, res) => {
  const { id } = req.params;

  try {
    const estudianteResult = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [id]);
    if (estudianteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }
    const estudianteRaw = estudianteResult.rows[0];
    const estudiante = { ...estudianteRaw };
    
    // Garantizar estructura pragma_profile por defecto
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

    if (estudiante.pragma_profile) {
      try {
        estudiante.pragma_profile = typeof estudiante.pragma_profile === 'string'
          ? JSON.parse(estudiante.pragma_profile)
          : estudiante.pragma_profile;
      } catch (e) {
        console.error("Error al parsear pragma_profile:", e);
        estudiante.pragma_profile = defaultPragmaProfile;
      }
    } else {
      estudiante.pragma_profile = defaultPragmaProfile;
    }

    if (estudiante.perfil_cognitivo) {
      try {
        estudiante.perfil_cognitivo = typeof estudiante.perfil_cognitivo === 'string'
          ? JSON.parse(estudiante.perfil_cognitivo)
          : estudiante.perfil_cognitivo;
      } catch (e) {
        console.error("Error al parsear perfil cognitivo:", e);
        estudiante.perfil_cognitivo = null;
      }
    } else {
      estudiante.perfil_cognitivo = null;
    }

    const tareasResult = await client.query(
      'SELECT * FROM profesor_tareas WHERE estudiante_id = $1 ORDER BY creado_en DESC',
      [id]
    );

    const tareas = [];
    for (const tarea of tareasResult.rows) {
      const entregasResult = await client.query(
        'SELECT * FROM profesor_entregas WHERE tarea_id = $1 ORDER BY fecha_entrega DESC',
        [tarea.id]
      );

      // Algoritmo de resolución de URL de Word para retrocompatibilidad
      let wordUrl = tarea.word_url;
      if (!wordUrl) {
        try {
          const archivos = fs.readdirSync(tareasPublicDir);
          const prefijo = `tarea_${id}_`;
          const candidatos = archivos.filter(f => f.startsWith(prefijo) && f.endsWith('.docx'));
          
          if (candidatos.length > 0) {
            const tareaTime = new Date(tarea.creado_en).getTime();
            let mejorCandidato = candidatos[0];
            let diferenciaMinima = Infinity;
            
            for (const f of candidatos) {
              const parts = f.replace('.docx', '').split('_');
              const fileTimestamp = parseInt(parts[parts.length - 1], 10);
              if (!isNaN(fileTimestamp)) {
                const diff = Math.abs(fileTimestamp - tareaTime);
                if (diff < diferenciaMinima) {
                  diferenciaMinima = diff;
                  mejorCandidato = f;
                }
              }
            }
            wordUrl = `/descargas/${mejorCandidato}`;
          }
        } catch (e) {
          console.error("Error al resolver dinámicamente el Word antiguo:", e);
        }
      }

      let techTarea = tarea.tecnologia;
      if (!techTarea) {
        for (const [techKey, temas] of Object.entries(TEMARIOS)) {
          if (temas.includes(tarea.tema)) {
            techTarea = techKey;
            break;
          }
        }
        if (!techTarea) techTarea = estudiante.tecnologia_actual;
      }

      tareas.push({
        ...tarea,
        tecnologia: techTarea,
        word_url: wordUrl,
        entregas: entregasResult.rows
      });
    }

    res.json({
      estudiante,
      tareas,
      temario: TEMARIOS[estudiante.tecnologia_actual] || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al obtener el estado' });
  }
});

// RUTA: Generar Tarea y documento Word
app.post('/api/generar-tarea', async (req, res) => {
  const { estudiante_id, tecnologia, nivel } = req.body;
  if (!estudiante_id || !tecnologia || !nivel) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  try {
    // 1. Obtener datos actualizados del estudiante
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    // 2. Validar que no haya tareas pendientes activas (con calificación < 80)
    const activeTasksQuery = `
      SELECT t.* FROM profesor_tareas t
      LEFT JOIN (
        SELECT tarea_id, MAX(puntaje) as max_score 
        FROM profesor_entregas 
        GROUP BY tarea_id
      ) e ON t.id = e.tarea_id
      WHERE t.estudiante_id = $1 AND t.tema = $2 AND (e.max_score IS NULL OR e.max_score < 90)
    `;
    const activeTasks = await client.query(activeTasksQuery, [estudiante_id, tecnologia]);
    if (activeTasks.rows.length > 0) {
      return res.status(400).json({
        error: 'Tienes una tarea pendiente. Debes adquirir una calificación de 90 o superior para poder generar una nueva.'
      });
    }

    // 3. Determinar el tema correspondiente del plan de estudios
    const listaTemas = TEMARIOS[tecnologia] || TEMARIOS['JavaScript'];
    let temaIndice = estudiante.tema_indice;

    // Si superó todos los temas (80)
    if (temaIndice > listaTemas.length) {
      return res.status(400).json({
        error: '¡Felicidades! Has completado con éxito todos los temas y niveles del plan de estudios de esta tecnología.'
      });
    }

    // Asegurarse de que el nivel_actual en base de datos esté alineado con el temaIndice
    const nivelReal = obtenerNivelPorIndice(temaIndice);
    if (estudiante.nivel_actual !== nivelReal) {
      await client.query(
        'UPDATE profesor_estudiantes SET nivel_actual = $1 WHERE id = $2',
        [nivelReal, estudiante_id]
      );
      await guardarProgreso(estudiante_id, tecnologia, nivelReal, temaIndice);
      estudiante.nivel_actual = nivelReal;
    }

    const temaActual = listaTemas[temaIndice - 1];

    // 4. Generar el contenido con Groq en formato JSON
    const systemPrompt = `
      Eres un Profesor de IA con pedagogía adaptativa para ingenieros de software. Diseñas planes de estudio, guías teóricas y retos de código adaptando estrictamente la complejidad teórica, la profundidad y la dificultad del código al nivel especificado: "${nivelReal}".
      Debes responder estrictamente en formato JSON válido.

      DIRECTRICES PEDAGÓGICAS SEGÚN NIVEL DE DIFICULTAD:
      - Si el nivel es "Novato" o "Principiante": El contenido DEBE ser extremadamente didáctico, claro e intuitivo. Usa explicaciones amigables paso a paso y analogías conceptuales sencillas. Los ejemplos de código deben ser minimalistas (máximo 8 a 12 líneas de código limpio y directo) enfocados en enseñar exclusivamente el fundamento del tema, sin sobrecargar con librerías complejas o algoritmos avanzados. Todo el reto práctico y retos experto deben ser muy sencillos de resolver combinando directamente las líneas de los ejemplos.
      - Si el nivel es "Intermedio" o "Avanzado": Introduce explicaciones técnicas más formales, flujos de trabajo estándar de la industria y ejemplos de código estructurados de nivel intermedio (12 a 20 líneas).
      - Si el nivel es "Experto", "Master", "Arquitecto" o "Leyenda": Explicaciones técnicas profundas de bajo nivel, optimización de recursos, concurrencia, patrones arquitectónicos de nivel empresarial y ejemplos de código altamente sofisticados, complejos y de grado de producción (más de 20 líneas).

      Exigencias críticas de generación y enfoque:
      1. PRIORIZA EL CÓDIGO Y LOS EJEMPLOS PRÁCTICOS: Los documentos deben estar cargados de ejemplos de código de producción real (mínimo 5 ejemplos robustos, variados e integrados). Evita descripciones abstractas o redundantes de poco contenido real.
      2. TAREA 100% RESOLUBLE CON EL DOCUMENTO: El ejercicio práctico (descrito en "descripcion") y los "retos_experto" deben estar diseñados de forma que el estudiante pueda resolverlos y completarlos directamente utilizando, combinando o extendiendo los ejemplos de código proporcionados en la sección "conceptos_clave". Los ejemplos de código deben servir como base, andamiaje o plantilla directa para la tarea práctica.
      3. CLARIDAD ABSOLUTA EN LOS REQUISITOS: La "descripcion" de la tarea debe definir de manera secuencial, clara e inequívoca el paso a paso del entregable técnico esperado, sin dejar lugar a ambigüedades sobre qué archivos entregar, cómo estructurar el código (ej. carpetas, nombres de archivos) o cómo presentar el entregable final.
      4. DESGLOSE EXHAUSTIVO DE TÉRMINOS (REGLA ESTRICTA): En la sección "conceptos_clave", debes extraer y explicar por separado ABSOLUTAMENTE TODAS las palabras reservadas, símbolos, funciones y estructuras que aparezcan en los ejemplos de código o que el estudiante deba usar (ej. 'function', 'console.log', 'if', 'return', 'var', 'let', 'const'). PROHIBIDO dar por sentado conocimientos previos. Genera un MÍNIMO DE 8 a 10 CONCEPTOS CLAVE por documento.
      5. GUÍA DE INICIALIZACIÓN DEL PROYECTO: Incluye OBLIGATORIAMENTE en "inicializacion_proyecto" los comandos exactos de terminal para crear el proyecto desde cero (mkdir, npm init, pip install, javac, g++, etc.), instalar dependencias necesarias, crear la estructura de carpetas y archivos iniciales. Adapta los comandos al sistema operativo Windows y al lenguaje ${tecnologia}.
      6. GUÍA DE EJECUCIÓN Y PRUEBA: Incluye OBLIGATORIAMENTE en "como_ejecutar" los comandos exactos para compilar/ejecutar el proyecto terminado y cómo verificar que funciona correctamente (ej: node index.js, python main.py, javac Main.java && java Main, g++ -o main main.cpp && ./main). Incluye qué salida esperada debería ver el estudiante en consola o navegador.
      7. ADAPTABILIDAD DE HERRAMIENTAS, MULTI-EDITOR Y BASE DE DATOS (REGLA DE FLEXIBILIDAD UNIVERSAL): Las guías, andamiajes y configuraciones generadas deben ser completamente agnósticas de editores de código y compatibles con múltiples herramientas. Al indicar comandos de inicialización o ejecución de proyectos, proporciona las instrucciones paso a paso que sirvan tanto para terminales puras como para integraciones en editores populares (ej. VS Code, IntelliJ IDEA, PyCharm, NetBeans, Eclipse, CLion, Vim, etc.). Los retos y ejercicios de bases de datos deben ser adaptables, permitiendo la implementación libre en múltiples motores de bases de datos relacionales (como MySQL, PostgreSQL, SQLite) o no relacionales (como Firebase, Supabase, MongoDB). Asimismo, fomenta y haz compatible la resolución de tareas mediante copilotos y asistentes de IA de desarrollo (como Antigravity), facilitando patrones de código y comentarios que sirvan de base para programación guiada con IA.

      El formato del JSON debe ser exactamente:
      {
        "titulo": "Título corto, descriptivo y directo de la tarea",
        "tema": "${tecnologia}",
        "nivel": "${nivelReal}",
        "introduccion_profunda": "Texto académico fluido (mínimo 100 palabras) sobre la importancia práctica de este tema y su rol arquitectónico. Usa saltos de línea \\n para separar párrafos.",
        "funcionamiento_interno": "Análisis técnico de bajo nivel (mínimo 100 palabras) explicando cómo ejecuta internamente el motor/runtime el código provisto en los ejemplos. Usa saltos de línea \\n.",
        "casos_de_estudio_produccion": "Análisis práctico (mínimo 100 palabras) de un escenario de producción. Incluye múltiples usos del patrón. Usa saltos de línea \\n.",
        "inicializacion_proyecto": "Instrucciones detalladas de terminal paso a paso con los comandos necesarios para crear el directorio, inicializar el gestor de paquetes (ej: npm, pip, composer), instalar dependencias clave y configurar la estructura de archivos iniciales en Windows. Separa los pasos con saltos de línea \\n.",
        "como_ejecutar": "Pasos y comandos exactos de terminal para compilar (si aplica), interpretar y ejecutar el proyecto para probar que funciona. Detalla también cuál debe ser la salida esperada en la consola, navegador o cliente API (ej: Postman) para validar el funcionamiento. Separa los pasos con saltos de línea \\n.",
        "descripcion": "Instrucciones secuenciales paso a paso (mínimo 100 palabras) para construir la solución. DEBES separar cada paso con un salto de línea explícito (\\n) para que se renderice como lista.",
        "conceptos_clave": [
          {
            "termino": "Término exacto, palabra reservada o símbolo (ej. 'function', 'console.log', 'if')",
            "explicacion": "Explicación conceptual rápida y directa (alrededor de 60 palabras) del funcionamiento del término.",
            "ejemplo": "Código adaptado estrictamente al nivel del estudiante (Novato/Principiante: 8-12 líneas simples; Avanzado/Leyenda: +20 líneas complejas). Usa saltos de línea \\n."
          }
        ],
        "buenas_practicas": [
          "Instrucción de codificación específica y accionable para mejorar el código entregado basándose en los ejemplos."
        ],
        "retos_experto": [
          "Un requerimiento o extensión específica basada en los ejemplos de código que rete el rendimiento o la seguridad del entregable."
        ]
      }
    `;

    const userPrompt = `Genera la guía conceptual avanzada y la tarea detallada para el Tema ${temaIndice}: "${temaActual}" en la tecnología ${tecnologia} adaptado al nivel de dificultad: "${nivelReal}".`;

    console.log(`Generando tema: ${temaActual} para ${tecnologia} (${nivelReal}) usando Llama 70B...`);
    const chatCompletion = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const data = parsearJSONGroq(chatCompletion.choices[0].message.content);

    // 5. Generar el documento Word (.docx) premium estructurado con docx
    const doc = new docx.Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        headers: {
          default: new docx.Header({
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.RIGHT,
                children: [
                  new docx.TextRun({
                    text: `IA-PROFESOR  |  PLAN DE ESTUDIO SECUENCIAL  |  ${tecnologia.toUpperCase()}`,
                    size: 16,
                    color: "94A3B8",
                    font: "Segoe UI"
                  })
                ],
                spacing: { after: 120 }
              })
            ]
          })
        },
        footers: {
          default: new docx.Footer({
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.CENTER,
                children: [
                  new docx.TextRun({
                    text: "Página ",
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  }),
                  new docx.TextRun({
                    children: [docx.PageNumber.CURRENT],
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  }),
                  new docx.TextRun({
                    text: " de ",
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  }),
                  new docx.TextRun({
                    children: [docx.PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  })
                ]
              })
            ]
          })
        },
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `PLAN DE ESTUDIO: TEMA ${temaIndice}`,
                bold: true, size: 16, color: "475569",
                font: "Segoe UI"
              })
            ],
            spacing: { after: 60 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: temaActual.toUpperCase(),
                bold: true,
                size: 32,
                color: "1E293B",
                font: "Segoe UI"
              })
            ],
            border: {
              bottom: { color: "4F46E5", space: 15, value: "single", size: 18 }
            },
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Tecnología: ", bold: true, font: "Segoe UI", color: "1E293B" }),
              new docx.TextRun({ text: `${data.tema}   |   `, font: "Segoe UI", color: "475569" }),
              new docx.TextRun({ text: "Nivel de Dificultad: ", bold: true, font: "Segoe UI", color: "1E293B" }),
              new docx.TextRun({ text: `${nivelReal}`, font: "Segoe UI", color: "4F46E5", bold: true })
            ],
            spacing: { after: 400 }
          }),

          // Sección: Introducción Profunda
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "1. INTRODUCCIÓN ACADÉMICA Y TRASFONDO", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.introduccion_profunda || "No especificada.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })
              ],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({ spacing: { after: 150 } }),

          // Sección: Funcionamiento Interno
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "2. FUNCIONAMIENTO INTERNO Y ASIGNACIÓN DE RECURSOS", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.funcionamiento_interno || "No especificada.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })
              ],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({ spacing: { after: 150 } }),

          // Sección: Casos de Estudio en Producción
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "3. CASOS DE ESTUDIO EN SISTEMAS A GRAN ESCALA", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.casos_de_estudio_produccion || "No especificada.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })
              ],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({ spacing: { after: 150 } }),

          // Sección: Configuración e Inicialización
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "4. CONFIGURACIÓN E INICIALIZACIÓN DEL ENTORNO", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: (data.inicializacion_proyecto || "No especificada.").split('\n').map(line =>
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "1E293B" })
                        ],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F8FAFC" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "64748B" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 150 } }),

          // Sección: Instrucciones de Ejecución y Pruebas
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "5. INSTRUCCIONES DE EJECUCIÓN Y PRUEBA", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: (data.como_ejecutar || "No especificada.").split('\n').map(line =>
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "1E293B" })
                        ],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F8FAFC" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "64748B" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 150 } }),

          // Sección de Conceptos Clave
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "EXPLICACIÓN CONCEPTUAL AVANZADA", bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 200 }
          }),

          // Contenedores tipo Callout para cada concepto
          ...data.conceptos_clave.flatMap(c => [
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: [
                new docx.TableRow({
                  children: [
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: c.termino.toUpperCase(), bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
                          ],
                          spacing: { after: 80 }
                        }),
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: c.explicacion, size: 20, font: "Segoe UI", color: "334155" })
                          ],
                          spacing: { after: 160 }
                        }),
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: "Código de Ejemplo de Producción:", bold: true, size: 16, color: "475569", font: "Segoe UI" })
                          ],
                          spacing: { after: 80 }
                        }),
                        // Sub-caja de código sombreada
                        new docx.Table({
                          width: { size: 100, type: docx.WidthType.PERCENTAGE },
                          rows: [
                            new docx.TableRow({
                              children: [
                                new docx.TableCell({
                                  children: c.ejemplo.split('\n').map(line => 
                                    new docx.Paragraph({
                                      children: [
                                        new docx.TextRun({ text: line, font: "Consolas", size: 18, color: "0F172A" })
                                      ],
                                      spacing: { before: 10, after: 10 }
                                    })
                                  ),
                                  shading: { fill: "F1F5F9" },
                                  borders: {
                                    top: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                                    bottom: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                                    left: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                                    right: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" }
                                  },
                                  margins: { top: 100, bottom: 100, left: 150, right: 150 }
                                })
                              ]
                            })
                          ]
                        })
                      ],
                      shading: { fill: "F8FAFC" },
                      borders: {
                        left: { style: docx.BorderStyle.SINGLE, size: 24, color: "4F46E5" },
                        top: { style: docx.BorderStyle.NONE },
                        right: { style: docx.BorderStyle.NONE },
                        bottom: { style: docx.BorderStyle.NONE }
                      },
                      margins: { top: 150, bottom: 150, left: 200, right: 200 }
                    })
                  ]
                })
              ]
            }),
            new docx.Paragraph({ text: "", spacing: { after: 150 } })
          ]),

          // Sección de Buenas Prácticas
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "BUENAS PRÁCTICAS DE LA INDUSTRIA", bold: true, size: 22, color: "10B981", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: data.buenas_practicas.map(bp => 
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "✔  ", color: "10B981", bold: true, font: "Segoe UI" }),
                          new docx.TextRun({ text: bp, size: 20, font: "Segoe UI", color: "065F46" })
                        ],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "ECFDF5" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "10B981" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 200 } }),

          // Sección del Ejercicio Práctico
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "EJERCICIO DE GRADO DE PRODUCCIÓN", bold: true, size: 24, color: "DC2626", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: [
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "REQUISITOS FUNCIONALES DEL RETO:", bold: true, size: 18, color: "991B1B", font: "Segoe UI" })
                        ],
                        spacing: { after: 100 }
                      }),
                      ...(data.descripcion || "No especificada.").split('\n').map(line => 
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "7F1D1D" })
                          ],
                          spacing: { after: 60 },
                          alignment: docx.AlignmentType.JUSTIFY
                        })
                      )
                    ],
                    shading: { fill: "FEF2F2" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "DC2626" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 150, bottom: 150, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 200 } }),

          // Sección de Retos Experto
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "DESAFÍOS ADICIONALES (RETOS EXPERTO)", bold: true, size: 22, color: "7C3AED", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: data.retos_experto.map(re => 
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "★  ", color: "7C3AED", bold: true, font: "Segoe UI" }),
                          new docx.TextRun({ text: re, size: 20, font: "Segoe UI", color: "5B21B6" })
                        ],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F5F3FF" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "7C3AED" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 300 } }),

          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "INSTRUCCIONES DE ENTREGA", bold: true, size: 22, color: "475569", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...("1. Crea un repositorio en GitHub para esta tarea.\n2. Sube todo el código de tu solución.\n3. Copia el enlace del repositorio y súbelo a la plataforma para que la IA califique tu código en base a las métricas del plan de estudio.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line, font: "Segoe UI", color: "475569" })
              ],
              spacing: { after: 100 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          )
        ]
      }]
    });

    // Guardar el archivo Word
    const filename = `tarea_${estudiante_id}_${Date.now()}.docx`;
    const docPath = path.join(tareasPublicDir, filename);

    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(docPath, buffer);

    const docUrl = `/descargas/${filename}`;

    // 6. Insertar tarea en la base de datos con UUID local
    const tareaUuid = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO profesor_tareas (id, estudiante_id, titulo, tema, nivel, descripcion, conceptos_clave, tecnologia, word_url, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pendiente')
    `;
    await client.query(insertQuery, [
      tareaUuid,
      estudiante_id,
      data.titulo,
      temaActual,
      nivelReal,
      data.descripcion,
      JSON.stringify(data.conceptos_clave),
      tecnologia,
      docUrl
    ]);

    const selectQuery = 'SELECT * FROM profesor_tareas WHERE id = $1';
    const newTareaRes = await client.query(selectQuery, [tareaUuid]);
    const newTarea = newTareaRes.rows[0];

    // Sincronizar el progreso actual del estudiante por tecnología
    await guardarProgreso(estudiante_id, tecnologia, estudiante.nivel_actual, estudiante.tema_indice);

    res.json({
      ...newTarea,
      word_url: docUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la tarea' });
  }
});

app.post('/api/regenerar-tarea', async (req, res) => {
  const { tarea_id } = req.body;
  if (!tarea_id) return res.status(400).json({ error: 'Falta el id de la tarea' });

  try {
    // 1. Obtener la tarea existente
    const tRes = await client.query('SELECT * FROM profesor_tareas WHERE id = $1', [tarea_id]);
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    const tarea = tRes.rows[0];

    const tecnologia = tarea.tecnologia || 'JavaScript';
    const nivelReal = tarea.nivel;
    const temaActual = tarea.tema;
    const estudiante_id = tarea.estudiante_id;

    // 2. Obtener el temaIndice
    const listaTemas = TEMARIOS[tecnologia] || TEMARIOS['JavaScript'];
    const temaIndice = listaTemas.indexOf(temaActual) + 1 || 1;

    // 3. Generar el nuevo contenido con Groq en formato JSON
    const systemPrompt = `
      Eres un Profesor de IA con pedagogía adaptativa para ingenieros de software. Diseñas planes de estudio, guías teóricas y retos de código adaptando estrictamente la complejidad teórica, la profundidad y la dificultad del código al nivel especificado: "${nivelReal}".
      Debes responder estrictamente en formato JSON válido.

      DIRECTRICES PEDAGÓGICAS SEGÚN NIVEL DE DIFICULTAD:
      - Si el nivel es "Novato" o "Principiante": El contenido DEBE ser extremadamente didáctico, claro e intuitivo. Usa explicaciones amigables paso a paso y analogías conceptuales sencillas. Los ejemplos de código deben ser minimalistas (máximo 8 a 12 líneas de código limpio y directo) enfocados en enseñar exclusivamente el fundamento del tema, sin sobrecargar con librerías complejas o algoritmos avanzados. Todo el reto práctico y retos experto deben ser muy sencillos de resolver combinando directamente las líneas de los ejemplos.
      - Si el nivel es "Intermedio" o "Avanzado": Introduce explicaciones técnicas más formales, flujos de trabajo estándar de la industria y ejemplos de código estructurados de nivel intermedio (12 a 20 líneas).
      - Si el nivel es "Experto", "Master", "Arquitecto" o "Leyenda": Explicaciones técnicas profundas de bajo nivel, optimización de recursos, concurrencia, patrones arquitectónicos de nivel empresarial y ejemplos de código altamente sofisticados, complejos y de grado de producción (más de 20 líneas).

      Exigencias críticas de generación y enfoque:
      1. PRIORIZA EL CÓDIGO Y LOS EJEMPLOS PRÁCTICOS: Los documentos deben estar cargados de ejemplos de código de producción real (mínimo 5 ejemplos robustos, variados e integrados). Evita descripciones abstractas o redundantes de poco contenido real.
      2. TAREA 100% RESOLUBLE CON EL DOCUMENTO: El ejercicio práctico (descrito en "descripcion") y los "retos_experto" deben estar diseñados de forma que el estudiante pueda resolverlos y completarlos directamente utilizando, combinando o extendiendo los ejemplos de código proporcionados en la sección "conceptos_clave". Los ejemplos de código deben servir como base, andamiaje o plantilla directa para la tarea práctica.
      3. CLARIDAD ABSOLUTA EN LOS REQUISITOS: La "descripcion" de la tarea debe definir de manera secuencial, clara e inequívoca el paso a paso del entregable técnico esperado, sin dejar lugar a ambigüedades sobre qué archivar o cómo estructurar.
      4. DESGLOSE EXHAUSTIVO DE TÉRMINOS (REGLA ESTRICTA): En la sección "conceptos_clave", debes extraer y explicar por separado ABSOLUTAMENTE TODAS las palabras reservadas, símbolos, funciones y estructuras que aparezcan en los ejemplos de código o que el estudiante deba usar (ej. 'function', 'console.log', 'if', 'return', 'var', 'let', 'const'). PROHIBIDO dar por sentado conocimientos previos. Genera un MÍNIMO DE 8 a 10 CONCEPTOS CLAVE por documento.

      El formato del JSON debe ser exactamente:
      {
        "titulo": "Título corto, descriptivo y directo de la tarea",
        "tema": "${tecnologia}",
        "nivel": "${nivelReal}",
        "introduccion_profunda": "Texto académico fluido (mínimo 100 palabras) sobre la importancia práctica de este tema y su rol arquitectónico. Usa saltos de línea \\n para separar párrafos.",
        "funcionamiento_interno": "Análisis técnico de bajo nivel (mínimo 100 palabras) explicando cómo ejecuta internamente el motor/runtime el código provisto en los ejemplos. Usa saltos de línea \\n.",
        "casos_de_estudio_produccion": "Análisis práctico (mínimo 100 palabras) de un escenario de producción. Incluye múltiples usos del patrón. Usa saltos de línea \\n.",
        "inicializacion_proyecto": "Instrucciones detalladas de terminal paso a paso con los comandos necesarios para crear el directorio, inicializar el gestor de paquetes (ej: npm, pip, composer), instalar dependencias clave y configurar la estructura de archivos iniciales en Windows. Separa los pasos con saltos de línea \\n.",
        "como_ejecutar": "Pasos y comandos exactos de terminal para compilar (si aplica), interpretar y ejecutar el proyecto para probar que funciona. Detalla también cuál debe ser la salida esperada en la consola, navegador o cliente API (ej: Postman) para validar el funcionamiento. Separa los pasos con saltos de línea \\n.",
        "descripcion": "Instrucciones secuenciales paso a paso (mínimo 100 palabras) para construir la solución. DEBES separar cada paso con un salto de línea explícito (\\n) para que se renderice como lista.",
        "conceptos_clave": [
          {
            "termino": "Término exacto, palabra reservada o símbolo (ej. 'function', 'console.log', 'if')",
            "explicacion": "Explicación conceptual rápida y directa (alrededor de 60 palabras) del funcionamiento del término.",
            "ejemplo": "Ejemplos muy sofisticados, complejos y de grado de producción. OBLIGATORIO: Mínimo 15 líneas de código por ejemplo. Usa saltos de línea \\n."
          }
        ],
        "buenas_practicas": [
          "Instrucción de codificación específica y accionable para mejorar el código entregado basándose en los ejemplos."
        ],
        "retos_experto": [
          "Un requerimiento o extensión específica basada en los ejemplos de código que rete el rendimiento o la seguridad del entregable."
        ]
      }
    `;

    const userPrompt = `Genera la guía conceptual avanzada y la tarea detallada para el Tema ${temaIndice}: "${temaActual}" en la tecnología ${tecnologia} adaptado al nivel de dificultad: "${nivelReal}".`;

    console.log(`Regenerando tema: ${temaActual} para ${tecnologia} (${nivelReal}) usando Llama 70B...`);
    const chatCompletion = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const data = parsearJSONGroq(chatCompletion.choices[0].message.content);

    // 4. Generar el documento Word (.docx) premium estructurado con docx
    const doc = new docx.Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        headers: {
          default: new docx.Header({
            children: [
              new docx.Paragraph({
                children: [
                  new docx.TextRun({
                    text: `PROGRAMA PROFESOR DE IA   |   PLAN DE ESTUDIOS DE PRODUCCIÓN`,
                    size: 16,
                    color: "64748B",
                    font: "Segoe UI"
                  })
                ],
                alignment: docx.AlignmentType.RIGHT
              })
            ]
          })
        },
        footers: {
          default: new docx.Footer({
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.CENTER,
                children: [
                  new docx.TextRun({
                    text: "Página ",
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  }),
                  new docx.TextRun({
                    children: [docx.PageNumber.CURRENT],
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  }),
                  new docx.TextRun({
                    text: " de ",
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  }),
                  new docx.TextRun({
                    children: [docx.PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: "94A3B8",
                    font: "Segoe UI"
                  })
                ]
              })
            ]
          })
        },
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `PLAN DE ESTUDIO: TEMA ${temaIndice}`,
                bold: true, size: 16, color: "475569",
                font: "Segoe UI"
              })
            ],
            spacing: { after: 60 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: temaActual.toUpperCase(),
                bold: true,
                size: 32,
                color: "1E293B",
                font: "Segoe UI"
              })
            ],
            border: {
              bottom: { color: "4F46E5", space: 15, value: "single", size: 18 }
            },
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Tecnología: ", bold: true, font: "Segoe UI", color: "1E293B" }),
              new docx.TextRun({ text: `${data.tema}   |   `, font: "Segoe UI", color: "475569" }),
              new docx.TextRun({ text: "Nivel de Dificultad: ", bold: true, font: "Segoe UI", color: "1E293B" }),
              new docx.TextRun({ text: `${nivelReal}`, font: "Segoe UI", color: "4F46E5", bold: true })
            ],
            spacing: { after: 400 }
          }),

          // Sección: Introducción Profunda
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "1. INTRODUCCIÓN ACADÉMICA Y TRASFONDO", bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.introduccion_profunda || "No especificada.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })
              ],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({ spacing: { after: 150 } }),

          // Sección: Funcionamiento Interno
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "2. FUNCIONAMIENTO INTERNO Y ASIGNACIÓN DE RECURSOS", bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.funcionamiento_interno || "No especificada.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })
              ],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({ spacing: { after: 150 } }),

          // Sección: Casos de Estudio en Producción
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "3. CASOS DE ESTUDIO EN SISTEMAS A GRAN ESCALA", bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.casos_de_estudio_produccion || "No especificada.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })
              ],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({ spacing: { after: 150 } }),

          // Sección: Configuración e Inicialización
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "4. CONFIGURACIÓN E INICIALIZACIÓN DEL ENTORNO", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: (data.inicializacion_proyecto || "No especificada.").split('\n').map(line =>
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "1E293B" })
                        ],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F8FAFC" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "64748B" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 150 } }),

          // Sección: Instrucciones de Ejecución y Pruebas
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "5. INSTRUCCIONES DE EJECUCIÓN Y PRUEBA", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: (data.como_ejecutar || "No especificada.").split('\n').map(line =>
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "1E293B" })
                        ],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F8FAFC" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "64748B" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 150 } }),

          // Sección de Conceptos Clave
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "EXPLICACIÓN CONCEPTUAL AVANZADA", bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 200 }
          }),

          ...data.conceptos_clave.flatMap(c => [
            new docx.Table({
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              rows: [
                new docx.TableRow({
                  children: [
                    new docx.TableCell({
                      children: [
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: c.termino.toUpperCase(), bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
                          ],
                          spacing: { after: 80 }
                        }),
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: c.explicacion, size: 20, font: "Segoe UI", color: "334155" })
                          ],
                          spacing: { after: 160 },
                          alignment: docx.AlignmentType.JUSTIFY
                        }),
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: "Código de Ejemplo de Producción:", bold: true, size: 16, color: "475569", font: "Segoe UI" })
                          ],
                          spacing: { after: 80 }
                        }),
                        new docx.Table({
                          width: { size: 100, type: docx.WidthType.PERCENTAGE },
                          rows: [
                            new docx.TableRow({
                              children: [
                                new docx.TableCell({
                                  children: c.ejemplo.split('\n').map(line => 
                                    new docx.Paragraph({
                                      children: [
                                        new docx.TextRun({ text: line, font: "Consolas", size: 20, color: "0F172A" })
                                      ],
                                      spacing: { before: 10, after: 10 }
                                    })
                                  ),
                                  shading: { fill: "F1F5F9" },
                                  borders: {
                                    top: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                                    bottom: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                                    left: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
                                    right: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" }
                                  },
                                  margins: { top: 100, bottom: 100, left: 150, right: 150 }
                                })
                              ]
                            })
                          ]
                        })
                      ],
                      shading: { fill: "F8FAFC" },
                      borders: {
                        left: { style: docx.BorderStyle.SINGLE, size: 24, color: "4F46E5" },
                        top: { style: docx.BorderStyle.NONE },
                        right: { style: docx.BorderStyle.NONE },
                        bottom: { style: docx.BorderStyle.NONE }
                      },
                      margins: { top: 150, bottom: 150, left: 200, right: 200 }
                    })
                  ]
                })
              ]
            }),
            new docx.Paragraph({ text: "", spacing: { after: 150 } })
          ]),

          // Sección de Buenas Prácticas
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "BUENAS PRÁCTICAS DE LA INDUSTRIA", bold: true, size: 22, color: "10B981", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: data.buenas_practicas.map(bp => 
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "✔  ", color: "10B981", bold: true, font: "Segoe UI" }),
                          new docx.TextRun({ text: bp, size: 20, font: "Segoe UI", color: "065F46" })
                        ],
                        spacing: { before: 60, after: 60 },
                        alignment: docx.AlignmentType.JUSTIFY
                      })
                    ),
                    shading: { fill: "ECFDF5" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "10B981" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 200 } }),

          // Sección del Ejercicio Práctico
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "EJERCICIO DE GRADO DE PRODUCCIÓN", bold: true, size: 24, color: "DC2626", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: [
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "REQUISITOS FUNCIONALES DEL RETO:", bold: true, size: 18, color: "991B1B", font: "Segoe UI" })
                        ],
                        spacing: { after: 100 }
                      }),
                      ...(data.descripcion || "No especificada.").split('\n').map(line => 
                        new docx.Paragraph({
                          children: [
                            new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "7F1D1D" })
                          ],
                          spacing: { after: 60 },
                          alignment: docx.AlignmentType.JUSTIFY
                        })
                      )
                    ],
                    shading: { fill: "FEF2F2" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "DC2626" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 150, bottom: 150, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 200 } }),

          // Sección de Retos Experto
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "DESAFÍOS ADICIONALES (RETOS EXPERTO)", bold: true, size: 22, color: "7C3AED", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    children: data.retos_experto.map(re => 
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "★  ", color: "7C3AED", bold: true, font: "Segoe UI" }),
                          new docx.TextRun({ text: re, size: 20, font: "Segoe UI", color: "5B21B6" })
                        ],
                        spacing: { before: 60, after: 60 },
                        alignment: docx.AlignmentType.JUSTIFY
                      })
                    ),
                    shading: { fill: "F5F3FF" },
                    borders: {
                      left: { style: docx.BorderStyle.SINGLE, size: 24, color: "7C3AED" },
                      top: { style: docx.BorderStyle.NONE },
                      right: { style: docx.BorderStyle.NONE },
                      bottom: { style: docx.BorderStyle.NONE }
                    },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ text: "", spacing: { after: 300 } }),

          // Sección de Instrucciones de Entrega
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "INSTRUCCIONES DE ENTREGA", bold: true, size: 22, color: "475569", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...("1. Crea un repositorio en GitHub para esta tarea.\n2. Sube todo el código de tu solución.\n3. Copia el enlace del repositorio y súbelo a la plataforma para que la IA califique tu código en base a las métricas del plan de estudio.").split('\n').map(line => 
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: line, font: "Segoe UI", color: "475569" })
              ],
              spacing: { after: 100 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          )
        ]
      }]
    });

    // 5. Eliminar el archivo Word anterior de forma segura si existía
    if (tarea.word_url) {
      try {
        const antiguoPath = path.join(__dirname, 'public', tarea.word_url.replace('/descargas/', ''));
        if (fs.existsSync(antiguoPath)) {
          fs.unlinkSync(antiguoPath);
        }
      } catch (err) {
        console.error("Error al borrar archivo Word anterior:", err);
      }
    }

    // Guardar el nuevo archivo Word
    const filename = `tarea_${estudiante_id}_${Date.now()}.docx`;
    const docPath = path.join(tareasPublicDir, filename);
    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(docPath, buffer);

    const docUrl = `/descargas/${filename}`;

    // 6. Actualizar la tarea en la base de datos
    const updateQuery = `
      UPDATE profesor_tareas 
      SET titulo = $1, descripcion = $2, conceptos_clave = $3, word_url = $4
      WHERE id = $5
    `;
    await client.query(updateQuery, [
      data.titulo,
      data.descripcion,
      JSON.stringify(data.conceptos_clave),
      docUrl,
      tarea_id
    ]);

    res.json({
      success: true,
      word_url: docUrl
    });
  } catch (error) {
    console.error("Error al regenerar tarea:", error);
    res.status(500).json({ error: 'Error interno del servidor al regenerar el documento' });
  }
});

// Función auxiliar para leer recursivamente archivos de código
function getCodeFiles(dirPath, extensiones = ['.js', '.jsx', '.py', '.java', '.html', '.css', '.ts', '.tsx']) {
  let results = [];
  if (!fs.existsSync(dirPath)) return results;

  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(getCodeFiles(filePath, extensiones));
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensiones.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

// RUTA: Evaluar Entrega de GitHub o Código Directo
app.post('/api/evaluar-entrega', async (req, res) => {
  const { tarea_id, github_url, tipo_entrega, codigo_entregado } = req.body;
  if (!tarea_id) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  const esCodigoDirecto = tipo_entrega === 'codigo' && codigo_entregado && codigo_entregado.trim().length > 0;

  if (!esCodigoDirecto) {
    if (!github_url) {
      return res.status(400).json({ error: 'Debes proporcionar una URL de GitHub o pegar tu código de solución.' });
    }
    // Validación estricta por Expresión Regular para evitar Command Injection
    const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?\/?$/;
    if (!githubUrlRegex.test(github_url.trim())) {
      return res.status(400).json({ error: 'URL de GitHub inválida. Debe seguir el formato https://github.com/usuario/repositorio' });
    }
  }

  const tempDir = esCodigoDirecto ? null : path.join(__dirname, 'temp_clones', `clone_${tarea_id}_${Date.now()}`);

  try {
    // 1. Obtener detalles de la tarea
    const tareaResult = await client.query('SELECT * FROM profesor_tareas WHERE id = $1', [tarea_id]);
    if (tareaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    const tarea = tareaResult.rows[0];

    let codeContext = "";

    if (esCodigoDirecto) {
      // Tomar el código pegado directamente
      codeContext = `\n--- Código Entregado Directamente por el Estudiante ---\n${codigo_entregado}\n`;
    } else {
      // 2. Clonar el repositorio temporalmente
      console.log(`Clonando repositorio: ${github_url} en ${tempDir}...`);
      fs.mkdirSync(tempDir, { recursive: true });
      
      try {
        // Usamos execSync de forma segura tras validar la URL mediante regex
        execSync(`git clone --depth 1 "${github_url.trim()}" "${tempDir}"`, { stdio: 'pipe' });
      } catch (cloneError) {
        return res.status(400).json({ error: `Error de clonación. Verifica que el repositorio de GitHub sea público y correcto.` });
      }

      // 3. Recopilar archivos de código relevantes
      const codeFiles = getCodeFiles(tempDir);
      for (const file of codeFiles.slice(0, 15)) {
        const relativePath = path.relative(tempDir, file);
        const content = fs.readFileSync(file, 'utf8');
        codeContext += `\n--- Archivo: ${relativePath} ---\n${content}\n`;
      }

      if (!codeContext) {
        codeContext = "No se encontraron archivos de código relevantes en el repositorio clonado.";
      }
    }

    // 4. Evaluar con Groq usando rúbrica didáctica adaptativa al nivel
    const evalSystemPrompt = `
      Eres un Profesor y Mentor de Programación de IA altamente pedagógico, analítico y preciso. Tu rol es calificar y retroalimentar la entrega de código del estudiante en base a la tarea asignada y los conceptos clave que le fueron enseñados.
      
      Debes responder estrictamente en formato JSON válido.
      El formato exacto de respuesta JSON debe ser:
      {
        "puntaje": 85,
        "desglose": {
          "funcionalidad": 35,
          "diseno": 18,
          "seguridad": 16,
          "rendimiento": 16
        },
        "observaciones": "Retroalimentación pedagógica y clara del código entregado, señalando de forma justa si cumple con los requisitos del ejercicio y el nivel correspondiente.",
        "recomendaciones": "Sugerencias didácticas y específicas con pequeños fragmentos de código correctivos adaptados al nivel del estudiante."
      }

      REGLAS CRÍTICAS DE CALIFICACIÓN POR NIVEL:
      - Nivel Novato / Principiante: Concéntrate en la funcionalidad básica, la sintaxis correcta y que cumpla el reto tal y como se solicita en la descripción. NUNCA penalices al estudiante por no utilizar try/catch, control de errores avanzado, modularidad compleja (como clases o SOLID) o análisis de rendimiento Big O, a menos que el ejercicio lo pida expresamente. Si el código resuelve el problema de forma simple, merece una calificación alta (>= 90).
      - Nivel Intermedio: Evalúa la funcionalidad completa, el uso de buenas prácticas elementales (legibilidad de nombres, uso correcto de let/const vs var, etc.) y un manejo básico de errores.
      - Nivel Avanzado / Experto: Aplica criterios rigurosos de nivel de producción. Evalúa la modularidad, principios de diseño robustos, optimización Big O, seguridad contra inyecciones y control exhaustivo de excepciones.

      REGLA ANTI-TRAMPA (ESTRICTA):
      - Si detectas que el código entregado es exactamente igual o funcionalmente idéntico al código de ejemplo provisto en los conceptos clave de la tarea, pero NO resuelve los "Requisitos Técnicos" del ejercicio real (es decir, el estudiante solo copió y pegó el ejemplo sin adaptarlo ni completarlo), DEBES REPROBAR la entrega inmediatamente asignando un puntaje menor a 90 (por ejemplo, 10 o 20) e indicarle en las observaciones que no basta con copiar el ejemplo de la teoría, sino que debe resolver el problema planteado.

      REGLA DE COHERENCIA DIDÁCTICA:
      - No exijas ni sugieras al estudiante patrones o técnicas avanzadas que no se hayan mencionado o enseñado en los Requisitos Técnicos o Conceptos Clave de la tarea. La retroalimentación debe alinearse estrictamente al material didáctico provisto.

      REGLAS DE FLEXIBILIDAD Y ADAPTABILIDAD:
      - Flexibilidad de IDEs: Permite y sé neutral si el estudiante usa VS Code para lenguajes típicamente asociados a otros editores (como Java con NetBeans). No penalices la estructura o convenciones de archivos de configuración asociadas al IDE.
      - Apoyo de Asistentes de IA (Antigravity): Es completamente válido y esperado que el estudiante resuelva los ejercicios utilizando y colaborando con copilotos de IA (como Antigravity). No restes puntos por el uso de patrones de diseño, comentarios explicativos o andamiajes recomendados por asistentes de IA si el código cumple de manera efectiva los requisitos.
      - Flexibilidad de Motores de Bases de Datos: En tareas relacionadas con SQL o bases de datos, acepta implementaciones tanto en bases de datos relacionales tradicionales (MySQL, PostgreSQL, SQLite) como en servicios no relacionales o BaaS (Firebase, Supabase, MongoDB) según la libre elección del estudiante, siempre y cuando cumpla la lógica y funcionalidad exigidas en los requisitos.
    `;

    const userPrompt = `
      TAREA A EVALUAR:
      Título del Módulo: ${tarea.titulo}
      Tecnología: ${tarea.tema}
      Nivel: ${tarea.nivel}
      Requisitos Técnicos: ${tarea.descripcion}

      CÓDIGO ENTREGADO POR EL ESTUDIANTE:
      ${codeContext}
    `;

    console.log(`Evaluando entrega de la tarea: ${tarea.titulo} usando Llama 70B...`);
    const chatCompletion = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: evalSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const evalResult = parsearJSONGroq(chatCompletion.choices[0].message.content);

    // 5. Guardar entrega en base de datos.
    // Guardamos el desglose en el campo 'observaciones' en formato JSON estructurado
    const observacionesDesglose = JSON.stringify({
      desglose: evalResult.desglose,
      comentarios: evalResult.observaciones
    });

    const entregaUuid = crypto.randomUUID();
    const insertQuery = `
      INSERT INTO profesor_entregas (id, tarea_id, github_url, puntaje, observaciones, recomendaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await client.query(insertQuery, [
      entregaUuid,
      tarea_id,
      github_url || 'Entrega de Código Directo',
      evalResult.puntaje,
      observacionesDesglose,
      evalResult.recomendaciones
    ]);

    const selectEntregaQuery = 'SELECT * FROM profesor_entregas WHERE id = $1';
    const newEntregaRes = await client.query(selectEntregaQuery, [entregaUuid]);
    const newEntrega = newEntregaRes.rows[0];

    const aprobada = evalResult.puntaje >= 90;
    if (aprobada) {
      await client.query("UPDATE profesor_tareas SET estado = 'Aprobado' WHERE id = $1", [tarea_id]);
      
      const selectEstQueryBefore = 'SELECT * FROM profesor_estudiantes WHERE id = $1';
      const estBeforeRes = await client.query(selectEstQueryBefore, [tarea.estudiante_id]);
      const estBefore = estBeforeRes.rows[0];

      const nuevoTemaIndice = estBefore.tema_indice + 1;
      const nuevoNivel = obtenerNivelPorIndice(nuevoTemaIndice);

      await client.query(
        "UPDATE profesor_estudiantes SET tema_indice = $1, nivel_actual = $2 WHERE id = $3",
        [nuevoTemaIndice, nuevoNivel, tarea.estudiante_id]
      );

      const selectEstQuery = 'SELECT * FROM profesor_estudiantes WHERE id = $1';
      const estActualizadoRes = await client.query(selectEstQuery, [tarea.estudiante_id]);
      const estActualizado = estActualizadoRes.rows[0];
      
      await guardarProgreso(tarea.estudiante_id, estActualizado.tecnologia_actual, estActualizado.nivel_actual, estActualizado.tema_indice);
    }

    // Ejecutar la actualización del Perfil Cognitivo con el resultado de la evaluación en background
    actualizarPerfilCognitivoConEvaluacion(
      tarea.estudiante_id,
      tarea.titulo,
      tarea.nivel,
      evalResult.puntaje,
      evalResult.observaciones,
      evalResult.recomendaciones
    ).catch(err => {
      console.error('Error al actualizar el perfil cognitivo con evaluación:', err);
    });

    res.json({
      entrega: newEntrega,
      aprobada
    });

  } catch (error) {
    console.error('Error al evaluar la entrega:', error);
    res.status(500).json({ error: 'Error durante la evaluación de la entrega' });
  } finally {
    // 7. Limpiar la carpeta clonada
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`Carpeta temporal limpia: ${tempDir}`);
      } catch (rmError) {
        console.error('No se pudo eliminar la carpeta temporal:', rmError);
      }
    }
  }
});

async function generarDocumentoWord(titulo, subtitulo, introduccion, planMarkdown, planId, prefijo = 'mentor') {
  const doc = new docx.Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      headers: {
        default: new docx.Header({
          children: [
            new docx.Paragraph({
              alignment: docx.AlignmentType.RIGHT,
              children: [
                new docx.TextRun({
                  text: `IA-PROFESOR  |  ${subtitulo.toUpperCase()}  |  MENTOR DE CÓDIGO`,
                  size: 16,
                  color: "94A3B8",
                  font: "Segoe UI"
                })
              ],
              spacing: { after: 120 }
            })
          ]
        })
      },
      footers: {
        default: new docx.Footer({
          children: [
            new docx.Paragraph({
              alignment: docx.AlignmentType.CENTER,
              children: [
                new docx.TextRun({ text: "Página ", size: 18, color: "94A3B8", font: "Segoe UI" }),
                new docx.TextRun({ children: [docx.PageNumber.CURRENT], size: 18, color: "94A3B8", font: "Segoe UI" }),
                new docx.TextRun({ text: " de ", size: 18, color: "94A3B8", font: "Segoe UI" }),
                new docx.TextRun({ children: [docx.PageNumber.TOTAL_PAGES], size: 18, color: "94A3B8", font: "Segoe UI" })
              ]
            })
          ]
        })
      },
      children: [
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: subtitulo.toUpperCase(), bold: true, size: 16, color: "4F46E5", font: "Segoe UI" })
          ],
          spacing: { after: 60 }
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: titulo.toUpperCase(), bold: true, size: 30, color: "1E293B", font: "Segoe UI" })
          ],
          border: {
            bottom: { color: "10B981", space: 15, value: "single", size: 18 }
          },
          spacing: { after: 200 }
        }),
        ...(introduccion ? [
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "INTRODUCCIÓN Y CONTEXTO PEDAGÓGICO", bold: true, size: 22, color: "10B981", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: introduccion, size: 20, font: "Segoe UI", color: "334155" })
            ],
            spacing: { after: 250 },
            alignment: docx.AlignmentType.JUSTIFY
          })
        ] : []),
        new docx.Paragraph({
          children: [
            new docx.TextRun({ text: "CONTENIDO TÉCNICO Y ROADMAP DE APRENDIZAJE", bold: true, size: 22, color: "4F46E5", font: "Segoe UI" })
          ],
          spacing: { before: 200, after: 150 }
        }),
        ...planMarkdown.split('\n').map(line => {
          const trimmed = line.trim();
          let isBold = false;
          let size = 20;
          let color = "334155";
          let beforeSpacing = 0;
          let text = trimmed;

          if (trimmed.startsWith('###')) {
            isBold = true;
            size = 22;
            color = "4F46E5";
            beforeSpacing = 120;
            text = trimmed.replace('###', '').trim();
          } else if (trimmed.startsWith('##')) {
            isBold = true;
            size = 24;
            color = "1E293B";
            beforeSpacing = 160;
            text = trimmed.replace('##', '').trim();
          } else if (trimmed.startsWith('#')) {
            isBold = true;
            size = 28;
            color = "111827";
            beforeSpacing = 200;
            text = trimmed.replace('#', '').trim();
          }

          return new docx.Paragraph({
            children: [
              new docx.TextRun({ text, bold: isBold, size, color, font: "Segoe UI" })
            ],
            spacing: { before: beforeSpacing, after: 80 }
          });
        })
      ]
    }]
  });

  const filename = `${prefijo}_${planId}_${Date.now()}.docx`;
  const docPath = path.join(tareasPublicDir, filename);
  const buffer = await docx.Packer.toBuffer(doc);
  fs.writeFileSync(docPath, buffer);
  return `/descargas/${filename}`;
}

// ==========================================
// ENDPOINTS DEL ASISTENTE DE PROYECTOS (MENTOR IA)
// ==========================================

app.post('/api/mentor/crear-plan', async (req, res) => {
  const { estudiante_id, idea_proyecto, github_url } = req.body;
  if (!estudiante_id || !idea_proyecto) {
    return res.status(400).json({ error: 'Falta estudiante_id o la idea_proyecto' });
  }

  try {
    // 1. Obtener datos del estudiante
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfilCognitivoStr = typeof estudiante.perfil_cognitivo === 'object'
      ? JSON.stringify(estudiante.perfil_cognitivo || {})
      : (estudiante.perfil_cognitivo || '{}');

    // 2. Llamar a Groq para generar el Plan de Implementación
    const systemPrompt = `
      Eres un Arquitecto de Software Senior y Profesor Mentor de élite con 15+ años de experiencia en producción. Tu misión es diseñar un Plan de Implementación ULTRA-DETALLADO, estructurado y de calidad profesional real.

      DIFERENCIACIÓN CRÍTICA vs. PLANES GENÉRICOS:
      - NO generes planes superficiales con frases como "Seleccionar un framework", "Configurar la conexión", "Implementar la lógica". Eso es INACEPTABLE.
      - Cada instrucción debe ser ACCIONABLE y CONCRETA: nombres exactos de paquetes, comandos de terminal, estructuras de carpetas, nombres de archivos.
      - Si mencionas PostgreSQL, da el DDL COMPLETO con tipos específicos, CHECK constraints, índices, comentarios en cada campo.
      - Si mencionas endpoints, da la firma HTTP completa: método, ruta, query params, body JSON de ejemplo, códigos de respuesta esperados.

      REGLAS DE CONTENIDO OBLIGATORIAS:
      1. NUNCA ENTREGUES LA LÓGICA DE NEGOCIO RESUELTA. En su lugar, proporciona esqueletos estructurados, plantillas limpias y ejemplos de código alusivos (con imports, nombres de clases/funciones, contratos tipados y comentarios TODO) listos para que el estudiante los complete y adapte. La estructura del código debe ser un andamiaje perfecto pero vacío de lógica de negocio.
      
      2. ARQUITECTURA CONCRETA Y ESTRUCTURA FÍSICA:
         - Árbol de directorios detallado del proyecto completo (src/, routes/, controllers/, models/, middleware/, config/, tests/).
         - Explicación exhaustiva de la estructura de carpetas: detalla el propósito de cada directorio, la interconexión de sus componentes y cómo fluyen los datos físicamente de un archivo a otro.
         - Diagrama ASCII de flujo de datos con nombres reales de componentes.
         - Justificación técnica específica de CADA tecnología elegida (no "puedes usar X o Y").
         - Toma decisiones concretas: SI el proyecto es una API REST con geo, di exactamente: "Usa Node.js 20 + Express 4.x + pg (driver nativo, NO ORM) + PostGIS 3.x".
      
      3. BASE DE DATOS EXHAUSTIVA:
         - DDL COMPLETO de TODAS las tablas con:
           * Tipos de datos específicos (VARCHAR(255), NUMERIC(10,7), GEOGRAPHY(POINT, 4326))
           * Restricciones CHECK con rangos exactos
           * Índices (B-tree, GIST, GIN) con justificación de cuándo usar cada uno
           * Restricciones UNIQUE, NOT NULL, DEFAULT con valores reales
           * Comentarios SQL en cada campo explicando su propósito
         - Si aplica PostGIS: explica la diferencia entre GEOMETRY vs GEOGRAPHY y cuál elegir y por qué.
      
      4. FASES DE DESARROLLO (5 fases) — CADA FASE debe incluir:
         a) Hito verificable concreto (ej: "Al terminar esta fase, ejecutar 'curl localhost:3000/api/health' debe retornar {status: 'ok'}")
         b) Tareas con comandos exactos de terminal (npm init, npm install pg dotenv, mkdir -p src/routes)
         c) Esqueletos de archivos y plantillas de código alusivos con JSDoc completo:
            - Proporciona la estructura y el esqueleto exacto de los archivos clave a crear (ej: imports, definición de funciones vacías, exportaciones y comentarios TODO guiando la lógica interna). Esto servirá como plantilla adaptable directa para que el estudiante trabaje sobre una base sólida de organización física.
            - @param con tipos exactos
            - @returns con estructura del objeto de retorno
            - @throws con errores esperados
         d) Contratos de API REST por endpoint:
            - Método HTTP + Ruta
            - Headers requeridos
            - Body de request (JSON de ejemplo)
            - Response exitosa (JSON de ejemplo con códigos 200/201)
            - Response de error (JSON con códigos 400/404/500)
         e) Riesgos ESPECÍFICOS (no genéricos) con solución concreta:
            - Malo: "Riesgo: problemas de rendimiento"
            - Bueno: "Riesgo: Consultas ST_DWithin sin índice GIST en la columna 'coordenadas' degradan a O(n) full table scan. Mitigación: CREATE INDEX idx_geo ON ubicaciones USING GIST(coordenadas)"
 
      5. CRITERIOS DE ACEPTACIÓN VERIFICABLES (3+ por fase):
         - Deben ser ejecutables como test o verificación manual concreta
         - Ej: "Ejecutar SELECT ST_Distance(ST_MakePoint(-99.13, 19.43)::geography, coordenadas) FROM ubicaciones LIMIT 1; debe retornar distancia en metros"
 
      6. CHECKLIST DE SEGURIDAD del proyecto:
         - Variables de entorno (.env) con nombres exactos requeridos
         - Validación de inputs (express-validator o Joi con reglas específicas)
         - Sanitización SQL (parameterized queries con $1, $2)
         - Headers de seguridad (helmet.js)
 
      FORMATO DE RESPUESTA JSON (OBLIGATORIO):
      {
        "titulo": "Título técnico preciso del proyecto (ej: 'API REST de Geolocalización con PostGIS y Express')",
        "introduccion_pedagogica": "Párrafo denso (150+ palabras) que contextualice las competencias técnicas específicas que adquirirá el estudiante: qué stack dominará, qué patrones de diseño aplicará, qué problemas de producción real aprenderá a resolver.",
        "plan_markdown": "Plan COMPLETO en Markdown limpio y bien estructurado con:\\n## 📐 Arquitectura (diagrama ASCII + árbol de carpetas + explicaciones de la estructura física + justificación técnica)\\n## 🎯 Personalización Cognitiva y Ruta de Aprendizaje (Mapeo personalizado relacionando las fases del proyecto con los vacíos de conocimiento y conceptos en progreso del estudiante, detallando cómo los superará en este proyecto)\\n## ⚙️ Pila Tecnológica Recomendada y Versiones (Dependencias y versiones de paquetes estables y compatibles sugeridas)\\n## 🗄️ Modelo de Datos (DDL completo comentado)\\n## Fases de Desarrollo 1-5 (con hitos, tareas concretas, plantillas y esqueletos de código alusivos con firmas JSDoc, contratos API, riesgos específicos, y una subsección '🛠️ Guía de Depuración y Diagnóstico' para cada fase con checkpoints de consola y logs)\\n## 🧪 Criterios de Aceptación por Fase\\n## 🔒 Checklist de Seguridad\\n## 📚 Recursos y Documentación (URLs reales)",
        "conceptos_clave": [
          {
            "termino": "Nombre exacto de la tecnología o patrón",
            "explicacion": "Explicación técnica densa de por qué y cómo se usa específicamente en este proyecto, no definiciones genéricas de Wikipedia."
          }
        ]
      }
    `;

    const userPrompt = `Diseña el Plan de Implementación detallado y la guía de aprendizaje para la siguiente idea de proyecto: "${idea_proyecto}".
    ${github_url ? `El estudiante ha provisto un repositorio de GitHub como base: ${github_url}. Analiza cómo extenderlo o mejorarlo.` : ''}
    Nivel de aprendizaje actual del estudiante: ${estudiante.nivel_actual}.
    
    Perfil cognitivo actual de aprendizaje del estudiante (ML Adaptativo):
    ${perfilCognitivoStr}
    
    INSTRUCCIONES DE PERSONALIZACIÓN COGNITIVA:
    - Identifica los "vacios_de_conocimiento" y "conceptos_en_progreso" del perfil cognitivo del estudiante. Estructura el plan de estudio y los esqueletos de código para dar especial énfasis, andamiaje extendido y aclaraciones paso a paso en las tecnologías o patrones que representan sus debilidades.
    - Para los conceptos catalogados como "conceptos_dominados", reduce explicaciones teóricas elementales y añade desafíos avanzados, optimizaciones o prácticas de nivel senior en las tareas para retarlo.`;

    console.log(`Generando Plan de Proyecto Mentor para estudiante ${estudiante.nombre}...`);
    const chatCompletion = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const data = parsearJSONGroq(chatCompletion.choices[0].message.content);

    const planUuid = crypto.randomUUID();
    const docUrl = await generarDocumentoWord(
      data.titulo,
      'PLAN DE IMPLEMENTACIÓN',
      data.introduccion_pedagogica,
      data.plan_markdown,
      planUuid,
      'plan'
    );

    // 4. Guardar en SQLite
    const insertQuery = `
      INSERT INTO profesor_mentor_planes (id, estudiante_id, titulo, idea_proyecto, github_url, plan_markdown, word_url, mensajes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await client.query(insertQuery, [
      planUuid,
      estudiante_id,
      data.titulo,
      idea_proyecto,
      github_url || null,
      data.plan_markdown,
      docUrl,
      '[]'
    ]);

    res.json({
      id: planUuid,
      estudiante_id,
      titulo: data.titulo,
      idea_proyecto,
      github_url,
      plan_markdown: data.plan_markdown,
      word_url: docUrl,
      mensajes: []
    });

  } catch (error) {
    console.error('Error al crear plan de proyecto mentor:', error);
    res.status(500).json({ error: 'Error al generar el plan de proyecto mentor' });
  }
});

app.get('/api/mentor/planes/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const planesRes = await client.query(
      'SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC',
      [estudiante_id]
    );
    const planes = planesRes.rows.map(p => ({
      ...p,
      mensajes: typeof p.mensajes === 'string' ? JSON.parse(p.mensajes || '[]') : (p.mensajes || [])
    }));
    res.json(planes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los planes del estudiante' });
  }
});

app.get('/api/mentor/second-brain/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const planesRes = await client.query(
      'SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC',
      [estudiante_id]
    );
    const planes = planesRes.rows;

    let markdown = `# AI SECOND BRAIN LOG - BITÁCORA DE APRENDIZAJE RETROSPECTIVA\n`;
    markdown += `Generado el: ${new Date().toLocaleString()}\n\n`;
    markdown += `## PERFIL DEL ESTUDIANTE\n`;
    markdown += `- **Nombre:** ${estudiante.nombre}\n`;
    markdown += `- **Nivel Actual:** ${estudiante.nivel_actual}\n`;
    markdown += `- **Tecnología Principal:** ${estudiante.tecnologia || 'No especificada'}\n\n`;
    markdown += `## RESUMEN DE PROYECTOS Y PLANES DE IMPLEMENTACIÓN\n`;

    if (planes.length === 0) {
      markdown += `*No hay planes de desarrollo registrados para este estudiante.*\n`;
    } else {
      for (const plan of planes) {
        markdown += `### Proyecto: ${plan.titulo}\n`;
        markdown += `- **Idea Original:** ${plan.idea_proyecto}\n`;
        markdown += `- **GitHub Base:** ${plan.github_url || 'Ninguno'}\n`;
        markdown += `- **Fecha de Creación:** ${new Date(plan.creado_en).toLocaleString()}\n\n`;
        
        const mensajes = typeof plan.mensajes === 'string' ? JSON.parse(plan.mensajes || '[]') : (plan.mensajes || []);
        const guias = mensajes.filter(m => m.documento_ayuda);
        
        if (guias.length > 0) {
          markdown += `#### Guías de Ayuda Solicitadas en este Proyecto:\n`;
          for (const guia of guias) {
            markdown += `##### 📄 Guía: ${guia.documento_ayuda.titulo}\n`;
            markdown += `**Consulta original del estudiante:** "${guia.documento_ayuda.consulta || 'No especificada'}"\n\n`;
            markdown += `**Contenido Técnico:**\n\n`;
            markdown += `${guia.documento_ayuda.markdown}\n\n`;
            markdown += `---\n\n`;
          }
        }
      }
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="second-brain-${estudiante.nombre.toLowerCase().replace(/\s+/g, '-')}.md"`);
    res.send(markdown);

  } catch (error) {
    console.error('Error al exportar AI Second Brain:', error);
    res.status(500).json({ error: 'Error al generar la bitácora del Second Brain' });
  }
});

app.post('/api/mentor/chat', async (req, res) => {
  const { plan_id, mensaje, personalidad } = req.body;
  if (!plan_id || !mensaje) {
    return res.status(400).json({ error: 'Falta plan_id o mensaje' });
  }

  try {
    // 1. Obtener el plan y estudiante
    const planRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [plan_id]);
    if (planRes.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });
    const plan = planRes.rows[0];

    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [plan.estudiante_id]);
    const estudiante = estRes.rows[0] || {};
    const perfilCognitivoStr = typeof estudiante.perfil_cognitivo === 'object'
      ? JSON.stringify(estudiante.perfil_cognitivo || {})
      : (estudiante.perfil_cognitivo || '{}');

    const mensajesHistorial = typeof plan.mensajes === 'string' ? JSON.parse(plan.mensajes || '[]') : (plan.mensajes || []);

    // 2. Construir prompt para Groq
    // Directriz de Personalidad Seleccionable
    let directrizPersonalidad = '';
    if (personalidad === 'Socrático') {
      directrizPersonalidad = `TONO PEDAGÓGICO SOCRÁTICO: NO des respuestas directas. Formula preguntas guía progresivas que lleven al estudiante a descubrir la solución por sí mismo. Usa el método socrático: pregunta "¿por qué?", "¿qué pasaría si?", "¿cómo podrías verificar eso?". Solo revela la respuesta si el estudiante está completamente bloqueado.`;
    } else if (personalidad === 'Tech Lead') {
      directrizPersonalidad = `TONO TECH LEAD CASUAL: Habla como un colega senior en una startup tech. Usa modismos de la industria ("ship it", "refactorizar", "code review"), sé directo y pragmático. Comparte trucos y atajos reales de producción. El tono debe ser amigable pero técnicamente riguroso.`;
    } else {
      directrizPersonalidad = `TONO ARQUITECTO SENIOR RIGUROSO: Sé estricto, analítico y exigente. Enfócate en buenas prácticas de producción, patrones de diseño sólidos y rendimiento extremo. No aceptes soluciones mediocres.`;
    }

    const systemPrompt = `
      ${directrizPersonalidad}

      Eres el Profesor Mentor de Ingeniería de Software y Arquitecto de Base de Datos Senior asignado para el proyecto: "${plan.titulo}".
      La idea del proyecto es: "${plan.idea_proyecto}".
      El Plan de Referencia es:
      
      ---
      ${plan.plan_markdown}
      ---

      MEMORIA COGNITIVA DEL ESTUDIANTE (MACHINE LEARNING ADAPTATIVO):
      Usa la siguiente información cognitiva del estudiante para adaptar dinámicamente tu nivel de enseñanza:
      ${perfilCognitivoStr}

      INSTRUCCIONES DE ADAPTACIÓN PEDAGÓGICA RIGUROSA:
      1. CONCEPTOS DOMINADOS: Si un tema está en "conceptos_dominados", NO vuelvas a explicar definiciones ni conceptos introductorios. En su lugar, úsalo como cimiento para plantear escenarios más complejos, optimización fina, concurrencia o decisiones de diseño complejas. Exígele más rigor.
      2. CONCEPTOS EN PROGRESO: Si un tema está en "conceptos_en_progreso", provee explicaciones sólidas y ejemplos prácticos detallados para guiarlo a su dominio.
      3. VACÍOS DE CONOCIMIENTO (LO QUE NO SABE O LE CUESTA): Identifica los elementos en "vacios_de_conocimiento" y "errores_frecuentes". Integra de forma sutil explicaciones aclaratorias sobre estos vacíos y retos que le obliguen a enfrentarlos y corregirlos de forma autónoma. Tu meta es enseñarle proactivamente lo que desconoce.


      REGLAS DE COMANDOS DEL ESTUDIANTE (PLUGIN SUPERPOWERS):
      El estudiante puede utilizar comandos especiales al inicio de su mensaje. Si detectas uno, ajusta tu enfoque técnico:
      - /planificar: Enfócate exclusivamente en desglosar detalladamente los pasos de ingeniería requeridos, comandos de terminal exactos, inicializaciones de paquetes y tareas secuenciales.
      - /idear: Enfócate 100% en proponer y contrastar alternativas de arquitectura limpias (ej. relacional vs NoSQL, patrones creacionales vs estructurales), explicando pros y contras de cada uno de manera teórica-arquitectural profunda.
      - /ejecutar: Enfócate en proveer andamios de código limpios, firmas de funciones tipadas con JSDoc exhaustivos, scripts de pruebas robustos y esquemas DDL detallados (sin lógica interna de negocio).

      ESTRUCTURACIÓN POR ROLES DE INGENIERÍA (PLUGIN GSTACK):
      En el campo "documento_ayuda_markdown" de tu respuesta, debes estructurar la guía técnica en tres secciones bien demarcadas usando emojis de cabecera:
      1. 📐 [Arquitecto de Software] - Guía de Estructura Física y Diseño:
         - Explicación minuciosa de la estructura de archivos que el estudiante debe crear (árbol de directorios específico y ruta de los nuevos archivos).
         - Explicación conceptual detallada de cómo se interconectan los componentes.
         - Diagrama ASCII de flujo de datos/control ilustrando cómo interactúan los archivos en este escenario.
         - Esqueletos detallados y plantillas de código alusivas (con imports requeridos, definición de funciones vacías, parámetros tipados y comentarios TODO que describan la lógica interna a implementar). Esto servirá como plantilla directa y adaptable para que el estudiante complete el código en la ubicación correcta de su proyecto.
      2. 🧪 [Aseguramiento de Calidad (QA)] - Plan de Pruebas y Contratos:
         - Qué pruebas unitarias, de integración o manuales escribir.
         - Casos de borde críticos a verificar y cómo validar el comportamiento de forma automática.
         - Proporciona un esqueleto de código de prueba alusivo y vacío para guiar la creación de sus tests.
      3. 📝 [Escritura Técnica (Technical Writer)] - Guía de Documentación:
         - Instrucciones precisas sobre cómo el estudiante debe documentar esta sección en su README o wiki del repositorio.
         - Qué explicaciones pedagógicas de su código debe incluir en su entrega.

      REGLAS CRÍTICAS DE CALIDAD ACADÉMICA Y EVITACIÓN DE SOBREINGENIERÍA:
      1. NUNCA ENTREGUES EL CÓDIGO COMPLETO DE NEGOCIO DEL PROYECTO.
      2. EN SU LUGAR, proporciona obligatoriamente esqueletos y plantillas alusivas (boilerplates con imports, firmas de funciones y comentarios TODO estructurados) que ilustren de forma clara la estructura y guíen la resolución del problema sin resolver la lógica interna.
      3. CERO SOBREINGENIERÍA (OVERENGINEERING): Es imperativo que propongas soluciones óptimas, directas e idiomáticas para el motor de base de datos u lenguaje en cuestión. 
      4. COMPARACIÓN DE ENFOQUES DE DISEÑO: Al responder dudas de arquitectura o base de datos, siempre expón los dos o tres enfoques principales, detallando pros y contras de cada uno.

      ESTRUCTURA DE RESPUESTA JSON REQUERIDA (OBLIGATORIA):
      Debes responder ÚNICAMENTE con un objeto JSON con el siguiente esquema exacto:
      {
        "mensaje_chat": "Un mensaje introductorio corto y amigable del mentor para la burbuja de chat (ej: 'Entiendo tu duda sobre la indexación. He preparado una guía detallada en tu historial de documentos. En resumen...'). Explica brevemente el concepto general y responde directamente de manera directa.",
        "documento_ayuda_titulo": "Título de la Guía de Ayuda (ej: 'Guía: Indexación Espacial y Restricciones de Geolocalización')",
        "documento_ayuda_markdown": "El documento técnico detallado en Markdown limpio, estructurado bajo los roles del plugin Gstack (Software Architect, QA, Technical Writer), con diagramas ASCII, código PostgreSQL/NoSQL bien estructurado y con restricciones CHECK, planes de depuración y preguntas de autoevaluación."
      }
    `;

    // Formatear mensajes previos para Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...mensajesHistorial.map(m => ({
        role: m.remitente === 'estudiante' ? 'user' : 'assistant',
        content: m.documento_ayuda ? JSON.stringify({
          mensaje_chat: m.texto,
          documento_ayuda_titulo: m.documento_ayuda.titulo,
          documento_ayuda_markdown: m.documento_ayuda.markdown
        }) : m.texto
      })),
      { role: 'user', content: mensaje }
    ];

    const chatCompletion = await ejecutarGroqConReintentos(
      messages,
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const data = parsearJSONGroq(chatCompletion.choices[0].message.content);

    // 3. Generar documento Word (.docx) premium de la guía de ayuda
    const docUuid = crypto.randomUUID();
    const docUrl = await generarDocumentoWord(
      data.documento_ayuda_titulo,
      'GUÍA DE AYUDA TÉCNICA',
      null,
      data.documento_ayuda_markdown,
      docUuid,
      'ayuda'
    );

    // Guardar en la tabla de documentos de ayuda
    await client.query(
      `INSERT INTO profesor_mentor_documentos_ayuda (id, plan_id, mensaje_estudiante, respuesta_mentor, documento_markdown, word_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [docUuid, plan_id, mensaje, data.mensaje_chat, data.documento_ayuda_markdown, docUrl]
    );

    const docAyudaObjeto = {
      id: docUuid,
      titulo: data.documento_ayuda_titulo,
      word_url: docUrl,
      markdown: data.documento_ayuda_markdown
    };

    // 4. Actualizar mensajes en SQLite
    const nuevoMensajeEstudiante = { remitente: 'estudiante', texto: mensaje, fecha: new Date().toISOString() };
    const nuevoMensajeMentor = { 
      remitente: 'mentor', 
      texto: data.mensaje_chat, 
      fecha: new Date().toISOString(),
      documento_ayuda: docAyudaObjeto
    };
    const historialActualizado = [...mensajesHistorial, nuevoMensajeEstudiante, nuevoMensajeMentor];

    await client.query(
      'UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2',
      [JSON.stringify(historialActualizado), plan_id]
    );

    // Ejecutar la actualización del Perfil de Machine Learning Cognitivo en background
    actualizarPerfilCognitivo(plan.estudiante_id, mensaje, data.mensaje_chat).catch(err => {
      console.error('Error al actualizar el perfil cognitivo:', err);
    });

    res.json({
      respuesta: data.mensaje_chat,
      mensajes: historialActualizado,
      documento_ayuda: docAyudaObjeto
    });

  } catch (error) {
    console.error('Error en el chat del mentor:', error);
    res.status(500).json({ error: 'Error al procesar el chat del mentor' });
  }
});

app.get('/api/mentor/planes/:plan_id/documentos', async (req, res) => {
  const { plan_id } = req.params;
  try {
    const docsRes = await client.query(
      'SELECT * FROM profesor_mentor_documentos_ayuda WHERE plan_id = $1 ORDER BY creado_en DESC',
      [plan_id]
    );
    res.json(docsRes.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los documentos de ayuda' });
  }
});

app.post('/api/mentor/documentos/regenerar', async (req, res) => {
  const { documento_id } = req.body;
  if (!documento_id) return res.status(400).json({ error: 'Falta documento_id' });

  try {
    // 1. Obtener documento actual
    const docRes = await client.query('SELECT * FROM profesor_mentor_documentos_ayuda WHERE id = $1', [documento_id]);
    if (docRes.rows.length === 0) return res.status(404).json({ error: 'Documento no encontrado' });
    const docActual = docRes.rows[0];

    // Obtener el plan
    const planRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [docActual.plan_id]);
    const plan = planRes.rows[0];

    // 2. Construir prompt para Groq pidiendo otra alternativa o mejora
    const systemPrompt = `
      Eres el Profesor Mentor de Ingeniería de Software y Arquitecto de Base de Datos Senior asignado para el proyecto: "${plan.titulo}".
      El estudiante te ha pedido REGENERAR la guía de ayuda para la pregunta: "${docActual.mensaje_estudiante}".
      La versión previa de la guía fue:
      
      ---
      ${docActual.documento_markdown}
      ---

      ESTRUCTURACIÓN POR ROLES DE INGENIERÍA (PLUGIN GSTACK):
      En el campo "documento_ayuda_markdown" de tu respuesta, debes estructurar la guía técnica en tres secciones bien demarcadas usando emojis de cabecera:
      1. 📐 [Arquitecto de Software] - Guía de Estructura Física y Diseño:
         - Explicación minuciosa de la estructura de archivos que el estudiante debe crear (árbol de directorios específico y ruta de los nuevos archivos).
         - Explicación conceptual detallada de cómo se interconectan los componentes.
         - Diagrama ASCII de flujo de datos/control ilustrando cómo interactúan los archivos en este escenario.
         - Esqueletos detallados y plantillas de código alusivas (con imports requeridos, definición de funciones vacías, parámetros tipados y comentarios TODO que describan la lógica interna a implementar) adaptados a la alternativa planteada. Esto servirá como plantilla directa y adaptable para el estudiante.
      2. 🧪 [Aseguramiento de Calidad (QA)] - Plan de Pruebas y Contratos:
         - Qué pruebas unitarias, de integración o manuales escribir.
         - Casos de borde críticos a verificar y cómo validar el comportamiento de forma automática.
         - Proporciona un esqueleto de código de prueba alusivo y vacío para guiar la creación de sus tests.
      3. 📝 [Escritura Técnica (Technical Writer)] - Guía de Documentación:
         - Instrucciones precisas sobre cómo el estudiante debe documentar esta sección en su README o wiki del repositorio.
         - Qué explicaciones pedagógicas de su código debe incluir en su entrega.

      REGLAS CRÍTICAS DE CALIDAD ACADÉMICA Y EVITACIÓN DE SOBREINGENIERÍA:
      1. NUNCA ENTREGUES EL CÓDIGO COMPLETO DE NEGOCIO DEL PROYECTO. Proporciona una solución alternativa o ampliada, con un enfoque más profundo, ordenado y didáctico.
      2. EN SU LUGAR, proporciona obligatoriamente esqueletos y plantillas alusivas (boilerplates con imports, firmas de funciones y comentarios TODO estructurados) que ilustren de forma clara la estructura y guíen la resolución del problema sin resolver la lógica interna.
      3. NUNCA propongas sobreingeniería como triggers o funciones personalizadas complejas si existen alternativas nativas limpias como CHECK constraints en SQL o PostGIS.
      4. Explica detalladamente y con claridad meridiana.

      ESTRUCTURA DE RESPUESTA JSON REQUERIDA (OBLIGATORIA):
      Debes responder ÚNICAMENTE con un objeto JSON con el siguiente esquema exacto:
      {
        "mensaje_chat": "Un mensaje corto del mentor informando que la guía ha sido regenerada con un enfoque alternativo.",
        "documento_ayuda_titulo": "Título de la Guía de Ayuda (ej: 'Guía Avanzada: Indexación y Restricciones de Geolocalización')",
        "documento_ayuda_markdown": "El nuevo documento de ayuda técnico detallado en Markdown."
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const data = parsearJSONGroq(chatCompletion.choices[0].message.content);

    // 3. Generar nuevo Word
    const docUrl = await generarDocumentoWord(
      data.documento_ayuda_titulo,
      'GUÍA DE AYUDA TÉCNICA (REGENERADA)',
      null,
      data.documento_ayuda_markdown,
      documento_id,
      'ayuda_regen'
    );

    // 4. Actualizar en SQLite
    await client.query(
      `UPDATE profesor_mentor_documentos_ayuda 
       SET respuesta_mentor = $1, documento_markdown = $2, word_url = $3
       WHERE id = $4`,
      [data.mensaje_chat, data.documento_ayuda_markdown, docUrl, documento_id]
    );

    // Actualizar también en el historial de mensajes del plan
    const mensajesHistorial = typeof plan.mensajes === 'string' ? JSON.parse(plan.mensajes || '[]') : (plan.mensajes || []);
    const historialActualizado = mensajesHistorial.map(m => {
      if (m.documento_ayuda && m.documento_ayuda.id === documento_id) {
        return {
          ...m,
          texto: data.mensaje_chat,
          documento_ayuda: {
            ...m.documento_ayuda,
            titulo: data.documento_ayuda_titulo,
            word_url: docUrl,
            markdown: data.documento_ayuda_markdown
          }
        };
      }
      return m;
    });

    await client.query(
      'UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2',
      [JSON.stringify(historialActualizado), docActual.plan_id]
    );

    res.json({
      id: documento_id,
      plan_id: docActual.plan_id,
      mensaje_estudiante: docActual.mensaje_estudiante,
      respuesta_mentor: data.mensaje_chat,
      documento_markdown: data.documento_ayuda_markdown,
      word_url: docUrl
    });

  } catch (error) {
    console.error('Error al regenerar documento de ayuda:', error);
    res.status(500).json({ error: 'Error al regenerar el documento de ayuda' });
  }
});

// ENDPOINTS DE GAMIFICACIÓN ADAPTATIVA POR IA

function obtenerNivelParaReto(nivelActual) {
  const niveles = ['Novato', 'Principiante', 'Intermedio', 'Avanzado', 'Experto', 'Master', 'Arquitecto', 'Leyenda'];
  const idx = niveles.indexOf(nivelActual);
  if (idx === -1) return 'Novato';
  if (idx === niveles.length - 1) return niveles[idx];
  return `${niveles[idx]} o ${niveles[idx + 1]}`;
}

// 1. Obtener Trivia Adaptativa
app.get('/api/gamificacion/trivia', async (req, res) => {
  const { estudiante_id } = req.query;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfil = (typeof estudiante.perfil_cognitivo === 'string'
      ? JSON.parse(estudiante.perfil_cognitivo || '{}')
      : estudiante.perfil_cognitivo) || {};
    const vacios = perfil.vacios_de_conocimiento || [];
    const enProgreso = perfil.conceptos_en_progreso || [];
    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia || estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Diseñador de Gamificación Educativa y Experto en ${tecnologia}.
      Tu tarea es generar una trivia interactiva de opción múltiple adaptada para un nivel de dificultad de "${nivelParaReto}" y enfocada en reforzar sus conceptos en progreso o vacíos de conocimiento:
      Conceptos en progreso: ${JSON.stringify(enProgreso)}
      Vacíos detectados: ${JSON.stringify(vacios)}

      REGLAS CRÍTICAS DE ENFOQUE:
      La pregunta, las opciones y la explicación deben ser EXCLUSIVAMENTE sobre ${tecnologia}. 
      Si los conceptos en progreso o vacíos listados corresponden a otras tecnologías o lenguajes diferentes de ${tecnologia}, ignóralos por completo y genera una pregunta sobre conceptos de ${tecnologia} adecuados para el nivel ${nivel}. Está estrictamente prohibido mezclar lenguajes o tecnologías en la misma trivia.

      REGLAS DE COHERENCIA ABSOLUTA (PROHIBIDO ALUCINACIONES E INCONSISTENCIAS):
      - Debe existir una correlación exacta del 100% entre 'pregunta', 'opciones' y 'explicacion'.
      - 'pregunta' y 'opciones' deben tratar exactamente sobre el concepto o tecnología de ${tecnologia} evaluada.
      - 'explicacion' debe referirse directamente al tema de la pregunta y justificar por qué la opción correcta (indicada por 'respuesta_correcta') es la respuesta a dicha pregunta. Está prohibido aludir a conceptos o variables ausentes de la trivia.

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      Responde estrictamente con un JSON con el siguiente formato:
      {
        "pregunta": "Una pregunta desafiante sobre el concepto a evaluar, adecuada para el nivel ${nivel}.",
        "opciones": [
          "Opción incorrecta 1",
          "Opción incorrecta 2",
          "Opción correcta (debe ser clara y precisa)",
          "Opción incorrecta 3"
        ],
        "respuesta_correcta": 2, 
        "explicacion": "Una breve explicación pedagógica de por qué la respuesta correcta lo es."
      }
      Nota: Baraja la posición de la respuesta correcta de forma aleatoria en el array (el índice respuesta_correcta debe corresponder al índice 0-3 correcto).
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const triviaData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(triviaData);
  } catch (error) {
    console.error('Error al generar trivia:', error);
    res.status(500).json({ error: 'Error al generar la trivia adaptativa' });
  }
});

// 2. Obtener Reto de Refactorización/Depuración (Bug Hunter)
app.get('/api/gamificacion/refactor', async (req, res) => {
  const { estudiante_id } = req.query;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfil = (typeof estudiante.perfil_cognitivo === 'string'
      ? JSON.parse(estudiante.perfil_cognitivo || '{}')
      : estudiante.perfil_cognitivo) || {};
    const errores = perfil.errores_frecuentes || [];
    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia || estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Programador Senior y Creador de Retos Técnicos en ${tecnologia}.
      Tu tarea es generar un desafío de depuración interactivo (Bug Hunter) para un nivel de dificultad de "${nivelParaReto}".
      El reto debe forzar al estudiante a identificar y elegir la versión del código que corrige adecuadamente un bug de rendimiento, seguridad o lógica común. Si es posible, enfócalo en alguno de sus errores frecuentes detectados:
      Errores frecuentes: ${JSON.stringify(errores)}

      REGLAS CRÍTICAS DE ENFOQUE:
      El código con bug, la descripción y todas las opciones de solución deben estar escritos EXCLUSIVAMENTE en ${tecnologia}.
      Si los errores frecuentes listados corresponden a otros lenguajes o tecnologías, ignóralos y genera un bug común de ${tecnologia} adecuado para el nivel ${nivel}. Está prohibido usar cualquier otra tecnología.

      REGLAS DE TEMÁTICA Y DIFICULTAD (EVITAR EJERCICIOS TRIVIALES):
      - Está TERMINANTEMENTE PROHIBIDO generar funciones matemáticas elementales (como sumar, restar, saludar, o buscar en un array simple de usuarios).
      - El código debe simular un entorno de desarrollo profesional y real.
      - Para niveles "Novato", usa estructuras reales (por ejemplo, llamadas a APIs simples, asincronía básica, destructuración, manejo de condicionales en objetos).
      - Para niveles "Principiante" o superiores, genera bugs reales: fugas de memoria en closures, mal manejo de asincronía o concurrencia, problemas de herencia o scope, desajustes en el ciclo de vida de promesas o de bindings de "this".

      REGLAS DE COHERENCIA ABSOLUTA (PROHIBIDO ALUCINACIONES E INCONSISTENCIAS):
      - Debe existir una correlación exacta del 100% entre 'descripcion', 'codigo_con_bug', 'opciones_correcion' y 'explicacion'.
      - 'descripcion' debe detallar el problema que posee 'codigo_con_bug' y qué se espera que haga la función corregida.
      - Las 'opciones_correcion' deben basarse en el mismo fragmento de código de 'codigo_con_bug', resolviéndolo en la opción correcta y manteniendo el bug o introduciendo fallos sintácticos en las incorrectas.
      - 'explicacion' debe explicar detalladamente por qué la opción correcta soluciona el bug de 'codigo_con_bug' y por qué las demás fallan. Queda prohibido hacer alusión a variables o lógicas ajenas al código presentado en el reto.

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      Responde estrictamente con un JSON con el siguiente formato:
      {
        "descripcion": "Explicación breve de lo que debe hacer la función y qué problema presenta (ej: fuga de memoria, mala asincronía).",
        "codigo_con_bug": "Código limpio pero que contiene un error específico de diseño, sintaxis o lógica.",
        "opciones_correcion": [
          "Código incorrecto 1 que no soluciona el problema de manera óptima o introduce otro fallo.",
          "Código correcto exacto que soluciona el bug de forma limpia.",
          "Código incorrecto 2 que mantiene el mismo error o usa sintaxis inválida."
        ],
        "respuesta_correcta": 1,
        "explicacion": "Breve explicación didáctica sobre por qué el código elegido es el correcto y cómo se solucionó el bug."
      }
      Nota: Baraja la posición del código correcto de forma aleatoria en el array (el índice respuesta_correcta debe corresponder al índice 0-2 correcto).
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const refactorData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(refactorData);
  } catch (error) {
    console.error('Error al generar reto de refactorización:', error);
    res.status(500).json({ error: 'Error al generar el reto de refactorización' });
  }
});

// 3. Obtener Reto de Reordenar Código (Code Sorter / Parson's Puzzle)
app.get('/api/gamificacion/sorter', async (req, res) => {
  const { estudiante_id } = req.query;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia || estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Instructor de Ingeniería de Software. Genera un rompecabezas de código (Parson's Puzzle) en la tecnología ${tecnologia} para una dificultad de "${nivelParaReto}".
      El rompecabezas consiste en un bloque de código corto (5-8 líneas de código máximo) que el estudiante debe reordenar correctamente.

      REGLAS CRÍTICAS DE ENFOQUE:
      El código y su ordenamiento deben ser EXCLUSIVAMENTE en ${tecnologia}. Está estrictamente prohibido usar código o sintaxis de otros lenguajes o tecnologías.

      REGLAS DE TEMÁTICA Y DIFICULTAD (EVITAR EJERCICIOS TRIVIALES):
      - Está TERMINANTEMENTE PROHIBIDO generar algoritmos matemáticos o de juguete elementales (como sumar números, factorial básico, verificar par o impar, etc.).
      - Para niveles "Novato", usa flujos lógicos estructurados comunes en desarrollo (como destructurar parámetros de API, manejo condicional simple en flujos de datos).
      - Para niveles "Principiante" o superiores, genera algoritmos reales del ecosistema: encadenamiento de promesas/asincronía estructurada, operaciones encadenadas de arrays de datos (map -> filter -> reduce), estructuración de decoradores simples, o modularización básica.

      REGLAS DE COHERENCIA ABSOLUTA (PROHIBIDO ALUCINACIONES E INCONSISTENCIAS):
      - Debe existir una correlación exacta del 100% entre 'descripcion', 'lineas_ordenadas' y 'explicacion'.
      - 'descripcion' debe detallar con precisión exacta el propósito y lógica del código presente en 'lineas_ordenadas'. Si el código hace algo, la descripción debe reflejar exactamente eso. Queda prohibido describir una tarea (ej. validar edad) y proveer código para otra (ej. mapear nombres).
      - 'explicacion' debe justificar didácticamente el orden correcto de las líneas que aparecen en 'lineas_ordenadas'. Está prohibido que mencione variables, condicionales o lógicas que no formen parte del código real (por ejemplo, si el código no tiene la variable 'edad', la explicación no puede mencionarla bajo ningún concepto).

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      Responde estrictamente con un JSON con el siguiente formato:
      {
        "descripcion": "Una descripción clara del algoritmo o función a implementar (ej: implementar un debounce o un factorial recursivo).",
        "lineas_ordenadas": [
          "línea 1 del código",
          "línea 2 del código",
          "línea 3 del código",
          "etc."
        ],
        "explicacion": "Una breve explicación de cómo interactúan las líneas de código en ese orden específico."
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const sorterData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(sorterData);
  } catch (error) {
    console.error('Error al generar reto de ordenamiento:', error);
    res.status(500).json({ error: 'Error al generar el rompecabezas de código' });
  }
});

// 4. Registrar Reto Completado (XP e Incremento RPG)
app.post('/api/gamificacion/completar', async (req, res) => {
  const { estudiante_id, tipo_reto } = req.body;
  if (!estudiante_id || !tipo_reto) return res.status(400).json({ error: 'Faltan parámetros' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfil = (typeof estudiante.perfil_cognitivo === 'string'
      ? JSON.parse(estudiante.perfil_cognitivo || '{}')
      : estudiante.perfil_cognitivo) || {};
    
    // Asignar XP según el tipo de reto
    let xpGanada = 20;
    if (tipo_reto === 'refactor') xpGanada = 50;
    if (tipo_reto === 'sorter') xpGanada = 35;

    const xpActual = (perfil.xp || 0) + xpGanada;
    perfil.xp = xpActual;

    // Calcular Nivel RPG
    // Nivel 1: 0 - 100 XP
    // Nivel 2: 101 - 250 XP
    // Nivel 3: 251 - 500 XP
    // Nivel 4: 501 - 900 XP
    // Nivel 5: 901+ XP
    let nivelRpg = 1;
    if (xpActual > 900) nivelRpg = 5;
    else if (xpActual > 500) nivelRpg = 4;
    else if (xpActual > 251) nivelRpg = 3;
    else if (xpActual > 100) nivelRpg = 2;

    perfil.nivel_rpg = nivelRpg;

    await client.query(
      'UPDATE profesor_estudiantes SET perfil_cognitivo = $1 WHERE id = $2',
      [JSON.stringify(perfil), estudiante_id]
    );

    res.json({
      success: true,
      xp_ganada: xpGanada,
      xp_total: xpActual,
      nivel_rpg: nivelRpg
    });
  } catch (error) {
    console.error('Error al completar reto de gamificación:', error);
    res.status(500).json({ error: 'Error al registrar el progreso' });
  }
});

// 5. Obtener Reto de Completar Código (Fill-in-the-Blank)
app.get('/api/gamificacion/fill-blank', async (req, res) => {
  const { estudiante_id } = req.query;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfil = (typeof estudiante.perfil_cognitivo === 'string'
      ? JSON.parse(estudiante.perfil_cognitivo || '{}')
      : estudiante.perfil_cognitivo) || {};
    const enProgreso = perfil.conceptos_en_progreso || [];
    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Instructor Experto en ${tecnologia}. Genera un reto de "Completar el Código" (Fill-in-the-Blank) para una dificultad de "${nivelParaReto}".
      Presenta un fragmento de código funcional corto (6-10 líneas) donde has reemplazado entre 2 y 4 partes críticas con huecos numerados (___1___, ___2___, etc.). El estudiante debe deducir qué va en cada hueco.
      Si es posible, enfócalo en sus conceptos en progreso: ${JSON.stringify(enProgreso)}

      REGLAS CRÍTICAS DE ENFOQUE:
      El código, los huecos y sus respuestas deben pertenecer EXCLUSIVAMENTE a ${tecnologia}. Si los conceptos en progreso listados pertenecen a otras tecnologías, ignóralos y diseña el reto sobre ${tecnologia}.

      REGLAS DE TEMÁTICA Y DIFICULTAD (EVITAR EJERCICIOS TRIVIALES):
      - Está TERMINANTEMENTE PROHIBIDO generar funciones matemáticas elementales (como sumar, restar, calcular factorial básico, saludar, etc.).
      - El código debe simular un entorno de desarrollo profesional y real.
      - Para niveles "Novato", usa estructuras básicas pero reales (por ejemplo, iterar sobre un array de objetos de usuario, condicionales simples en APIs, destructuración básica).
      - Para niveles "Principiante" o superiores, genera retos que involucren asincronía (promesas/async-await), llamadas a APIs simuladas, destructuración avanzada de objetos de configuración, manipulación de métodos funcionales de arrays (map, filter, reduce), closures, o manejo del ciclo de vida del lenguaje.
      - Los huecos deben reemplazar palabras clave del lenguaje (ej: "await", "map", "const", "return", "Promise") o variables críticas.

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      {
        "descripcion": "Breve explicación de lo que hace el fragmento de código.",
        "codigo_con_huecos": "Código con ___1___, ___2___, etc. reemplazando las partes clave.",
        "respuestas": {
          "1": "Texto exacto que va en el hueco 1",
          "2": "Texto exacto que va en el hueco 2"
        },
        "explicacion": "Explicación pedagógica de por qué cada respuesta es correcta y qué concepto refuerza."
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const fillData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(fillData);
  } catch (error) {
    console.error('Error al generar reto fill-blank:', error);
    res.status(500).json({ error: 'Error al generar el reto de completar código' });
  }
});

// 6. Obtener Reto de Predecir la Salida (Output Predictor)
app.get('/api/gamificacion/output', async (req, res) => {
  const { estudiante_id } = req.query;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfil = (typeof estudiante.perfil_cognitivo === 'string'
      ? JSON.parse(estudiante.perfil_cognitivo || '{}')
      : estudiante.perfil_cognitivo) || {};
    const vacios = perfil.vacios_de_conocimiento || [];
    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Evaluador Técnico Experto en ${tecnologia}. Genera un desafío de "¿Qué imprime este código?" (Output Predictor) para un rango de dificultad de "${nivelParaReto}".
      Presenta un bloque de código corto (5-10 líneas) que involucre un concept que genere una salida no trivial (closures, coerción, asincronía, scope, hoisting, etc.). El estudiante debe predecir la salida exacta de la consola.
      Si es posible, enfócalo en sus vacíos de conocimiento: ${JSON.stringify(vacios)}

      REGLAS CRÍTICAS DE ENFOQUE:
      El código y las opciones de salida de consola deben pertenecer EXCLUSIVAMENTE a ${tecnologia}. Si los vacíos de conocimiento indicados pertenecen a otras tecnologías, ignóralos y genera el reto sobre ${tecnologia}.

      REGLAS DE TEMÁTICA Y DIFICULTAD (EVITAR EJERCICIOS TRIVIALES):
      - Está TERMINANTEMENTE PROHIBIDO generar funciones o salidas matemáticas de suma elementales (ej: sumar 5 y 10 e imprimirlo).
      - Para niveles "Novato", usa conceptos interesantes del lenguaje como manipulación básica de strings, iteración, condicionales encadenados o coerciones de tipos básicas.
      - Para niveles "Principiante" o superiores, diseña salidas basadas en conceptos complejos: hoisting de variables vs funciones, closures de estado privado, propagación de errores asíncronos en promesas, reasignación de contexto ("this") con clases o arrow functions, o mutabilidad de objetos por referencia.

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      {
        "codigo": "Bloque de código completo y ejecutable.",
        "opciones": [
          "Opción de salida 1",
          "Opción de salida 2",
          "Opción de salida 3 (la correcta)",
          "Opción de salida 4"
        ],
        "respuesta_correcta": 2,
        "explicacion": "Explicación didáctica paso a paso de cómo se ejecuta internamente el código para producir esa salida."
      }
      Nota: Baraja la posición de la respuesta correcta de forma aleatoria (el índice respuesta_correcta 0-3 debe corresponder al correcto).
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const outputData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(outputData);
  } catch (error) {
    console.error('Error al generar reto output predictor:', error);
    res.status(500).json({ error: 'Error al generar el reto de predicción de salida' });
  }
});

// 7. Obtener Flashcard Battle (Concepto Rápido con Verdadero/Falso)
app.get('/api/gamificacion/flashcard', async (req, res) => {
  const { estudiante_id } = req.query;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const perfil = (typeof estudiante.perfil_cognitivo === 'string'
      ? JSON.parse(estudiante.perfil_cognitivo || '{}')
      : estudiante.perfil_cognitivo) || {};
    const dominados = perfil.conceptos_dominados || [];
    const enProgreso = perfil.conceptos_en_progreso || [];
    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Experto Pedagógico en ${tecnologia}. Genera un set de 5 flashcards de Verdadero/Falso adaptadas a una dificultad de "${nivelParaReto}".
      Las flashcards deben cubrir afirmaciones técnicas sobre conceptos que el estudiante domina o está aprendiendo para reforzar la retención:
      Dominados: ${JSON.stringify(dominados)}
      En progreso: ${JSON.stringify(enProgreso)}

      REGLAS CRÍTICAS DE ENFOQUE:
      Todas las afirmaciones técnicas y sus explicaciones deben pertenecer EXCLUSIVAMENTE a ${tecnologia}. Si los conceptos dominados o en progreso pertenecen a otros lenguajes o tecnologías, ignóralos y genera afirmaciones de ${tecnologia}.

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      {
        "flashcards": [
          {
            "afirmacion": "Una afirmación técnica sobre un concepto de ${tecnologia}.",
            "es_verdadero": true,
            "explicacion": "Explicación pedagógica breve de por qué es verdadero o falso."
          }
        ]
      }
      IMPORTANTE: Genera exactamente 5 flashcards. Alterna de forma impredecible entre verdadero y falso (no todas iguales). Las afirmaciones falsas deben ser errores conceptuales comunes y sutiles, no absurdos obvios.
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const flashData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(flashData);
  } catch (error) {
    console.error('Error al generar flashcards:', error);
    res.status(500).json({ error: 'Error al generar las flashcards' });
  }
});

// 7. Obtener Reto de Velocidad de Escritura (Code Typer)
app.get('/api/gamificacion/typer', async (req, res) => {
  try {
    const { estudiante_id } = req.query;
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Experto Pedagógico en ${tecnologia}. Genera una línea de código clave (o bloque de una sola línea de hasta 80 caracteres) para que un programador de nivel "${nivelParaReto}" practique su velocidad de escritura y memorice la sintaxis.
      Asegúrate de que la sintaxis sea 100% válida en ${tecnologia}.

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      {
        "codigo": "La línea de código exacta a escribir.",
        "descripcion": "Una descripción pedagógica ultra breve (máx 15 palabras) de lo que hace ese código."
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const data = parsearJSONGroq(chatCompletion.choices[0].message.content);
    res.json(data);
  } catch (error) {
    console.error('Error al generar typer:', error);
    res.status(500).json({ error: 'Error al generar el reto de velocidad' });
  }
});

// 8. Obtener Reto de Memoria y Parejas (Memory Match)
app.get('/api/gamificacion/memory', async (req, res) => {
  try {
    const { estudiante_id } = req.query;
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    const nivel = estudiante.nivel_actual || 'Novato';
    const tecnologia = estudiante.tecnologia_actual || 'JavaScript';
    const nivelParaReto = obtenerNivelParaReto(nivel);

    const systemPrompt = `
      Eres un Experto Pedagógico en ${tecnologia}. Genera exactamente 4 parejas de conceptos y definiciones (total 8 cartas) adaptadas a la dificultad "${nivelParaReto}".
      Cada pareja consta de:
      1. Un concepto corto (ej. "let vs const", "Clausura", "Promises").
      2. Su explicación o uso breve (máx 12 palabras).

      REGLAS DE FORMATO JSON (OBLIGATORIO):
      {
        "parejas": [
          {
            "matchingId": 1,
            "concepto": "Concepto 1",
            "definicion": "Definición corta del concepto 1"
          },
          {
            "matchingId": 2,
            "concepto": "Concepto 2",
            "definicion": "Definición corta del concepto 2"
          },
          {
            "matchingId": 3,
            "concepto": "Concepto 3",
            "definicion": "Definición corta del concepto 3"
          },
          {
            "matchingId": 4,
            "concepto": "Concepto 4",
            "definicion": "Definición corta del concepto 4"
          }
        ]
      }
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [{ role: 'system', content: systemPrompt }],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const rawData = parsearJSONGroq(chatCompletion.choices[0].message.content);
    
    // Mapear el JSON de Groq a cartas individuales mezcladas
    const cartas = [];
    rawData.parejas.forEach((pareja) => {
      cartas.push({
        id: `c_${pareja.matchingId}_c`,
        texto: pareja.concepto,
        matchingId: pareja.matchingId,
        tipo: 'concepto'
      });
      cartas.push({
        id: `c_${pareja.matchingId}_d`,
        texto: pareja.definicion,
        matchingId: pareja.matchingId,
        tipo: 'definicion'
      });
    });

    // Mezclar las cartas aleatoriamente (Algoritmo Fisher-Yates)
    for (let i = cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cartas[i], cartas[j]] = [cartas[j], cartas[i]];
    }

    res.json({ cartas });
  } catch (error) {
    console.error('Error al generar memory match:', error);
    res.status(500).json({ error: 'Error al generar el juego de memoria' });
  }
});

// Endpoints del Sistema de Logros (Achievements)
app.get('/api/logros', async (req, res) => {
  try {
    const { estudiante_id } = req.query;
    if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });
    
    const dbRes = await client.query(
      'SELECT logro_id, desbloqueado_at FROM profesor_logros WHERE estudiante_id = $1',
      [estudiante_id]
    );
    res.json({ logros: dbRes.rows });
  } catch (error) {
    console.error('Error al obtener logros:', error);
    res.status(500).json({ error: 'Error al consultar logros' });
  }
});

app.post('/api/logros/desbloquear', async (req, res) => {
  try {
    const { estudiante_id, logro_id } = req.body;
    if (!estudiante_id || !logro_id) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const recompensaXp = {
      // Bronce
      'primer_juego': 15,
      'retos_3': 20,
      'retos_5': 25,
      'retos_10': 30,
      // Fuego
      'racha_flashcard': 25,
      'racha_flashcard_5': 35,
      'racha_flashcard_8': 45,
      'racha_flashcard_10': 60,
      // Celestial
      'precis_typer': 30,
      'typer_veloz': 35,
      'typer_supersound': 50,
      'typer_dios': 60,
      // Acuatico
      'trivias_correct': 25,
      'trivias_3': 30,
      'trivias_5': 40,
      'trivias_10': 60,
      // Mecha
      'memory_perfecto': 30,
      'memory_rapido': 35,
      'memory_dios': 50,
      // Esmeralda (XP)
      'xp_10': 10,
      'xp_25': 15,
      'xp_50': 20,
      'xp_100': 45,
      'xp_200': 55,
      'xp_300': 65,
      'xp_500': 80,
      'xp_1000': 150,
      // Anime
      'primer_mentor': 20,
      'chat_mentor_5': 25,
      'chat_mentor_10': 35,
      'chat_mentor_20': 50,
      'calif_100': 50,
      'calif_95': 40,
      'calif_90': 30,
      'entrega_1': 20,
      'entrega_3': 30,
      'entrega_5': 45,
      // Rubi
      'cambio_ruta': 15,
      'cambio_ruta_3': 30,
      'cambio_ruta_5': 45,
      // Cosmico
      'rpg_2': 20,
      'rpg_3': 30,
      'rpg_4': 40,
      'rpg_5': 50,
      'rpg_6': 60,
      'rpg_7': 80,
      'rpg_8': 150,
      // Obsidiana
      'click_perfil': 10,
      'click_logros': 10,
      'click_temario': 10
    }[logro_id] || 10;

    const fecha = new Date().toISOString();
    
    // Verificar si ya está desbloqueado
    const existCheck = await client.query(
      'SELECT id FROM profesor_logros WHERE estudiante_id = $1 AND logro_id = $2',
      [estudiante_id, logro_id]
    );

    if (existCheck.rows.length > 0) {
      return res.json({ success: false, message: 'Logro ya desbloqueado previamente' });
    }

    // Insertar
    await client.query(
      'INSERT INTO profesor_logros (estudiante_id, logro_id, desbloqueado_at) VALUES ($1, $2, $3)',
      [estudiante_id, logro_id, fecha]
    );

    // Sumar XP al estudiante
    await client.query(
      'UPDATE profesor_estudiantes SET xp = xp + $1 WHERE id = $2',
      [recompensaXp, estudiante_id]
    );

    res.json({ success: true, xpGanada: recompensaXp, logro_id });
  } catch (error) {
    console.error('Error al desbloquear logro:', error);
    res.status(500).json({ error: 'Error al registrar el logro' });
  }
});



// ==========================================
// MÓDULO PRAGMA AI (FASE 1) - ENDPOINTS Y LÓGICA
// ==========================================



// Funciones auxiliares de base de datos Firestore para Pragma AI
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
app.post('/api/pragma/copiloto/evaluar', async (req, res) => {
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
      
      // Recompensas
      pragma.rank_points += 15;
      pragma.inventory.silicon_shards += 5;
      pragma.inventory.memory_threads += 2;
      
      // Guardar en runas si es excelente
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
app.post('/api/pragma/zen/acertijo', async (req, res) => {
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

app.post('/api/pragma/zen/resolver', async (req, res) => {
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
app.post('/api/pragma/taberna/optimizar', async (req, res) => {
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
      
      // Otorgar esencia correspondiente
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

app.post('/api/pragma/forja/forjar', async (req, res) => {
  const { estudiante_id, receta_id } = req.body;
  const receta = FORJA_RECETAS[receta_id];
  if (!receta) return res.status(400).json({ error: 'Receta no válida' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    
    // Verificar recursos
    for (const [recurso, cantidad] of Object.entries(receta.costo)) {
      if ((pragma.inventory[recurso] || 0) < cantidad) {
        return res.status(400).json({ error: `Materiales insuficientes. Falta ${recurso}.` });
      }
    }

    // Descontar
    for (const [recurso, cantidad] of Object.entries(receta.costo)) {
      pragma.inventory[recurso] -= cantidad;
    }

    // Agregar cosmético
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
app.post('/api/pragma/perfil/equipar', async (req, res) => {
  const { estudiante_id, categoria, item_id } = req.body; // categoria: map_skin, star_aura, laser_color
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

app.get('/api/pragma/tinder/codigo', (req, res) => {
  const randomSnippet = SYNTAX_TINDER_SNIPPETS[Math.floor(Math.random() * SYNTAX_TINDER_SNIPPETS.length)];
  res.json(randomSnippet);
});

app.post('/api/pragma/tinder/votar', async (req, res) => {
  const { estudiante_id, snippet_id, voto } = req.body; // voto: true o false
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

// 7. LOBBY MULTIJUGADOR COMPETITIVO (1v1, 2v2, 4v4, Todos vs Todos)
const multiplayerQueues = {
  "1v1": [],
  "2v2": [],
  "4v4": [],
  "todos_vs_todos": []
};

const BOTS_NOMBRES = ["ZeroCool", "NeoCoder", "Hackerman", "L33tGamer", "AcidBurn", "CrashOverride", "Plague", "CerealKiller"];

// Endpoint 1: Unirse a la cola de matchmaking
app.post('/api/pragma/multiplayer/match/join', async (req, res) => {
  const { estudiante_id, tipo_match } = req.body;
  if (!estudiante_id) return res.status(400).json({ error: 'Falta estudiante_id' });

  try {
    const pragma = await obtenerPragmaProfile(estudiante_id);
    
    // Registrar ticket en la colección pragma_matchmaking con estado 'esperando'
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    await setDoc(docRef, {
      estudiante_id,
      nombre: pragma.username || "Tú",
      tipo_match: tipo_match || "1v1",
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

// Endpoint 2: Consultar estado de la partida (polling)
app.get('/api/pragma/multiplayer/match/status/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const docRef = doc(firestoreDb, 'pragma_matchmaking', estudiante_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.json({ status: 'cancelado' });
    }

    const ticket = docSnap.data();

    // Si ya se emparejó y se guardó el resultado del combate, retornarlo
    if (ticket.status === 'completado') {
      return res.json({ status: 'completado', matchResult: ticket.matchResult });
    }

    // Buscar otros jugadores reales esperando en la cola para el mismo tipo de juego
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

    // Determinar cantidad necesaria de oponentes/aliados
    let totalOponentesRealesNecesarios = 1; // Para 1v1
    if (ticket.tipo_match === "2v2") totalOponentesRealesNecesarios = 3;
    if (ticket.tipo_match === "4v4") totalOponentesRealesNecesarios = 7;
    if (ticket.tipo_match === "todos_vs_todos") totalOponentesRealesNecesarios = 4;

    // Si encontramos suficientes jugadores reales en Firestore
    if (candidatos.length >= totalOponentesRealesNecesarios) {
      const oponentes = candidatos.slice(0, totalOponentesRealesNecesarios);
      const salaId = `sala_${crypto.randomUUID()}`;
      
      const jugadores = [
        { id: estudiante_id, nombre: ticket.nombre, rank_points: ticket.rank_points, laser_color: ticket.laser_color, map_skin: ticket.map_skin, isBot: false },
        ...oponentes.map(o => ({ id: o.estudiante_id, nombre: o.nombre, rank_points: o.rank_points, laser_color: o.laser_color, map_skin: o.map_skin, isBot: false }))
      ];

      const matchResult = {
        salaId,
        tipo_match: ticket.tipo_match,
        jugadores,
        mensaje: "¡Oponentes reales encontrados en red! Combate inicializado.",
        victoria: Math.random() > 0.5,
        rankGanado: 15,
        xpGanada: 50
      };

      // Guardar el resultado en el perfil del estudiante
      const pragma = await obtenerPragmaProfile(estudiante_id);
      pragma.rank_points += matchResult.victoria ? 15 : 10;
      pragma.inventory.silicon_shards += 3;
      await guardarPragmaProfile(estudiante_id, pragma);

      // Actualizar el ticket del estudiante
      await setDoc(docRef, { ...ticket, status: 'completado', matchResult });

      // Actualizar los tickets de los oponentes reales
      for (const op of oponentes) {
        const opDocRef = doc(firestoreDb, 'pragma_matchmaking', op.estudiante_id);
        const opPragma = await obtenerPragmaProfile(op.estudiante_id);
        
        const opVictoria = !matchResult.victoria; // Si uno gana el otro pierde (simulación balanceada)
        opPragma.rank_points += opVictoria ? 15 : 10;
        opPragma.inventory.silicon_shards += 3;
        await guardarPragmaProfile(op.estudiante_id, opPragma);

        const opMatchResult = {
          salaId,
          tipo_match: ticket.tipo_match,
          jugadores,
          mensaje: "¡Oponentes reales encontrados en red! Combate inicializado.",
          victoria: opVictoria,
          rankGanado: 15,
          xpGanada: 50
        };

        await setDoc(opDocRef, { ...op, status: 'completado', matchResult: opMatchResult });
      }

      return res.json({ status: 'completado', matchResult });
    }

    // Si no hay oponentes reales suficientes, calcular tiempo transcurrido en cola (fallback a bots tras 6s)
    const inicio = new Date(ticket.fecha_creacion).getTime();
    const ahora = new Date().getTime();
    const tiempoEsperaSegundos = (ahora - inicio) / 1000;

    if (tiempoEsperaSegundos >= 6) {
      // Completar con bots simulados para evitar bloqueos
      const salaId = `sala_${crypto.randomUUID()}`;
      const oponentesBots = [];
      const totalBots = totalOponentesRealesNecesarios;

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
        mensaje: "No se encontraron oponentes reales. Combate de entrenamiento con bots inicializado.",
        victoria: Math.random() > 0.4, // 60% probabilidad de victoria
        rankGanado: 15,
        xpGanada: 50
      };

      // Guardar el resultado en el perfil del estudiante
      const pragma = await obtenerPragmaProfile(estudiante_id);
      pragma.rank_points += matchResult.victoria ? 15 : 10;
      pragma.inventory.silicon_shards += 3;
      await guardarPragmaProfile(estudiante_id, pragma);

      // Actualizar el ticket a completado
      await setDoc(docRef, { ...ticket, status: 'completado', matchResult });

      return res.json({ status: 'completado', matchResult });
    }

    // De lo contrario, sigue esperando en la cola
    return res.json({ status: 'esperando' });
  } catch (error) {
    console.error('Error al consultar estado de matchmaking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint 3: Cancelar búsqueda (salir de la cola)
app.post('/api/pragma/multiplayer/match/cancel', async (req, res) => {
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

// Levantar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de IA-PROFESOR (Potenciada) ejecutándose en puerto ${PORT}`);
});
