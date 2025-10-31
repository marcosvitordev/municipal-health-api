const r = require("express").Router();
const a = require("../middlewares/authMiddleware");
const ctl = require("../controllers/notificationController");

r.get("/me", a, ctl.myNotifications);
r.post("/:id/read", a, ctl.read);

module.exports = r;
