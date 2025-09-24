const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/instituteController');

r.get('/', a, role(['admin','institute','municipality']), ctl.list);
r.post('/', a, role(['admin']), ctl.create);
r.get('/:id', a, role(['admin','institute','municipality','professional']), ctl.get);
r.put('/:id', a, role(['admin','institute']), ctl.update);
r.delete('/:id', a, role(['admin']), ctl.remove);

module.exports = r;
