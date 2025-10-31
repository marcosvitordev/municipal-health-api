// src/services/settingsService.js
const pool = require("../database/db");
const { logAction } = require("./auditService");

/**
 * Busca todas as configurações do sistema e as retorna como um objeto.
 */
async function getAllSettings() {
  const [rows] = await pool.query(
    `SELECT setting_key, setting_value FROM system_settings`
  );
  const settings = {};
  for (const row of rows) {
    // Tenta fazer o parse se for um JSON/boolean/number válido
    try {
      settings[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      settings[row.setting_key] = row.setting_value;
    }
  }
  return settings;
}

/**
 * Atualiza um conjunto de configurações no banco de dados.
 */
async function updateSettings(settingsData, user) {
  const before = await getAllSettings();

  const promises = [];
  for (const key in settingsData) {
    const value = settingsData[key];
    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    const sql = `
      INSERT INTO system_settings (setting_key, setting_value) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE setting_value = ?
    `;
    promises.push(pool.query(sql, [key, stringValue, stringValue]));
  }

  await Promise.all(promises);

  await logAction({
    userId: user?.id,
    action: "UPDATE",
    tableName: "system_settings",
    oldValues: before,
    newValues: settingsData,
  });

  return true;
}

module.exports = { getAllSettings, updateSettings };
