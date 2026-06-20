const express = require('express');
const router = express.Router();
const { client } = require('../db.cjs');

const recompensaXpDict = {
  'primer_juego':15,'retos_3':20,'retos_5':25,'retos_10':30,
  'racha_flashcard':25,'racha_flashcard_5':35,'racha_flashcard_8':45,'racha_flashcard_10':60,
  'precis_typer':30,'typer_veloz':35,'typer_supersound':50,'typer_dios':60,
  'trivias_correct':25,'trivias_3':30,'trivias_5':40,'trivias_10':60,
  'memory_perfecto':30,'memory_rapido':35,'memory_dios':50,
  'xp_10':10,'xp_25':15,'xp_50':20,'xp_100':45,'xp_200':55,'xp_300':65,'xp_500':80,'xp_1000':150,
  'primer_mentor':20,'chat_mentor_5':25,'chat_mentor_10':35,'chat_mentor_20':50,
  'calif_100':50,'calif_95':40,'calif_90':30,'entrega_1':20,'entrega_3':30,'entrega_5':45,
  'cambio_ruta':15,'cambio_ruta_3':30,'cambio_ruta_5':45,
  'rpg_2':20,'rpg_3':30,'rpg_4':40,'rpg_5':50,'rpg_6':60,'rpg_7':80,'rpg_8':150,
  'click_perfil':10,'click_logros':10,'click_temario':10
};

router.get('/api/logros', async (req,res)=>{
  try {
    const {estudiante_id}=req.query;
    if(!estudiante_id) return res.status(400).json({error:'Falta estudiante_id'});
    const r=await client.query('SELECT logro_id, desbloqueado_at FROM profesor_logros WHERE estudiante_id = $1',[estudiante_id]);
    res.json({logros:r.rows});
  } catch(e){console.error(e);res.status(500).json({error:'Error logros'});}
});

router.post('/api/logros/desbloquear', async (req,res)=>{
  try {
    const {estudiante_id,logro_id}=req.body;
    if(!estudiante_id||!logro_id) return res.status(400).json({error:'Faltan parámetros'});
    const xp=recompensaXpDict[logro_id]||10;
    const fecha=new Date().toISOString();
    const ex=await client.query('SELECT id FROM profesor_logros WHERE estudiante_id = $1 AND logro_id = $2',[estudiante_id,logro_id]);
    if(ex.rows.length>0) return res.json({success:false,message:'Ya desbloqueado'});
    await client.query('INSERT INTO profesor_logros (estudiante_id, logro_id, desbloqueado_at) VALUES ($1, $2, $3)',[estudiante_id,logro_id,fecha]);
    await client.query('UPDATE profesor_estudiantes SET xp = xp + $1 WHERE id = $2',[xp,estudiante_id]);
    res.json({success:true,xpGanada:xp,logro_id});
  } catch(e){console.error(e);res.status(500).json({error:'Error desbloquear'});}
});

router.post('/api/logros/desbloquear-batch', async (req,res)=>{
  try {
    const {estudiante_id,logros_ids}=req.body;
    if(!estudiante_id||!Array.isArray(logros_ids)||logros_ids.length===0) return res.status(400).json({error:'Faltan parámetros'});
    const ex=await client.query('SELECT logro_id FROM profesor_logros WHERE estudiante_id = $1 AND logro_id = ANY($2)',[estudiante_id,logros_ids]);
    const ya=new Set(ex.rows.map(r=>r.logro_id));
    const nuevos=logros_ids.filter(l=>!ya.has(l));
    if(nuevos.length===0) return res.json({success:true,xpGanada:0,mensaje:'Todos ya desbloqueados'});
    const fecha=new Date().toISOString();
    let totalXp=0;
    for(const lid of nuevos){
      const xp=recompensaXpDict[lid]||10; totalXp+=xp;
      await client.query('INSERT INTO profesor_logros (estudiante_id, logro_id, desbloqueado_at) VALUES ($1, $2, $3)',[estudiante_id,lid,fecha]);
    }
    await client.query('UPDATE profesor_estudiantes SET xp = xp + $1 WHERE id = $2',[totalXp,estudiante_id]);
    res.json({success:true,xpGanada:totalXp,nuevosDesbloqueados:nuevos});
  } catch(e){console.error(e);res.status(500).json({error:'Error batch'});}
});

module.exports = router;
