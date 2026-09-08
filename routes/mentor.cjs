const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { client, ejecutarGroqConReintentos, parsearJSONGroq, actualizarPerfilCognitivo } = require('../db.cjs');
const tareasPublicDir = path.join(__dirname, '..', 'public', 'tareas');

const MODELO_MENTOR = 'llama-3.3-70b-versatile';

function parseInlineRuns(text, baseStyle = {}) {
  const runs = [];
  if (!text) return runs;
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      runs.push(new docx.TextRun({
        text: text.substring(lastIdx, match.index),
        font: "Calibri",
        size: 20,
        color: "334155",
        ...baseStyle
      }));
    }
    if (match[2]) {
      runs.push(new docx.TextRun({
        text: match[2],
        font: "Calibri",
        size: 20,
        color: "1E293B",
        bold: true,
        ...baseStyle
      }));
    } else if (match[3]) {
      runs.push(new docx.TextRun({
        text: match[3],
        font: "Calibri",
        size: 20,
        color: "334155",
        italics: true,
        ...baseStyle
      }));
    } else if (match[4]) {
      runs.push(new docx.TextRun({
        text: ` ${match[4]} `,
        font: "Consolas",
        size: 18,
        color: "0F172A",
        shading: { type: docx.ShadingType.CLEAR, fill: "E2E8F0" }
      }));
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    runs.push(new docx.TextRun({
      text: text.substring(lastIdx),
      font: "Calibri",
      size: 20,
      color: "334155",
      ...baseStyle
    }));
  }
  return runs.length > 0 ? runs : [new docx.TextRun({ text, font: "Calibri", size: 20, color: "334155", ...baseStyle })];
}

async function generarDocumentoWord(titulo, subtitulo, introduccion, planMarkdown, planId, prefijo) {
  const safeSubtitulo = (subtitulo || 'DOCUMENTO DE IMPLEMENTACIÓN TÉCNICA').toString().toUpperCase();
  const safeTitulo = (titulo || 'PLAN DE ARQUITECTURA').toString().toUpperCase();
  const safeIntro = introduccion ? String(introduccion).trim() : '';
  const safeMarkdown = (planMarkdown || '').toString().replace(/\r\n/g, '\n');
  const safePrefijo = (prefijo || 'doc').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
  const safePlanId = (planId || crypto.randomUUID()).toString();

  if (!fs.existsSync(tareasPublicDir)) {
    try { fs.mkdirSync(tareasPublicDir, { recursive: true }); } catch (_) {}
  }

  const lines = safeMarkdown.split('\n');
  const contentNodes = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let tableBuffer = [];
  let calloutBuffer = [];

  const flushCodeBlock = () => {
    if (codeBuffer.length === 0) return;
    for (let j = 0; j < codeBuffer.length; j++) {
      contentNodes.push(new docx.Paragraph({
        children: [new docx.TextRun({
          text: codeBuffer[j] || ' ',
          font: "Consolas",
          size: 18,
          color: "0F172A"
        })],
        shading: { type: docx.ShadingType.CLEAR, fill: "F1F5F9" },
        border: { left: { color: "6366F1", space: 4, value: "single", size: 12 } },
        spacing: { before: 15, after: 15 },
        indent: { left: 240 }
      }));
    }
    codeBuffer = [];
  };

  const flushCallout = () => {
    if (calloutBuffer.length === 0) return;
    const calloutText = calloutBuffer.join(' ');
    contentNodes.push(new docx.Table({
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
      borders: {
        top: { style: docx.BorderStyle.NONE, size: 0, color: "auto" },
        bottom: { style: docx.BorderStyle.NONE, size: 0, color: "auto" },
        left: { style: docx.BorderStyle.SINGLE, size: 24, color: "0F766E" },
        right: { style: docx.BorderStyle.NONE, size: 0, color: "auto" },
      },
      rows: [
        new docx.TableRow({
          children: [
            new docx.TableCell({
              shading: { fill: "F8FAFC" },
              margins: { top: 140, bottom: 140, left: 200, right: 140 },
              children: [
                new docx.Paragraph({
                  children: parseInlineRuns(calloutText, { color: "334155", italics: true })
                })
              ]
            })
          ]
        })
      ]
    }));
    contentNodes.push(new docx.Paragraph({ spacing: { after: 120 } }));
    calloutBuffer = [];
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const cleanRows = tableBuffer.filter(r => !/^[|\s-:]+$/.test(r.trim()));
    if (cleanRows.length === 0) { tableBuffer = []; return; }

    const parsedRows = cleanRows.map(r => 
      r.split('|')
        .map(c => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    ).filter(cells => cells.length > 0);

    if (parsedRows.length > 0) {
      const docxRows = parsedRows.map((cells, rowIdx) => {
        const isHeader = rowIdx === 0;
        return new docx.TableRow({
          tableHeader: isHeader,
          children: cells.map(cellText => new docx.TableCell({
            shading: { fill: isHeader ? "1E293B" : (rowIdx % 2 === 0 ? "FFFFFF" : "F1F5F9") },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: {
              top: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              bottom: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              left: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
              right: { style: docx.BorderStyle.SINGLE, size: 4, color: "CBD5E1" }
            },
            children: [
              new docx.Paragraph({
                children: parseInlineRuns(cellText, isHeader ? { color: "FFFFFF", bold: true } : { color: "334155" })
              })
            ]
          }))
        });
      });

      contentNodes.push(new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows: docxRows
      }));
      contentNodes.push(new docx.Paragraph({ spacing: { after: 140 } }));
    }
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i] || '';
    const t = rawLine.trim();

    if (t.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    if (t.startsWith('|') && t.endsWith('|')) {
      tableBuffer.push(t);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    if (t.startsWith('>')) {
      calloutBuffer.push(t.replace(/^>\s*/, ''));
      continue;
    } else if (calloutBuffer.length > 0) {
      flushCallout();
    }

    if (!t) {
      contentNodes.push(new docx.Paragraph({ spacing: { after: 80 } }));
      continue;
    }

    if (t.startsWith('####')) {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t.replace(/^####\s*/, ''), { bold: true, size: 21, color: "4F46E5" }),
        spacing: { before: 160, after: 60 }
      }));
    } else if (t.startsWith('###')) {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t.replace(/^###\s*/, ''), { bold: true, size: 22, color: "0F766E" }),
        spacing: { before: 200, after: 80 }
      }));
    } else if (t.startsWith('##')) {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t.replace(/^##\s*/, ''), { bold: true, size: 26, color: "1E293B" }),
        border: { bottom: { color: "CBD5E1", space: 4, value: "single", size: 8 } },
        spacing: { before: 280, after: 120 }
      }));
    } else if (t.startsWith('#')) {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t.replace(/^#\s*/, ''), { bold: true, size: 30, color: "111827" }),
        border: { bottom: { color: "4F46E5", space: 6, value: "single", size: 14 } },
        spacing: { before: 340, after: 140 }
      }));
    } else if (/^-\s*\[([ xX])\]/.test(t)) {
      const isChecked = /^-\s*\[[xX]\]/.test(t);
      const itemText = t.replace(/^-\s*\[[ xX]\]\s*/, '');
      contentNodes.push(new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: isChecked ? "☑ " : "☐ ",
            font: "Segoe UI Symbol",
            size: 20,
            bold: true,
            color: isChecked ? "10B981" : "64748B"
          }),
          ...parseInlineRuns(itemText, { color: isChecked ? "0F766E" : "334155" })
        ],
        spacing: { before: 30, after: 30 },
        indent: { left: 240 }
      }));
    } else if (t.startsWith('- ') || t.startsWith('* ')) {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t.replace(/^[-*]\s*/, ''), { color: "334155" }),
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 }
      }));
    } else if (/^\d+\.\s/.test(t)) {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t, { color: "334155" }),
        spacing: { before: 40, after: 40 },
        indent: { left: 240 }
      }));
    } else {
      contentNodes.push(new docx.Paragraph({
        children: parseInlineRuns(t, { color: "334155" }),
        spacing: { before: 40, after: 80 }
      }));
    }
  }

  flushCodeBlock();
  flushTable();
  flushCallout();

  const doc = new docx.Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      children: [
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: safeSubtitulo,
              bold: true,
              size: 16,
              color: "4F46E5",
              font: "Calibri"
            })
          ],
          spacing: { after: 60 }
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: safeTitulo,
              bold: true,
              size: 32,
              color: "1E293B",
              font: "Calibri"
            })
          ],
          border: { bottom: { color: "10B981", space: 15, value: "single", size: 18 } },
          spacing: { after: 200 }
        }),
        ...(safeIntro ? [
          new docx.Table({
            width: { size: 100, type: docx.WidthType.PERCENTAGE },
            borders: {
              top: { style: docx.BorderStyle.NONE, size: 0, color: "auto" },
              bottom: { style: docx.BorderStyle.NONE, size: 0, color: "auto" },
              left: { style: docx.BorderStyle.SINGLE, size: 24, color: "0F766E" },
              right: { style: docx.BorderStyle.NONE, size: 0, color: "auto" },
            },
            rows: [
              new docx.TableRow({
                children: [
                  new docx.TableCell({
                    shading: { fill: "F8FAFC" },
                    margins: { top: 140, bottom: 140, left: 200, right: 140 },
                    children: [
                      new docx.Paragraph({
                        children: [
                          new docx.TextRun({ text: "RESUMEN EJECUTIVO & OBJETIVOS PEDAGÓGICOS", bold: true, size: 16, color: "0F766E", font: "Calibri" })
                        ],
                        spacing: { after: 60 }
                      }),
                      new docx.Paragraph({
                        children: parseInlineRuns(safeIntro, { color: "334155", italics: true })
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new docx.Paragraph({ spacing: { after: 200 } })
        ] : []),
        ...contentNodes,
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: "──────────────────────────────────────────────────────",
              color: "CBD5E1",
              size: 16
            })
          ],
          spacing: { before: 300, after: 60 }
        }),
        new docx.Paragraph({
          children: [
            new docx.TextRun({
              text: `Documento generado por Pragma AI Academic Architecture Engine • ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
              size: 16,
              color: "94A3B8",
              italics: true,
              font: "Calibri"
            })
          ],
          spacing: { after: 100 }
        })
      ]
    }]
  });

  const filename = `${safePrefijo}_${safePlanId}_${Date.now()}.docx`;
  const docPath = path.join(tareasPublicDir, filename);
  try {
    const buffer = await docx.Packer.toBuffer(doc);
    fs.writeFileSync(docPath, buffer);
    return `/descargas/${filename}`;
  } catch (errDoc) {
    console.error('Error al empaquetar docx:', errDoc);
    return null;
  }
}

router.post('/api/mentor/crear-plan', async (req, res) => {
  const { estudiante_id, idea_proyecto, github_url } = req.body || {};
  if (!estudiante_id || !idea_proyecto) return res.status(400).json({ error: 'Falta estudiante_id o idea_proyecto' });
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (!estRes.rows || estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const est = estRes.rows[0];
    const pcStr = typeof est.perfil_cognitivo === 'object' ? JSON.stringify(est.perfil_cognitivo || {}) : (est.perfil_cognitivo || '{}');

    const sp = `Eres un Arquitecto de Software Senior y Mentor de Proyectos de Élite.
Tu misión es diseñar un Plan de Implementación de Software de Producción, EXHAUSTIVO, MODULAR y 100% PRÁCTICO para el estudiante.

NEGATIVE CONSTRAINTS ESTRICTAS:
- TERMINANTEMENTE PROHIBIDO limitarse a listas de viñetas genéricas o decir "Crea una función que haga X" sin escribir el código real.
- ESTRICTAMENTE PROHIBIDO devolver pseudocódigo, snippets incompletos, "// TODO", "// implementar después", "/* resto del código */" o elipsis.
- Todo bloque de código debe ser concreto, aplicable, copiable y con sintaxis completa.

DIRECTIVAS CRÍTICAS DE INICIALIZACIÓN Y OPERACIONES EN EL PLAN:
Para cada módulo, servicio o entidad central del proyecto (por ejemplo: modelos de datos, servicios bancarios o de negocio, transacciones atómicas, controladores API o Cloud Functions, lógica de notificaciones):
1. RUTA EXACTA E INICIALIZACIÓN: Indica en la primera línea la ruta exacta del archivo (ej. "// src/services/bankService.js" o "// lib/services/transaction_service.dart"). Muestra todos los imports/requires necesarios, la inicialización del cliente de base de datos y la configuración inicial de arranque.
2. OPERACIONES COMPLETAS ("CÓMO DEBE QUEDAR EL CÓDIGO"): No dejes funciones a la imaginación. Muestra el código real completo de:
   - Lectura / Consulta (GET / stream / query de balance o registros).
   - Creación y Operaciones Críticas (POST / transacción atómica con lock o atomic write para evitar condiciones de carrera o saldos negativos).
   - Actualización de Estado (PUT/PATCH para modificar registros o saldos con validación).
   - Eliminación / Anulación (DELETE o marcado inactivo).
   - Notificación o Feedback (disparo de eventos WebSockets, SnackBar/Alert o push notifications).
3. EXPLICACIÓN DIDÁCTICA ("CÓMO QUEDA Y CÓMO SE CONECTA"): Explica de forma clara qué hace cada función, qué argumentos recibe, qué responde y cómo se enlaza con la interfaz de usuario o las demás partes del sistema.

El plan debe estructurarse obligatoriamente en "plan_markdown" con estas dimensiones técnicas:
## 1. Arquitectura y Árbol de Archivos (árbol de directorios anotado con responsabilidades modulares de cada archivo).
## 2. Inicialización de Archivos & Código Funcional Copiable (bloques de código completos de arranque, imports, modelos y servicios con operaciones GET/POST/actualizar/eliminar/notificaciones completas).
## 3. Integración Paso a Paso & Resultado en Ejecución (comandos de instalación, .env de muestra, cableado entre capas y descripción exacta de cómo se ve en pantalla/consola).
## 4. Criterios de Verificación & Catálogo de Trampas Comunes (checklist ejecutable de pruebas y errores frecuentes a evitar adaptados al nivel del estudiante).

REGLAS DE LONGITUD Y TOKENS:
- "plan_markdown" DEBE SER UN DOCUMENTO TÉCNICO EXHAUSTIVO, EXTENSO Y PROFUNDO. ESTÁ TERMINANTEMENTE PROHIBIDO RESUMIRLO O CORTARLO A UN SOLO ENCABEZADO.
- Debe contener código real, rutas y ejemplos paso a paso para cada fase.
- En "blueprints", incluye exactamente 2 o 3 blueprints fundacionales iniciales más críticos para arrancar este proyecto. Los blueprints adicionales se generarán dinámicamente en el chat según el estudiante converse y plantee nuevas dudas.

Debes responder estrictamente en formato JSON con la siguiente estructura:
{
  "titulo": "Título formal del proyecto",
  "introduccion_pedagogica": "Resumen ejecutivo y objetivos pedagógicos",
  "plan_markdown": "Markdown detallado y completo cumpliendo exhaustivamente las 4 dimensiones técnicas y bloques de código reales",
  "conceptos_clave": [
    { "termino": "Nombre del concepto", "explicacion": "Definición y aplicación práctica en este proyecto" }
  ],
  "blueprints": [
    {
      "id": "bp_proj_1",
      "titulo": "Título técnico del Blueprint específico para este proyecto",
      "categoria": "Modular / Database / Backend / Seguridad / Frontend / Realtime / Testing / Cloud",
      "icono": "Layers / Database / Code2 / ShieldCheck / Cpu / Radio / Smartphone / Cloud / Lock / Terminal / Activity",
      "tagClass": "bp-tag-arch / bp-tag-db / bp-tag-back / bp-tag-sec / bp-tag-front / bp-tag-realtime / bp-tag-test / bp-tag-cloud",
      "desc": "Propósito concreto y responsabilidad en el flujo del proyecto",
      "snippet": "// Código completo de producción o estructura específica del stack",
      "copyText": "Código copiable",
      "askPrompt": "Pregunta para profundizar en este componente con el mentor"
    }
  ]
}`;
    const up = `Diseña el plan técnico exhaustivo para: "${idea_proyecto}". ${github_url ? `Repo: ${github_url}` : ''} Nivel: ${est.nivel_actual || 'Intermedio'}. Perfil: ${pcStr}`;
    const cc = await ejecutarGroqConReintentos(
      [{ role: 'system', content: sp }, { role: 'user', content: up }],
      MODELO_MENTOR,
      { type: 'json_object' },
      6,
      { max_tokens: 7500, temperature: 0.25 }
    );
    const rawContent = cc?.choices?.[0]?.message?.content || '{}';
    const data = parsearJSONGroq(rawContent) || {};
    const titulo = data.titulo || (typeof idea_proyecto === 'string' ? idea_proyecto.slice(0, 60) : 'Proyecto');
    const intro = data.introduccion_pedagogica || 'Plan de implementación práctica para el proyecto.';
    let planMarkdown = data.plan_markdown || '';

    // BLINDAJE ANTI-TRUNCAMIENTO: Si Groq devolvió un string recortado en el JSON, regenerar directamente en Markdown
    if (!planMarkdown || planMarkdown.length < 600 || !planMarkdown.includes('##')) {
      console.log('Detectado plan_markdown trunco en JSON. Solicitando generación Markdown directa...');
      try {
        const fallbackCc = await ejecutarGroqConReintentos([
          {
            role: 'system',
            content: `Eres un Arquitecto de Software Senior y Mentor de Proyectos de Élite.
Genera un Plan de Implementación de Software de Producción, EXHAUSTIVO, EXTENSO y 100% COMPLETO (mínimo 1500 palabras) en formato Markdown puro para el proyecto: "${titulo}".
TERMINANTEMENTE PROHIBIDO recortar el plan o devolver sólo títulos.
Estructura obligatoria con bloques de código completos y funcionales (sin elipsis ni TODOs):
# ${titulo}
## 1. Arquitectura y Árbol de Archivos (árbol de directorios anotado con responsabilidades modulares)
## 2. Inicialización de Archivos & Código Funcional Copiable (archivos reales de inicio a fin con GET, POST atómico con locks, PUT, DELETE y notificaciones completas)
## 3. Integración Paso a Paso & Resultado en Ejecución (comandos de instalación, .env de muestra, cableado y resultado visual/consola)
## 4. Criterios de Verificación & Catálogo de Trampas Comunes (checklist de validación y errores frecuentes a evitar adaptados al nivel del estudiante).`
          },
          {
            role: 'user',
            content: `Genera el plan de arquitectura y código de producción completo para: "${idea_proyecto}". ${github_url ? `Repo base: ${github_url}` : ''} Nivel: ${est.nivel_actual || 'Intermedio'}.`
          }
        ], MODELO_MENTOR, null, 6, { max_tokens: 7500, temperature: 0.25 });
        const fallbackContent = fallbackCc?.choices?.[0]?.message?.content;
        if (fallbackContent && fallbackContent.length > 500) {
          planMarkdown = fallbackContent;
        }
      } catch (errFb) {
        console.warn('Fallback Markdown directo falló, usando planMarkdown obtenido:', errFb.message);
      }
    }

    if (!planMarkdown || planMarkdown.length < 100) {
      planMarkdown = `# ${titulo}\n\n## 1. Arquitectura y Árbol de Archivos\n- src/\n\n## 2. Inicialización de Archivos & Código Funcional Copiable\n\`\`\`javascript\n// Código inicial\n\`\`\`\n\n## 3. Integración Paso a Paso & Resultado en Ejecución\n1. Iniciar servidor.\n\n## 4. Criterios de Verificación & Catálogo de Trampas Comunes\n- Verificar pruebas unitarias.`;
    }

    const planUuid = crypto.randomUUID();
    const docUrl = await generarDocumentoWord(titulo, 'PLAN DE IMPLEMENTACIÓN TÉCNICA', intro, planMarkdown, planUuid, 'plan');
    const bpsDinamicos = Array.isArray(data.blueprints) ? data.blueprints : [];
    await client.query(
      `INSERT INTO profesor_mentor_planes (id, estudiante_id, titulo, idea_proyecto, github_url, plan_markdown, word_url, mensajes, blueprints) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [planUuid, estudiante_id, titulo, idea_proyecto, github_url || null, planMarkdown, docUrl, '[]', JSON.stringify(bpsDinamicos)]
    );
    res.json({
      id: planUuid,
      estudiante_id,
      titulo,
      idea_proyecto,
      github_url: github_url || null,
      plan_markdown: planMarkdown,
      word_url: docUrl,
      mensajes: [],
      blueprints: bpsDinamicos
    });
  } catch(e) {
    console.error('Error al generar plan:', e);
    const status = e.status || (e.message && e.message.includes('Groq') ? 503 : 500);
    res.status(status).json({ error: 'Error al generar el plan de implementación', detalle: e.message || 'Error interno' });
  }
});

router.post('/api/mentor/planes/:plan_id/regenerar-plan', async (req, res) => {
  const { plan_id } = req.params;
  const { enfoque, instrucciones_adicionales } = req.body || {};
  try {
    const pRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [plan_id]);
    if (!pRes.rows || pRes.rows.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    const plan = pRes.rows[0];
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [plan.estudiante_id]);
    const est = (estRes.rows && estRes.rows[0]) || {};
    const pcStr = typeof est.perfil_cognitivo === 'object' ? JSON.stringify(est.perfil_cognitivo || {}) : (est.perfil_cognitivo || '{}');

    const promptExtra = [
      enfoque ? `Enfoque solicitado para esta regeneración: "${enfoque}".` : '',
      instrucciones_adicionales ? `Instrucciones del estudiante: "${instrucciones_adicionales}".` : ''
    ].filter(Boolean).join(' ');

    const sp = `Eres un Arquitecto de Software Senior y Mentor de Proyectos de Élite.
Tu misión es REGENERAR Y PROFUNDIZAR de forma EXHAUSTIVA el Plan de Implementación para este proyecto.

PROYECTO: "${plan.titulo}"
IDEA ORIGINAL: "${plan.idea_proyecto}"
${plan.github_url ? `REPOSITORIO BASE: ${plan.github_url}` : ''}
${promptExtra ? `AJUSTES DE REGENERACIÓN: ${promptExtra}` : ''}

NEGATIVE CONSTRAINTS ESTRICTAS:
- TERMINANTEMENTE PROHIBIDO resumir, omitir código o dejar funciones con placeholders o elipsis.
- Todo bloque de código debe ser 100% funcional, limpio, copiable, con importaciones completas, tipado y manejo de excepciones robusto.

El plan debe estructurarse obligatoriamente en "plan_markdown" con estas 4 dimensiones técnicas completas (mínimo 1500 palabras en total):
## 1. Arquitectura y Árbol de Archivos (árbol de directorios anotado con responsabilidades modulares de cada archivo).
## 2. Inicialización de Archivos & Código Funcional Copiable (bloques de código completos de arranque, imports, modelos y servicios con operaciones GET/POST atómico/PUT/DELETE y notificaciones completas).
## 3. Integración Paso a Paso & Resultado en Ejecución (comandos de instalación, .env de muestra, cableado entre capas y descripción exacta de cómo se ve en pantalla/consola).
## 4. Criterios de Verificación & Catálogo de Trampas Comunes (checklist ejecutable de pruebas y errores frecuentes a evitar adaptados al nivel del estudiante).

Debes responder estrictamente en formato JSON con la siguiente estructura:
{
  "titulo": "${plan.titulo}",
  "introduccion_pedagogica": "Resumen ejecutivo actualizado y objetivos pedagógicos profundizados",
  "plan_markdown": "Markdown completo y detallado cumpliendo exhaustivamente las 4 dimensiones técnicas con código real copiable",
  "blueprints": [
    {
      "id": "bp_proj_regen_1",
      "titulo": "Título técnico del Blueprint específico",
      "categoria": "Modular / Database / Backend / Seguridad / Frontend / Realtime / Testing / Cloud",
      "icono": "Layers / Database / Code2 / ShieldCheck / Cpu / Radio / Smartphone / Cloud / Lock / Terminal / Activity",
      "tagClass": "bp-tag-arch / bp-tag-db / bp-tag-back / bp-tag-sec / bp-tag-front / bp-tag-realtime / bp-tag-test / bp-tag-cloud",
      "desc": "Propósito concreto y responsabilidad en el flujo del proyecto",
      "snippet": "// Código completo de producción",
      "copyText": "Código copiable",
      "askPrompt": "Pregunta sugerida para profundizar con el mentor"
    }
  ]
}`;

    const cc = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: sp },
        { role: 'user', content: `Regenera el plan técnico exhaustivo para: "${plan.idea_proyecto}". ${promptExtra} Nivel: ${est.nivel_actual || 'Intermedio'}. Perfil: ${pcStr}` }
      ],
      MODELO_MENTOR,
      { type: 'json_object' },
      6,
      { max_tokens: 7500, temperature: 0.25 }
    );

    const rawContent = cc?.choices?.[0]?.message?.content || '{}';
    const data = parsearJSONGroq(rawContent) || {};
    const titulo = data.titulo || plan.titulo;
    const intro = data.introduccion_pedagogica || 'Plan de implementación práctica regenerado para el proyecto.';
    let planMarkdown = data.plan_markdown || '';

    // Blindaje anti-truncamiento de regeneración
    if (!planMarkdown || planMarkdown.length < 600 || !planMarkdown.includes('##')) {
      console.log('Detectado plan_markdown trunco en regeneración. Solicitando Markdown directo...');
      try {
        const fbCc = await ejecutarGroqConReintentos([
          {
            role: 'system',
            content: `Eres un Arquitecto de Software Senior y Mentor de Proyectos de Élite.
Genera un Plan de Implementación de Software de Producción, EXHAUSTIVO, EXTENSO y 100% COMPLETO (mínimo 1500 palabras) en formato Markdown puro para el proyecto: "${titulo}".
${promptExtra ? `AJUSTES: ${promptExtra}` : ''}
TERMINANTEMENTE PROHIBIDO recortar el plan o devolver sólo títulos.
Estructura obligatoria con bloques de código completos y funcionales (sin elipsis ni TODOs):
# ${titulo}
## 1. Arquitectura y Árbol de Archivos (árbol de directorios anotado con responsabilidades modulares)
## 2. Inicialización de Archivos & Código Funcional Copiable (archivos reales de inicio a fin con GET, POST atómico con locks, PUT, DELETE y notificaciones completas)
## 3. Integración Paso a Paso & Resultado en Ejecución (comandos de instalación, .env de muestra, cableado y resultado visual/consola)
## 4. Criterios de Verificación & Catálogo de Trampas Comunes (checklist de validación y errores frecuentes a evitar adaptados al nivel del estudiante).`
          },
          {
            role: 'user',
            content: `Regenera y profundiza el plan técnico de arquitectura completo para: "${plan.idea_proyecto}". Nivel: ${est.nivel_actual || 'Intermedio'}.`
          }
        ], MODELO_MENTOR, null, 6, { max_tokens: 7500, temperature: 0.25 });
        const fbContent = fbCc?.choices?.[0]?.message?.content;
        if (fbContent && fbContent.length > 500) {
          planMarkdown = fbContent;
        }
      } catch (errFb) {
        console.warn('Fallback Markdown directo en regeneración falló:', errFb.message);
      }
    }

    if (!planMarkdown || planMarkdown.length < 100) {
      planMarkdown = plan.plan_markdown;
    }

    const docUrl = await generarDocumentoWord(
      titulo,
      'PLAN DE IMPLEMENTACIÓN TÉCNICA (REGENERADO)',
      intro,
      planMarkdown,
      plan.id,
      'plan_regen'
    );

    const bpsDinamicos = (Array.isArray(data.blueprints) && data.blueprints.length > 0)
      ? data.blueprints
      : (Array.isArray(plan.blueprints) ? plan.blueprints : []);

    const hist = typeof plan.mensajes === 'string' ? JSON.parse(plan.mensajes || '[]') : (plan.mensajes || []);
    const nowIso = new Date().toISOString();
    const updatedMsgs = [
      ...hist,
      {
        remitente: 'mentor',
        texto: `🔄 He regenerado y enriquecido el **Plan de Implementación** de tu proyecto "${titulo}" con arquitectura exhaustiva, código de inicialización y operaciones completas. Puedes consultarlo en la pestaña del plan y descargar el nuevo documento Word.`,
        fecha: nowIso
      }
    ];

    await client.query(
      `UPDATE profesor_mentor_planes SET titulo = $1, plan_markdown = $2, word_url = $3, blueprints = $4, mensajes = $5 WHERE id = $6`,
      [titulo, planMarkdown, docUrl, JSON.stringify(bpsDinamicos), JSON.stringify(updatedMsgs), plan_id]
    );

    res.json({
      success: true,
      plan: {
        id: plan.id,
        estudiante_id: plan.estudiante_id,
        titulo,
        idea_proyecto: plan.idea_proyecto,
        github_url: plan.github_url,
        plan_markdown: planMarkdown,
        word_url: docUrl,
        mensajes: updatedMsgs,
        blueprints: bpsDinamicos
      }
    });
  } catch(e) {
    console.error('Error al regenerar plan:', e);
    const status = e.status || (e.message && e.message.includes('Groq') ? 503 : 500);
    res.status(status).json({ error: 'Error al regenerar el plan de implementación', detalle: e.message || 'Error interno' });
  }
});

router.post('/api/mentor/planes/:plan_id/regenerar-word', async (req, res) => {
  const { plan_id } = req.params;
  try {
    const pRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [plan_id]);
    if (!pRes.rows || pRes.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });
    const plan = pRes.rows[0];
    const docUrl = await generarDocumentoWord(
      plan.titulo,
      'PLAN DE IMPLEMENTACIÓN TÉCNICA',
      `Plan exhaustivo de arquitectura y código funcional para: ${plan.idea_proyecto}`,
      plan.plan_markdown,
      plan.id,
      'plan_word'
    );
    await client.query('UPDATE profesor_mentor_planes SET word_url = $1 WHERE id = $2', [docUrl, plan_id]);
    res.json({ success: true, word_url: docUrl });
  } catch(e) {
    console.error('Error al regenerar Word del plan:', e);
    res.status(500).json({ error: 'Error al regenerar documento Word', detalle: e.message });
  }
});

router.get('/api/mentor/planes/:estudiante_id', async (req, res) => {
  try {
    const r = await client.query('SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC', [req.params.estudiante_id]);
    const rows = Array.isArray(r.rows) ? r.rows : [];
    res.json(rows.map(p => ({
      ...p,
      mensajes: typeof p.mensajes === 'string' ? JSON.parse(p.mensajes || '[]') : (p.mensajes || []),
      blueprints: typeof p.blueprints === 'string' ? JSON.parse(p.blueprints || '[]') : (Array.isArray(p.blueprints) ? p.blueprints : [])
    })));
  } catch(e) {
    console.error('Error al obtener planes:', e);
    res.status(500).json({ error: 'Error al consultar planes', detalle: e.message || 'Error interno' });
  }
});

router.post('/api/mentor/planes/:plan_id/generar-blueprints', async (req, res) => {
  const { plan_id } = req.params;
  const { enfoque } = req.body || {};
  try {
    const planRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [plan_id]);
    if (!planRes.rows || planRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Plan no encontrado' });
    }
    const plan = planRes.rows[0];
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [plan.estudiante_id]);
    const est = (estRes.rows && estRes.rows[0]) || {};
    const pcStr = typeof est.perfil_cognitivo === 'object' ? JSON.stringify(est.perfil_cognitivo || {}) : (est.perfil_cognitivo || '{}');

    const sp = `Eres un Arquitecto de Software Principal de Élite.
Tu misión es diseñar entre 4 y 6 BLUEPRINTS ARQUITECTÓNICOS Y RECURSOS DE PRODUCCIÓN DINÁMICOS, 100% PERSONALIZADOS Y ADAPTADOS A ESTE PROYECTO ESPECÍFICO.

PROYECTO: "${plan.titulo}"
IDEA Y ALCANCE: "${plan.idea_proyecto}"
${plan.github_url ? `REPOSITORIO: ${plan.github_url}` : ''}
PLAN BASE DEL PROYECTO:
${plan.plan_markdown || ''}
PERFIL COGNITIVO DEL ESTUDIANTE:
${pcStr}
${enfoque ? `ENFOQUE PRIORITARIO SOLICITADO: "${enfoque}"` : ''}

REGLAS OBLIGATORIAS PARA CADA BLUEPRINT:
1. DEBE SER 100% APLICABLE al stack técnico y dominio de este proyecto (ej. si es Flutter, mostrar Dart/Riverpod/Widgets; si es Node/Postgres, mostrar Express/SQL ACID; si es Firebase, mostrar reglas y Cloud Functions).
2. "id": "bp_dyn_${plan_id}_" + índice (ej. "bp_dyn_${plan_id}_1").
3. "titulo": Título técnico formal de la arquitectura o componente.
4. "categoria": Uno de: ["Modular", "Database", "Backend", "Seguridad", "Frontend", "Realtime", "Testing", "Cloud"].
5. "icono": Uno de: ["Layers", "Database", "Code2", "ShieldCheck", "Cpu", "Radio", "Smartphone", "Cloud", "Lock", "Terminal", "Activity"].
6. "tagClass": Clase CSS según categoría ("bp-tag-arch", "bp-tag-db", "bp-tag-back", "bp-tag-sec", "bp-tag-front", "bp-tag-realtime", "bp-tag-test", "bp-tag-cloud").
7. "desc": Descripción técnica de la responsabilidad del componente en este proyecto.
8. "snippet": Bloque de código completo o árbol anotado, con imports, tipado y operaciones funcionales sin elipsis ni placeholders incompletos.
9. "copyText": Código copiable listo para producción.
10. "askPrompt": Pregunta estratégica que el estudiante puede enviar al mentor para profundizar.

Debes responder estrictamente en formato JSON con la siguiente estructura:
{
  "blueprints": [
    {
      "id": "bp_dyn_${plan_id}_1",
      "titulo": "...",
      "categoria": "...",
      "icono": "...",
      "tagClass": "...",
      "desc": "...",
      "snippet": "...",
      "copyText": "...",
      "askPrompt": "..."
    }
  ]
}`;

    const cc = await ejecutarGroqConReintentos(
      [
        { role: 'system', content: sp },
        { role: 'user', content: `Genera entre 4 y 6 blueprints dinámicos de producción para: "${plan.titulo}".` }
      ],
      MODELO_MENTOR,
      { type: 'json_object' }
    );
    const rawContent = cc?.choices?.[0]?.message?.content || '{}';
    const data = parsearJSONGroq(rawContent) || {};
    const nuevosBlueprints = Array.isArray(data.blueprints) ? data.blueprints : [];

    if (nuevosBlueprints.length === 0) {
      return res.status(500).json({ success: false, error: 'No se pudieron generar blueprints dinámicos con IA' });
    }

    const prevBlueprints = typeof plan.blueprints === 'string'
      ? JSON.parse(plan.blueprints || '[]')
      : (Array.isArray(plan.blueprints) ? plan.blueprints : []);

    const combinados = [...nuevosBlueprints];
    for (const pb of prevBlueprints) {
      if (!combinados.some(nb => (nb.titulo || '').toLowerCase() === (pb.titulo || '').toLowerCase())) {
        combinados.push(pb);
      }
    }

    await client.query('UPDATE profesor_mentor_planes SET blueprints = $1 WHERE id = $2', [JSON.stringify(combinados), plan_id]);

    res.json({
      success: true,
      blueprints: combinados,
      nuevos: nuevosBlueprints.length
    });
  } catch (err) {
    console.error('Error al generar blueprints dinámicos con IA:', err);
    res.status(500).json({ success: false, error: 'Error al generar blueprints con IA', detalle: err.message || '' });
  }
});

router.get('/api/mentor/second-brain/:estudiante_id', async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (!estRes.rows || estRes.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    const est = estRes.rows[0];
    const planesRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC', [estudiante_id]);
    const planes = Array.isArray(planesRes.rows) ? planesRes.rows : [];
    let md = `# AI SECOND BRAIN LOG\n## ${est.nombre || 'Estudiante'} - ${est.nivel_actual || 'General'}\n\n`;
    for (const p of planes) {
      md += `### ${p.titulo || 'Proyecto'}\n- Idea: ${p.idea_proyecto || ''}\n\n`;
      const msgs = typeof p.mensajes === 'string' ? JSON.parse(p.mensajes || '[]') : (p.mensajes || []);
      for (const g of msgs.filter(m => m && m.documento_ayuda)) {
        md += `#### ${g.documento_ayuda.titulo || 'Guía'}\n${g.documento_ayuda.markdown || ''}\n\n---\n\n`;
      }
    }
    const nombreSanitizado = (est.nombre || 'estudiante').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="second-brain-${nombreSanitizado}.md"`);
    res.send(md);
  } catch(e) {
    console.error('Error en second-brain:', e);
    res.status(500).json({ error: 'Error al generar second-brain', detalle: e.message || 'Error interno' });
  }
});

router.post('/api/mentor/chat', async (req, res) => {
  const { plan_id, mensaje, personalidad } = req.body || {};
  if (!plan_id || !mensaje) return res.status(400).json({ error: 'Falta plan_id o mensaje' });
  try {
    const planRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [plan_id]);
    if (!planRes.rows || planRes.rows.length === 0) return res.status(404).json({ error: 'Plan no encontrado' });
    const plan = planRes.rows[0];
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [plan.estudiante_id]);
    const est = (estRes.rows && estRes.rows[0]) || {};
    const pcStr = typeof est.perfil_cognitivo === 'object' ? JSON.stringify(est.perfil_cognitivo || {}) : (est.perfil_cognitivo || '{}');
    const hist = typeof plan.mensajes === 'string' ? JSON.parse(plan.mensajes || '[]') : (plan.mensajes || []);

    let directivaPersonalidad = `PERSONALIDAD: Riguroso (Arquitecto de Software Senior). Enfoque en Clean Architecture, desacoplamiento, patrones SOLID, tipado seguro, código defensivo, manejo exhaustivo de excepciones y robustez. Tono analítico, exigente y de máxima calidad técnica.`;
    if (personalidad === 'Socrático') {
      directivaPersonalidad = `PERSONALIDAD: Socrático (Mentor Pedagógico & Pensamiento Crítico). Formula preguntas orientadoras, análisis de trade-offs arquitectónicos y diagramas conceptuales antes de exponer la solución. Reta al estudiante a razonar la arquitectura y explica los principios de fondo.`;
    } else if (personalidad === 'Tech Lead') {
      directivaPersonalidad = `PERSONALIDAD: Tech Lead (Mentor Práctico de Producción). Enfoque directo y pragmático en entregables funcionales para producción, balance óptimo entre velocidad y deuda técnica, DX y código listo para despliegue.`;
    }

    const sp = `Eres un Arquitecto de Software Senior y Mentor Técnico de Élite.
${directivaPersonalidad}

PROYECTO ACTIVO: "${plan.titulo || 'Proyecto de Software'}"
PLAN BASE DEL PROYECTO:
${plan.plan_markdown || ''}

PERFIL COGNITIVO DEL ESTUDIANTE:
${pcStr}

NEGATIVE CONSTRAINTS ESTRICTAS:
- TERMINANTEMENTE PROHIBIDO devolver respuestas teóricas superficiales, pasos vagos sin código, o decir "implementa la lógica" sin proporcionar el código real.
- ESTRICTAMENTE PROHIBIDO utilizar placeholders, elipsis o comentarios incompletos como "// TODO", "// implementar aquí", "// resto del código", "/* ... */" o "...".
- Todo bloque de código debe ser 100% funcional, limpio, copiable, con importaciones completas, tipado y manejo de excepciones robusto.

DIRECTIVAS OBLIGATORIAS DE RESPUESTA ("CÓMO INICIALIZAR Y CÓMO DEBE QUEDAR"):
Cuando el estudiante pregunte por una funcionalidad, pantalla, servicio, endpoint o duda de código:
1. RUTA Y CÓMO INICIALIZAR EL ARCHIVO:
   - Especifica la ruta exacta del archivo (ej. "// src/controllers/accountController.js" o "// lib/services/bank_service.dart").
   - Muestra cómo arrancar el archivo desde la línea 1: imports necesarios, librerías, instanciación de clientes de base de datos/servicios y configuración.
2. OPERACIONES COMPLETAS ("CÓMO DEBE QUEDAR EL CÓDIGO"):
   - Si la consulta involucra datos o flujos de negocio, muestra el código completo de la operación:
     * Lectura / Consulta (GET / stream / query).
     * Creación o Transacción Crítica (POST / atomic transaction sin race conditions ni saldos inconsistentes).
     * Actualización / Modificación (PUT/PATCH con validación previa de datos).
     * Eliminación / Anulación (DELETE seguro).
     * Notificación o Feedback (disparo de WebSockets, push o feedback en UI).
3. EXPLICACIÓN DIDÁCTICA Y PRUEBA EN EJECUCIÓN:
   - Explica de forma clara cómo se conecta con el resto del proyecto.
   - Describe exactamente cómo debe lucir el resultado ejecutado (en consola, logs o interfaz) y proporciona un comando o payload JSON de prueba.

ESTRUCTURA OBLIGATORIA DEL DOCUMENTO DE AYUDA (documento_ayuda_markdown):
El campo "documento_ayuda_markdown" DEBE estructurarse OBLIGATORIAMENTE con estas 4 dimensiones estructurales:
# [Título Técnico Formal de la Guía]
## 1. Arquitectura y Árbol de Archivos
Árbol de directorios claro y anotado indicando la ubicación exacta de cada archivo nuevo o modificado dentro del proyecto y la responsabilidad de cada módulo.
## 2. Inicialización de Archivos & Implementación Completa Copiable
Bloques de código completos y funcionales (uno por cada archivo crítico) con lenguaje especificado (\`\`\`javascript, \`\`\`dart, \`\`\`python, etc.), sintaxis completa de inicio a fin sin elipsis, importaciones y manejo de errores.
## 3. Integración Paso a Paso & Resultado en Ejecución ("Cómo debe quedar")
Guía secuencial ordenada: dependencias exactas a instalar (npm install / flutter pub add), variables de entorno (.env de ejemplo), cableado en la aplicación, y descripción exacta de cómo luce la pantalla / consola / logs HTTP en ejecución.
## 4. Criterios de Verificación & Trampas Comunes
Checklist de pruebas y comandos ejecutables para validar éxito (curl, scripts o tests), respuestas esperadas y catálogo de al menos 3 trampas comunes o errores frecuentes a evitar adaptados al perfil del estudiante.

MENSAJE DEL CHAT (mensaje_chat):
- Redacta una respuesta conversacional, motivadora y didáctica de 2 a 4 párrafos en el tono de la personalidad activa.
- Explica la estrategia central y orienta al estudiante a revisar la guía técnica detallada generada.

GENERACIÓN DINÁMICA DE BLUEPRINTS EN TIEMPO REAL:
Si la consulta del estudiante o tu respuesta describe, diseña o refactoriza un componente técnico reusable, modelo de base de datos, servicio, middleware o andamio de código relevante para este proyecto, extrae y define ese componente en el campo "nuevo_blueprint". Si la consulta es puramente teórica o no introduce un nuevo andamio de código, envía null.

Debes responder estrictamente en formato JSON:
{
  "mensaje_chat": "Respuesta conversacional para el panel de chat",
  "documento_ayuda_titulo": "Título formal de la guía",
  "documento_ayuda_markdown": "Markdown cumpliendo estrictamente las 4 dimensiones obligatorias",
  "nuevo_blueprint": null
}

O si se diseñó un componente técnico específico:
"nuevo_blueprint": {
  "titulo": "Título técnico del componente",
  "categoria": "Modular / Database / Backend / Seguridad / Frontend / Realtime / Testing / Cloud",
  "icono": "Layers / Database / Code2 / ShieldCheck / Cpu / Radio / Smartphone / Cloud / Lock / Terminal / Activity",
  "tagClass": "bp-tag-arch / bp-tag-db / bp-tag-back / bp-tag-sec / bp-tag-front / bp-tag-realtime / bp-tag-test / bp-tag-cloud",
  "desc": "Propósito concreto y responsabilidad en el proyecto",
  "snippet": "// Código funcional completo del componente",
  "copyText": "Código copiable",
  "askPrompt": "Pregunta sugerida para profundizar con el mentor"
}`;

    const msgs = [
      { role: 'system', content: sp },
      ...hist.map(m => ({
        role: m.remitente === 'estudiante' ? 'user' : 'assistant',
        content: m.documento_ayuda ? JSON.stringify({
          mensaje_chat: m.texto || '',
          documento_ayuda_titulo: m.documento_ayuda.titulo || '',
          documento_ayuda_markdown: m.documento_ayuda.markdown || ''
        }) : (m.texto || '')
      })),
      { role: 'user', content: mensaje }
    ];

    const cc = await ejecutarGroqConReintentos(msgs, MODELO_MENTOR, { type: 'json_object' }, 6, { max_tokens: 6500, temperature: 0.3 });
    const rawContent = cc?.choices?.[0]?.message?.content || '{}';
    const data = parsearJSONGroq(rawContent) || {};

    const mensajeChat = data.mensaje_chat || 'Aquí tienes la guía técnica de implementación para tu proyecto.';
    const docTitulo = data.documento_ayuda_titulo || `Guía Técnica: ${plan.titulo || 'Proyecto'}`;
    const docMarkdown = data.documento_ayuda_markdown || `# ${docTitulo}\n\n## 1. Arquitectura y Árbol de Archivos\n- src/\n\n## 2. Implementación de Código Completa y Copiable\n\`\`\`javascript\n// Código funcional\n\`\`\`\n\n## 3. Integración Paso a Paso & Resultado en Ejecución\n1. Iniciar servidor.\n\n## 4. Criterios de Verificación & Trampas Comunes\n- Verificar logs.`;

    const docUuid = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const docUrl = await generarDocumentoWord(docTitulo, 'GUÍA DE AYUDA', null, docMarkdown, docUuid, 'ayuda');

    await client.query(
      `INSERT INTO profesor_mentor_documentos_ayuda (id, plan_id, mensaje_estudiante, respuesta_mentor, documento_markdown, word_url) VALUES ($1,$2,$3,$4,$5,$6)`,
      [docUuid, plan_id, mensaje, mensajeChat, docMarkdown, docUrl]
    );

    const docObj = {
      id: docUuid,
      titulo: docTitulo,
      word_url: docUrl,
      markdown: docMarkdown,
      fecha: nowIso
    };

    // Procesar nuevo blueprint dinámico si fue generado por la IA en el chat
    let planBlueprints = Array.isArray(plan.blueprints)
      ? plan.blueprints
      : (typeof plan.blueprints === 'string' ? JSON.parse(plan.blueprints || '[]') : []);

    let blueprintGenerado = null;
    if (data.nuevo_blueprint && data.nuevo_blueprint.titulo && data.nuevo_blueprint.snippet) {
      blueprintGenerado = {
        id: `bp_chat_${plan_id}_${Date.now()}`,
        titulo: data.nuevo_blueprint.titulo,
        categoria: data.nuevo_blueprint.categoria || 'Backend',
        icono: data.nuevo_blueprint.icono || 'Code2',
        tagClass: data.nuevo_blueprint.tagClass || 'bp-tag-back',
        desc: data.nuevo_blueprint.desc || 'Componente diseñado durante la sesión con el mentor.',
        snippet: data.nuevo_blueprint.snippet,
        copyText: data.nuevo_blueprint.copyText || data.nuevo_blueprint.snippet,
        askPrompt: data.nuevo_blueprint.askPrompt || `¿Cómo sigo refinando ${data.nuevo_blueprint.titulo}?`
      };

      if (!planBlueprints.some(b => (b.titulo || '').toLowerCase() === (blueprintGenerado.titulo || '').toLowerCase())) {
        planBlueprints.push(blueprintGenerado);
        await client.query('UPDATE profesor_mentor_planes SET blueprints = $1 WHERE id = $2', [JSON.stringify(planBlueprints), plan_id]);
      }
    }

    const updated = [
      ...hist,
      { remitente: 'estudiante', texto: mensaje, fecha: nowIso },
      { remitente: 'mentor', texto: mensajeChat, fecha: nowIso, documento_ayuda: docObj }
    ];

    await client.query('UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2', [JSON.stringify(updated), plan_id]);
    actualizarPerfilCognitivo(plan.estudiante_id, mensaje, mensajeChat).catch(e => console.error('Error actualizando perfil cognitivo:', e));

    res.json({
      respuesta: mensajeChat,
      mensajes: updated,
      documento_ayuda: docObj,
      nuevo_blueprint: blueprintGenerado,
      blueprints: planBlueprints
    });
  } catch(e) {
    console.error('Error en chat mentor:', e);
    const status = e.status || (e.message && e.message.includes('Groq') ? 503 : 500);
    res.status(status).json({
      error: 'Error en chat mentor',
      detalle: e.message || 'Error interno'
    });
  }
});

router.get('/api/mentor/planes/:plan_id/documentos', async (req, res) => {
  try {
    const r = await client.query('SELECT * FROM profesor_mentor_documentos_ayuda WHERE plan_id = $1 ORDER BY creado_en DESC', [req.params.plan_id]);
    res.json(Array.isArray(r.rows) ? r.rows : []);
  } catch(e) {
    console.error('Error al obtener documentos:', e);
    res.status(500).json({ error: 'Error al consultar documentos de ayuda', detalle: e.message || 'Error interno' });
  }
});

router.post('/api/mentor/documentos/regenerar', async (req, res) => {
  const { documento_id } = req.body || {};
  if (!documento_id) return res.status(400).json({ error: 'Falta documento_id' });
  try {
    const dr = await client.query('SELECT * FROM profesor_mentor_documentos_ayuda WHERE id = $1', [documento_id]);
    if (!dr.rows || dr.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    const da = dr.rows[0];
    const pr = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1', [da.plan_id]);
    const plan = (pr.rows && pr.rows[0]) || {};

    const sp = `Eres un Arquitecto de Software Senior y Mentor Técnico de Élite.
Tu tarea es REGENERAR y PROFUNDIZAR una Guía Técnica de Ayuda para el proyecto: "${plan.titulo || 'Proyecto de Software'}".
Consulta del estudiante: "${da.mensaje_estudiante || ''}"
Guía previa a enriquecer:
${da.documento_markdown || ''}

NEGATIVE CONSTRAINTS ESTRICTAS:
- ESTRICTAMENTE PROHIBIDO devolver pseudocódigo, respuestas teóricas superficiales o resúmenes vagos.
- ESTRICTAMENTE PROHIBIDO utilizar placeholders o comentarios incompletos como "// TODO", "// implementar aquí", "// resto del código", "/* ... */" o elipsis.
- Todo bloque de código debe ser 100% funcional, limpio, copiable, con importaciones completas y manejo de excepciones robusto.

DIRECTIVAS CRÍTICAS DE INICIALIZACIÓN Y OPERACIONES EN EL PLAN:
Para cada módulo, servicio o entidad central del proyecto (modelos, servicios bancarios o de negocio, transacciones atómicas, controladores API o Cloud Functions, lógica de notificaciones):
1. RUTA EXACTA E INICIALIZACIÓN: Muestra en la primera línea la ruta exacta del archivo (ej. "// src/services/bankService.js"). Muestra todos los imports/requires necesarios, la inicialización del cliente de base de datos/servicios y la configuración inicial de arranque.
2. OPERACIONES COMPLETAS ("CÓMO DEBE QUEDAR EL CÓDIGO"):
   - Lectura / Consulta (GET / stream / query de balance o registros).
   - Creación y Operaciones Críticas (POST / transacción atómica con lock o atomic write para evitar condiciones de carrera o saldos negativos).
   - Actualización de Estado (PUT/PATCH para modificar registros o saldos con validación).
   - Eliminación / Anulación (DELETE o marcado inactivo).
   - Notificación o Feedback (disparo de eventos WebSockets, SnackBar/Alert o push notifications).
3. EXPLICACIÓN DIDÁCTICA ("CÓMO QUEDA Y CÓMO SE CONECTA"): Explica de forma clara qué hace cada función, qué argumentos recibe, qué responde y cómo se enlaza con la interfaz de usuario o las demás partes del sistema.

ESTRUCTURA OBLIGATORIA DEL DOCUMENTO DE AYUDA (documento_ayuda_markdown):
El campo "documento_ayuda_markdown" DEBE estructurarse OBLIGATORIAMENTE con estas 4 dimensiones estructurales:
# [Título Técnico Actualizado de la Guía]
## 1. Arquitectura y Árbol de Archivos
Árbol de directorios anotado con archivos creados o modificados y sus responsabilidades.
## 2. Implementación de Código Completa y Copiable
Bloques de código 100% completos, funcionales, copiables con lenguaje especificado, sin elipsis, con imports y manejo de excepciones.
## 3. Integración Paso a Paso & Resultado en Ejecución
Guía secuencial: instalación de paquetes, variables de entorno, cableado, y cómo luce en pantalla/consola/logs en ejecución.
## 4. Criterios de Verificación & Trampas Comunes
Checklist de verificación con comandos de prueba y catálogo de trampas/errores frecuentes a evitar.

MENSAJE DEL CHAT (mensaje_chat):
- Respuesta conversacional actualizada de 2 a 4 párrafos orientando al estudiante.

Debes responder estrictamente en formato JSON:
{
  "mensaje_chat": "Respuesta conversacional actualizada",
  "documento_ayuda_titulo": "Título técnico actualizado de la guía",
  "documento_ayuda_markdown": "Markdown enriquecido cumpliendo las 4 dimensiones obligatorias"
}`;

    const cc = await ejecutarGroqConReintentos([
      { role: 'system', content: sp },
      { role: 'user', content: `Regenera y profundiza con código completo de inicialización y operaciones la guía para: "${da.mensaje_estudiante || 'Consulta técnica'}"` }
    ], MODELO_MENTOR, { type: 'json_object' });
    const rawContent = cc?.choices?.[0]?.message?.content || '{}';
    const data = parsearJSONGroq(rawContent) || {};

    const mensajeChat = data.mensaje_chat || 'Guía técnica regenerada y enriquecida con mayor profundidad.';
    const docTitulo = data.documento_ayuda_titulo || 'Guía Técnica (Regenerada)';
    const docMarkdown = data.documento_ayuda_markdown || da.documento_markdown || '';

    const docUrl = await generarDocumentoWord(docTitulo, 'GUÍA (REGENERADA)', null, docMarkdown, documento_id, 'ayuda_regen');
    await client.query(
      `UPDATE profesor_mentor_documentos_ayuda SET respuesta_mentor=$1, documento_markdown=$2, word_url=$3 WHERE id=$4`,
      [mensajeChat, docMarkdown, docUrl, documento_id]
    );

    const hist = typeof plan.mensajes === 'string' ? JSON.parse(plan.mensajes || '[]') : (plan.mensajes || []);
    const upd = hist.map(m => {
      if (m.documento_ayuda && m.documento_ayuda.id === documento_id) {
        return {
          ...m,
          texto: mensajeChat,
          documento_ayuda: {
            ...m.documento_ayuda,
            titulo: docTitulo,
            word_url: docUrl,
            markdown: docMarkdown
          }
        };
      }
      return m;
    });
    await client.query('UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2', [JSON.stringify(upd), da.plan_id]);
    res.json({
      id: documento_id,
      plan_id: da.plan_id,
      respuesta_mentor: mensajeChat,
      documento_markdown: docMarkdown,
      word_url: docUrl
    });
  } catch(e) {
    console.error('Error al regenerar documento:', e);
    const status = e.status || (e.message && e.message.includes('Groq') ? 503 : 500);
    res.status(status).json({ error: 'Error al regenerar la guía técnica', detalle: e.message || 'Error interno' });
  }
});

module.exports = router;
