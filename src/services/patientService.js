const pool = require("../database/db");
const { logAction } = require("./auditService");

async function list(
  { municipality_id, document, limit = 200, offset = 0 },
  user
) {
  const where = [],
    params = [];
  if (user.role === "municipality" && user.municipality_id) {
    where.push("municipality_id=?");
    params.push(user.municipality_id);
  } else if (municipality_id) {
    where.push("municipality_id=?");
    params.push(municipality_id);
  }
  if (document) {
    where.push("document=?");
    params.push(document);
  }
  const [rows] = await pool.query(
    `SELECT * FROM patients ${
      where.length ? "WHERE " + where.join(" AND ") : ""
    } ORDER BY name LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}

async function create(data, user) {
  const {
    municipality_id,
    name,
    document,
    birth_date,
    gender,
    phone = null,
    email = null,
    address = null,
    emergency_contact = null,
    emergency_phone = null,
    blood_type = null,
    allergies = null,
    medical_history = null,
    sus_card = null,
    status = "active",
  } = data;
  const [res] = await pool.query(
    `INSERT INTO patients (municipality_id, name, document, birth_date, gender, phone, email, address, emergency_contact, emergency_phone, blood_type, allergies, medical_history, sus_card, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      municipality_id,
      name,
      document,
      birth_date,
      gender,
      phone,
      email,
      address,
      emergency_contact,
      emergency_phone,
      blood_type,
      allergies,
      medical_history,
      sus_card,
      status,
    ]
  );
  await logAction({
    userId: user?.id,
    action: "CREATE",
    tableName: "patients",
    recordId: res.insertId,
    newValues: data,
  });
  return { id: res.insertId };
}

async function get(id) {
  const [[row]] = await pool.query(`SELECT * FROM patients WHERE id=?`, [id]);
  return row;
}

async function update(id, data, user) {
  const fields = [],
    params = [];
  for (const k of [
    "municipality_id",
    "name",
    "document",
    "birth_date",
    "gender",
    "phone",
    "email",
    "address",
    "emergency_contact",
    "emergency_phone",
    "blood_type",
    "allergies",
    "medical_history",
    "sus_card",
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
    `UPDATE patients SET ${fields.join(", ")} WHERE id=?`,
    params
  );
  await logAction({
    userId: user?.id,
    action: "UPDATE",
    tableName: "patients",
    recordId: id,
    oldValues: before,
    newValues: data,
  });
  return !!r.affectedRows;
}

async function softDelete(id, user) {
  const before = await get(id);
  const [r] = await pool.query(
    `UPDATE patients SET status='inactive' WHERE id=?`,
    [id]
  );
  await logAction({
    userId: user?.id,
    action: "DELETE",
    tableName: "patients",
    recordId: id,
    oldValues: before,
    newValues: { status: "inactive" },
  });
  return !!r.affectedRows;
}

module.exports = { list, create, get, update, softDelete };
