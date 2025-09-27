// src/controllers/statsController.js
const svc = require('../services/statsService');

async function municipalityStats(req, res, next) {
  try {
    res.json(await svc.getMunicipalityStats());
  } catch (e) {
    next(e);
  }
}

async function auditLogs(req, res, next) {
  try {
    res.json(await svc.getAuditLogs({ limit: req.query.limit, offset: req.query.offset }));
  } catch (e) {
    next(e);
  }
}

module.exports = { municipalityStats, auditLogs };