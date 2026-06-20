const express = require('express');
const router = express.Router();
const { client, ejecutarGroqConReintentos, parsearJSONGroq, getCachedGameItem, addCachedGameItem } = require('../db.cjs');

function obtenerNivelParaReto(nivelActual) {
  const niveles = ['Novato','Principiante','Intermedio','Avanzado','Experto','Master','Arquitecto','Leyenda'];
  const idx = niveles.indexOf(nivelActual);
  if (idx===-1) return 'Novato';
  if (idx===niveles.length-1) return niveles[idx];
  return `${niveles[idx]} o ${niveles[idx+1]}`;
}

async function getEstudianteBase(estudiante_id) {
  const r = await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1',[estudiante_id]);
  if(r.rows.length===0) return null;
  const e = r.rows[0];
  return {
    estudiante: e,
    nivel: e.nivel_actual||'Novato',
    tecnologia: e.tecnologia||e.tecnologia_actual||'JavaScript',
    perfil: (typeof e.perfil_cognitivo==='string'?JSON.parse(e.perfil_cognitivo||'{}'):e.perfil_cognitivo)||{}
  };
}

router.get('/api/gamificacion/trivia', async (req,res)=>{
  const {estudiante_id}=req.query;
  if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
  try {
    const b = await getEstudianteBase(estudiante_id);
    if(!b) return res.status(404).json({error:'No encontrado'});
    const ck=`trivia:${b.tecnologia}:${b.nivel}`;
    const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const np=obtenerNivelParaReto(b.nivel);
    const sp=`Genera trivia de opción múltiple en ${b.tecnologia} para "${np}". Vacíos: ${JSON.stringify(b.perfil.vacios_de_conocimiento||[])}. En progreso: ${JSON.stringify(b.perfil.conceptos_en_progreso||[])}. EXCLUSIVAMENTE ${b.tecnologia}. JSON: {"pregunta":"...","opciones":["...","...","...","..."],"respuesta_correcta":0,"explicacion":"..."}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error trivia'});}
});

router.get('/api/gamificacion/refactor', async (req,res)=>{
  const {estudiante_id}=req.query;
  if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
  try {
    const b=await getEstudianteBase(estudiante_id);
    if(!b) return res.status(404).json({error:'No encontrado'});
    const ck=`refactor:${b.tecnologia}:${b.nivel}`;
    const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const np=obtenerNivelParaReto(b.nivel);
    const sp=`Genera reto de depuración (Bug Hunter) en ${b.tecnologia} para "${np}". Errores frecuentes: ${JSON.stringify(b.perfil.errores_frecuentes||[])}. EXCLUSIVAMENTE ${b.tecnologia}. JSON: {"descripcion":"...","codigo_con_bug":"...","opciones":["...","...","..."],"opcion_correcta":1,"explicacion":"..."}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error refactor'});}
});

router.get('/api/gamificacion/sorter', async (req,res)=>{
  const {estudiante_id}=req.query;
  if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
  try {
    const b=await getEstudianteBase(estudiante_id);
    if(!b) return res.status(404).json({error:'No encontrado'});
    const ck=`sorter:${b.tecnologia}:${b.nivel}`;
    const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const np=obtenerNivelParaReto(b.nivel);
    const sp=`Genera Parson's Puzzle en ${b.tecnologia} para "${np}". 5-8 líneas. EXCLUSIVAMENTE ${b.tecnologia}. JSON: {"descripcion":"...","lineas_ordenadas":["..."],"explicacion":"..."}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error sorter'});}
});

router.post('/api/gamificacion/completar', async (req,res)=>{
  const {estudiante_id,tipo_reto}=req.body;
  if(!estudiante_id||!tipo_reto) return res.status(400).json({error:'Faltan parámetros'});
  try {
    const r=await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1',[estudiante_id]);
    if(r.rows.length===0) return res.status(404).json({error:'No encontrado'});
    const est=r.rows[0];
    const perfil=(typeof est.perfil_cognitivo==='string'?JSON.parse(est.perfil_cognitivo||'{}'):est.perfil_cognitivo)||{};
    let xp=20; if(tipo_reto==='refactor') xp=50; if(tipo_reto==='sorter') xp=35;
    const xpAct=(perfil.xp||0)+xp; perfil.xp=xpAct;
    let nrpg=1; if(xpAct>900) nrpg=5; else if(xpAct>500) nrpg=4; else if(xpAct>251) nrpg=3; else if(xpAct>100) nrpg=2;
    perfil.nivel_rpg=nrpg;
    await client.query('UPDATE profesor_estudiantes SET perfil_cognitivo = $1 WHERE id = $2',[JSON.stringify(perfil),estudiante_id]);
    res.json({success:true,xp_ganada:xp,xp_total:xpAct,nivel_rpg:nrpg});
  } catch(e){console.error(e);res.status(500).json({error:'Error completar'});}
});

router.get('/api/gamificacion/fill-blank', async (req,res)=>{
  const {estudiante_id}=req.query;
  if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
  try {
    const b=await getEstudianteBase(estudiante_id);
    if(!b) return res.status(404).json({error:'No encontrado'});
    const ck=`fill-blank:${b.tecnologia}:${b.nivel}`;
    const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const np=obtenerNivelParaReto(b.nivel);
    const sp=`Genera reto Fill-in-the-Blank en ${b.tecnologia} para "${np}". 6-10 líneas, 2-4 huecos. En progreso: ${JSON.stringify(b.perfil.conceptos_en_progreso||[])}. JSON: {"descripcion":"...","codigo_con_huecos":"...","respuestas":{"1":"...","2":"..."},"explicacion":"..."}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error fill-blank'});}
});

router.get('/api/gamificacion/output', async (req,res)=>{
  const {estudiante_id}=req.query;
  if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
  try {
    const b=await getEstudianteBase(estudiante_id);
    if(!b) return res.status(404).json({error:'No encontrado'});
    const ck=`output:${b.tecnologia}:${b.nivel}`;
    const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const np=obtenerNivelParaReto(b.nivel);
    const sp=`Genera Output Predictor en ${b.tecnologia} para "${np}". Vacíos: ${JSON.stringify(b.perfil.vacios_de_conocimiento||[])}. JSON: {"codigo":"...","opciones":["...","...","...","..."],"respuesta_correcta":2,"explicacion":"..."}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error output'});}
});

router.get('/api/gamificacion/flashcard', async (req,res)=>{
  const {estudiante_id}=req.query;
  if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
  try {
    const b=await getEstudianteBase(estudiante_id);
    if(!b) return res.status(404).json({error:'No encontrado'});
    const ck=`flashcard:${b.tecnologia}:${b.nivel}`;
    const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const np=obtenerNivelParaReto(b.nivel);
    const sp=`Genera 5 flashcards V/F en ${b.tecnologia} para "${np}". Dominados: ${JSON.stringify(b.perfil.conceptos_dominados||[])}. En progreso: ${JSON.stringify(b.perfil.conceptos_en_progreso||[])}. JSON: {"flashcards":[{"afirmacion":"...","es_verdadero":true,"explicacion":"..."}]}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error flashcard'});}
});

router.get('/api/gamificacion/typer', async (req,res)=>{
  try {
    const {estudiante_id}=req.query;
    const r=await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1',[estudiante_id]);
    if(r.rows.length===0) return res.status(404).json({error:'No encontrado'});
    const e=r.rows[0]; const nivel=e.nivel_actual||'Novato'; const tec=e.tecnologia_actual||'JavaScript';
    const ck=`typer:${tec}:${nivel}`; const ci=getCachedGameItem(ck); if(ci) return res.json(ci);
    const sp=`Genera línea de código (max 80 chars) en ${tec} para "${obtenerNivelParaReto(nivel)}". JSON: {"codigo":"...","descripcion":"..."}`;
    const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
    const d=parsearJSONGroq(cc.choices[0].message.content);
    addCachedGameItem(ck,d); res.json(d);
  } catch(e){console.error(e);res.status(500).json({error:'Error typer'});}
});

router.get('/api/gamificacion/memory', async (req,res)=>{
  try {
    const {estudiante_id}=req.query;
    const r=await client.query('SELECT * FROM profesor_estudiantes WHERE id = $1',[estudiante_id]);
    if(r.rows.length===0) return res.status(404).json({error:'No encontrado'});
    const e=r.rows[0]; const nivel=e.nivel_actual||'Novato'; const tec=e.tecnologia_actual||'JavaScript';
    const ck=`memory:${tec}:${nivel}`; let rawData=getCachedGameItem(ck);
    if(!rawData){
      const sp=`Genera 4 parejas concepto-definición en ${tec} para "${obtenerNivelParaReto(nivel)}". JSON: {"parejas":[{"matchingId":1,"concepto":"...","definicion":"..."}]}`;
      const cc=await ejecutarGroqConReintentos([{role:'system',content:sp}],'llama-3.3-70b-versatile',{type:'json_object'});
      rawData=parsearJSONGroq(cc.choices[0].message.content);
      addCachedGameItem(ck,rawData);
    }
    const cartas=[];
    rawData.parejas.forEach(p=>{
      cartas.push({id:`c_${p.matchingId}_c`,texto:p.concepto,matchingId:p.matchingId,tipo:'concepto'});
      cartas.push({id:`c_${p.matchingId}_d`,texto:p.definicion,matchingId:p.matchingId,tipo:'definicion'});
    });
    for(let i=cartas.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cartas[i],cartas[j]]=[cartas[j],cartas[i]];}
    res.json({cartas});
  } catch(e){console.error(e);res.status(500).json({error:'Error memory'});}
});

module.exports = router;
