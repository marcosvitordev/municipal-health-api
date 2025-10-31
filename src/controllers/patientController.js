// patientController.js
const pat = require("../services/patientService");
async function list(req, res, n) {
  try {
    res.json(
      await pat.list(
        {
          municipality_id: req.query.municipality_id,
          document: req.query.document,
          limit: req.query.limit,
          offset: req.query.offset,
        },
        req.user
      )
    );
  } catch (e) {
    n(e);
  }
}
async function create(req, res, n) {
  try {
    res.status(201).json(await pat.create(req.body, req.user));
  } catch (e) {
    n(e);
  }
}
async function get(req, res, n) {
  try {
    const r = await pat.get(req.params.id);
    if (!r) return res.status(404).json({ error: "Não encontrado" });
    res.json(r);
  } catch (e) {
    n(e);
  }
}
async function update(req, res, n) {
  try {
    res.json({ ok: await pat.update(req.params.id, req.body, req.user) });
  } catch (e) {
    n(e);
  }
}
async function remove(req, res, n) {
  try {
    res.json({ ok: await pat.softDelete(req.params.id, req.user) });
  } catch (e) {
    n(e);
  }
}
module.exports = { list, create, get, update, remove };
