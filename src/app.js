// require('dotenv').config();
// const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
// const rateLimit = require('express-rate-limit');
// const errorHandler = require('./middlewares/errorMiddleware');

// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const municipalityRoutes = require('./routes/municipalityRoutes');
// const instituteRoutes = require('./routes/instituteRoutes');
// const professionalRoutes = require('./routes/professionalRoutes');
// const patientRoutes = require('./routes/patientRoutes');
// const requestRoutes = require('./routes/requestRoutes');
// const documentRoutes = require('./routes/documentRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');

// const app = express();

// app.use(helmet());
// app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

// app.get('/health', (_req,res)=>res.json({ok:true}));

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/municipalities', municipalityRoutes);
// app.use('/api/institutes', instituteRoutes);
// app.use('/api/professionals', professionalRoutes);
// app.use('/api/patients', patientRoutes);
// app.use('/api/requests', requestRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/notifications', notificationRoutes);

// app.use(errorHandler);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`API ON :${PORT}`));


require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const municipalityRoutes = require('./routes/municipalityRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const professionalRoutes = require('./routes/professionalRoutes');
const patientRoutes = require('./routes/patientRoutes');
const requestRoutes = require('./routes/requestRoutes');
const documentRoutes = require('./routes/documentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Segurança básica
app.use(helmet());

// ==========================
// Configuração do CORS
// ==========================
const allowedOrigins = [
  "http://localhost:3000", // Frontend Next.js
  "http://localhost:3001",
  "https://www.institutocuidarmais.com", // Caso rode em outra porta
  process.env.CORS_ORIGIN // Domínio de produção (definido no .env)
].filter(Boolean); // remove valores undefined

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Configurações de body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (proteção contra ataques de força bruta)
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// Rota de health check
// app.get('/health', (_req, res) => res.json({ ok: true }));
// app.get('/api/health', (_req,res)=>res.json({ok:true}));

app.get('/api/health', async (_req, res) => {
  const os = require('os');
  const process = require('process');

  // Calcular uptime, carga e métricas simuladas
  const uptimeHours = (process.uptime() / 3600).toFixed(2);
  const responseTime = Math.floor(Math.random() * 100) + 100; // ms (simulado)
  const activeConnections = Math.floor(Math.random() * 1500) + 500; // simulado
  const loadAvg = os.loadavg()[0];
  const loadPercent = Math.min(100, (loadAvg / os.cpus().length) * 100).toFixed(0);

  res.json({
    status: "ok",
    uptime: `${uptimeHours}h`,
    responseTime: `${responseTime}ms`,
    activeConnections,
    loadPercent: `${loadPercent}%`
  });
});



// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/municipalities', municipalityRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', statsRoutes); // <-- Adicione esta linha
app.use('/api', settingsRoutes);
app.use('/api', dashboardRoutes);

// Middleware de erro centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`✅ API rodando na porta ${PORT}`));
app.listen(PORT, () => console.log(`API ON :${PORT}`));
