const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { logAction } = require('./auditService');
const pool = require('../database/db');
require('dotenv').config();

// Garante que o diretório de backups exista
const backupDir = path.join(__dirname, '..', '..', 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Executa o mysqldump para criar um backup real do banco de dados.
 */
async function createBackup(user) {
    return new Promise((resolve, reject) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filepath = path.join(backupDir, filename);

        // Pega as credenciais do ambiente
        const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;

        // Comando para executar o mysqldump
        const command = `mysqldump --user=${DB_USER} --password=${DB_PASSWORD} --host=${DB_HOST} ${DB_NAME} > "${filepath}"`;

        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao executar mysqldump: ${error.message}`);
                return reject(new Error('Falha ao criar o backup do banco de dados.'));
            }
            if (stderr) {
                console.warn(`mysqldump stderr: ${stderr}`);
            }

            // Log da ação bem-sucedida
            const stats = fs.statSync(filepath);
            const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

            const backupDetails = {
                status: "Concluído",
                type: "Manual",
                filename: filename,
                size: `${fileSizeInMB} MB`,
            };

            await logAction({
                userId: user?.id,
                action: 'BACKUP_MANUAL',
                tableName: 'system',
                recordId: null,
                newValues: backupDetails,
            });

            resolve({ message: "Backup concluído com sucesso!", filename });
        });
    });
}

/**
 * Busca o histórico de backups no log de auditoria.
 */
async function getBackupHistory() {
    const [rows] = await pool.query(
        `SELECT * FROM audit_logs 
     WHERE action LIKE 'BACKUP_%'
     ORDER BY created_at DESC 
     LIMIT 50`
    );
    return rows;
}

module.exports = { createBackup, getBackupHistory };