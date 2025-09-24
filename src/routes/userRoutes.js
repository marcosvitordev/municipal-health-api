const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/userController');

r.get('/', a, role(['admin']), ctl.list);
r.post('/', a, role(['admin']), ctl.create);
r.put('/:id', a, role(['admin']), ctl.update);
r.delete('/:id', a, role(['admin']), ctl.remove);

module.exports = r;
