// src/services/statsService.js
const pool = require('../database/db');

// Esta função utiliza a VIEW que já existe no seu banco de dados
async function getMunicipalityStats() {
  const [rows] = await pool.query(`SELECT * FROM view_municipality_stats ORDER BY total_requests DESC`);
  return rows;
}

// O serviço de auditoria para listar os logs
async function getAuditLogs({ limit = 50, offset = 0 }) {
  const [rows] = await pool.query(
    `SELECT id, user_id, action, table_name, record_id,ip_address, created_at
     FROM audit_logs
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    

    [Number(limit), Number(offset)]
  );
  return rows;
}

module.exports = { getMunicipalityStats, getAuditLogs };