const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/userController');

// ... (antes das rotas de admin)
r.get('/me', a, ctl.getMe);
r.put('/me', a, ctl.updateMe);
r.put('/me/password', a, ctl.updateMyPassword);

r.get('/', a, role(['admin']), ctl.list);
r.post('/', a, role(['admin']), ctl.create);
r.put('/:id', a, role(['admin']), ctl.update);
r.delete('/:id', a, role(['admin']), ctl.remove);

module.exports = r;
