// src/controllers/settingsController.js
const settingsService = require("../services/settingsService");

async function getSettings(req, res, next) {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (e) {
    next(e);
  }
}

async function updateAllSettings(req, res, next) {
  try {
    const success = await settingsService.updateSettings(req.body, req.user);
    res.json({ ok: success });
  } catch (e) {
    next(e);
  }
}

module.exports = { getSettings, updateAllSettings };
