const pool = require('../database/db');
const { logAction } = require('./auditService');

async function list({ limit=200, offset=0 }) {
  const [rows] = await pool.query(`SELECT * FROM municipalities ORDER BY name LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]);
  return rows;
}
async function create(data, user) {
  const { name, code, state, population, mayor, health_secretary, contact_email, contact_phone, address, status='active' } = data;
  const [res] = await pool.query(
    `INSERT INTO municipalities (name, code, state, population, mayor, health_secretary, contact_email, contact_phone, address, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, code, state, population||null, mayor||null, health_secretary||null, contact_email||null, contact_phone||null, address||null, status]
  );
  await logAction({ userId: user?.id, action: 'CREATE', tableName: 'municipalities', recordId: res.insertId, newValues: data });
  return { id: res.insertId };
}
async function get(id){ const [[row]] = await pool.query(`SELECT * FROM municipalities WHERE id = ?`, [id]); return row; }
async function update(id, data, user) {
  const fields=[],params=[];
  for (const k of ['name','code','state','population','mayor','health_secretary','contact_email','contact_phone','address','status'])
    if (data[k]!==undefined){ fields.push(`${k}=?`); params.push(data[k]); }
  if(!fields.length) return false;
  const before = await get(id);
  params.push(id);
  const [r]=await pool.query(`UPDATE municipalities SET ${fields.join(', ')} WHERE id=?`, params);
  await logAction({ userId: user?.id, action: 'UPDATE', tableName: 'municipalities', recordId: id, oldValues: before, newValues: data });
  return !!r.affectedRows;
}
async function softDelete(id, user){ const before=await get(id); const [r]=await pool.query(`UPDATE municipalities SET status='inactive' WHERE id=?`,[id]); await logAction({userId:user?.id,action:'DELETE',tableName:'municipalities',recordId:id,oldValues:before,newValues:{status:'inactive'}}); return !!r.affectedRows; }

module.exports = { list, create, get, update, softDelete };
