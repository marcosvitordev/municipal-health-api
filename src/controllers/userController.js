const users = require('../services/userService');

async function list(req,res,next){ try{ const r=await users.list({ role:req.query.role, status:req.query.status, limit:req.query.limit, offset:req.query.offset }); res.json(r);}catch(e){next(e);} }
async function create(req,res,next){ try{ const r=await users.create(req.body, req.user, req.ip, req.get('User-Agent')); res.status(201).json(r);}catch(e){next(e);} }
async function update(req,res,next){ try{ const ok=await users.update(req.params.id, req.body, req.user, req.ip, req.get('User-Agent')); res.json({ok}); }catch(e){next(e);} }
async function remove(req,res,next){ try{ const ok=await users.softDelete(req.params.id, req.user, req.ip, req.get('User-Agent')); res.json({ok}); }catch(e){next(e);} }

module.exports = { list, create, update, remove };
