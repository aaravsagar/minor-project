import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import requirementRoutes from './routes/requirementRoutes.js';

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Explicit CORS configuration for Vercel frontend ↔ Render backend communication
const ALLOWED_ORIGINS = [
  'https://minor-project-rf8c.onrender.com',  // Render self
  /^https:\/\/.*\.vercel\.app$/,              // Any Vercel deployment (preview + production)
  /^http:\/\/localhost:\d+$/,                 // Local dev (any port)
  /^http:\/\/127\.0\.0\.1:\d+$/              // Local dev
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some(pattern =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    );
    if (allowed) return callback(null, true);
    callback(new Error(`CORS policy: origin "${origin}" is not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-role'],
  credentials: true,
  optionsSuccessStatus: 200  // IE11 compatibility
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api/requirements', requirementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'need-connect-api',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Serve frontend static build if dist folder exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Generic 404 handler for unmatched API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.path}`
  });
});

// Global error handler — catches unhandled errors and returns clean JSON
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message || err);
  if (err.message?.startsWith('CORS policy')) {
    return res.status(403).json({ success: false, message: err.message });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;
