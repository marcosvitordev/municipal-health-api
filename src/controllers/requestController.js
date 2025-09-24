const reqSvc = require('../services/requestService');

async function create(req,res,n){try{res.status(201).json(await reqSvc.createRequest(req.body, req.user));}catch(e){n(e)}}
async function list(req,res,n){try{res.json(await reqSvc.list({status:req.query.status, request_number:req.query.request_number}, req.user));}catch(e){n(e)}}
async function get(req,res,n){try{const r=await reqSvc.get(req.params.id); if(!r)return res.status(404).json({error:'Não encontrado'}); res.json(r);}catch(e){n(e)}}
async function assign(req,res,n){try{await reqSvc.assignProfessional(req.params.id, req.body.professional_id, req.user); res.json({ok:true});}catch(e){n(e)}}
async function schedule(req,res,n){try{await reqSvc.schedule(req.params.id, req.body.scheduled_date, req.user); res.json({ok:true});}catch(e){n(e)}}
async function status(req,res,n){try{await reqSvc.updateStatus(req.params.id, req.body.status, req.body.reason, req.user); res.json({ok:true});}catch(e){n(e)}}

module.exports = { create, list, get, assign, schedule, status };
