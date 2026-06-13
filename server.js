const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Client } = require('pg');
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

// Directorio público para tareas descargables
const tareasPublicDir = path.join(__dirname, 'public', 'tareas');
fs.mkdirSync(tareasPublicDir, { recursive: true });
app.use('/descargas', express.static(tareasPublicDir));

// Inicializar cliente PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => console.log('Conectado a la base de datos dedicada.'))
  .catch(err => console.error('Error de conexión a la base de datos:', err));

// Inicializar Groq SDK
const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

// RUTA: Registrar / obtener estudiante por nombre
app.post('/api/estudiantes', async (req, res) => {
  const { nombre, tecnologia } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

  try {
    // Buscar si existe
    let query = 'SELECT * FROM profesor_estudiantes WHERE nombre = $1';
    let result = await client.query(query, [nombre]);

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }

    // Crear nuevo estudiante
    const insertQuery = `
      INSERT INTO profesor_estudiantes (nombre, nivel_actual, tecnologia_actual)
      VALUES ($1, 'Principiante', $2)
      RETURNING *
    `;
    const newStudent = await client.query(insertQuery, [nombre, tecnologia || 'JavaScript']);
    res.json(newStudent.rows[0]);
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
    const estudiante = estudianteResult.rows[0];

    // Obtener tareas
    const tareasResult = await client.query(
      'SELECT * FROM profesor_tareas WHERE estudiante_id = $1 ORDER BY creado_en DESC',
      [id]
    );

    // Obtener las entregas para cada tarea
    const tareas = [];
    for (const tarea of tareasResult.rows) {
      const entregasResult = await client.query(
        'SELECT * FROM profesor_entregas WHERE tarea_id = $1 ORDER BY fecha_entrega DESC',
        [tarea.id]
      );
      tareas.push({
        ...tarea,
        entregas: entregasResult.rows
      });
    }

    res.json({
      estudiante,
      tareas
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
    return res.status(400).json({ error: 'Faltan parámetros requeridos (estudiante_id, tecnologia, nivel)' });
  }

  try {
    // 1. Validar que no haya tareas pendientes activas (con calificación < 80)
    const activeTasksQuery = `
      SELECT t.* FROM profesor_tareas t
      LEFT JOIN (
        SELECT tarea_id, MAX(puntaje) as max_score 
        FROM profesor_entregas 
        GROUP BY tarea_id
      ) e ON t.id = e.tarea_id
      WHERE t.estudiante_id = $1 AND (e.max_score IS NULL OR e.max_score < 80)
    `;
    const activeTasks = await client.query(activeTasksQuery, [estudiante_id]);
    if (activeTasks.rows.length > 0) {
      return res.status(400).json({
        error: 'Tienes una tarea pendiente. Debes aprobarla con una calificación mayor o igual a 80 para poder generar una nueva.'
      });
    }

    // 2. Generar el contenido con Groq en formato JSON
    const systemPrompt = `
      Eres un Profesor Senior de Inteligencia Artificial que diseña planes de estudio estructurados y personalizados para desarrolladores.
      Genera una tarea de programación única y adaptada.
      Debes responder estrictamente en formato JSON válido. No incluyas explicaciones de texto fuera del JSON.
      El formato del JSON debe ser exactamente:
      {
        "titulo": "Título corto y directo de la tarea",
        "tema": "${tecnologia}",
        "nivel": "${nivel}",
        "descripcion": "Descripción detallada del ejercicio a construir, incluyendo los requisitos funcionales que el estudiante debe codificar.",
        "conceptos_clave": [
          {
            "termino": "Nombre de un concepto que se usará en la tarea",
            "explicacion": "Explicación directa del concepto adaptado al nivel ${nivel}.",
            "ejemplo": "Un fragmento de código de ejemplo claro usando ${tecnologia}"
          }
        ]
      }
    `;

    console.log(`Generando tarea para ${tecnologia} (${nivel})...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Genera una tarea de ${tecnologia} para nivel ${nivel}.` }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(chatCompletion.choices[0].message.content);

    // 3. Generar el documento Word (.docx) usando la librería docx
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `GUÍA DE ESTUDIO Y TAREA: ${data.titulo.toUpperCase()}`,
                bold: true,
                size: 32,
                color: "1F4E79"
              })
            ],
            spacing: { after: 200 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "Tecnología: ", bold: true }),
              new docx.TextRun({ text: `${data.tema} | ` }),
              new docx.TextRun({ text: "Nivel de Dificultad: ", bold: true }),
              new docx.TextRun({ text: `${data.nivel}` })
            ],
            spacing: { after: 300 }
          }),

          // Título de Conceptos Clave
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "CONCEPTOS Y RECURSOS TEÓRICOS", bold: true, size: 24, color: "2E75B6" })
            ],
            spacing: { before: 200, after: 100 }
          }),

          // Listado de Conceptos
          ...data.conceptos_clave.flatMap(c => [
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: `• ${c.termino}: `, bold: true, color: "000000" }),
                new docx.TextRun({ text: c.explicacion })
              ],
              spacing: { before: 100, after: 50 }
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: "Ejemplo Práctico:", italics: true, color: "595959" })
              ],
              spacing: { left: 360, before: 50, after: 50 }
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({ text: c.ejemplo, font: "Courier New", size: 18, color: "333333" })
              ],
              spacing: { left: 720, before: 50, after: 150 }
            })
          ]),

          // Título del Ejercicio Práctico
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "DESCRIPCIÓN DEL EJERCICIO A REALIZAR", bold: true, size: 24, color: "C00000" })
            ],
            spacing: { before: 300, after: 100 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: data.descripcion })
            ],
            spacing: { after: 200 }
          }),

          // Instrucciones de Entrega
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "INSTRUCCIONES DE ENTREGA", bold: true, size: 20, color: "595959" })
            ],
            spacing: { before: 200, after: 100 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "1. Crea un repositorio en GitHub para esta tarea.\n2. Sube todo el código de tu solución.\n3. Copia el enlace del repositorio y súbelo a la plataforma para que el Profesor de IA califique tu código." })
            ],
            spacing: { after: 200 }
          })
        ]
      }]
    });

    // Guardar el archivo Word localmente en public/tareas/
    const filename = `tarea_${estudiante_id}_${Date.now()}.docx`;
    const docPath = path.join(tareasPublicDir, filename);

    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(docPath, buffer);

    const docUrl = `/descargas/${filename}`;

    // 4. Insertar tarea en la base de datos
    const insertQuery = `
      INSERT INTO profesor_tareas (estudiante_id, titulo, tema, nivel, descripcion, conceptos_clave, estado)
      VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente')
      RETURNING *
    `;
    const newTarea = await client.query(insertQuery, [
      estudiante_id,
      data.titulo,
      data.tema,
      data.nivel,
      data.descripcion,
      JSON.stringify(data.conceptos_clave)
    ]);

    res.json({
      ...newTarea.rows[0],
      word_url: docUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la tarea' });
  }
});

// Función auxiliar para leer recursivamente archivos de código importantes
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

// RUTA: Evaluar Entrega de GitHub
app.post('/api/evaluar-entrega', async (req, res) => {
  const { tarea_id, github_url } = req.body;
  if (!tarea_id || !github_url) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos (tarea_id, github_url)' });
  }

  const tempDir = path.join(__dirname, 'temp_clones', `clone_${tarea_id}_${Date.now()}`);

  try {
    // 1. Obtener detalles de la tarea
    const tareaResult = await client.query('SELECT * FROM profesor_tareas WHERE id = $1', [tarea_id]);
    if (tareaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    const tarea = tareaResult.rows[0];

    // 2. Clonar el repositorio temporalmente
    console.log(`Clonando repositorio: ${github_url} en ${tempDir}...`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Ejecutar clonador de git
    try {
      execSync(`git clone --depth 1 ${github_url} "${tempDir}"`, { stdio: 'pipe' });
    } catch (cloneError) {
      return res.status(400).json({ error: `No se pudo clonar el repositorio de GitHub. Verifica que la URL sea pública y correcta. Detalles: ${cloneError.message}` });
    }

    // 3. Recopilar archivos de código relevantes
    const codeFiles = getCodeFiles(tempDir);
    let codeContext = "";

    for (const file of codeFiles.slice(0, 15)) { // Limitar a máximo 15 archivos clave para no saturar tokens
      const relativePath = path.relative(tempDir, file);
      const content = fs.readFileSync(file, 'utf8');
      codeContext += `\n--- Archivo: ${relativePath} ---\n${content}\n`;
    }

    if (!codeContext) {
      codeContext = "No se encontraron archivos de código relevantes (.js, .py, .java, .html, .css) en el repositorio clonado.";
    }

    // 4. Evaluar con Groq
    const evalSystemPrompt = `
      Eres un evaluador técnico implacable y constructivo. Tu rol es analizar el código entregado por el estudiante,
      compararlo con la tarea asignada y darle una retroalimentación detallada y un puntaje del 0 al 100.

      INSTRUCCIÓN DE PUNTUACIÓN:
      - Sé honesto. Si el código no funciona, está incompleto o falta lógica crítica, asigna un puntaje menor a 80.
      - Si el puntaje es menor a 80, debes dar observaciones específicas del porqué no aprueba y recomendaciones claras sobre qué cambiar.
      - Si el código cumple satisfactoriamente y funciona correctamente, otorga un puntaje de 80 o más.

      REGLA ANTI-TRAMPA (ESTRICTA):
      - Si detectas que el código entregado es exactamente igual o funcionalmente idéntico al código de ejemplo provisto en la teoría, pero NO resuelve los "Requisitos" del ejercicio real (el estudiante solo copió y pegó el ejemplo sin adaptarlo), DEBES REPROBAR la entrega inmediatamente asignando un puntaje menor a 80 (por ejemplo, 10 o 20) indicando que no debe copiar el ejemplo.

      Debes responder estrictamente en formato JSON válido.
      Formato exacto de respuesta JSON:
      {
        "puntaje": 85,
        "observaciones": "Puntos fuertes detectados y fallos técnicos específicos encontrados en su lógica.",
        "recomendaciones": "Pasos detallados que el alumno debe aplicar para perfeccionar su código o corregir los errores."
      }
    `;

    const userPrompt = `
      TAREA ORIGINAL:
      Título: ${tarea.titulo}
      Tecnología: ${tarea.tema}
      Nivel: ${tarea.nivel}
      Descripción de Requisitos: ${tarea.descripcion}

      CÓDIGO ENTREGADO POR EL ESTUDIANTE:
      ${codeContext}
    `;

    console.log(`Evaluando entrega de la tarea: ${tarea.titulo} para la URL: ${github_url}...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: evalSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });

    const evalResult = JSON.parse(chatCompletion.choices[0].message.content);

    // 5. Guardar entrega en base de datos
    const insertQuery = `
      INSERT INTO profesor_entregas (tarea_id, github_url, puntaje, observaciones, recomendaciones)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const newEntrega = await client.query(insertQuery, [
      tarea_id,
      github_url,
      evalResult.puntaje,
      evalResult.observaciones,
      evalResult.recomendaciones
    ]);

    // 6. Si el puntaje es >= 80, actualizar el estado de la tarea a 'Aprobado' y el nivel del estudiante si es oportuno
    if (evalResult.puntaje >= 80) {
      await client.query("UPDATE profesor_tareas SET estado = 'Aprobado' WHERE id = $1", [tarea_id]);

      // Promocionar nivel opcionalmente de forma dinámica o actualizar a la siguiente tecnología
      // En este flujo, simplemente aprobamos la tarea para que pueda generar la siguiente.
    }

    res.json({
      entrega: newEntrega.rows[0],
      aprobada: evalResult.puntaje >= 80
    });

  } catch (error) {
    console.error('Error al evaluar la entrega:', error);
    res.status(500).json({ error: 'Error durante la evaluación de la entrega' });
  } finally {
    // 7. Limpiar la carpeta clonada
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`Carpeta temporal limpia: ${tempDir}`);
      } catch (rmError) {
        console.error('No se pudo eliminar la carpeta temporal:', rmError);
      }
    }
  }
});

// Levantar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de IA-PROFESOR ejecutándose en puerto ${PORT}`);
});
