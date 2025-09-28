const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/documentController');

r.post('/', a, role(['admin','municipality','institute','professional']), ctl.uploadMiddleware, ctl.uploadDoc);
r.get('/:id/url', a, role(['admin','municipality','institute','professional']), ctl.getUrl);

module.exports = r;