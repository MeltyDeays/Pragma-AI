const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env.local') });

const app = express();
app.use(compression());
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

// Middleware de regeneración al vuelo para descargas de Word (resiliente a almacenamiento efímero de Hugging Face)
const { client } = require('./db.cjs');
const docx = require('docx');

app.get('/descargas/:filename', async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(tareasPublicDir, filename);

  // Si el archivo físico ya existe en disco, lo servimos de manera normal
  if (fs.existsSync(filePath)) {
    return next();
  }

  // Si no existe, lo regeneramos buscando sus datos persistidos en Supabase
  try {
    const docUrl = `/descargas/${filename}`;
    const result = await client.query('SELECT * FROM profesor_tareas WHERE word_url = $1', [docUrl]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Archivo no encontrado en la base de datos');
    }

    const tarea = result.rows[0];
    const conceptosClave = typeof tarea.conceptos_clave === 'string' 
      ? JSON.parse(tarea.conceptos_clave) 
      : (tarea.conceptos_clave || []);

    // Reconstruir el documento de Word con el diseño premium
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
                    text: `IA-PROFESOR  |  PLAN DE ESTUDIO RECUPERADO  |  ${(tarea.tecnologia || tarea.tema || '').toUpperCase()}`,
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
                text: `PLAN DE ESTUDIO: RECUPERADO`,
                bold: true, size: 16, color: "475569",
                font: "Segoe UI"
              })
            ],
            spacing: { after: 60 }
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: (tarea.titulo || '').toUpperCase(),
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
              new docx.TextRun({ text: `${tarea.tecnologia || tarea.tema}   |   `, font: "Segoe UI", color: "475569" }),
              new docx.TextRun({ text: "Nivel de Dificultad: ", bold: true, font: "Segoe UI", color: "1E293B" }),
              new docx.TextRun({ text: `${tarea.nivel}`, font: "Segoe UI", color: "4F46E5", bold: true })
            ],
            spacing: { after: 400 }
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
                      ...(tarea.descripcion || "").split('\n').map(line => 
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
              new docx.TextRun({ text: "EXPLICACIÓN CONCEPTUAL ASOCIADA", bold: true, size: 20, color: "4F46E5", font: "Segoe UI" })
            ],
            spacing: { before: 200, after: 200 }
          }),
          ...conceptosClave.flatMap(c => [
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
          ])
        ]
      }]
    });

    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.send(buffer);
  } catch (err) {
    console.error('Error al regenerar el documento de Word al vuelo:', err);
    return res.status(500).send('Error interno al regenerar el documento de Word');
  }
});

app.use('/descargas', express.static(tareasPublicDir));

// Importar Express Routers modulares
const estudiantesRouter = require('./routes/estudiantes.cjs');
const tareasRouter = require('./routes/tareas.cjs');
const mentorRouter = require('./routes/mentor.cjs');
const juegosRouter = require('./routes/juegos.cjs');
const logrosRouter = require('./routes/logros.cjs');
const pragmaRouter = require('./routes/pragma.cjs');
const amistadesRouter = require('./routes/amistades.cjs');

// Montar rutas
app.use(estudiantesRouter);
app.use(tareasRouter);
app.use(mentorRouter);
app.use(juegosRouter);
app.use(logrosRouter);
app.use(pragmaRouter);
app.use(amistadesRouter);

// Levantar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor de IA-PROFESOR (Potenciada) ejecutándose en puerto ${PORT}`);
});
