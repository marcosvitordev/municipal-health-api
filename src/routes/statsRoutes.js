// src/routes/statsRoutes.js
const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/statsController');

// Rota para estatísticas dos municípios
// r.get('/stats/municipalities', a, role(['admin']), ctl.municipalityStats);
// Em src/routes/statsRoutes.js
r.get('/stats/municipalities', a, role(['admin','institute']), ctl.municipalityStats);

// Rota para logs de auditoria
r.get('/audit-logs', a, role(['admin']), ctl.auditLogs);


module.exports = r;