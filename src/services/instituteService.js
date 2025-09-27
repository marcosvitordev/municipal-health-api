// const pool = require('../database/db');
// const { logAction } = require('./auditService');

// async function list({ limit = 200, offset = 0 }) {
//     const [rows] = await pool.query(`SELECT * FROM institutes ORDER BY name LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]);
//     return rows;
// }
// async function create(data, user) {
//     const { name, code, type, specialties, director, contact_email, contact_phone, address, cnpj, license_number, status = 'active' } = data;
//     const [res] = await pool.query(
//         `INSERT INTO institutes (name, code, type, specialties, director, contact_email, contact_phone, address, cnpj, license_number, status)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [name, code, type, specialties ? JSON.stringify(specialties) : null, director || null, contact_email || null, contact_phone || null, address || null, cnpj || null, license_number || null, status]
//     );
//     await logAction({ userId: user?.id, action: 'CREATE', tableName: 'institutes', recordId: res.insertId, newValues: data });
//     return { id: res.insertId };
// }
// async function get(id) { const [[row]] = await pool.query(`SELECT * FROM institutes WHERE id=?`, [id]); if (row) { if (row.specialties) row.specialties = JSON.parse(row.specialties); } return row; }

// async function update(id, data, user) {
//     const fields = [], params = [];
//     for (const k of ['name', 'code', 'type', 'director', 'contact_email', 'contact_phone', 'address', 'cnpj', 'license_number', 'status'])
//         if (data[k] !== undefined) { fields.push(`${k}=?`); params.push(data[k]); }
//     if (data.specialties !== undefined) { fields.push('specialties=?'); params.push(JSON.stringify(data.specialties)); }
//     if (!fields.length) return false;
//     const before = await get(id);
//     params.push(id);
//     const [r] = await pool.query(`UPDATE institutes SET ${fields.join(', ')} WHERE id=?`, params);
//     await logAction({ userId: user?.id, action: 'UPDATE', tableName: 'institutes', recordId: id, oldValues: before, newValues: data });
//     return !!r.affectedRows;
// }
// async function softDelete(id, user) {
//     const before = await get(id);
//     const [r] = await pool.query(`UPDATE institutes SET status='inactive' WHERE id=?`, [id]);
//     await logAction({
//         userId: user?.id, action: 'DELETE', tableName: 'institutes', recordId: id, oldValues: before, newValues: {
//             status: 'inactive'
//         }
//     });
//     return !!r.affectedRows;
// }

// module.exports = { list, create, get, update, softDelete };

const pool = require('../database/db');
const { logAction } = require('./auditService');

async function list({ limit = 200, offset = 0 }) {
    const [rows] = await pool.query(`SELECT * FROM institutes ORDER BY name LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]);
    return rows;
}

async function create(data, user) {
    const { name, code, type, specialties, director, contact_email, contact_phone, address, cnpj, license_number, status = 'active' } = data;
    const [res] = await pool.query(
        `INSERT INTO institutes (name, code, type, specialties, director, contact_email, contact_phone, address, cnpj, license_number, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, code, type, specialties ? JSON.stringify(specialties) : null, director || null, contact_email || null, contact_phone || null, address || null, cnpj || null, license_number || null, status]
    );
    await logAction({ userId: user?.id, action: 'CREATE', tableName: 'institutes', recordId: res.insertId, newValues: data });
    return { id: res.insertId };
}

// ========= INÍCIO DA CORREÇÃO =========
async function get(id) {
  const [[row]] = await pool.query(`SELECT * FROM institutes WHERE id=?`, [id]);
  // Verifica se a linha existe e se `specialties` é uma string antes de tentar o parse
  if (row && row.specialties && typeof row.specialties === 'string') {
    try {
      // Tenta fazer o parse do JSON
      row.specialties = JSON.parse(row.specialties);
    } catch (e) {
      // Se falhar (ex: é uma string simples), trata a string como um único item em um array
      console.error(`[AVISO] Falha ao parsear 'specialties' para o instituto ID ${id}. Conteúdo: "${row.specialties}". Tratando como array de item único.`);
      row.specialties = [row.specialties];
    }
  }
  return row;
}
// ========= FIM DA CORREÇÃO =========

async function update(id, data, user) {
    const fields = [], params = [];
    for (const k of ['name', 'code', 'type', 'director', 'contact_email', 'contact_phone', 'address', 'cnpj', 'license_number', 'status'])
        if (data[k] !== undefined) { fields.push(`${k}=?`); params.push(data[k]); }
    
    if (data.specialties !== undefined) {
        // Garante que as especialidades sejam sempre stringificadas como um array JSON
        const specialtiesAsJson = Array.isArray(data.specialties) ? JSON.stringify(data.specialties) : JSON.stringify([data.specialties]);
        fields.push('specialties=?');
        params.push(specialtiesAsJson);
    }

    if (!fields.length) return false;
    
    const before = await get(id); // Agora esta chamada é segura
    params.push(id);
    const [r] = await pool.query(`UPDATE institutes SET ${fields.join(', ')} WHERE id=?`, params);
    await logAction({ userId: user?.id, action: 'UPDATE', tableName: 'institutes', recordId: id, oldValues: before, newValues: data });
    return !!r.affectedRows;
}

async function softDelete(id, user) {
    const before = await get(id); // Agora esta chamada é segura
    const [r] = await pool.query(`UPDATE institutes SET status='inactive' WHERE id=?`, [id]);
    await logAction({
        userId: user?.id, action: 'DELETE', tableName: 'institutes', recordId: id, oldValues: before, newValues: {
            status: 'inactive'
        }
    });
    return !!r.affectedRows;
}

module.exports = { list, create, get, update, softDelete };