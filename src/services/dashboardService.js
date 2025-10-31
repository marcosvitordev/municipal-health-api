// src/services/dashboardService.js
const pool = require("../database/db");

/**
 * Agrega dados para o dashboard de um município específico.
 * @param {number} municipalityId - O ID do município.
 */
async function getMunicipalityDashboardData(municipalityId) {
  if (!municipalityId) {
    throw new Error("ID do município não fornecido.");
  }

  // 1. Buscar Estatísticas do Município
  const [[stats]] = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM patients WHERE municipality_id = ?) as totalPatients,
      (SELECT COUNT(*) FROM requests WHERE municipality_id = ?) as totalRequests,
      (SELECT COUNT(*) FROM requests WHERE municipality_id = ? AND status IN ('pending', 'assigned', 'scheduled', 'in_progress')) as pendingRequests,
      (SELECT COUNT(*) FROM requests WHERE municipality_id = ? AND status IN ('completed', 'cancelled', 'rejected')) as completedRequests
    `,
    [municipalityId, municipalityId, municipalityId, municipalityId]
  );

  // 2. Buscar Solicitações Recentes (últimas 5)
  const [recentRequests] = await pool.query(
    `SELECT 
        r.id, 
        r.service_type as type, 
        p.name as patientName, 
        r.specialty, 
        i.name as instituteName, 
        r.created_at as time, 
        r.priority, 
        r.status,
        r.cost
     FROM requests r
     JOIN patients p ON r.patient_id = p.id
     LEFT JOIN institutes i ON r.institute_id = i.id
     WHERE r.municipality_id = ?
     ORDER BY r.created_at DESC
     LIMIT 5`,
    [municipalityId]
  );

  return {
    stats,
    recentRequests,
  };
}

module.exports = { getMunicipalityDashboardData };
