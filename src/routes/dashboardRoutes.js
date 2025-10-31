// src/routes/dashboardRoutes.js
const r = require("express").Router();
const a = require("../middlewares/authMiddleware");
const role = require("../middlewares/rbacMiddleware");
const ctl = require("../controllers/dashboardController");

// Rota específica para o dashboard do município
r.get(
  "/dashboard/municipality",
  a,
  role(["municipality"]),
  ctl.getMunicipalityDashboard
);

module.exports = r;
