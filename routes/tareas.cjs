const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');
const docx = require('docx');

const execPromise = util.promisify(exec);
const { 
  client, 
  ejecutarGroqConReintentos, 
  parsearJSONGroq, 
  actualizarPerfilCognitivoConEvaluacion, 
  obtenerNivelPorIndice, 
  guardarProgreso 
} = require('../db.cjs');

const TEMARIOS = require('../data/temarios.json');
const tareasPublicDir = path.join(__dirname, '..', 'public', 'tareas');

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

// RUTA: Generar Tarea y documento Word
router.post('/api/generar-tarea', async (req, res) => {
  const { estudiante_id, tecnologia, nivel } = req.body;
  if (!estudiante_id || !tecnologia || !nivel) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  try {
    // 1. Obtener datos del estudiante
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const estudiante = estRes.rows[0];

    // 2. Validar tareas activas pendientes
    const activeTasksQuery = `
      SELECT t.* FROM profesor_tareas t
      LEFT JOIN (
        SELECT tarea_id, MAX(puntaje) as max_score 
        FROM profesor_entregas 
        GROUP BY tarea_id
      ) e ON t.id = e.tarea_id
      WHERE t.estudiante_id = $1 AND t.tecnologia = $2 AND (e.max_score IS NULL OR e.max_score < 90)
    `;
    const activeTasks = await client.query(activeTasksQuery, [estudiante_id, tecnologia]);
    if (activeTasks.rows.length > 0) {
      return res.status(400).json({
        error: 'Tienes una tarea pendiente. Debes adquirir una calificación de 90 o superior para poder generar una nueva.'
      });
    }

    // 3. Determinar el tema
    const listaTemas = TEMARIOS[tecnologia] || TEMARIOS['JavaScript'];
    let temaIndice = estudiante.tema_indice;

    if (temaIndice > listaTemas.length) {
      return res.status(400).json({
        error: '¡Felicidades! Has completado con éxito todos los temas y niveles del plan de estudios de esta tecnología.'
      });
    }

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
      7. ADAPTABILIDAD DE HERRAMIENTAS: Las guías y configuraciones generadas deben ser completamente agnósticas de editores y motores de BD.

      El formato del JSON debe ser exactamente:
      {
        "titulo": "Título corto, descriptivo y directo de la tarea",
        "tema": "${tecnologia}",
        "nivel": "${nivelReal}",
        "introduccion_profunda": "Texto académico fluido (mínimo 100 palabras) sobre la importancia práctica de este tema y su rol arquitectónico. Usa saltos de línea \\n.",
        "funcionamiento_interno": "Análisis técnico de bajo nivel (mínimo 100 palabras) explicando cómo ejecuta internamente el motor. Usa saltos de línea \\n.",
        "casos_de_estudio_produccion": "Análisis práctico (mínimo 100 palabras) de un escenario de producción. Usa saltos de línea \\n.",
        "inicializacion_proyecto": "Comandos necesarios para Windows y ${tecnologia}. Usa \\n.",
        "como_ejecutar": "Pasos y comandos de terminal para probar el código. Usa \\n.",
        "descripcion": "Instrucciones paso a paso. DEBES separar cada paso con un salto de línea explícito (\\n) para que se renderice como lista.",
        "conceptos_clave": [
          {
            "termino": "Término exacto, palabra reservada o símbolo",
            "explicacion": "Explicación conceptual rápida y directa.",
            "ejemplo": "Código adaptado al nivel (Novato: 8-12 líneas; Experto: +20 líneas). Usa \\n."
          }
        ],
        "buenas_practicas": [
          "Instrucción de codificación específica y accionable."
        ],
        "retos_experto": [
          "Un requerimiento o extensión específica basada en los ejemplos."
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

    // Crear el archivo .docx
    const doc = new docx.Document({
      sections: [{
        properties: {
          page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } }
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
                bold: true, size: 32, color: "1E293B", font: "Segoe UI"
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
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "1. INTRODUCCIÓN ACADÉMICA Y TRASFONDO", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.introduccion_profunda || "").split('\n').map(line => 
            new docx.Paragraph({
              children: [new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "2. FUNCIONAMIENTO INTERNO", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.funcionamiento_interno || "").split('\n').map(line => 
            new docx.Paragraph({
              children: [new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
          new docx.Paragraph({
            children: [
              new docx.TextRun({ text: "3. CASOS DE ESTUDIO EN PRODUCCIÓN", bold: true, size: 24, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 150 }
          }),
          ...(data.casos_de_estudio_produccion || "").split('\n').map(line => 
            new docx.Paragraph({
              children: [new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "334155" })],
              spacing: { after: 150 },
              alignment: docx.AlignmentType.JUSTIFY
            })
          ),
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
                    children: (data.inicializacion_proyecto || "").split('\n').map(line =>
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "1E293B" })],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F8FAFC" },
                    borders: { left: { style: docx.BorderStyle.SINGLE, size: 24, color: "64748B" } },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
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
                    children: (data.como_ejecutar || "").split('\n').map(line =>
                      new docx.Paragraph({
                        children: [new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "1E293B" })],
                        spacing: { before: 60, after: 60 }
                      })
                    ),
                    shading: { fill: "F8FAFC" },
                    borders: { left: { style: docx.BorderStyle.SINGLE, size: 24, color: "64748B" } },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
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
                          children: [new docx.TextRun({ text: c.termino.toUpperCase(), bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })],
                          spacing: { after: 80 }
                        }),
                        new docx.Paragraph({
                          children: [new docx.TextRun({ text: c.explicacion, size: 20, font: "Segoe UI", color: "334155" })],
                          spacing: { after: 160 }
                        }),
                        new docx.Table({
                          width: { size: 100, type: docx.WidthType.PERCENTAGE },
                          rows: [
                            new docx.TableRow({
                              children: [
                                new docx.TableCell({
                                  children: c.ejemplo.split('\n').map(line => 
                                    new docx.Paragraph({
                                      children: [new docx.TextRun({ text: line, font: "Consolas", size: 18, color: "0F172A" })],
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
                      borders: { left: { style: docx.BorderStyle.SINGLE, size: 24, color: "4F46E5" } },
                      margins: { top: 150, bottom: 150, left: 200, right: 200 }
                    })
                  ]
                })
              ]
            }),
            new docx.Paragraph({ text: "", spacing: { after: 150 } })
          ]),
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
                    borders: { left: { style: docx.BorderStyle.SINGLE, size: 24, color: "10B981" } },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
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
                        children: [new docx.TextRun({ text: "REQUISITOS FUNCIONALES DEL RETO:", bold: true, size: 18, color: "991B1B", font: "Segoe UI" })],
                        spacing: { after: 100 }
                      }),
                      ...(data.descripcion || "").split('\n').map(line => 
                        new docx.Paragraph({
                          children: [new docx.TextRun({ text: line.trim(), size: 20, font: "Segoe UI", color: "7F1D1D" })],
                          spacing: { after: 60 }
                        })
                      )
                    ],
                    shading: { fill: "FEF2F2" },
                    borders: { left: { style: docx.BorderStyle.SINGLE, size: 24, color: "DC2626" } },
                    margins: { top: 150, bottom: 150, left: 200, right: 200 }
                  })
                ]
              })
            ]
          }),
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
                    borders: { left: { style: docx.BorderStyle.SINGLE, size: 24, color: "7C3AED" } },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 }
                  })
                ]
              })
            ]
          })
        ]
      }]
    });

    const filename = `tarea_${estudiante_id}_${Date.now()}.docx`;
    const docPath = path.join(tareasPublicDir, filename);
    const buffer = await docx.Packer.toBuffer(doc);
    fs.mkdirSync(tareasPublicDir, { recursive: true });
    fs.writeFileSync(docPath, buffer);

    const docUrl = `/descargas/${filename}`;
    const uuid = crypto.randomUUID();

    const insertQuery = `
      INSERT INTO profesor_tareas (id, estudiante_id, titulo, tema, nivel, descripcion, conceptos_clave, tecnologia, word_url, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pendiente')
    `;
    await client.query(insertQuery, [
      uuid,
      estudiante_id,
      data.titulo,
      temaActual,
      nivelReal,
      data.descripcion,
      JSON.stringify(data.conceptos_clave),
      tecnologia,
      docUrl
    ]);

    res.json({
      id: uuid,
      titulo: data.titulo,
      tema: temaActual,
      nivel: nivelReal,
      descripcion: data.descripcion,
      conceptos_clave: data.conceptos_clave,
      tecnologia: tecnologia,
      word_url: docUrl,
      estado: 'Pendiente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la tarea' });
  }
});

// RUTA: Regenerar Tarea
router.post('/api/regenerar-tarea', async (req, res) => {
  const { tarea_id } = req.body;
  if (!tarea_id) return res.status(400).json({ error: 'Falta el id de la tarea' });

  try {
    const tRes = await client.query('SELECT * FROM profesor_tareas WHERE id = $1', [tarea_id]);
    if (tRes.rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    const tarea = tRes.rows[0];

    const tecnologia = tarea.tecnologia || 'JavaScript';
    const nivelReal = tarea.nivel;
    const temaActual = tarea.tema;
    const estudiante_id = tarea.estudiante_id;

    const listaTemas = TEMARIOS[tecnologia] || TEMARIOS['JavaScript'];
    const temaIndice = listaTemas.indexOf(temaActual) + 1 || 1;

    const systemPrompt = `
      Eres un Profesor de IA con pedagogía adaptativa para ingenieros de software. Diseñas planes de estudio, guías teóricas y retos de código adaptando estrictamente la complejidad teórica, la profundidad y la dificultad del código al nivel especificado: "${nivelReal}".
      Debes responder estrictamente en formato JSON válido.
      El formato del JSON debe ser exactamente el mismo de la generación de tareas.
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

    // Generar archivo docx similar...
    const doc = new docx.Document({
      sections: [{
        properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
        children: [
          new docx.Paragraph({ text: `PLAN DE ESTUDIO REGENERADO: TEMA ${temaIndice}`, bold: true, size: 16, font: "Segoe UI" }),
          new docx.Paragraph({ text: temaActual.toUpperCase(), bold: true, size: 32, font: "Segoe UI" }),
          new docx.Paragraph({ text: `Nivel: ${nivelReal}`, font: "Segoe UI" }),
          new docx.Paragraph({ text: data.descripcion, font: "Segoe UI" })
        ]
      }]
    });

    if (tarea.word_url) {
      try {
        const antiguoPath = path.join(tareasPublicDir, tarea.word_url.replace('/descargas/', ''));
        if (fs.existsSync(antiguoPath)) {
          fs.unlinkSync(antiguoPath);
        }
      } catch (err) {
        console.error("Error al borrar archivo Word anterior:", err);
      }
    }

    const filename = `tarea_${estudiante_id}_${Date.now()}.docx`;
    const docPath = path.join(tareasPublicDir, filename);
    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(docPath, buffer);

    const docUrl = `/descargas/${filename}`;

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

    res.json({ success: true, word_url: docUrl });
  } catch (error) {
    console.error("Error al regenerar tarea:", error);
    res.status(500).json({ error: 'Error interno del servidor al regenerar el documento' });
  }
});

// RUTA: Evaluar Entrega
router.post('/api/evaluar-entrega', async (req, res) => {
  const { tarea_id, github_url, tipo_entrega, codigo_entregado } = req.body;
  if (!tarea_id) return res.status(400).json({ error: 'Faltan parámetros requeridos' });

  const esCodigoDirecto = tipo_entrega === 'codigo' && codigo_entregado && codigo_entregado.trim().length > 0;

  if (!esCodigoDirecto) {
    if (!github_url) {
      return res.status(400).json({ error: 'Debes proporcionar una URL de GitHub o pegar tu código de solución.' });
    }
    const githubUrlRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(?:\.git)?\/?$/;
    if (!githubUrlRegex.test(github_url.trim())) {
      return res.status(400).json({ error: 'URL de GitHub inválida.' });
    }
  }

  const tempDir = esCodigoDirecto ? null : path.join(__dirname, '..', 'temp_clones', `clone_${tarea_id}_${Date.now()}`);

  try {
    const tareaResult = await client.query('SELECT * FROM profesor_tareas WHERE id = $1', [tarea_id]);
    if (tareaResult.rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    const tarea = tareaResult.rows[0];

    let codeContext = "";

    if (esCodigoDirecto) {
      codeContext = `\n--- Código Entregado Directamente por el Estudiante ---\n${codigo_entregado}\n`;
    } else {
      console.log(`Clonando repositorio: ${github_url} en ${tempDir}...`);
      fs.mkdirSync(tempDir, { recursive: true });
      try {
        await execPromise(`git clone --depth 1 "${github_url.trim()}" "${tempDir}"`);
      } catch (cloneError) {
        return res.status(400).json({ error: `Error de clonación.` });
      }

      const codeFiles = getCodeFiles(tempDir);
      for (const file of codeFiles.slice(0, 15)) {
        const relativePath = path.relative(tempDir, file);
        const content = fs.readFileSync(file, 'utf8');
        codeContext += `\n--- Archivo: ${relativePath} ---\n${content}\n`;
      }

      if (!codeContext) codeContext = "No se encontraron archivos.";
    }

    const evalSystemPrompt = `
      Eres un Profesor y Mentor de Programación de IA altamente pedagógico. Califica y retroalimenta la entrega del estudiante.
      Responde estrictamente en formato JSON válido:
      {
        "puntaje": 85,
        "desglose": { "funcionalidad": 35, "diseno": 18, "seguridad": 16, "rendimiento": 16 },
        "observaciones": "Retroalimentación...",
        "recomendaciones": "Sugerencias..."
      }
    `;

    const userPrompt = `
      TAREA: ${tarea.titulo}
      Nivel: ${tarea.nivel}
      Código entregado:
      ${codeContext}
    `;

    const chatCompletion = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: evalSystemPrompt },
        { role: 'user', content: userPrompt }
      ],
      'llama-3.3-70b-versatile',
      { type: 'json_object' }
    );

    const evalResult = parsearJSONGroq(chatCompletion.choices[0].message.content);

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

      await guardarProgreso(tarea.estudiante_id, estBefore.tecnologia_actual, nuevoNivel, nuevoTemaIndice);
    }

    actualizarPerfilCognitivoConEvaluacion(
      tarea.estudiante_id,
      tarea.titulo,
      tarea.nivel,
      evalResult.puntaje,
      evalResult.observaciones,
      evalResult.recomendaciones
    ).catch(err => console.error(err));

    res.json({ entrega: newEntrega, aprobada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error durante la evaluación de la entrega' });
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {
        console.error(e);
      }
    }
  }
});

module.exports = router;
