const svc = require("../services/notificationService");

async function myNotifications(req, res, next) {
  try {
    res.json(await svc.listByUser(req.user.id));
  } catch (e) {
    next(e);
  }
}
async function read(req, res, next) {
  try {
    await svc.markRead(req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
module.exports = { myNotifications, read };
