const pool = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { logAction } = require("./auditService");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

async function register(
  { name, email, password, role, municipality_id = null, institute_id = null },
  ip,
  ua
) {
  const [[exists]] = await pool.query(`SELECT id FROM users WHERE email = ?`, [
    email,
  ]);
  if (exists)
    throw Object.assign(new Error("Email já cadastrado"), { status: 400 });
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const [res] = await pool.query(
    `INSERT INTO users (name, email, password, role, municipality_id, institute_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [name, email, hash, role, municipality_id, institute_id]
  );
  await logAction({
    userId: res.insertId,
    action: "REGISTER",
    tableName: "users",
    recordId: res.insertId,
    newValues: { name, email, role },
    ip,
    userAgent: ua,
  });
  return { id: res.insertId, name, email, role, municipality_id, institute_id };
}

async function login({ email, password }, ip, ua) {
  const [[user]] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  if (!user)
    throw Object.assign(new Error("Usuário não encontrado"), { status: 404 });
  if (user.status !== "active")
    throw Object.assign(new Error("Usuário inativo/suspenso"), { status: 403 });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw Object.assign(new Error("Senha inválida"), { status: 401 });

  const payload = {
    id: user.id,
    role: user.role,
    municipality_id: user.municipality_id,
    institute_id: user.institute_id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "devsecret", {
    expiresIn: process.env.JWT_EXP || "8h",
  });

  await logAction({
    userId: user.id,
    action: "LOGIN",
    tableName: "users",
    recordId: user.id,
    ip,
    userAgent: ua,
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      municipality_id: user.municipality_id,
      institute_id: user.institute_id,
    },
  };
}

module.exports = { register, login };
