const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, collection, query, where } = require('firebase/firestore');
const { client, firestoreDb } = require('../db.cjs');

// 1. Enviar solicitud de amistad
router.post('/api/amistades/enviar', async (req, res) => {
  const { solicitante_id, receptor_id } = req.body;
  if (!solicitante_id || !receptor_id) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }
  if (solicitante_id === receptor_id) {
    return res.status(400).json({ error: 'No puedes enviarte una solicitud a ti mismo.' });
  }

  try {
    const solRes = await client.query('SELECT nombre FROM profesor_estudiantes WHERE id = $1', [solicitante_id]);
    if (solRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante solicitante no encontrado.' });
    const solicitante_nombre = solRes.rows[0].nombre;

    const recRes = await client.query('SELECT nombre FROM profesor_estudiantes WHERE id = $1', [receptor_id]);
    if (recRes.rows.length === 0) {
      return res.status(404).json({ error: 'El ID de estudiante no corresponde a ningún usuario registrado.' });
    }
    const receptor_nombre = recRes.rows[0].nombre;

    const q1 = query(collection(firestoreDb, 'profesor_amistades'), where('solicitante_id', '==', solicitante_id), where('receptor_id', '==', receptor_id));
    const snap1 = await getDocs(q1);

    const q2 = query(collection(firestoreDb, 'profesor_amistades'), where('solicitante_id', '==', receptor_id), where('receptor_id', '==', solicitante_id));
    const snap2 = await getDocs(q2);

    if (!snap1.empty || !snap2.empty) {
      return res.status(400).json({ error: 'Ya existe una solicitud de amistad pendiente o una relación activa entre ustedes.' });
    }

    const docId = `${solicitante_id}_${receptor_id}`;
    const docRef = doc(firestoreDb, 'profesor_amistades', docId);
    await setDoc(docRef, {
      id: docId,
      solicitante_id,
      solicitante_nombre,
      receptor_id,
      receptor_nombre,
      estado: 'pendiente',
      creado_en: new Date().toISOString()
    });

    if (global.enviarNotificacionSSE) {
      global.enviarNotificacionSSE(receptor_id, 'nueva_amistad', { 
        solicitante_nombre, 
        solicitud_id: docId 
      });
    }

    res.json({ success: true, mensaje: `Solicitud de amistad enviada con éxito a ${receptor_nombre}.` });
  } catch (error) {
    console.error('Error al enviar solicitud de amistad:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// 2. Obtener solicitudes de amistad pendientes
router.get('/api/amistades/pendientes/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const q = query(collection(firestoreDb, 'profesor_amistades'), where('receptor_id', '==', estudiante_id), where('estado', '==', 'pendiente'));
    const snapshot = await getDocs(q);
    const pendientes = [];
    snapshot.forEach(doc => pendientes.push(doc.data()));
    res.json(pendientes);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// 3. Responder solicitud
router.post('/api/amistades/responder', async (req, res) => {
  const { solicitud_id, accion } = req.body;
  if (!solicitud_id || !accion) return res.status(400).json({ error: 'Faltan parámetros.' });

  try {
    const docRef = doc(firestoreDb, 'profesor_amistades', solicitud_id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return res.status(404).json({ error: 'La solicitud no existe.' });

    if (accion === 'aceptar') {
      const data = docSnap.data();
      await updateDoc(docRef, { estado: 'aceptada' });
      
      if (global.enviarNotificacionSSE) {
        global.enviarNotificacionSSE(data.solicitante_id, 'amistad_aceptada', { 
          receptor_nombre: data.receptor_nombre 
        });
      }

      res.json({ success: true, mensaje: 'Solicitud de amistad aceptada con éxito.' });
    } else {
      await deleteDoc(docRef);
      res.json({ success: true, mensaje: 'Solicitud de amistad rechazada.' });
    }
  } catch (error) {
    console.error('Error al responder:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// 4. Listar amigos aceptados
router.get('/api/amistades/listar/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const q1 = query(collection(firestoreDb, 'profesor_amistades'), where('solicitante_id', '==', estudiante_id), where('estado', '==', 'aceptada'));
    const snap1 = await getDocs(q1);

    const q2 = query(collection(firestoreDb, 'profesor_amistades'), where('receptor_id', '==', estudiante_id), where('estado', '==', 'aceptada'));
    const snap2 = await getDocs(q2);

    const amigosIds = new Set();
    snap1.forEach(doc => amigosIds.add(doc.data().receptor_id));
    snap2.forEach(doc => amigosIds.add(doc.data().solicitante_id));

    const listaAmigos = [];
    if (amigosIds.size > 0) {
      const idsArray = Array.from(amigosIds);
      const postgresRes = await client.query(
        'SELECT id, nombre, nivel_actual, tecnologia_actual, tema_indice, ultima_conexion FROM profesor_estudiantes WHERE id = ANY($1)',
        [idsArray]
      );
      postgresRes.rows.forEach(row => {
        listaAmigos.push({
          id: row.id,
          nombre: row.nombre,
          nivel_actual: row.nivel_actual,
          tecnologia_actual: row.tecnologia_actual,
          tema_indice: row.tema_indice,
          ultima_conexion: row.ultima_conexion
        });
      });
    }
    res.json(listaAmigos);
  } catch (error) {
    console.error('Error al listar amigos:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// 5. Eliminar amistad
router.post('/api/amistades/eliminar', async (req, res) => {
  const { estudiante_id, amigo_id } = req.body;
  if (!estudiante_id || !amigo_id) return res.status(400).json({ error: 'Faltan parámetros.' });

  try {
    const q1 = query(collection(firestoreDb, 'profesor_amistades'), where('solicitante_id', '==', estudiante_id), where('receptor_id', '==', amigo_id));
    const snap1 = await getDocs(q1);

    const q2 = query(collection(firestoreDb, 'profesor_amistades'), where('solicitante_id', '==', amigo_id), where('receptor_id', '==', estudiante_id));
    const snap2 = await getDocs(q2);

    let eliminado = false;
    for (const docSnap of snap1.docs) {
      await deleteDoc(doc(firestoreDb, 'profesor_amistades', docSnap.id));
      eliminado = true;
    }
    for (const docSnap of snap2.docs) {
      await deleteDoc(doc(firestoreDb, 'profesor_amistades', docSnap.id));
      eliminado = true;
    }

    if (eliminado) res.json({ success: true, mensaje: 'Amistad eliminada con éxito.' });
    else res.status(404).json({ error: 'Amistad activa no encontrada.' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// --- CHAT PRIVADO ---
router.post('/api/chats/enviar', async (req, res) => {
  const { remitente_id, remitente_nombre, destinatario_id, destinatario_nombre, mensaje } = req.body;
  if (!remitente_id || !destinatario_id || !mensaje) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  try {
    const msgId = crypto.randomUUID();
    const docRef = doc(firestoreDb, 'profesor_chats', msgId);
    const msgData = {
      id: msgId,
      remitente_id,
      remitente_nombre: remitente_nombre || 'Usuario',
      destinatario_id,
      destinatario_nombre: destinatario_nombre || 'Usuario',
      mensaje,
      creado_en: new Date().toISOString()
    };
    await setDoc(docRef, msgData);
    res.json({ success: true, mensaje: msgData });
  } catch (error) {
    console.error('Error al enviar chat:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

router.get('/api/chats/listar/:remitente_id/:destinatario_id', async (req, res) => {
  const { remitente_id, destinatario_id } = req.params;
  try {
    const q1 = query(collection(firestoreDb, 'profesor_chats'), where('remitente_id', '==', remitente_id), where('destinatario_id', '==', destinatario_id));
    const q2 = query(collection(firestoreDb, 'profesor_chats'), where('remitente_id', '==', destinatario_id), where('destinatario_id', '==', remitente_id));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const mensajes = [];
    snap1.forEach(doc => mensajes.push(doc.data()));
    snap2.forEach(doc => mensajes.push(doc.data()));

    mensajes.sort((a, b) => a.creado_en.localeCompare(b.creado_en));
    res.json(mensajes);
  } catch (error) {
    console.error('Error al listar chats:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// --- DUELOS ---
router.post('/api/duelos/invitar', async (req, res) => {
  const { retador_id, retador_nombre, retado_id, retado_nombre, tipo_match, modos } = req.body;
  if (!retador_id || !retado_id || !tipo_match || !modos) {
    return res.status(400).json({ error: 'Faltan parámetros.' });
  }

  try {
    const dueloId = crypto.randomUUID();
    const docRef = doc(firestoreDb, 'profesor_duelos', dueloId);
    const dueloData = {
      id: dueloId,
      retador_id,
      retador_nombre: retador_nombre || 'Retador',
      retado_id,
      retado_nombre: retado_nombre || 'Retado',
      tipo_match,
      modos,
      estado: 'pendiente',
      creado_en: new Date().toISOString()
    };
    await setDoc(docRef, dueloData);

    if (global.enviarNotificacionSSE) {
      global.enviarNotificacionSSE(retado_id, 'nuevo_duelo', {
        retador_nombre,
        lenguaje: tipo_match,
        nivel: modos,
        id: dueloId
      });
    }

    res.json({ success: true, duelo: dueloData });
  } catch (error) {
    console.error('Error al invitar a duelo:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

router.get('/api/duelos/pendientes/:estudiante_id', async (req, res) => {
  try {
    const q = query(collection(firestoreDb, 'profesor_duelos'), where('retado_id', '==', req.params.estudiante_id), where('estado', '==', 'pendiente'));
    const snap = await getDocs(q);
    const duelos = [];
    snap.forEach(doc => duelos.push(doc.data()));
    res.json(duelos);
  } catch (error) {
    console.error('Error al obtener duelos:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

router.post('/api/duelos/responder', async (req, res) => {
  const { duelo_id, accion } = req.body;
  if (!duelo_id || !accion) return res.status(400).json({ error: 'Faltan parámetros.' });

  try {
    const docRef = doc(firestoreDb, 'profesor_duelos', duelo_id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return res.status(404).json({ error: 'Duelo no encontrado.' });

    const estadoFinal = accion === 'aceptar' ? 'aceptado' : 'rechazado';
    await updateDoc(docRef, { estado: estadoFinal });
    res.json({ success: true, mensaje: `Duelo ${estadoFinal} con éxito.` });
  } catch (error) {
    console.error('Error al responder duelo:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

router.get('/api/duelos/estado/:duelo_id', async (req, res) => {
  try {
    const docRef = doc(firestoreDb, 'profesor_duelos', req.params.duelo_id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return res.status(404).json({ error: 'Duelo no encontrado.' });
    res.json(docSnap.data());
  } catch (error) {
    console.error('Error al obtener estado de duelo:', error);
    res.status(500).json({ error: 'Error interno.' });
  }
});

module.exports = router;
