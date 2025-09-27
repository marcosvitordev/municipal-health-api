const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/requestController');

// município cria
r.post('/', a, role(['admin','municipality']), ctl.create);
// listagens por escopo
r.get('/', a, role(['admin','municipality','institute','professional']), ctl.list);
r.get('/:id', a, role(['admin','municipality','institute','professional']), ctl.get);
r.get('/:id/documents', a, role(['admin', 'municipality', 'institute', 'professional']), ctl.getDocuments); // Added route
// instituto atribui e agenda
r.post('/:id/assign', a, role(['admin','institute']), ctl.assign);
r.post('/:id/schedule', a, role(['admin','institute']), ctl.schedule);
// mudança de status (profissional pode in_progress/completed)
r.post('/:id/status', a, role(['admin','municipality','institute','professional']), ctl.status);

module.exports = r;