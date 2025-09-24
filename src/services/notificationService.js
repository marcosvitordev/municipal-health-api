const pool = require('../database/db');

async function notify({ user_id, title, message, type='info' }) {
  await pool.query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)`,
    [user_id, title, message, type]
  );
}

async function listByUser(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 200`,
    [userId]
  );
  return rows;
}

async function markRead(id, userId) {
  await pool.query(
    `UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return true;
}

module.exports = { notify, listByUser, markRead };
