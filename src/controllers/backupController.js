const path = require('path');
const backupService = require('../services/backupService');

async function startManualBackup(req, res, next) {
  try {
    const userInfo = { id: req.user.id };
    // Não esperamos o fim do backup aqui, pois pode demorar.
    // O frontend pode pesquisar o histórico para ver o resultado.
    backupService.createBackup(userInfo)
      .then(result => console.log(`Backup ${result.filename} criado com sucesso.`))
      .catch(err => console.error(`Falha no processo de backup em background:`, err));

    res.status(202).json({ message: "Processo de backup iniciado em segundo plano. Verifique o histórico para o resultado." });
  } catch (e) {
    next(e);
  }
}

async function listBackupHistory(req, res, next) {
  try {
    const history = await backupService.getBackupHistory();
    res.json(history);
  } catch (e) {
    next(e);
  }
}

// Nova função para download
async function downloadBackup(req, res, next) {
    try {
        const { filename } = req.params;
        // Medida de segurança básica para evitar directory traversal
        if (filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: "Nome de arquivo inválido." });
        }
        
        const backupDir = path.join(__dirname, '..', '..', 'backups');
        const filePath = path.join(backupDir, filename);

        res.download(filePath, (err) => {
            if (err) {
                console.error("Erro no download do backup:", err);
                if (!res.headersSent) {
                    return res.status(404).json({ error: "Arquivo de backup não encontrado." });
                }
            }
        });
    } catch (e) {
        next(e);
    }
}

module.exports = { startManualBackup, listBackupHistory, downloadBackup };