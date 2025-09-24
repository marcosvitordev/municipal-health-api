const r = require('express').Router();
const { register, login } = require('../controllers/authController');

r.post('/register', register);   // opcional: restringir em produção
r.post('/login', login);

module.exports = r;
