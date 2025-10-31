const r = require("express").Router();
const a = require("../middlewares/authMiddleware");
const role = require("../middlewares/rbacMiddleware");
const ctl = require("../controllers/municipalityController");

r.get("/", a, role(["admin", "municipality", "institute"]), ctl.list);
r.post("/", a, role(["admin"]), ctl.create);
r.get("/:id", a, role(["admin", "municipality", "institute"]), ctl.get);
r.put("/:id", a, role(["admin"]), ctl.update);
r.delete("/:id", a, role(["admin"]), ctl.remove);

module.exports = r;
