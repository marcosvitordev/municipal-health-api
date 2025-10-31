const r = require("express").Router();
const a = require("../middlewares/authMiddleware");
const role = require("../middlewares/rbacMiddleware");
const ctl = require("../controllers/patientController");

r.get(
  "/",
  a,
  role(["admin", "municipality", "institute", "professional"]),
  ctl.list
);
r.post("/", a, role(["admin", "municipality"]), ctl.create);
r.get(
  "/:id",
  a,
  role(["admin", "municipality", "institute", "professional"]),
  ctl.get
);
r.put("/:id", a, role(["admin", "municipality"]), ctl.update);
r.delete("/:id", a, role(["admin", "municipality"]), ctl.remove);

module.exports = r;
