const pool = require('../database/db');

async function logAction({ userId, action, tableName, recordId, oldValues=null, newValues=null, ip=null, userAgent=null }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, action, tableName, recordId || null, JSON.stringify(oldValues), JSON.stringify(newValues), ip, userAgent]
    );
  } catch (e) {
    console.error('Audit log failed', e);
  }
}
module.exports = { logAction };
