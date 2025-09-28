const r = require('express').Router();
const a = require('../middlewares/authMiddleware');
const role = require('../middlewares/rbacMiddleware');
const ctl = require('../controllers/backupController');

// Inicia um backup manual
r.post('/backup/start', a, role(['admin']), ctl.startManualBackup);

// Lista o histórico de backups
r.get('/backups', a, role(['admin']), ctl.listBackupHistory);

// Faz o download de um arquivo de backup
r.get('/backup/download/:filename', a, role(['admin']), ctl.downloadBackup);

module.exports = r;