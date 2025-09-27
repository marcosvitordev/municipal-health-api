// src/routes/settingsRoutes.js
const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/settingsController');

// Apenas administradores podem gerenciar configurações do sistema
r.get('/settings', a, role(['admin','municipality','institute','professional']), ctl.getSettings);
r.put('/settings', a, role(['admin','municipality','institute','professional']), ctl.updateAllSettings);
r.get('/settings/admin', a, role(['admin','municipality','institute','professional']), ctl.getSettings);
r.put('/settings/admin', a, role(['admin','municipality','institute','professional']), ctl.updateAllSettings);

module.exports = r;