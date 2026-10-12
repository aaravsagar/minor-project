import express from 'express';
import cors from 'cors';
import requirementRoutes from './routes/requirementRoutes.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/requirements', requirementRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'need-connect-api', timestamp: new Date().toISOString() });
});

// Generic 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

export default app;
