const auth = require("../services/authService");

async function register(req, res, next) {
  try {
    const u = await auth.register(req.body, req.ip, req.get("User-Agent"));
    res.status(201).json(u);
  } catch (e) {
    next(e);
  }
}
async function login(req, res, next) {
  try {
    const data = await auth.login(req.body, req.ip, req.get("User-Agent"));
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
