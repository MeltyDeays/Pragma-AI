const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { client, guardarProgreso, obtenerProgreso } = require('../db.cjs');
const TEMARIOS = require('../data/temarios.json');

const tareasPublicDir = path.join(__dirname, '..', 'public', 'tareas');

// RUTA: Registrar / obtener estudiante por nombre
router.post('/api/estudiantes', async (req, res) => {
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
router.get('/api/estudiantes/:id/estado', async (req, res) => {
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

    const tareasIds = tareasResult.rows.map(t => t.id);
    const entregasMap = new Map();
    
    if (tareasIds.length > 0) {
      const entregasResult = await client.query(
        'SELECT * FROM profesor_entregas WHERE tarea_id = ANY($1) ORDER BY fecha_entrega DESC',
        [tareasIds]
      );
      for (const entrega of entregasResult.rows) {
        if (!entregasMap.has(entrega.tarea_id)) {
          entregasMap.set(entrega.tarea_id, []);
        }
        entregasMap.get(entrega.tarea_id).push(entrega);
      }
    }

    const tareas = [];
    for (const tarea of tareasResult.rows) {
      const entregas = entregasMap.get(tarea.id) || [];

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
        entregas: entregas
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

// RUTA: Presencia ping
router.post('/api/estudiantes/:id/ping', async (req, res) => {
  const { id } = req.params;
  try {
    const timestampStr = new Date().toISOString();
    // Actualizar última conexión en Firestore directamente
    const updateQuery = `
      UPDATE profesor_estudiantes 
      SET ultima_conexion = $1
      WHERE id = $2
    `;
    await client.query(updateQuery, [timestampStr, id]);
    res.json({ success: true, ultima_conexion: timestampStr });
  } catch (error) {
    console.error('[Ping Error]:', error);
    res.status(500).json({ error: 'Error al registrar presencia.' });
  }
});

// RUTA: Actualizar inventario/stats del estudiante
router.post('/api/estudiantes/:id/stats', async (req, res) => {
  const { id } = req.params;
  const { pragma_profile, xp, nivel_actual, tema_indice } = req.body;

  try {
    const fieldsToUpdate = {};
    if (pragma_profile) {
      fieldsToUpdate.pragma_profile = typeof pragma_profile === 'object' 
        ? pragma_profile 
        : JSON.parse(pragma_profile);
    }
    if (xp !== undefined) fieldsToUpdate.xp = Number(xp);
    if (nivel_actual) fieldsToUpdate.nivel_actual = nivel_actual;
    if (tema_indice !== undefined) fieldsToUpdate.tema_indice = Number(tema_indice);

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar' });
    }

    const { doc, getFirestore, initializeApp } = require('firebase/app');
    const { updateDoc } = require('firebase/firestore');
    const { firestoreDb } = require('../db.cjs');

    const docRef = doc(firestoreDb, 'profesor_estudiantes', id);
    await updateDoc(docRef, fieldsToUpdate);

    res.json({ success: true, updated: fieldsToUpdate });
  } catch (error) {
    console.error('[Stats Update Error]:', error);
    res.status(500).json({ error: 'Error al actualizar estadísticas del estudiante.' });
  }
});

const clientesSSE = new Map();

router.get('/api/realtime/stream/:id', (req, res) => {
  const { id } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write('data: {"connected":true}\n\n');

  if (!clientesSSE.has(id)) {
    clientesSSE.set(id, []);
  }
  clientesSSE.get(id).push(res);

  req.on('close', () => {
    const conexiones = clientesSSE.get(id) || [];
    const filtrados = conexiones.filter(conn => conn !== res);
    if (filtrados.length === 0) {
      clientesSSE.delete(id);
    } else {
      clientesSSE.set(id, filtrados);
    }
  });
});

global.enviarNotificacionSSE = (estudianteId, evento, data) => {
  const conexiones = clientesSSE.get(estudianteId) || [];
  conexiones.forEach(res => {
    try {
      res.write(`event: ${evento}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error('[SSE Send Error]:', e);
    }
  });
};

module.exports = router;
