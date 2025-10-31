// const pool = require('../database/db');
// const bcrypt = require('bcrypt');
// const { logAction } = require('./auditService');
// const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '12', 10);

// async function list({ role, status, limit = 100, offset = 0 }) {
//   const where = [];
//   const params = [];
//   if (role) { where.push('role = ?'); params.push(role); }
//   if (status) { where.push('status = ?'); params.push(status); }
//   const sql = `SELECT id, name, email, role, municipality_id, institute_id, status, phone, document, created_at FROM users ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
//   params.push(Number(limit), Number(offset));
//   const [rows] = await pool.query(sql, params);
//   return rows;
// }

// async function create(data, currentUser, ip, ua) {
//   const { name, email, password, role, municipality_id = null, institute_id = null, phone = null, document = null } = data;
//   const [[x]] = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
//   if (x) throw Object.assign(new Error('Email já cadastrado'), { status: 400 });
//   const hash = await bcrypt.hash(password, SALT_ROUNDS);
//   const [res] = await pool.query(
//     `INSERT INTO users (name, email, password, role, municipality_id, institute_id, phone, document, status)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
//     [name, email, hash, role, municipality_id, institute_id, phone, document]
//   );
//   await logAction({ userId: currentUser?.id, action: 'CREATE', tableName: 'users', recordId: res.insertId, newValues: data, ip, userAgent: ua });
//   return { id: res.insertId };
// }

// async function update(id, data, currentUser, ip, ua) {
//   const fields = [], params = [];
//   const up = ['name', 'email', 'role', 'municipality_id', 'institute_id', 'status', 'phone', 'document'];
//   for (const k of up) if (data[k] !== undefined) { fields.push(`${k}=?`); params.push(data[k]); }
//   if (data.password) { fields.push('password=?'); params.push(await bcrypt.hash(data.password, SALT_ROUNDS)); }
//   if (!fields.length) return false;
//   const [[before]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
//   params.push(id);
//   const [res] = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
//   await logAction({ userId: currentUser?.id, action: 'UPDATE', tableName: 'users', recordId: id, oldValues: before, newValues: data, ip, userAgent: ua });
//   return !!res.affectedRows;
// }

// async function softDelete(id, currentUser, ip, ua) {
//   const [[before]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
//   const [res] = await pool.query(`UPDATE users SET status='inactive' WHERE id = ?`, [id]);
//   await logAction({ userId: currentUser?.id, action: 'DELETE', tableName: 'users', recordId: id, oldValues: before, newValues: { status: 'inactive' }, ip, userAgent: ua });
//   return !!res.affectedRows;
// }
// async function getById(id) {
//   const [[user]] = await pool.query(`SELECT id, name, email, role, phone, document FROM users WHERE id = ?`, [id]);
//   return user;
// }

// async function changePassword(userId, currentPassword, newPassword, currentUser) {
//   const [[user]] = await pool.query(`SELECT password FROM users WHERE id = ?`, [userId]);
//   if (!user) throw Object.assign(new Error('Usuário não encontrado'), { status: 404 });

//   const ok = await bcrypt.compare(currentPassword, user.password);
//   if (!ok) throw Object.assign(new Error('Senha atual inválida'), { status: 401 });

//   const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
//   await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [hash, userId]);

//   await logAction({ userId: currentUser?.id, action: 'UPDATE', tableName: 'users', recordId: userId, newValues: { passwordChanged: true } });

//   return true;
// }

// module.exports = { list, create, update, softDelete, getById, changePassword };

// src/services/userService.js

const pool = require("../database/db");
const bcrypt = require("bcrypt");
const { logAction } = require("./auditService");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

async function list({ role, status, limit = 100, offset = 0 }) {
  const where = [];
  const params = [];
  if (role) {
    where.push("role = ?");
    params.push(role);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  const sql = `SELECT id, name, email, role, municipality_id, institute_id, status, phone, document, created_at FROM users ${
    where.length ? "WHERE " + where.join(" AND ") : ""
  } ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function create(data, currentUser, ip, ua) {
  const {
    name,
    email,
    password,
    role,
    municipality_id = null,
    institute_id = null,
    phone = null,
    document = null,
  } = data;
  const [[x]] = await pool.query(`SELECT id FROM users WHERE email = ?`, [
    email,
  ]);
  if (x) throw Object.assign(new Error("Email já cadastrado"), { status: 400 });
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const [res] = await pool.query(
    `INSERT INTO users (name, email, password, role, municipality_id, institute_id, phone, document, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [name, email, hash, role, municipality_id, institute_id, phone, document]
  );
  await logAction({
    userId: currentUser?.id,
    action: "CREATE",
    tableName: "users",
    recordId: res.insertId,
    newValues: data,
    ip,
    userAgent: ua,
  });
  return { id: res.insertId };
}

async function update(id, data, currentUser, ip, ua) {
  const fields = [],
    params = [];
  const up = [
    "name",
    "email",
    "role",
    "municipality_id",
    "institute_id",
    "status",
    "phone",
    "document",
  ];
  for (const k of up)
    if (data[k] !== undefined) {
      fields.push(`${k}=?`);
      params.push(data[k]);
    }
  if (data.password) {
    fields.push("password=?");
    params.push(await bcrypt.hash(data.password, SALT_ROUNDS));
  }
  if (!fields.length) return false;
  const [[before]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  params.push(id);
  const [res] = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  await logAction({
    userId: currentUser?.id,
    action: "UPDATE",
    tableName: "users",
    recordId: id,
    oldValues: before,
    newValues: data,
    ip,
    userAgent: ua,
  });
  return !!res.affectedRows;
}

async function softDelete(id, currentUser, ip, ua) {
  const [[before]] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  const [res] = await pool.query(
    `UPDATE users SET status='inactive' WHERE id = ?`,
    [id]
  );
  await logAction({
    userId: currentUser?.id,
    action: "DELETE",
    tableName: "users",
    recordId: id,
    oldValues: before,
    newValues: { status: "inactive" },
    ip,
    userAgent: ua,
  });
  return !!res.affectedRows;
}

async function getById(id) {
  // =========================================================================
  // === ESTA É A CORREÇÃO PRINCIPAL ===
  // A consulta SQL agora seleciona 'municipality_id' e 'institute_id'
  // =========================================================================
  const [[user]] = await pool.query(
    `SELECT id, name, email, role, phone, document, municipality_id, institute_id FROM users WHERE id = ?`,
    [id]
  );
  return user;
}

async function changePassword(
  userId,
  currentPassword,
  newPassword,
  currentUser
) {
  const [[user]] = await pool.query(`SELECT password FROM users WHERE id = ?`, [
    userId,
  ]);
  if (!user)
    throw Object.assign(new Error("Usuário não encontrado"), { status: 404 });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok)
    throw Object.assign(new Error("Senha atual inválida"), { status: 401 });

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query(`UPDATE users SET password = ? WHERE id = ?`, [
    hash,
    userId,
  ]);

  await logAction({
    userId: currentUser?.id,
    action: "UPDATE",
    tableName: "users",
    recordId: userId,
    newValues: { passwordChanged: true },
  });

  return true;
}

module.exports = { list, create, update, softDelete, getById, changePassword };
