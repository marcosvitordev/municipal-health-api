const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});
const pool = require("../database/db");
const { uploadBuffer, presignGet } = require("../services/storageService");
const { logAction } = require("../services/auditService");

async function uploadDoc(req, res, next) {
  try {
    const f = req.file;
    if (!f)
      return res
        .status(400)
        .json({ error: 'Arquivo obrigatório (campo "file")' });
    const { request_id, type, name, description } = req.body;
    const key = `docs/${request_id}/${Date.now()}_${f.originalname}`;
    await uploadBuffer(key, f.buffer, f.mimetype);
    const [r] = await pool.query(
      `INSERT INTO documents (request_id, type, name, file_path, file_size, mime_type, uploaded_by, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request_id,
        type,
        name || f.originalname,
        key,
        f.size,
        f.mimetype,
        req.user.id,
        description || null,
      ]
    );
    await logAction({
      userId: req.user.id,
      action: "UPLOAD",
      tableName: "documents",
      recordId: r.insertId,
      newValues: { request_id, type, name },
    });
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    next(e);
  }
}

async function getUrl(req, res, next) {
  try {
    const { id } = req.params;
    const [[doc]] = await pool.query(`SELECT * FROM documents WHERE id = ?`, [
      id,
    ]);
    if (!doc)
      return res.status(404).json({ error: "Documento não encontrado" });
    const url = await presignGet(doc.file_path, 300);
    res.json({ url, name: doc.name, mime_type: doc.mime_type });
  } catch (e) {
    next(e);
  }
}

module.exports = { uploadMiddleware: upload.single("file"), uploadDoc, getUrl };
