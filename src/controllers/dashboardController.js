// src/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');

async function getMunicipalityDashboard(req, res, next) {
  try {
    // O ID do município vem do token do usuário logado
    const data = await dashboardService.getMunicipalityDashboardData(req.user.municipality_id);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

module.exports = { getMunicipalityDashboard };