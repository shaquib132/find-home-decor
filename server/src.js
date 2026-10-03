import 'dotenv/config'; // must be first so env vars exist before anything reads them
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import leadRoutes from './routes/leads.js';
import pitchRoutes from './routes/pitches.js';
import { usingDb } from './store.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('JWT_SECRET must be set in production. Exiting.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

if (usingDb()) {
  mongoose
    .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log('MongoDB connected'))
    .catch((e) => console.error('MongoDB connection failed:', e.message));
} else {
  console.log('No MONGODB_URI set: running in Demo Mode with in-memory storage (data resets on restart).');
}

app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    storage: usingDb() ? (mongoose.connection.readyState === 1 ? 'mongodb' : 'mongodb (not connected)') : 'memory',
    gemini: Boolean(process.env.GEMINI_API_KEY),
    resend: Boolean(process.env.RESEND_API_KEY)
  })
);

// Public settings the client needs (nothing secret).
app.get('/api/config', (req, res) =>
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    gemini: Boolean(process.env.GEMINI_API_KEY),
    resend: Boolean(process.env.RESEND_API_KEY)
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/pitches', pitchRoutes);

// Serve the built React app in production.
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// Express 5 forwards errors from async handlers here.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({ message: status < 500 ? err.message : 'Something went wrong. Please try again.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`API running on ${PORT}`));
