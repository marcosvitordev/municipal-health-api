const pool = require('../database/db');
const { genRequestNumber } = require('../utils/id');
const { logAction } = require('./auditService');
const { notify } = require('./notificationService');

// async function createRequest(data, user) {
//   const { municipality_id, institute_id=null, patient_id, service_type, specialty, priority='medium', description, clinical_data=null, requested_date } = data;

//   const request_number = genRequestNumber();
//   const [res] = await pool.query(
//     `INSERT INTO requests (municipality_id, institute_id, patient_id, request_number, service_type, specialty, priority, description, clinical_data, requested_date, status)
//      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
//     [municipality_id, institute_id, patient_id, request_number, service_type, specialty, priority, description, clinical_data, requested_date]
//   );

//   await logAction({ userId: user?.id, action: 'CREATE', tableName: 'requests', recordId: res.insertId, newValues: { ...data, request_number } });

//   // notifica diretores do instituto (role=institute, institute_id)
//   if (institute_id) {
//     const [instUsers] = await pool.query(`SELECT id FROM users WHERE role='institute' AND institute_id=? AND status='active'`, [institute_id]);
//     for (const u of instUsers) {
//       await notify({ user_id: u.id, title: 'Nova solicitação', message: `Solicitação ${request_number} recebida.` });
//     }
//   }
//   return { id: res.insertId, request_number };
// }
async function createRequest(data, user) {
  // Adicionamos professional_id à desestruturação
  const { municipality_id, institute_id = null, patient_id, professional_id = null, service_type, specialty, priority = 'medium', description, clinical_data = null, requested_date } = data;

  const request_number = genRequestNumber();
  const [res] = await pool.query(
    // Adicionamos professional_id ao INSERT
    `INSERT INTO requests (municipality_id, institute_id, patient_id, professional_id, request_number, service_type, specialty, priority, description, clinical_data, requested_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    // Adicionamos professional_id aos parâmetros
    [municipality_id, institute_id, patient_id, professional_id, request_number, service_type, specialty, priority, description, clinical_data, requested_date]
  );

  await logAction({ userId: user?.id, action: 'CREATE', tableName: 'requests', recordId: res.insertId, newValues: { ...data, request_number } });

  // notifica diretores do instituto (role=institute, institute_id)
  if (institute_id) {
    const [instUsers] = await pool.query(`SELECT id FROM users WHERE role='institute' AND institute_id=? AND status='active'`, [institute_id]);
    for (const u of instUsers) {
      await notify({ user_id: u.id, title: 'Nova solicitação', message: `Solicitação ${request_number} recebida.` });
    }
  }
  return { id: res.insertId, request_number };
}

async function list(filter, user) {
  const where = [], params = [];
  if (user.role === 'municipality' && user.municipality_id) { where.push('municipality_id=?'); params.push(user.municipality_id); }
  if (user.role === 'institute' && user.institute_id) { where.push('institute_id=?'); params.push(user.institute_id); }
  if (user.role === 'professional') { where.push('professional_id=?'); params.push(user.id); }
  if (filter.status) { where.push('status=?'); params.push(filter.status); }
  if (filter.request_number) { where.push('request_number=?'); params.push(filter.request_number); }

  const [rows] = await pool.query(`SELECT * FROM requests ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 200`, params);
  return rows;
}

async function get(id) {
  const [[row]] = await pool.query(`SELECT * FROM requests WHERE id=?`, [id]);
  return row;
}

async function assignProfessional(requestId, professional_id, user) {
  const old = await get(requestId);
  if (!old) throw Object.assign(new Error('Solicitação não encontrada'), { status: 404 });

  await pool.query(`UPDATE requests SET professional_id=?, status='assigned' WHERE id=?`, [professional_id, requestId]);
  await logAction({ userId: user?.id, action: 'ASSIGN', tableName: 'requests', recordId: requestId, oldValues: old, newValues: { professional_id, status: 'assigned' } });

  // notificar profissional
  const [[profUser]] = await pool.query(`SELECT user_id FROM professionals WHERE id = ?`, [professional_id]);
  if (profUser && profUser.user_id) {
    await notify({ user_id: profUser.user_id, title: 'Nova atribuição', message: `Você foi atribuído à solicitação ${old.request_number}.` });
  }
  return true;
}

async function schedule(requestId, scheduled_date, user) {
  const old = await get(requestId);
  if (!old) throw Object.assign(new Error('Solicitação não encontrada'), { status: 404 });

  await pool.query(`UPDATE requests SET scheduled_date=?, status='scheduled' WHERE id=?`, [scheduled_date, requestId]);
  await logAction({ userId: user?.id, action: 'SCHEDULE', tableName: 'requests', recordId: requestId, oldValues: old, newValues: { scheduled_date, status: 'scheduled' } });

  // notificar município
  const [munUsers] = await pool.query(`SELECT id FROM users WHERE role='municipality' AND municipality_id=? AND status='active'`, [old.municipality_id]);
  for (const u of munUsers) {
    await notify({ user_id: u.id, title: 'Atendimento agendado', message: `Solicitação ${old.request_number} agendada para ${scheduled_date}.` });
  }
  return true;
}

async function updateStatus(requestId, status, reason, user) {
  const allowed = ['pending', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected'];
  if (!allowed.includes(status)) throw Object.assign(new Error('Status inválido'), { status: 400 });

  const old = await get(requestId);
  if (!old) throw Object.assign(new Error('Solicitação não encontrada'), { status: 404 });

  await pool.query(`UPDATE requests SET status=?, rejection_reason=?, completed_date = IF(?='completed', NOW(), completed_date) WHERE id=?`, [status, reason || null, status, requestId]);
  await logAction({ userId: user?.id, action: 'STATUS', tableName: 'requests', recordId: requestId, oldValues: old, newValues: { status, reason } });

  return true;
}

module.exports = { createRequest, list, get, assignProfessional, schedule, updateStatus };
