const svc = require("../services/municipalityService");
async function list(req, res, n) {
  try {
    res.json(
      await svc.list({ limit: req.query.limit, offset: req.query.offset })
    );
  } catch (e) {
    n(e);
  }
}
async function create(req, res, n) {
  try {
    res.status(201).json(await svc.create(req.body, req.user));
  } catch (e) {
    n(e);
  }
}
async function get(req, res, n) {
  try {
    const r = await svc.get(req.params.id);
    if (!r) return res.status(404).json({ error: "Não encontrado" });
    res.json(r);
  } catch (e) {
    n(e);
  }
}
async function update(req, res, n) {
  try {
    res.json({ ok: await svc.update(req.params.id, req.body, req.user) });
  } catch (e) {
    n(e);
  }
}
async function remove(req, res, n) {
  try {
    res.json({ ok: await svc.softDelete(req.params.id, req.user) });
  } catch (e) {
    n(e);
  }
}
module.exports = { list, create, get, update, remove };
