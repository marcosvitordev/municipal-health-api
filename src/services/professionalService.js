const pool = require("../database/db");
const { logAction } = require("./auditService");

async function list({ institute_id, specialty, limit = 200, offset = 0 }) {
  const where = [],
    params = [];
  if (institute_id) {
    where.push("institute_id=?");
    params.push(institute_id);
  }
  if (specialty) {
    where.push("specialty=?");
    params.push(specialty);
  }
  const [rows] = await pool.query(
    `SELECT * FROM professionals ${
      where.length ? "WHERE " + where.join(" AND ") : ""
    } ORDER BY name LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}
async function create(data, user) {
  const {
    user_id = null,
    institute_id = null,
    name,
    specialty,
    registration_number,
    registration_council,
    phone = null,
    email = null,
    document = null,
    birth_date = null,
    address = null,
    status = "active",
  } = data;
  const [res] = await pool.query(
    `INSERT INTO professionals (user_id, institute_id, name, specialty, registration_number, registration_council, phone, email, document, birth_date, address, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      institute_id,
      name,
      specialty,
      registration_number,
      registration_council,
      phone,
      email,
      document,
      birth_date,
      address,
      status,
    ]
  );
  await logAction({
    userId: user?.id,
    action: "CREATE",
    tableName: "professionals",
    recordId: res.insertId,
    newValues: data,
  });
  return { id: res.insertId };
}
async function get(id) {
  const [[row]] = await pool.query(`SELECT * FROM professionals WHERE id=?`, [
    id,
  ]);
  return row;
}
async function update(id, data, user) {
  const fields = [],
    params = [];
  for (const k of [
    "user_id",
    "institute_id",
    "name",
    "specialty",
    "registration_number",
    "registration_council",
    "phone",
    "email",
    "document",
    "birth_date",
    "address",
    "status",
  ])
    if (data[k] !== undefined) {
      fields.push(`${k}=?`);
      params.push(data[k]);
    }
  if (!fields.length) return false;
  const before = await get(id);
  params.push(id);
  const [r] = await pool.query(
    `UPDATE professionals SET ${fields.join(", ")} WHERE id=?`,
    params
  );
  await logAction({
    userId: user?.id,
    action: "UPDATE",
    tableName: "professionals",
    recordId: id,
    oldValues: before,
    newValues: data,
  });
  return !!r.affectedRows;
}
async function softDelete(id, user) {
  const before = await get(id);
  const [r] = await pool.query(
    `UPDATE professionals SET status='inactive' WHERE id=?`,
    [id]
  );
  await logAction({
    userId: user?.id,
    action: "DELETE",
    tableName: "professionals",
    recordId: id,
    oldValues: before,
    newValues: { status: "inactive" },
  });
  return !!r.affectedRows;
}

module.exports = { list, create, get, update, softDelete };
