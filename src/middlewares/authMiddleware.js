const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const hdr = req.headers["authorization"];
  const token = hdr && hdr.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token ausente" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = payload; // { id, role, municipality_id?, institute_id? }
    next();
  } catch {
    return res.status(403).json({ error: "Token inválido" });
  }
}
module.exports = authenticate;
