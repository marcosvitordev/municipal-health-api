// professionalController.js
const prof = require('../services/professionalService');
async function list(req,res,n){try{res.json(await prof.list({institute_id:req.query.institute_id, specialty:req.query.specialty, limit:req.query.limit, offset:req.query.offset}));}catch(e){n(e)}}
async function create(req,res,n){try{res.status(201).json(await prof.create(req.body, req.user));}catch(e){n(e)}}
async function get(req,res,n){try{const r=await prof.get(req.params.id); if(!r)return res.status(404).json({error:'Não encontrado'}); res.json(r);}catch(e){n(e)}}
async function update(req,res,n){try{res.json({ok:await prof.update(req.params.id, req.body, req.user)});}catch(e){n(e)}}
async function remove(req,res,n){try{res.json({ok:await prof.softDelete(req.params.id, req.user)});}catch(e){n(e)}}
module.exports = { list, create, get, update, remove };