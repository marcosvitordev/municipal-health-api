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

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

app.get('/health', (_req,res)=>res.json({ok:true}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/municipalities', municipalityRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API ON :${PORT}`));
