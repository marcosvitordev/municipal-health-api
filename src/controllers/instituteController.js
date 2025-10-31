// // instituteController.js
// const inst = require('../services/instituteService');
// async function list(req, res, n) { try { res.json(await inst.list({ limit: req.query.limit, offset: req.query.offset })); } catch (e) { n(e) } }
// async function create(req, res, n) { try { res.status(201).json(await inst.create(req.body, req.user)); } catch (e) { n(e) } }
// async function get(req, res, n) { try { const r = await inst.get(req.params.id); if (!r) return res.status(404).json({ error: 'Não encontrado' }); res.json(r); } catch (e) { n(e) } }
// async function update(req, res, n) { try { res.json({ ok: await inst.update(req.params.id, req.body, req.user) }); } catch (e) { n(e) } }
// async function remove(req, res, n) { try { res.json({ ok: await inst.softDelete(req.params.id, req.user) }); } catch (e) { n(e) } }

// module.exports = { list, create, get, update, remove };

const inst = require("../services/instituteService");

async function list(req, res, n) {
  try {
    res.json(
      await inst.list({ limit: req.query.limit, offset: req.query.offset })
    );
  } catch (e) {
    n(e);
  }
}
async function create(req, res, n) {
  try {
    res.status(201).json(await inst.create(req.body, req.user));
  } catch (e) {
    n(e);
  }
}
async function get(req, res, n) {
  try {
    const r = await inst.get(req.params.id);
    if (!r) return res.status(404).json({ error: "Não encontrado" });
    res.json(r);
  } catch (e) {
    n(e);
  }
}

// ========= GARANTA QUE ESTAS FUNÇÕES ESTEJAM ASSIM =========
async function update(req, res, n) {
  try {
    const success = await inst.update(req.params.id, req.body, req.user);
    res.json({ ok: success });
  } catch (e) {
    n(e);
  }
}

async function remove(req, res, n) {
  try {
    const success = await inst.softDelete(req.params.id, req.user);
    res.json({ ok: success });
  } catch (e) {
    n(e);
  }
}
// =========================================================

module.exports = { list, create, get, update, remove };
