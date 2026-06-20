const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const docx = require('docx');
const { client, ejecutarGroqConReintentos, parsearJSONGroq, actualizarPerfilCognitivo } = require('../db.cjs');
const tareasPublicDir = path.join(__dirname, '..', 'public', 'tareas');

async function generarDocumentoWord(titulo, subtitulo, introduccion, planMarkdown, planId, prefijo) {
  const doc = new docx.Document({
    sections: [{
      properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        new docx.Paragraph({ children: [new docx.TextRun({ text: subtitulo.toUpperCase(), bold: true, size: 16, color: "4F46E5", font: "Segoe UI" })], spacing: { after: 60 } }),
        new docx.Paragraph({ children: [new docx.TextRun({ text: titulo.toUpperCase(), bold: true, size: 30, color: "1E293B", font: "Segoe UI" })], border: { bottom: { color: "10B981", space: 15, value: "single", size: 18 } }, spacing: { after: 200 } }),
        ...(introduccion ? [new docx.Paragraph({ children: [new docx.TextRun({ text: introduccion, size: 20, font: "Segoe UI", color: "334155" })], spacing: { after: 250 } })] : []),
        ...planMarkdown.split('\n').map(line => {
          const t = line.trim(); let b=false, s=20, c="334155", bs=0, tx=t;
          if(t.startsWith('###')){b=true;s=22;c="4F46E5";bs=120;tx=t.replace('###','').trim();}
          else if(t.startsWith('##')){b=true;s=24;c="1E293B";bs=160;tx=t.replace('##','').trim();}
          else if(t.startsWith('#')){b=true;s=28;c="111827";bs=200;tx=t.replace('#','').trim();}
          return new docx.Paragraph({children:[new docx.TextRun({text:tx,bold:b,size:s,color:c,font:"Segoe UI"})],spacing:{before:bs,after:80}});
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

router.post('/api/mentor/crear-plan', async (req, res) => {
  const { estudiante_id, idea_proyecto, github_url } = req.body;
  if (!estudiante_id || !idea_proyecto) return res.status(400).json({ error: 'Falta estudiante_id o idea_proyecto' });
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1', [estudiante_id]);
    if (estRes.rows.length === 0) return res.status(404).json({ error: 'Estudiante no encontrado' });
    const est = estRes.rows[0];
    const pcStr = typeof est.perfil_cognitivo === 'object' ? JSON.stringify(est.perfil_cognitivo||{}) : (est.perfil_cognitivo||'{}');
    const sp = `Eres un Arquitecto de Software Senior. Diseña un Plan de Implementación ULTRA-DETALLADO en JSON:\n{"titulo":"...","introduccion_pedagogica":"...","plan_markdown":"...","conceptos_clave":[{"termino":"...","explicacion":"..."}]}`;
    const up = `Plan para: "${idea_proyecto}". ${github_url?`Repo: ${github_url}`:''} Nivel: ${est.nivel_actual}. Perfil: ${pcStr}`;
    const cc = await ejecutarGroqConReintentos([{role:'system',content:sp},{role:'user',content:up}],'llama-3.3-70b-versatile',{type:'json_object'});
    const data = parsearJSONGroq(cc.choices[0].message.content);
    const planUuid = crypto.randomUUID();
    const docUrl = await generarDocumentoWord(data.titulo,'PLAN DE IMPLEMENTACIÓN',data.introduccion_pedagogica,data.plan_markdown,planUuid,'plan');
    await client.query(`INSERT INTO profesor_mentor_planes (id, estudiante_id, titulo, idea_proyecto, github_url, plan_markdown, word_url, mensajes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,[planUuid,estudiante_id,data.titulo,idea_proyecto,github_url||null,data.plan_markdown,docUrl,'[]']);
    res.json({id:planUuid,estudiante_id,titulo:data.titulo,idea_proyecto,github_url,plan_markdown:data.plan_markdown,word_url:docUrl,mensajes:[]});
  } catch(e){console.error(e);res.status(500).json({error:'Error al generar plan'});}
});

router.get('/api/mentor/planes/:estudiante_id', async (req, res) => {
  try {
    const r = await client.query('SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC',[req.params.estudiante_id]);
    res.json(r.rows.map(p=>({...p,mensajes:typeof p.mensajes==='string'?JSON.parse(p.mensajes||'[]'):(p.mensajes||[])})));
  } catch(e){console.error(e);res.status(500).json({error:'Error'});}
});

router.get('/api/mentor/second-brain/:estudiante_id', async (req, res) => {
  const {estudiante_id} = req.params;
  try {
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1',[estudiante_id]);
    if(estRes.rows.length===0) return res.status(404).json({error:'No encontrado'});
    const est = estRes.rows[0];
    const planes = (await client.query('SELECT * FROM profesor_mentor_planes WHERE estudiante_id = $1 ORDER BY creado_en DESC',[estudiante_id])).rows;
    let md = `# AI SECOND BRAIN LOG\n## ${est.nombre} - ${est.nivel_actual}\n\n`;
    for(const p of planes){
      md+=`### ${p.titulo}\n- Idea: ${p.idea_proyecto}\n\n`;
      const msgs = typeof p.mensajes==='string'?JSON.parse(p.mensajes||'[]'):(p.mensajes||[]);
      for(const g of msgs.filter(m=>m.documento_ayuda)){md+=`#### ${g.documento_ayuda.titulo}\n${g.documento_ayuda.markdown}\n\n---\n\n`;}
    }
    res.setHeader('Content-Type','text/markdown');
    res.setHeader('Content-Disposition',`attachment; filename="second-brain-${est.nombre.toLowerCase().replace(/\s+/g,'-')}.md"`);
    res.send(md);
  } catch(e){console.error(e);res.status(500).json({error:'Error'});}
});

router.post('/api/mentor/chat', async (req, res) => {
  const {plan_id,mensaje,personalidad} = req.body;
  if(!plan_id||!mensaje) return res.status(400).json({error:'Falta plan_id o mensaje'});
  try {
    const planRes = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1',[plan_id]);
    if(planRes.rows.length===0) return res.status(404).json({error:'Plan no encontrado'});
    const plan = planRes.rows[0];
    const estRes = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1',[plan.estudiante_id]);
    const est = estRes.rows[0]||{};
    const pcStr = typeof est.perfil_cognitivo==='object'?JSON.stringify(est.perfil_cognitivo||{}):(est.perfil_cognitivo||'{}');
    const hist = typeof plan.mensajes==='string'?JSON.parse(plan.mensajes||'[]'):(plan.mensajes||[]);
    let dp='TONO ARQUITECTO SENIOR.';
    if(personalidad==='Socrático') dp='TONO SOCRÁTICO: Preguntas guía.';
    else if(personalidad==='Tech Lead') dp='TONO TECH LEAD CASUAL.';
    const sp=`${dp}\nMentor para: "${plan.titulo}". Plan:\n${plan.plan_markdown}\nPerfil: ${pcStr}\nJSON: {"mensaje_chat":"...","documento_ayuda_titulo":"...","documento_ayuda_markdown":"..."}`;
    const msgs=[{role:'system',content:sp},...hist.map(m=>({role:m.remitente==='estudiante'?'user':'assistant',content:m.documento_ayuda?JSON.stringify({mensaje_chat:m.texto,documento_ayuda_titulo:m.documento_ayuda.titulo,documento_ayuda_markdown:m.documento_ayuda.markdown}):m.texto})),{role:'user',content:mensaje}];
    const cc = await ejecutarGroqConReintentos(msgs,'llama-3.3-70b-versatile',{type:'json_object'});
    const data = parsearJSONGroq(cc.choices[0].message.content);
    const docUuid = crypto.randomUUID();
    const docUrl = await generarDocumentoWord(data.documento_ayuda_titulo,'GUÍA DE AYUDA',null,data.documento_ayuda_markdown,docUuid,'ayuda');
    await client.query(`INSERT INTO profesor_mentor_documentos_ayuda (id,plan_id,mensaje_estudiante,respuesta_mentor,documento_markdown,word_url) VALUES ($1,$2,$3,$4,$5,$6)`,[docUuid,plan_id,mensaje,data.mensaje_chat,data.documento_ayuda_markdown,docUrl]);
    const docObj={id:docUuid,titulo:data.documento_ayuda_titulo,word_url:docUrl,markdown:data.documento_ayuda_markdown};
    const updated=[...hist,{remitente:'estudiante',texto:mensaje,fecha:new Date().toISOString()},{remitente:'mentor',texto:data.mensaje_chat,fecha:new Date().toISOString(),documento_ayuda:docObj}];
    await client.query('UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2',[JSON.stringify(updated),plan_id]);
    actualizarPerfilCognitivo(plan.estudiante_id,mensaje,data.mensaje_chat).catch(e=>console.error(e));
    res.json({respuesta:data.mensaje_chat,mensajes:updated,documento_ayuda:docObj});
  } catch(e){console.error(e);res.status(500).json({error:'Error en chat mentor'});}
});

router.get('/api/mentor/planes/:plan_id/documentos', async (req, res) => {
  try {
    const r = await client.query('SELECT * FROM profesor_mentor_documentos_ayuda WHERE plan_id = $1 ORDER BY creado_en DESC',[req.params.plan_id]);
    res.json(r.rows);
  } catch(e){console.error(e);res.status(500).json({error:'Error'});}
});

router.post('/api/mentor/documentos/regenerar', async (req, res) => {
  const {documento_id} = req.body;
  if(!documento_id) return res.status(400).json({error:'Falta documento_id'});
  try {
    const dr = await client.query('SELECT * FROM profesor_mentor_documentos_ayuda WHERE id = $1',[documento_id]);
    if(dr.rows.length===0) return res.status(404).json({error:'No encontrado'});
    const da = dr.rows[0];
    const pr = await client.query('SELECT * FROM profesor_mentor_planes WHERE id = $1',[da.plan_id]);
    const plan = pr.rows[0];
    const sp=`Mentor para: "${plan.titulo}". Regenera guía para: "${da.mensaje_estudiante}". Previa:\n${da.documento_markdown}\nJSON: {"mensaje_chat":"...","documento_ayuda_titulo":"...","documento_ayuda_markdown":"..."}`;
    const cc = await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const data = parsearJSONGroq(cc.choices[0].message.content);
    const docUrl = await generarDocumentoWord(data.documento_ayuda_titulo,'GUÍA (REGENERADA)',null,data.documento_ayuda_markdown,documento_id,'ayuda_regen');
    await client.query(`UPDATE profesor_mentor_documentos_ayuda SET respuesta_mentor=$1, documento_markdown=$2, word_url=$3 WHERE id=$4`,[data.mensaje_chat,data.documento_ayuda_markdown,docUrl,documento_id]);
    const hist = typeof plan.mensajes==='string'?JSON.parse(plan.mensajes||'[]'):(plan.mensajes||[]);
    const upd = hist.map(m=>{
      if(m.documento_ayuda&&m.documento_ayuda.id===documento_id) return {...m,texto:data.mensaje_chat,documento_ayuda:{...m.documento_ayuda,titulo:data.documento_ayuda_titulo,word_url:docUrl,markdown:data.documento_ayuda_markdown}};
      return m;
    });
    await client.query('UPDATE profesor_mentor_planes SET mensajes = $1 WHERE id = $2',[JSON.stringify(upd),da.plan_id]);
    res.json({id:documento_id,plan_id:da.plan_id,respuesta_mentor:data.mensaje_chat,documento_markdown:data.documento_ayuda_markdown,word_url:docUrl});
  } catch(e){console.error(e);res.status(500).json({error:'Error al regenerar'});}
});

module.exports = router;
